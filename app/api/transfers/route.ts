import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

export async function POST(request: NextRequest) {
  try {
    const { startLocationCode, endAddressLine, transferType, startDateTime, passengers } = await request.json();

    if (!startLocationCode || !endAddressLine) {
      return NextResponse.json(
        { error: 'Start location code and end address are required' },
        { status: 400 }
      );
    }

    console.log('🚗 Fetching airport transfers:', { startLocationCode, endAddressLine });

    const transfersData = await amadeusAPI.searchTransfers({
      startLocationCode,
      endAddressLine,
      transferType: transferType || 'PRIVATE',
      startDateTime: startDateTime || new Date().toISOString(),
      passengers: passengers || 1,
    });

    console.log('✅ Successfully fetched transfers');

    return NextResponse.json(transfersData);
  } catch (error: any) {
    console.error('❌ Error fetching transfers:', error);

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
