import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';

export const dynamic = 'force-dynamic';

// Mock seat map for fallback
function getMockSeatMap(flightOfferId: string) {
  const rows = 30;
  const seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats = [];

  for (let row = 1; row <= rows; row++) {
    for (const letter of seatsPerRow) {
      const seatNumber = `${row}${letter}`;
      const isExitRow = row === 10 || row === 20;
      const isWindow = letter === 'A' || letter === 'F';
      const isAisle = letter === 'C' || letter === 'D';
      const isPremium = row <= 5 || isExitRow;

      // Randomize availability (70% available)
      const available = Math.random() > 0.3;

      const characteristics = [];
      if (isWindow) characteristics.push('WINDOW');
      if (isAisle) characteristics.push('AISLE');
      if (isExitRow) characteristics.push('EXIT_ROW');
      if (isPremium) characteristics.push('EXTRA_LEGROOM');

      seats.push({
        number: seatNumber,
        available,
        price: isPremium && available ? (isExitRow ? 35 : 25) : 0,
        characteristics,
      });
    }
  }

  return {
    data: [
      {
        type: 'seatmap',
        flightOfferId,
        segmentId: '1',
        carrierCode: 'AA',
        number: '100',
        aircraft: { code: '738' },
        departure: { iataCode: 'JFK' },
        arrival: { iataCode: 'LAX' },
        decks: [
          {
            deckType: 'MAIN',
            deckConfiguration: {
              width: 6,
              length: rows,
              exitRowsX: [10, 20],
            },
            seats,
          },
        ],
      },
    ],
  };
}

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
    const cacheKey = generateCacheKey('seatmap', { flightOfferId });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Amadeus API
    try {
      const result = await amadeusAPI.getSeatMap(flightOfferId);

      // Cache for 5 minutes (seat availability changes frequently)
      await setCache(cacheKey, result, 300);

      return NextResponse.json(result);
    } catch (apiError: any) {
      console.error('Amadeus API error, using mock seat map:', apiError.message);

      // Return mock data for better UX
      const mockData = getMockSeatMap(flightOfferId);

      // Cache mock data for shorter period (2 minutes)
      await setCache(cacheKey, mockData, 120);

      return NextResponse.json(mockData);
    }
  } catch (error: any) {
    console.error('Error in seatmaps API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get seat map' },
      { status: 500 }
    );
  }
}
