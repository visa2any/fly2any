import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';
import { bookingStorage } from '@/lib/bookings/storage';

/**
 * POST /api/orders/modify/request
 * Create a modification request for an order
 *
 * Supports Duffel bookings (Amadeus requires different workflow)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, bookingReference, changes } = body;

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

    if (!changes || !changes.slices) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required field: changes with slices array',
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

    // Check if flight has already departed
    const firstSegment = booking.flight.segments[0];
    const departureTime = new Date(firstSegment.departure.at);
    const now = new Date();

    if (now > departureTime) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Cannot modify a booking after the flight has departed',
            code: 'FLIGHT_DEPARTED',
          },
        },
        { status: 400 }
      );
    }

    // Handle based on source API
    if (booking.sourceApi === 'Duffel' && booking.duffelOrderId) {
      // Use Duffel API for modification request
      console.log(`Creating change request for Duffel order: ${booking.duffelOrderId}`);

      try {
        const changeRequest = await duffelAPI.createOrderChangeRequest(
          booking.duffelOrderId,
          changes
        );

        return NextResponse.json({
          success: true,
          data: {
            changeRequestId: changeRequest.data.id,
            orderId: booking.duffelOrderId,
            bookingReference: booking.bookingReference,
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          meta: {
            timestamp: new Date().toISOString(),
            source: 'Duffel',
          },
        });
      } catch (error: any) {
        console.error('Error creating Duffel change request:', error);

        if (error.message.includes('NOT_CHANGEABLE')) {
          return NextResponse.json(
            {
              success: false,
              error: {
                message: 'This booking cannot be modified. Please contact support.',
                code: 'NOT_CHANGEABLE',
              },
            },
            { status: 400 }
          );
        }

        throw error;
      }
    } else {
      // Amadeus or other bookings
      // Note: Amadeus doesn't provide a direct modification API
      // In production, this would typically involve:
      // 1. Cancel existing booking
      // 2. Create new booking with updated details
      // 3. Process any price difference

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Order modifications are currently only supported for Duffel bookings. Please contact support for assistance with Amadeus bookings.',
            code: 'NOT_SUPPORTED',
          },
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error creating modification request:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to create modification request',
          code: 'MODIFICATION_REQUEST_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
