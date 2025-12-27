/**
 * N8N Webhook Endpoint - Growth Automation Hub
 *
 * Handles:
 * - Auto-ticketing results
 * - Consolidator booking confirmations
 * - Cart abandonment recovery workflows
 * - Deal distribution triggers
 * - Upsell sequence triggers
 * - Analytics events from n8n
 *
 * @version 2.0.0 - E2E Growth Automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { prisma } from '@/lib/prisma';

// Webhook secret for validation
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || '';

// ============================================================================
// TYPES
// ============================================================================

type WebhookEventType =
  | 'auto_ticket'
  | 'booking_confirm'
  | 'supplier_update'
  | 'payment_callback'
  // Growth automation events
  | 'cart_abandoned'
  | 'cart_recovery_check'
  | 'deal_distribute'
  | 'upsell_trigger'
  | 'digest_send'
  | 'price_alert_triggered'
  | 'social_posted'
  | 'email_sent'
  | 'conversion_tracked';

interface N8NWebhookPayload {
  type: WebhookEventType;
  bookingId?: string;
  success?: boolean;
  data?: {
    pnr?: string;
    eticketNumbers?: string[];
    consolidatorPrice?: number;
    consolidatorReference?: string;
    ticketedAt?: string;
    supplierStatus?: string;
    paymentStatus?: string;
    // Growth automation data
    abandonmentId?: string;
    userId?: string;
    email?: string;
    channel?: string;
    dealId?: string;
    campaignId?: string;
  };
  error?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    // Validate webhook secret
    const authHeader = request.headers.get('x-n8n-secret') || request.headers.get('authorization');
    if (N8N_WEBHOOK_SECRET && authHeader !== N8N_WEBHOOK_SECRET && authHeader !== `Bearer ${N8N_WEBHOOK_SECRET}`) {
      console.warn('[N8N Webhook] Invalid secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: N8NWebhookPayload = await request.json();
    console.log('[N8N Webhook] Received:', payload.type, payload.bookingId);

    switch (payload.type) {
      // ========== BOOKING OPERATIONS ==========
      case 'auto_ticket':
        return handleAutoTicketCallback(payload);

      case 'booking_confirm':
        return handleBookingConfirmCallback(payload);

      case 'supplier_update':
        return handleSupplierUpdateCallback(payload);

      case 'payment_callback':
        return handlePaymentCallback(payload);

      // ========== GROWTH AUTOMATION ==========
      case 'cart_abandoned':
        return handleCartAbandoned(payload);

      case 'cart_recovery_check':
        return handleCartRecoveryCheck(payload);

      case 'deal_distribute':
        return handleDealDistribute(payload);

      case 'upsell_trigger':
        return handleUpsellTrigger(payload);

      case 'social_posted':
        return handleSocialPosted(payload);

      case 'email_sent':
        return handleEmailSent(payload);

      case 'conversion_tracked':
        return handleConversionTracked(payload);

      default:
        return NextResponse.json({ error: 'Unknown webhook type' }, { status: 400 });
    }
  }, {
    category: ErrorCategory.EXTERNAL_API,
    severity: ErrorSeverity.HIGH
  });
}

async function handleAutoTicketCallback(payload: N8NWebhookPayload) {
  const { bookingId, success, data, error } = payload;

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
  }

  const booking = await bookingStorage.findById(bookingId);
  if (!booking) {
    // Return 200 with error message to avoid N8N treating it as failure
    // The booking might not exist yet or the ID might be invalid
    console.log('[N8N Webhook] Booking not found:', bookingId);
    return NextResponse.json({
      success: false,
      error: 'Booking not found',
      bookingId,
      processed: true
    });
  }

  if (success && data?.pnr) {
    // Success: Update booking with PNR
    const customerPaid = booking.totalPrice || booking.price || 0;
    const profit = customerPaid - (data.consolidatorPrice || 0);

    await bookingStorage.update(bookingId, {
      status: 'confirmed',
      ticketingStatus: 'ticketed',
      airlineRecordLocator: data.pnr,
      eticketNumbers: data.eticketNumbers,
      consolidatorPrice: data.consolidatorPrice,
      consolidatorReference: data.consolidatorReference,
      consolidatorName: 'TheBestAgent.PRO',
      customerPrice: customerPaid,
      markup: profit,
      netProfit: profit,
      ticketedAt: data.ticketedAt || new Date().toISOString(),
      ticketingNotes: `Auto-ticketed via N8N automation`,
    });

    // Send confirmation notification
    try {
      const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
      await notifyTelegramAdmins(`
✅ *N8N AUTO-TICKET SUCCESS*

📋 *Booking:* \`${booking.bookingReference}\`
🎫 *PNR:* \`${data.pnr}\`
💰 *Consolidator:* $${data.consolidatorPrice}
💵 *Customer Paid:* $${customerPaid}
📈 *Profit:* $${profit.toFixed(2)}
      `.trim());
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Booking updated with ticketing info',
      pnr: data.pnr
    });
  } else {
    // Failed: Update status and notify
    await bookingStorage.update(bookingId, {
      ticketingStatus: 'failed',
      ticketingNotes: `N8N automation failed: ${error || 'Unknown error'}`,
    });

    try {
      const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
      await notifyTelegramAdmins(`
❌ *N8N AUTO-TICKET FAILED*

📋 *Booking:* \`${booking.bookingReference}\`
⚠️ *Error:* ${error || 'Unknown error'}

Please ticket manually.
      `.trim());
    } catch {}

    return NextResponse.json({
      success: false,
      error: error || 'Ticketing failed'
    });
  }
}

async function handleBookingConfirmCallback(payload: N8NWebhookPayload) {
  const { bookingId, success, data, error } = payload;

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
  }

  if (success) {
    await bookingStorage.update(bookingId, {
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      consolidatorReference: data?.consolidatorReference,
    });
  }

  return NextResponse.json({ success, processed: true });
}

async function handleSupplierUpdateCallback(payload: N8NWebhookPayload) {
  const { bookingId, data } = payload;

  if (bookingId && data?.supplierStatus) {
    await bookingStorage.update(bookingId, {
      supplierStatus: data.supplierStatus,
      lastSupplierUpdate: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true, processed: true });
}

async function handlePaymentCallback(payload: N8NWebhookPayload) {
  const { bookingId, success, data, error } = payload;

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
  }

  await bookingStorage.update(bookingId, {
    paymentStatus: success ? 'completed' : 'failed',
    paymentError: error,
    paymentProcessedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, processed: true });
}

// ============================================================================
// GROWTH AUTOMATION HANDLERS
// ============================================================================

/**
 * Handle cart abandonment event from frontend
 */
