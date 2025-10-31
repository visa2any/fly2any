import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';
import { bookingStorage, calculateRefund } from '@/lib/bookings/storage';
import { OrderCancellationConfirmation } from '@/lib/bookings/types';

/**
 * POST /api/orders/cancel/confirm
 * Confirm and process order cancellation
 *
 * Supports both Duffel and Amadeus bookings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, bookingReference, reason } = body;

    if (!bookingId && !bookingReference) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required field: bookingId or bookingReference',
            code: 'MISSING_FIELDS',
          },
        },
        { status: 400 }
      );
    }

    // Fetch booking from database
    const booking = bookingId
      ? await bookingStorage.findById(bookingId)
      : await bookingStorage.findByReferenceAsync(bookingReference);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Booking not found',
            code: 'BOOKING_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'This booking has already been cancelled',
            code: 'ALREADY_CANCELLED',
          },
        },
        { status: 400 }
      );
    }

    // Check if flight has already departed
    const firstSegment = booking.flight.segments[0];
    const departureTime = new Date(firstSegment.departure.at);
    const now = new Date();

    if (now > departureTime) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Cannot cancel a booking after the flight has departed',
            code: 'FLIGHT_DEPARTED',
          },
        },
        { status: 400 }
      );
    }

    // Calculate refund
    const bookingAge = now.getTime() - new Date(booking.createdAt).getTime();
    const isWithin24Hours = bookingAge < 24 * 60 * 60 * 1000;

    let confirmation: OrderCancellationConfirmation;
    let refundAmount = 0;
    let cancellationFee = 0;

    // Handle based on source API
    if (booking.sourceApi === 'Duffel' && booking.duffelOrderId) {
      // Use Duffel API for cancellation
      console.log(`Cancelling Duffel order: ${booking.duffelOrderId}`);

      try {
        const duffelCancellation = await duffelAPI.cancelOrder(booking.duffelOrderId);

        refundAmount = parseFloat(duffelCancellation.data.refund_amount || '0');
        cancellationFee = booking.payment.amount - refundAmount;

        // Override with free cancellation if within 24 hours
        if (isWithin24Hours) {
          refundAmount = booking.payment.amount;
          cancellationFee = 0;
        }

        confirmation = {
          success: true,
          orderId: booking.duffelOrderId,
          bookingReference: booking.bookingReference,
          cancellationId: duffelCancellation.data.id,
          status: 'cancelled',
          refundAmount,
          refundStatus: refundAmount > 0 ? 'processing' : 'not_applicable',
          refundReference: duffelCancellation.data.id,
          cancellationFee,
          currency: duffelCancellation.data.refund_currency || booking.payment.currency,
          cancelledAt: new Date().toISOString(),
          refundProcessingTime: refundAmount > 0 ? '7-10 business days' : undefined,
          message: isWithin24Hours
            ? 'Booking cancelled successfully with full refund (24-hour free cancellation)'
            : refundAmount > 0
            ? `Booking cancelled. Refund of ${refundAmount} ${booking.payment.currency} will be processed within 7-10 business days.`
            : 'Booking cancelled. This was a non-refundable ticket.',
        };
      } catch (error: any) {
        console.error('Error cancelling Duffel order:', error);

        // Handle specific errors
        if (error.message.includes('ORDER_ALREADY_CANCELLED')) {
          return NextResponse.json(
            {
              success: false,
              error: {
                message: 'This booking has already been cancelled',
                code: 'ALREADY_CANCELLED',
              },
            },
            { status: 400 }
          );
        }

        if (error.message.includes('NOT_CANCELLABLE')) {
          return NextResponse.json(
            {
              success: false,
              error: {
                message: 'This booking cannot be cancelled through the API. Please contact support.',
                code: 'NOT_CANCELLABLE',
              },
            },
            { status: 400 }
          );
        }

        throw error;
      }
    } else {
      // Amadeus or other bookings
      // Note: Amadeus doesn't provide a direct cancellation API in test mode
      // In production, you would use airline APIs or GDS systems

      const refundCalc = calculateRefund(booking);

      // Override with free cancellation if within 24 hours
      if (isWithin24Hours) {
        refundAmount = booking.payment.amount;
        cancellationFee = 0;
      } else {
        refundAmount = refundCalc.refundAmount;
        cancellationFee = refundCalc.cancellationFee;
      }

      confirmation = {
        success: true,
        orderId: booking.amadeusBookingId || booking.id,
        bookingReference: booking.bookingReference,
        cancellationId: `CANCEL_${Date.now()}`,
        status: 'cancelled',
        refundAmount,
        refundStatus: refundAmount > 0 ? 'processing' : 'not_applicable',
        cancellationFee,
        currency: booking.payment.currency,
        cancelledAt: new Date().toISOString(),
        refundProcessingTime: refundAmount > 0 ? '7-10 business days' : undefined,
        message: isWithin24Hours
          ? 'Booking cancelled successfully with full refund (24-hour free cancellation)'
          : refundAmount > 0
          ? `Booking cancelled. Refund of ${refundAmount} ${booking.payment.currency} will be processed within 7-10 business days.`
          : 'Booking cancelled. This was a non-refundable ticket.',
      };
    }

    // Update booking in database
    await bookingStorage.update(booking.id, {
      status: 'cancelled',
      cancellationReason: reason || 'Customer requested cancellation',
      cancelledAt: new Date().toISOString(),
      payment: {
        ...booking.payment,
        status: refundAmount > 0 ? 'refunded' : booking.payment.status,
        refundedAt: refundAmount > 0 ? new Date().toISOString() : undefined,
        refundAmount: refundAmount,
      },
    });

    console.log(`✅ Booking ${booking.bookingReference} cancelled successfully`);

    return NextResponse.json({
      success: true,
      data: confirmation,
      meta: {
        timestamp: new Date().toISOString(),
        source: booking.sourceApi || 'Unknown',
      },
    });
  } catch (error: any) {
    console.error('Error confirming cancellation:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to confirm cancellation',
          code: 'CANCELLATION_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
