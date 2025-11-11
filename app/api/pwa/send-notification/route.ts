import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

// Note: For production use, install web-push: npm install web-push
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

    const body = await request.json();
    const { title, message, url, userId, tag } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: title and message' },
        { status: 400 }
      );
    }

    // Get user's subscriptions
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
      icon: '/fly2any-logo.png',
      badge: '/fly2any-logo.png',
      tag: tag || 'fly2any-notification',
      data: {
        url: url || '/',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'view',
          title: 'View',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    const results = [];

    // Send notification to all user's subscriptions
    for (const subscription of subscriptions) {
      try {
        // This is a placeholder - in production, use web-push library
        // await webpush.sendNotification(
        //   {
        //     endpoint: subscription.endpoint,
        //     keys: {
        //       p256dh: subscription.p256dh,
        //       auth: subscription.auth,
        //     },
        //   },
        //   JSON.stringify(notificationPayload)
        // );

        results.push({
          subscriptionId: subscription.id,
          success: true,
        });
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

    // Get user's subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: session.user.id,
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found. Please enable push notifications first.' },
        { status: 404 }
      );
    }

    const testPayload = {
      title: 'Fly2Any Test Notification',
      body: 'Your push notifications are working perfectly!',
      icon: '/fly2any-logo.png',
      badge: '/fly2any-logo.png',
      tag: 'test-notification',
      data: {
        url: '/',
        timestamp: Date.now(),
      },
    };

    return NextResponse.json({
      success: true,
      message: 'Test notification would be sent (web-push not configured)',
      subscriptions: subscriptions.length,
      payload: testPayload,
      note: 'To enable real push notifications, configure web-push library with VAPID keys',
    });
  } catch (error) {
    console.error('Failed to send test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
