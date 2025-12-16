/**
 * Mailgun Webhook Handler
 *
 * Handles email events from Mailgun:
 * - delivered, opened, clicked
 * - bounced, complained, unsubscribed
 * - failed
 *
 * @route POST /api/webhooks/mailgun
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ===================================
// TYPES
// ===================================

interface MailgunWebhookEvent {
  signature: {
    timestamp: string;
    token: string;
    signature: string;
  };
  'event-data': {
    event: string;
    timestamp: number;
    id: string;
    recipient: string;
    tags?: string[];
    'user-variables'?: Record<string, string>;
    'delivery-status'?: {
      code: number;
      message: string;
      description: string;
    };
    severity?: string;
    reason?: string;
    'client-info'?: {
      'client-os': string;
      'device-type': string;
      'client-name': string;
      'client-type': string;
      'user-agent': string;
    };
    geolocation?: {
      country: string;
      region: string;
      city: string;
    };
  };
}

// ===================================
// SIGNATURE VERIFICATION
// ===================================

function verifyWebhookSignature(
  timestamp: string,
  token: string,
  signature: string
): boolean {
  const signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
  if (!signingKey) {
    console.warn('[Mailgun Webhook] No signing key configured');
    return true; // Allow in development
  }

  const encodedToken = crypto
    .createHmac('sha256', signingKey)
    .update(timestamp + token)
    .digest('hex');

  return encodedToken === signature;
}

// ===================================
// EVENT HANDLERS
// ===================================

async function handleDelivered(data: MailgunWebhookEvent['event-data']) {
  console.log(`✅ [Mailgun] Email delivered to ${data.recipient}`);

  if (prisma) {
    try {
      await prisma.emailLog.updateMany({
        where: {
          recipientEmail: data.recipient,
          deliveredAt: null,
        },
        data: {
          deliveredAt: new Date(data.timestamp * 1000),
          status: 'delivered',
        },
      });
    } catch (e) {
      console.warn('[Mailgun] Could not update delivery status:', e);
    }
  }
}

async function handleOpened(data: MailgunWebhookEvent['event-data']) {
  console.log(`👁️ [Mailgun] Email opened by ${data.recipient}`);

  if (prisma) {
    try {
      await prisma.emailLog.updateMany({
        where: {
          recipientEmail: data.recipient,
          openedAt: null,
        },
        data: {
          openedAt: new Date(data.timestamp * 1000),
          opens: { increment: 1 },
          clientInfo: data['client-info'] ? JSON.stringify(data['client-info']) : undefined,
          geolocation: data.geolocation ? JSON.stringify(data.geolocation) : undefined,
        },
      });
    } catch (e) {
      console.warn('[Mailgun] Could not update open status:', e);
    }
  }
}

async function handleClicked(data: MailgunWebhookEvent['event-data']) {
  console.log(`🖱️ [Mailgun] Link clicked by ${data.recipient}`);

  if (prisma) {
    try {
      await prisma.emailLog.updateMany({
        where: {
          recipientEmail: data.recipient,
        },
        data: {
          clickedAt: new Date(data.timestamp * 1000),
          clicks: { increment: 1 },
        },
      });
    } catch (e) {
      console.warn('[Mailgun] Could not update click status:', e);
    }
  }
}

async function handleBounced(data: MailgunWebhookEvent['event-data']) {
  console.error(`❌ [Mailgun] Email bounced: ${data.recipient}`);
  const severity = data.severity || 'permanent';
  const reason = data.reason || data['delivery-status']?.description || 'Unknown';

  if (prisma) {
    try {
      // Update email log
      await prisma.emailLog.updateMany({
        where: { recipientEmail: data.recipient },
        data: {
          status: 'bounced',
          bounceType: severity,
          bounceReason: reason,
        },
      });

      // Mark subscriber as bounced
      await prisma.subscriber?.updateMany({
        where: { email: data.recipient },
        data: {
          status: severity === 'permanent' ? 'hard_bounced' : 'soft_bounced',
          bounceCount: { increment: 1 },
          lastBounceAt: new Date(),
        },
      });

      // For permanent bounces, suppress future emails
      if (severity === 'permanent') {
        await prisma.emailSuppression?.upsert({
          where: { email: data.recipient },
          create: {
            email: data.recipient,
            reason: 'hard_bounce',
            details: reason,
          },
          update: {
            reason: 'hard_bounce',
            details: reason,
          },
        });
      }
    } catch (e) {
      console.warn('[Mailgun] Could not handle bounce:', e);
    }
  }
}

async function handleComplained(data: MailgunWebhookEvent['event-data']) {
  console.error(`🚫 [Mailgun] Spam complaint from ${data.recipient}`);

  if (prisma) {
    try {
      // Update email log
      await prisma.emailLog.updateMany({
        where: { recipientEmail: data.recipient },
        data: { status: 'complained' },
      });

      // Mark subscriber as complained
      await prisma.subscriber?.updateMany({
        where: { email: data.recipient },
        data: {
          status: 'complained',
          complainedAt: new Date(),
        },
      });

      // Add to suppression list (CRITICAL - never email again)
      await prisma.emailSuppression?.upsert({
        where: { email: data.recipient },
        create: {
          email: data.recipient,
          reason: 'complaint',
          details: 'User marked email as spam',
        },
        update: {
          reason: 'complaint',
          details: 'User marked email as spam',
        },
      });
    } catch (e) {
      console.warn('[Mailgun] Could not handle complaint:', e);
    }
  }
}

async function handleUnsubscribed(data: MailgunWebhookEvent['event-data']) {
  console.log(`📤 [Mailgun] User unsubscribed: ${data.recipient}`);

  if (prisma) {
    try {
      // Update subscriber status
      await prisma.subscriber?.updateMany({
        where: { email: data.recipient },
        data: {
          status: 'unsubscribed',
          unsubscribedAt: new Date(),
        },
      });

      // Add to suppression list
      await prisma.emailSuppression?.upsert({
        where: { email: data.recipient },
        create: {
          email: data.recipient,
          reason: 'unsubscribed',
          details: 'User clicked unsubscribe link',
        },
        update: {
          reason: 'unsubscribed',
          details: 'User clicked unsubscribe link',
        },
      });
    } catch (e) {
      console.warn('[Mailgun] Could not handle unsubscribe:', e);
    }
  }
}

async function handleFailed(data: MailgunWebhookEvent['event-data']) {
  console.error(`💥 [Mailgun] Email failed: ${data.recipient}`, data['delivery-status']);

  if (prisma) {
    try {
      await prisma.emailLog.updateMany({
        where: { recipientEmail: data.recipient },
        data: {
          status: 'failed',
          failureReason: data['delivery-status']?.message || 'Unknown failure',
        },
      });
    } catch (e) {
      console.warn('[Mailgun] Could not handle failure:', e);
    }
  }
}

// ===================================
// MAIN HANDLER
// ===================================

export async function POST(request: NextRequest) {
  try {
    const body: MailgunWebhookEvent = await request.json();

    // Verify signature
    if (body.signature) {
      const isValid = verifyWebhookSignature(
        body.signature.timestamp,
        body.signature.token,
        body.signature.signature
      );

      if (!isValid) {
        console.error('[Mailgun Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const eventData = body['event-data'];
    const eventType = eventData.event;

    console.log(`📬 [Mailgun Webhook] ${eventType} for ${eventData.recipient}`);

    // Route to appropriate handler
    switch (eventType) {
      case 'delivered':
        await handleDelivered(eventData);
        break;
      case 'opened':
        await handleOpened(eventData);
        break;
      case 'clicked':
        await handleClicked(eventData);
        break;
      case 'bounced':
        await handleBounced(eventData);
        break;
      case 'complained':
        await handleComplained(eventData);
        break;
      case 'unsubscribed':
        await handleUnsubscribed(eventData);
        break;
      case 'failed':
        await handleFailed(eventData);
        break;
      default:
        console.log(`[Mailgun Webhook] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ success: true, event: eventType });

  } catch (error) {
    console.error('[Mailgun Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'mailgun-webhooks',
    timestamp: new Date().toISOString(),
  });
}