async function handleCartAbandoned(payload: N8NWebhookPayload) {
  const { data, metadata } = payload;

  try {
    // Store abandonment for recovery workflow
    const event = await prisma.analyticsEvent.create({
      data: {
        eventType: 'CART_ABANDONED',
        userId: data?.userId,
        sessionId: metadata?.sessionId,
        metadata: {
          email: data?.email,
          cartValue: metadata?.cartValue,
          cartItems: metadata?.cartItems,
          abandonedAt: new Date().toISOString(),
          checkoutStep: metadata?.checkoutStep,
          source: metadata?.source,
          recoveryStatus: 'pending',
        },
      },
    });

    console.log('[N8N] Cart abandonment tracked:', event.id);

    return NextResponse.json({
      success: true,
      abandonmentId: event.id,
      message: 'Cart abandonment tracked for recovery',
    });
  } catch (error) {
    console.error('[N8N] Cart abandonment tracking failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to track abandonment' });
  }
}

/**
 * Check if abandoned cart user has converted
 */
async function handleCartRecoveryCheck(payload: N8NWebhookPayload) {
  const { data } = payload;
  const abandonmentId = data?.abandonmentId;

  if (!abandonmentId) {
    return NextResponse.json({ error: 'Missing abandonmentId' }, { status: 400 });
  }

  try {
    const event = await prisma.analyticsEvent.findUnique({
      where: { id: abandonmentId },
    });

    if (!event) {
      return NextResponse.json({ converted: false, error: 'Event not found' });
    }

    const metadata = event.metadata as any;
    const abandonedAt = new Date(metadata.abandonedAt);

    // Check for booking after abandonment
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { userId: event.userId || undefined },
          { contactEmail: metadata.email },
        ],
        createdAt: { gt: abandonedAt },
      },
    });

    if (booking) {
      // Update recovery status
      await prisma.analyticsEvent.update({
        where: { id: abandonmentId },
        data: {
          metadata: {
            ...metadata,
            recoveryStatus: 'converted',
            convertedAt: new Date().toISOString(),
            bookingId: booking.id,
          },
        },
      });

      return NextResponse.json({
        converted: true,
        bookingId: booking.id,
        message: 'User completed booking - skip recovery email',
      });
    }

    return NextResponse.json({
      converted: false,
      message: 'User has not converted - proceed with recovery',
    });
  } catch (error) {
    console.error('[N8N] Recovery check failed:', error);
    return NextResponse.json({ converted: false, error: 'Check failed' });
  }
}

