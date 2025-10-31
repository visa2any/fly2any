import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';

/**
 * Admin API - Get Booking by ID
 * GET /api/admin/bookings/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`📋 Fetching booking: ${id}`);

    // Fetch booking from database
    const booking = await bookingStorage.findById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      );
    }

    console.log(`✅ Booking found: ${booking.bookingReference}`);

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error fetching booking:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch booking',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Admin API - Update Booking
 * PATCH /api/admin/bookings/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();

    console.log(`📝 Updating booking: ${id}`, updates);

    // Update booking in database
    const updatedBooking = await bookingStorage.update(id, updates);

    if (!updatedBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      );
    }

    console.log(`✅ Booking updated: ${updatedBooking.bookingReference}`);

    return NextResponse.json(
      {
        success: true,
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error updating booking:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update booking',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Admin API - Delete Booking
 * DELETE /api/admin/bookings/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`🗑️  Deleting booking: ${id}`);

    // Delete booking from database
    const success = await bookingStorage.delete(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      );
    }

    console.log(`✅ Booking deleted: ${id}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error deleting booking:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete booking',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
