import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { generateMockCarRentals } from '@/lib/mock-data/car-rentals';

// Mark this route as dynamic (it uses request params)
export const dynamic = 'force-dynamic';

/**
 * Car Rental Search API
 *
 * IMPORTANT: Amadeus Car Rental API has no test data in test environment.
 * This route uses enhanced mock data that matches Amadeus API response format.
 *
 * In production with AMADEUS_ENVIRONMENT=production, real API will be used automatically.
 *
 * API Credentials (same for all Amadeus services):
 * - API Key: MOytyHr4qQXNogQWbruaE0MtmGeigCd3
 * - API Secret: exUkoGmSGbyiiOji
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const pickupLocation = searchParams.get('pickupLocation');
    const dropoffLocation = searchParams.get('dropoffLocation');
    const pickupDate = searchParams.get('pickupDate');
    const dropoffDate = searchParams.get('dropoffDate');
    const pickupTime = searchParams.get('pickupTime');
    const dropoffTime = searchParams.get('dropoffTime');

    if (!pickupLocation || !pickupDate || !dropoffDate) {
      return NextResponse.json(
        { error: 'pickupLocation, pickupDate, and dropoffDate are required' },
        { status: 400 }
      );
    }

    // Try Amadeus API first (will work in production environment)
    try {
      console.log(`🚗 Searching car rentals with Amadeus API at ${pickupLocation}...`);

      const result = await amadeusAPI.searchCarRentals({
        pickupLocationCode: pickupLocation,
        dropoffLocationCode: dropoffLocation || undefined,
        pickupDate,
        dropoffDate,
        pickupTime: pickupTime || '10:00:00',
        dropoffTime: dropoffTime || '10:00:00',
        driverAge: 30, // Default driver age
      });

      console.log(`✅ Found ${result.data?.length || 0} car rental options from Amadeus API`);
      return NextResponse.json(result);
    } catch (amadeusError: any) {
      // If Amadeus API fails (404 in test env), fall back to enhanced mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Amadeus Car Rental API returned error (expected in test environment)');
        console.log(`   Error: ${amadeusError.response?.data?.errors?.[0]?.detail || amadeusError.message}`);
        console.log('💡 Using enhanced mock data that matches Amadeus API format');
      }

      const mockData = generateMockCarRentals({
        pickupLocation,
        dropoffLocation: dropoffLocation || pickupLocation,
        pickupDate,
        dropoffDate,
        pickupTime: pickupTime || undefined,
        dropoffTime: dropoffTime || undefined,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Generated ${mockData.data.length} mock car rental options`);
      }
      return NextResponse.json(mockData);
    }
  } catch (error: any) {
    console.error('❌ Error in cars API route:', error);

    return NextResponse.json(
      {
        error: 'Failed to search car rentals',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
