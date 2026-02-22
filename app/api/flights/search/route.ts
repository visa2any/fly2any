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

      // 💰 Refund cost budget since cache hit doesn't incur API costs
      refundCostBudget(request, COST_GUARDS.FLIGHT_SEARCH).catch(() => { });

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

    // ... (previous code)

    // Multi-airport search optimization
    // ⚡ PERFORMANCE: Use concurrency limit instead of strict batches to keep the pipe full
    const CONCURRENCY_LIMIT = 8;
    const itemsToProcess: (() => Promise<any>)[] = [];

    // Helper to add tasks
    const addTask = (task: () => Promise<any>) => itemsToProcess.push(task);


    // 🚀 GLOBAL CITY CODE OPTIMIZATION (Smart Grouping)
    // Reduce combinatorial explosion by grouping airports into city codes (e.g. JFK, EWR -> NYC)
    // This reduces API calls significantly (e.g. 9 distinct pairs -> 1 city pair)
    const searchGroups = new Map<string, {
      originCity: string,
      destCity: string,
      depDate: string,
      retDate?: string,
      requestedPairs: { origin: string, dest: string }[]
    }>();

    const addToGroup = (origin: string, dest: string, depDate: string, retDate?: string) => {
      const originCity = getCityCode(origin);
      const destCity = getCityCode(dest);
      // Create a unique key for the API call
      const key = `${originCity}-${destCity}-${depDate}-${retDate || 'one-way'}`;

      if (!searchGroups.has(key)) {
        searchGroups.set(key, {
          originCity,
          destCity,
          depDate,
          retDate,
          requestedPairs: []
        });
      }
      // Track the specific airport pair the user actually asked for
      searchGroups.get(key)!.requestedPairs.push({ origin, dest });
    };

    // 1. Generate all date combinations (Standard vs Flexible vs Multi-Date)
    const dateCombinations: { dep: string, ret?: string }[] = [];
    
    if (useMultiDate) {
      // Multi-date search: Use the parsed dates directly
      departureDates.forEach((dep, idx) => {
        // For round-trip, try to match return date by index, or use single return date
        const ret = returnDates.length > idx ? returnDates[idx] : 
                   returnDates.length === 1 ? returnDates[0] : 
                   undefined;
        dateCombinations.push({ dep, ret });
      });
    } else if (departureFlex > 0) {
      // Flexible dates
      const flexDates = generateFlexibleDateRange(departureDate, departureFlex);
      flexDates.forEach(date => {
        const retDate = (tripDuration && body.returnDate)
          ? calculateReturnDate(date, tripDuration)
          : body.returnDate;
        dateCombinations.push({ dep: date, ret: retDate });
      });
    } else {
      // Standard dates
      dateCombinations.push({ dep: departureDate, ret: body.returnDate });
    }

    // 2. Populate search groups
    originCodes.forEach(originCode => {
      destinationCodes.forEach(destinationCode => {
        dateCombinations.forEach(dateCombo => {
          addToGroup(originCode, destinationCode, dateCombo.dep, dateCombo.ret);
        });
      });
    });

    // 3. Create execution tasks from groups
    searchGroups.forEach((group) => {
      addTask(() =>
        searchSingleRoute(group.originCity, group.destCity, group.depDate, group.retDate)
          .then(apiResponse => {
            const rawFlights = apiResponse.data || [];

            // 🔎 STRICT POST-PROCESS FILTERING
            // We searched by City Code (e.g. NYC->LON), so we got results for ALL airports (JFK, LGA, LHR, LGW...)
            // Now we filter to keep ONLY flights matching the specific pairs the user requested (e.g. JFK->LHR)
            // This ensures the optimization is invisible to the user but saves massive API costs.
            const filteredFlights = rawFlights.filter(flight => {
              if (!flight.itineraries || flight.itineraries.length === 0) return false;

              // Helper to check if a segment match exists in requestedPairs
              const isValidItinerary = group.requestedPairs.some(pair => {
                const outboundSegments = flight.itineraries[0].segments;
                if (!outboundSegments || outboundSegments.length === 0) return false;

                const flightOrigin = outboundSegments[0].departure.iataCode;
                const flightDest = outboundSegments[outboundSegments.length - 1].arrival.iataCode;

                // Check outbound match
                const outboundMatch = (flightOrigin === pair.origin && flightDest === pair.dest);
                if (!outboundMatch) return false;

                // Check inbound match (if round trip)
                if (flight.itineraries.length > 1) {
                  const inboundSegments = flight.itineraries[1].segments;
                  if (!inboundSegments || inboundSegments.length === 0) return false;

                  const returnOrigin = inboundSegments[0].departure.iataCode;
                  const returnDest = inboundSegments[inboundSegments.length - 1].arrival.iataCode;

                  // Strict return match: Must return to the requested origin from the requested dest?
                  // Usually standard round trip implies A->B and B->A. 
                  // If user asked for JFK->LHR, they expect LHR->JFK return.
                  // However, multi-city logic might be complex. 
                  // For standard round-trip, strict inverse is safest default.
                  // If pair.dest is LHR and pair.origin is JFK, we check departure=LHR, arrival=JFK.
                  return (returnOrigin === pair.dest && returnDest === pair.origin);
                }

                return true;
              });

              return isValidItinerary;
            });

            return { flights: filteredFlights, dictionaries: apiResponse.dictionaries };
          })
          .catch((err) => {
            console.error(`Error searching city pair ${group.originCity}->${group.destCity}:`, err);
            return { flights: [], dictionaries: {} };
          })
      );
    });

    // Create one-way search adapter for the smart algorithm
    const oneWaySearchFunction: OneWaySearchFunction = async (params) => {
      const searchResults: FlightOffer[] = [];

      // Map travel class for Duffel (lowercase format)
      const mixedDuffelCabinClass = travelClass?.toLowerCase().replace('_', '_') as any;

      // Skip Amadeus if in test mode (fake prices)
      const useAmadeus = amadeusAPI.isProductionMode();

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
            nonStop: params.nonStop || (body.nonStop === true),
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
            nonStop: params.nonStop || (body.nonStop === true),
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

    // 🚀 PERFORMANCE Optimization: Start mixed-carrier searches in PARALLEL with main search
    // for major routes to minimize total response time.
    let mixedCarrierSearchPromise: Promise<any> | null = null;
    const isMainMajorRoute = (originCodes.includes('ORD') || originCodes.includes('JFK') || originCodes.includes('LAX')) &&
                            (destinationCodes.includes('AMS') || destinationCodes.includes('LHR') || destinationCodes.includes('CDG'));

    if (body.returnDate && originCodes.length > 0 && destinationCodes.length > 0 && (isMainMajorRoute || includeSeparateTickets)) {
      console.log('⚡ [Parallel] Pre-triggering mixed-carrier search for major route or explicit separate tickets...');
      // Note: We'll pass an empty array initially, but the searchFunction will trigger the needed API calls
      // and populate the one-way cache.
      mixedCarrierSearchPromise = smartMixedCarrierSearch(
        [], // Empty since we haven't finished main search yet
        {
          origin: originCodes[0],
          destination: destinationCodes[0],
          departureDate: departureDates[0],
          returnDate: returnDates[0] || body.returnDate,
          adults: body.adults,
          children: body.children,
          infants: body.infants,
          cabinClass: travelClass,
          nonStop: body.nonStop,
          includeSeparateTickets: true, // Force for parallel major route
        },
        oneWaySearchFunction,
        { autoEnable: true }
      );
    }

    console.log(`⚡ Processing ${itemsToProcess.length} searches with concurrency ${CONCURRENCY_LIMIT}...`);
    const startTime = Date.now();

    // Simple concurrency implementation
    const results: any[] = [];
    const executing: Promise<void>[] = [];

    for (const item of itemsToProcess) {
      const p = Promise.resolve().then(() => item());
      results.push(p);

      if (CONCURRENCY_LIMIT <= itemsToProcess.length) {
        const e: Promise<void> = p.then(() => {
          executing.splice(executing.indexOf(e), 1);
        });
        executing.push(e);
        if (executing.length >= CONCURRENCY_LIMIT) {
          await Promise.race(executing);
        }
      }
    }

    // Wait for all remaining
    const allResults = await Promise.all(results);

    // Aggregate results
    allResults.forEach(result => {
      allFlights.push(...(result.flights || []));
      if (result.dictionaries && Object.keys(result.dictionaries).length > 0) {
        dictionaries = { ...dictionaries, ...result.dictionaries };
      }
    });

    const parallelTime = Date.now() - startTime;
    console.log(`⚡ Search completed in ${parallelTime}ms`);

    // Deduplicate results
    if (allFlights.length > 0) {
      console.log(`Total flights before dedup: ${allFlights.length}`);
      allFlights = deduplicateFlights(allFlights);
      console.log(`Total flights after dedup: ${allFlights.length}`);
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
      if (mixedCarrierSearchPromise) {
        console.log('⚡ [Parallel] Waiting for pre-triggered mixed-carrier search to complete...');
        smartMixedResult = await mixedCarrierSearchPromise;
        // Since we passed [] initially, we need to merge the round-trip results now
        if (smartMixedResult) {
          const merged = mergeAndSortByPrice(flights as TypedFlightOffer[], smartMixedResult.mixedFares);
          smartMixedResult.flights = addCheapestBadges(merged);
        }
      } else {
        console.log('\n🎫 Smart Mixed-Carrier Search: Analyzing round-trip data for savings potential...');
        console.log(`   📊 Input: ${originalFlightCount} round-trip flights from main search`);

        try {
          const origin = originCodes[0];
          const destination = destinationCodes[0];
          const depDate = departureDates[0];
          const retDate = returnDates[0] || body.returnDate;

          // Map travel class for Duffel (lowercase format)
          // const mixedDuffelCabinClass = travelClass?.toLowerCase().replace('_', '_') as 'economy' | 'premium_economy' | 'business' | 'first' | undefined;

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
        } catch (mixedError) {
          console.error('   ⚠️ Smart mixed-carrier search error (non-fatal):', mixedError);
          // Fallback handled below
        }
      }

      // 📊 LOG AND SAFETY (Inside the if(body.returnDate) block)
      if (smartMixedResult) {
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
    console.log('💰 Applying flight markup to all prices...');
    const markedUpFlights = applyMarkupToFlights(flights, applyFlightMarkup);

    // Calculate and log total markup applied
    const totalNetPrice = flights.reduce((sum: number, f: FlightOffer) => sum + parseFloat(String(f.price?._netPrice || f.price?.total || '0')), 0);
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
    // PERF FIX: Fire-and-forget to not block response (getRouteStatistics was blocking)
    if (lowestPrice > 0 && departureDate) {
      const cacheOrigin = originCodes[0];
      const cacheDest = destinationCodes[0];
      const cacheReturnDate = body.returnDate;
      const cacheCurrency = body.currencyCode || 'USD';

      // Non-blocking: Run cache operations in background
      (async () => {
        try {
          const routeKey = `${cacheOrigin}-${cacheDest}`;
          // Use default TTL (15min) - skip DB query for speed
          // Route stats are nice-to-have, not critical for caching
          const departureTTL = calculateOptimalTTL(departureDate, 0);

          const priceData = {
            price: lowestPrice,
            currency: cacheCurrency,
            timestamp: new Date().toISOString(),
            route: routeKey,
          };

          const departurePriceCacheKey = generateCacheKey('calendar-price', {
            origin: cacheOrigin,
            destination: cacheDest,
            date: departureDate,
          });
          await setCache(departurePriceCacheKey, priceData, departureTTL.ttlSeconds);

          // Track cache coverage (fire-and-forget)
          updateCacheCoverage(
            routeKey,
            departureDate,
            Math.round(lowestPrice * 100),
            departureTTL.ttlSeconds,
            'user-search'
          ).catch(() => { });

          // Cache return date price if round trip
          if (cacheReturnDate) {
            const reverseRouteKey = `${cacheDest}-${cacheOrigin}`;
            const returnTTL = calculateOptimalTTL(cacheReturnDate, 0);

            const returnPriceData = { ...priceData, route: reverseRouteKey };
            const returnPriceCacheKey = generateCacheKey('calendar-price', {
              origin: cacheDest,
              destination: cacheOrigin,
              date: cacheReturnDate,
            });
            await setCache(returnPriceCacheKey, returnPriceData, returnTTL.ttlSeconds);

            updateCacheCoverage(
              reverseRouteKey,
              cacheReturnDate,
              Math.round(lowestPrice * 100),
              returnTTL.ttlSeconds,
              'user-search'
            ).catch(() => { });
          }
        } catch (err) {
          // Silently fail - caching is non-critical
          console.error('Calendar cache error:', err);
        }
      })();
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
