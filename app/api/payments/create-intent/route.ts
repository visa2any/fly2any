import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/payment-service';

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
  try {
    const body = await request.json();
    const {
      amount,
      currency,
      bookingReference,
      customerEmail,
      customerName,
      description,
      metadata,
    } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!currency) {
      return NextResponse.json(
        { error: 'Invalid currency', message: 'Currency is required' },
        { status: 400 }
      );
    }

    if (!bookingReference) {
      return NextResponse.json(
        { error: 'Invalid booking reference', message: 'Booking reference is required' },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Invalid email', message: 'Customer email is required' },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: 'Invalid name', message: 'Customer name is required' },
        { status: 400 }
      );
    }

    // NOTE: Stripe check removed - payment service now supports TEST MODE
    // If Stripe not configured, it will automatically use test mode

    console.log('💳 Creating payment intent...');
    console.log(`   Amount: ${amount} ${currency}`);
    console.log(`   Booking: ${bookingReference}`);
    console.log(`   Customer: ${customerEmail}`);

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency,
      bookingReference,
      customerEmail,
      customerName,
      description: description || `Flight booking ${bookingReference}`,
      metadata,
    });

    console.log('✅ Payment intent created successfully');
    console.log(`   Payment Intent ID: ${paymentIntent.paymentIntentId}`);

    return NextResponse.json(
      {
        success: true,
        paymentIntent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Create payment intent error:', error);

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
