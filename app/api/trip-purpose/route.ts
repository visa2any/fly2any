import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const origin = searchParams.get('originLocationCode');
    const destination = searchParams.get('destinationLocationCode');
    const departureDate = searchParams.get('departureDate');
    const returnDate = searchParams.get('returnDate');

    if (!origin || !destination || !departureDate || !returnDate) {
      return NextResponse.json(
        { error: 'All parameters are required' },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey('trip-purpose', {
      origin,
      destination,
      departureDate,
      returnDate,
    });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Amadeus API
    const result = await amadeusAPI.predictTripPurpose({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
    });

    // Cache for 1 hour
    await setCache(cacheKey, result, 3600);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in trip-purpose API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to predict trip purpose' },
      { status: 500 }
    );
  }
}
