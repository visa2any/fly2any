import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

/**
 * POST /api/flights/fare-rules
 *
 * Fetches detailed fare rules (refund policies, change fees, etc.) from Amadeus API
 *
 * Request body:
 * {
 *   flightOffer: object // The flight offer object from search results
 * }
 *
 * Response:
 * {
 *   data: {
 *     fareRules: {
 *       rules: [
 *         { category: "REFUNDS", maxPenaltyAmount: "150.00", ... },
 *         { category: "EXCHANGE", maxPenaltyAmount: "75.00", ... }
 *       ]
 *     }
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { flightOffer } = await request.json();

    if (!flightOffer) {
      return NextResponse.json(
        { error: 'Flight offer is required' },
        { status: 400 }
      );
    }

    console.log('📋 Fetching detailed fare rules for flight:', flightOffer.id);

    // Fetch detailed fare rules from Amadeus
    const fareRulesData = await amadeusAPI.getDetailedFareRules([flightOffer]);

    console.log('✅ Successfully fetched fare rules');

    return NextResponse.json(fareRulesData);
  } catch (error: any) {
    console.error('❌ Error fetching fare rules:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch fare rules',
        details: error.message,
        // Return empty rules so component can fallback to generic estimates
        data: {
          fareRules: {
            rules: []
          }
        }
      },
      { status: 500 }
    );
  }
}
