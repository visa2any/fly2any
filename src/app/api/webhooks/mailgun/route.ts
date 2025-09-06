/**
 * 🔗 MAILGUN WEBHOOK HANDLER
 * Enhanced webhook processing with real-time analytics and event tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Force this API route to use Node.js runtime to support crypto operations
export const runtime = 'nodejs';
import { prisma } from '@/lib/database/prisma';
import { getEventSystem } from '@/lib/email/event-system';
import { getExtendedEmailLogField, createSafeUserUpdate } from '@/lib/database/email-status-handler';

interface MailgunWebhookEvent {
  'event-data': {
    id: string;
    timestamp: number;
    'log-level': string;
    event: string;
    severity: string;
    reason?: string;
    envelope: {
      transport: string;
      sender: string;
      sending_ip: string;
      targets: string;
    };
    flags: {
      'is-routed': boolean;
      'is-authenticated': boolean;
      'is-system-test': boolean;
      'is-test-mode': boolean;
    };
    'delivery-status': {
      'attempt-no': number;
      message: string;
      code: number;
      description: string;
      'session-seconds': number;
    };
    message: {
      headers: {
        to: string;
        'message-id': string;
        from: string;
        subject: string;
      };
      attachments: any[];
      size: number;
    };
    recipient: string;
    'recipient-domain': string;
    storage: {
      url: string;
      key: string;
    };
    campaigns: any[];
    tags: string[];
    'user-variables': Record<string, string>;
    'client-info': {
      'client-os': string;
      'client-name': string;
      'client-type': string;
      'device-type': string;
      'user-agent': string;
    };
    geolocation: {
      country: string;
      region: string;
      city: string;
    };
  };
  signature: {
    timestamp: string;
    token: string;
    signature: string;
  };
}

// Mailgun event types we track
const TRACKED_EVENTS = [
  'delivered',
  'opened',
  'clicked',
  'unsubscribed',
  'complained',
  'bounced',
  'failed',
  'permanent_fail',
  'temporary_fail'
];

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Mailgun webhook received');
    
    // Get request body and headers
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-mailgun-signature-v2');
    const timestamp = headersList.get('x-mailgun-timestamp');
    const token = headersList.get('x-mailgun-token');

    // Verify webhook signature
    if (!verifyWebhookSignature(signature, timestamp, token, body)) {
      console.warn('⚠️ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook data
    const webhookData: MailgunWebhookEvent = JSON.parse(body);
    const eventData = webhookData['event-data'];

    console.log(`📬 Processing ${eventData.event} event for ${eventData.recipient}`);

    // Store webhook event for analytics
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        provider: 'MAILGUN',
        eventType: eventData.event,
        messageId: eventData.message?.headers?.['message-id'] || eventData.id,
        recipient: eventData.recipient,
        eventData: eventData as any,
        processed: false,
        attempts: 1,
        signature: signature || '',
        rawPayload: body
      }
    });

    // Process the event based on type
    await processWebhookEvent(webhookEvent.id, eventData);

    // Mark as processed
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: true, processedAt: new Date() }
    });

    console.log(`✅ Webhook event processed: ${eventData.event}`);

    return NextResponse.json({ 
      success: true, 
      eventId: webhookEvent.id,
      eventType: eventData.event 
    });

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    
    // Log failed webhook for retry
    try {
      await prisma.webhookEvent.create({
        data: {
          provider: 'MAILGUN',
          eventType: 'unknown',
          messageId: 'unknown',
          recipient: 'unknown',
          eventData: {},
          processed: false,
          attempts: 1,
          error: error.message,
          rawPayload: await request.text() || ''
        }
      });
    } catch (dbError) {
      console.error('❌ Failed to log webhook error:', dbError);
    }

    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Verify Mailgun webhook signature
 */
