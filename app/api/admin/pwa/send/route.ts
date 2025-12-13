import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notifyTelegramAdmins } from '@/lib/notifications/notification-service';

export const dynamic = 'force-dynamic';

interface SendPushRequest {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
  targetUserIds?: string[];
  channels?: ('push' | 'telegram')[];
}

// Helper: Check admin authorization (session-based or token-based)
async function isAdminAuthorized(request: NextRequest): Promise<boolean> {
  // Method 1: Session-based auth (user with admin role)
  const session = await auth();
  if (session?.user && (session.user as any).role === 'admin') {
    return true;
  }

  // Method 2: Token-based auth (Authorization header)
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;
  if (adminSecret && authHeader === `Bearer ${adminSecret}`) {
    return true;
  }

  // Method 3: Admin email check (allow specific emails)
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (session?.user?.email && adminEmails.includes(session.user.email.toLowerCase())) {
    return true;
  }

  return false;
}

// Send Push Notification
export async function POST(request: NextRequest) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, url, icon, tag, targetUserIds, channels }: SendPushRequest = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body required' }, { status: 400 });
    }

    // Determine which channels to use (default to both if not specified)
    const activeChannels = channels?.length ? channels : ['push', 'telegram'];

    const results: {
      push?: { sentCount: number; failedCount: number; totalTargeted: number };
      telegram?: { sent: boolean; error?: string };
    } = {};

    // Send Telegram notification if channel is enabled
    if (activeChannels.includes('telegram')) {
      try {
        const telegramMessage = `
📢 <b>${title}</b>

${body}

${url && url !== '/' ? `🔗 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com'}${url}">Open Link</a>` : ''}
        `.trim();

        await notifyTelegramAdmins(telegramMessage);
        results.telegram = { sent: true };
      } catch (error: any) {
        results.telegram = { sent: false, error: error.message };
      }
    }

    // Send Web Push notifications if channel is enabled
    if (activeChannels.includes('push')) {
      // Check if web-push is available
      let webpush;
      try {
        webpush = require('web-push');
        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
          webpush.setVapidDetails(
            'mailto:support@fly2any.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
          );
        }
      } catch {
        results.push = { sentCount: 0, failedCount: 0, totalTargeted: 0 };
        // Only return error if push is the only channel
        if (!activeChannels.includes('telegram')) {
          return NextResponse.json({
            error: 'Web push not configured. Install web-push and set VAPID keys.',
            setup: {
              step1: 'npm install web-push',
              step2: 'npx web-push generate-vapid-keys',
              step3: 'Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to .env'
            }
          }, { status: 503 });
        }
      }

      if (webpush) {
        // Build query
        const whereClause = targetUserIds?.length
          ? { userId: { in: targetUserIds } }
          : {};

        const subscriptions = await prisma?.pushSubscription.findMany({
          where: whereClause,
        }) || [];

        if (subscriptions.length === 0) {
          results.push = { sentCount: 0, failedCount: 0, totalTargeted: 0 };
        } else {
          const payload = JSON.stringify({
            title,
            body,
            url: url || '/',
            icon: icon || '/logo.png',
            tag: tag || `notification-${Date.now()}`,
            requireInteraction: true,
          });

          let sentCount = 0;
          let failedCount = 0;

          // Send notifications
          const pushResults = await Promise.allSettled(
            subscriptions.map(async (sub) => {
              try {
                await webpush.sendNotification(
                  {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                  },
                  payload
                );
                return true;
              } catch (error: any) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                  await prisma?.pushSubscription.delete({
                    where: { endpoint: sub.endpoint },
                  }).catch(() => null);
                }
                throw error;
              }
            })
          );

          pushResults.forEach((result) => {
            if (result.status === 'fulfilled') sentCount++;
            else failedCount++;
          });

          results.push = { sentCount, failedCount, totalTargeted: subscriptions.length };
        }
      }
    }

    return NextResponse.json({
      success: true,
      channels: activeChannels,
      results,
      // For backwards compatibility
      sentCount: results.push?.sentCount || 0,
      failedCount: results.push?.failedCount || 0,
      totalTargeted: results.push?.totalTargeted || 0,
      telegramSent: results.telegram?.sent || false,
    });
  } catch (error) {
    console.error('Send push error:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
