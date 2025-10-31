import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import { setCache, generateCacheKey } from '@/lib/cache';

/**
 * Hotel Booking Cancellation API Route
 *
 * POST /api/hotels/booking/[id]/cancel
 *
 * Request cancellation of a hotel booking.
 * Returns cancellation details including refund amount.
 *
 * Note: Cancellation policies vary by property and rate.
 * Some bookings may be non-refundable.
 *
 * Response:
 * {
 *   data: {
 *     id: string; // Cancellation ID
 *     refund_amount: string;
 *     refund_currency: string;
 *     status: string;
 *     ...
 *   }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing booking ID' },
        { status: 400 }
      );
    }

    // Optional: Parse request body for cancellation reason
    let cancellationReason = '';
    try {
      const body = await request.json();
      cancellationReason = body.reason || '';
    } catch {
      // No body is fine
    }

    // Cancel booking using Duffel Stays API
    console.log(`🚫 Cancelling booking: ${bookingId}`);
    if (cancellationReason) {
      console.log(`   Reason: ${cancellationReason}`);
    }

    const cancellation = await duffelStaysAPI.cancelBooking(bookingId);

    console.log('✅ Booking cancelled successfully');
    console.log(`   Cancellation ID: ${cancellation.data.id}`);
    console.log(`   Refund: ${cancellation.data.refund_amount} ${cancellation.data.refund_currency}`);

    // Invalidate cached booking details
    const cacheKey = generateCacheKey('hotels:duffel:booking', { id: bookingId });
    await setCache(cacheKey, null, 0); // Delete cache

    // TODO: Update booking status in database
    // TODO: Send cancellation confirmation email
    // TODO: Update commission tracking (if applicable)

    return NextResponse.json({
      data: cancellation.data,
      meta: {
        cancelledAt: new Date().toISOString(),
        reason: cancellationReason || null,
      },
    });
  } catch (error: any) {
    console.error('❌ Booking cancellation error:', error);

    // Handle specific errors
    if (error.message.includes('ALREADY_CANCELLED')) {
      return NextResponse.json(
        {
          error: 'Already cancelled',
          message: 'This booking has already been cancelled',
          code: 'ALREADY_CANCELLED',
        },
        { status: 409 }
      );
    }

    if (error.message.includes('NOT_CANCELLABLE')) {
      return NextResponse.json(
        {
          error: 'Not cancellable',
          message: 'This booking cannot be cancelled. It may be non-refundable or the cancellation deadline has passed.',
          code: 'NOT_CANCELLABLE',
        },
        { status: 409 }
      );
    }

    if (error.message.includes('not found') || error.message.includes('NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to cancel booking',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