function verifyWebhookSignature(
  signature: string | null,
  timestamp: string | null,
  token: string | null,
  body: string
): boolean {
  if (!signature || !timestamp || !token || !process.env.MAILGUN_WEBHOOK_SIGNING_KEY) {
    console.warn('⚠️ Missing signature components or signing key');
    return false;
  }

  try {
    // Mailgun uses HMAC-SHA256 for signature verification
    const hmac = crypto.createHmac('sha256', process.env.MAILGUN_WEBHOOK_SIGNING_KEY);
    hmac.update(timestamp);
    hmac.update(token);
    hmac.update(body);
    const expectedSignature = hmac.digest('hex');

    const isValid = signature === expectedSignature;
    
    if (!isValid) {
      console.warn('⚠️ Signature verification failed');
      console.log('Expected:', expectedSignature);
      console.log('Received:', signature);
    }

    return isValid;
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

/**
 * Process webhook event based on type
 */
async function processWebhookEvent(webhookEventId: string, eventData: any): Promise<void> {
  const eventType = eventData.event;
  const messageId = eventData.message?.headers?.['message-id'] || eventData.id;
  const recipient = eventData.recipient;
  const timestamp = new Date(eventData.timestamp * 1000);

  try {
    // Find associated email log
    const emailLog = await prisma.emailLog.findFirst({
      where: {
        OR: [
          { providerMessageId: messageId },
          { to: recipient }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!emailLog) {
      console.warn(`⚠️ No email log found for message ID: ${messageId}, recipient: ${recipient}`);
      return;
    }

    console.log(`🔄 Processing ${eventType} event for email ${emailLog.id}`);

    // Update email log status and tracking data
    await updateEmailLogFromWebhook(emailLog.id, eventType, eventData, timestamp);

    // Update campaign metrics if this is a campaign email
    const campaignId = getExtendedEmailLogField(emailLog, 'campaignId');
    if (campaignId) {
      await updateCampaignMetrics(campaignId, eventType, eventData);
    }

    // Process user engagement events
    await processUserEngagementEvent(recipient, eventType, eventData, emailLog);

    // Create real-time analytics event
    await createAnalyticsEvent(eventType, eventData, emailLog);

    // Update sender reputation tracking
    await updateSenderReputation(eventType, eventData);

    console.log(`✅ Event processing completed for ${eventType}`);

  } catch (error) {
    console.error(`❌ Failed to process ${eventType} event:`, error);
    
    // Mark webhook event with error
    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts: { increment: 1 }
      }
    });
    
    throw error;
  }
}

/**
 * Update email log from webhook event
 */
async function updateEmailLogFromWebhook(
  emailLogId: string, 
  eventType: string, 
  eventData: any, 
  timestamp: Date
): Promise<void> {
  const updates: any = {};

  switch (eventType) {
    case 'delivered':
      updates.status = 'DELIVERED';
      updates.deliveredAt = timestamp;
      break;
    
    case 'opened':
      updates.openedAt = timestamp;
      updates.openCount = { increment: 1 };
      updates.lastOpenedAt = timestamp;
      // Store client info for analytics
      if (eventData['client-info']) {
        updates.clientInfo = eventData['client-info'];
      }
      if (eventData.geolocation) {
        updates.geolocation = eventData.geolocation;
      }
      break;
    
    case 'clicked':
      updates.clickedAt = timestamp;
      updates.clickCount = { increment: 1 };
      updates.lastClickedAt = timestamp;
      // Store click details
      if (eventData.url) {
        updates.clickedUrls = {
          push: {
            url: eventData.url,
            timestamp: timestamp,
            userAgent: eventData['client-info']?.['user-agent']
          }
        };
      }
      break;
    
    case 'unsubscribed':
      updates.unsubscribedAt = timestamp;
      break;
    
    case 'complained':
      updates.complainedAt = timestamp;
      break;
    
    case 'bounced':
    case 'failed':
    case 'permanent_fail':
      updates.status = 'BOUNCED';
      updates.bouncedAt = timestamp;
      updates.bounceReason = eventData.reason || eventData['delivery-status']?.description;
      updates.bounceCode = eventData['delivery-status']?.code;
      break;
    
    case 'temporary_fail':
      updates.status = 'TEMPORARY_FAIL';
      updates.lastFailedAt = timestamp;
      updates.failureReason = eventData.reason || eventData['delivery-status']?.description;
      break;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: updates
    });
  }
}

/**
 * Update campaign metrics from webhook events
 */
async function updateCampaignMetrics(
  campaignId: string, 
  eventType: string, 
  eventData: any
): Promise<void> {
  try {
    const incrementField = getMetricFieldForEvent(eventType);
    if (!incrementField) return;

    await prisma.campaignEmail.updateMany({
      where: { 
        campaignId,
        email: eventData.recipient 
      },
      data: {
        [incrementField]: { increment: 1 },
        updatedAt: new Date()
      }
    });

    console.log(`📊 Updated campaign metrics: ${campaignId} - ${eventType}`);
  } catch (error) {
    console.error(`❌ Failed to update campaign metrics:`, error);
  }
}

/**
 * Map event type to campaign metric field
 */
function getMetricFieldForEvent(eventType: string): string | null {
  const mapping: Record<string, string> = {
    'delivered': 'deliveredCount',
    'opened': 'openedCount',
    'clicked': 'clickedCount',
    'unsubscribed': 'unsubscribedCount',
    'complained': 'complainedCount',
    'bounced': 'bouncedCount',
    'failed': 'failedCount'
  };
  return mapping[eventType] || null;
}

/**
 * Process user engagement event
 */
