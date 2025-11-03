import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import { emailService } from '@/lib/email/service';

// Force Node.js runtime and dynamic rendering for database access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - Confirm Payment
 * POST /api/admin/bookings/[id]/confirm
 *
 * This endpoint is used by admins to manually confirm that payment has been received
 * for a booking (e.g., via bank transfer or after manual verification).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log(`✅ Confirming payment for booking: ${id}`);

    // Fetch current booking
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

    // Check if booking is already confirmed
    if (booking.status === 'confirmed' && booking.payment.status === 'paid') {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment already confirmed for this booking',
        },
        { status: 400 }
      );
    }

    // Update booking status to confirmed and payment status to paid
    const updatedBooking = await bookingStorage.update(id, {
      status: 'confirmed',
      payment: {
        ...booking.payment,
        status: 'paid',
        paidAt: new Date().toISOString(),
        transactionId: body.transactionId || `MANUAL_${Date.now()}`,
      },
    });

    if (!updatedBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update booking',
        },
        { status: 500 }
      );
    }

    console.log(`✅ Payment confirmed for booking: ${updatedBooking.bookingReference}`);
    console.log(`   Status: ${updatedBooking.status}`);
    console.log(`   Payment Status: ${updatedBooking.payment.status}`);

    // Send confirmation email to customer
    console.log('📧 Sending booking confirmation email...');
    try {
      await emailService.sendBookingConfirmation(updatedBooking);
      console.log('✅ Confirmation email sent');
    } catch (emailError) {
      console.error('⚠️  Failed to send confirmation email:', emailError);
      // Don't fail the confirmation if email fails
    }

    // TODO: Create Amadeus reservation (if needed)
    // TODO: Trigger post-confirmation workflows

    return NextResponse.json(
      {
        success: true,
        booking: updatedBooking,
        message: 'Payment confirmed successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error confirming payment:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to confirm payment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
