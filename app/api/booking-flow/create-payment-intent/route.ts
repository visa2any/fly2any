import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/payment-service';

/**
 * Create Payment Intent for Booking Flow
 *
 * Integrates with E2E conversational booking flow
 * Creates Stripe payment intent for the booking session
 *
 * POST /api/booking-flow/create-payment-intent
 *
 * Request Body:
 * {
 *   bookingState: BookingState,
 *   passengers: PassengerInfo[]
 * }
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingState, passengers } = body;

    console.log('💳 [Booking Flow] Creating payment intent...');
    console.log(`   Flight: ${bookingState.selectedFlight?.airline} ${bookingState.selectedFlight?.flightNumber}`);
    console.log(`   Passengers: ${passengers?.length || 0}`);
    console.log(`   Total: ${bookingState.pricing?.total} ${bookingState.pricing?.currency}`);

    // Validation
    if (!bookingState || !bookingState.pricing) {
      return NextResponse.json(
        {
          error: 'INVALID_BOOKING_STATE',
          message: 'Booking state with pricing is required'
        },
        { status: 400 }
      );
    }

    if (!passengers || passengers.length === 0) {
      return NextResponse.json(
        {
          error: 'INVALID_PASSENGERS',
          message: 'At least one passenger is required'
        },
        { status: 400 }
      );
    }

    const { pricing, selectedFlight, id: bookingId } = bookingState;
    const primaryPassenger = passengers[0];

    // Validate pricing
    if (!pricing.total || pricing.total <= 0) {
      return NextResponse.json(
        {
          error: 'INVALID_AMOUNT',
          message: 'Total amount must be greater than 0'
        },
        { status: 400 }
      );
    }

    // Validate primary passenger
    if (!primaryPassenger?.email || !primaryPassenger?.firstName || !primaryPassenger?.lastName) {
      return NextResponse.json(
        {
          error: 'INVALID_PASSENGER_INFO',
          message: 'Primary passenger email and name are required'
        },
        { status: 400 }
      );
    }

    // Check if payment service is available
    if (!paymentService.isStripeAvailable()) {
      console.warn('⚠️  Stripe not available - using mock mode');

      // Return mock payment intent for development/testing
      return NextResponse.json(
        {
          success: true,
          paymentIntent: {
            paymentIntentId: `pi_mock_${Date.now()}`,
            clientSecret: `pi_mock_${Date.now()}_secret_mock`,
            amount: pricing.total,
            currency: pricing.currency,
            status: 'requires_payment_method',
          },
          mock: true,
          warning: 'Using mock payment intent - Stripe not configured',
        },
        { status: 201 }
      );
    }

    // Generate booking reference if not exists
    const bookingReference = `FLY2A-${bookingId?.substring(0, 8).toUpperCase() || Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Create description
    const passengerCount = passengers.length;
    const passengerText = passengerCount === 1 ? '1 passenger' : `${passengerCount} passengers`;
    const description = `Flight ${selectedFlight?.airline} ${selectedFlight?.flightNumber} - ${passengerText}`;

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: pricing.total,
      currency: pricing.currency || 'USD',
      bookingReference,
      customerEmail: primaryPassenger.email,
      customerName: `${primaryPassenger.firstName} ${primaryPassenger.lastName}`,
      description,
      metadata: {
        bookingId: bookingId || 'unknown',
        flightId: selectedFlight?.id || 'unknown',
        airline: selectedFlight?.airline || 'unknown',
        passengerCount: passengerCount.toString(),
        baseFare: pricing.baseFare?.toString() || '0',
        taxes: pricing.taxes?.toString() || '0',
        seatFees: pricing.seatFees?.toString() || '0',
        baggageFees: pricing.baggageFees?.toString() || '0',
      },
    });

    console.log('✅ [Booking Flow] Payment intent created successfully');
    console.log(`   Payment Intent ID: ${paymentIntent.paymentIntentId}`);
    console.log(`   Booking Reference: ${bookingReference}`);

    return NextResponse.json(
      {
        success: true,
        paymentIntent,
        bookingReference,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ [Booking Flow] Payment intent creation error:', error);

    return NextResponse.json(
      {
        error: 'PAYMENT_INTENT_CREATION_FAILED',
        message: error.message || 'Failed to create payment intent',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
