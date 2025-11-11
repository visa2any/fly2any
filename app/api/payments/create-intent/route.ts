import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/payment-service';
import { bookingStorage } from '@/lib/bookings/storage';
import { validatePaymentAmount, checkDuplicatePayment } from '@/lib/payments/validation';
import { mapStripeError } from '@/lib/payments/error-handler';

/**
 * Create Payment Intent API
 *
 * Creates a Stripe payment intent for processing flight booking payments
 *
 * POST /api/payments/create-intent
 *
 * Request Body:
 * {
 *   amount: number,           // Total amount in currency units (e.g., 299.99)
 *   currency: string,         // Currency code (e.g., "USD")
 *   bookingId: string,        // Booking ID from database
 *   bookingReference: string, // Booking reference number
 *   customerEmail: string,    // Customer email for receipt
 *   customerName: string,     // Customer name
 *   description: string,      // Payment description
 *   metadata?: object         // Additional metadata
 * }
 *
 * Response:
 * {
 *   success: true,
 *   paymentIntent: {
 *     paymentIntentId: string,
 *     clientSecret: string,    // Use this to confirm payment on client
 *     amount: number,
 *     currency: string,
 *     status: string
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const {
      amount,
      currency,
      bookingId,
      bookingReference,
      customerEmail,
      customerName,
      description,
      metadata,
    } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_AMOUNT',
          message: 'Amount must be greater than 0'
        },
        { status: 400 }
      );
    }

    if (!currency) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_CURRENCY',
          message: 'Currency is required'
        },
        { status: 400 }
      );
    }

    if (!bookingId && !bookingReference) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_BOOKING',
          message: 'Either bookingId or bookingReference is required'
        },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_EMAIL',
          message: 'Customer email is required'
        },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_NAME',
          message: 'Customer name is required'
        },
        { status: 400 }
      );
    }

    // Retrieve booking from database
    console.log(`🔍 Retrieving booking: ${bookingId || bookingReference}`);
    let booking;

    if (bookingId) {
      booking = await bookingStorage.findById(bookingId);
    } else if (bookingReference) {
      booking = await bookingStorage.findByReferenceAsync(bookingReference);
    }

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
        { status: 404 }
      );
    }

    // Check for duplicate payment
    const duplicateCheck = await checkDuplicatePayment(booking);
    if (!duplicateCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'DUPLICATE_PAYMENT',
          message: duplicateCheck.error || 'Payment already exists for this booking',
        },
        { status: 400 }
      );
    }

    // Validate payment amount matches booking total
    const validationResult = validatePaymentAmount(amount, booking);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'AMOUNT_MISMATCH',
          message: validationResult.error || 'Payment amount does not match booking total',
          details: {
            providedAmount: amount,
            expectedAmount: booking.payment.amount,
          },
        },
        { status: 400 }
      );
    }

    console.log('💳 Creating payment intent...');
    console.log(`   Amount: ${amount} ${currency}`);
    console.log(`   Booking: ${booking.bookingReference}`);
    console.log(`   Customer: ${customerEmail}`);

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency,
      bookingReference: booking.bookingReference,
      customerEmail,
      customerName,
      description: description || `Flight booking ${booking.bookingReference}`,
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        ...metadata,
      },
    });

    // Update booking with payment intent details
    await bookingStorage.update(booking.id, {
      payment: {
        ...booking.payment,
        paymentIntentId: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        status: 'pending',
      },
    });

    const duration = Date.now() - startTime;
    console.log('✅ Payment intent created successfully');
    console.log(`   Payment Intent ID: ${paymentIntent.paymentIntentId}`);
    console.log(`   Processing time: ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        data: {
          paymentIntent,
          bookingReference: booking.bookingReference,
        },
        meta: {
          timestamp: new Date().toISOString(),
          processingTime: duration,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Create payment intent error:', error);
    console.error(`   Processing time: ${duration}ms`);

    // Map Stripe errors to user-friendly messages
    const mappedError = mapStripeError(error);

    return NextResponse.json(
      {
        success: false,
        error: mappedError.code,
        message: mappedError.message,
        type: mappedError.type,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        meta: {
          timestamp: new Date().toISOString(),
          processingTime: duration,
        },
      },
      { status: mappedError.statusCode || 500 }
    );
  }
}

// OPTIONS handler for CORS
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
