import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const destination = searchParams.get('destination');
    const tripCost = searchParams.get('tripCost');
    const departureDate = searchParams.get('departureDate');
    const returnDate = searchParams.get('returnDate');

    if (!destination || !tripCost || !departureDate || !returnDate) {
      return NextResponse.json(
        { error: 'destination, tripCost, departureDate, and returnDate are required' },
        { status: 400 }
      );
    }

    const cost = parseInt(tripCost);

    // Mock insurance plans (replace with actual API integration like Squaremouth, InsureMyTrip)
    const plans = [
      {
        id: '1',
        name: 'Basic Protection',
        provider: 'TravelSafe',
        price: Math.round(cost * 0.05),
        coverage: {
          'Trip Cancellation': `Up to $${cost}`,
          'Medical Emergency': '$50,000',
          'Baggage Loss': '$1,000',
          'Travel Delay': '$500',
        },
        features: ['24/7 assistance', 'Cancel for any reason', 'COVID-19 coverage'],
        rating: 4.5,
      },
      {
        id: '2',
        name: 'Standard Coverage',
        provider: 'SecureTrip',
        price: Math.round(cost * 0.08),
        coverage: {
          'Trip Cancellation': `Up to $${cost}`,
          'Medical Emergency': '$100,000',
          'Emergency Evacuation': '$250,000',
          'Baggage Loss': '$2,500',
          'Travel Delay': '$1,000',
        },
        features: ['24/7 assistance', 'Cancel for any reason', 'COVID-19 coverage', 'Adventure sports', 'Rental car damage'],
        rating: 4.7,
        popular: true,
      },
    ];

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error('Error in insurance API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search insurance plans' },
      { status: 500 }
    );
  }
}
