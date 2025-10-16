import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage, canModifyBooking } from '@/lib/bookings/storage';
import type { Booking, APIResponse, BookingUpdateRequest } from '@/lib/bookings/types';

/**
 * GET /api/bookings/[id]
 * Retrieve a single booking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Booking ID is required',
          code: 'MISSING_BOOKING_ID',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Retrieve booking
    const booking = await bookingStorage.findById(id);

    if (!booking) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Return successful response
    const response: APIResponse<{ booking: Booking }> = {
      success: true,
      data: {
        booking,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('GET /api/bookings/[id] error:', error);

    const errorResponse: APIResponse<null> = {
      success: false,
      error: {
        message: error.message || 'Failed to retrieve booking',
        code: 'FETCH_ERROR',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/bookings/[id]
 * Update an existing booking
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: BookingUpdateRequest = await request.json();

    // Validate ID
    if (!id) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Booking ID is required',
          code: 'MISSING_BOOKING_ID',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Retrieve existing booking
    const existingBooking = await bookingStorage.findById(id);

    if (!existingBooking) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if booking can be modified
    const modificationCheck = canModifyBooking(existingBooking);
    if (!modificationCheck.allowed) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: modificationCheck.reason || 'Booking cannot be modified',
          code: 'MODIFICATION_NOT_ALLOWED',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Prepare updates
    const updates: Partial<Booking> = {};

    if (body.contactInfo) {
      updates.contactInfo = {
        ...existingBooking.contactInfo,
        ...body.contactInfo,
      };
    }

    if (body.passengers) {
      // Merge passenger updates
      updates.passengers = existingBooking.passengers.map((passenger, index) => {
        const passengerUpdate = body.passengers?.[index];
        return passengerUpdate ? { ...passenger, ...passengerUpdate } : passenger;
      });
    }

    if (body.seats) {
      updates.seats = body.seats;
    }

    if (body.specialRequests) {
      updates.specialRequests = body.specialRequests;
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes;
    }

    // Update booking
    const updatedBooking = await bookingStorage.update(id, updates);

    if (!updatedBooking) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Failed to update booking',
          code: 'UPDATE_FAILED',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Return successful response
    const response: APIResponse<{ booking: Booking }> = {
      success: true,
      data: {
        booking: updatedBooking,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('PUT /api/bookings/[id] error:', error);

    const errorResponse: APIResponse<null> = {
      success: false,
      error: {
        message: error.message || 'Failed to update booking',
        code: 'UPDATE_ERROR',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/bookings/[id]
 * Cancel a specific booking (alternative to DELETE /api/bookings?id=xxx)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Customer request';

    // Validate ID
    if (!id) {
      const errorResponse: APIResponse<null> = {
        success: false,
        error: {
          message: 'Booking ID is required',
          code: 'MISSING_BOOKING_ID',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Forward to main DELETE endpoint logic
    // (We could extract this to a shared function, but for simplicity we'll redirect)
    const baseUrl = request.url.split('/api/')[0];
    const deleteUrl = `${baseUrl}/api/bookings?id=${id}&reason=${encodeURIComponent(reason)}`;

    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: request.headers,
    });

    const data = await deleteResponse.json();
    return NextResponse.json(data, { status: deleteResponse.status });

  } catch (error: any) {
    console.error('DELETE /api/bookings/[id] error:', error);

    const errorResponse: APIResponse<null> = {
      success: false,
      error: {
        message: error.message || 'Failed to cancel booking',
        code: 'CANCELLATION_ERROR',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
