import { NextRequest, NextResponse } from 'next/server';
import { getBaggageOptions } from '@/lib/services/booking-flow-service';

// Force dynamic rendering for query parameter usage
export const dynamic = 'force-dynamic';

/**
 * GET /api/booking-flow/baggage?offerId=xxx
 *
 * Get baggage options for a specific offer
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

    console.log('🧳 API: Getting baggage options for offer:', offerId);

    const baggage = await getBaggageOptions(offerId);

    console.log(`✅ API: Found ${baggage.length} baggage options`);

    return NextResponse.json({ baggage });
  } catch (error) {
    console.error('❌ API: Error getting baggage options:', error);
    return NextResponse.json(
      { error: 'Failed to get baggage options', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
