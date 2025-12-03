/**
 * LiteAPI Webhook Handler
 * POST /api/webhooks/liteapi
 *
 * Handles LiteAPI webhook events for hotel bookings:
 * - booking.confirmed: Booking successfully confirmed
 * - booking.cancelled: Booking was cancelled
 * - booking.modified: Booking details were modified
 * - booking.failed: Booking failed
 * - payment.completed: Payment received
 * - payment.refunded: Refund processed
 *
 * @see https://docs.liteapi.travel/webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// LiteAPI Webhook Event Types
type LiteAPIWebhookEventType =
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'booking.modified'
  | 'booking.failed'
  | 'payment.completed'
  | 'payment.refunded';

interface LiteAPIWebhookPayload {
  event: LiteAPIWebhookEventType;
  timestamp: string;
  data: {
    bookingId: string;
    hotelId?: string;
    hotelName?: string;
    confirmationNumber?: string;
    status?: string;
    checkIn?: string;
    checkOut?: string;
    guest?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    payment?: {
      amount: number;
      currency: string;
      status: string;
    };
    refund?: {
      amount: number;
      currency: string;
      reason?: string;
    };
    cancellation?: {
      cancelledAt: string;
      fee?: number;
      refundAmount?: number;
    };
  };
}

/**
 * Verify LiteAPI webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn('Missing signature or secret for webhook verification');
    return false;
  }

  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.LITEAPI_WEBHOOK_SECRET;

  try {
    const body = await request.text();
    const signature = request.headers.get('x-liteapi-signature');

    // Log webhook receipt
    console.log('[LiteAPI Webhook] Received webhook event');

    // Verify signature if secret is configured
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('[LiteAPI Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    let payload: LiteAPIWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      console.error('[LiteAPI Webhook] Invalid JSON payload');
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { event, timestamp, data } = payload;

    console.log(`[LiteAPI Webhook] Processing event: ${event}`);
    console.log(`[LiteAPI Webhook] Booking ID: ${data.bookingId}`);
    console.log(`[LiteAPI Webhook] Timestamp: ${timestamp}`);

    // Handle different event types
    switch (event) {
      case 'booking.confirmed':
        await handleBookingConfirmed(data);
        break;

      case 'booking.cancelled':
        await handleBookingCancelled(data);
        break;

      case 'booking.modified':
        await handleBookingModified(data);
        break;

      case 'booking.failed':
        await handleBookingFailed(data);
        break;

      case 'payment.completed':
        await handlePaymentCompleted(data);
        break;

      case 'payment.refunded':
        await handlePaymentRefunded(data);
        break;

      default:
        console.log(`[LiteAPI Webhook] Unhandled event type: ${event}`);
    }

    // Return success response (required by LiteAPI)
    return NextResponse.json({
      received: true,
      event,
      bookingId: data.bookingId,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[LiteAPI Webhook] Handler error:', error);
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle booking confirmed event
 */
async function handleBookingConfirmed(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] Booking confirmed: ${data.bookingId}`);
  console.log(`  Hotel: ${data.hotelName}`);
  console.log(`  Confirmation: ${data.confirmationNumber}`);
  console.log(`  Guest: ${data.guest?.firstName} ${data.guest?.lastName}`);
  console.log(`  Check-in: ${data.checkIn}`);
  console.log(`  Check-out: ${data.checkOut}`);

  // TODO: Update local booking database if using one
  // TODO: Send confirmation email to guest
  // TODO: Create notification for user

  // Example: If using Prisma
  // await prisma.hotelBooking.update({
  //   where: { liteapiBookingId: data.bookingId },
  //   data: {
  //     status: 'confirmed',
  //     confirmationNumber: data.confirmationNumber,
  //     confirmedAt: new Date(),
  //   },
  // });
}

/**
 * Handle booking cancelled event
 */
async function handleBookingCancelled(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] Booking cancelled: ${data.bookingId}`);
  console.log(`  Cancelled at: ${data.cancellation?.cancelledAt}`);
  console.log(`  Refund amount: ${data.cancellation?.refundAmount}`);
  console.log(`  Cancellation fee: ${data.cancellation?.fee}`);

  // TODO: Update local booking database
  // TODO: Process refund via payment provider
  // TODO: Send cancellation confirmation email
  // TODO: Create notification for user

  // Example: If using Prisma
  // await prisma.hotelBooking.update({
  //   where: { liteapiBookingId: data.bookingId },
  //   data: {
  //     status: 'cancelled',
  //     cancelledAt: new Date(data.cancellation?.cancelledAt || Date.now()),
  //     refundAmount: data.cancellation?.refundAmount,
  //     cancellationFee: data.cancellation?.fee,
  //   },
  // });
}

/**
 * Handle booking modified event
 */
async function handleBookingModified(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] Booking modified: ${data.bookingId}`);
  console.log(`  New check-in: ${data.checkIn}`);
  console.log(`  New check-out: ${data.checkOut}`);

  // TODO: Update local booking database with new details
  // TODO: Send modification confirmation email
}

/**
 * Handle booking failed event
 */
async function handleBookingFailed(data: LiteAPIWebhookPayload['data']) {
  console.error(`[LiteAPI] Booking failed: ${data.bookingId}`);
  console.error(`  Status: ${data.status}`);

  // TODO: Update local booking database
  // TODO: Send failure notification to user
  // TODO: Process refund if payment was taken
}

/**
 * Handle payment completed event
 */
async function handlePaymentCompleted(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] Payment completed for booking: ${data.bookingId}`);
  console.log(`  Amount: ${data.payment?.amount} ${data.payment?.currency}`);

  // TODO: Update payment status in local database
  // TODO: Send payment receipt email
}

/**
 * Handle payment refunded event
 */
async function handlePaymentRefunded(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] Refund processed for booking: ${data.bookingId}`);
  console.log(`  Refund amount: ${data.refund?.amount} ${data.refund?.currency}`);
  console.log(`  Reason: ${data.refund?.reason || 'Not specified'}`);

  // TODO: Update refund status in local database
  // TODO: Send refund confirmation email
  // TODO: Update user credits if applicable
}

// GET endpoint for webhook health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    webhook: 'liteapi',
    endpoint: '/api/webhooks/liteapi',
    supportedEvents: [
      'booking.confirmed',
      'booking.cancelled',
      'booking.modified',
      'booking.failed',
      'payment.completed',
      'payment.refunded',
    ],
    timestamp: new Date().toISOString(),
  });
}
