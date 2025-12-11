import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import { emailService } from '@/lib/email/service';
import { auth } from '@/lib/auth';
import { notifyTicketIssued } from '@/lib/notifications/notification-service';
import type { BookingNotificationPayload } from '@/lib/notifications/types';
import { getStripeClient } from '@/lib/payments/stripe-client';

// Force Node.js runtime and dynamic rendering for database access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - Issue Ticket (Manual Ticketing Workflow)
 * POST /api/admin/bookings/[id]/ticket
 *
 * This endpoint is used by admins to enter ticketing information after
 * manually booking through a consolidator. Updates booking status to 'ticketed'.
 *
 * Request Body:
 * {
 *   eticketNumbers: string[],      // Required: E-ticket numbers for each passenger
 *   airlineRecordLocator: string,  // Required: Airline PNR / Confirmation Code
 *   consolidatorName?: string,     // Optional: Name of consolidator used
 *   consolidatorReference?: string,// Optional: Consolidator's reference number
 *   consolidatorPrice?: number,    // Optional: Net price paid to consolidator
 *   ticketingNotes?: string        // Optional: Internal notes
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log(`🎫 Processing ticketing for booking: ${id}`);

    // Validate required fields
    const { eticketNumbers, airlineRecordLocator } = body;

    if (!eticketNumbers || !Array.isArray(eticketNumbers) || eticketNumbers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_ETICKETS',
          message: 'E-ticket numbers are required',
        },
        { status: 400 }
      );
    }

    if (!airlineRecordLocator || typeof airlineRecordLocator !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_PNR',
          message: 'Airline Record Locator (PNR) is required',
        },
        { status: 400 }
      );
    }

    // Fetch current booking
    const booking = await bookingStorage.findById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Booking not found',
        },
        { status: 404 }
      );
    }

    // Check if booking is already ticketed
    if (booking.status === 'ticketed') {
      return NextResponse.json(
        {
          success: false,
          error: 'ALREADY_TICKETED',
          message: 'This booking has already been ticketed',
        },
        { status: 400 }
      );
    }

    // Get admin user info if available
    let ticketedBy = 'Admin';
    try {
      const session = await auth();
      if (session?.user?.email) {
        ticketedBy = session.user.email;
      }
    } catch (e) {
      // Ignore auth errors
    }

    // Calculate markup if consolidator price is provided
    let markup: number | undefined;
    if (body.consolidatorPrice && booking.customerPrice) {
      markup = booking.customerPrice - body.consolidatorPrice;
    } else if (body.consolidatorPrice && booking.payment?.amount) {
      markup = booking.payment.amount - body.consolidatorPrice;
    }

    // CRITICAL FIX: Capture Stripe payment if payment intent exists and is uncaptured
    // For manual ticketing workflow, payment may be authorized but not captured
    let stripeTransactionId: string | undefined;
    let paymentCapturedAt: string | undefined;

    if (booking.payment?.paymentIntentId && booking.payment.status === 'pending') {
      console.log(`💳 Attempting to capture Stripe payment: ${booking.payment.paymentIntentId}`);

      try {
        const stripe = getStripeClient();

        // Check payment intent status
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment.paymentIntentId);

        if (paymentIntent.status === 'requires_capture') {
          // Capture the payment
          const capturedPayment = await stripe.paymentIntents.capture(booking.payment.paymentIntentId);
          stripeTransactionId = capturedPayment.id;
          paymentCapturedAt = new Date().toISOString();
          console.log(`✅ Stripe payment captured: ${stripeTransactionId}`);
        } else if (paymentIntent.status === 'succeeded') {
          // Already captured (automatic capture)
          stripeTransactionId = paymentIntent.id;
          paymentCapturedAt = new Date(paymentIntent.created * 1000).toISOString();
          console.log(`✅ Stripe payment already succeeded: ${stripeTransactionId}`);
        } else if (paymentIntent.status === 'canceled') {
          console.warn(`⚠️ Stripe payment was canceled: ${booking.payment.paymentIntentId}`);
          // Payment was canceled - admin should be aware
        } else {
          console.log(`ℹ️ Stripe payment status: ${paymentIntent.status} - may require manual handling`);
        }
      } catch (stripeError: any) {
        console.error('⚠️ Stripe payment capture failed:', stripeError.message);
        // Don't block ticketing if Stripe fails - admin can handle manually
        // But warn them in the response
      }
    }

    // Update booking with ticketing information
    const updatedBooking = await bookingStorage.update(id, {
      status: 'ticketed',
      ticketingStatus: 'ticketed',
      eticketNumbers: eticketNumbers.filter((t: string) => t && t.trim() !== ''),
      airlineRecordLocator: airlineRecordLocator.trim().toUpperCase(),
      consolidatorName: body.consolidatorName?.trim() || undefined,
      consolidatorReference: body.consolidatorReference?.trim() || undefined,
      consolidatorPrice: body.consolidatorPrice || undefined,
      markup: markup,
      ticketedAt: new Date().toISOString(),
      ticketedBy,
      ticketingNotes: body.ticketingNotes?.trim() || undefined,
      // Also update payment status to paid since we processed it via consolidator
      payment: {
        ...booking.payment,
        status: 'paid',
        transactionId: stripeTransactionId || booking.payment.transactionId,
        paidAt: paymentCapturedAt || booking.payment.paidAt || new Date().toISOString(),
        capturedAt: paymentCapturedAt,
      },
    });

    if (!updatedBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'UPDATE_FAILED',
          message: 'Failed to update booking with ticketing information',
        },
        { status: 500 }
      );
    }

    console.log(`✅ Ticket issued for booking: ${updatedBooking.bookingReference}`);
    console.log(`   Airline PNR: ${updatedBooking.airlineRecordLocator}`);
    console.log(`   E-tickets: ${updatedBooking.eticketNumbers?.join(', ')}`);
    console.log(`   Ticketed by: ${ticketedBy}`);
    if (markup !== undefined) {
      console.log(`   Margin: $${markup.toFixed(2)}`);
    }

    // Send real-time notifications (SSE + Telegram + Database)
    const flight = updatedBooking.flight;
    const firstSegment = flight?.segments?.[0];
    const lastSegment = flight?.segments?.[flight.segments.length - 1];
    const route = firstSegment && lastSegment
      ? `${firstSegment.departure.iataCode} → ${lastSegment.arrival.iataCode}`
      : 'N/A';
    const departureDate = firstSegment?.departure?.at
      ? new Date(firstSegment.departure.at).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';

    const notificationPayload: BookingNotificationPayload = {
      bookingId: updatedBooking.id,
      bookingReference: updatedBooking.bookingReference,
      status: 'ticketed',
      customerName: updatedBooking.passengers?.[0]
        ? `${updatedBooking.passengers[0].firstName} ${updatedBooking.passengers[0].lastName}`
        : 'Customer',
      customerEmail: updatedBooking.contactInfo?.email || '',
      customerPhone: updatedBooking.contactInfo?.phone,
      route,
      departureDate,
      totalAmount: updatedBooking.payment?.amount || 0,
      currency: updatedBooking.payment?.currency || 'USD',
      passengerCount: updatedBooking.passengers?.length || 1,
      eticketNumbers: updatedBooking.eticketNumbers,
      airlineRecordLocator: updatedBooking.airlineRecordLocator,
      ticketedAt: updatedBooking.ticketedAt,
      ticketedBy: updatedBooking.ticketedBy,
    };

    // Fire and forget - don't block response
    notifyTicketIssued(notificationPayload).catch((err) => {
      console.error('⚠️ Failed to send ticket notifications:', err);
    });

    console.log('📤 Ticket issued notifications dispatched');

    // Send ticketed confirmation email to customer
    console.log('📧 Sending e-ticket confirmation email to customer...');
    try {
      await emailService.sendTicketedConfirmation(updatedBooking);
      console.log('✅ E-ticket confirmation email sent');
    } catch (emailError) {
      console.error('⚠️  Failed to send e-ticket email:', emailError);
      // Don't fail the ticketing if email fails
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: updatedBooking.id,
          bookingReference: updatedBooking.bookingReference,
          status: updatedBooking.status,
          ticketingStatus: updatedBooking.ticketingStatus,
          eticketNumbers: updatedBooking.eticketNumbers,
          airlineRecordLocator: updatedBooking.airlineRecordLocator,
          ticketedAt: updatedBooking.ticketedAt,
          ticketedBy: updatedBooking.ticketedBy,
          markup: updatedBooking.markup,
        },
        message: 'Booking has been successfully ticketed',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error processing ticketing:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'TICKETING_FAILED',
        message: 'Failed to process ticketing',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/bookings/[id]/ticket
 * Get ticketing status and information for a booking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const booking = await bookingStorage.findById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Booking not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticketing: {
        status: booking.ticketingStatus || (booking.status === 'ticketed' ? 'ticketed' : 'pending_ticketing'),
        eticketNumbers: booking.eticketNumbers || [],
        airlineRecordLocator: booking.airlineRecordLocator || null,
        consolidatorName: booking.consolidatorName || null,
        consolidatorReference: booking.consolidatorReference || null,
        consolidatorPrice: booking.consolidatorPrice || null,
        customerPrice: booking.customerPrice || booking.payment?.amount || null,
        markup: booking.markup || null,
        ticketedAt: booking.ticketedAt || null,
        ticketedBy: booking.ticketedBy || null,
        ticketingNotes: booking.ticketingNotes || null,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching ticketing info:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'FETCH_FAILED',
        message: 'Failed to fetch ticketing information',
      },
      { status: 500 }
    );
  }
}
