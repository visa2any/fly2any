/**
 * 🚫 BOOKING CANCELLATION API
 * Handles flight booking cancellations and refunds
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getBookingByReference, updateBookingStatus, storeCancellationRequest } from '@/lib/database/bookings';
import { getCancellationPolicy } from '@/lib/flights/booking-utils';
import { sendCancellationConfirmationEmail } from '@/lib/email/booking-confirmation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  console.log('🚫 Processing booking cancellation request');
  
  try {
    const body = await request.json();
    const { bookingReference, cancellationReason } = body;

    // Validate required fields
    if (!bookingReference) {
      return NextResponse.json({
        success: false,
        error: 'Booking reference is required'
      }, { status: 400 });
    }

    // Retrieve booking details
    const booking = await getBookingByReference(bookingReference);
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'Booking is already cancelled'
      }, { status: 400 });
    }

    console.log('📋 Processing cancellation for booking:', bookingReference);

    // Calculate cancellation policy and refund amount
    const bookingDate = new Date(booking.bookingDate);
    const flightDate = new Date(booking.flightDetails.outbound.departure.at);
    const cancellationPolicy = getCancellationPolicy(bookingDate, flightDate);

    if (!cancellationPolicy.canCancel) {
      return NextResponse.json({
        success: false,
        error: 'This booking cannot be cancelled. ' + cancellationPolicy.policy
      }, { status: 400 });
    }

    // Calculate refund amount
    const refundAmount = Math.max(0, 
      (booking.pricing.totalPrice * cancellationPolicy.refundPercentage / 100) - 
      cancellationPolicy.cancellationFee
    );

    console.log('💰 Refund calculation:', {
      originalAmount: booking.pricing.totalPrice,
      refundPercentage: cancellationPolicy.refundPercentage,
      cancellationFee: cancellationPolicy.cancellationFee,
      refundAmount
    });

    // Process refund with Stripe (if refund amount > 0)
    let refundResult = null;
    if (refundAmount > 0) {
      try {
        refundResult = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
          amount: Math.round(refundAmount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            bookingReference,
            cancellationReason: cancellationReason || 'Customer requested',
            originalAmount: booking.pricing.totalPrice.toString(),
            refundAmount: refundAmount.toString()
          }
        });

        console.log('✅ Stripe refund processed:', refundResult.id);
      } catch (stripeError) {
        console.error('❌ Stripe refund error:', stripeError);
        
        return NextResponse.json({
          success: false,
          error: 'Failed to process refund. Please contact support.'
        }, { status: 500 });
      }
    }

    // Update booking status
    await updateBookingStatus(bookingReference, 'cancelled', 
      refundAmount > 0 ? 'refunded' : 'paid'
    );

    // Store cancellation request
    await storeCancellationRequest(
      bookingReference,
      cancellationReason || 'Customer requested',
      refundAmount
    );

    // Send cancellation confirmation email
    try {
      await sendCancellationConfirmationEmail({
        email: booking.passengerInfo.email,
        bookingReference,
        passengerInfo: booking.passengerInfo,
        flightDetails: booking.flightDetails,
        cancellationPolicy,
        refundAmount,
        refundId: refundResult?.id
      });
    } catch (emailError) {
      console.error('❌ Cancellation email error:', emailError);
      // Don't fail the cancellation if email fails
    }

    // Return successful cancellation response
    return NextResponse.json({
      success: true,
      data: {
        bookingReference,
        status: 'cancelled',
        refundAmount,
        refundId: refundResult?.id,
        cancellationPolicy: cancellationPolicy.policy,
        message: refundAmount > 0 
          ? `Cancellation successful. Refund of $${refundAmount.toFixed(2)} will be processed within 5-10 business days.`
          : 'Cancellation successful. No refund applicable per cancellation policy.'
      }
    });

  } catch (error) {
    console.error('❌ Cancellation processing error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Cancellation processing failed'
    }, { status: 500 });
  }
}

/**
 * GET endpoint to retrieve cancellation policy
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingReference = searchParams.get('booking_reference');

    if (!bookingReference) {
      return NextResponse.json({
        success: false,
        error: 'Booking reference is required'
      }, { status: 400 });
    }

    // Retrieve booking details
    const booking = await getBookingByReference(bookingReference);
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    // Calculate cancellation policy
    const bookingDate = new Date(booking.bookingDate);
    const flightDate = new Date(booking.flightDetails.outbound.departure.at);
    const cancellationPolicy = getCancellationPolicy(bookingDate, flightDate);

    // Calculate potential refund amount
    const refundAmount = Math.max(0, 
      (booking.pricing.totalPrice * cancellationPolicy.refundPercentage / 100) - 
      cancellationPolicy.cancellationFee
    );

    return NextResponse.json({
      success: true,
      data: {
        bookingReference,
        originalAmount: booking.pricing.totalPrice,
        canCancel: cancellationPolicy.canCancel,
        refundPercentage: cancellationPolicy.refundPercentage,
        cancellationFee: cancellationPolicy.cancellationFee,
        estimatedRefund: refundAmount,
        policy: cancellationPolicy.policy,
        flightDate: flightDate.toISOString(),
        daysUntilFlight: Math.floor((flightDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }
    });

  } catch (error) {
    console.error('❌ Cancellation policy retrieval error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve cancellation policy'
    }, { status: 500 });
  }
}