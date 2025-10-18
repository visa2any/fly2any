import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const originParam = searchParams.get('originIataCode');
    const destinationParam = searchParams.get('destinationIataCode');
    const departureDate = searchParams.get('departureDate');
    const currencyCode = searchParams.get('currencyCode') || 'USD';

    if (!originParam || !destinationParam || !departureDate) {
      return NextResponse.json(
        { error: 'Origin, destination, and departure date are required' },
        { status: 400 }
      );
    }

    // Extract first airport code from comma-separated list
    const origin = originParam.split(',')[0].trim();
    const destination = destinationParam.split(',')[0].trim();

    // Generate cache key
    const cacheKey = generateCacheKey('price-analytics', {
      origin,
      destination,
      departureDate,
      currencyCode,
    });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Amadeus API
    const result = await amadeusAPI.getPriceAnalytics({
      originIataCode: origin,
      destinationIataCode: destination,
      departureDate,
      currencyCode,
    });

    // Cache for 6 hours (analytics data is relatively static)
    await setCache(cacheKey, result, 21600);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in price-analytics API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get price analytics' },
      { status: 500 }
    );
  }
}
