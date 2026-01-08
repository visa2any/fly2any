/**
 * Notification Service
 * Handles all customer and admin notifications for booking events
 *
 * UNIFIED EMAIL ARCHITECTURE:
 * - Uses Mailgun via unified mailgunClient (single provider)
 * - Telegram Bot notifications (FREE) for admin alerts
 * - SSE (Server-Sent Events) for real-time updates (FREE)
 * - In-app notifications stored in database
 *
 * @version 2.0.0 - Migrated from Resend to Mailgun
 */

import { mailgunClient, MAILGUN_CONFIG } from '@/lib/email/mailgun-client';
import type { Booking } from '@/lib/bookings/types';
import type { DuffelOrder } from '@/lib/webhooks/event-handlers';
import { getPrismaClient } from '@/lib/prisma';
import type { BookingNotificationPayload } from './types';

// Configuration
const FROM_EMAIL = MAILGUN_CONFIG.fromEmail;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fly2any.com';
const COMPANY_NAME = 'Fly2Any';
const SUPPORT_EMAIL = 'support@fly2any.com';

// Telegram Configuration (FREE) - Trim to remove any trailing newlines from env vars
const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const TELEGRAM_ADMIN_CHAT_IDS = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '')
  .trim()
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

// ==========================================
// SSE (Server-Sent Events) Infrastructure
// ==========================================

interface SSEClient {
  id: string;
  type: 'admin' | 'customer';
  userId?: string;
  bookingReference?: string;
  controller: ReadableStreamDefaultController;
  connectedAt: Date;
}

// Global SSE client registry
const sseClients: Map<string, SSEClient> = new Map();

/**
 * Register a new SSE client connection
 */
export function registerSSEClient(
  clientId: string,
  type: 'admin' | 'customer',
  controller: ReadableStreamDefaultController,
  userId?: string,
  bookingReference?: string
): void {
  sseClients.set(clientId, {
    id: clientId,
    type,
    userId,
    bookingReference,
    controller,
    connectedAt: new Date(),
  });
  console.log(`📡 SSE client connected: ${clientId} (${type}) - Total: ${sseClients.size}`);
}

/**
 * Unregister an SSE client
 */
export function unregisterSSEClient(clientId: string): void {
  sseClients.delete(clientId);
  console.log(`📡 SSE client disconnected: ${clientId} - Total: ${sseClients.size}`);
}

/**
 * Broadcast event to SSE clients
 */
