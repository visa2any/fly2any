/**
 * Hotel Booking Cancellation API
 * POST /api/hotels/booking/[id]/cancel
 *
 * Cancels a hotel booking via LiteAPI and processes any applicable refunds.
 *
 * Flow:
 * 1. Validate booking ID and authorization
 * 2. Call LiteAPI to cancel the booking
 * 3. Process refund if applicable (via Stripe or LiteAPI User Payment SDK)
 * 4. Update local booking record (if using database)
 * 5. Send confirmation email
 *
 * @see https://docs.liteapi.travel/reference/cancel-booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CancellationResult {
  success: boolean;
  bookingId: string;
  status: 'cancelled' | 'pending' | 'failed';
  refund?: {
    amount: number;
    currency: string;
    status: 'pending' | 'processed' | 'denied';
  };
  cancellationFee?: number;
  message: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CancellationResult | { error: string; details?: string }>> {
  try {
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Parse request body for optional confirmation details
    const body = await request.json().catch(() => ({}));
    const { confirmationNumber, email, reason } = body;

    console.log(`[CANCEL] Processing cancellation for booking: ${bookingId}`);
    if (confirmationNumber) {
      console.log(`[CANCEL] Confirmation number: ${confirmationNumber}`);
    }
    if (reason) {
      console.log(`[CANCEL] Reason: ${reason}`);
    }

    // Step 1: Verify the booking exists (optional, for extra validation)
    try {
      const bookingDetails = await liteAPI.getBooking(bookingId);
      const bookingData = bookingDetails.booking;
      console.log(`[CANCEL] Found booking: ${bookingData?.reference || bookingId}`);
      console.log(`[CANCEL] Current status: ${bookingData?.status}`);

      // Check if already cancelled
      if (bookingData?.status === 'cancelled') {
        return NextResponse.json({
          success: true,
          bookingId,
          status: 'cancelled',
          message: 'Booking was already cancelled',
        });
      }

      // Check cancellation policy
      if (bookingData?.cancellationPolicy && !bookingData.cancellationPolicy.refundable) {
        console.log(`[CANCEL] Warning: Booking is non-refundable`);
      }
    } catch (error) {
      console.warn(`[CANCEL] Could not verify booking: ${error}`);
      // Continue with cancellation attempt - LiteAPI will validate
    }

    // Step 2: Cancel the booking via LiteAPI
    const cancellation = await liteAPI.cancelBooking(bookingId);

    console.log(`[CANCEL] Cancellation response:`, cancellation);

    // Step 3: Build response
    const result: CancellationResult = {
      success: true,
      bookingId: cancellation.bookingId,
      status: cancellation.status,
      message: 'Booking cancelled successfully',
    };

    // Include refund details if available
    if (cancellation.refundAmount && cancellation.refundAmount > 0) {
      result.refund = {
        amount: cancellation.refundAmount,
        currency: cancellation.refundCurrency || 'USD',
        status: cancellation.refundStatus || 'pending',
      };
      result.message = `Booking cancelled. Refund of ${cancellation.refundCurrency || 'USD'} ${cancellation.refundAmount.toFixed(2)} is ${cancellation.refundStatus || 'being processed'}.`;
    }

    // Include cancellation fee if applicable
    if (cancellation.cancellationFee && cancellation.cancellationFee > 0) {
      result.cancellationFee = cancellation.cancellationFee;
      result.message += ` A cancellation fee of ${cancellation.refundCurrency || 'USD'} ${cancellation.cancellationFee.toFixed(2)} was applied.`;
    }

    // Step 4: Update local database (if using one)
    // This would be implemented based on your database setup
    // await prisma.hotelBooking.update({
    //   where: { liteapiBookingId: bookingId },
    //   data: {
    //     status: 'cancelled',
    //     cancelledAt: new Date(),
    //     refundAmount: cancellation.refundAmount,
    //     cancellationFee: cancellation.cancellationFee,
    //   },
    // });

    // Step 5: Send confirmation email (if email service is configured)
    // await sendCancellationEmail({
    //   to: email,
    //   bookingId,
    //   refundAmount: cancellation.refundAmount,
    //   cancellationFee: cancellation.cancellationFee,
    // });

    console.log(`[CANCEL] Successfully cancelled booking ${bookingId}`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[CANCEL] Error cancelling booking:', error);

    // Handle specific LiteAPI errors
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        {
          error: 'Booking not found',
          details: 'The booking ID does not exist or has already been cancelled.',
        },
        { status: 404 }
      );
    }

    if (error.message?.includes('cannot be cancelled')) {
      return NextResponse.json(
        {
          error: 'Cancellation not allowed',
          details: 'This booking cannot be cancelled. Please contact support.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to cancel booking',
        details: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/hotels/booking/[id]/cancel
 * Get cancellation information and estimated refund for a booking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking details to check cancellation policy
    const bookingDetails = await liteAPI.getBooking(bookingId);
    const booking = bookingDetails.booking;

    const cancellationInfo = {
      bookingId,
      status: booking?.status,
      canCancel: booking?.status !== 'cancelled',
      cancellationPolicy: booking?.cancellationPolicy || null,
      checkIn: booking?.checkIn,
      checkOut: booking?.checkOut,
      estimatedRefund: null as { amount: number; currency: string } | null,
    };

    // Calculate estimated refund based on cancellation policy
    if (booking?.cancellationPolicy?.refundable && booking?.price) {
      cancellationInfo.estimatedRefund = {
        amount: booking.price.amount,
        currency: booking.price.currency,
      };

      // Check deadlines for partial refunds
      if (booking.cancellationPolicy.deadlines) {
        const now = new Date();
        for (const deadline of booking.cancellationPolicy.deadlines) {
          const deadlineDate = new Date(`${deadline.date}T${deadline.time}`);
          if (now > deadlineDate) {
            cancellationInfo.estimatedRefund.amount =
              booking.price.amount - deadline.penaltyAmount;
          }
        }
      }
    }

    return NextResponse.json(cancellationInfo);
  } catch (error: any) {
    console.error('[CANCEL] Error getting cancellation info:', error);
    return NextResponse.json(
      {
        error: 'Failed to get cancellation information',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
