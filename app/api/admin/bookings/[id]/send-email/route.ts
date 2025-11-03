import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import { emailService } from '@/lib/email/service';

// Force Node.js runtime and dynamic rendering for database access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - Send Booking Email
 * POST /api/admin/bookings/[id]/send-email
 *
 * Send various types of emails to customers:
 * - confirmation: Booking confirmation email
 * - payment_instructions: Payment instructions email
 * - reminder: Flight reminder email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { emailType } = body;

    console.log(`📧 Sending ${emailType} email for booking: ${id}`);

    // Fetch booking
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

    // Send appropriate email based on type
    let emailSent = false;

    switch (emailType) {
      case 'confirmation':
        emailSent = await emailService.sendBookingConfirmation(booking);
        break;

      case 'payment_instructions':
        emailSent = await emailService.sendPaymentInstructions(booking);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid email type. Use: confirmation, payment_instructions',
          },
          { status: 400 }
        );
    }

    if (emailSent) {
      console.log(`✅ ${emailType} email sent to: ${booking.contactInfo.email}`);

      return NextResponse.json(
        {
          success: true,
          message: `${emailType} email sent successfully`,
          recipient: booking.contactInfo.email,
        },
        { status: 200 }
      );
    } else {
      console.warn(`⚠️  Email service not configured or failed to send`);

      return NextResponse.json(
        {
          success: false,
          error: 'Email service not configured. Please set RESEND_API_KEY environment variable.',
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error sending email:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