/**
 * Handle deal distribution request
 */
async function handleDealDistribute(payload: N8NWebhookPayload) {
  const { data, metadata } = payload;

  try {
    // Log distribution request
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'DEAL_DISTRIBUTION',
        metadata: {
          dealId: data?.dealId,
          channels: metadata?.channels,
          score: metadata?.score,
          triggeredAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Deal distribution logged',
    });
  } catch (error) {
    console.error('[N8N] Deal distribution logging failed:', error);
    return NextResponse.json({ success: false });
  }
}

/**
 * Handle upsell sequence trigger
 */
async function handleUpsellTrigger(payload: N8NWebhookPayload) {
  const { bookingId, data, metadata } = payload;

  try {
    // Get booking details for upsell recommendations
    const booking = bookingId ? await bookingStorage.findById(bookingId) : null;

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found',
        skipUpsell: true,
      });
    }

    // Determine upsell type based on booking
    const upsellType = booking.type === 'flight' ? 'hotel' :
                       booking.type === 'hotel' ? 'transfer' : 'activity';

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        type: booking.type,
        destination: booking.destination || booking.arrivalCity,
        checkIn: booking.departureDate || booking.checkIn,
        checkOut: booking.returnDate || booking.checkOut,
        email: booking.contactEmail,
        firstName: booking.leadPassengerName?.split(' ')[0] || 'Traveler',
      },
      upsellType,
      recommendations: getUpsellRecommendations(booking, upsellType),
    });
  } catch (error) {
    console.error('[N8N] Upsell trigger failed:', error);
    return NextResponse.json({ success: false, skipUpsell: true });
  }
}

/**
 * Log social media post from n8n
 */
async function handleSocialPosted(payload: N8NWebhookPayload) {
  const { data, metadata } = payload;

  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'SOCIAL_POST',
        metadata: {
          channel: data?.channel,
          dealId: data?.dealId,
          postId: metadata?.postId,
          postedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true, logged: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

/**
 * Log email sent from n8n
 */
async function handleEmailSent(payload: N8NWebhookPayload) {
  const { data, metadata } = payload;

  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'EMAIL_SENT',
        userId: data?.userId,
        metadata: {
          email: data?.email,
          campaignId: data?.campaignId,
          type: metadata?.type || 'promotional',
          sentAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true, logged: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

/**
 * Track conversion from n8n workflow
 */
async function handleConversionTracked(payload: N8NWebhookPayload) {
  const { data, metadata } = payload;

  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'CONVERSION',
        userId: data?.userId,
        metadata: {
          source: metadata?.source,
          campaignId: data?.campaignId,
          value: metadata?.value,
          convertedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getUpsellRecommendations(booking: any, upsellType: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
  const destination = booking.destination || booking.arrivalCity || 'destination';

  const recommendations: Record<string, any[]> = {
    hotel: [
      {
        type: 'hotel',
        title: `Hotels in ${destination}`,
        subtitle: 'Complete your trip with the perfect stay',
        link: `${baseUrl}/hotels?location=${encodeURIComponent(destination)}`,
      },
    ],
    transfer: [
      {
        type: 'transfer',
        title: 'Airport Transfer',
        subtitle: 'Hassle-free pickup and drop-off',
        link: `${baseUrl}/transfers?destination=${encodeURIComponent(destination)}`,
      },
      {
        type: 'activity',
        title: `Things to do in ${destination}`,
        subtitle: 'Discover local experiences',
        link: `${baseUrl}/activities?location=${encodeURIComponent(destination)}`,
      },
    ],
    activity: [
      {
        type: 'tour',
        title: `Tours in ${destination}`,
        subtitle: 'Explore with local guides',
        link: `${baseUrl}/tours?location=${encodeURIComponent(destination)}`,
      },
    ],
  };

  return recommendations[upsellType] || recommendations.activity;
}

// GET - Health check for N8N
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'fly2any-n8n-webhook',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    webhookTypes: {
      booking: ['auto_ticket', 'booking_confirm', 'supplier_update', 'payment_callback'],
      growth: ['cart_abandoned', 'cart_recovery_check', 'deal_distribute', 'upsell_trigger', 'social_posted', 'email_sent', 'conversion_tracked'],
    },
    documentation: 'https://docs.fly2any.com/n8n-integration',
  });
}
