import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/db/prisma';
import { sendPushToToken } from '@/lib/push-notifications';

// Note: For web push in production, install web-push: npm install web-push
// import webpush from 'web-push';

// Configure VAPID keys (generate with: npx web-push generate-vapid-keys)
// webpush.setVapidDetails(
//   'mailto:your-email@example.com',
//   process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
//   process.env.VAPID_PRIVATE_KEY!
// );

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const body = await request.json();
    const { title, message, url, userId, tag } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: title and message' },
        { status: 400 }
      );
    }

    // Get user's subscriptions (both web and mobile)
    const targetUserId = userId || session.user.id;
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: targetUserId,
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found for user' },
        { status: 404 }
      );
    }

    const notificationPayload = {
      title,
      body: message,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: tag || 'fly2any-notification',
      data: {
        url: url || '/',
        timestamp: Date.now(),
      },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    const results = [];

    for (const subscription of subscriptions) {
      try {
        const isMobileToken = subscription.p256dh === 'ios' || subscription.p256dh === 'android';

        if (isMobileToken) {
          // ===== NATIVE MOBILE (FCM/APNs) =====
          const success = await sendPushToToken(subscription.endpoint, {
            title,
            body: message,
            data: { url: url || '/', type: tag || 'general' },
          });

          results.push({
            subscriptionId: subscription.id,
            platform: subscription.p256dh,
            success,
          });
        } else {
          // ===== WEB PUSH (VAPID) =====
          // Placeholder - in production, use web-push library:
          // await webpush.sendNotification(
          //   {
          //     endpoint: subscription.endpoint,
          //     keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          //   },
          //   JSON.stringify(notificationPayload)
          // );

          results.push({
            subscriptionId: subscription.id,
            platform: 'web',
            success: true,
          });
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
        results.push({
          subscriptionId: subscription.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // If subscription is invalid, remove it
        if (error instanceof Error && error.message.includes('410')) {
          await prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
        }
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Sent ${successCount} of ${results.length} notifications`,
      results,
    });
  } catch (error) {
    console.error('Failed to send notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

// Test endpoint for sending a test notification
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: session.user.id },
      select: { id: true, endpoint: true, p256dh: true, userAgent: true, createdAt: true },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found. Please enable push notifications first.' },
        { status: 404 }
      );
    }

    const webCount = subscriptions.filter(s => s.p256dh !== 'ios' && s.p256dh !== 'android').length;
    const mobileCount = subscriptions.length - webCount;

    return NextResponse.json({
      success: true,
      subscriptions: {
        total: subscriptions.length,
        web: webCount,
        mobile: mobileCount,
      },
      note: 'Use POST to send actual notifications',
    });
  } catch (error) {
    console.error('Failed to get notification status:', error);
    return NextResponse.json(
      { error: 'Failed to get notification status' },
      { status: 500 }
    );
  }
}

