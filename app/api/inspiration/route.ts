import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const origin = searchParams.get('origin');
    const maxPrice = searchParams.get('maxPrice');
    const departureDate = searchParams.get('departureDate');
    const oneWay = searchParams.get('oneWay');
    const duration = searchParams.get('duration');
    const nonStop = searchParams.get('nonStop');
    const viewBy = searchParams.get('viewBy');

    if (!origin) {
      return NextResponse.json(
        { error: 'Origin is required' },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey('inspiration', {
      origin,
      maxPrice,
      departureDate,
      oneWay,
      duration,
      nonStop,
      viewBy,
    });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Amadeus API
    const params: any = { origin };
    if (maxPrice) params.maxPrice = parseInt(maxPrice);
    if (departureDate) params.departureDate = departureDate;
    if (oneWay) params.oneWay = oneWay === 'true';
    if (duration) params.duration = duration;
    if (nonStop) params.nonStop = nonStop === 'true';
    if (viewBy) params.viewBy = viewBy as 'DATE' | 'DESTINATION' | 'DURATION' | 'WEEK' | 'COUNTRY';

    const result = await amadeusAPI.getFlightInspiration(params);

    // Cache for 1 hour (inspiration data is relatively static)
    await setCache(cacheKey, result, 3600);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in inspiration API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get flight inspiration' },
      { status: 500 }
    );
  }
}
