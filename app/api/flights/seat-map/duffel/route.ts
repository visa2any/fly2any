import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';

/**
 * Duffel Seat Map API Route
 *
 * Fetches seat maps from Duffel API for a specific offer.
 * Returns seat layout, availability, and pricing in standardized format.
 *
 * POST /api/flights/seat-map/duffel
 * Body: { offerId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { offerId } = await request.json();

    if (!offerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offer ID is required'
        },
        { status: 400 }
      );
    }

    // Check if Duffel API is available
    if (!duffelAPI.isAvailable()) {
      console.warn('⚠️  Duffel API not initialized');
      return NextResponse.json(
        {
          success: false,
          error: 'Duffel API not available',
          data: [],
          meta: { hasRealData: false, source: 'Duffel' }
        },
        { status: 200 } // Return 200 for graceful fallback
      );
    }

    console.log('🪑 Fetching Duffel seat map for offer:', offerId);

    // Fetch seat maps from Duffel API
    const seatMapResponse = await duffelAPI.getSeatMaps(offerId);

    if (!seatMapResponse.meta.hasRealData) {
      console.log('⚠️  No seat map data available from Duffel');
      return NextResponse.json({
        success: false,
        error: seatMapResponse.meta.error || 'No seat map available',
        data: [],
        meta: { hasRealData: false, source: 'Duffel' }
      });
    }

    console.log(`✅ Successfully fetched Duffel seat map with ${seatMapResponse.data.length} segments`);

    // Return in standardized format
    return NextResponse.json({
      success: true,
      seatMap: {
        data: seatMapResponse.data,
        meta: seatMapResponse.meta,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching Duffel seat map:', error);

    // Return error response in expected format to allow graceful fallback
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Duffel seat map',
        data: [],
        meta: { hasRealData: false, source: 'Duffel' }
      },
      { status: 200 } // Return 200 so component can handle gracefully
    );
  }
}

/**
 * GET endpoint for testing
 * Usage: /api/flights/seat-map/duffel?offerId=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offerId = searchParams.get('offerId');

  if (!offerId) {
    return NextResponse.json(
      { error: 'offerId query parameter is required' },
      { status: 400 }
    );
  }

  // Reuse POST handler logic
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ offerId }),
    })
  );
}
