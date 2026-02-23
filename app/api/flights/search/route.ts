import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCityCode } from '@/lib/data/airport-helpers';
import { duffelAPI } from '@/lib/api/duffel';
import {
  calculateFlightScore,
  getFlightBadges,
  sortFlights,
  type FlightOffer,
  type ScoredFlight
} from '@/lib/flights/scoring';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';
import { generateFlightSearchKey } from '@/lib/cache/keys';

// ML-powered cost optimization imports
import { smartCachePredictor } from '@/lib/ml/cache-predictor';
import { smartAPISelector } from '@/lib/ml/api-selector';
import { routeProfiler } from '@/lib/ml/route-profiler';
import type { RouteSearchLog } from '@/lib/ml/types';
import { requestDeduplicator } from '@/lib/api/request-deduplicator';

// Zero-cost calendar system imports
import { calculateOptimalTTL } from '@/lib/cache/seasonal-ttl';
import { logFlightSearch, updateCacheCoverage, getRouteStatistics } from '@/lib/analytics/search-logger';

// Cache analytics tracking - tracks cache hits/misses for cost savings monitoring
import { trackCacheHit, trackCacheMiss } from '@/lib/cache/analytics';

// Rate limiting - protects against API abuse and cost spikes
import { rateLimit, createRateLimitResponse, addRateLimitHeaders, RateLimitPresets } from '@/lib/security/rate-limiter';

// Global error handling - catches all errors and alerts admins
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { alertApiError } from '@/lib/monitoring/customer-error-alerts';

// Cost protection - blocks bots and suspicious requests BEFORE expensive API calls
import { checkCostGuard, refundCostBudget, COST_GUARDS } from '@/lib/security/cost-protection';

// Mixed-carrier "Hacker Fare" system imports
import {
  combineMixedCarrierFares,
  mixedFareToFlightOffer,
  rankMixedFares,
  type MixedCarrierFare,
} from '@/lib/flights/mixed-carrier-combiner';
import { normalizePrice, type FlightOffer as TypedFlightOffer } from '@/lib/flights/types';

// Smart Mixed-Carrier System - Zero-cost heuristic + unified cheapest-first sorting
import {
  smartMixedCarrierSearch,
  mergeAndSortByPrice,
  addCheapestBadges,
  type SmartMixedCarrierResult,
  type OneWaySearchFunction,
} from '@/lib/flights/smart-mixed-carrier';

// Hybrid Routing Engine - Consolidator vs Duffel optimization
import {
  getRoutingEngine,
  duffelOfferToSegments,
  extractDuffelBaseFare,
  type EnrichedFlightOffer,
  type FlightSegment as RoutingFlightSegment,
} from '@/lib/routing';
import { applyFlightMarkup } from '@/lib/config/flight-markup';
import type { CabinClass, RoutingChannel } from '@prisma/client';

// Migrated Search Logic Helpers
import {
  generateFlexibleDateRange,
  calculateReturnDate,
  deduplicateFlights,
  flightOfferToRoutingSegments,
  extractBaseFare,
  extractNetFare,
  enrichFlightsWithRouting,
  getRoutingSummary,
  groupDuffelFareVariants,
  applyMarkupToFlights,
  type FlightRoutingInfo,
  type ScoredFlightWithRouting
} from '@/lib/flights/search-logic';

// Modularized Search Components
import { validateSearchParams } from '@/lib/flights/search-validation';
import { searchOrchestrator } from '@/lib/flights/search-orchestrator';
import { searchEnricher } from '@/lib/flights/search-enricher';

/**
 * POST /api/flights/search
 * Search for flights with AI scoring and persuasion badges
 */
