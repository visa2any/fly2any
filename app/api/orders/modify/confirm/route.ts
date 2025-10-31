import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';
import { bookingStorage } from '@/lib/bookings/storage';
import { OrderChangeConfirmation } from '@/lib/bookings/types';

/**
 * POST /api/orders/modify/confirm
 * Confirm and process an order modification
 *
 * Supports Duffel bookings only
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { changeOfferId, bookingId, bookingReference } = body;

    if (!changeOfferId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required field: changeOfferId',
            code: 'MISSING_FIELDS',
          },
        },
        { status: 400 }
      );
    }

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

    // Check if booking can be modified
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Cannot modify a cancelled booking',
            code: 'BOOKING_CANCELLED',
          },
        },
        { status: 400 }
      );
    }

    // Only Duffel bookings supported
    if (booking.sourceApi !== 'Duffel' || !booking.duffelOrderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Order modifications are currently only supported for Duffel bookings',
            code: 'NOT_SUPPORTED',
          },
        },
        { status: 400 }
      );
    }

    console.log(`Confirming change offer: ${changeOfferId} for booking: ${booking.bookingReference}`);

    try {
      const orderChange = await duffelAPI.confirmOrderChange(changeOfferId);

      // Extract change details
      const changeFee = parseFloat(orderChange.data.change_total_amount || '0');
      const newTotalAmount = parseFloat(orderChange.data.new_total_amount || '0');
      const priceDifference = newTotalAmount - booking.payment.amount;
      const totalCharged = changeFee + (priceDifference > 0 ? priceDifference : 0);

      // Get new order details
      const newOrder = await duffelAPI.getOrder((orderChange.data as any).order_id);

      // Build confirmation response
      const confirmation: OrderChangeConfirmation = {
        success: true,
        orderId: (orderChange.data as any).order_id,
        originalBookingReference: booking.bookingReference,
        newBookingReference: (newOrder.data as any).booking_reference,
        changeId: orderChange.data.id,
        status: 'confirmed',
        changeFee,
        priceDifference,
        totalCharged,
        currency: orderChange.data.change_total_currency || booking.payment.currency,
        changedAt: new Date().toISOString(),
        paymentReference: orderChange.data.id,
        message: totalCharged > 0
          ? `Booking modified successfully. Additional charge of ${totalCharged} ${booking.payment.currency} has been applied.`
          : priceDifference < 0
          ? `Booking modified successfully. Refund of ${Math.abs(priceDifference)} ${booking.payment.currency} will be processed.`
          : 'Booking modified successfully with no additional charges.',
      };

      // Update booking in database with new flight details
      await bookingStorage.update(booking.id, {
        duffelOrderId: (orderChange.data as any).order_id,
        duffelBookingReference: (newOrder.data as any).booking_reference,
        flight: {
          ...booking.flight,
          segments: newOrder.data.slices.flatMap((slice: any) =>
            slice.segments.map((segment: any) => ({
              id: segment.id,
              departure: {
                iataCode: segment.origin.iata_code,
                terminal: segment.origin.terminal,
                at: segment.departing_at,
              },
              arrival: {
                iataCode: segment.destination.iata_code,
                terminal: segment.destination.terminal,
                at: segment.arriving_at,
              },
              carrierCode: segment.marketing_carrier.iata_code,
              flightNumber: segment.marketing_carrier_flight_number,
              aircraft: segment.aircraft?.iata_code,
              duration: segment.duration,
              class: segment.passengers?.[0]?.cabin_class || 'economy',
            }))
          ),
        },
        payment: {
          ...booking.payment,
          amount: newTotalAmount,
        },
        notes: `${booking.notes || ''}\nModified on ${new Date().toISOString()} - Change ID: ${orderChange.data.id}`.trim(),
      });

      console.log(`✅ Booking ${booking.bookingReference} modified successfully`);

      return NextResponse.json({
        success: true,
        data: confirmation,
        meta: {
          timestamp: new Date().toISOString(),
          source: 'Duffel',
        },
      });
    } catch (error: any) {
      console.error('Error confirming order change:', error);

      // Handle specific errors
      if (error.message.includes('OFFER_EXPIRED')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'This change offer has expired. Please request a new modification.',
              code: 'OFFER_EXPIRED',
            },
          },
          { status: 400 }
        );
      }

      if (error.message.includes('PRICE_CHANGED')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'The price for this change has changed. Please review the new price.',
              code: 'PRICE_CHANGED',
            },
          },
          { status: 400 }
        );
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Error confirming modification:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to confirm modification',
          code: 'MODIFICATION_CONFIRM_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
