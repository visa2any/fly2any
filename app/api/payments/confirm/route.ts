import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/payment-service';
import { bookingStorage } from '@/lib/bookings/storage';
import { emailService } from '@/lib/email/service';

/**
 * Confirm Payment API
 *
 * Confirms a payment intent and updates booking status
 * Called after payment is completed (including 3D Secure if required)
 *
 * POST /api/payments/confirm
 *
 * Request Body:
 * {
 *   paymentIntentId: string,  // Stripe payment intent ID
 *   bookingReference: string  // Booking reference to update
 * }
 *
 * Response:
 * {
 *   success: true,
 *   payment: {
 *     paymentIntentId: string,
 *     status: string,
 *     amount: number,
 *     currency: string,
 *     paymentMethod: string,
 *     last4: string,
 *     brand: string
 *   },
 *   booking: {
 *     status: string
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, bookingReference } = body;

    // Validation
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Invalid payment intent', message: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    if (!bookingReference) {
      return NextResponse.json(
        { error: 'Invalid booking reference', message: 'Booking reference is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Confirming payment...');
    console.log(`   Payment Intent ID: ${paymentIntentId}`);
    console.log(`   Booking Reference: ${bookingReference}`);

    // Confirm payment with Stripe
    const payment = await paymentService.confirmPayment(paymentIntentId);

    console.log(`✅ Payment confirmation retrieved`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   Amount: ${payment.amount} ${payment.currency}`);

    // Check payment status
    if (payment.status !== 'succeeded') {
      console.warn(`⚠️  Payment not successful. Status: ${payment.status}`);

      return NextResponse.json(
        {
          success: false,
          payment,
          message: payment.status === 'requires_action'
            ? 'Payment requires additional authentication'
            : payment.status === 'processing'
            ? 'Payment is being processed'
            : 'Payment was not successful',
        },
        { status: 200 } // Still 200 as the request was successful, just payment pending
      );
    }

    // Update booking status in database
    console.log('💾 Updating booking status...');

    try {
      const booking = await bookingStorage.findByReferenceAsync(bookingReference);

      if (!booking) {
        console.error(`❌ Booking not found: ${bookingReference}`);
        return NextResponse.json(
          {
            success: false,
            error: 'BOOKING_NOT_FOUND',
            message: 'Booking not found',
          },
          { status: 404 }
        );
      }

      // Update payment information
      const updatedBooking = await bookingStorage.update(booking.id, {
        status: 'confirmed',
        payment: {
          ...booking.payment,
          status: 'paid',
          transactionId: payment.paymentIntentId,
          paidAt: new Date().toISOString(),
          cardLast4: payment.last4,
          cardBrand: payment.brand,
        },
      });

      console.log('✅ Booking updated successfully');
      console.log(`   Status: confirmed`);
      console.log(`   Payment Status: paid`);

      // STEP: Send booking confirmation email
      if (updatedBooking) {
        console.log('📧 Sending booking confirmation email...');
        try {
          await emailService.sendBookingConfirmation(updatedBooking);
          console.log('✅ Booking confirmation email sent');
        } catch (emailError) {
          console.error('⚠️  Failed to send confirmation email, but booking was confirmed:', emailError);
          // Don't fail the payment confirmation if email fails
        }
      }

      return NextResponse.json(
        {
          success: true,
          payment,
          booking: updatedBooking ? {
            id: updatedBooking.id,
            bookingReference: updatedBooking.bookingReference,
            status: updatedBooking.status,
          } : undefined,
          message: 'Payment confirmed and booking updated successfully',
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.error('❌ Database update error:', dbError);

      // Payment succeeded but database update failed
      // Return success but note the database issue
      return NextResponse.json(
        {
          success: true,
          payment,
          warning: 'Payment successful but booking update failed. Please contact support.',
          message: 'Payment confirmed but booking update encountered an error',
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('❌ Payment confirmation error:', error);

    return NextResponse.json(
      {
        error: 'PAYMENT_CONFIRMATION_FAILED',
        message: error.message || 'Failed to confirm payment',
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