export function broadcastSSE(
  targetType: 'admin' | 'customer' | 'all',
  eventName: string,
  data: any,
  targetUserId?: string,
  targetBookingRef?: string
): void {
  const encoder = new TextEncoder();
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const message = `id: ${eventId}\nevent: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

  let sentCount = 0;

  sseClients.forEach((client, clientId) => {
    try {
      // Determine if this client should receive the event
      const shouldReceive =
        targetType === 'all' ||
        client.type === targetType ||
        (targetUserId && client.userId === targetUserId) ||
        (targetBookingRef && client.bookingReference === targetBookingRef);

      if (shouldReceive) {
        client.controller.enqueue(encoder.encode(message));
        sentCount++;
      }
    } catch (error) {
      console.error(`❌ SSE broadcast error for ${clientId}:`, error);
      sseClients.delete(clientId); // Remove dead connection
    }
  });

  if (sentCount > 0) {
    console.log(`📡 SSE broadcast: ${eventName} to ${sentCount} clients`);
  }
}

/**
 * Get SSE connection stats
 */
export function getSSEStats(): { admin: number; customer: number; total: number } {
  let admin = 0, customer = 0;
  sseClients.forEach(client => {
    if (client.type === 'admin') admin++;
    else customer++;
  });
  return { admin, customer, total: sseClients.size };
}

// ==========================================
// Telegram Bot Integration (FREE)
// ==========================================

/**
 * Send message to Telegram with retry logic
 */
async function sendTelegramMessage(
  chatId: string,
  message: string,
  retries: number = 3,
  retryDelay: number = 1000
): Promise<{ success: boolean; error?: string; messageId?: number }> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️ Telegram bot token not configured - skipping');
    return { success: false, error: 'TELEGRAM_BOT_TOKEN not configured' };
  }

  // Validate chat ID format (should be numeric or @username)
  if (!chatId || (!chatId.match(/^-?\d+$/) && !chatId.startsWith('@'))) {
    console.error('❌ Invalid Telegram chat ID format:', chatId);
    return { success: false, error: 'Invalid chat ID format' };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        }
      );

      const result = await response.json();

      if (!result.ok) {
        // Handle specific Telegram errors
        const errorCode = result.error_code;
        const errorDesc = result.description || 'Unknown error';

        // Don't retry on permanent errors
        if (errorCode === 400 || errorCode === 403 || errorCode === 404) {
          console.error(`❌ Telegram permanent error (${errorCode}):`, errorDesc);
          return { success: false, error: `[${errorCode}] ${errorDesc}` };
        }

        // Retry on transient errors (429 rate limit, 5xx server errors)
        if (attempt < retries) {
          const delay = errorCode === 429
            ? (result.parameters?.retry_after || 5) * 1000
            : retryDelay * attempt;
          console.warn(`⚠️ Telegram attempt ${attempt}/${retries} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        return { success: false, error: `[${errorCode}] ${errorDesc}` };
      }

      return {
        success: true,
        messageId: result.result?.message_id,
      };
    } catch (error: any) {
      console.error(`❌ Telegram attempt ${attempt}/${retries} exception:`, error.message);

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Notify all admin Telegram chats with error tracking
 */
export async function notifyTelegramAdmins(message: string): Promise<{
  sent: number;
  failed: number;
  errors: Array<{ chatId: string; error: string }>;
}> {
  if (TELEGRAM_ADMIN_CHAT_IDS.length === 0) {
    console.warn('⚠️ No Telegram admin chat IDs configured');
    return { sent: 0, failed: 0, errors: [] };
  }

  const results = await Promise.allSettled(
    TELEGRAM_ADMIN_CHAT_IDS.map(async chatId => {
      const trimmedId = chatId.trim();
      const result = await sendTelegramMessage(trimmedId, message);
      return { chatId: trimmedId, ...result };
    })
  );

  const errors: Array<{ chatId: string; error: string }> = [];
  let sent = 0;
  let failed = 0;

  results.forEach(r => {
    if (r.status === 'fulfilled') {
      if (r.value.success) {
        sent++;
      } else {
        failed++;
        errors.push({ chatId: r.value.chatId, error: r.value.error || 'Unknown error' });
      }
    } else {
      failed++;
      errors.push({ chatId: 'unknown', error: r.reason?.message || 'Promise rejected' });
    }
  });

  console.log(`📱 Telegram notifications: ${sent} sent, ${failed} failed of ${TELEGRAM_ADMIN_CHAT_IDS.length}`);

  if (errors.length > 0) {
    console.warn('⚠️ Telegram errors:', errors);
  }

  return { sent, failed, errors };
}

/**
 * Format booking for Telegram message
 */
function formatTelegramBookingAlert(payload: BookingNotificationPayload, alertType: 'new' | 'ticketed'): string {
  const statusEmoji = {
    pending_ticketing: '🟡',
    ticketed: '✅',
    confirmed: '🟢',
    cancelled: '❌',
  }[payload.status] || '📋';

  const header = alertType === 'new'
    ? '🎫 <b>NEW BOOKING ALERT</b>'
    : '✈️ <b>TICKET ISSUED</b>';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com';

  return `
${header}

${statusEmoji} <b>Status:</b> ${payload.status.replace(/_/g, ' ').toUpperCase()}
📋 <b>Reference:</b> <code>${payload.bookingReference}</code>

👤 <b>Customer:</b> ${payload.customerName}
📧 <b>Email:</b> ${payload.customerEmail}
${payload.customerPhone ? `📞 <b>Phone:</b> ${payload.customerPhone}` : ''}

✈️ <b>Route:</b> ${payload.route}
📅 <b>Date:</b> ${payload.departureDate}
👥 <b>Passengers:</b> ${payload.passengerCount}

💰 <b>Total:</b> ${payload.currency} ${payload.totalAmount.toLocaleString()}
${payload.eticketNumbers?.length ? `\n🎫 <b>E-Tickets:</b> ${payload.eticketNumbers.join(', ')}` : ''}
${payload.airlineRecordLocator ? `✈️ <b>PNR:</b> ${payload.airlineRecordLocator}` : ''}

🔗 <a href="${baseUrl}/admin/bookings/${payload.bookingId}">View in Dashboard</a>
`.trim();
}

// ==========================================
// Enhanced Notification Methods
// ==========================================

/**
 * Notify admin of new booking (Telegram + SSE + Email + Database)
 */
export async function notifyNewBooking(payload: BookingNotificationPayload): Promise<void> {
  console.log(`📤 Sending new booking notifications: ${payload.bookingReference}`);

  // 1. Telegram notification (instant mobile alert)
  const telegramMessage = formatTelegramBookingAlert(payload, 'new');
  await notifyTelegramAdmins(telegramMessage);

  // 2. SSE broadcast (real-time dashboard update)
  broadcastSSE('admin', 'booking_created', {
    type: 'booking_created',
    bookingReference: payload.bookingReference,
    timestamp: new Date().toISOString(),
    payload,
  });

  // 3. Store in-app notification for admins
  try {
    const prisma = getPrismaClient();
    const admins = await prisma.adminUser.findMany({ select: { userId: true } });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.userId,
          type: 'booking',
          title: `🎫 New Booking: ${payload.bookingReference}`,
          message: `${payload.customerName} - ${payload.route} on ${payload.departureDate}`,
          priority: 'high',
          actionUrl: `/admin/bookings/${payload.bookingId}`,
          metadata: payload as unknown as Record<string, any>,
        })),
      });
      console.log(`✅ Created ${admins.length} admin notifications`);
    }
  } catch (error) {
    console.error('❌ Error creating admin notifications:', error);
  }

  // 4. Admin email notification
  await sendAdminAlert({
    type: 'new_booking',
    bookingReference: payload.bookingReference,
    customer: payload.customerName,
    route: payload.route,
    amount: payload.totalAmount,
    currency: payload.currency,
    timestamp: new Date().toISOString(),
    priority: 'high',
  });

  console.log(`✅ All new booking notifications sent: ${payload.bookingReference}`);
}

