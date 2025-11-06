import { NextRequest, NextResponse } from 'next/server';
import { searchFlights, FlightSearchParams } from '@/lib/services/booking-flow-service';

// Force dynamic rendering for request body processing
export const dynamic = 'force-dynamic';

/**
 * POST /api/booking-flow/search
 *
 * Search flights using real Duffel API
 */
export async function POST(request: NextRequest) {
  try {
    const params: FlightSearchParams = await request.json();

    // Validate required fields
    if (!params.origin || !params.destination || !params.departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    console.log('🔍 API: Searching flights with params:', params);

    const flights = await searchFlights(params);

    console.log(`✅ API: Found ${flights.length} flights`);

    return NextResponse.json({ flights });
  } catch (error) {
    console.error('❌ API: Error searching flights:', error);
    return NextResponse.json(
      { error: 'Failed to search flights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
