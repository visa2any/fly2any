import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import type { CreateQuoteParams } from '@/lib/api/duffel-stays';

/**
 * Hotel Quote API Route
 *
 * POST /api/hotels/quote
 *
 * Create a booking quote for a hotel rate.
 * This locks in the price for a limited time (typically 15-30 minutes).
 *
 * CRITICAL: Always create a quote before booking to ensure:
 * - Current pricing (rates can change)
 * - Availability confirmation
 * - Terms and conditions
 *
 * Request Body:
 * {
 *   rateId: string;
 *   guests: Array<{
 *     title?: 'mr' | 'ms' | 'mrs' | 'miss' | 'dr';
 *     givenName: string;
 *     familyName: string;
 *     bornOn?: string; // YYYY-MM-DD (required for children)
 *     type: 'adult' | 'child';
 *   }>;
 * }
 *
 * Response:
 * {
 *   data: {
 *     id: string;
 *     total_amount: string;
 *     total_currency: string;
 *     expires_at: string; // ISO timestamp
 *     ...
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    if (!body.rateId) {
      return NextResponse.json(
        { error: 'Missing required parameter: rateId' },
        { status: 400 }
      );
    }

    if (!body.guests || !Array.isArray(body.guests) || body.guests.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameter: guests (must be non-empty array)' },
        { status: 400 }
      );
    }

    // Validate guest details
    for (const guest of body.guests) {
      if (!guest.givenName || !guest.familyName) {
        return NextResponse.json(
          { error: 'Each guest must have givenName and familyName' },
          { status: 400 }
        );
      }

      if (!guest.type || !['adult', 'child'].includes(guest.type)) {
        return NextResponse.json(
          { error: 'Each guest must have type: "adult" or "child"' },
          { status: 400 }
        );
      }

      // Children must have date of birth
      if (guest.type === 'child' && !guest.bornOn) {
        return NextResponse.json(
          { error: 'Child guests must have bornOn (YYYY-MM-DD)' },
          { status: 400 }
        );
      }
    }

    // Build quote parameters
    const quoteParams: CreateQuoteParams = {
      rateId: body.rateId,
      guests: body.guests.map((guest: any) => ({
        title: guest.title || 'mr',
        givenName: guest.givenName,
        familyName: guest.familyName,
        bornOn: guest.bornOn,
        type: guest.type,
      })),
    };

    // Create quote using Duffel Stays API
    console.log('💰 Creating hotel quote...');
    console.log(`   Rate ID: ${quoteParams.rateId}`);
    console.log(`   Guests: ${quoteParams.guests.length}`);

    const quote = await duffelStaysAPI.createQuote(quoteParams);

    console.log('✅ Quote created successfully!');
    console.log(`   Quote ID: ${quote.data.id}`);
    console.log(`   Total: ${quote.data.total_amount} ${quote.data.total_currency}`);
    console.log(`   Expires: ${(quote.data as any).expires_at || 'N/A'}`);

    return NextResponse.json({
      data: quote.data,
      meta: {
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Hotel quote error:', error);

    // Handle specific errors
    if (error.message.includes('RATE_NOT_AVAILABLE')) {
      return NextResponse.json(
        {
          error: 'Rate not available',
          message: 'This rate is no longer available. Please search again.',
          code: 'RATE_NOT_AVAILABLE',
        },
        { status: 409 }
      );
    }

    if (error.message.includes('PRICE_CHANGED')) {
      return NextResponse.json(
        {
          error: 'Price changed',
          message: 'The price has changed. Please review the new price.',
          code: 'PRICE_CHANGED',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to create quote',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
