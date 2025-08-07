/**
 * 💳 STRIPE PAYMENT INTENT CREATION
 * Creates a payment intent for flight booking
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe (in production, use environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  console.log('💳 Creating payment intent for flight booking');
  
  try {
    const body = await request.json();
    const { 
      amount, 
      currency = 'usd', 
      flightId, 
      bookingReference,
      passengerInfo,
      services 
    } = body;

    // Validate required fields
    if (!amount || !flightId || !bookingReference) {
      return NextResponse.json({
        success: false,
        error: 'Missing required payment information'
      }, { status: 400 });
    }

    // Calculate service fees
    const serviceCharges = calculateServiceCharges(services);
    const totalAmount = Math.round((amount + serviceCharges) * 100); // Convert to cents

    console.log('💰 Payment details:', {
      baseAmount: amount,
      serviceCharges,
      totalAmount: totalAmount / 100,
      currency,
      flightId,
      bookingReference
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        flightId,
        bookingReference,
        passengerEmail: passengerInfo?.email || '',
        passengerName: `${passengerInfo?.firstName || ''} ${passengerInfo?.lastName || ''}`.trim(),
        services: JSON.stringify(services),
        bookingType: 'flight'
      },
      description: `Flight booking: ${bookingReference}`,
      receipt_email: passengerInfo?.email,
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount / 100,
        currency: currency.toUpperCase()
      }
    });

  } catch (error) {
    console.error('❌ Payment intent creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing error'
    }, { status: 500 });
  }
}

/**
 * Calculate additional service charges
 */
function calculateServiceCharges(services: any) {
  let charges = 0;
  
  if (services?.seatSelection) charges += 25;
  if (services?.baggage) charges += 50;
  if (services?.insurance) charges += 35;
  // Meals are free
  
  return charges;
}

/**
 * GET endpoint to retrieve payment intent status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment intent ID required'
      }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        metadata: paymentIntent.metadata
      }
    });

  } catch (error) {
    console.error('❌ Payment intent retrieval error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment retrieval error'
    }, { status: 500 });
  }
}