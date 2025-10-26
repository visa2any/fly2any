import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius') || '5';

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    console.log('🎢 Fetching points of interest:', { latitude, longitude, radius });

    const poiData = await amadeusAPI.getPointsOfInterest({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius, 10),
    });

    console.log('✅ Successfully fetched POI');

    return NextResponse.json(poiData);
  } catch (error: any) {
    console.error('❌ Error fetching POI:', error);

    // Return empty data instead of error to allow graceful fallback
    return NextResponse.json(
      {
        data: [],
        meta: { hasRealData: false }
      },
      { status: 200 } // Return 200 so component can handle gracefully
    );
  }
}
