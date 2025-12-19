/**
 * Mailgun Webhook Handler
 *
 * Handles email events from Mailgun:
 * - delivered, opened, clicked
 * - bounced, complained, unsubscribed
 * - failed
 *
 * Updates BOTH email_logs AND email_campaign_sends for tracking
 *
 * @route POST /api/webhooks/mailgun
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPrismaClient } from '@/lib/prisma';

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
    console.warn('[Mailgun Webhook] No signing key configured - allowing in dev mode');
    return true;
  }

  const encodedToken = crypto
    .createHmac('sha256', signingKey)
    .update(timestamp + token)
    .digest('hex');

  return encodedToken === signature;
}

// ===================================
// DATABASE HELPERS
// ===================================

async function updateCampaignSend(
  prisma: ReturnType<typeof getPrismaClient>,
  email: string,
  updates: Record<string, any>
) {
  try {
    // Find campaign sends for this email and update
    await prisma.$executeRawUnsafe(`
      UPDATE "email_campaign_sends"
      SET ${Object.entries(updates).map(([k, v]) => {
        if (v === null) return `"${k}" = NULL`;
        if (typeof v === 'number') return `"${k}" = ${v}`;
        if (v instanceof Date) return `"${k}" = '${v.toISOString()}'`;
        return `"${k}" = '${v}'`;
      }).join(', ')}, "updatedAt" = NOW()
      WHERE "email" = '${email}' AND "status" NOT IN ('bounced', 'complained')
    `);
  } catch (e) {
    console.warn('[Mailgun] Could not update campaign send:', e);
  }
}

async function updateCampaignStats(
  prisma: ReturnType<typeof getPrismaClient>,
  email: string,
  field: string
) {
  try {
    // Get campaigns that have this email
    await prisma.$executeRawUnsafe(`
      UPDATE "email_campaigns"
      SET "${field}" = "${field}" + 1, "updatedAt" = NOW()
      WHERE "id" IN (
        SELECT "campaignId" FROM "email_campaign_sends" WHERE "email" = '${email}'
      )
    `);
  } catch (e) {
    console.warn('[Mailgun] Could not update campaign stats:', e);
  }
}

// ===================================
// EVENT HANDLERS
// ===================================

async function handleDelivered(
  prisma: ReturnType<typeof getPrismaClient>,
  data: MailgunWebhookEvent['event-data']
) {
  console.log(`✅ [Mailgun] Email delivered to ${data.recipient}`);
  const timestamp = new Date(data.timestamp * 1000);

  // Update campaign send
  await updateCampaignSend(prisma, data.recipient, {
    status: 'delivered',
    deliveredAt: timestamp,
  });

  // Update email log
  await prisma.$executeRawUnsafe(`
    UPDATE "email_logs"
    SET "status" = 'delivered', "deliveredAt" = '${timestamp.toISOString()}', "updatedAt" = NOW()
    WHERE "recipientEmail" = '${data.recipient}' AND "deliveredAt" IS NULL
  `);
}

async function handleOpened(
  prisma: ReturnType<typeof getPrismaClient>,
  data: MailgunWebhookEvent['event-data']
) {
  console.log(`👁️ [Mailgun] Email opened by ${data.recipient}`);
  const timestamp = new Date(data.timestamp * 1000);

  // Update campaign send
  await updateCampaignSend(prisma, data.recipient, {
    status: 'opened',
    openedAt: timestamp,
  });

  // Update campaign stats
  await updateCampaignStats(prisma, data.recipient, 'opened');

  // Update email log
  await prisma.$executeRawUnsafe(`
    UPDATE "email_logs"
    SET "status" = 'opened', "openedAt" = '${timestamp.toISOString()}', "opens" = "opens" + 1
    WHERE "recipientEmail" = '${data.recipient}'
  `);

  // Update subscriber engagement
  await prisma.$executeRawUnsafe(`
    UPDATE "newsletter_subscribers"
    SET "emailsOpened" = "emailsOpened" + 1, "lastEngagedAt" = NOW()
    WHERE "email" = '${data.recipient}'
  `);
}

async function handleClicked(
  prisma: ReturnType<typeof getPrismaClient>,
  data: MailgunWebhookEvent['event-data']
) {
  console.log(`🖱️ [Mailgun] Link clicked by ${data.recipient}`);
  const timestamp = new Date(data.timestamp * 1000);

  // Update campaign send
  await updateCampaignSend(prisma, data.recipient, {
    status: 'clicked',
    clickedAt: timestamp,
  });

  // Update campaign stats
  await updateCampaignStats(prisma, data.recipient, 'clicked');

  // Update email log
  await prisma.$executeRawUnsafe(`
    UPDATE "email_logs"
    SET "clickedAt" = '${timestamp.toISOString()}', "clicks" = "clicks" + 1
    WHERE "recipientEmail" = '${data.recipient}'
  `);

  // Update subscriber engagement
  await prisma.$executeRawUnsafe(`
    UPDATE "newsletter_subscribers"
    SET "emailsClicked" = "emailsClicked" + 1, "lastEngagedAt" = NOW()
    WHERE "email" = '${data.recipient}'
  `);
}

async function handleBounced(
  prisma: ReturnType<typeof getPrismaClient>,
  data: MailgunWebhookEvent['event-data']
) {
  console.error(`❌ [Mailgun] Email bounced: ${data.recipient}`);
  const severity = data.severity || 'permanent';
  const reason = data.reason || data['delivery-status']?.description || 'Unknown';
  const timestamp = new Date(data.timestamp * 1000);

  // Update campaign send
  await updateCampaignSend(prisma, data.recipient, {
    status: 'bounced',
    bouncedAt: timestamp,
    errorMessage: reason,
  });

  // Update campaign stats
  await updateCampaignStats(prisma, data.recipient, 'bounced');

  // Update email log
  await prisma.$executeRawUnsafe(`
    UPDATE "email_logs"
    SET "status" = 'bounced', "bounceType" = '${severity}', "bounceReason" = '${reason.replace(/'/g, "''")}'
    WHERE "recipientEmail" = '${data.recipient}'
  `);

  // Update subscriber bounce status
  const subscriberStatus = severity === 'permanent' ? 'HARD_BOUNCED' : 'SOFT_BOUNCED';
  await prisma.$executeRawUnsafe(`
    UPDATE "newsletter_subscribers"
    SET "status" = '${subscriberStatus}', "bounceCount" = COALESCE("bounceCount", 0) + 1
    WHERE "email" = '${data.recipient}'
  `);

  // Add to suppression list for hard bounces
  if (severity === 'permanent') {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "email_suppressions" ("id", "email", "reason", "details", "createdAt")
      VALUES (gen_random_uuid()::text, '${data.recipient}', 'hard_bounce', '${reason.replace(/'/g, "''")}', NOW())
      ON CONFLICT ("email") DO UPDATE SET "reason" = 'hard_bounce', "details" = EXCLUDED."details"
    `);
  }
}

async function handleComplained(
  prisma: ReturnType<typeof getPrismaClient>,
  data: MailgunWebhookEvent['event-data']
) {
  console.error(`🚫 [Mailgun] Spam complaint from ${data.recipient}`);

  // Update campaign send
  await updateCampaignSend(prisma, data.recipient, {
    status: 'complained',
  });

  // Update campaign stats
  await updateCampaignStats(prisma, data.recipient, 'complained');

  // Update email log
  await prisma.$executeRawUnsafe(`
    UPDATE "email_logs"
    SET "status" = 'complained'
    WHERE "recipientEmail" = '${data.recipient}'
  `);

  // Mark subscriber as complained
  await prisma.$executeRawUnsafe(`
    UPDATE "newsletter_subscribers"
    SET "status" = 'COMPLAINED'
    WHERE "email" = '${data.recipient}'
  `);

  // Add to suppression list (CRITICAL - never email again)
  await prisma.$executeRawUnsafe(`
    INSERT INTO "email_suppressions" ("id", "email", "reason", "details", "createdAt")
    VALUES (gen_random_uuid()::text, '${data.recipient}', 'complaint', 'User marked as spam', NOW())
    ON CONFLICT ("email") DO UPDATE SET "reason" = 'complaint'
  `);
}

async function handleUnsubscribed(
  prisma: ReturnType<typeof getPrismaClient>,
  data: MailgunWebhookEvent['event-data']
) {
  console.log(`📤 [Mailgun] User unsubscribed: ${data.recipient}`);

  // Update campaign stats
  await updateCampaignStats(prisma, data.recipient, 'unsubscribed');

  // Update subscriber status
  await prisma.$executeRawUnsafe(`
    UPDATE "newsletter_subscribers"
    SET "status" = 'UNSUBSCRIBED', "unsubscribedAt" = NOW()
    WHERE "email" = '${data.recipient}'
  `);

  // Add to suppression list
  await prisma.$executeRawUnsafe(`
    INSERT INTO "email_suppressions" ("id", "email", "reason", "details", "createdAt")
    VALUES (gen_random_uuid()::text, '${data.recipient}', 'unsubscribed', 'User clicked unsubscribe', NOW())
    ON CONFLICT ("email") DO UPDATE SET "reason" = 'unsubscribed'
  `);
}

async function handleFailed(
  prisma: ReturnType<typeof getPrismaClient>,
  data: MailgunWebhookEvent['event-data']
) {
  console.error(`💥 [Mailgun] Email failed: ${data.recipient}`, data['delivery-status']);
  const reason = data['delivery-status']?.message || 'Unknown failure';

  // Update campaign send
  await updateCampaignSend(prisma, data.recipient, {
    status: 'failed',
    errorMessage: reason,
  });

  // Update email log
  await prisma.$executeRawUnsafe(`
    UPDATE "email_logs"
    SET "status" = 'failed', "failureReason" = '${reason.replace(/'/g, "''")}'
    WHERE "recipientEmail" = '${data.recipient}'
  `);
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

    const prisma = getPrismaClient();

    // Route to appropriate handler
    switch (eventType) {
      case 'delivered':
        await handleDelivered(prisma, eventData);
        break;
      case 'opened':
        await handleOpened(prisma, eventData);
        break;
      case 'clicked':
        await handleClicked(prisma, eventData);
        break;
      case 'bounced':
        await handleBounced(prisma, eventData);
        break;
      case 'complained':
        await handleComplained(prisma, eventData);
        break;
      case 'unsubscribed':
        await handleUnsubscribed(prisma, eventData);
        break;
      case 'failed':
        await handleFailed(prisma, eventData);
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
