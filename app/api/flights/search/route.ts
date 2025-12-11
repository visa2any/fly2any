import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
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
import type { CabinClass, RoutingChannel } from '@prisma/client';

// Flight Markup System - Apply markup to all flights for revenue
import { applyFlightMarkup, FLIGHT_MARKUP, determineRoutingChannel } from '@/lib/config/flight-markup';

// Routing info added to each flight
interface FlightRoutingInfo {
  channel: RoutingChannel;
  estimatedProfit: number;
  commissionPct: number;
  commissionAmount: number;
  isExcluded: boolean;
  exclusionReason?: string;
  decisionReason: string;
}

// Extended scored flight with routing
interface ScoredFlightWithRouting extends ScoredFlight {
  routing?: FlightRoutingInfo;
}

/**
 * Generate date range for flexible dates
 */
function generateFlexibleDateRange(baseDate: string, flexDays: number): string[] {
  const dates: string[] = [];
  const base = new Date(baseDate);

  for (let i = -flexDays; i <= flexDays; i++) {
    const date = new Date(base);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Calculate return date from departure + duration
 */
function calculateReturnDate(departureDate: string, nights: number): string {
  const dep = new Date(departureDate);
  dep.setDate(dep.getDate() + nights);
  return dep.toISOString().split('T')[0];
}

/**
 * Deduplicate flight offers by flight segments
 * When multiple sources return the same flight, keep the cheapest one
 */
function deduplicateFlights(flights: FlightOffer[]): FlightOffer[] {
  const flightMap = new Map<string, FlightOffer>();

  for (const flight of flights) {
    // Create unique key from all segments (airline + flight number + departure time)
    const key = flight.itineraries.flatMap(itin =>
      itin.segments.map(seg =>
        `${seg.carrierCode}${seg.number}-${seg.departure.at}`
      )
    ).join('|');

    const existingFlight = flightMap.get(key);

    if (!existingFlight) {
      // First time seeing this flight - add it
      flightMap.set(key, flight);
    } else {
      // Flight already exists - keep the cheaper one
      const existingPrice = parseFloat(String(existingFlight.price?.total || '999999'));
      const newPrice = parseFloat(String(flight.price?.total || '999999'));

      if (newPrice < existingPrice) {
        console.log(`  💰 Found cheaper price: ${flight.source || 'Unknown'} $${newPrice} < ${existingFlight.source || 'Unknown'} $${existingPrice}`);
        flightMap.set(key, flight);
      }
    }
  }

  return Array.from(flightMap.values());
}

/**
 * Convert FlightOffer segments to routing engine format
 */
function flightOfferToRoutingSegments(flight: FlightOffer | ScoredFlight): RoutingFlightSegment[] {
  const segments: RoutingFlightSegment[] = [];

  for (const itinerary of flight.itineraries || []) {
    for (const seg of itinerary.segments || []) {
      // Get cabin class from traveler pricing if available
      let cabinClass: CabinClass = 'ECONOMY';
      let fareClass: string | undefined;
      let fareBasisCode: string | undefined;

      const travelerPricing = flight.travelerPricings?.[0];
      if (travelerPricing?.fareDetailsBySegment) {
        const fareDetails = travelerPricing.fareDetailsBySegment.find(
          (fd: any) => fd.segmentId === seg.number || fd.segmentId === `${seg.carrierCode}${seg.number}`
        ) || travelerPricing.fareDetailsBySegment[0];

        if (fareDetails) {
          cabinClass = (fareDetails.cabin as CabinClass) || 'ECONOMY';
          fareClass = fareDetails.class;
          fareBasisCode = fareDetails.fareBasis;
        }
      }

      segments.push({
        airlineCode: seg.carrierCode,
        origin: seg.departure.iataCode,
        destination: seg.arrival.iataCode,
        departureDate: new Date(seg.departure.at),
        cabinClass,
        fareClass,
        fareBasisCode,
        operatingCarrier: seg.operating?.carrierCode,
        marketingCarrier: seg.carrierCode,
      });
    }
  }

  return segments;
}

/**
 * Extract base fare from flight offer
 * Base fare = total - taxes
 *
 * IMPORTANT: Uses NET price (before markup) if available for accurate
 * commission/routing calculations. Customer-facing prices include markup.
 */
function extractBaseFare(flight: FlightOffer | ScoredFlight): number {
  // CRITICAL: Use NET price if markup was applied (for accurate commission calculation)
  const netPrice = parseFloat(String((flight.price as any)?._netPrice || '0'));
  if (netPrice > 0) {
    // If we have net price, use it as base for routing calculations
    return netPrice * 0.85; // Estimate base as ~85% of net total
  }

  const total = parseFloat(String(flight.price?.total || '0'));

  // Try to get base from traveler pricing first (more accurate)
  if (flight.travelerPricings?.length) {
    const baseTotal = flight.travelerPricings.reduce((sum, tp) => {
      return sum + parseFloat(String(tp.price?.base || '0'));
    }, 0);
    if (baseTotal > 0) return baseTotal;
  }

  // Fall back to price.base
  const base = parseFloat(String(flight.price?.base || '0'));
  if (base > 0) return base;

  // Estimate base as ~85% of total if no base available
  return total * 0.85;
}

/**
 * Extract NET total fare (before markup) for routing calculations
 */
function extractNetFare(flight: FlightOffer | ScoredFlight): number {
  // CRITICAL: Use NET price if markup was applied
  const netPrice = parseFloat(String((flight.price as any)?._netPrice || '0'));
  if (netPrice > 0) {
    return netPrice;
  }

  // Fall back to total if no markup was applied
  return parseFloat(String(flight.price?.total || '0'));
}

/**
 * Enrich flights with routing channel information
 * Determines CONSOLIDATOR vs DUFFEL for each flight
 */
async function enrichFlightsWithRouting(
  flights: ScoredFlight[],
  searchId?: string
): Promise<ScoredFlightWithRouting[]> {
  if (!flights.length) return flights;

  const engine = getRoutingEngine({ searchId, logDecisions: true });
  const enrichedFlights: ScoredFlightWithRouting[] = [];

  // Process in batches to avoid overwhelming the database
  const BATCH_SIZE = 20;
  for (let i = 0; i < flights.length; i += BATCH_SIZE) {
    const batch = flights.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (flight) => {
        try {
          const segments = flightOfferToRoutingSegments(flight);
          const baseFare = extractBaseFare(flight);
          // CRITICAL: Use NET fare (before markup) for routing/commission calculations
          const totalFare = extractNetFare(flight);

          // Skip if no segments or invalid fare
          if (!segments.length || totalFare <= 0) {
            return { ...flight, routing: undefined };
          }

          const enriched = await engine.enrichOffer(
            flight.id,
            (flight.source?.toLowerCase() as 'duffel' | 'amadeus' | 'consolidator') || 'amadeus',
            flight,
            segments,
            baseFare,
            totalFare,
            flight.price?.currency || 'USD'
          );

          return {
            ...flight,
            routing: {
              channel: enriched.routing.channel,
              estimatedProfit: enriched.routing.estimatedProfit,
              commissionPct: enriched.routing.commissionPct,
              commissionAmount: enriched.routing.commissionAmount,
              isExcluded: enriched.routing.isExcluded,
              exclusionReason: enriched.routing.exclusionReason,
              decisionReason: enriched.routing.decisionReason,
            } as FlightRoutingInfo,
          };
        } catch (err) {
          console.error(`[Routing] Failed to enrich flight ${flight.id}:`, err);
          return { ...flight, routing: undefined };
        }
      })
    );

    enrichedFlights.push(...batchResults);
  }

  return enrichedFlights;
}

/**
 * Get routing summary statistics
 */
