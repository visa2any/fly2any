import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import { duffelAPI } from '@/lib/api/duffel';
import { emailService } from '@/lib/email/service';
import { paymentService } from '@/lib/payments/payment-service';
import { applyFlightMarkup } from '@/lib/config/flight-markup';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { alertApiError } from '@/lib/monitoring/customer-error-alerts';
import { notifyTelegramAdmins, broadcastSSE } from '@/lib/notifications/notification-service';

/**
 * Flight Booking Capture API - Finalize Hold Bookings
 *
 * This endpoint is called when a customer wants to pay for a previously held booking.
 *
 * Flow:
 * 1. Customer creates hold booking → Status: HOLD
 * 2. Customer decides to finalize → Calls this endpoint
 * 3. This API:
 *    a) Verifies booking exists and is in HOLD status
 *    b) Verifies Duffel hold order hasn't expired
 *    c) Processes customer payment (Stripe)
 *    d) Pays Duffel for the hold order
 *    e) Updates booking status to CONFIRMED
 *    f) Sends confirmation email
 *
 * @see https://duffel.com/docs/api/payments/create-payment
 */
export async function POST(request: NextRequest) {
  console.log('\n===========================================');
  console.log('💳 HOLD BOOKING CAPTURE REQUEST');
  console.log('===========================================\n');

  try {
    const body = await request.json();

    // Extract request data
    const {
      bookingReference,       // Our booking reference (FLY2A-XXXXXX)
      bookingId,              // Alternative: our booking ID
      payment,                // Stripe payment details
    } = body;

    // STEP 1: Validate request
    console.log('📋 Step 1: Validating capture request...');

    if (!bookingReference && !bookingId) {
      return NextResponse.json(
        { success: false, error: 'Missing bookingReference or bookingId' },
        { status: 400 }
      );
    }

    if (!payment || !payment.paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Missing payment information' },
        { status: 400 }
      );
    }

    // STEP 2: Find the booking
    console.log('📋 Step 2: Retrieving booking...');

    let booking;
    if (bookingReference) {
      booking = await bookingStorage.findByReferenceAsync(bookingReference);
    } else if (bookingId) {
      booking = await bookingStorage.findById(bookingId);
    }

    if (!booking) {
      console.error('❌ Booking not found:', bookingReference || bookingId);
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log(`   Found booking: ${booking.bookingReference}`);
    console.log(`   Status: ${booking.status}`);

    // STEP 3: Verify booking is in HOLD status
    console.log('📋 Step 3: Verifying booking status...');

    // Allow status variations (normalize to lowercase)
    const normalizedStatus = booking.status.toLowerCase();
    const validHoldStatuses = ['hold', 'pending', 'pending_payment'];
    if (!validHoldStatuses.includes(normalizedStatus)) {
      console.error(`❌ Invalid booking status: ${booking.status}`);

      if (normalizedStatus === 'confirmed') {
        return NextResponse.json(
          { success: false, error: 'This booking is already confirmed and paid', alreadyPaid: true },
          { status: 400 }
        );
      }

      if (normalizedStatus === 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'This booking has been cancelled', cancelled: true },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: `Cannot capture booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // STEP 4: Get Duffel order ID from booking
    console.log('📋 Step 4: Retrieving Duffel order details...');

    // Cast to any since duffelOrderId is stored dynamically
    const flightData = booking.flight as any;
    const duffelOrderId = flightData?.duffelOrderId ||
                           flightData?.externalOrderId ||
                           flightData?.orderId;

    if (!duffelOrderId) {
      console.error('❌ No Duffel order ID found in booking');
      return NextResponse.json(
        { success: false, error: 'No external order ID found. This may not be a hold booking.' },
        { status: 400 }
      );
    }

    console.log(`   Duffel Order ID: ${duffelOrderId}`);

    // STEP 5: Verify hold order is still valid with Duffel
    console.log('📋 Step 5: Verifying hold order with Duffel...');

    let holdStatus;
    try {
      holdStatus = await duffelAPI.verifyHoldOrderStatus(duffelOrderId);

      console.log(`   Valid: ${holdStatus.valid}`);
      console.log(`   Expired: ${holdStatus.expired}`);
      console.log(`   Already Paid: ${holdStatus.alreadyPaid}`);
      console.log(`   Current Price: ${holdStatus.currency} ${holdStatus.currentPrice}`);

      if (holdStatus.hoursRemaining !== undefined) {
        console.log(`   Hours Remaining: ${holdStatus.hoursRemaining}`);
      }

      if (holdStatus.alreadyPaid) {
        console.log('⚠️  Order was already paid');
        // Update our booking status to match
        await bookingStorage.update(booking.id, {
          status: 'confirmed',
          notes: `${booking.notes || ''}\n[AUTO] Hold was already paid on Duffel.`,
        });

        return NextResponse.json({
          success: true,
          message: 'Booking was already confirmed',
          booking: {
            bookingReference: booking.bookingReference,
            status: 'confirmed',
          },
          alreadyPaid: true,
        });
      }

      if (!holdStatus.valid) {
        console.error(`❌ Hold order is not valid: ${holdStatus.reason}`);

        // Update our booking status
        if (holdStatus.expired) {
          await bookingStorage.update(booking.id, {
            status: 'expired',
            notes: `${booking.notes || ''}\n[AUTO] Hold expired on ${holdStatus.paymentDeadline}.`,
          });
        } else if (holdStatus.cancelled) {
          await bookingStorage.update(booking.id, {
            status: 'cancelled',
            cancellationReason: 'Hold order was cancelled by airline',
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: holdStatus.reason || 'Hold order is no longer valid',
            expired: holdStatus.expired,
            cancelled: holdStatus.cancelled,
          },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error('❌ Error verifying hold status:', error.message);
      return NextResponse.json(
        { success: false, error: `Failed to verify hold status: ${error.message}` },
        { status: 500 }
      );
    }

    // STEP 6: Calculate total amount with markup
    console.log('📋 Step 6: Calculating payment amount...');

    // Use the current Duffel price (NET price)
    const netPrice = parseFloat(holdStatus.currentPrice);
    const currency = holdStatus.currency;

    // Apply our markup for customer charge
    const markupResult = applyFlightMarkup(netPrice);
    const customerAmount = markupResult.customerPrice;

    console.log(`   NET Price (Duffel): ${currency} ${netPrice.toFixed(2)}`);
    console.log(`   Customer Price (with markup): ${currency} ${customerAmount.toFixed(2)}`);
    console.log(`   Markup: ${currency} ${markupResult.markupAmount.toFixed(2)} (${markupResult.markupPercentage.toFixed(1)}%)`);

    // STEP 7: Process customer payment via Stripe
    console.log('📋 Step 7: Processing customer payment...');

    let stripePayment;
    try {
      // Use type assertion since we're passing additional Stripe-specific params
      stripePayment = await paymentService.createPaymentIntent({
        amount: Math.round(customerAmount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        bookingReference: booking.bookingReference,
        customerEmail: booking.contactInfo?.email || '',
        customerName: `${booking.passengers[0]?.firstName || ''} ${booking.passengers[0]?.lastName || ''}`.trim() || 'Customer',
        description: `Fly2Any Flight - Hold Capture - ${booking.bookingReference}`,
        metadata: {
          bookingReference: booking.bookingReference,
          bookingId: booking.id,
          duffelOrderId,
          type: 'hold_capture',
          netPrice: netPrice.toString(),
          markup: markupResult.markupAmount.toString(),
        },
      } as any);

      console.log(`   Stripe Payment ID: ${stripePayment.paymentIntentId}`);
      console.log(`   Status: ${stripePayment.status}`);

      if (stripePayment.status !== 'succeeded') {
        console.error('❌ Stripe payment not successful:', stripePayment.status);
        return NextResponse.json(
          {
            success: false,
            error: 'Payment was not successful',
            paymentStatus: stripePayment.status,
          },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error('❌ Stripe payment error:', error.message);
      return NextResponse.json(
        { success: false, error: `Payment failed: ${error.message}` },
        { status: 400 }
      );
    }

    // STEP 8: Pay Duffel for the hold order
    console.log('📋 Step 8: Paying Duffel for hold order...');

    let duffelPayment;
    try {
      duffelPayment = await duffelAPI.payForHoldOrder(
        duffelOrderId,
        holdStatus.currentPrice,
        currency
      );

      console.log(`   Duffel Payment ID: ${duffelPayment.paymentId}`);
      console.log(`   Status: ${duffelPayment.status}`);

      if (!duffelPayment.success) {
        console.error('❌ Duffel payment failed');
        // Refund customer payment since Duffel failed
        console.log('💰 Initiating refund for customer...');
        try {
          await paymentService.processRefund({
            paymentIntentId: stripePayment.paymentIntentId,
            reason: 'requested_by_customer',
            metadata: { internalReason: 'Duffel payment failed' },
          });
          console.log('✅ Customer refunded');
        } catch (refundError: any) {
          console.error('❌ Refund failed:', refundError.message);
          // Log for manual intervention
          console.error('⚠️  MANUAL INTERVENTION REQUIRED: Customer charged but Duffel failed');
        }

        return NextResponse.json(
          { success: false, error: 'Failed to complete booking with airline. Your payment has been refunded.' },
          { status: 500 }
        );
      }
    } catch (error: any) {
      console.error('❌ Duffel payment error:', error.message);

      // Handle specific errors
      if (error.message.includes('PAYMENT_EXPIRED')) {
        // Refund customer
        try {
          await paymentService.processRefund({
            paymentIntentId: stripePayment.paymentIntentId,
            reason: 'requested_by_customer',
            metadata: { internalReason: 'Hold order expired' },
          });
        } catch (refundError: any) {
          console.error('❌ Refund failed:', refundError.message);
        }

        return NextResponse.json(
          { success: false, error: 'The hold has expired. Your payment has been refunded. Please create a new booking.', expired: true },
          { status: 400 }
        );
      }

      // Generic failure - refund
      try {
        await paymentService.processRefund({
          paymentIntentId: stripePayment.paymentIntentId,
          reason: 'requested_by_customer',
          metadata: { internalReason: `Duffel error: ${error.message}` },
        });
      } catch (refundError: any) {
        console.error('❌ Refund failed:', refundError.message);
      }

      return NextResponse.json(
        { success: false, error: `Airline booking failed: ${error.message}. Your payment has been refunded.` },
        { status: 500 }
      );
    }

    // STEP 9: Update booking status
    console.log('📋 Step 9: Updating booking status...');

    const updatedBooking = await bookingStorage.update(booking.id, {
      status: 'confirmed',
      payment: {
        ...booking.payment,
        paymentIntentId: stripePayment.paymentIntentId,
        duffelPaymentId: duffelPayment.paymentId,
        amount: customerAmount,
        netAmount: netPrice,
        markup: markupResult.markupAmount,
        status: 'paid',
        paidAt: new Date().toISOString(),
        capturedAt: new Date().toISOString(),
      },
      notes: `${booking.notes || ''}\n[AUTO] Hold captured at ${new Date().toISOString()}. Customer paid: ${currency} ${customerAmount.toFixed(2)}`,
    });

    console.log('✅ Booking updated to CONFIRMED');

    // STEP 10: Send confirmation email
    console.log('📋 Step 10: Sending confirmation email...');

    try {
      // Create a booking object with updated payment for email
      const bookingForEmail = {
        ...booking,
        ...updatedBooking,
        payment: {
          ...booking.payment,
          amount: customerAmount,
          currency,
        },
      };
      await emailService.sendBookingConfirmation(bookingForEmail as any);
      console.log('✅ Confirmation email sent');
    } catch (emailError: any) {
      console.error('⚠️  Email sending failed:', emailError.message);
      // Non-blocking - booking is still successful (admin will be notified by email service)
    }

    console.log('\n===========================================');
    console.log('✅ HOLD BOOKING CAPTURE SUCCESSFUL');
    console.log(`   Booking: ${booking.bookingReference}`);
    console.log(`   Status: CONFIRMED`);
    console.log(`   Customer Paid: ${currency} ${customerAmount.toFixed(2)}`);
    console.log(`   Duffel Paid: ${currency} ${netPrice.toFixed(2)}`);
    console.log(`   Markup Earned: ${currency} ${markupResult.markupAmount.toFixed(2)}`);
    console.log('===========================================\n');

    // Notify admins of successful capture
    await notifyTelegramAdmins(`
✈️ <b>HOLD BOOKING CAPTURED</b>

📋 <b>Booking:</b> <code>${booking.bookingReference}</code>
✅ <b>Status:</b> CONFIRMED

👤 <b>Customer:</b> ${booking.passengers[0]?.firstName || ''} ${booking.passengers[0]?.lastName || ''}
📧 <b>Email:</b> ${booking.contactInfo?.email || 'N/A'}

💰 <b>Payment:</b>
• Customer Paid: ${currency} ${customerAmount.toFixed(2)}
• Net (Duffel): ${currency} ${netPrice.toFixed(2)}
• Markup: ${currency} ${markupResult.markupAmount.toFixed(2)}
    `.trim()).catch(() => {});

    // SSE broadcast
    broadcastSSE('admin', 'booking_captured', {
      type: 'flight_hold_capture',
      bookingReference: booking.bookingReference,
      amount: customerAmount,
      currency,
      status: 'confirmed',
    });

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        bookingReference: booking.bookingReference,
        status: 'confirmed',
        flight: booking.flight,
        passengers: booking.passengers,
      },
      payment: {
        amount: customerAmount,
        currency,
        stripePaymentId: stripePayment.paymentIntentId,
        duffelPaymentId: duffelPayment.paymentId,
      },
    });

  } catch (error: any) {
    console.error('❌ Hold capture error:', error);

    // Alert admins about capture failure
    await alertApiError(request, error, {
      errorCode: 'HOLD_CAPTURE_FAILED',
      endpoint: '/api/flights/booking/capture',
    }, { priority: 'critical' }).catch(() => {});

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to capture hold booking',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check hold status before capture
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookingReference = searchParams.get('bookingReference');

  if (!bookingReference) {
    return NextResponse.json(
      { success: false, error: 'Missing bookingReference parameter' },
      { status: 400 }
    );
  }

  try {
    // Find booking
    const booking = await bookingStorage.findByReferenceAsync(bookingReference);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check status
    const validHoldStatuses = ['hold', 'pending'];
    const isHold = validHoldStatuses.includes(booking.status);

    if (!isHold) {
      return NextResponse.json({
        success: true,
        booking: {
          bookingReference: booking.bookingReference,
          status: booking.status,
          isHold: false,
        },
        canCapture: false,
        reason: booking.status === 'confirmed' ? 'Already confirmed' : `Status: ${booking.status}`,
      });
    }

    // Get Duffel order ID - cast to any since duffelOrderId is stored dynamically
    const flightData = booking.flight as any;
    const duffelOrderId = flightData?.duffelOrderId ||
                           flightData?.externalOrderId ||
                           flightData?.orderId;

    if (!duffelOrderId) {
      return NextResponse.json({
        success: true,
        booking: {
          bookingReference: booking.bookingReference,
          status: booking.status,
          isHold: true,
        },
        canCapture: false,
        reason: 'No external order ID found',
      });
    }

    // Verify with Duffel
    const holdStatus = await duffelAPI.verifyHoldOrderStatus(duffelOrderId);

    // Calculate customer price
    const netPrice = parseFloat(holdStatus.currentPrice);
    const markupResult = applyFlightMarkup(netPrice);

    return NextResponse.json({
      success: true,
      booking: {
        bookingReference: booking.bookingReference,
        status: booking.status,
        isHold: true,
        flight: booking.flight,
      },
      holdStatus: {
        valid: holdStatus.valid,
        expired: holdStatus.expired,
        alreadyPaid: holdStatus.alreadyPaid,
        hoursRemaining: holdStatus.hoursRemaining,
        paymentDeadline: holdStatus.paymentDeadline,
      },
      pricing: {
        netPrice: netPrice,
        customerPrice: markupResult.customerPrice,
        markup: markupResult.markupAmount,
        currency: holdStatus.currency,
      },
      canCapture: holdStatus.valid,
      reason: holdStatus.reason,
    });

  } catch (error: any) {
    console.error('Error checking hold status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
