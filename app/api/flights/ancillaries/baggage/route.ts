import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';

/**
 * GET /api/flights/ancillaries/baggage
 * Get real-time baggage pricing from Duffel API
 *
 * Query Parameters:
 * - offerId: The Duffel offer ID
 *
 * Returns:
 * - Baggage options with real pricing from the airline
 * - Weight limits (23kg, 32kg, etc.)
 * - Per-segment and per-passenger pricing
 * - Quantity selectors (min/max)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');

    if (!offerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: offerId'
        },
        { status: 400 }
      );
    }

    console.log(`🧳 Fetching real-time baggage pricing for offer: ${offerId}`);

    // Fetch baggage options from Duffel API
    const baggageResult = await duffelAPI.getBaggageOptions(offerId);

    if (!baggageResult.success) {
      console.warn(`⚠️  Failed to fetch Duffel baggage: ${baggageResult.error}`);

      // Return mock data as fallback
      return NextResponse.json({
        success: true,
        data: getMockBaggageOptions(),
        meta: {
          source: 'mock',
          note: 'Real Duffel API unavailable, using mock data',
          error: baggageResult.error,
        },
      }, { status: 200 });
    }

    console.log(`✅ Found ${baggageResult.data.length} real baggage options from Duffel`);

    return NextResponse.json({
      success: true,
      data: baggageResult.data,
      meta: {
        source: 'duffel',
        offerId: offerId,
        totalOptions: baggageResult.data.length,
        currency: baggageResult.meta?.currency || 'USD',
      },
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('❌ Error in baggage API route:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch baggage options',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Mock baggage options for fallback
 */
function getMockBaggageOptions() {
  return [
    {
      id: 'mock-bag-1',
      type: 'checked',
      name: 'Checked Bag (23kg)',
      description: 'Standard checked baggage up to 23kg',
      weight: {
        value: 23,
        unit: 'kg',
      },
      price: {
        amount: '35.00',
        currency: 'USD',
      },
      quantity: {
        min: 0,
        max: 3,
      },
      segmentIds: [],
      passengerIds: [],
      metadata: {
        isMock: true,
      },
    },
    {
      id: 'mock-bag-2',
      type: 'checked',
      name: 'Heavy Bag (32kg)',
      description: 'Heavy checked baggage up to 32kg',
      weight: {
        value: 32,
        unit: 'kg',
      },
      price: {
        amount: '55.00',
        currency: 'USD',
      },
      quantity: {
        min: 0,
        max: 2,
      },
      segmentIds: [],
      passengerIds: [],
      metadata: {
        isMock: true,
      },
    },
    {
      id: 'mock-bag-3',
      type: 'carry_on',
      name: 'Extra Carry-On',
      description: 'Additional carry-on bag',
      weight: {
        value: 10,
        unit: 'kg',
      },
      price: {
        amount: '15.00',
        currency: 'USD',
      },
      quantity: {
        min: 0,
        max: 1,
      },
      segmentIds: [],
      passengerIds: [],
      metadata: {
        isMock: true,
      },
    },
  ];
}

export const runtime = 'nodejs';
