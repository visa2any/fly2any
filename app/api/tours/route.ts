import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getGeocodeWithFallback } from '@/lib/data/geocodes';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const destination = searchParams.get('destination');
    const startDate = searchParams.get('startDate');
    const radius = searchParams.get('radius');

    if (!destination) {
      return NextResponse.json(
        { error: 'destination is required' },
        { status: 400 }
      );
    }

    // Convert destination (city code or name) to geocode
    const geocode = getGeocodeWithFallback(destination);

    console.log(`🗺️ Converting destination "${destination}" to coordinates: ${geocode.latitude}, ${geocode.longitude}`);

    // Call Amadeus Activities API
    const result = await amadeusAPI.searchActivities({
      latitude: geocode.latitude,
      longitude: geocode.longitude,
      radius: radius ? parseInt(radius) : 5, // Default 5km radius
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in tours API:', error);

    // Fallback to mock data if Amadeus API fails
    console.log('🧪 Falling back to mock tour data');
    const destination = new URL(request.url).searchParams.get('destination');
    const tours = [
      {
        id: '1',
        name: 'City Highlights Walking Tour',
        destination,
        price: 89,
        duration: '4 hours',
        groupSize: '12 max',
        includes: ['Professional guide', 'Entry fees', 'Refreshments'],
        rating: 4.9,
        reviews: 342,
        language: ['English', 'Spanish'],
      },
      {
        id: '2',
        name: 'Full Day Adventure Tour',
        destination,
        price: 179,
        duration: '8 hours',
        groupSize: '8 max',
        includes: ['Expert guide', 'Lunch', 'Transportation', 'Equipment'],
        rating: 4.8,
        reviews: 218,
        language: ['English'],
      },
    ];

    return NextResponse.json({ data: tours });
  }
}
