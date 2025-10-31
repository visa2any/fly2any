import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';
import { bookingStorage, calculateRefund } from '@/lib/bookings/storage';
import { OrderCancellationQuote } from '@/lib/bookings/types';

/**
 * POST /api/orders/cancel/quote
 * Get a cancellation quote for an order
 *
 * Supports both Duffel and Amadeus bookings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, bookingReference } = body;

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

    // Handle based on source API
    let quote: OrderCancellationQuote;

    if (booking.sourceApi === 'Duffel' && booking.duffelOrderId) {
      // Use Duffel API for cancellation quote
      console.log(`Getting Duffel cancellation quote for order: ${booking.duffelOrderId}`);

      try {
        const duffelQuote = await duffelAPI.getOrderCancellationQuote(booking.duffelOrderId);

        // Check if it's within 24-hour free cancellation window
        const bookingAge = now.getTime() - new Date(booking.createdAt).getTime();
        const isWithin24Hours = bookingAge < 24 * 60 * 60 * 1000;

        const refundAmount = parseFloat(duffelQuote.data.refund_amount || '0');
        const cancellationFee = isWithin24Hours ? 0 : (booking.payment.amount - refundAmount);

        quote = {
          orderId: booking.duffelOrderId,
          bookingReference: booking.bookingReference,
          refundable: refundAmount > 0 || isWithin24Hours,
          refundAmount: isWithin24Hours ? booking.payment.amount : refundAmount,
          cancellationFee: cancellationFee,
          currency: duffelQuote.data.refund_currency || booking.payment.currency,
          refundMethod: refundAmount > 0 ? 'original_payment' : 'not_refundable',
          processingTime: '7-10 business days',
          warnings: isWithin24Hours
            ? ['Free cancellation available within 24 hours of booking']
            : undefined,
        };
      } catch (error: any) {
        console.error('Error getting Duffel cancellation quote:', error);

        // Fallback to policy-based calculation
        const refundCalc = calculateRefund(booking);
        quote = {
          orderId: booking.duffelOrderId,
          bookingReference: booking.bookingReference,
          refundable: refundCalc.refundAmount > 0,
          refundAmount: refundCalc.refundAmount,
          cancellationFee: refundCalc.cancellationFee,
          currency: booking.payment.currency,
          refundMethod: refundCalc.refundAmount > 0 ? 'original_payment' : 'not_refundable',
          processingTime: '7-10 business days',
          warnings: ['Cancellation quote based on booking policy'],
        };
      }
    } else {
      // Amadeus or other bookings - use refund policy
      const refundCalc = calculateRefund(booking);

      // Check 24-hour free cancellation
      const bookingAge = now.getTime() - new Date(booking.createdAt).getTime();
      const isWithin24Hours = bookingAge < 24 * 60 * 60 * 1000;

      quote = {
        orderId: booking.amadeusBookingId || booking.id,
        bookingReference: booking.bookingReference,
        refundable: isWithin24Hours || refundCalc.refundAmount > 0,
        refundAmount: isWithin24Hours ? booking.payment.amount : refundCalc.refundAmount,
        cancellationFee: isWithin24Hours ? 0 : refundCalc.cancellationFee,
        currency: booking.payment.currency,
        refundMethod: isWithin24Hours || refundCalc.refundAmount > 0 ? 'original_payment' : 'not_refundable',
        processingTime: '7-10 business days',
        deadline: booking.refundPolicy?.refundDeadline,
        warnings: isWithin24Hours
          ? ['Free cancellation available within 24 hours of booking']
          : refundCalc.refundAmount === 0
          ? ['This booking is non-refundable']
          : undefined,
      };
    }

    return NextResponse.json({
      success: true,
      data: quote,
      meta: {
        timestamp: new Date().toISOString(),
        source: booking.sourceApi || 'Unknown',
      },
    });
  } catch (error: any) {
    console.error('Error getting cancellation quote:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to get cancellation quote',
          code: 'CANCELLATION_QUOTE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
