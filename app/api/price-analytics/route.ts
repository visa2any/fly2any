import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';

export const dynamic = 'force-dynamic';

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

    // NOTE: Amadeus Price Analytics API was decommissioned (410 GONE)
    // Return empty analytics as graceful fallback
    const emptyResult = {
      data: [],
      warning: 'Price analytics unavailable (API decommissioned)',
    };

    // Cache the empty result to avoid repeated lookups
    await setCache(cacheKey, emptyResult, 86400); // 24h cache

    return NextResponse.json(emptyResult);
  } catch (error: any) {
    console.error('Error in price-analytics API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get price analytics' },
      { status: 500 }
    );
  }
}