/**
 * Notify customer when ticket is issued (SSE + Email + Database)
 */
export async function notifyTicketIssued(payload: BookingNotificationPayload): Promise<void> {
  console.log(`📤 Sending ticket issued notifications: ${payload.bookingReference}`);

  // 1. Telegram notification to admins
  const telegramMessage = formatTelegramBookingAlert(payload, 'ticketed');
  await notifyTelegramAdmins(telegramMessage);

  // 2. SSE broadcast to customer chat widget
  broadcastSSE('customer', 'booking_ticketed', {
    type: 'booking_ticketed',
    bookingReference: payload.bookingReference,
    status: 'ticketed',
    eticketNumbers: payload.eticketNumbers,
    airlineRecordLocator: payload.airlineRecordLocator,
    timestamp: new Date().toISOString(),
  }, undefined, payload.bookingReference);

  // 3. SSE broadcast to admin dashboard
  broadcastSSE('admin', 'booking_ticketed', {
    type: 'booking_ticketed',
    bookingReference: payload.bookingReference,
    ticketedBy: payload.ticketedBy,
    timestamp: new Date().toISOString(),
  });

  // 4. Customer in-app notification
  if (payload.customerEmail) {
    try {
      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { email: payload.customerEmail },
        select: { id: true },
      });

      if (user) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'booking',
            title: `✈️ E-Ticket Ready: ${payload.bookingReference}`,
            message: `Your flight to ${payload.route.split('→')[1]?.trim() || 'destination'} is confirmed! PNR: ${payload.airlineRecordLocator}`,
            priority: 'high',
            actionUrl: `/my-trips/${payload.bookingReference}`,
            metadata: payload as unknown as Record<string, any>,
          },
        });
        console.log(`✅ Customer notification created for: ${payload.customerEmail}`);
      }
    } catch (error) {
      console.error('❌ Error creating customer notification:', error);
    }
  }

  console.log(`✅ All ticket issued notifications sent: ${payload.bookingReference}`);
}

/**
 * Broadcast booking status change via SSE
 */
export function notifyBookingStatusChange(
  bookingReference: string,
  oldStatus: string,
  newStatus: string,
  metadata?: Record<string, any>
): void {
  broadcastSSE('all', 'booking_status_changed', {
    type: 'booking_status_changed',
    bookingReference,
    oldStatus,
    newStatus,
    timestamp: new Date().toISOString(),
    metadata,
  });
}

/**
 * Email Templates
 */

