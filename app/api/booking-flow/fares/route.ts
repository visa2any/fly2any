import { NextRequest, NextResponse } from 'next/server';
import { getFareOptions } from '@/lib/services/booking-flow-service';

// Force dynamic rendering for query parameter usage
export const dynamic = 'force-dynamic';

/**
 * GET /api/booking-flow/fares?offerId=xxx
 *
 * Get fare options for a specific offer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');

    if (!offerId) {
      return NextResponse.json(
        { error: 'Missing required parameter: offerId' },
        { status: 400 }
      );
    }

    console.log('💰 API: Getting fare options for offer:', offerId);

    const fares = await getFareOptions(offerId);

    console.log(`✅ API: Found ${fares.length} fare options`);

    return NextResponse.json({ fares });
  } catch (error) {
    console.error('❌ API: Error getting fare options:', error);
    return NextResponse.json(
      { error: 'Failed to get fare options', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
