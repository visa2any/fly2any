import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db/prisma';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Cancel a hotel booking and process refund if applicable
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const bookingId = params.id;

    // Fetch the booking
    const booking = await prisma.hotelBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify ownership (user must own the booking or be an admin)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    const isAdmin = user?.role === 'ADMIN';
    const isOwner = booking.guestEmail === session.user.email;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to cancel this booking' },
        { status: 403 }
      );
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    // Check if booking is cancellable
    if (!booking.cancellable) {
      return NextResponse.json(
        { error: 'This booking is non-cancellable' },
        { status: 400 }
      );
    }

    // Check if check-in date has already passed
    const checkInDate = new Date(booking.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return NextResponse.json(
        { error: 'Cannot cancel - check-in date has already passed' },
        { status: 400 }
      );
    }

    // Process refund if booking is refundable and has payment intent
    let refundStatus = 'not_applicable';
    let refundAmount = 0;

    if (booking.refundable && booking.paymentIntentId) {
      try {
        // Calculate refund amount based on cancellation policy
        const daysUntilCheckIn = Math.ceil(
          (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Refund policy:
        // - Full refund if cancelled 7+ days before check-in
        // - 50% refund if cancelled 3-6 days before check-in
        // - No refund if cancelled less than 3 days before check-in
        let refundPercentage = 0;
        if (daysUntilCheckIn >= 7) {
          refundPercentage = 100;
        } else if (daysUntilCheckIn >= 3) {
          refundPercentage = 50;
        } else {
          refundPercentage = 0;
        }

        if (refundPercentage > 0) {
          const totalPriceInCents = Math.round(
            parseFloat(booking.totalPrice.toString()) * 100
          );
          const refundAmountInCents = Math.round(
            (totalPriceInCents * refundPercentage) / 100
          );

          // Process Stripe refund
          const refund = await stripe.refunds.create({
            payment_intent: booking.paymentIntentId,
            amount: refundAmountInCents,
            reason: 'requested_by_customer',
            metadata: {
              bookingId: booking.id,
              confirmationNumber: booking.confirmationNumber,
              refundPercentage: refundPercentage.toString(),
            },
          });

          refundStatus = refund.status;
          refundAmount = refundAmountInCents / 100;
        } else {
          refundStatus = 'no_refund_due_to_policy';
        }
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        // Continue with cancellation even if refund fails
        refundStatus = 'failed';
      }
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.hotelBooking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        updatedAt: new Date(),
      },
    });

    // TODO: Send cancellation confirmation email
    // This would integrate with the existing email service
    // await sendCancellationEmail(booking, refundAmount, refundStatus);

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
      refund: {
        status: refundStatus,
        amount: refundAmount,
        currency: booking.currency,
      },
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel booking',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
