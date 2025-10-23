import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';

// Mark this route as dynamic (it uses request params)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const flightOfferId = searchParams.get('flightOfferId');

    if (!flightOfferId) {
      return NextResponse.json(
        { error: 'Flight offer ID is required' },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey('branded-fares', { flightOfferId });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Amadeus API - NO MOCK FALLBACK
    try {
      const result = await amadeusAPI.getBrandedFares(flightOfferId);

      // Cache for 15 minutes
      await setCache(cacheKey, result, 900);

      return NextResponse.json(result);
    } catch (apiError: any) {
      console.error('Amadeus API error for branded fares:', apiError.message);

      // ✅ NO MOCK DATA - Return empty response so UI hides the feature
      return NextResponse.json(
        {
          data: [],
          hasRealData: false,
          error: 'Branded fares not available for this flight'
        },
        { status: 200 } // 200 to prevent frontend errors, but empty data
      );
    }
  } catch (error: any) {
    console.error('Error in branded-fares API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get branded fares' },
      { status: 500 }
    );
  }
}
