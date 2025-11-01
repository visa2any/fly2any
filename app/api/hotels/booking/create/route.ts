import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import type { CreateBookingParams } from '@/lib/api/duffel-stays';

/**
 * Hotel Booking Creation API Route
 *
 * POST /api/hotels/booking/create
 *
 * Complete a hotel booking using a quote ID.
 * This charges the payment method and confirms the reservation.
 *
 * CRITICAL: Revenue-generating endpoint
 * - Commission earned on every booking
 * - Average revenue: $150 per booking
 *
 * Workflow:
 * 1. Search accommodations (POST /api/hotels/search)
 * 2. Create quote (POST /api/hotels/quote) - locks price
 * 3. Create booking (THIS ENDPOINT) - completes reservation
 *
 * Request Body:
 * {
 *   quoteId: string;
 *   payment: {
 *     type: 'balance' | 'card';
 *     currency: string;
 *     amount: string;
 *     card?: {
 *       number: string;
 *       expiryMonth: string;
 *       expiryYear: string;
 *       cvc: string;
 *       holderName: string;
 *     };
 *   };
 *   guests: Array<{
 *     title?: 'mr' | 'ms' | 'mrs' | 'miss' | 'dr';
 *     givenName: string;
 *     familyName: string;
 *     bornOn?: string; // YYYY-MM-DD (required for children)
 *     type: 'adult' | 'child';
 *   }>;
 *   email: string;
 *   phoneNumber: string; // E.164 format: +1234567890
 * }
 *
 * Response:
 * {
 *   data: {
 *     id: string;
 *     reference: string; // Confirmation number
 *     status: string;
 *     ...
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    if (!body.quoteId) {
      return NextResponse.json(
        { error: 'Missing required parameter: quoteId' },
        { status: 400 }
      );
    }

    if (!body.payment) {
      return NextResponse.json(
        { error: 'Missing required parameter: payment' },
        { status: 400 }
      );
    }

    if (!body.payment.type || !['balance', 'card'].includes(body.payment.type)) {
      return NextResponse.json(
        { error: 'Invalid payment type. Must be "balance" or "card"' },
        { status: 400 }
      );
    }

    if (!body.payment.amount || !body.payment.currency) {
      return NextResponse.json(
        { error: 'Missing payment.amount or payment.currency' },
        { status: 400 }
      );
    }

    // For card payments, validate card details
    if (body.payment.type === 'card') {
      const { card } = body.payment;
      if (!card?.number || !card?.expiryMonth || !card?.expiryYear || !card?.cvc || !card?.holderName) {
        return NextResponse.json(
          { error: 'Card payment requires: number, expiryMonth, expiryYear, cvc, holderName' },
          { status: 400 }
        );
      }
    }

    if (!body.guests || !Array.isArray(body.guests) || body.guests.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameter: guests (must be non-empty array)' },
        { status: 400 }
      );
    }

    if (!body.email) {
      return NextResponse.json(
        { error: 'Missing required parameter: email' },
        { status: 400 }
      );
    }

    if (!body.phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required parameter: phoneNumber (E.164 format: +1234567890)' },
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

    // Build booking parameters
    const bookingParams: CreateBookingParams = {
      quoteId: body.quoteId,
      payment: body.payment,
      guests: body.guests.map((guest: any) => ({
        title: guest.title || 'mr',
        givenName: guest.givenName,
        familyName: guest.familyName,
        bornOn: guest.bornOn,
        type: guest.type,
      })),
      email: body.email,
      phoneNumber: body.phoneNumber,
    };

    // Create booking using Duffel Stays API
    console.log('🎫 Creating hotel booking...');
    console.log(`   Quote ID: ${bookingParams.quoteId}`);
    console.log(`   Guests: ${bookingParams.guests.length}`);
    console.log(`   Email: ${bookingParams.email}`);
    console.log(`   Payment Type: ${bookingParams.payment.type}`);

    const booking = await duffelStaysAPI.createBooking(bookingParams);

    console.log('✅ Booking created successfully!');
    console.log(`   Booking ID: ${booking.data.id}`);
    console.log(`   Confirmation: ${booking.data.reference}`);
    console.log(`   Status: ${booking.data.status}`);

    // TODO: Store booking in database
    // TODO: Send confirmation email to customer
    // TODO: Track commission for revenue reporting

    return NextResponse.json({
      data: booking.data,
      meta: {
        createdAt: new Date().toISOString(),
      },
    }, {
      status: 201,
    });
  } catch (error: any) {
    console.error('❌ Hotel booking error:', error);

    // Handle specific errors
    if (error.message.includes('QUOTE_EXPIRED')) {
      return NextResponse.json(
        {
          error: 'Quote expired',
          message: 'The quote has expired. Please create a new quote.',
          code: 'QUOTE_EXPIRED',
        },
        { status: 409 }
      );
    }

    if (error.message.includes('PAYMENT_FAILED')) {
      return NextResponse.json(
        {
          error: 'Payment failed',
          message: 'Payment was declined. Please check your payment details.',
          code: 'PAYMENT_FAILED',
        },
        { status: 402 }
      );
    }

    if (error.message.includes('NOT_AVAILABLE')) {
      return NextResponse.json(
        {
          error: 'Not available',
          message: 'This accommodation is no longer available.',
          code: 'NOT_AVAILABLE',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to create booking',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Note: Using Node.js runtime (not edge) because Duffel SDK requires Node.js APIs
// export const runtime = 'edge';
