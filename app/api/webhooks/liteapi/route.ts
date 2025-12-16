/**
 * LiteAPI Webhook Handler (PRODUCTION IMPLEMENTATION)
 * POST /api/webhooks/liteapi
 *
 * Handles LiteAPI webhook events for hotel bookings with:
 * - Real database updates
 * - Email notifications
 * - Idempotency checks
 * - Comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';
import { mailgunClient, MAILGUN_CONFIG } from '@/lib/email/mailgun-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  webhookId?: string;
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

function verifyWebhookSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  try {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.LITEAPI_WEBHOOK_SECRET;

  try {
    const body = await request.text();
    const signature = request.headers.get('x-liteapi-signature');

    console.log('[LiteAPI Webhook] Received event');

    // Verify signature
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('[LiteAPI Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let payload: LiteAPIWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { event, timestamp, data, webhookId } = payload;

    // Idempotency check - prevent duplicate processing
    if (webhookId) {
      const existing = await prisma.webhookEvent.findUnique({
        where: { id: webhookId },
      }).catch(() => null);

      if (existing?.status === 'processed') {
        console.log(`[LiteAPI] Skipping duplicate webhook: ${webhookId}`);
        return NextResponse.json({ received: true, duplicate: true });
      }
    }

    // Log webhook to database
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        id: webhookId || `liteapi_${Date.now()}`,
        eventType: event,
        eventData: payload as any,
        status: 'processing',
        receivedAt: new Date(timestamp || Date.now()),
      },
    }).catch(() => null);

    console.log(`[LiteAPI] Processing: ${event} | Booking: ${data.bookingId}`);

    try {
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
          console.log(`[LiteAPI] Unhandled event: ${event}`);
      }

      // Mark webhook as processed
      if (webhookEvent) {
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { status: 'processed', processedAt: new Date() },
        }).catch(() => null);
      }
    } catch (handlerError: any) {
      console.error(`[LiteAPI] Handler error:`, handlerError);
      if (webhookEvent) {
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { status: 'failed', errorMessage: handlerError.message },
        }).catch(() => null);
      }
    }

    return NextResponse.json({
      received: true,
      event,
      bookingId: data.bookingId,
      processedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[LiteAPI Webhook] Error:', error);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

async function handleBookingConfirmed(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] ✅ Booking confirmed: ${data.bookingId}`);

  // Update hotel booking in database
  const updated = await prisma.hotelBooking.updateMany({
    where: {
      OR: [
        { liteApiBookingId: data.bookingId },
        { confirmationNumber: data.confirmationNumber },
      ],
    },
    data: {
      status: 'confirmed',
      confirmationNumber: data.confirmationNumber || undefined,
      updatedAt: new Date(),
    },
  }).catch(() => ({ count: 0 }));

  if (updated.count === 0) {
    console.warn(`[LiteAPI] No booking found for ID: ${data.bookingId}`);
  } else {
    console.log(`[LiteAPI] Updated ${updated.count} booking(s)`);
  }

  // Get booking details for email
  const booking = await prisma.hotelBooking.findFirst({
    where: {
      OR: [
        { liteApiBookingId: data.bookingId },
        { confirmationNumber: data.confirmationNumber },
      ],
    },
    include: { user: true },
  }).catch(() => null);

  // Send confirmation email
  const guestEmail = data.guest?.email || booking?.user?.email || booking?.guestEmail;
  if (guestEmail && mailgunClient.isConfigured()) {
    await mailgunClient.send({
      from: MAILGUN_CONFIG.fromEmail,
      to: guestEmail,
      subject: `✅ Hotel Booking Confirmed - ${data.hotelName || 'Your Stay'}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#10b981;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;">Booking Confirmed!</h1>
          </div>
          <div style="background:#f8fafc;padding:20px;border:1px solid #e5e7eb;border-radius:0 0 8px 8px;">
            <p>Hi ${data.guest?.firstName || 'Guest'},</p>
            <p>Great news! Your hotel booking has been confirmed.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="padding:8px 0;"><strong>Hotel:</strong></td><td>${data.hotelName || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;"><strong>Confirmation:</strong></td><td style="font-family:monospace;font-size:16px;color:#2563eb;">${data.confirmationNumber || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;"><strong>Check-in:</strong></td><td>${data.checkIn || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;"><strong>Check-out:</strong></td><td>${data.checkOut || 'N/A'}</td></tr>
            </table>
            <p>Have a wonderful stay!</p>
            <p style="color:#6b7280;font-size:14px;">- Fly2Any Team</p>
          </div>
        </div>
      `,
      text: `Booking Confirmed!\n\nHotel: ${data.hotelName}\nConfirmation: ${data.confirmationNumber}\nCheck-in: ${data.checkIn}\nCheck-out: ${data.checkOut}`,
      tags: ['hotel', 'confirmation', 'liteapi'],
    }).catch((err) => console.error('[LiteAPI] Email failed:', err));
  }

  // Create in-app notification
  if (booking?.userId) {
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'booking_confirmed',
        title: 'Hotel Booking Confirmed',
        message: `Your booking at ${data.hotelName} has been confirmed. Confirmation: ${data.confirmationNumber}`,
        metadata: { bookingId: data.bookingId, confirmationNumber: data.confirmationNumber },
      },
    }).catch(() => null);
  }
}

async function handleBookingCancelled(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] ❌ Booking cancelled: ${data.bookingId}`);

  const updated = await prisma.hotelBooking.updateMany({
    where: {
      OR: [
        { liteApiBookingId: data.bookingId },
        { confirmationNumber: data.confirmationNumber },
      ],
    },
    data: {
      status: 'cancelled',
      updatedAt: new Date(),
    },
  }).catch(() => ({ count: 0 }));

  console.log(`[LiteAPI] Cancelled ${updated.count} booking(s)`);

  // Get booking for notification
  const booking = await prisma.hotelBooking.findFirst({
    where: { liteApiBookingId: data.bookingId },
    include: { user: true },
  }).catch(() => null);

  // Send cancellation email
  const guestEmail = data.guest?.email || booking?.user?.email || booking?.guestEmail;
  if (guestEmail && mailgunClient.isConfigured()) {
    await mailgunClient.send({
      from: MAILGUN_CONFIG.fromEmail,
      to: guestEmail,
      subject: `Booking Cancelled - ${data.bookingId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#ef4444;">Booking Cancelled</h2>
          <p>Your hotel booking has been cancelled.</p>
          <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          ${data.cancellation?.refundAmount ? `<p><strong>Refund Amount:</strong> $${data.cancellation.refundAmount}</p>` : ''}
          <p style="color:#6b7280;">If you have questions, please contact support.</p>
        </div>
      `,
      text: `Booking Cancelled\nBooking ID: ${data.bookingId}\nRefund: ${data.cancellation?.refundAmount || 'N/A'}`,
      tags: ['hotel', 'cancellation', 'liteapi'],
    }).catch(() => null);
  }

  // Notification
  if (booking?.userId) {
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'booking_cancelled',
        title: 'Hotel Booking Cancelled',
        message: `Your booking ${data.bookingId} has been cancelled.${data.cancellation?.refundAmount ? ` Refund: $${data.cancellation.refundAmount}` : ''}`,
        metadata: { bookingId: data.bookingId },
      },
    }).catch(() => null);
  }
}

async function handleBookingModified(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] 📝 Booking modified: ${data.bookingId}`);

  await prisma.hotelBooking.updateMany({
    where: { liteApiBookingId: data.bookingId },
    data: {
      checkInDate: data.checkIn ? new Date(data.checkIn) : undefined,
      checkOutDate: data.checkOut ? new Date(data.checkOut) : undefined,
      updatedAt: new Date(),
    },
  }).catch(() => null);

  // Get booking for notification
  const booking = await prisma.hotelBooking.findFirst({
    where: { liteApiBookingId: data.bookingId },
  }).catch(() => null);

  if (booking?.userId) {
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'booking_modified',
        title: 'Hotel Booking Updated',
        message: `Your booking ${data.bookingId} has been modified. New dates: ${data.checkIn} - ${data.checkOut}`,
        metadata: { bookingId: data.bookingId },
      },
    }).catch(() => null);
  }
}

async function handleBookingFailed(data: LiteAPIWebhookPayload['data']) {
  console.error(`[LiteAPI] ⚠️ Booking failed: ${data.bookingId} - ${data.status}`);

  await prisma.hotelBooking.updateMany({
    where: { liteApiBookingId: data.bookingId },
    data: {
      status: 'failed',
      updatedAt: new Date(),
    },
  }).catch(() => null);

  // Alert admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && mailgunClient.isConfigured()) {
    await mailgunClient.send({
      from: MAILGUN_CONFIG.fromEmail,
      to: adminEmail,
      subject: `🚨 Hotel Booking Failed - ${data.bookingId}`,
      html: `<p>Booking ${data.bookingId} failed with status: ${data.status}</p>`,
      text: `Booking ${data.bookingId} failed: ${data.status}`,
      tags: ['admin', 'alert', 'booking-failed'],
    }).catch(() => null);
  }
}

async function handlePaymentCompleted(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] 💰 Payment completed: ${data.bookingId} - ${data.payment?.amount} ${data.payment?.currency}`);

  await prisma.hotelBooking.updateMany({
    where: { liteApiBookingId: data.bookingId },
    data: {
      paymentStatus: 'paid',
      totalPrice: data.payment?.amount,
      currency: data.payment?.currency,
      updatedAt: new Date(),
    },
  }).catch(() => null);
}

async function handlePaymentRefunded(data: LiteAPIWebhookPayload['data']) {
  console.log(`[LiteAPI] 💸 Refund processed: ${data.bookingId} - ${data.refund?.amount} ${data.refund?.currency}`);

  await prisma.hotelBooking.updateMany({
    where: { liteApiBookingId: data.bookingId },
    data: {
      paymentStatus: 'refunded',
      updatedAt: new Date(),
    },
  }).catch(() => null);

  const booking = await prisma.hotelBooking.findFirst({
    where: { liteApiBookingId: data.bookingId },
  }).catch(() => null);

  if (booking?.userId) {
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `Your refund of ${data.refund?.amount} ${data.refund?.currency} has been processed.`,
        metadata: { bookingId: data.bookingId, amount: data.refund?.amount },
      },
    }).catch(() => null);
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    webhook: 'liteapi',
    endpoint: '/api/webhooks/liteapi',
    supportedEvents: ['booking.confirmed', 'booking.cancelled', 'booking.modified', 'booking.failed', 'payment.completed', 'payment.refunded'],
    implementation: 'PRODUCTION',
    timestamp: new Date().toISOString(),
  });
}
