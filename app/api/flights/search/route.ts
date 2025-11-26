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
import { normalizePrice } from '@/lib/flights/types';

// Hybrid Routing Engine - Consolidator vs Duffel optimization
import {
  getRoutingEngine,
  duffelOfferToSegments,
  extractDuffelBaseFare,
  type EnrichedFlightOffer,
  type FlightSegment as RoutingFlightSegment,
} from '@/lib/routing';
import type { CabinClass, RoutingChannel } from '@prisma/client';

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
 */
function extractBaseFare(flight: FlightOffer | ScoredFlight): number {
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
          const totalFare = parseFloat(String(flight.price?.total || '0'));

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
        apiSelection = { strategy: 'duffel', confidence: 1.0, reason: 'Amadeus in test mode - using Duffel only', estimatedSavings: 0 };
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

      // Merge results
      let allFlightsFromBothSources = [...amadeusFlights, ...duffelFlights];

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

    // 🎫 MIXED-CARRIER "HACKER FARE" SEARCH
    // When enabled and this is a round-trip search, also run one-way searches
    // to find cheaper combinations across different airlines
    let mixedCarrierFares: MixedCarrierFare[] = [];

    if (includeSeparateTickets && body.returnDate && originCodes.length > 0 && destinationCodes.length > 0) {
      console.log('\n🎫 Mixed-Carrier Search: Running parallel one-way searches for cheaper combinations...');

      try {
        const origin = originCodes[0];
        const destination = destinationCodes[0];
        const depDate = departureDates[0];
        const retDate = returnDates[0] || body.returnDate;

        // Map travel class for Duffel (lowercase format)
        const mixedDuffelCabinClass = travelClass?.toLowerCase().replace('_', '_') as 'economy' | 'premium_economy' | 'business' | 'first' | undefined;

        // Run one-way searches in parallel (outbound + return)
        // Skip Amadeus if in test mode (fake prices)
        const useAmadeus = amadeusAPI.isProductionMode();
        if (!useAmadeus) {
          console.log('   ⚠️  AMADEUS TEST MODE - Skipping for mixed-carrier search');
        }

        const [outboundResult, returnResult] = await Promise.allSettled([
          // Outbound one-way search
          Promise.all([
            useAmadeus
              ? amadeusAPI.searchFlights({
                  origin,
                  destination,
                  departureDate: depDate,
                  adults: body.adults || 1,
                  children: body.children,
                  infants: body.infants,
                  travelClass: travelClass,
                  nonStop: body.nonStop === true ? true : undefined,
                  currencyCode: body.currencyCode || 'USD',
                  max: 30,
                })
              : Promise.resolve({ data: [] }),
            duffelAPI.isAvailable()
              ? duffelAPI.searchFlights({
                  origin,
                  destination,
                  departureDate: depDate,
                  adults: body.adults || 1,
                  children: body.children,
                  infants: body.infants,
                  cabinClass: mixedDuffelCabinClass || 'economy',
                  maxResults: 30,
                  nonStop: body.nonStop === true ? true : undefined,
                })
              : Promise.resolve({ data: [], meta: { count: 0 } }),
          ]).then(([amadeus, duffel]) => [...(amadeus.data || []), ...(duffel.data || [])]),

          // Return one-way search (swap origin/destination)
          Promise.all([
            useAmadeus
              ? amadeusAPI.searchFlights({
                  origin: destination,
                  destination: origin,
                  departureDate: retDate,
                  adults: body.adults || 1,
                  children: body.children,
                  infants: body.infants,
                  travelClass: travelClass,
                  nonStop: body.nonStop === true ? true : undefined,
                  currencyCode: body.currencyCode || 'USD',
                  max: 30,
                })
              : Promise.resolve({ data: [] }),
            duffelAPI.isAvailable()
              ? duffelAPI.searchFlights({
                  origin: destination,
                  destination: origin,
                  departureDate: retDate,
                  adults: body.adults || 1,
                  children: body.children,
                  infants: body.infants,
                  cabinClass: mixedDuffelCabinClass || 'economy',
                  maxResults: 30,
                  nonStop: body.nonStop === true ? true : undefined,
                })
              : Promise.resolve({ data: [], meta: { count: 0 } }),
          ]).then(([amadeus, duffel]) => [...(amadeus.data || []), ...(duffel.data || [])]),
        ]);

        // Extract one-way flight results
        const outboundFlights = outboundResult.status === 'fulfilled' ? outboundResult.value : [];
        const returnFlights = returnResult.status === 'fulfilled' ? returnResult.value : [];

        console.log(`   📤 Outbound one-way: ${outboundFlights.length} flights`);
        console.log(`   📥 Return one-way: ${returnFlights.length} flights`);

        // Get cheapest round-trip price for comparison
        const cheapestRoundTrip = flights.length > 0
          ? Math.min(...flights.map(f => normalizePrice(f.price.total)))
          : undefined;

        console.log(`   💰 Cheapest round-trip: ${cheapestRoundTrip ? `$${cheapestRoundTrip.toFixed(0)}` : 'N/A'}`);

        // Combine fares to find cheaper mixed-carrier options
        if (outboundFlights.length > 0 && returnFlights.length > 0) {
          mixedCarrierFares = combineMixedCarrierFares(
            outboundFlights,
            returnFlights,
            cheapestRoundTrip,
            {
              maxCombinations: 15,
              minSavingsPercent: 0, // Show all, let UI filter
              includeSameAirline: true,
            }
          );

          // Rank by savings vs traditional round-trips
          if (flights.length > 0) {
            mixedCarrierFares = rankMixedFares(mixedCarrierFares, flights);
          }

          console.log(`   ✨ Found ${mixedCarrierFares.length} mixed-carrier combinations`);

          if (mixedCarrierFares.length > 0) {
            const bestMixed = mixedCarrierFares[0];
            console.log(`   🏆 Best hacker fare: $${bestMixed.combinedPrice.total.toFixed(0)} (${bestMixed.airlines.outbound[0]} + ${bestMixed.airlines.return[0]})`);
            if (bestMixed.savings) {
              console.log(`   💸 Savings: $${bestMixed.savings.amount.toFixed(0)} (${bestMixed.savings.percentage.toFixed(0)}% off)`);
            }
          }

          // Convert mixed fares to FlightOffer format and add to results
          const mixedFlightOffers = mixedCarrierFares.map(mixedFare => mixedFareToFlightOffer(mixedFare));
          flights = [...flights, ...mixedFlightOffers];
        }
      } catch (mixedError) {
        console.error('   ⚠️ Mixed-carrier search error (non-fatal):', mixedError);
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

    // Apply AI scoring to all flights
    let scoredFlights: ScoredFlight[] = flights.map(flight =>
      calculateFlightScore(flight, flights)
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

    // Check if results are limited and add helpful message
    const daysToDeparture = Math.ceil((new Date(departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const limitedResultsInfo = sortedFlights.length < 10 && sortedFlights.length > 0 ? {
      limited: true,
      count: sortedFlights.length,
      reason: daysToDeparture > 180
        ? `Limited airline inventory for far-future dates (${daysToDeparture} days out). Airlines typically release full schedules 6-9 months in advance.`
        : 'Limited flights available for this route/date combination.',
      tip: daysToDeparture > 180
        ? 'Try searching for dates closer to departure (2-6 months out) for more options.'
        : 'Try adjusting your travel dates or check nearby airports for more options.'
    } : undefined;

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
        // Mixed-carrier "Hacker Fare" metadata
        separateTickets: includeSeparateTickets ? {
          enabled: true,
          count: mixedCarrierFares.length,
          bestSavings: mixedCarrierFares.length > 0 && mixedCarrierFares[0].savings ? {
            amount: mixedCarrierFares[0].savings.amount,
            percentage: mixedCarrierFares[0].savings.percentage,
          } : null,
        } : undefined,
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
