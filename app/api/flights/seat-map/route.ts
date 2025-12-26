import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { duffelAPI } from '@/lib/api/duffel';
import { alertApiError } from '@/lib/monitoring/customer-error-alerts';

/**
 * Universal Seat Map API Route
 *
 * Automatically detects the flight source (Amadeus or Duffel) and fetches
 * seat maps from the appropriate API. Returns unified seat map format.
 *
 * POST /api/flights/seat-map
 * Body: { flightOffer: FlightOffer }
 */
export async function POST(request: NextRequest) {
  try {
    const { flightOffer } = await request.json();

    if (!flightOffer) {
      return NextResponse.json(
        { error: 'Flight offer is required' },
        { status: 400 }
      );
    }

    const source = flightOffer.source || 'Amadeus';
    console.log(`💺 Fetching seat map for ${source} flight:`, flightOffer.id);

    let seatMapData;

    // Route to appropriate API based on source
    if (source === 'Duffel') {
      // Fetch from Duffel API
      if (!duffelAPI.isAvailable()) {
        console.warn('⚠️  Duffel API not available');
        throw new Error('Duffel API is not configured');
      }

      const duffelResponse = await duffelAPI.getSeatMaps(flightOffer.id);

      if (duffelResponse.meta.hasRealData) {
        seatMapData = {
          data: duffelResponse.data,
          meta: duffelResponse.meta,
        };
        console.log('✅ Successfully fetched Duffel seat map');
      } else {
        console.log('⚠️  Seat maps not available for this Duffel flight');
        // IMPORTANT: Don't try to fall back to Amadeus for Duffel flights
        // Amadeus can't provide seat maps for Duffel bookings - they use different systems
        throw new Error('Seat maps not available for this flight');
      }
    } else {
      // Fetch from Amadeus API (for GDS flights)
      seatMapData = await amadeusAPI.getSeatMap(flightOffer);
      console.log('✅ Successfully fetched Amadeus seat map');
    }

    // Wrap the response in the expected format
    return NextResponse.json({
      success: true,
      seatMap: seatMapData,
      source: source,
    });
  } catch (error: any) {
    console.error('❌ Error fetching seat map:', error.message || error);

    // Alert admins for seat map errors (low priority since it's non-blocking)
    await alertApiError(request, error, {
      errorCode: 'SEAT_MAP_FETCH_FAILED',
      endpoint: '/api/flights/seat-map',
    }, { priority: 'low' }).catch(() => {});

    // Provide user-friendly error messages based on the issue
    let userMessage = 'Unable to load seat map. You can still proceed with booking.';
    let showPreferences = true; // Allow preference-based selection as fallback

    // Check for specific error patterns
    const errorMsg = error.message?.toLowerCase() || '';

    if (errorMsg.includes('not available') || errorMsg.includes('not supported')) {
      userMessage = 'Seat selection will be assigned at check-in for this flight.';
      showPreferences = true; // Still allow preferences
    } else if (errorMsg.includes('not configured')) {
      userMessage = 'Seat map service is temporarily unavailable.';
      showPreferences = true;
    } else if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT')) {
      userMessage = 'Seat map is taking too long to load. You can skip or try again.';
      showPreferences = true;
    }

    // Return response that allows graceful fallback to preferences
    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        data: [],
        meta: {
          hasRealData: false,
          showPreferences,
          reason: error.message || 'Unknown error'
        }
      },
      { status: 200 } // Return 200 so component can handle gracefully
    );
  }
}
