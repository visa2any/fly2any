import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    const travelers = searchParams.get('travelers');

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'origin, destination, and departureDate are required' },
        { status: 400 }
      );
    }

    // Mock package data (replace with actual API integration)
    const packages = [
      {
        id: '1',
        name: 'Paradise Getaway',
        destination,
        price: 1299,
        duration: '7 days / 6 nights',
        includes: ['Round-trip flights', '5-star hotel', 'Daily breakfast', 'Airport transfers'],
        rating: 4.8,
        savings: 450,
      },
      {
        id: '2',
        name: 'Adventure Package',
        destination,
        price: 899,
        duration: '5 days / 4 nights',
        includes: ['Flights', '4-star hotel', 'Car rental', 'City tour'],
        rating: 4.5,
        savings: 320,
      },
    ];

    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error('Error in packages API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search packages' },
      { status: 500 }
    );
  }
}
