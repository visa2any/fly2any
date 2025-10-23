import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/flights/[id]
 * Fetch a specific flight by ID
 * Used for deep linking and shared flights
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flightId = params.id;

    if (!flightId) {
      return NextResponse.json(
        { error: 'Flight ID is required' },
        { status: 400 }
      );
    }

    // In production, fetch from database or cache
    // const flight = await db.flights.findOne({ id: flightId });

    // For now, try to get from Amadeus API or return error
    // In a real implementation, you would:
    // 1. Check Redis cache first
    // 2. If not in cache, fetch from Amadeus API
    // 3. If not found, return 404

    // Mock response for development
    // In production, this would be a real flight offer
    return NextResponse.json(
      {
        error: 'Flight not found',
        message: 'This endpoint requires a database implementation to fetch stored flights. For now, shared flights work only when the flight data is in sessionStorage.',
      },
      { status: 404 }
    );

    // Real implementation would look like:
    /*
    const flight = await redis.get(`flight:${flightId}`);

    if (!flight) {
      return NextResponse.json(
        { error: 'Flight not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      flight: JSON.parse(flight),
    });
    */
  } catch (error) {
    console.error('Error fetching flight:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flight details' },
      { status: 500 }
    );
  }
}
