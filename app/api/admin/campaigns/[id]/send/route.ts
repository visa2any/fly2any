export const dynamic = 'force-dynamic';

/**
 * Campaign Bulk Send API
 *
 * Sends a campaign to all targeted subscribers
 * - Fetches subscriber list based on campaign targeting
 * - Sends emails in batches to avoid rate limits
 * - Tracks individual email sends
 * - Updates campaign stats in real-time
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { mailgunClient } from '@/lib/email/mailgun-client';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for bulk sending

// Types
interface Subscriber {
  id: string;
  email: string;
  firstName?: string | null;
  status: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string | null;
  body: string;
  plainText?: string | null;
  status: string;
  targetAudience: string;
  excludeList: string[];
}

// Batch size for sending (Mailgun rate limit is 300/min on free tier)
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 2000; // 2 second delay between batches

/**
 * POST - Send campaign to subscribers
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const prisma = getPrismaClient();
    const body = await request.json();

    // Optional: custom email list override (for CSV uploads)
    const customEmails: string[] | undefined = body.emails;
    const testMode = body.testMode === true;
    const testEmail = body.testEmail;

    // Fetch campaign
    const [campaign] = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns" WHERE "id" = ${campaignId}
    `;

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Validate campaign status
    if (campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Campaign is already being sent' },
        { status: 400 }
      );
    }

    if (campaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Campaign has already been sent. Create a duplicate to resend.' },
        { status: 400 }
      );
    }

    // Test mode - send to single email
    if (testMode && testEmail) {
      console.log(`📧 [CAMPAIGN] Sending test email for "${campaign.name}" to ${testEmail}`);

      const html = buildEmailHtml(campaign.body, {
        firstName: 'Test User',
        email: testEmail,
        unsubscribeUrl: `https://www.fly2any.com/unsubscribe?email=${encodeURIComponent(testEmail)}`,
      });

      const result = await mailgunClient.send({
        to: testEmail,
        subject: `[TEST] ${campaign.subject}`,
        html,
        text: campaign.plainText || stripHtml(campaign.body),
        tags: ['campaign', 'test', campaign.name.toLowerCase().replace(/\s+/g, '-')],
        forceSend: true, // Always send test emails
      });

      return NextResponse.json({
        success: result.success,
        testMode: true,
        messageId: result.messageId,
        error: result.error,
      });
    }

    // Get subscriber list
    let subscribers: Subscriber[];

    if (customEmails && customEmails.length > 0) {
      // Custom email list provided (from CSV upload)
      subscribers = customEmails.map((email, index) => ({
        id: `custom_${index}`,
        email: email.trim().toLowerCase(),
        firstName: null,
        status: 'ACTIVE',
      }));
    } else {
      // Fetch from database based on targeting
      subscribers = await getTargetedSubscribers(prisma, campaign);
    }

    // Filter out excluded emails and suppression list
    const suppressedEmails = await prisma.$queryRaw<{ email: string }[]>`
      SELECT "email" FROM "email_suppressions"
    `;
    const suppressedSet = new Set(suppressedEmails.map(s => s.email.toLowerCase()));
    const excludeSet = new Set((campaign.excludeList || []).map(e => e.toLowerCase()));

    const validSubscribers = subscribers.filter(
      sub => !suppressedSet.has(sub.email.toLowerCase()) && !excludeSet.has(sub.email.toLowerCase())
    );

    if (validSubscribers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid subscribers to send to',
        details: 'All subscribers are either suppressed or excluded',
      }, { status: 400 });
    }

    console.log(`📧 [CAMPAIGN] Starting send for "${campaign.name}" to ${validSubscribers.length} subscribers`);

    // Update campaign status to sending
    await prisma.$executeRaw`
      UPDATE "email_campaigns"
      SET "status" = 'sending', "startedAt" = NOW(), "totalRecipients" = ${validSubscribers.length}, "updatedAt" = NOW()
      WHERE "id" = ${campaignId}
    `;

    // Send emails in batches
    let sent = 0;
    let delivered = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < validSubscribers.length; i += BATCH_SIZE) {
      const batch = validSubscribers.slice(i, i + BATCH_SIZE);

      // Send batch in parallel
      const results = await Promise.all(
        batch.map(async (subscriber) => {
          try {
            const html = buildEmailHtml(campaign.body, {
              firstName: subscriber.firstName || 'Traveler',
              email: subscriber.email,
              unsubscribeUrl: `https://www.fly2any.com/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
            });

            const result = await mailgunClient.send({
              to: subscriber.email,
              subject: campaign.subject,
              html,
              text: campaign.plainText || stripHtml(campaign.body),
              tags: ['campaign', campaign.name.toLowerCase().replace(/\s+/g, '-')],
              forceSend: true,
            });

            // Record send
            await prisma.$executeRaw`
              INSERT INTO "email_campaign_sends" (
                "id", "campaignId", "email", "status", "messageId", "sentAt", "createdAt", "updatedAt"
              ) VALUES (
                ${`send_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`},
                ${campaignId},
                ${subscriber.email},
                ${result.success ? 'sent' : 'failed'},
                ${result.messageId || null},
                ${result.success ? new Date() : null},
                NOW(),
                NOW()
              )
              ON CONFLICT ("campaignId", "email") DO UPDATE SET
                "status" = EXCLUDED."status",
                "messageId" = EXCLUDED."messageId",
                "sentAt" = EXCLUDED."sentAt",
                "updatedAt" = NOW()
            `;

            // Update subscriber last email sent
            if (subscriber.id && !subscriber.id.startsWith('custom_')) {
              await prisma.$executeRawUnsafe(
                `UPDATE "newsletter_subscribers" SET "lastEmailSentAt" = NOW(), "emailsSent" = "emailsSent" + 1 WHERE "id" = $1`,
                subscriber.id
              );
            }

            return { success: result.success, error: result.error };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        })
      );

      // Count results
      for (const result of results) {
        if (result.success) {
          sent++;
          delivered++;
        } else {
          failed++;
          if (result.error) errors.push(result.error);
        }
      }

      // Update campaign stats after each batch
      await prisma.$executeRaw`
        UPDATE "email_campaigns"
        SET "sent" = ${sent}, "delivered" = ${delivered}, "bounced" = ${failed}, "updatedAt" = NOW()
        WHERE "id" = ${campaignId}
      `;

      // Delay before next batch (except for last batch)
      if (i + BATCH_SIZE < validSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    // Update campaign to sent
    await prisma.$executeRaw`
      UPDATE "email_campaigns"
      SET "status" = 'sent', "completedAt" = NOW(), "updatedAt" = NOW()
      WHERE "id" = ${campaignId}
    `;

    console.log(`✅ [CAMPAIGN] Completed send for "${campaign.name}": ${sent} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      campaignId,
      stats: {
        total: validSubscribers.length,
        sent,
        delivered,
        failed,
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Only first 10 errors
      message: `Campaign sent to ${sent} subscribers`,
    });
  } catch (error) {
    console.error('[CAMPAIGN_SEND] Error:', error);

    // Try to update campaign status to failed
    try {
      const { id: campaignId } = await params;
      const prisma = getPrismaClient();
      await prisma.$executeRaw`
        UPDATE "email_campaigns"
        SET "status" = 'draft', "updatedAt" = NOW()
        WHERE "id" = ${campaignId} AND "status" = 'sending'
      `;
    } catch (e) {
      // Ignore cleanup errors
    }

    return NextResponse.json(
      { error: 'Failed to send campaign', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Get subscribers based on campaign targeting
 */
