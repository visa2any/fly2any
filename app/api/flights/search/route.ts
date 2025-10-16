import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import {
  calculateFlightScore,
  getFlightBadges,
  sortFlights,
  type FlightOffer,
  type ScoredFlight
} from '@/lib/flights/scoring';
import { getCached, setCache } from '@/lib/cache/helpers';
import { generateFlightSearchKey } from '@/lib/cache/keys';

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

    // Validate data types
    if (typeof adults !== 'number' || adults < 1 || adults > 9) {
      return NextResponse.json(
        { error: 'Invalid adults parameter. Must be a number between 1 and 9' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(departureDate)) {
      return NextResponse.json(
        { error: 'Invalid departureDate format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (body.returnDate && !dateRegex.test(body.returnDate)) {
      return NextResponse.json(
        { error: 'Invalid returnDate format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate departure date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const depDate = new Date(departureDate);
    depDate.setHours(0, 0, 0, 0);

    if (depDate < today) {
      return NextResponse.json(
        { error: 'Departure date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate return date is after departure date (if provided)
    if (body.returnDate) {
      const retDate = new Date(body.returnDate);
      retDate.setHours(0, 0, 0, 0);

      if (retDate <= depDate) {
        return NextResponse.json(
          {
            error: 'Return date must be after departure date',
            details: {
              departureDate,
              returnDate: body.returnDate,
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

    // Build search parameters
    flightSearchParams = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
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

    // Generate cache key
    cacheKey = generateFlightSearchKey(flightSearchParams);

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
    const apiResponse = await amadeusAPI.searchFlights(flightSearchParams);

    // Extract flight offers from Amadeus response
    const flights: FlightOffer[] = apiResponse.data || [];

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

    // Build response with metadata
    const response = {
      flights: sortedFlights,
      metadata: {
        total: sortedFlights.length,
        searchParams: flightSearchParams,
        sortedBy: sortBy,
        dictionaries: apiResponse.dictionaries || {},
        timestamp: new Date().toISOString(),
        cached: false,
        cacheKey,
      }
    };

    // Store in cache (15 minutes TTL)
    await setCache(cacheKey, response, 900);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=900',
        'X-Cache-Status': 'MISS',
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

export const runtime = 'edge';
