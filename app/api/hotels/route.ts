import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';

// Mark this route as dynamic (it uses request params)
export const dynamic = 'force-dynamic';

// Helper function to extract airport/city code from various formats
function extractCityCode(value: string | null): string {
  if (!value) return '';

  const trimmed = value.trim();

  // Handle comma-separated codes (extract first code only)
  if (trimmed.includes(',')) {
    const firstCode = trimmed.split(',')[0].trim();
    return extractCityCode(firstCode); // Recursively process first code
  }

  // If already a 3-letter code, return as-is
  if (/^[A-Z]{3}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Extract code from formats like "London (LHR)" or "LHR - London"
  const codeMatch = trimmed.match(/\(([A-Z]{3})\)|^([A-Z]{3})\s*-/i);
  if (codeMatch) {
    return (codeMatch[1] || codeMatch[2]).toUpperCase();
  }

  // Return original if no pattern matches
  return trimmed.toUpperCase();
}

export async function GET(request: NextRequest) {
  // Declare variables outside try-catch so they're accessible in error handling
  let cityCode: string | null = null;
  let checkInDate: string | null = null;
  let checkOutDate: string | null = null;
  let cacheKey: string = '';

  try {
    const { searchParams } = new URL(request.url);

    const cityCodeParam = searchParams.get('cityCode');
    cityCode = extractCityCode(cityCodeParam);

    console.log('🏨 Hotels API - City code extraction:', {
      cityCodeParam,
      extractedCityCode: cityCode
    });
    checkInDate = searchParams.get('checkInDate');
    checkOutDate = searchParams.get('checkOutDate');
    const adults = searchParams.get('adults');

    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      return NextResponse.json(
        { error: 'cityCode, checkInDate, checkOutDate, and adults are required' },
        { status: 400 }
      );
    }

    // Validate city code is exactly 3 letters
    if (cityCode.length !== 3) {
      return NextResponse.json(
        {
          error: 'Invalid city code format',
          details: `City code "${cityCode}" (${cityCode.length} chars) must be exactly 3 letters. Examples: LON, NYC, PAR`
        },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkInDate)) {
      return NextResponse.json(
        { error: 'Invalid checkInDate format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (!dateRegex.test(checkOutDate)) {
      return NextResponse.json(
        { error: 'Invalid checkOutDate format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate check-in date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate check-out date is after check-in date
    const checkOut = new Date(checkOutDate);
    checkOut.setHours(0, 0, 0, 0);

    if (checkOut <= checkIn) {
      return NextResponse.json(
        {
          error: 'Check-out date must be after check-in date',
          details: {
            checkInDate,
            checkOutDate,
            message: 'Check-out date must be chronologically after check-in date'
          }
        },
        { status: 400 }
      );
    }

    // Generate cache key
    cacheKey = generateCacheKey('hotels', {
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
    });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Amadeus API
    const result = await amadeusAPI.searchHotels({
      cityCode,
      checkInDate,
      checkOutDate,
      adults: parseInt(adults),
      roomQuantity: 1,
    });

    // Cache for 30 minutes
    await setCache(cacheKey, result, 1800);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in hotels API:', error);

    // Handle specific error cases
    const errorResponse = error.response?.data;
    const statusCode = error.response?.status;

    // 404: No hotels found - return empty array with helpful message
    const isNotFound = statusCode === 404 ||
                      errorResponse?.errors?.some((e: any) =>
                        e.code === 1797 ||
                        e.title === 'NOT FOUND' ||
                        e.detail?.includes('No results found')
                      );

    if (isNotFound) {
      const emptyResponse = {
        data: [],
        meta: {
          count: 0,
          message: `No hotels found in ${cityCode} for ${checkInDate} to ${checkOutDate}. Try different dates or location.`
        }
      };

      // Cache empty result briefly (5 minutes)
      await setCache(cacheKey, emptyResponse, 300);

      return NextResponse.json(emptyResponse, { status: 200 });
    }

    // 400: Bad request - return with details
    if (statusCode === 400) {
      return NextResponse.json(
        {
          error: 'Bad request',
          details: errorResponse || error.message
        },
        { status: 400 }
      );
    }

    // 429: Rate limit exceeded
    if (statusCode === 429) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        },
        { status: 429 }
      );
    }

    // 401/403: Authentication/Authorization errors
    if (statusCode === 401 || statusCode === 403) {
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'Authentication error with hotel provider'
        },
        { status: 503 }
      );
    }

    // 500+: Server errors
    if (statusCode >= 500) {
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'Hotel provider is experiencing issues. Please try again later.'
        },
        { status: 503 }
      );
    }

    // For other errors, return 500
    return NextResponse.json(
      {
        error: error.message || 'Failed to search hotels',
        details: process.env.NODE_ENV === 'development' ? errorResponse : undefined
      },
      { status: 500 }
    );
  }
}
