/**
 * Push Notification Registration API
 * 
 * Handles registration of FCM/APNs push notification tokens from mobile apps.
 * Stores tokens in database via Prisma for sending notifications later.
 * 
 * Architecture:
 * - Mobile app (Capacitor) registers with FCM/APNs → gets device token
 * - Token is sent here → stored in database
 * - When sending notifications, server uses FCM HTTP API to deliver
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface PushTokenRequest {
  token: string;
  platform?: 'ios' | 'android' | 'web';
  deviceId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PushTokenRequest = await request.json();

    if (!body.token || typeof body.token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid push token' },
        { status: 400 }
      );
    }

    // Detect platform from headers or body
    const platform = (request.headers.get('X-Platform') as 'ios' | 'android' | 'web') || body.platform || 'web';
    const appVersion = request.headers.get('X-App-Version') || '1.0.0';

    // Get authenticated user if available
    let userId: string | null = null;
    try {
      const session = await auth();
      userId = session?.user?.id || null;
    } catch {
      // Anonymous registration is fine
    }

    // Store/update token in database
    // Uses pushSubscription model — endpoint field stores the FCM/APNs token
    // p256dh stores platform, auth stores appVersion (repurposing web push fields)
    if (prisma) {
      await prisma.pushSubscription.upsert({
        where: { endpoint: body.token },
        update: {
          p256dh: platform,
          auth: appVersion,
          userAgent: body.deviceId || null,
          userId: userId || undefined,
          updatedAt: new Date(),
        },
        create: {
          endpoint: body.token,
          p256dh: platform,
          auth: appVersion,
          userAgent: body.deviceId || null,
          userId: userId || undefined,
        },
      });
    }

    console.log('[Push] Token registered:', {
      tokenPrefix: body.token.substring(0, 20) + '...',
      platform,
      appVersion,
      userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
    });

    return NextResponse.json({
      success: true,
      message: 'Push token registered successfully',
      platform,
    });
  } catch (error) {
    console.error('[Push] Registration failed:', error);
    return NextResponse.json(
      { error: 'Failed to register push token' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    service: 'Push Notification Registration',
    status: 'operational',
    supports: ['fcm', 'apns', 'web-push'],
    timestamp: new Date().toISOString(),
  });
}

