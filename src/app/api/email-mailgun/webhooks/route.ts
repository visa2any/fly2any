import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/database/prisma';
import { createSafeEmailLogUpdate, createSafeUserUpdate } from '@/lib/database/email-status-handler';

/**
 * 🎯 MAILGUN WEBHOOK HANDLER
 * Handles delivery, bounce, complaint, and other email events
 * 
 * Webhook URL: https://yourdomain.com/api/email-mailgun/webhooks
 * 
 * Required environment variables:
 * - MAILGUN_WEBHOOK_SIGNING_KEY (from Mailgun dashboard)
 */

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
    message?: {
      headers: {
        'message-id': string;
      };
    };
    recipient: string;
    'delivery-status'?: {
      message: string;
      code: number;
      description?: string;
    };
    reason?: string;
    severity?: string;
    tags?: string[];
    'user-variables'?: Record<string, any>;
  };
}

/**
 * Verify webhook signature from Mailgun
 */
function verifyWebhookSignature(
  timestamp: string,
  token: string,
  signature: string,
  signingKey: string
): boolean {
  const value = timestamp + token;
  const hash = crypto
    .createHmac('sha256', signingKey)
    .update(value)
    .digest('hex');
  
  return hash === signature;
}

/**
 * Handle Mailgun webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSigningKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
    
    if (!webhookSigningKey) {
      console.error('❌ MAILGUN_WEBHOOK_SIGNING_KEY not configured');
      return NextResponse.json(
        { error: 'Webhook signing key not configured' },
        { status: 500 }
      );
    }

    const body: MailgunWebhookEvent = await request.json();
    const { signature, 'event-data': eventData } = body;

    console.log('📧 Mailgun webhook received:', {
      event: eventData.event,
      recipient: eventData.recipient,
      timestamp: new Date(eventData.timestamp * 1000).toISOString()
    });

    // Verify webhook signature for security
    const isValidSignature = verifyWebhookSignature(
      signature.timestamp,
      signature.token,
      signature.signature,
      webhookSigningKey
    );

    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature from Mailgun');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('✅ Mailgun webhook signature verified');

    // Extract message ID for tracking
    const messageId = eventData.id;
    const recipient = eventData.recipient;
    const eventType = eventData.event;
    const timestamp = new Date(eventData.timestamp * 1000);

    // Find the email log entry
    let emailLog;
    try {
      emailLog = await prisma.emailLog.findFirst({
        where: {
          OR: [
            { providerMessageId: messageId },
            { to: recipient }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Could not query email log:', (dbError as Error).message);
    }

    // Process different event types
    switch (eventType) {
      case 'delivered':
        console.log(`✅ Email delivered to ${recipient}`);
        
        if (emailLog) {
          try {
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                ...createSafeEmailLogUpdate({ status: 'DELIVERED', deliveredAt: timestamp }),
                // webhookData field not in current schema
              }
            });
          } catch (dbError) {
            console.warn('⚠️ Could not update email log:', (dbError as Error).message);
          }
        }
        break;

      case 'opened':
        console.log(`👀 Email opened by ${recipient}`);
        
        if (emailLog) {
          try {
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                ...createSafeEmailLogUpdate({ openedAt: timestamp }),
                // webhookData field not in current schema
              }
            });
          } catch (dbError) {
            console.warn('⚠️ Could not update email log:', (dbError as Error).message);
          }
        }
        break;

      case 'clicked':
        console.log(`🖱️ Email link clicked by ${recipient}`);
        
        if (emailLog) {
          try {
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                ...createSafeEmailLogUpdate({ clickedAt: timestamp }),
                // webhookData field not in current schema
              }
            });
          } catch (dbError) {
            console.warn('⚠️ Could not update email log:', (dbError as Error).message);
          }
        }
        break;

      case 'bounced':
      case 'dropped':
        const bounceReason = eventData.reason || eventData['delivery-status']?.message || 'Unknown';
        console.log(`❌ Email ${eventType} for ${recipient}: ${bounceReason}`);
        
        if (emailLog) {
          try {
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                ...createSafeEmailLogUpdate({ status: 'BOUNCED', bounceReason: bounceReason }),
                // bouncedAt and webhookData fields not in current schema
              }
            });
          } catch (dbError) {
            console.warn('⚠️ Could not update email log:', (dbError as Error).message);
          }
        }

        // Mark email as invalid for future campaigns
        try {
          await prisma.lead.updateMany({
            where: { email: recipient },
            data: { 
              emailBounced: true,
              emailBounceReason: bounceReason,
              emailBouncedAt: timestamp
            }
          });
          console.log(`📝 Marked ${recipient} as bounced in leads database`);
        } catch (dbError) {
          console.warn('⚠️ Could not update lead bounce status:', (dbError as Error).message);
        }
        break;

      case 'complained':
        console.log(`🚨 Spam complaint from ${recipient}`);
        
        if (emailLog) {
          try {
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                ...createSafeEmailLogUpdate({ status: 'COMPLAINED' }),
                // complainedAt and webhookData fields not in current schema
              }
            });
          } catch (dbError) {
            console.warn('⚠️ Could not update email log:', (dbError as Error).message);
          }
        }

        // Mark email as complained and suppress future emails
        try {
          await prisma.lead.updateMany({
            where: { email: recipient },
            data: { 
              emailComplained: true,
              emailComplainedAt: timestamp,
              emailSuppressed: true // Suppress all future emails
            }
          });
          console.log(`🚨 Marked ${recipient} as complained and suppressed`);
        } catch (dbError) {
          console.warn('⚠️ Could not update lead complaint status:', (dbError as Error).message);
        }
        break;

      case 'unsubscribed':
        console.log(`❌ User unsubscribed: ${recipient}`);
        
        if (emailLog) {
          try {
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                ...createSafeEmailLogUpdate({ status: 'UNSUBSCRIBED' }),
                // unsubscribedAt and webhookData fields not in current schema
              }
            });
          } catch (dbError) {
            console.warn('⚠️ Could not update email log:', (dbError as Error).message);
          }
        }

        // Mark user as unsubscribed
        try {
          await prisma.lead.updateMany({
            where: { email: recipient },
            data: { 
              unsubscribed: true,
              unsubscribedAt: timestamp,
              emailSuppressed: true // Suppress all future emails
            }
          });
          console.log(`❌ Marked ${recipient} as unsubscribed`);
        } catch (dbError) {
          console.warn('⚠️ Could not update lead unsubscribe status:', (dbError as Error).message);
        }
        break;

      default:
        console.log(`ℹ️ Unhandled Mailgun event: ${eventType} for ${recipient}`);
        break;
    }

    // Log webhook event for debugging
    try {
      await prisma.webhookLog.create({
        data: {
          provider: 'MAILGUN',
          event: eventType,
          recipient: recipient,
          messageId: messageId,
          data: body,
          processedAt: new Date()
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Could not log webhook event:', (dbError as Error).message);
    }

    return NextResponse.json({ 
      success: true,
      message: `Mailgun ${eventType} event processed`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Mailgun webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook verification
 */
export async function GET() {
  return NextResponse.json({
    service: 'Mailgun Webhook Handler',
    status: 'active',
    timestamp: new Date().toISOString(),
    events_supported: [
      'delivered',
      'opened',
      'clicked',
      'bounced',
      'dropped',
      'complained',
      'unsubscribed'
    ],
    configuration: {
      webhook_url: '/api/email-mailgun/webhooks',
      required_env: ['MAILGUN_WEBHOOK_SIGNING_KEY'],
      security: 'HMAC SHA256 signature verification'
    }
  });
}