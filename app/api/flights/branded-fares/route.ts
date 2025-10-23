import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

export async function POST(request: NextRequest) {
  try {
    const { flightOfferId } = await request.json();

    if (!flightOfferId) {
      return NextResponse.json(
        { error: 'Flight offer ID is required' },
        { status: 400 }
      );
    }

    console.log('💎 Fetching branded fares for flight:', flightOfferId);

    const brandedFaresData = await amadeusAPI.getBrandedFares(flightOfferId);

    console.log('✅ Successfully fetched branded fares');

    return NextResponse.json(brandedFaresData);
  } catch (error: any) {
    console.error('❌ Error fetching branded fares:', error);

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
