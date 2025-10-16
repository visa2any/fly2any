import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';

// Helper function to extract airport code from various formats
function extractAirportCode(value: string | null): string {
  if (!value) return '';

  const trimmed = value.trim();

  // If already a 3-letter code, return as-is
  if (/^[A-Z]{3}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Extract code from formats like "New York (JFK)" or "JFK - New York"
  const codeMatch = trimmed.match(/\(([A-Z]{3})\)|^([A-Z]{3})\s*-/i);
  if (codeMatch) {
    return (codeMatch[1] || codeMatch[2]).toUpperCase();
  }

  // Return original if no pattern matches
  return trimmed.toUpperCase();
}

export async function GET(request: NextRequest) {
  // Declare variables outside try-catch so they're accessible in error handling
  let origin: string | null = null;
  let destination: string | null = null;
  let cacheKey: string = '';

  try {
    const { searchParams } = new URL(request.url);

    const originParam = searchParams.get('origin');
    const destinationParam = searchParams.get('destination');

    // Extract clean airport codes
    origin = extractAirportCode(originParam);
    destination = extractAirportCode(destinationParam);

    console.log('📍 Cheapest-dates API - Code extraction:', {
      originParam,
      extractedOrigin: origin,
      destinationParam,
      extractedDestination: destination
    });

    const departureDate = searchParams.get('departureDate');
    const oneWay = searchParams.get('oneWay');
    const duration = searchParams.get('duration');
    const nonStop = searchParams.get('nonStop');
    const maxPrice = searchParams.get('maxPrice');
    const viewBy = searchParams.get('viewBy');

    // Validate extracted codes
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    if (origin.length !== 3 || destination.length !== 3) {
      return NextResponse.json(
        {
          error: 'Invalid airport code format',
          details: `Origin: "${origin}" (${origin.length} chars), Destination: "${destination}" (${destination.length} chars). Expected 3-letter codes.`
        },
        { status: 400 }
      );
    }

    // Generate cache key
    cacheKey = generateCacheKey('cheapest-dates', {
      origin,
      destination,
      departureDate,
      oneWay,
      duration,
      nonStop,
      maxPrice,
      viewBy,
    });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Amadeus API
    const params: any = { origin, destination };
    if (departureDate) params.departureDate = departureDate;
    if (oneWay) params.oneWay = oneWay === 'true';
    if (duration) params.duration = duration;
    if (nonStop) params.nonStop = nonStop === 'true';
    if (maxPrice) params.maxPrice = parseInt(maxPrice);
    if (viewBy) params.viewBy = viewBy as 'DATE' | 'DURATION' | 'WEEK';

    const result = await amadeusAPI.getCheapestDates(params);

    // Cache for 30 minutes (price calendar changes semi-frequently)
    await setCache(cacheKey, result, 1800);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in cheapest-dates API:', error);

    // Handle specific error cases
    const errorResponse = error.response?.data;
    const isNotFound = error.response?.status === 404 ||
                      errorResponse?.errors?.some((e: any) => e.code === 1797 || e.title === 'NOT FOUND');

    const isRateLimited = error.response?.status === 429 ||
                         errorResponse?.errors?.some((e: any) => e.code === 38194 || e.title === 'Too many requests');

    if (isNotFound) {
      // Return empty data with helpful message instead of 500 error
      const emptyResponse = {
        data: [],
        meta: {
          count: 0,
          message: `No pricing data available for route ${origin} → ${destination}. Try a different route or check back later.`
        }
      };

      // Cache empty result briefly (5 minutes)
      await setCache(cacheKey, emptyResponse, 300);

      return NextResponse.json(emptyResponse, { status: 200 });
    }

    if (isRateLimited) {
      // Return empty data with rate limit message
      const rateLimitResponse = {
        data: [],
        meta: {
          count: 0,
          message: `Price calendar temporarily unavailable due to high demand. Please try again in a few minutes.`,
          rateLimitHit: true
        }
      };

      // Cache rate limit result for 10 minutes to reduce API load
      await setCache(cacheKey, rateLimitResponse, 600);

      return NextResponse.json(rateLimitResponse, { status: 200 });
    }

    // For other errors, return 500
    return NextResponse.json(
      {
        error: error.message || 'Failed to get cheapest dates',
        details: process.env.NODE_ENV === 'development' ? errorResponse : undefined
      },
      { status: 500 }
    );
  }
}
