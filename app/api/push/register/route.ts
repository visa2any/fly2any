/**
 * Push Notification Registration API
 * 
 * Handles registration of push notification tokens from mobile apps.
 * Stores tokens in database for sending notifications later.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface PushTokenRequest {
  token: string;
  platform?: 'ios' | 'android' | 'web';
  deviceId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: PushTokenRequest = await request.json();

    // Validate token
    if (!body.token || typeof body.token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid push token' },
        { status: 400 }
      );
    }

    // Extract platform info from headers (set by mobile app)
    const platform = request.headers.get('X-Platform') as 'ios' | 'android' | 'web' || body.platform || 'web';
    const appVersion = request.headers.get('X-App-Version') || 'unknown';

    // Log registration (for now - will store in database later)
    console.log('[Push] Token registered:', {
      token: body.token.substring(0, 20) + '...',
      platform,
      appVersion,
      deviceId: body.deviceId,
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in database
    // await prisma.pushToken.upsert({
    //   where: { token: body.token },
    //   update: { platform, deviceId: body.deviceId, updatedAt: new Date() },
    //   create: { token: body.token, platform, deviceId: body.deviceId },
    // });

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
    timestamp: new Date().toISOString(),
  });
}
