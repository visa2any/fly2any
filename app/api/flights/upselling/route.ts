import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

/**
 * POST /api/flights/upselling
 * Get all fare families for a flight offer (Basic → Standard → Flex → Business)
 *
 * This endpoint takes a single flight offer and returns ALL available fare types
 * sorted from cheapest to most expensive, allowing users to upgrade their fare.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightOffer } = body;

    if (!flightOffer) {
      return NextResponse.json(
        { error: 'Missing required parameter: flightOffer' },
        { status: 400 }
      );
    }

    console.log(`🎫 Getting fare families for flight ${flightOffer.id}...`);

    // Call Amadeus Upselling API
    const response = await amadeusAPI.getUpsellingFares(flightOffer);

    const fareOptions = response.data || [];

    // Sort fare options by price (cheapest first)
    const sortedFares = fareOptions.sort((a: any, b: any) => {
      const priceA = parseFloat(a.price?.total || '0');
      const priceB = parseFloat(b.price?.total || '0');
      return priceA - priceB;
    });

    console.log(`✅ Returning ${sortedFares.length} fare families`);

    return NextResponse.json(
      {
        success: true,
        fareOptions: sortedFares,
        meta: {
          count: sortedFares.length,
          currency: sortedFares[0]?.price?.currency || 'USD',
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Error getting fare families:', error);

    // Handle specific error cases
    if (error.message?.includes('not available')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fare families not available for this flight',
          fareOptions: [],
        },
        { status: 200 } // Return 200 with empty array instead of error
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get fare families',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
