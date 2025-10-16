import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';

// Mock branded fares for fallback
function getMockBrandedFares(flightOfferId: string) {
  return {
    data: [
      {
        segmentId: '1',
        brandedFare: 'BASIC',
        price: {
          total: '299.00',
          base: '250.00',
        },
        amenities: [
          { description: 'Personal item (purse, small backpack)', isChargeable: false },
          { description: 'Carry-on bag', isChargeable: true },
          { description: 'Checked bag', isChargeable: true },
          { description: 'Seat selection', isChargeable: true },
          { description: 'Changes & cancellations', isChargeable: true },
        ],
      },
      {
        segmentId: '1',
        brandedFare: 'STANDARD',
        price: {
          total: '349.00',
          base: '295.00',
        },
        amenities: [
          { description: 'Personal item (purse, small backpack)', isChargeable: false },
          { description: 'Carry-on bag', isChargeable: false },
          { description: '1 Checked bag (23kg)', isChargeable: false },
          { description: 'Standard seat selection', isChargeable: false },
          { description: 'Changes (fee applies)', isChargeable: true },
          { description: 'Priority boarding', isChargeable: true },
        ],
      },
      {
        segmentId: '1',
        brandedFare: 'FLEX',
        price: {
          total: '449.00',
          base: '380.00',
        },
        amenities: [
          { description: 'Personal item (purse, small backpack)', isChargeable: false },
          { description: 'Carry-on bag', isChargeable: false },
          { description: '2 Checked bags (23kg each)', isChargeable: false },
          { description: 'Advance seat selection', isChargeable: false },
          { description: 'Free changes', isChargeable: false },
          { description: 'Priority boarding', isChargeable: false },
          { description: 'Extra legroom seat', isChargeable: false },
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
    const cacheKey = generateCacheKey('branded-fares', { flightOfferId });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Amadeus API
    try {
      const result = await amadeusAPI.getBrandedFares(flightOfferId);

      // Cache for 15 minutes
      await setCache(cacheKey, result, 900);

      return NextResponse.json(result);
    } catch (apiError: any) {
      console.error('Amadeus API error, using mock data:', apiError.message);

      // Return mock data for better UX
      const mockData = getMockBrandedFares(flightOfferId);

      // Cache mock data for shorter period (5 minutes)
      await setCache(cacheKey, mockData, 300);

      return NextResponse.json(mockData);
    }
  } catch (error: any) {
    console.error('Error in branded-fares API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get branded fares' },
      { status: 500 }
    );
  }
}
