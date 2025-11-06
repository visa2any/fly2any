import { NextRequest, NextResponse } from 'next/server';
import { getSeatMap } from '@/lib/services/booking-flow-service';

// Force dynamic rendering for query parameter usage
export const dynamic = 'force-dynamic';

/**
 * GET /api/booking-flow/seats?offerId=xxx
 *
 * Get seat map for a specific offer
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

    console.log('🪑 API: Getting seat map for offer:', offerId);

    const seats = await getSeatMap(offerId);

    console.log(`✅ API: Found ${seats.length} seats`);

    return NextResponse.json({ seats });
  } catch (error) {
    console.error('❌ API: Error getting seat map:', error);
    return NextResponse.json(
      { error: 'Failed to get seat map', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
