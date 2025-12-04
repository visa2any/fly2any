import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';

/**
 * POST /api/flights/loyalty
 *
 * Add frequent flyer / loyalty programme accounts to a flight offer.
 * This can unlock:
 * - Discounted fares (up to 20% off)
 * - Additional baggage allowance
 * - Priority boarding
 * - Points accrual
 *
 * Request body:
 * {
 *   offerId: string,
 *   passengerId: string,
 *   loyaltyAccounts: [{ airline_iata_code: string, account_number: string }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, passengerId, loyaltyAccounts } = body;

    // Validation
    if (!offerId) {
      return NextResponse.json(
        { success: false, error: 'offerId is required' },
        { status: 400 }
      );
    }

    if (!passengerId) {
      return NextResponse.json(
        { success: false, error: 'passengerId is required' },
        { status: 400 }
      );
    }

    if (!loyaltyAccounts || !Array.isArray(loyaltyAccounts) || loyaltyAccounts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'loyaltyAccounts array is required' },
        { status: 400 }
      );
    }

    // Validate each loyalty account
    for (const account of loyaltyAccounts) {
      if (!account.airline_iata_code || !account.account_number) {
        return NextResponse.json(
          { success: false, error: 'Each loyalty account must have airline_iata_code and account_number' },
          { status: 400 }
        );
      }

      // Validate airline code format (2 characters)
      if (account.airline_iata_code.length !== 2) {
        return NextResponse.json(
          { success: false, error: `Invalid airline code: ${account.airline_iata_code}. Must be 2 characters.` },
          { status: 400 }
        );
      }
    }

    console.log(`🎖️  Adding loyalty programme for offer: ${offerId}`);
    console.log(`   Passenger: ${passengerId}`);
    console.log(`   Accounts: ${loyaltyAccounts.map((a: any) => a.airline_iata_code).join(', ')}`);

    // Update passenger with loyalty accounts
    const result = await duffelAPI.updateOfferPassengerLoyalty(
      offerId,
      passengerId,
      loyaltyAccounts
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Prepare response
    const response: any = {
      success: true,
      data: {
        passenger: result.data?.passenger,
        priceChanged: result.priceChanged,
      },
      meta: {
        offerId,
        passengerId,
        loyaltyAccountsAdded: loyaltyAccounts.length,
      },
    };

    // Add pricing info if available
    if (result.data?.priceBefore !== undefined) {
      response.data.pricing = {
        before: result.data.priceBefore,
        after: result.data.priceAfter,
        discount: result.data.discount,
        discountPercent: result.data.priceBefore > 0
          ? ((result.data.discount / result.data.priceBefore) * 100).toFixed(1)
          : 0,
      };

      if (result.data.discount > 0) {
        response.message = `Loyalty discount applied! Save $${result.data.discount.toFixed(2)}`;
      } else {
        response.message = 'Loyalty programme linked. Miles will be credited after travel.';
      }
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Error adding loyalty programme:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add loyalty programme',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/flights/loyalty?offerId=xxx
 *
 * Get supported loyalty programmes for an offer.
 * Returns list of airline codes that support loyalty programmes.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');

    if (!offerId) {
      return NextResponse.json(
        { success: false, error: 'offerId query parameter is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Getting supported loyalty programmes for offer: ${offerId}`);

    const result = await duffelAPI.getSupportedLoyaltyProgrammes(offerId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Map airline codes to friendly names (common ones)
    const airlineNames: Record<string, string> = {
      'AA': 'American Airlines AAdvantage',
      'UA': 'United MileagePlus',
      'DL': 'Delta SkyMiles',
      'BA': 'British Airways Executive Club',
      'LH': 'Lufthansa Miles & More',
      'AF': 'Air France Flying Blue',
      'EK': 'Emirates Skywards',
      'QF': 'Qantas Frequent Flyer',
      'SQ': 'Singapore Airlines KrisFlyer',
      'CX': 'Cathay Pacific Asia Miles',
      'NH': 'ANA Mileage Club',
      'AC': 'Air Canada Aeroplan',
      'VS': 'Virgin Atlantic Flying Club',
      'AS': 'Alaska Airlines Mileage Plan',
      'B6': 'JetBlue TrueBlue',
      'WN': 'Southwest Rapid Rewards',
      'F9': 'Frontier FRONTIER Miles',
      'NK': 'Spirit Free Spirit',
      'ZZ': 'Duffel Airways (Test)',
    };

    const supportedProgrammes = result.data.map(code => ({
      airlineCode: code,
      programmeName: airlineNames[code] || `${code} Loyalty Programme`,
    }));

    return NextResponse.json({
      success: true,
      data: supportedProgrammes,
      meta: {
        offerId,
        count: supportedProgrammes.length,
        note: supportedProgrammes.length > 0
          ? 'Add your frequent flyer number to earn miles and unlock potential discounts.'
          : 'This flight does not support loyalty programmes through our system.',
      },
    });

  } catch (error: any) {
    console.error('❌ Error getting supported loyalty programmes:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get supported loyalty programmes',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
