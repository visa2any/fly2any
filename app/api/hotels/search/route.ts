import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate required parameters
    const cityCode = searchParams.get('cityCode');
    const checkinDate = searchParams.get('checkinDate');
    const checkoutDate = searchParams.get('checkoutDate');
    const adults = searchParams.get('adults');

    if (!cityCode || !checkinDate || !checkoutDate || !adults) {
      return NextResponse.json(
        { error: 'Missing required parameters: cityCode, checkinDate, checkoutDate, adults' },
        { status: 400 }
      );
    }

    // Build search parameters
    const hotelSearchParams = {
      cityCode,
      checkinDate,
      checkoutDate,
      adults: parseInt(adults),
      children: searchParams.get('children') ? parseInt(searchParams.get('children')!) : undefined,
      currency: searchParams.get('currency') || 'USD',
      guestNationality: searchParams.get('guestNationality') || 'US',
    };

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:search', hotelSearchParams);

    // Try to get from cache
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=900',
        }
      });
    }

    // Search hotels using LiteAPI
    const results = await liteAPI.searchHotels(hotelSearchParams);

    // Store in cache (15 minutes TTL)
    await setCache(cacheKey, results, 900);

    return NextResponse.json(results, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=900',
      }
    });
  } catch (error: any) {
    console.error('Hotel search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search hotels' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
