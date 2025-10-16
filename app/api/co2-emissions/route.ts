import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightOffers } = body;

    if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
      return NextResponse.json(
        { error: 'Flight offers array is required' },
        { status: 400 }
      );
    }

    // Call Amadeus CO2 API
    const result = await amadeusAPI.getCO2Emissions(flightOffers);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in co2-emissions API:', error);
    // Return empty emissions if API fails (graceful degradation)
    return NextResponse.json({ data: [] });
  }
}
