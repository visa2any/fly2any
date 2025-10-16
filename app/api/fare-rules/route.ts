import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import {
  parseFareRules,
  formatFareRulesSummary,
  getFareClassName,
  getRuleSeverity,
} from '@/lib/utils/fareRuleParsers';

/**
 * GET /api/fare-rules?flightOfferId=ABC123
 *
 * Fetches detailed fare rules for a specific flight offer
 * Returns refund policies, change fees, penalties, restrictions
 *
 * CRITICAL for DOT legal compliance - must show before booking
 */
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

    console.log(`📋 Fetching fare rules for flight offer: ${flightOfferId}`);

    // Note: In production, you'd reconstruct the full flight offer from your database/cache
    // For now, we'll use a minimal structure to get fare rules
    const flightOffer = {
      id: flightOfferId,
      // Amadeus needs the full offer structure, but for pricing endpoint
      // we can pass minimal data and it will enrich it
    };

    // Call Amadeus API to get detailed fare rules
    const fareRulesData = await amadeusAPI.getDetailedFareRules([flightOffer]);

    // Parse and structure the response for frontend consumption
    const parsedRules = parseFareRules(fareRulesData);

    // Generate additional helpful metadata for UI
    const fareClassName = getFareClassName(parsedRules);
    const ruleSeverity = getRuleSeverity(parsedRules);
    const summary = formatFareRulesSummary(parsedRules);

    console.log('✅ Successfully fetched and parsed fare rules');
    console.log(`   Fare class: ${fareClassName}, Severity: ${ruleSeverity}`);

    return NextResponse.json({
      success: true,
      data: {
        ...parsedRules,
        fareClassName,
        severity: ruleSeverity,
        summary,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error in fare-rules API:', error);

    // Return structured error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get fare rules',
        details: error.response?.data || null,
      },
      { status: 500 }
    );
  }
}