async function processUserEngagementEvent(
  recipient: string,
  eventType: string,
  eventData: any,
  emailLog: any
): Promise<void> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: recipient }
    });

    if (!user) {
      console.log(`ℹ️ No user found for email: ${recipient}`);
      return;
    }

    // Trigger automation events for user engagement
    switch (eventType) {
      case 'opened':
        await getEventSystem().onEmailOpened(user.id, {
          templateId: emailLog.template || 'unknown',
          messageId: emailLog.providerMessageId || eventData.id,
          campaignId: emailLog.campaignId,
          openedAt: new Date(eventData.timestamp * 1000),
          userAgent: eventData['client-info']?.['user-agent'],
          location: eventData.geolocation ? 
            `${eventData.geolocation.city}, ${eventData.geolocation.country}` : undefined
        });
        break;

      case 'clicked':
        await getEventSystem().onEmailClicked(user.id, {
          templateId: emailLog.template || 'unknown',
          messageId: emailLog.providerMessageId || eventData.id,
          campaignId: emailLog.campaignId,
          clickedUrl: eventData.url || 'unknown',
          clickedAt: new Date(eventData.timestamp * 1000),
          linkText: eventData['link-text']
        });
        break;
    }

    // Update user activity timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: createSafeUserUpdate({ lastActivityAt: new Date() })
    });

  } catch (error) {
    console.error('❌ Failed to process user engagement event:', error);
  }
}

/**
 * Create real-time analytics event
 */
async function createAnalyticsEvent(
  eventType: string,
  eventData: any,
  emailLog: any
): Promise<void> {
  try {
    await prisma.emailAnalyticsEvent.create({
      data: {
        eventType,
        emailLogId: emailLog.id,
        campaignId: emailLog.campaignId,
        recipient: eventData.recipient,
        timestamp: new Date(eventData.timestamp * 1000),
        metadata: {
          messageId: eventData.id,
          userAgent: eventData['client-info']?.['user-agent'],
          geolocation: eventData.geolocation,
          url: eventData.url,
          reason: eventData.reason,
          deliveryStatus: eventData['delivery-status']
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to create analytics event:', error);
  }
}

/**
 * Update sender reputation tracking
 */
async function updateSenderReputation(eventType: string, eventData: any): Promise<void> {
  try {
    const domain = eventData['recipient-domain'] || eventData.recipient?.split('@')[1];
    if (!domain) return;

    // Get or create domain reputation record
    const domainReputation = await prisma.domainReputation.upsert({
      where: { domain },
      create: {
        domain,
        totalSent: 0,
        totalDelivered: 0,
        totalBounced: 0,
        totalComplained: 0,
        totalUnsubscribed: 0,
        reputationScore: 100
      },
      update: {}
    });

    // Update reputation metrics
    const updates: any = {};
    
    switch (eventType) {
      case 'delivered':
        updates.totalDelivered = { increment: 1 };
        break;
      case 'bounced':
      case 'failed':
        updates.totalBounced = { increment: 1 };
        break;
      case 'complained':
        updates.totalComplained = { increment: 1 };
        break;
      case 'unsubscribed':
        updates.totalUnsubscribed = { increment: 1 };
        break;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.domainReputation.update({
        where: { domain },
        data: {
          ...updates,
          lastUpdated: new Date()
        }
      });

      // Recalculate reputation score
      await recalculateReputationScore(domain);
    }
  } catch (error) {
    console.error('❌ Failed to update sender reputation:', error);
  }
}

/**
 * Recalculate reputation score for domain
 */
async function recalculateReputationScore(domain: string): Promise<void> {
  try {
    const reputation = await prisma.domainReputation.findUnique({
      where: { domain }
    });

    if (!reputation) return;

    const total = reputation.totalSent || 1;
    const bounceRate = (reputation.totalBounced / total) * 100;
    const complaintRate = (reputation.totalComplained / total) * 100;
    const deliveryRate = (reputation.totalDelivered / total) * 100;

    let score = 100;
    score -= bounceRate * 10; // Bounce penalty
    score -= complaintRate * 50; // Complaint penalty (severe)
    score += (deliveryRate - 95) * 2; // Delivery bonus/penalty

    const newScore = Math.max(0, Math.min(100, Math.round(score)));

    await prisma.domainReputation.update({
      where: { domain },
      data: { 
        reputationScore: newScore,
        lastScoreUpdate: new Date()
      }
    });

    console.log(`📊 Updated reputation score for ${domain}: ${newScore}`);
  } catch (error) {
    console.error('❌ Failed to recalculate reputation score:', error);
  }
}

// Handle GET requests (webhook verification)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    console.log('✅ Webhook challenge verified');
    return new NextResponse(challenge);
  }
  
  return NextResponse.json({ status: 'Mailgun webhook endpoint active' });
}