export async function POST(request: NextRequest) {
  // Declare variables outside try-catch so they're accessible in error handling
  let cacheKey: string = '';
  let flightSearchParams: any = null;
  let rateLimitResult: any = null;

  try {
    // 🛡️ COST PROTECTION: Block bots and suspicious requests BEFORE expensive API calls
    const costGuard = await checkCostGuard(request, COST_GUARDS.FLIGHT_SEARCH);
    if (!costGuard.allowed && costGuard.response) {
      return costGuard.response;
    }

    // 🛡️ Rate limiting - 60 requests per minute per IP (STANDARD preset)
    rateLimitResult = await rateLimit(request, RateLimitPresets.STANDARD);
    if (!rateLimitResult.allowed) {
      console.warn(`🚨 Rate limit exceeded for flight search: ${request.headers.get('x-forwarded-for') || 'unknown IP'}`);
      return createRateLimitResponse(rateLimitResult, 'Too many flight searches. Please wait a moment before searching again.');
    }

    const body = await request.json();

    // 1. Validate Parameters
    const validation = validateSearchParams(body);
    if (!validation.isValid) {
      return validation.response;
    }

    const {
      originCodes,
      destinationCodes,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
    } = validation as any;

    // Build base search parameters for logging/caching
    flightSearchParams = {
      origin: originCodes.join(','),
      destination: destinationCodes.join(','),
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
      nonStop: body.nonStop || undefined,
      currencyCode: body.currencyCode || 'USD',
    };

    const departureDates = [departureDate];
    const returnDates = returnDate ? [returnDate] : [];

    // Define one-way search function for mixed-carrier searches
    const oneWaySearchFunction: OneWaySearchFunction = async (params) => {
      const result = await amadeusAPI.searchFlights({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.date, // Map 'date' from OneWaySearchFunction to 'departureDate' for Amadeus
        adults: flightSearchParams.adults,
        children: flightSearchParams.children,
        infants: flightSearchParams.infants,
        currencyCode: flightSearchParams.currencyCode,
        travelClass: flightSearchParams.travelClass,
        nonStop: params.nonStop,
        max: params.maxResults,
      });
      return { flights: result.data || [], dictionaries: result.dictionaries || {} };
    };

    // 2. Cache Check
    cacheKey = generateFlightSearchKey({
      ...flightSearchParams,
      includeSeparateTickets: !!body.includeSeparateTickets,
    });

    const bypassCache = body.noCache === true || body.forceRefresh === true;
    const cached = !bypassCache ? await getCached<any>(cacheKey) : null;
    if (cached) {
      console.log('⚡ Cache HIT:', cacheKey);
      trackCacheHit('flight-search', 'search', cacheKey).catch(() => {});
      
      const successResponse = NextResponse.json(cached, {
        status: 200,
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=1800'
        }
      });
      if (rateLimitResult) return addRateLimitHeaders(successResponse, rateLimitResult);
      return successResponse;
    }

    trackCacheMiss('flight-search', 'search', cacheKey).catch(() => {});

    // 3. Search Orchestration
    console.log(`🔍 Searching: ${originCodes.join(',')} → ${destinationCodes.join(',')} (${departureDate})`);
    const { flights: rawFlights, dictionaries } = await searchOrchestrator.search(
      { originCodes, destinationCodes, departureDates, returnDates, travelClass, body },
      { includeSeparateTickets: !!body.includeSeparateTickets, oneWaySearchFunction }
    );

    if (!rawFlights || rawFlights.length === 0) {
      // 🚨 Alert when search returns zero results so we can monitor and debug
      console.warn(`⚠️ Zero flights found for ${originCodes.join(',')} → ${destinationCodes.join(',')} on ${departureDate}`);
      
      alertApiError(request, new Error(`Zero flights found for search: ${originCodes.join(',')} → ${destinationCodes.join(',')}`), {
        errorCode: 'FLIGHT_SEARCH_NO_RESULTS',
        endpoint: '/api/flights/search',
        flightRoute: `${flightSearchParams.origin} → ${flightSearchParams.destination}`,
        departureDate: flightSearchParams?.departureDate,
      }, { priority: 'normal' }).catch(() => { });

      const emptyResponse = {
        flights: [],
        metadata: {
          total: 0,
          searchParams: flightSearchParams,
          message: 'No flights found for the given criteria',
          cached: false,
          cacheKey,
        }
      };
      await setCache(cacheKey, emptyResponse, 300);
      return NextResponse.json(emptyResponse, { status: 200 });
    }

    // 4. Results Enrichment
    const searchSessionId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { flights: customerFlights, routingSummary } = await searchEnricher.enrich(
      rawFlights,
      body.sortBy,
      searchSessionId
    );

    // 5. ML & Analytics
    const cachePrediction = await smartCachePredictor.predictOptimalTTL(
      originCodes[0],
      destinationCodes[0],
      travelClass || 'ECONOMY',
      departureDate
    );

    const response = {
      flights: customerFlights,
      metadata: {
        total: customerFlights.length,
        searchParams: flightSearchParams,
        dictionaries,
        timestamp: new Date().toISOString(),
        cached: false,
        cacheKey,
        ml: {
          cacheTTL: cachePrediction.recommendedTTL,
          cacheConfidence: cachePrediction.confidence,
          cacheReason: cachePrediction.reason,
        },
        _routingSessionId: searchSessionId,
      }
    };

    // Cache results
    const cacheTTLSeconds = cachePrediction.recommendedTTL * 60;
    await setCache(cacheKey, response, cacheTTLSeconds);

    // 📊 Background Logging (Non-blocking)
    (async () => {
      try {
        const lowestPrice = customerFlights.length > 0 ? parseFloat(String(customerFlights[0].price?.total || '0')) : 0;
        logFlightSearch({
          origin: originCodes[0],
          destination: destinationCodes[0],
          departureDate,
          returnDate: body.returnDate,
          adults: adults || 1,
          resultsCount: customerFlights.length,
          lowestPrice: lowestPrice > 0 ? Math.round(lowestPrice * 100) : undefined,
          currency: body.currencyCode || 'USD',
          cacheHit: false,
        }, request).catch(() => {});
      } catch (e) {}
    })();

    const successResponse = NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': `public, max-age=${cacheTTLSeconds}`,
        'X-Cache-Status': 'MISS',
        'X-ML-Cache-TTL': `${cachePrediction.recommendedTTL}min`,
      }
    });

    if (rateLimitResult) {
      return addRateLimitHeaders(successResponse, rateLimitResult);
    }
    return successResponse;

  } catch (error: any) {
    console.error('Flight search error:', error);

    // Handle specific error cases based on status code
    const errorResponse = error.response?.data;
    const statusCode = error.response?.status;

    // 404 - No flights found (return empty results instead of error)
    const isNotFound = statusCode === 404 ||
      errorResponse?.errors?.some((e: any) =>
        e.code === 1797 ||
        e.code === 6003 ||
        e.title === 'NOT FOUND'
      );

    if (isNotFound) {
      const emptyResponse = {
        flights: [],
        metadata: {
          total: 0,
          searchParams: flightSearchParams,
          message: `No flights found for the given search criteria. Try different dates or routes.`,
          cached: false,
          cacheKey,
        }
      };

      // Cache empty result briefly (5 minutes)
      if (cacheKey) {
        await setCache(cacheKey, emptyResponse, 300);
      }

      return NextResponse.json(emptyResponse, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300',
          'X-Cache-Status': 'MISS',
        }
      });
    }

    // 400 - Bad request (validation errors from API)
    if (statusCode === 400) {
      return NextResponse.json(
        {
          error: 'Invalid search parameters',
          details: errorResponse?.errors || error.message,
          searchParams: flightSearchParams
        },
        { status: 400 }
      );
    }

    // 401/403 - Authentication/Authorization errors
    if (statusCode === 401 || statusCode === 403 || error.message?.includes('authenticate')) {
      return NextResponse.json(
        { error: 'Authentication failed with flight search provider' },
        { status: 503 }
      );
    }

    // 429 - Rate limit exceeded
    if (statusCode === 429) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again in a few moments.',
          retryAfter: error.response?.headers?.['retry-after'] || '60'
        },
        { status: 429 }
      );
    }

    // 405 - Method Not Allowed (shouldn't happen, but log it)
    if (statusCode === 405) {
      console.error('❌ 405 Method Not Allowed - This should not happen!');
      console.error('Error details:', errorResponse);

      return NextResponse.json(
        {
          error: 'Method not allowed',
          message: 'The search method is not supported. Please try again.',
          debug: process.env.NODE_ENV === 'development' ? errorResponse : undefined
        },
        { status: 405 }
      );
    }

    // 504 - Timeout
    if (error.message?.includes('timeout') || statusCode === 504) {
      return NextResponse.json(
        { error: 'Flight search request timed out. Please try again.' },
        { status: 504 }
      );
    }

    // 500+ - Server errors - Alert admins
    if (statusCode >= 500) {
      await alertApiError(request, error, {
        errorCode: 'FLIGHT_SEARCH_SERVER_ERROR',
        endpoint: '/api/flights/search',
        flightRoute: flightSearchParams ? `${flightSearchParams.origin} → ${flightSearchParams.destination}` : 'unknown',
        departureDate: flightSearchParams?.departureDate,
      }, { priority: 'high' }).catch(() => { });

      return NextResponse.json(
        {
          error: 'Flight search service temporarily unavailable',
          message: 'Please try again in a few moments.'
        },
        { status: 503 }
      );
    }

    // Default error handler - Alert admins for unexpected errors
    await alertApiError(request, error, {
      errorCode: 'FLIGHT_SEARCH_UNKNOWN_ERROR',
      endpoint: '/api/flights/search',
      flightRoute: flightSearchParams ? `${flightSearchParams.origin} → ${flightSearchParams.destination}` : 'unknown',
      departureDate: flightSearchParams?.departureDate,
    }, { priority: 'normal' }).catch(() => { });

    return NextResponse.json(
      {
        error: error.message || 'Failed to search flights',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/flights/search (backward compatibility)
 * Legacy endpoint - redirects to POST
 */
export async function GET(request: NextRequest) {
  try {
    // COST PROTECTION: Block bots and suspicious requests BEFORE expensive API calls
    const costGuard = await checkCostGuard(request, COST_GUARDS.FLIGHT_SEARCH);
    if (!costGuard.allowed && costGuard.response) {
      return costGuard.response;
    }

    const searchParams = request.nextUrl.searchParams;

    // Validate required parameters
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    const adults = searchParams.get('adults');

    if (!origin || !destination || !departureDate || !adults) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin, destination, departureDate, adults' },
        { status: 400 }
      );
    }

    // Map travelClass to Amadeus API format (uppercase)
    const travelClassMap: Record<string, 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'> = {
      'economy': 'ECONOMY',
      'premium': 'PREMIUM_ECONOMY',
      'premium_economy': 'PREMIUM_ECONOMY',
      'business': 'BUSINESS',
      'first': 'FIRST',
    };

    const travelClassParam = searchParams.get('travelClass');
    const travelClass = travelClassParam ? travelClassMap[travelClassParam.toLowerCase()] : undefined;

    // Build search parameters
    const flightSearchParams = {
      origin,
      destination,
      departureDate,
      returnDate: searchParams.get('returnDate') || undefined,
      adults: parseInt(adults),
      children: searchParams.get('children') ? parseInt(searchParams.get('children')!) : undefined,
      infants: searchParams.get('infants') ? parseInt(searchParams.get('infants')!) : undefined,
      travelClass: travelClass || undefined,
      nonStop: searchParams.get('nonStop') === 'true' ? true : undefined,
      currencyCode: searchParams.get('currency') || 'USD',
      max: searchParams.get('max') ? parseInt(searchParams.get('max')!) : 50,
      sortBy: searchParams.get('sortBy') || 'best'
    };

    // Create a new request object for POST handler
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(flightSearchParams)
    });

    // Call POST handler
    return POST(postRequest);
  } catch (error: any) {
    console.error('Flight search error:', error);

    // Alert admins for GET endpoint errors
    await alertApiError(request, error, {
      errorCode: 'FLIGHT_SEARCH_GET_ERROR',
      endpoint: '/api/flights/search (GET)',
    }, { priority: 'normal' }).catch(() => { });

    return NextResponse.json(
      { error: error.message || 'Failed to search flights' },
      { status: 500 }
    );
  }
}

// Use Node.js runtime for Amadeus API (edge runtime has env var restrictions)
export const runtime = 'nodejs';

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