function getRoutingSummary(flights: ScoredFlightWithRouting[]): {
  total: number;
  consolidator: number;
  duffel: number;
  totalEstimatedProfit: number;
  avgProfit: number;
} {
  const withRouting = flights.filter(f => f.routing);
  const consolidator = withRouting.filter(f => f.routing?.channel === 'CONSOLIDATOR');
  const duffel = withRouting.filter(f => f.routing?.channel === 'DUFFEL');
  const totalProfit = withRouting.reduce((sum, f) => sum + (f.routing?.estimatedProfit || 0), 0);

  return {
    total: withRouting.length,
    consolidator: consolidator.length,
    duffel: duffel.length,
    totalEstimatedProfit: Math.round(totalProfit * 100) / 100,
    avgProfit: withRouting.length ? Math.round((totalProfit / withRouting.length) * 100) / 100 : 0,
  };
}

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
    // 🛡️ Rate limiting - 60 requests per minute per IP (STANDARD preset)
    rateLimitResult = await rateLimit(request, RateLimitPresets.STANDARD);
    if (!rateLimitResult.allowed) {
      console.warn(`🚨 Rate limit exceeded for flight search: ${request.headers.get('x-forwarded-for') || 'unknown IP'}`);
      return createRateLimitResponse(rateLimitResult, 'Too many flight searches. Please wait a moment before searching again.');
    }

    const body = await request.json();

    // Validate required parameters
    const { origin, destination, departureDate, adults } = body;

    if (!origin || !destination || !departureDate || !adults) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          required: ['origin', 'destination', 'departureDate', 'adults'],
          received: body
        },
        { status: 400 }
      );
    }

    // Parse comma-separated airport codes and extract clean 3-letter codes
    const parseAirportCodes = (codes: string): string[] => {
      // Helper function to extract single airport code from various formats
      const extractSingleCode = (value: string): string => {
        const trimmed = value.trim();

        // If already a 3-letter code, return as-is
        if (/^[A-Z]{3}$/i.test(trimmed)) {
          return trimmed.toUpperCase();
        }

        // Extract code from formats like "Miami (MIA)" or "MIA - Miami"
        const codeMatch = trimmed.match(/\(([A-Z]{3})\)|^([A-Z]{3})\s*-/i);
        if (codeMatch) {
          return (codeMatch[1] || codeMatch[2]).toUpperCase();
        }

        // Return original if no pattern matches
        return trimmed.toUpperCase();
      };

      // Split by comma and extract each code
      return codes.split(',')
        .map((code: string) => extractSingleCode(code))
        .filter((code: string) => code.length > 0);
    };

    const originCodes = parseAirportCodes(origin);
    const destinationCodes = parseAirportCodes(destination);

    if (originCodes.length === 0 || destinationCodes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid airport codes provided' },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof adults !== 'number' || adults < 1 || adults > 9) {
      return NextResponse.json(
        { error: 'Invalid adults parameter. Must be a number between 1 and 9' },
        { status: 400 }
      );
    }

    // Validate date format (support comma-separated multi-dates)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const validateDates = (dateString: string, fieldName: string): boolean => {
      const dates = dateString.split(',').map(d => d.trim());
      for (const date of dates) {
        if (!dateRegex.test(date)) {
          return false;
        }
      }
      return true;
    };

    if (!validateDates(departureDate, 'departureDate')) {
      return NextResponse.json(
        { error: 'Invalid departureDate format. Expected YYYY-MM-DD or comma-separated dates' },
        { status: 400 }
      );
    }

    if (body.returnDate && !validateDates(body.returnDate, 'returnDate')) {
      return NextResponse.json(
        { error: 'Invalid returnDate format. Expected YYYY-MM-DD or comma-separated dates' },
        { status: 400 }
      );
    }

    // Validate departure date is not in the past (check first date only for multi-dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDepartureDate = departureDate.split(',')[0].trim();
    const depDate = new Date(firstDepartureDate);
    depDate.setHours(0, 0, 0, 0);

    if (depDate < today) {
      return NextResponse.json(
        { error: 'Departure date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate return date is after departure date (if provided)
    // For multi-dates, just check that return dates are chronologically reasonable
    if (body.returnDate) {
      const firstReturnDate = body.returnDate.split(',')[0].trim();
      const retDate = new Date(firstReturnDate);
      retDate.setHours(0, 0, 0, 0);

      if (retDate <= depDate) {
        return NextResponse.json(
          {
            error: 'Return date must be after departure date',
            details: {
              departureDate: firstDepartureDate,
              returnDate: firstReturnDate,
              message: 'For round-trip flights, return date must be chronologically after departure date'
            }
          },
          { status: 400 }
        );
      }
    }

    // Map travelClass to Amadeus API format (uppercase)
    const travelClassMap: Record<string, 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'> = {
      'economy': 'ECONOMY',
      'premium': 'PREMIUM_ECONOMY',
      'premium_economy': 'PREMIUM_ECONOMY',
      'business': 'BUSINESS',
      'first': 'FIRST',
    };

    const travelClass = body.travelClass ? travelClassMap[body.travelClass.toLowerCase()] : undefined;

    // Log multi-airport search info
    if (originCodes.length > 1 || destinationCodes.length > 1) {
      console.log(`🔍 Multi-airport search: ${originCodes.join(',')} → ${destinationCodes.join(',')}`);
    }

    // Build base search parameters
    flightSearchParams = {
      origin: originCodes.join(','), // Keep combined for cache key
      destination: destinationCodes.join(','), // Keep combined for cache key
      departureDate,
      returnDate: body.returnDate || undefined,
      adults,
      children: body.children || undefined,
      infants: body.infants || undefined,
      travelClass: travelClass || undefined,
      nonStop: body.nonStop === true ? true : undefined,
      currencyCode: body.currencyCode || 'USD',
      max: body.max || 50,
    };

    // Extract flexible dates and multi-date parameters
    const departureFlex = typeof body.departureFlex === 'number' ? body.departureFlex : 0;
    const tripDuration = typeof body.tripDuration === 'number' ? body.tripDuration : null;
    const useMultiDate = body.useMultiDate === 'true' || body.useMultiDate === true;

    // Mixed-carrier "Hacker Fare" option - allows combining different airlines for cheaper fares
    const includeSeparateTickets = body.includeSeparateTickets === true || body.includeSeparateTickets === 'true';

    // Parse multi-date: departureDate and returnDate may contain comma-separated dates
    const departureDates: string[] = useMultiDate && departureDate.includes(',')
      ? departureDate.split(',').map((d: string) => d.trim()).filter((d: string) => dateRegex.test(d))
      : [departureDate];

    const returnDates: string[] = useMultiDate && body.returnDate && body.returnDate.includes(',')
      ? body.returnDate.split(',').map((d: string) => d.trim()).filter((d: string) => dateRegex.test(d))
      : body.returnDate ? [body.returnDate] : [];

    // Generate cache key (include all airports, flexible dates, multi-date, and separate tickets in cache key)
    cacheKey = generateFlightSearchKey({
      ...flightSearchParams,
      origin: originCodes.join(','),
      destination: destinationCodes.join(','),
      departureFlex: departureFlex || 0,
      tripDuration: tripDuration || undefined,
      useMultiDate: useMultiDate || undefined,
      includeSeparateTickets: includeSeparateTickets || undefined,
    });

    // Check for cache bypass (for debugging price issues)
    const bypassCache = body.noCache === true || body.forceRefresh === true;
    if (bypassCache) {
      console.log('⚠️ CACHE BYPASS requested - fetching fresh prices');
    }

    // Try to get from cache (unless bypassed)
    const cached = !bypassCache ? await getCached<any>(cacheKey) : null;
    if (cached) {
      console.log('Cache HIT:', cacheKey);

      // 📊 Track cache hit for cost savings analytics
      trackCacheHit('flights', 'search', cacheKey).catch(console.error);

      // Apply sorting if requested (cached data already has scores and badges)
      const sortBy = (body.sortBy as 'best' | 'cheapest' | 'fastest' | 'overall') || 'best';
      const sortedFlights = sortFlights(cached.flights, sortBy);

      // 📊 Log cache hit to Postgres for analytics
      const lowestPrice = sortedFlights.length > 0
        ? parseFloat(String(sortedFlights[0].price?.total || '0'))
        : 0;
      logFlightSearch({
        origin: originCodes[0],
        destination: destinationCodes[0],
        departureDate,
        returnDate: body.returnDate,
        adults: adults || 1,
        children: body.children,
        infants: body.infants,
        cabinClass: travelClass,
        nonStop: body.nonStop,
        resultsCount: sortedFlights.length,
        lowestPrice: lowestPrice > 0 ? Math.round(lowestPrice * 100) : undefined,
        currency: body.currencyCode || 'USD',
        cacheHit: true, // CACHE HIT!
        sessionId: request.headers.get('x-session-id') || undefined,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        referer: request.headers.get('referer') || undefined,
      }, request).catch(console.error);

      return NextResponse.json(
        {
          ...cached,
          flights: sortedFlights,
          metadata: {
            ...cached.metadata,
            sortedBy: sortBy,
            cached: true,
            cacheKey,
            origins: originCodes,
            destinations: destinationCodes,
          }
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=900',
            'X-Cache-Status': 'HIT',
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('Cache MISS:', cacheKey);

    // 📊 Track cache miss for cost savings analytics
    trackCacheMiss('flights', 'search', cacheKey).catch(console.error);

    // Search flights using Amadeus API
    let allFlights: FlightOffer[] = [];
    let dictionaries: any = {};

    // Helper function to search a single origin-destination pair
    // Uses ML-powered smart API selection to optimize costs
    const searchSingleRoute = async (origin: string, destination: string, dateToSearch: string, returnDateToSearch?: string) => {
      // Create deduplication key for concurrent request coalescing
      const dedupKey = {
        origin,
        destination,
        departureDate: dateToSearch,
        returnDate: returnDateToSearch || null,
        adults: body.adults,
        children: body.children || 0,
        infants: body.infants || 0,
        cabinClass: travelClass,
        nonStop: body.nonStop || false,
      };

      // Deduplicate concurrent searches for the same route
      const result = await requestDeduplicator.deduplicate(
        dedupKey,
        async () => {
          const singleRouteParams = {
            origin,
            destination,
            departureDate: dateToSearch,
            returnDate: returnDateToSearch,
            adults: body.adults,
            children: body.children,
            infants: body.infants,
            travelClass,
            nonStop: body.nonStop === true ? true : undefined,
            currencyCode: body.currencyCode || 'USD',
            max: body.max || 50,
          };

      // Map travel class for Duffel (lowercase format)
      const duffelCabinClass = travelClass?.toLowerCase().replace('_', '_') as 'economy' | 'premium_economy' | 'business' | 'first' | undefined;

      // 🧠 ML: Smart API selection
      let apiSelection = await smartAPISelector.selectAPIs({
        origin,
        destination,
        departureDate: dateToSearch,
        returnDate: returnDateToSearch,
        cabinClass: duffelCabinClass || 'economy',
      });

      console.log(`  🤖 Smart API Selection: ${apiSelection.strategy} (${(apiSelection.confidence * 100).toFixed(0)}% confidence) - ${apiSelection.reason}`);

      // 🚫 CRITICAL: Skip Amadeus API when in TEST mode (returns fake/synthetic prices)
      // Only use real Duffel prices until Amadeus production key is obtained
      if (amadeusAPI.isTestMode()) {
        console.log('  ⚠️  AMADEUS TEST MODE DETECTED - Skipping Amadeus (fake prices)');
        console.log('  ✅ Using Duffel LIVE API only for real market prices');
        console.log(`  📍 Route: ${origin} → ${destination} | Date: ${dateToSearch} | ${returnDateToSearch ? 'Round-trip' : 'One-way'}`);
        console.log('  💡 To enable Amadeus: Set AMADEUS_ENVIRONMENT=production in Vercel');
        apiSelection = { strategy: 'duffel', confidence: 1.0, reason: 'Amadeus in test mode - using Duffel only', estimatedSavings: 0 };
      } else if (amadeusAPI.isProductionMode()) {
        console.log('  ✅ AMADEUS PRODUCTION MODE - Both APIs available');
        console.log(`  📍 Route: ${origin} → ${destination} | Date: ${dateToSearch} | ${returnDateToSearch ? 'Round-trip' : 'One-way'}`);
      }

      // 🎯 OPTIMIZATION: For far-future dates or important routes, always query both APIs to maximize results
      // BUT: Only if Amadeus is in production mode (don't use fake test prices!)
      const daysToDeparture = Math.ceil((new Date(dateToSearch).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const isFarFuture = daysToDeparture > 180; // More than 6 months out
      const isMajorRoute = ['JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'DEN', 'SFO', 'MIA', 'LHR', 'CDG'].includes(origin) &&
                          ['JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'DEN', 'SFO', 'MIA', 'LHR', 'CDG'].includes(destination);

      if ((isFarFuture || isMajorRoute) && apiSelection.strategy !== 'both' && amadeusAPI.isProductionMode()) {
        console.log(`  ✨ Overriding to BOTH APIs: ${isFarFuture ? 'Far-future date' : 'Major route'} - maximizing flight options`);
        apiSelection = { strategy: 'both', confidence: 0.9, reason: 'Auto-override for maximum results', estimatedSavings: 0 };
      }

      // Query selected API(s) based on ML recommendation
      let amadeusResponse, duffelResponse;
      const amadeusStartTime = Date.now();
      const duffelStartTime = Date.now();

      if (apiSelection.strategy === 'both') {
        // Query both APIs in parallel
        [amadeusResponse, duffelResponse] = await Promise.allSettled([
          amadeusAPI.searchFlights(singleRouteParams),
          duffelAPI.isAvailable()
            ? duffelAPI.searchFlights({
                origin,
                destination,
                departureDate: dateToSearch,
                returnDate: returnDateToSearch,
                adults: body.adults || 1,
                children: body.children,
                infants: body.infants,
                cabinClass: duffelCabinClass || 'economy',
                maxResults: body.max || 50,
                nonStop: body.nonStop === true ? true : undefined,
              })
            : Promise.resolve({ data: [], meta: { count: 0 } }),
        ]);
      } else if (apiSelection.strategy === 'amadeus') {
        // Query only Amadeus
        amadeusResponse = await amadeusAPI.searchFlights(singleRouteParams).then(
          value => ({ status: 'fulfilled' as const, value }),
          reason => ({ status: 'rejected' as const, reason })
        );
        duffelResponse = { status: 'fulfilled' as const, value: { data: [], meta: { count: 0 } } };
      } else {
        // Query only Duffel
        amadeusResponse = { status: 'fulfilled' as const, value: { data: [], dictionaries: {} } };
        duffelResponse = duffelAPI.isAvailable()
          ? await duffelAPI.searchFlights({
              origin,
              destination,
              departureDate: dateToSearch,
              returnDate: returnDateToSearch,
              adults: body.adults || 1,
              children: body.children,
              infants: body.infants,
              cabinClass: duffelCabinClass || 'economy',
              maxResults: body.max || 50,
              nonStop: body.nonStop === true ? true : undefined,
            }).then(
              value => ({ status: 'fulfilled' as const, value }),
              reason => ({ status: 'rejected' as const, reason })
            )
          : { status: 'fulfilled' as const, value: { data: [], meta: { count: 0 } } };
      }

      const amadeusTime = Date.now() - amadeusStartTime;
      const duffelTime = Date.now() - duffelStartTime;

      // Extract results
      const amadeusFlights = amadeusResponse.status === 'fulfilled' ? (amadeusResponse.value.data || []) : [];
      const duffelFlights = duffelResponse.status === 'fulfilled' ? (duffelResponse.value.data || []) : [];

      // Log any errors (but don't fail the entire search)
      if (amadeusResponse.status === 'rejected') {
        console.error('  ⚠️  Amadeus API error:', amadeusResponse.reason?.message);
        console.error('  📝 Full error:', amadeusResponse.reason);
      }
      if (duffelResponse.status === 'rejected') {
        console.error('  ⚠️  Duffel API error:', duffelResponse.reason?.message);
        console.error('  📝 Full error:', duffelResponse.reason);
      }

      console.log(`    Amadeus: ${amadeusFlights.length} flights (${amadeusTime}ms), Duffel: ${duffelFlights.length} flights (${duffelTime}ms)`);

      // 🔍 PRICE VALIDATION LOGGING - Debug price issues
      if (duffelFlights.length > 0) {
        const firstDuffel = duffelFlights[0] as FlightOffer;
        console.log('\n💰 ========== PRICE VALIDATION ==========');
        console.log(`   Route: ${origin} → ${destination}`);
        console.log(`   First Duffel flight price:`);
        console.log(`     - price.total: ${firstDuffel.price?.total} (type: ${typeof firstDuffel.price?.total})`);
        console.log(`     - price.base: ${firstDuffel.price?.base} (type: ${typeof firstDuffel.price?.base})`);
        console.log(`     - price.currency: ${firstDuffel.price?.currency}`);
        console.log(`     - price.grandTotal: ${(firstDuffel.price as any)?.grandTotal}`);
        const parsedTotal = parseFloat(String(firstDuffel.price?.total || '0'));
        console.log(`     - Parsed as number: ${parsedTotal}`);
        if (parsedTotal < 500) {
          console.warn(`   ⚠️  WARNING: Price $${parsedTotal} seems too low for this route!`);
        }
        console.log('💰 ==========================================\n');
      }

      // Enhanced logging for limited results
      const totalFlights = amadeusFlights.length + duffelFlights.length;
      if (totalFlights < 10) {
        console.warn(`  ⚠️  LIMITED RESULTS: Only ${totalFlights} flights found for ${origin}→${destination}`);
        console.warn(`  📅 Search date: ${dateToSearch} (${Math.ceil((new Date(dateToSearch).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days from now)`);
        console.warn(`  💡 Tip: Far-future dates may have limited airline inventory`);
      }

      // 📊 Log API performance for ML learning
      if (amadeusFlights.length > 0 || duffelFlights.length > 0) {
        const amadeusLowestPrice = amadeusFlights.length > 0
          ? Math.min(...amadeusFlights.map((f: FlightOffer) => parseFloat(String(f.price?.total || '999999'))))
          : null;
        const duffelLowestPrice = duffelFlights.length > 0
          ? Math.min(...duffelFlights.map((f: FlightOffer) => parseFloat(String(f.price?.total || '999999'))))
          : null;

        routeProfiler.logAPIPerformance(
          `${origin}-${destination}`,
          amadeusLowestPrice,
          duffelLowestPrice,
          amadeusTime,
          duffelTime
        ).catch(console.error); // Don't block on logging
      }

      // ============================================================================
      // 🎫 GROUP DUFFEL FARE FAMILIES
      // ============================================================================
      // Duffel returns multiple offers for the same physical flight with different
      // fare classes (e.g., Basic $432, Economy $589). We need to group these as
      // fare variants of the same flight, not as separate flights.
      //
      // Strategy:
      // 1. Create a flight signature (carrier + flight number + departure time)
      // 2. Group Duffel offers by this signature
      // 3. Pick the cheapest as the representative flight
      // 4. Store all variants in fareVariants array for the booking page
      // ============================================================================

      const groupDuffelFareVariants = (duffelOffers: FlightOffer[]): FlightOffer[] => {
        if (duffelOffers.length === 0) return [];

        // Helper: Create unique flight signature
        const getFlightSignature = (offer: FlightOffer): string => {
          const segments = offer.itineraries?.flatMap(itin => itin.segments || []) || [];
          if (segments.length === 0) return offer.id; // Fallback to ID if no segments

          // Build signature from all segments: carrier+flightNum+depTime+arrTime
          const sigParts = segments.map(seg =>
            `${seg.carrierCode || 'XX'}${seg.number || '000'}_${seg.departure?.at?.slice(0, 16) || ''}_${seg.arrival?.at?.slice(0, 16) || ''}`
          );
          return sigParts.join('|');
        };

        // Group offers by signature
        const fareGroups = new Map<string, FlightOffer[]>();

        for (const offer of duffelOffers) {
          const sig = getFlightSignature(offer);
          if (!fareGroups.has(sig)) {
            fareGroups.set(sig, []);
          }
          fareGroups.get(sig)!.push(offer);
        }

        console.log(`  🎫 Duffel Fare Grouping: ${duffelOffers.length} offers → ${fareGroups.size} unique flights`);

        // For each group, pick cheapest and store variants
        const groupedFlights: FlightOffer[] = [];

        for (const [signature, variants] of fareGroups.entries()) {
          // Sort by price (cheapest first)
          variants.sort((a, b) => {
            const priceA = parseFloat(String(a.price?.total || '999999'));
            const priceB = parseFloat(String(b.price?.total || '999999'));
            return priceA - priceB;
          });

          // Pick the cheapest as the representative flight
          const cheapest = variants[0];

          // Extract fare names for logging
          const fareNames = variants.map(v => {
            const fareDetails = v.travelerPricings?.[0]?.fareDetailsBySegment?.[0] as any;
            return fareDetails?.brandedFareLabel || fareDetails?.brandedFare || fareDetails?.cabin || 'ECONOMY';
          });

          // Add all variants to the cheapest flight
          const flightWithVariants = {
            ...cheapest,
            // Store ALL fare variants (including the cheapest itself)
            fareVariants: variants.map((v, idx) => {
              const price = parseFloat(String(v.price?.total || '0'));
              const fareDetails = v.travelerPricings?.[0]?.fareDetailsBySegment?.[0] as any;
              const brandedFare = (fareDetails?.brandedFareLabel || fareDetails?.brandedFare || '').toUpperCase();
              const cabin = fareDetails?.cabin || 'ECONOMY';

              // Map cabin class to display-friendly name
              const cabinDisplayName: Record<string, string> = {
                'ECONOMY': 'Economy',
                'PREMIUM_ECONOMY': 'Premium Economy',
                'BUSINESS': 'Business',
                'FIRST': 'First Class',
              };
              const cabinPrefix = cabinDisplayName[cabin] || 'Economy';

              // Determine fare type from branded fare
              let fareType = 'Standard';
              if (brandedFare.includes('BASIC') || brandedFare.includes('LIGHT') || brandedFare.includes('SAVER')) {
                fareType = 'Basic';
              } else if (brandedFare.includes('FLEX') || brandedFare.includes('FLEXI') || brandedFare.includes('FULL')) {
                fareType = 'Flex';
              } else if (brandedFare.includes('PLUS') || brandedFare.includes('PREMIUM') || brandedFare.includes('COMFORT')) {
                fareType = 'Plus';
              } else if (idx === 0 && variants.length > 1) {
                fareType = 'Basic';
              } else if (idx === variants.length - 1 && variants.length > 2 && cabin === 'ECONOMY') {
                fareType = 'Flex';
              }

              // Combine cabin class + fare type for clear display
              const displayName = cabin === 'FIRST' ? 'First Class' : `${cabinPrefix} ${fareType}`;

              // Extract restrictions for clear policies
              // IMPORTANT: Duffel partial offers may not include conditions object
              // When conditions are missing, derive policies from fare brand name
              const conditions = (v as any).conditions;
              const restrictions: string[] = [];
              const positives: string[] = [];

              // Check if we have actual conditions data from API
              const hasConditionsData = conditions && (
                typeof conditions.changeable === 'boolean' ||
                typeof conditions.refundable === 'boolean'
              );

              if (hasConditionsData) {
                // Use actual API data
                if (!conditions.changeable) restrictions.push('No changes allowed');
                if (!conditions.refundable) restrictions.push('Non-refundable');
                if (conditions.changeable) {
                  positives.push(conditions.changePenalty ? `Changes (${conditions.changePenalty} fee)` : 'Free changes');
                }
                if (conditions.refundable) {
                  positives.push(conditions.refundPenalty ? `Refundable (${conditions.refundPenalty} fee)` : 'Fully refundable');
                }
              } else {
                // Derive from fare brand name - industry standard fare policies
                const isBasicFare = fareType === 'Basic' || brandedFare.includes('LIGHT') || brandedFare.includes('SAVER');
                const isFlexFare = fareType === 'Flex' || brandedFare.includes('FLEXI') || brandedFare.includes('FULL') || brandedFare.includes('MAX');
                const isPlusFare = fareType === 'Plus' || brandedFare.includes('COMFORT') || brandedFare.includes('PREMIUM');

                if (isFlexFare) {
                  // Flex fares typically allow changes and refunds
                  positives.push('Free changes');
                  positives.push('Fully refundable');
                } else if (isPlusFare) {
                  // Plus/Comfort fares typically allow changes with fee
                  positives.push('Changes allowed');
                  restrictions.push('Non-refundable');
                } else if (isBasicFare) {
                  // Basic fares are most restrictive
                  restrictions.push('No changes allowed');
                  restrictions.push('Non-refundable');
                } else {
                  // Standard fares - middle ground
                  positives.push('Changes (fee applies)');
                  restrictions.push('Non-refundable');
                }
              }

              return {
                id: v.id,
                name: displayName,
                price: price,
                currency: v.price?.currency || 'USD',
                originalOffer: v, // Store full offer for booking
                features: extractFareFeatures(v, fareDetails),
                restrictions: restrictions.length > 0 ? restrictions : undefined,
                positives: positives.length > 0 ? positives : undefined, // Positive policies (changes, refunds)
                recommended: idx === 1 && variants.length > 1, // Second option usually best value
                popularityPercent: idx === 0 ? 26 : idx === 1 ? 74 : 18,
                cabinClass: cabin, // Store cabin class for reference
              };
            }),
            fareVariantCount: variants.length,
          };

          if (variants.length > 1) {
            const priceRange = `$${parseFloat(String(variants[0].price?.total)).toFixed(0)} - $${parseFloat(String(variants[variants.length - 1].price?.total)).toFixed(0)}`;
            console.log(`    ✓ ${fareNames.join(' → ')} (${priceRange})`);
          }

          groupedFlights.push(flightWithVariants);
        }

        return groupedFlights;
      };

      // Helper: Extract fare features from Duffel offer
      // NOTE: Refund/change policies are now shown separately in the policies section
      const extractFareFeatures = (offer: FlightOffer, fareDetails: any): string[] => {
        const features: string[] = [];

        // Cabin class - most important, show first
        const cabin = fareDetails?.cabin || 'ECONOMY';
        if (cabin === 'BUSINESS') {
          features.push('Business class seat');
          features.push('Priority boarding');
          features.push('Lounge access');
        } else if (cabin === 'FIRST') {
          features.push('First class suite');
          features.push('Priority boarding');
          features.push('Premium lounge');
        } else if (cabin === 'PREMIUM_ECONOMY') {
          features.push('Premium economy seat');
          features.push('Extra legroom');
        } else {
          features.push('Economy seat');
        }

        // Baggage
        const checkedBags = fareDetails?.includedCheckedBags?.quantity || 0;
        if (checkedBags === 0) {
          features.push('Carry-on only');
        } else if (checkedBags === 1) {
          features.push('Carry-on + 1 checked bag');
        } else if (checkedBags >= 2) {
          features.push(`Carry-on + ${checkedBags} checked bags`);
        }

        // NOTE: Refund/change info now shown in separate policies section
        // to avoid duplication with positives/restrictions

        return features.slice(0, 4); // Limit to 4 features (policies shown separately)
      };

      // Apply fare grouping to Duffel flights
      const groupedDuffelFlights = groupDuffelFareVariants(duffelFlights);

      // Merge results (Amadeus flights + grouped Duffel flights)
      let allFlightsFromBothSources = [...amadeusFlights, ...groupedDuffelFlights];

      // 🚫 NO DEMO/FALLBACK FLIGHTS - Only real API results
      if (allFlightsFromBothSources.length === 0) {
        console.log(`  ⚠️  No flights found for ${origin} → ${destination} - returning empty results (no demo data)`);
        // Return empty - user will see "No flights found" message
      }

          // Get dictionaries from Amadeus response (for carrier names, etc.)
          const dictionaries = amadeusResponse.status === 'fulfilled' ? amadeusResponse.value.dictionaries : {};

          return {
            data: allFlightsFromBothSources,
            dictionaries,
          };
        }
      );

      // Log deduplication stats
      if (result.deduped) {
        console.log(`  🔄 Request deduplicated (${result.waiters} concurrent users sharing this search)`);
      }

      return result.data;
    };

    // Multi-airport search: iterate through all origin-destination combinations
    const totalCombinations = originCodes.length * destinationCodes.length;
    console.log(`🛫 Searching ${totalCombinations} airport combination(s)...`);

    if (useMultiDate && departureDates.length > 1) {
      console.log(`🗓️ Multi-date search: ${departureDates.length} departure dates x ${returnDates.length || 1} return dates`);

      // ⚡ PERFORMANCE: Parallelize all searches using Promise.all
      const searchPromises = originCodes.flatMap(originCode =>
        destinationCodes.flatMap(destinationCode =>
          departureDates.flatMap(specificDepartureDate => {
            // If return dates are specified, iterate through them
            if (returnDates.length > 0) {
              return returnDates.map(specificReturnDate => {
                console.log(`  Queuing: ${originCode} → ${destinationCode} on ${specificDepartureDate} returning ${specificReturnDate}`);
                return searchSingleRoute(originCode, destinationCode, specificDepartureDate, specificReturnDate)
                  .then(apiResponse => {
                    const flights: FlightOffer[] = apiResponse.data || [];
                    console.log(`    ✅ Found: ${flights.length} flights for ${originCode} → ${destinationCode} on ${specificDepartureDate}`);
                    return { flights, dictionaries: apiResponse.dictionaries };
                  })
                  .catch(error => {
                    console.error(`    ❌ Error searching ${originCode} → ${destinationCode} on ${specificDepartureDate} returning ${specificReturnDate}:`, error?.message);
                    return { flights: [], dictionaries: {} };
                  });
              });
            } else {
              // One-way flight - no return date
              console.log(`  Queuing: ${originCode} → ${destinationCode} on ${specificDepartureDate}`);
              return [searchSingleRoute(originCode, destinationCode, specificDepartureDate, undefined)
                .then(apiResponse => {
                  const flights: FlightOffer[] = apiResponse.data || [];
                  console.log(`    ✅ Found: ${flights.length} flights for ${originCode} → ${destinationCode} on ${specificDepartureDate}`);
                  return { flights, dictionaries: apiResponse.dictionaries };
                })
                .catch(error => {
                  console.error(`    ❌ Error searching ${originCode} → ${destinationCode} on ${specificDepartureDate}:`, error?.message);
                  return { flights: [], dictionaries: {} };
                })];
            }
          })
        )
      );

      console.log(`⚡ Executing ${searchPromises.length} searches IN PARALLEL...`);
      const startTime = Date.now();

      // Execute all searches in parallel
      const results = await Promise.all(searchPromises);

      const parallelTime = Date.now() - startTime;
      console.log(`⚡ Parallel search completed in ${parallelTime}ms (avg ${Math.round(parallelTime / searchPromises.length)}ms per route)`);

      // Aggregate results
      results.forEach(result => {
        allFlights.push(...result.flights);
        if (result.dictionaries && Object.keys(result.dictionaries).length > 0) {
          dictionaries = result.dictionaries;
        }
      });

      // Deduplicate results
      console.log(`Total flights before dedup: ${allFlights.length}`);
      allFlights = deduplicateFlights(allFlights);
      console.log(`Total flights after dedup: ${allFlights.length}`);
    } else if (departureFlex > 0) {
      console.log(`🗓️ Flexible dates search: ±${departureFlex} days`);

      // Generate date range
      const flexDates = generateFlexibleDateRange(departureDate, departureFlex);

      // ⚡ PERFORMANCE: Parallelize all searches using Promise.all
      const searchPromises = originCodes.flatMap(originCode =>
        destinationCodes.flatMap(destinationCode =>
          flexDates.map(flexDate => {
            // Calculate return date if trip duration specified
            const flexReturnDate = (tripDuration && body.returnDate)
              ? calculateReturnDate(flexDate, tripDuration)
              : body.returnDate;

            console.log(`  Queuing: ${originCode} → ${destinationCode} on ${flexDate}${flexReturnDate ? ` returning ${flexReturnDate}` : ''}`);

            return searchSingleRoute(originCode, destinationCode, flexDate, flexReturnDate)
              .then(apiResponse => {
                const flights: FlightOffer[] = apiResponse.data || [];
                console.log(`    ✅ Found: ${flights.length} flights for ${originCode} → ${destinationCode} on ${flexDate}`);
                return { flights, dictionaries: apiResponse.dictionaries };
              })
              .catch(error => {
                console.error(`    ❌ Error searching ${originCode} → ${destinationCode} on ${flexDate}:`, error?.message);
                return { flights: [], dictionaries: {} };
              });
          })
        )
      );

      console.log(`⚡ Executing ${searchPromises.length} searches IN PARALLEL...`);
      const startTime = Date.now();

      // Execute all searches in parallel
      const results = await Promise.all(searchPromises);

      const parallelTime = Date.now() - startTime;
      console.log(`⚡ Parallel search completed in ${parallelTime}ms (avg ${Math.round(parallelTime / searchPromises.length)}ms per route)`);

      // Aggregate results
      results.forEach(result => {
        allFlights.push(...result.flights);
        if (result.dictionaries && Object.keys(result.dictionaries).length > 0) {
          dictionaries = result.dictionaries;
        }
      });

      // Deduplicate results
      console.log(`Total flights before dedup: ${allFlights.length}`);
      allFlights = deduplicateFlights(allFlights);
      console.log(`Total flights after dedup: ${allFlights.length}`);
    } else {
      // Standard search with multiple airports (no flexible dates)

      // ⚡ PERFORMANCE: Parallelize all searches using Promise.all
      const searchPromises = originCodes.flatMap(originCode =>
        destinationCodes.map(destinationCode => {
          console.log(`  Queuing: ${originCode} → ${destinationCode}`);

          return searchSingleRoute(originCode, destinationCode, departureDate, body.returnDate)
            .then(apiResponse => {
              const flights: FlightOffer[] = apiResponse.data || [];
              console.log(`    ✅ Found: ${flights.length} flights for ${originCode} → ${destinationCode}`);
              return { flights, dictionaries: apiResponse.dictionaries };
            })
            .catch(error => {
              console.error(`    ❌ Error searching ${originCode} → ${destinationCode}:`, error?.message);
              return { flights: [], dictionaries: {} };
            });
        })
      );

      console.log(`⚡ Executing ${searchPromises.length} searches IN PARALLEL...`);
      const startTime = Date.now();

      // Execute all searches in parallel
      const results = await Promise.all(searchPromises);

      const parallelTime = Date.now() - startTime;
      console.log(`⚡ Parallel search completed in ${parallelTime}ms (avg ${Math.round(parallelTime / searchPromises.length)}ms per route)`);

      // Aggregate results
      results.forEach(result => {
        allFlights.push(...result.flights);
        if (result.dictionaries && Object.keys(result.dictionaries).length > 0) {
          dictionaries = result.dictionaries;
        }
      });

      // Deduplicate results
      if (totalCombinations > 1) {
        console.log(`Total flights before dedup: ${allFlights.length}`);
        allFlights = deduplicateFlights(allFlights);
        console.log(`Total flights after dedup: ${allFlights.length}`);
      }
    }

    let flights = allFlights;
    const originalFlightCount = allFlights.length; // 🛡️ SAFETY: Track original count

    // 🎫 SMART MIXED-CARRIER "HACKER FARE" SEARCH
    // Uses zero-cost heuristic to decide when to search for cheaper combinations
    // Only runs additional API calls when savings are likely
    // Results are unified and sorted with cheapest first (mixed or traditional)
    let mixedCarrierFares: MixedCarrierFare[] = [];
    let smartMixedResult: SmartMixedCarrierResult | null = null;

    if (body.returnDate && originCodes.length > 0 && destinationCodes.length > 0) {
      console.log('\n🎫 Smart Mixed-Carrier Search: Analyzing round-trip data for savings potential...');
      console.log(`   📊 Input: ${originalFlightCount} round-trip flights from main search`);

      try {
        const origin = originCodes[0];
        const destination = destinationCodes[0];
        const depDate = departureDates[0];
        const retDate = returnDates[0] || body.returnDate;

        // Map travel class for Duffel (lowercase format)
        const mixedDuffelCabinClass = travelClass?.toLowerCase().replace('_', '_') as 'economy' | 'premium_economy' | 'business' | 'first' | undefined;

        // Skip Amadeus if in test mode (fake prices)
        const useAmadeus = amadeusAPI.isProductionMode();

        // Create one-way search adapter for the smart algorithm
        const oneWaySearchFunction: OneWaySearchFunction = async (params) => {
          const searchResults: FlightOffer[] = [];

          // Run Amadeus + Duffel in parallel for each one-way search
          const [amadeusResult, duffelResult] = await Promise.allSettled([
            useAmadeus
              ? amadeusAPI.searchFlights({
                  origin: params.origin,
                  destination: params.destination,
                  departureDate: params.date,
                  adults: params.adults || body.adults || 1,
                  children: params.children || body.children,
                  infants: params.infants || body.infants,
                  travelClass: travelClass,
                  nonStop: params.nonStop || body.nonStop === true ? true : undefined,
                  currencyCode: body.currencyCode || 'USD',
                  max: params.maxResults || 30,
                })
              : Promise.resolve({ data: [] }),
            duffelAPI.isAvailable()
              ? duffelAPI.searchFlights({
                  origin: params.origin,
                  destination: params.destination,
                  departureDate: params.date,
                  adults: params.adults || body.adults || 1,
                  children: params.children || body.children,
                  infants: params.infants || body.infants,
                  cabinClass: mixedDuffelCabinClass || 'economy',
                  maxResults: params.maxResults || 30,
                  nonStop: params.nonStop || body.nonStop === true ? true : undefined,
                })
              : Promise.resolve({ data: [], meta: { count: 0 } }),
          ]);

          if (amadeusResult.status === 'fulfilled' && amadeusResult.value.data) {
            searchResults.push(...amadeusResult.value.data);
          }
          if (duffelResult.status === 'fulfilled' && duffelResult.value.data) {
            searchResults.push(...duffelResult.value.data);
          }

          return searchResults as TypedFlightOffer[];
        };

        // Execute smart mixed-carrier search
        // This analyzes round-trip data FIRST (zero cost) then decides if one-way searches are worth it
        smartMixedResult = await smartMixedCarrierSearch(
          flights as TypedFlightOffer[],
          {
            origin,
            destination,
            departureDate: depDate,
            returnDate: retDate,
            adults: body.adults,
            children: body.children,
            infants: body.infants,
            cabinClass: travelClass,
            nonStop: body.nonStop,
            includeSeparateTickets,
          },
          oneWaySearchFunction,
          {
            // Auto-enable for Economy/Premium Economy (price-sensitive travelers)
            autoEnable: true,
            autoEnableCabinClasses: ['ECONOMY', 'PREMIUM_ECONOMY'],
            // Minimum 5% or $20 savings to run extra API calls
            minEstimatedSavingsPercent: 5,
            minEstimatedSavingsAmount: 20,
            // Cache one-way results for 30 minutes
            oneWayCacheTTL: 1800,
          }
        );

        // Log summary
        console.log(`   📊 Smart Decision: ${smartMixedResult.mixedSearchPerformed ? 'SEARCHED' : 'SKIPPED'}`);
        console.log(`   📝 Reason: ${smartMixedResult.mixedSearchReason}`);
        console.log(`   📈 Stats: ${smartMixedResult.stats.totalRoundTrips} round-trips, ${smartMixedResult.stats.totalMixedFares} mixed fares`);
        console.log(`   📤 Output: ${smartMixedResult.flights.length} total flights in result`);

        if (smartMixedResult.stats.bestSavings) {
          console.log(`   💰 Best savings: $${smartMixedResult.stats.bestSavings.amount.toFixed(0)} (${smartMixedResult.stats.bestSavings.percentage.toFixed(0)}%)`);
        }
        if (smartMixedResult.stats.apiCallsSaved > 0) {
          console.log(`   ⚡ API calls saved: ${smartMixedResult.stats.apiCallsSaved} (from cache)`);
        }

        // 🛡️ CRITICAL SAFETY CHECK: Never return fewer flights than we started with
        // The smart search should ONLY ADD mixed fares, never remove round-trip flights
        const smartResultCount = smartMixedResult.flights.length;

        if (smartResultCount >= originalFlightCount) {
          // Use the smart results - they have at least as many flights
          mixedCarrierFares = smartMixedResult.mixedFares;
          flights = smartMixedResult.flights as FlightOffer[];
          console.log(`   ✅ Using smart results: ${smartResultCount} flights (original: ${originalFlightCount})`);
        } else {
          // SAFETY: Smart result has fewer flights - something went wrong!
          console.error(`   🚨 SAFETY VIOLATION: Smart result has ${smartResultCount} flights, but original had ${originalFlightCount}!`);
          console.error(`   🚨 Falling back to original flights to prevent data loss`);
          // Keep flights = allFlights (unchanged from line 965)
          mixedCarrierFares = []; // Clear any partial mixed fares
        }
      } catch (mixedError) {
        console.error('   ⚠️ Smart mixed-carrier search error (non-fatal):', mixedError);
        console.error(`   🛡️ FALLBACK: Keeping original ${originalFlightCount} flights`);
        // Continue with regular results - mixed search failure shouldn't break the main search
      }
    }

    if (!flights || flights.length === 0) {
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

      // Cache empty results too (shorter TTL)
      await setCache(cacheKey, emptyResponse, 300);

      return NextResponse.json(emptyResponse, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300',
          'X-Cache-Status': 'MISS',
        }
      });
    }

    // ============================================================================
    // 💰 APPLY FLIGHT MARKUP TO ALL PRICES
    // ============================================================================
    // Markup Strategy:
    // - Duffel/Amadeus flights: MAX($22 minimum, 7% of price), capped at $200
    // - Consolidator flights: No markup (commission-based)
    //
    // NOTE: We apply the same markup to both Amadeus and Duffel prices since
    // both are used for customer display. The routing decision (which channel
    // to book through) uses NET prices stored internally.
    // ============================================================================
    console.log('💰 Applying flight markup to all prices...');

    const markedUpFlights = flights.map((flight: FlightOffer) => {
      const netPrice = parseFloat(String(flight.price?.total || '0'));
      const source = flight.source?.toLowerCase() || 'unknown';

      // Skip markup for consolidator flights (they have built-in commission)
      // Consolidator flights would have source='consolidator' if coming from that channel
      if (source === 'consolidator') {
        console.log(`  ✓ ${flight.id}: $${netPrice.toFixed(2)} (Consolidator - no markup)`);
        return flight;
      }

      // Apply markup using the flight markup config
      const markupResult = applyFlightMarkup(netPrice);

      // Update flight price with customer-facing price (including markup)
      const markedUpFlight = {
        ...flight,
        price: {
          ...flight.price,
          total: markupResult.customerPrice.toString(),
          grandTotal: markupResult.customerPrice.toString(),
          // Store net price internally for routing/commission calculations
          _netPrice: netPrice.toString(),
          _markupAmount: markupResult.markupAmount.toString(),
          _markupPercentage: markupResult.markupPercentage,
        },
        // Update traveler pricing if exists
        // CRITICAL FIX: Calculate per-person price, not assign total to each traveler
        travelerPricings: flight.travelerPricings?.map((tp: any) => {
          const travelerCount = flight.travelerPricings?.length || 1;
          const perPersonPrice = (markupResult.customerPrice / travelerCount).toFixed(2);
          return {
            ...tp,
            price: {
              ...tp.price,
              total: perPersonPrice,
            },
          };
        }),
      };

      console.log(`  ✓ ${flight.id?.slice(-8)} (${source}): $${netPrice.toFixed(2)} → $${markupResult.customerPrice.toFixed(2)} (+$${markupResult.markupAmount.toFixed(2)} / ${markupResult.markupPercentage}%)`);

      return markedUpFlight;
    });

    // Calculate and log total markup applied
    const totalNetPrice = flights.reduce((sum: number, f: FlightOffer) => sum + parseFloat(String(f.price?.total || '0')), 0);
    const totalMarkedUpPrice = markedUpFlights.reduce((sum: number, f: FlightOffer) => sum + parseFloat(String(f.price?.total || '0')), 0);
    const totalMarkup = totalMarkedUpPrice - totalNetPrice;

    console.log(`💰 Markup Summary: ${flights.length} flights | Net: $${totalNetPrice.toFixed(2)} | Marked Up: $${totalMarkedUpPrice.toFixed(2)} | Total Markup: $${totalMarkup.toFixed(2)}`);

    // Apply AI scoring to all flights (using marked-up prices)
    let scoredFlights: ScoredFlight[] = markedUpFlights.map(flight =>
      calculateFlightScore(flight, markedUpFlights)
    );

    // Add persuasion badges
    scoredFlights = scoredFlights.map(flight => ({
      ...flight,
      badges: getFlightBadges(flight, scoredFlights)
    }));

    // 🎯 Hybrid Routing: Enrich flights with CONSOLIDATOR vs DUFFEL routing decisions
    // This determines the optimal booking channel for each flight based on commission analysis
    const searchSessionId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const routedFlights = await enrichFlightsWithRouting(scoredFlights, searchSessionId);
    const routingSummary = getRoutingSummary(routedFlights);

    console.log(`  🎯 Routing Summary: ${routingSummary.consolidator} Consolidator, ${routingSummary.duffel} Duffel, $${routingSummary.totalEstimatedProfit} total profit`);

    // Sort flights by requested criteria (default: best)
    const sortBy = (body.sortBy as 'best' | 'cheapest' | 'fastest' | 'overall') || 'best';
    const sortedFlights = sortFlights(routedFlights as ScoredFlight[], sortBy);

    // 🧠 ML: Get optimal cache TTL based on route characteristics
    const cachePrediction = await smartCachePredictor.predictOptimalTTL(
      originCodes[0], // Use first origin for prediction
      destinationCodes[0], // Use first destination for prediction
      travelClass || 'ECONOMY',
      departureDate
    );

    console.log(`  ⏱️  Smart Cache: ${cachePrediction.recommendedTTL}min (${(cachePrediction.confidence * 100).toFixed(0)}% confidence) - ${cachePrediction.reason}`);

    // Check if results are limited and add helpful message with detailed diagnostics
    const daysToDeparture = Math.ceil((new Date(departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // Detect if this is an international route (different country codes in origin/destination)
    const isInternationalRoute = originCodes[0]?.length === 3 && destinationCodes[0]?.length === 3 &&
      !['US', 'CA'].every(region => {
        // Major US/Canada airports - if one is domestic and one is international, it's international
        const usCanadaAirports = ['JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'DEN', 'SFO', 'MIA', 'SEA', 'BOS', 'EWR', 'IAH', 'MSP', 'DTW', 'PHL', 'LGA', 'FLL', 'SAN', 'TPA', 'PDX', 'YYZ', 'YVR', 'YUL', 'YYC'];
        return usCanadaAirports.includes(originCodes[0]) && usCanadaAirports.includes(destinationCodes[0]);
      });

    // Determine API sources used
    const apiSourcesUsed = {
      amadeus: amadeusAPI.isProductionMode(),
      duffel: duffelAPI.isAvailable(),
      amadeusSkipped: amadeusAPI.isTestMode(),
    };

    // Build comprehensive limited results info
    let limitedResultsReason = '';
    let limitedResultsTip = '';

    if (sortedFlights.length < 10 && sortedFlights.length > 0) {
      // Determine primary reason for limited results
      if (daysToDeparture > 330) {
        limitedResultsReason = `Very limited inventory for dates more than 11 months out (${daysToDeparture} days). Airlines typically release schedules 6-11 months in advance.`;
        limitedResultsTip = 'Try searching for dates 2-6 months from now for significantly more options.';
      } else if (daysToDeparture > 180 && isInternationalRoute) {
        limitedResultsReason = `Limited inventory for far-future international flights (${daysToDeparture} days out). Airlines release international schedules gradually.`;
        limitedResultsTip = 'International routes typically have more availability 3-6 months before departure.';
      } else if (daysToDeparture > 180) {
        limitedResultsReason = `Limited airline inventory for far-future dates (${daysToDeparture} days out). Airlines typically release full schedules 6-9 months in advance.`;
        limitedResultsTip = 'Try searching for dates closer to departure (2-6 months out) for more options.';
      } else if (apiSourcesUsed.amadeusSkipped) {
        limitedResultsReason = 'Search using available airline connections. Some carriers may have additional inventory.';
        limitedResultsTip = 'Try adjusting your travel dates or check nearby airports for more options.';
      } else {
        limitedResultsReason = 'Limited flights available for this route/date combination.';
        limitedResultsTip = 'Try adjusting your travel dates or check nearby airports for more options.';
      }
    }

    const limitedResultsInfo = sortedFlights.length < 10 && sortedFlights.length > 0 ? {
      limited: true,
      count: sortedFlights.length,
      reason: limitedResultsReason,
      tip: limitedResultsTip,
      // Include diagnostic info for debugging (only in response, not displayed to user)
      _diagnostics: {
        daysToDeparture,
        isInternationalRoute,
        apiSources: apiSourcesUsed,
        route: `${originCodes[0]} → ${destinationCodes[0]}`,
      },
    } : undefined;

    // Log detailed diagnostics for limited results
    if (limitedResultsInfo) {
      console.log('\n📊 ========== LIMITED RESULTS DIAGNOSTICS ==========');
      console.log(`   Route: ${originCodes[0]} → ${destinationCodes[0]}`);
      console.log(`   Days to departure: ${daysToDeparture}`);
      console.log(`   International route: ${isInternationalRoute}`);
      console.log(`   Results found: ${sortedFlights.length}`);
      console.log(`   API Sources:`);
      console.log(`     - Amadeus: ${apiSourcesUsed.amadeus ? 'PRODUCTION' : (apiSourcesUsed.amadeusSkipped ? 'TEST MODE (skipped)' : 'unavailable')}`);
      console.log(`     - Duffel: ${apiSourcesUsed.duffel ? 'LIVE' : 'unavailable'}`);
      console.log(`   Reason: ${limitedResultsReason}`);
      console.log('📊 ==================================================\n');
    }

    // 🔒 INTERNAL: Store routing data separately (NOT sent to customer)
    // This data is used by booking flow to route to correct channel
    const internalRoutingData = {
      sessionId: searchSessionId,
      summary: routingSummary,
      // Map of flightId -> routing info for booking flow lookup
      flightRouting: Object.fromEntries(
        routedFlights
          .filter(f => f.routing)
          .map(f => [f.id, f.routing])
      ),
    };

    // Strip internal routing data from flights before sending to customer
    // Customer sees same prices - they don't need to know which channel we use
    const customerFlights = sortedFlights.map(flight => {
      const { routing, ...customerFlight } = flight as ScoredFlightWithRouting;
      return customerFlight;
    });

    // Build response with metadata (customer-facing - NO routing data)
    const response = {
      flights: customerFlights,
      metadata: {
        total: customerFlights.length,
        searchParams: flightSearchParams,
        sortedBy: sortBy,
        dictionaries: dictionaries,
        timestamp: new Date().toISOString(),
        cached: false,
        cacheKey,
        origins: originCodes,
        destinations: destinationCodes,
        limitedResults: limitedResultsInfo,
        // Smart Mixed-Carrier "Hacker Fare" metadata
        separateTickets: smartMixedResult ? {
          enabled: true,
          searched: smartMixedResult.mixedSearchPerformed,
          reason: smartMixedResult.mixedSearchReason,
          count: smartMixedResult.stats.totalMixedFares,
          bestSavings: smartMixedResult.stats.bestSavings,
          stats: {
            roundTrips: smartMixedResult.stats.totalRoundTrips,
            mixedFares: smartMixedResult.stats.totalMixedFares,
            cheapestRoundTrip: smartMixedResult.stats.cheapestRoundTrip,
            cheapestMixed: smartMixedResult.stats.cheapestMixed,
            apiCallsSaved: smartMixedResult.stats.apiCallsSaved,
          },
        } : (body.returnDate ? {
          enabled: false,
          reason: 'Smart mixed-carrier not triggered',
          count: mixedCarrierFares.length,
        } : undefined),
        ml: {
          cacheTTL: cachePrediction.recommendedTTL,
          cacheConfidence: cachePrediction.confidence,
          cacheReason: cachePrediction.reason,
        },
        // 🔒 Routing info stored internally, NOT exposed to customer
        _routingSessionId: searchSessionId, // Only session ID for booking lookup
      }
    };

    // 🔒 Cache internal routing data separately for booking flow
    // When customer clicks "Book", we look up which channel to use
    const routingCacheKey = `routing:${searchSessionId}`;
    await setCache(routingCacheKey, internalRoutingData, 3600); // 1 hour TTL

    // Store in cache with ML-optimized TTL (convert minutes to seconds)
    const cacheTTLSeconds = cachePrediction.recommendedTTL * 60;
    await setCache(cacheKey, response, cacheTTLSeconds);

    // 📊 Log search for route profiling
    const lowestPrice = sortedFlights.length > 0
      ? parseFloat(String(sortedFlights[0].price?.total || '0'))
      : 0;

    // 📅 Cache price by date for calendar display with seasonal TTL
    // When users search JFK→MIA on Nov 5, cache $99 for Nov 5
    // Next user opening calendar sees cached prices on searched dates
    if (lowestPrice > 0 && departureDate) {
      // Get route popularity statistics for smarter TTL
      const routeKey = `${originCodes[0]}-${destinationCodes[0]}`;
      const routeStats = await getRouteStatistics(routeKey).catch(() => null);
      const searches30d = routeStats?.searches30d || 0;

      // Calculate seasonal TTL for departure date
      const departureTTL = calculateOptimalTTL(departureDate, searches30d);

      const priceData = {
        price: lowestPrice,
        currency: body.currencyCode || 'USD',
        timestamp: new Date().toISOString(),
        route: routeKey,
      };

      // Cache departure date price with seasonal TTL
      const departurePriceCacheKey = generateCacheKey('calendar-price', {
        origin: originCodes[0],
        destination: destinationCodes[0],
        date: departureDate,
      });
      await setCache(departurePriceCacheKey, priceData, departureTTL.ttlSeconds);

      // Track cache coverage in Postgres (for analytics)
      updateCacheCoverage(
        routeKey,
        departureDate,
        Math.round(lowestPrice * 100), // Convert to cents
        departureTTL.ttlSeconds,
        'user-search'
      ).catch(console.error); // Don't block on analytics

      // Cache return date price if round trip
      let returnTTL = departureTTL;
      if (body.returnDate) {
        const reverseRouteKey = `${destinationCodes[0]}-${originCodes[0]}`;
        const returnStats = await getRouteStatistics(reverseRouteKey).catch(() => null);
        returnTTL = calculateOptimalTTL(body.returnDate, returnStats?.searches30d || 0);

        const returnPriceData = {
          ...priceData,
          route: reverseRouteKey, // Reverse route for return
        };
        const returnPriceCacheKey = generateCacheKey('calendar-price', {
          origin: destinationCodes[0],
          destination: originCodes[0],
          date: body.returnDate,
        });
        await setCache(returnPriceCacheKey, returnPriceData, returnTTL.ttlSeconds);

        // Track return flight cache coverage
        updateCacheCoverage(
          reverseRouteKey,
          body.returnDate,
          Math.round(lowestPrice * 100),
          returnTTL.ttlSeconds,
          'user-search'
        ).catch(console.error);
      }

      console.log('📅 Cached calendar prices (seasonal TTL):', {
        route: `${originCodes[0]} → ${destinationCodes[0]}`,
        departureDate,
        departureTTL: `${departureTTL.ttlMinutes}min (${departureTTL.finalMultiplier}x)`,
        returnDate: body.returnDate || null,
        returnTTL: body.returnDate ? `${returnTTL.ttlMinutes}min (${returnTTL.finalMultiplier}x)` : null,
        price: `${priceData.currency} ${lowestPrice}`,
        popularity: searches30d > 0 ? `${searches30d} searches/30d` : 'new route',
        factors: departureTTL.factors,
      });

      // 🚫 CALENDAR CROWDSOURCING DISABLED
      // Previously cached approximate prices for ±30 days around search date
      // DISABLED: Only show ACTUAL searched date prices, not approximations
      // This ensures calendar shows real prices users actually searched for
      console.log('📅 Calendar price cached for searched date only (crowdsourcing disabled)');
    }

    const searchLog: RouteSearchLog = {
      searchId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      route: `${originCodes[0]}-${destinationCodes[0]}`,
      params: {
        origin: originCodes[0],
        destination: destinationCodes[0],
        departureDate,
        returnDate: body.returnDate,
        adults: adults || 1,
        children: body.children || 0,
        infants: body.infants || 0,
        cabinClass: travelClass || 'ECONOMY',
      },
      lowestPrice,
      currency: body.currencyCode || 'USD',
      resultCount: sortedFlights.length,
      cacheHit: false,
      apiCalls: {
        amadeus: true, // Will be accurate once we add more tracking
        duffel: true,
      },
      timestamp: new Date(),
      sessionId: request.headers.get('x-session-id') || undefined,
    };

    routeProfiler.logSearch(searchLog).catch(console.error); // Don't block on logging

    // 📊 Log search to Postgres for zero-cost calendar analytics
    logFlightSearch({
      origin: originCodes[0],
      destination: destinationCodes[0],
      departureDate,
      returnDate: body.returnDate,
      adults: adults || 1,
      children: body.children,
      infants: body.infants,
      cabinClass: travelClass,
      nonStop: body.nonStop,
      resultsCount: sortedFlights.length,
      lowestPrice: lowestPrice > 0 ? Math.round(lowestPrice * 100) : undefined, // Convert to cents
      highestPrice: sortedFlights.length > 0
        ? Math.round(parseFloat(String(sortedFlights[sortedFlights.length - 1].price?.total || '0')) * 100)
        : undefined,
      avgPrice: sortedFlights.length > 0
        ? Math.round((sortedFlights.reduce((sum, f) => sum + parseFloat(String(f.price?.total || '0')), 0) / sortedFlights.length) * 100)
        : undefined,
      currency: body.currencyCode || 'USD',
      cacheHit: false,
      sessionId: request.headers.get('x-session-id') || undefined,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      referer: request.headers.get('referer') || undefined,
    }, request).catch(console.error); // Don't block on logging

    const successResponse = NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': `public, max-age=${cacheTTLSeconds}`,
        'X-Cache-Status': 'MISS',
        'X-ML-Cache-TTL': `${cachePrediction.recommendedTTL}min`,
        'X-ML-Confidence': `${(cachePrediction.confidence * 100).toFixed(0)}%`,
        'Content-Type': 'application/json'
      }
    });

    // Add rate limit headers to response
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

    // 504 - Timeout
    if (error.message?.includes('timeout') || statusCode === 504) {
      return NextResponse.json(
        { error: 'Flight search request timed out. Please try again.' },
        { status: 504 }
      );
    }

    // 500+ - Server errors
    if (statusCode >= 500) {
      return NextResponse.json(
        {
          error: 'Flight search service temporarily unavailable',
          message: 'Please try again in a few moments.'
        },
        { status: 503 }
      );
    }

    // Default error handler
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
    return NextResponse.json(
      { error: error.message || 'Failed to search flights' },
      { status: 500 }
    );
  }
}

// Use Node.js runtime for Amadeus API (edge runtime has env var restrictions)
export const runtime = 'nodejs';
