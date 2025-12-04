import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { applyFlightMarkup } from '@/lib/config/flight-markup';

/**
 * POST /api/flights/upselling
 * Get all fare families for a flight offer (Basic → Standard → Flex → Business)
 *
 * This endpoint takes a single flight offer and returns ALL available fare types
 * sorted from cheapest to most expensive, allowing users to upgrade their fare.
 *
 * IMPORTANT: All prices include our markup (same rules as flight search)
 * - MAX($22 minimum, 7% of price), capped at $200
 * - This ensures consistent pricing across the booking flow
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

    // ============================================================================
    // 💰 APPLY MARKUP TO ALL FARE FAMILY PRICES
    // ============================================================================
    // Same markup strategy as flight search:
    // - MAX($22 minimum, 7% of price), capped at $200
    // - Consolidator flights: No markup (commission-based) - but upselling doesn't apply to consolidator
    // ============================================================================
    console.log('💰 Applying markup to fare family prices...');

    const markedUpFares = fareOptions.map((fare: any) => {
      const netPrice = parseFloat(String(fare.price?.total || '0'));
      const source = fare.source?.toLowerCase() || flightOffer.source?.toLowerCase() || 'unknown';

      // Skip markup for consolidator flights (they have built-in commission)
      if (source === 'consolidator') {
        console.log(`  ✓ Fare ${fare.id}: $${netPrice.toFixed(2)} (Consolidator - no markup)`);
        return fare;
      }

      // Apply markup using the same flight markup config
      const markupResult = applyFlightMarkup(netPrice);

      // Update fare price with customer-facing price (including markup)
      const markedUpFare = {
        ...fare,
        price: {
          ...fare.price,
          total: markupResult.customerPrice.toString(),
          grandTotal: markupResult.customerPrice.toString(),
          // Store net price internally for debugging
          _netPrice: netPrice.toString(),
          _markupAmount: markupResult.markupAmount.toString(),
          _markupPercentage: markupResult.markupPercentage,
        },
        // Update traveler pricing if exists
        travelerPricings: fare.travelerPricings?.map((tp: any) => ({
          ...tp,
          price: {
            ...tp.price,
            total: markupResult.customerPrice.toString(),
          },
        })),
      };

      console.log(`  ✓ Fare ${fare.id?.slice(-8) || 'unknown'}: $${netPrice.toFixed(2)} → $${markupResult.customerPrice.toFixed(2)} (+$${markupResult.markupAmount.toFixed(2)} / ${markupResult.markupPercentage}%)`);

      return markedUpFare;
    });

    // Sort fare options by price (cheapest first) - using marked up prices
    const sortedFares = markedUpFares.sort((a: any, b: any) => {
      const priceA = parseFloat(a.price?.total || '0');
      const priceB = parseFloat(b.price?.total || '0');
      return priceA - priceB;
    });

    console.log(`✅ Returning ${sortedFares.length} fare families (with markup applied)`);

    return NextResponse.json(
      {
        success: true,
        fareOptions: sortedFares,
        meta: {
          count: sortedFares.length,
          currency: sortedFares[0]?.price?.currency || 'USD',
          markupApplied: true,
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