function getBaseEmailTemplate(title: string, content: string, accentColor: string = '#2563eb'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✈️ ${COMPANY_NAME}</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    ${content}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <div style="text-align: center;">
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Need help? Contact our support team:</p>
      <a href="mailto:${SUPPORT_EMAIL}" style="display: inline-block; background: ${accentColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Support</a>
    </div>

    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
      This email was sent by ${COMPANY_NAME}<br>
      ${new Date().toLocaleDateString()}
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Order Created Email
 */
export async function sendOrderCreatedEmail(booking: Booking, order: DuffelOrder): Promise<boolean> {
  try {
    const subject = `Order Created - ${booking.bookingReference}`;

    const content = `
      <h2 style="color: #1f2937; margin-top: 0;">Order Created Successfully</h2>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>Your flight order has been created successfully in our system. We're now processing your booking.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Booking Reference:</strong></td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 16px; color: #2563eb;">${booking.bookingReference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Duffel Order ID:</strong></td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 14px; color: #6b7280;">${order.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Route:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Departure:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${new Date(booking.flight.segments[0].departure.at).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Passengers:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${booking.passengers.length}</td>
          </tr>
          <tr style="border-top: 2px solid #d1d5db;">
            <td style="padding: 12px 0;"><strong style="font-size: 18px;">Total Amount:</strong></td>
            <td style="padding: 12px 0; text-align: right; font-size: 20px; color: #059669; font-weight: bold;">${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #78350f;"><strong>⏳ Next Steps:</strong> We'll send you a confirmation email once payment is processed.</p>
      </div>
    `;

    const html = getBaseEmailTemplate(subject, content);

    const text = `
Order Created - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

Your flight order has been created successfully. We're now processing your booking.

Booking Reference: ${booking.bookingReference}
Route: ${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}
Total: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}

We'll send you a confirmation email once payment is processed.

Best regards,
${COMPANY_NAME} Team
    `;

    const result = await mailgunClient.send({
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      tags: ['booking', 'order-created'],
    });

    if (result.success) {
      console.log('✅ [Notification] Order created email sent:', booking.bookingReference);
    }
    return result.success;
  } catch (error) {
    console.error('❌ [Notification] Error sending order created email:', error);
    return false;
  }
}

/**
 * Order Failed Email
 */
export async function sendOrderFailedEmail(booking: Booking, errorMessage: string): Promise<boolean> {
  try {
    const subject = `Order Creation Failed - ${booking.bookingReference}`;

    const content = `
      <h2 style="color: #dc2626; margin-top: 0;">⚠️ Order Creation Failed</h2>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>We're sorry, but there was an issue creating your flight order.</p>

      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b;"><strong>Error:</strong> ${errorMessage}</p>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</p>
      </div>

      <p>Our team has been notified and will investigate this issue. We'll contact you shortly to resolve this.</p>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af;">💡 <strong>What happens next?</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
          <li>Our support team will review your booking</li>
          <li>We'll contact you within 24 hours</li>
          <li>No charges have been made to your payment method</li>
        </ul>
      </div>
    `;

    const html = getBaseEmailTemplate(subject, content, '#dc2626');

    const text = `
Order Creation Failed - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

We're sorry, but there was an issue creating your flight order.

Error: ${errorMessage}

Booking Reference: ${booking.bookingReference}

Our team has been notified and will contact you shortly to resolve this.

Contact us: ${SUPPORT_EMAIL}

Best regards,
${COMPANY_NAME} Team
    `;

    const result = await mailgunClient.send({
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      tags: ['booking', 'order-failed'],
    });

    if (result.success) {
      console.log('✅ [Notification] Order failed email sent:', booking.bookingReference);
    }
    return result.success;
  } catch (error) {
    console.error('❌ [Notification] Error sending order failed email:', error);
    return false;
  }
}

/**
 * Payment Success Email
 */
export async function sendPaymentSuccessEmail(booking: Booking): Promise<boolean> {
  try {
    const subject = `✅ Payment Confirmed - ${booking.bookingReference}`;

    const content = `
      <div style="background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: #065f46; margin: 0 0 10px 0;">🎉 Payment Received!</h2>
        <p style="color: #047857; margin: 0; font-size: 16px;">Your flight is now confirmed and ready for travel.</p>
      </div>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>Great news! We have received your payment and your booking is now confirmed.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Flight Details</h3>

        ${booking.flight.segments.map((segment, idx) => `
          <div style="border-left: 4px solid #2563eb; padding-left: 15px; margin: 15px 0;">
            <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">Flight ${idx + 1}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
              <div>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${segment.departure.iataCode}</p>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">${new Date(segment.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div style="text-align: center; flex: 1; padding: 0 15px;">
                <p style="margin: 0; color: #9ca3af;">✈️</p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">${segment.carrierCode}${segment.flightNumber}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${segment.arrival.iataCode}</p>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">${new Date(segment.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <p style="margin: 5px 0; font-size: 13px; color: #6b7280;">${new Date(segment.departure.at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        `).join('')}

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border-top: 2px solid #d1d5db; padding-top: 15px;">
          <tr>
            <td style="padding: 8px 0;"><strong>Booking Reference:</strong></td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 16px; color: #2563eb;">${booking.bookingReference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Payment Status:</strong></td>
            <td style="padding: 8px 0; text-align: right;"><span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">PAID</span></td>
          </tr>
        </table>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #1e40af;">📋 Important Reminders</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #1e3a8a;">
          <li style="margin: 5px 0;">Check in online 24-48 hours before departure</li>
          <li style="margin: 5px 0;">Arrive at the airport at least 2 hours before departure</li>
          <li style="margin: 5px 0;">Bring a valid photo ID and passport (for international flights)</li>
          <li style="margin: 5px 0;">Your e-ticket reference: ${booking.bookingReference}</li>
        </ul>
      </div>

      <p style="color: #6b7280; font-size: 14px; text-align: center;">Have a great flight! ✈️</p>
    `;

    const html = getBaseEmailTemplate(subject, content, '#10b981');

    const text = `
Payment Confirmed - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

Great news! We have received your payment and your booking is now confirmed.

Booking Reference: ${booking.bookingReference}
Payment Status: PAID

IMPORTANT REMINDERS:
- Check in online 24-48 hours before departure
- Arrive at the airport at least 2 hours before departure
- Bring a valid photo ID and passport (for international flights)

Have a great flight!
${COMPANY_NAME} Team
    `;

    const result = await mailgunClient.send({
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      tags: ['booking', 'payment-success'],
    });

    if (result.success) {
      console.log('✅ [Notification] Payment success email sent:', booking.bookingReference);
    }
    return result.success;
  } catch (error) {
    console.error('❌ [Notification] Error sending payment success email:', error);
    return false;
  }
}

/**
 * Payment Failed Email
 */
export async function sendPaymentFailedEmail(booking: Booking, errorMessage: string): Promise<boolean> {
  try {
    const subject = `Payment Failed - ${booking.bookingReference}`;

    const content = `
      <h2 style="color: #dc2626; margin-top: 0;">❌ Payment Failed</h2>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>We were unable to process your payment for booking ${booking.bookingReference}.</p>

      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${errorMessage}</p>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</p>
      </div>

      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #78350f;"><strong>⏰ Action Required:</strong> Please update your payment information within 24 hours to secure your booking.</p>
      </div>

      <p>You can retry your payment or contact our support team for assistance.</p>
    `;

    const html = getBaseEmailTemplate(subject, content, '#dc2626');

    const text = `
Payment Failed - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

We were unable to process your payment for booking ${booking.bookingReference}.

Reason: ${errorMessage}
Amount: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}

Please update your payment information within 24 hours to secure your booking.

Contact us: ${SUPPORT_EMAIL}

Best regards,
${COMPANY_NAME} Team
    `;

    const result = await mailgunClient.send({
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      tags: ['booking', 'payment-failed'],
    });

    if (result.success) {
      console.log('✅ [Notification] Payment failed email sent:', booking.bookingReference);
    }
    return result.success;
  } catch (error) {
    console.error('❌ [Notification] Error sending payment failed email:', error);
    return false;
  }
}

/**
 * Schedule Change Email
 */
export async function sendScheduleChangeEmail(
  booking: Booking,
  changeDetails: {
    changeType: string;
    description: string;
    detectedAt: string;
    newDetails?: any[];
  }
): Promise<boolean> {
  try {
    const subject = `⚠️ Flight Schedule Change - ${booking.bookingReference}`;

    const content = `
      <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Schedule Change Detected</h2>
        <p style="color: #78350f; margin: 0; font-size: 16px;">The airline has made changes to your flight.</p>
      </div>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>We've detected a change to your flight schedule. The airline has notified us of the following update:</p>

      <div style="background: #fef2f2; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e;"><strong>Change Type:</strong> ${changeDetails.changeType}</p>
        <p style="margin: 10px 0 0 0; color: #78350f;">${changeDetails.description}</p>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Your Booking</h3>
        <p style="margin: 5px 0;"><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p style="margin: 5px 0;"><strong>Route:</strong> ${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}</p>
        <p style="margin: 5px 0;"><strong>Original Departure:</strong> ${new Date(booking.flight.segments[0].departure.at).toLocaleString()}</p>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af;"><strong>📞 What should I do?</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
          <li style="margin: 5px 0;">Our team is reviewing this change</li>
          <li style="margin: 5px 0;">We'll contact you within 2 hours with options</li>
          <li style="margin: 5px 0;">You may be eligible for a refund or rebooking</li>
          <li style="margin: 5px 0;">Contact us immediately if you have urgent concerns</li>
        </ul>
      </div>

      <p>We apologize for any inconvenience and will do our best to help you find a suitable solution.</p>
    `;

    const html = getBaseEmailTemplate(subject, content, '#f59e0b');

    const text = `
Flight Schedule Change - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

The airline has made changes to your flight schedule.

Change Type: ${changeDetails.changeType}
Description: ${changeDetails.description}

Booking Reference: ${booking.bookingReference}
Route: ${booking.flight.segments[0].departure.iataCode} → ${booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode}

Our team is reviewing this change and will contact you within 2 hours with options.

Contact us immediately if you have urgent concerns: ${SUPPORT_EMAIL}

Best regards,
${COMPANY_NAME} Team
    `;

    const result = await mailgunClient.send({
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      tags: ['booking', 'schedule-change'],
    });

    if (result.success) {
      console.log('✅ [Notification] Schedule change email sent:', booking.bookingReference);
    }
    return result.success;
  } catch (error) {
    console.error('❌ [Notification] Error sending schedule change email:', error);
    return false;
  }
}

/**
 * Cancellation Confirmed Email
 */
export async function sendCancellationConfirmedEmail(
  booking: Booking,
  refundDetails: {
    refundAmount: number;
    refundCurrency: string;
    refundMethod: string;
    confirmedAt: string;
  }
): Promise<boolean> {
  try {
    const subject = `Cancellation Confirmed - ${booking.bookingReference}`;

    const content = `
      <h2 style="color: #1f2937; margin-top: 0;">Cancellation Confirmed</h2>

      <p>Dear ${booking.passengers[0].firstName},</p>

      <p>Your booking cancellation has been confirmed.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Cancellation Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Booking Reference:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${booking.bookingReference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Original Amount:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Refund Amount:</strong></td>
            <td style="padding: 8px 0; text-align: right; color: #059669; font-weight: bold;">${refundDetails.refundCurrency} ${refundDetails.refundAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Refund Method:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${refundDetails.refundMethod.replace('_', ' ').toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Confirmed At:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${new Date(refundDetails.confirmedAt).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af;"><strong>💳 Refund Timeline:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
          <li style="margin: 5px 0;">Card refunds: 5-10 business days</li>
          <li style="margin: 5px 0;">Bank transfers: 3-7 business days</li>
          <li style="margin: 5px 0;">The exact timing depends on your bank/card issuer</li>
        </ul>
      </div>

      <p>We're sorry to see you go. If you have any questions about your cancellation or refund, please don't hesitate to contact us.</p>
    `;

    const html = getBaseEmailTemplate(subject, content);

    const text = `
Cancellation Confirmed - ${booking.bookingReference}

Dear ${booking.passengers[0].firstName},

Your booking cancellation has been confirmed.

Booking Reference: ${booking.bookingReference}
Original Amount: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}
Refund Amount: ${refundDetails.refundCurrency} ${refundDetails.refundAmount.toFixed(2)}
Refund Method: ${refundDetails.refundMethod}

REFUND TIMELINE:
- Card refunds: 5-10 business days
- Bank transfers: 3-7 business days

If you have any questions, contact us: ${SUPPORT_EMAIL}

Best regards,
${COMPANY_NAME} Team
    `;

    const result = await mailgunClient.send({
      to: booking.contactInfo.email,
      subject,
      html,
      text,
      tags: ['booking', 'cancellation'],
    });

    if (result.success) {
      console.log('✅ [Notification] Cancellation confirmed email sent:', booking.bookingReference);
    }
    return result.success;
  } catch (error) {
    console.error('❌ [Notification] Error sending cancellation email:', error);
    return false;
  }
}

/**
 * Admin Alert
 */
export async function sendAdminAlert(alert: {
  type: string;
  bookingReference?: string;
  error?: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  priority?: 'low' | 'normal' | 'high';
  [key: string]: any;
}): Promise<boolean> {
  try {
    const priorityColors = {
      low: '#3b82f6',
      normal: '#f59e0b',
      high: '#dc2626',
    };

    const color = priorityColors[alert.priority || 'normal'];
    const subject = `[${alert.priority?.toUpperCase() || 'ALERT'}] ${alert.type.replace(/_/g, ' ').toUpperCase()}`;

    const content = `
      <h2 style="color: ${color}; margin-top: 0;">Admin Alert: ${alert.type.replace(/_/g, ' ')}</h2>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Alert Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${Object.entries(alert).map(([key, value]) => `
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>${key.replace(/_/g, ' ')}:</strong></td>
              <td style="padding: 8px 0; text-align: right; vertical-align: top;">${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div style="background: #fef2f2; border-left: 4px solid ${color}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b;"><strong>⚠️ This alert requires immediate attention.</strong></p>
      </div>
    `;

    const html = getBaseEmailTemplate(subject, content, color);

    const text = `
Admin Alert: ${alert.type.replace(/_/g, ' ')}

${Object.entries(alert).map(([key, value]) => `${key}: ${value}`).join('\n')}

This alert requires immediate attention.

${COMPANY_NAME} Admin System
    `;

    const result = await mailgunClient.send({
      to: ADMIN_EMAIL,
      subject,
      html,
      text,
      tags: ['admin', 'alert', alert.priority || 'normal'],
    });

    if (result.success) {
      console.log('✅ [Notification] Admin alert sent:', alert.type);
    }
    return result.success;
  } catch (error) {
    console.error('❌ [Notification] Error sending admin alert:', error);
    return false;
  }
}

// ==========================================
// User Preference Checking
// ==========================================

interface UserNotificationPreferences {
  emailEnabled?: boolean;
  emailBookingConfirmed?: boolean;
  emailBookingCancelled?: boolean;
  emailPriceAlerts?: boolean;
  emailPaymentUpdates?: boolean;
  emailPromotions?: boolean;
  emailTripReminders?: boolean;
  emailSecurityAlerts?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
}

/**
 * Check if user has enabled a specific notification type
 */
export async function shouldSendNotification(
  userId: string,
  notificationType: 'booking' | 'price_alert' | 'payment' | 'promotion' | 'trip_reminder' | 'security',
  channel: 'email' | 'push' | 'in_app' = 'email'
): Promise<boolean> {
  try {
    const prisma = getPrismaClient();

    const userPrefs = await prisma.userPreferences.findUnique({
      where: { userId },
      select: {
        emailNotifications: true,
        priceAlertEmails: true,
        dealAlerts: true,
        notifications: true,
      },
    });

    if (!userPrefs) {
      return true; // Default to sending if no preferences set
    }

    const advancedPrefs = (userPrefs.notifications as UserNotificationPreferences) || {};

    // Check if we're in quiet hours
    if (advancedPrefs.quietHoursEnabled) {
      const isQuietHours = checkQuietHours(
        advancedPrefs.quietHoursStart || '22:00',
        advancedPrefs.quietHoursEnd || '08:00',
        advancedPrefs.quietHoursTimezone || 'UTC'
      );

      // Only block non-urgent notifications during quiet hours
      if (isQuietHours && notificationType !== 'security') {
        console.log(`⏰ Quiet hours active for user ${userId} - deferring ${notificationType} notification`);
        return false;
      }
    }

    // Check channel-specific preferences
    if (channel === 'email') {
      // First check master email toggle
      if (advancedPrefs.emailEnabled === false || userPrefs.emailNotifications === false) {
        return false;
      }

      // Check type-specific preferences
      switch (notificationType) {
        case 'booking':
          return advancedPrefs.emailBookingConfirmed !== false;
        case 'price_alert':
          return userPrefs.priceAlertEmails !== false && advancedPrefs.emailPriceAlerts !== false;
        case 'payment':
          return advancedPrefs.emailPaymentUpdates !== false;
        case 'promotion':
          return userPrefs.dealAlerts === true || advancedPrefs.emailPromotions === true;
        case 'trip_reminder':
          return advancedPrefs.emailTripReminders !== false;
        case 'security':
          return true; // Always send security alerts
        default:
          return true;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return true; // Default to sending on error
  }
}

/**
 * Check if current time is within quiet hours
 */
function checkQuietHours(start: string, end: string, timezone: string): boolean {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    });

    const currentTime = formatter.format(now);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = start.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = end.split(':').map(Number);
    const endMinutes = endHour * 60 + endMinute;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } catch (error) {
    console.error('Error checking quiet hours:', error);
    return false;
  }
}

/**
 * Get deferred notifications that should be sent after quiet hours
 * (For future implementation of notification queue)
 */
export async function getDeferredNotifications(userId: string): Promise<any[]> {
  // TODO: Implement notification queue for deferred notifications
  return [];
}

// ==========================================
// Gamification & Milestone Notifications
// ==========================================

/**
 * Notify user of milestone progress (badge, level, streak)
 */
export async function notifyMilestoneProgress(
  userId: string,
  milestone: {
    type: 'badge' | 'level' | 'streak'
    name: string
    progress: number
    current: number
    target: number
    icon?: string
    reward?: { points: number }
  }
): Promise<void> {
  // Broadcast via SSE
  broadcastSSE('customer', 'milestone_progress', {
    type: 'milestone_progress',
    userId,
    milestone,
    timestamp: new Date().toISOString(),
  }, userId);

  // Store in-app notification for progress thresholds
  if (milestone.progress >= 75) {
    try {
      const prisma = getPrismaClient();
      await prisma.notification.create({
        data: {
          userId,
          type: 'gamification',
          title: `${milestone.icon || '🎯'} Almost there!`,
          message: `You're ${milestone.progress}% to "${milestone.name}"`,
          priority: milestone.progress >= 90 ? 'high' : 'normal',
          actionUrl: '/account/profile',
          metadata: { milestone } as any,
        },
      });
    } catch (error) {
      console.error('Error creating milestone notification:', error);
    }
  }
}

/**
 * Notify user of completed milestone (badge earned, level up, streak milestone)
 */
export async function notifyMilestoneComplete(
  userId: string,
  userEmail: string,
  milestone: {
    type: 'badge' | 'level' | 'streak'
    name: string
    description: string
    icon: string
    reward: { points: number }
    tier?: string
  }
): Promise<void> {
  const typeEmoji = { badge: '🏆', level: '⭐', streak: '🔥' };
  const emoji = typeEmoji[milestone.type] || '🎉';

  // 1. SSE broadcast for instant celebration
  broadcastSSE('customer', 'milestone_complete', {
    type: 'milestone_complete',
    userId,
    milestone,
    celebration: milestone.tier === 'platinum' ? 'confetti' : 'stars',
    timestamp: new Date().toISOString(),
  }, userId);

  // 2. Store in-app notification
  try {
    const prisma = getPrismaClient();
    await prisma.notification.create({
      data: {
        userId,
        type: 'gamification',
        title: `${emoji} ${milestone.name} Unlocked!`,
        message: `${milestone.description} (+${milestone.reward.points} points)`,
        priority: 'high',
        actionUrl: '/account/profile',
        metadata: { milestone } as any,
      },
    });
  } catch (error) {
    console.error('Error creating milestone complete notification:', error);
  }

  // 3. Email notification for major milestones
  if (milestone.tier === 'gold' || milestone.tier === 'platinum') {
    await sendMilestoneEmail(userEmail, milestone);
  }
}

/**
 * Send milestone achievement email
 */
async function sendMilestoneEmail(
  email: string,
  milestone: { name: string; description: string; icon: string; reward: { points: number }; tier?: string }
): Promise<boolean> {
  try {
    const subject = `🎉 Achievement Unlocked: ${milestone.name}!`;

    const tierColors: Record<string, string> = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
    };

    const color = tierColors[milestone.tier || 'bronze'] || '#2563eb';

    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 64px; margin-bottom: 15px;">${milestone.icon}</div>
        <h2 style="color: ${color}; margin: 0;">Achievement Unlocked!</h2>
        <h3 style="color: #1f2937; margin: 10px 0;">${milestone.name}</h3>
        <p style="color: #6b7280;">${milestone.description}</p>
      </div>

      <div style="background: linear-gradient(135deg, ${color}22 0%, ${color}11 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <p style="margin: 0; color: #1f2937; font-size: 14px;">You earned</p>
        <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: ${color};">+${milestone.reward.points} points</p>
      </div>

      <p style="text-align: center; color: #6b7280;">Keep exploring to unlock more achievements!</p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com'}/account/profile"
           style="display: inline-block; background: ${color}; color: ${milestone.tier === 'silver' ? '#333' : 'white'}; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Your Achievements
        </a>
      </div>
    `;

    const html = getBaseEmailTemplate(subject, content, color);

    const result = await mailgunClient.send({
      to: email,
      subject,
      html,
      text: `Achievement Unlocked: ${milestone.name}\n\n${milestone.description}\n\nYou earned +${milestone.reward.points} points!`,
      tags: ['gamification', 'milestone'],
    });

    return result.success;
  } catch (error) {
    console.error('Error sending milestone email:', error);
    return false;
  }
}

/**
 * Notify user of points earned
 */
export async function notifyPointsEarned(
  userId: string,
  points: number,
  reason: string,
  newTotal: number
): Promise<void> {
  broadcastSSE('customer', 'points_earned', {
    type: 'points_earned',
    userId,
    points,
    reason,
    newTotal,
    timestamp: new Date().toISOString(),
  }, userId);
}

/**
 * Notify leaderboard rank change
 */
export async function notifyLeaderboardChange(
  userId: string,
  oldRank: number,
  newRank: number
): Promise<void> {
  if (newRank < oldRank) {
    broadcastSSE('customer', 'rank_up', {
      type: 'rank_up',
      userId,
      oldRank,
      newRank,
      timestamp: new Date().toISOString(),
    }, userId);

    try {
      const prisma = getPrismaClient();
      await prisma.notification.create({
        data: {
          userId,
          type: 'gamification',
          title: '📈 Rank Up!',
          message: `You moved from #${oldRank} to #${newRank} on the leaderboard!`,
          priority: newRank <= 10 ? 'high' : 'normal',
          actionUrl: '/account/leaderboard',
        },
      });
    } catch (error) {
      console.error('Error creating leaderboard notification:', error);
    }
  }
}

export const notificationService = {
  // Email notifications
  sendOrderCreatedEmail,
  sendOrderFailedEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendScheduleChangeEmail,
  sendCancellationConfirmedEmail,
  sendAdminAlert,
  // Real-time notifications (Telegram + SSE + DB)
  notifyNewBooking,
  notifyTicketIssued,
  notifyBookingStatusChange,
  // SSE management
  registerSSEClient,
  unregisterSSEClient,
  broadcastSSE,
  getSSEStats,
  // Preference checking
  shouldSendNotification,
  checkQuietHours,
  getDeferredNotifications,
  // Gamification notifications
  notifyMilestoneProgress,
  notifyMilestoneComplete,
  notifyPointsEarned,
  notifyLeaderboardChange,
};
