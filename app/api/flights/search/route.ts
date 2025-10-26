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
import { getCached, setCache } from '@/lib/cache/helpers';
import { generateFlightSearchKey } from '@/lib/cache/keys';

// ML-powered cost optimization imports
import { smartCachePredictor } from '@/lib/ml/cache-predictor';
import { smartAPISelector } from '@/lib/ml/api-selector';
import { routeProfiler } from '@/lib/ml/route-profiler';
import type { RouteSearchLog } from '@/lib/ml/types';
import { requestDeduplicator } from '@/lib/api/request-deduplicator';

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
 * POST /api/flights/search
 * Search for flights with AI scoring and persuasion badges
 */
export async function POST(request: NextRequest) {
  // Declare variables outside try-catch so they're accessible in error handling
  let cacheKey: string = '';
  let flightSearchParams: any = null;

  try {
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

    // Parse comma-separated airport codes
    const parseAirportCodes = (codes: string): string[] => {
      return codes.split(',').map((code: string) => code.trim().toUpperCase()).filter((code: string) => code.length > 0);
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

    // Parse multi-date: departureDate and returnDate may contain comma-separated dates
    const departureDates: string[] = useMultiDate && departureDate.includes(',')
      ? departureDate.split(',').map((d: string) => d.trim()).filter((d: string) => dateRegex.test(d))
      : [departureDate];

    const returnDates: string[] = useMultiDate && body.returnDate && body.returnDate.includes(',')
      ? body.returnDate.split(',').map((d: string) => d.trim()).filter((d: string) => dateRegex.test(d))
      : body.returnDate ? [body.returnDate] : [];

    // Generate cache key (include all airports, flexible dates, and multi-date in cache key)
    cacheKey = generateFlightSearchKey({
      ...flightSearchParams,
      origin: originCodes.join(','),
      destination: destinationCodes.join(','),
      departureFlex: departureFlex || 0,
      tripDuration: tripDuration || undefined,
      useMultiDate: useMultiDate || undefined,
    });

    // Try to get from cache
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('Cache HIT:', cacheKey);

      // Apply sorting if requested (cached data already has scores and badges)
      const sortBy = (body.sortBy as 'best' | 'cheapest' | 'fastest' | 'overall') || 'best';
      const sortedFlights = sortFlights(cached.flights, sortBy);

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
      const apiSelection = await smartAPISelector.selectAPIs({
        origin,
        destination,
        departureDate: dateToSearch,
        returnDate: returnDateToSearch,
        cabinClass: duffelCabinClass || 'economy',
      });

      console.log(`  🤖 Smart API Selection: ${apiSelection.strategy} (${(apiSelection.confidence * 100).toFixed(0)}% confidence) - ${apiSelection.reason}`);

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
      }
      if (duffelResponse.status === 'rejected') {
        console.error('  ⚠️  Duffel API error:', duffelResponse.reason?.message);
      }

      console.log(`    Amadeus: ${amadeusFlights.length} flights (${amadeusTime}ms), Duffel: ${duffelFlights.length} flights (${duffelTime}ms)`);

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
      const allFlightsFromBothSources = [...amadeusFlights, ...duffelFlights];

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

      // Search each origin-destination-date combination
      for (const originCode of originCodes) {
        for (const destinationCode of destinationCodes) {
          for (const specificDepartureDate of departureDates) {
            // If return dates are specified, iterate through them
            if (returnDates.length > 0) {
              for (const specificReturnDate of returnDates) {
                try {
                  console.log(`  Searching: ${originCode} → ${destinationCode} on ${specificDepartureDate} returning ${specificReturnDate}`);

                  const apiResponse = await searchSingleRoute(originCode, destinationCode, specificDepartureDate, specificReturnDate);
                  const flights: FlightOffer[] = apiResponse.data || [];
                  allFlights.push(...flights);

                  // Store dictionaries from last successful response
                  if (apiResponse.dictionaries) {
                    dictionaries = apiResponse.dictionaries;
                  }

                  console.log(`    Found: ${flights.length} flights`);
                } catch (error) {
                  console.error(`    Error searching ${originCode} → ${destinationCode} on ${specificDepartureDate} returning ${specificReturnDate}:`, error);
                  // Continue with other combinations even if one fails
                }
              }
            } else {
              // One-way flight - no return date
              try {
                console.log(`  Searching: ${originCode} → ${destinationCode} on ${specificDepartureDate}`);

                const apiResponse = await searchSingleRoute(originCode, destinationCode, specificDepartureDate, undefined);
                const flights: FlightOffer[] = apiResponse.data || [];
                allFlights.push(...flights);

                // Store dictionaries from last successful response
                if (apiResponse.dictionaries) {
                  dictionaries = apiResponse.dictionaries;
                }

                console.log(`    Found: ${flights.length} flights`);
              } catch (error) {
                console.error(`    Error searching ${originCode} → ${destinationCode} on ${specificDepartureDate}:`, error);
                // Continue with other combinations even if one fails
              }
            }
          }
        }
      }

      // Deduplicate results
      console.log(`Total flights before dedup: ${allFlights.length}`);
      allFlights = deduplicateFlights(allFlights);
      console.log(`Total flights after dedup: ${allFlights.length}`);
    } else if (departureFlex > 0) {
      console.log(`🗓️ Flexible dates search: ±${departureFlex} days`);

      // Generate date range
      const flexDates = generateFlexibleDateRange(departureDate, departureFlex);

      // Search each origin-destination-date combination
      for (const originCode of originCodes) {
        for (const destinationCode of destinationCodes) {
          for (const flexDate of flexDates) {
            try {
              // Calculate return date if trip duration specified
              const flexReturnDate = (tripDuration && body.returnDate)
                ? calculateReturnDate(flexDate, tripDuration)
                : body.returnDate;

              console.log(`  Searching: ${originCode} → ${destinationCode} on ${flexDate}${flexReturnDate ? ` returning ${flexReturnDate}` : ''}`);

              const apiResponse = await searchSingleRoute(originCode, destinationCode, flexDate, flexReturnDate);
              const flights: FlightOffer[] = apiResponse.data || [];
              allFlights.push(...flights);

              // Store dictionaries from last successful response
              if (apiResponse.dictionaries) {
                dictionaries = apiResponse.dictionaries;
              }

              console.log(`    Found: ${flights.length} flights`);
            } catch (error) {
              console.error(`    Error searching ${originCode} → ${destinationCode} on ${flexDate}:`, error);
              // Continue with other combinations even if one fails
            }
          }
        }
      }

      // Deduplicate results
      console.log(`Total flights before dedup: ${allFlights.length}`);
      allFlights = deduplicateFlights(allFlights);
      console.log(`Total flights after dedup: ${allFlights.length}`);
    } else {
      // Standard search with multiple airports (no flexible dates)
      for (const originCode of originCodes) {
        for (const destinationCode of destinationCodes) {
          try {
            console.log(`  Searching: ${originCode} → ${destinationCode}`);

            const apiResponse = await searchSingleRoute(originCode, destinationCode, departureDate, body.returnDate);
            const flights: FlightOffer[] = apiResponse.data || [];
            allFlights.push(...flights);

            // Store dictionaries from last successful response
            if (apiResponse.dictionaries) {
              dictionaries = apiResponse.dictionaries;
            }

            console.log(`    Found: ${flights.length} flights`);
          } catch (error) {
            console.error(`    Error searching ${originCode} → ${destinationCode}:`, error);
            // Continue with other combinations even if one fails
          }
        }
      }

      // Deduplicate results
      if (totalCombinations > 1) {
        console.log(`Total flights before dedup: ${allFlights.length}`);
        allFlights = deduplicateFlights(allFlights);
        console.log(`Total flights after dedup: ${allFlights.length}`);
      }
    }

    const flights = allFlights;

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

    // Sort flights by requested criteria (default: best)
    const sortBy = (body.sortBy as 'best' | 'cheapest' | 'fastest' | 'overall') || 'best';
    const sortedFlights = sortFlights(scoredFlights, sortBy);

    // 🧠 ML: Get optimal cache TTL based on route characteristics
    const cachePrediction = await smartCachePredictor.predictOptimalTTL(
      originCodes[0], // Use first origin for prediction
      destinationCodes[0], // Use first destination for prediction
      travelClass || 'ECONOMY',
      departureDate
    );

    console.log(`  ⏱️  Smart Cache: ${cachePrediction.recommendedTTL}min (${(cachePrediction.confidence * 100).toFixed(0)}% confidence) - ${cachePrediction.reason}`);

    // Build response with metadata
    const response = {
      flights: sortedFlights,
      metadata: {
        total: sortedFlights.length,
        searchParams: flightSearchParams,
        sortedBy: sortBy,
        dictionaries: dictionaries,
        timestamp: new Date().toISOString(),
        cached: false,
        cacheKey,
        origins: originCodes,
        destinations: destinationCodes,
        ml: {
          cacheTTL: cachePrediction.recommendedTTL,
          cacheConfidence: cachePrediction.confidence,
          cacheReason: cachePrediction.reason,
        },
      }
    };

    // Store in cache with ML-optimized TTL (convert minutes to seconds)
    const cacheTTLSeconds = cachePrediction.recommendedTTL * 60;
    await setCache(cacheKey, response, cacheTTLSeconds);

    // 📊 Log search for route profiling
    const lowestPrice = sortedFlights.length > 0
      ? parseFloat(String(sortedFlights[0].price?.total || '0'))
      : 0;

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

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': `public, max-age=${cacheTTLSeconds}`,
        'X-Cache-Status': 'MISS',
        'X-ML-Cache-TTL': `${cachePrediction.recommendedTTL}min`,
        'X-ML-Confidence': `${(cachePrediction.confidence * 100).toFixed(0)}%`,
        'Content-Type': 'application/json'
      }
    });

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