async function getTargetedSubscribers(
  prisma: ReturnType<typeof getPrismaClient>,
  campaign: EmailCampaign
): Promise<Subscriber[]> {
  let query = '';

  switch (campaign.targetAudience) {
    case 'active':
      query = `SELECT "id", "email", "firstName", "status" FROM "newsletter_subscribers" WHERE "status" = 'ACTIVE'`;
      break;
    case 'new':
      // Subscribers from last 30 days
      query = `SELECT "id", "email", "firstName", "status" FROM "newsletter_subscribers" WHERE "status" = 'ACTIVE' AND "subscribedAt" > NOW() - INTERVAL '30 days'`;
      break;
    case 'engaged':
      // Subscribers who have opened/clicked emails
      query = `SELECT "id", "email", "firstName", "status" FROM "newsletter_subscribers" WHERE "status" = 'ACTIVE' AND ("emailsOpened" > 0 OR "emailsClicked" > 0)`;
      break;
    case 'all':
    default:
      query = `SELECT "id", "email", "firstName", "status" FROM "newsletter_subscribers" WHERE "status" = 'ACTIVE'`;
      break;
  }

  return prisma.$queryRawUnsafe<Subscriber[]>(query);
}

/**
 * Build personalized email HTML
 */
function buildEmailHtml(
  template: string,
  variables: {
    firstName: string;
    email: string;
    unsubscribeUrl: string;
  }
): string {
  let html = template;

  // Replace common variables
  html = html.replace(/\{\{firstName\}\}/g, variables.firstName);
  html = html.replace(/\{\{first_name\}\}/g, variables.firstName);
  html = html.replace(/\{\{email\}\}/g, variables.email);
  html = html.replace(/\{\{unsubscribe_url\}\}/g, variables.unsubscribeUrl);
  html = html.replace(/\{\{unsubscribeUrl\}\}/g, variables.unsubscribeUrl);

  // Add unsubscribe footer if not present
  if (!html.includes('unsubscribe')) {
    html += `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #666; font-size: 12px;">
        <p>You're receiving this because you subscribed to Fly2Any updates.</p>
        <p><a href="${variables.unsubscribeUrl}" style="color: #666;">Unsubscribe</a> from future emails.</p>
      </div>
    `;
  }

  return html;
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
