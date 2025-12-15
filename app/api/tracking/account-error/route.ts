import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const error = await request.json();

    // Log to console for immediate visibility
    console.error('[ACCOUNT_ERROR]', JSON.stringify({
      type: error.type,
      message: error.message,
      page: error.page,
      code: error.code,
      email: error.email?.substring(0, 3) + '***', // Partial for privacy
      timestamp: error.timestamp,
    }));

    // Store in database if available
    if (prisma) {
      try {
        await (prisma as any).userActivity?.create({
          data: {
            eventType: `error:${error.type}`,
            eventData: {
              message: error.message,
              code: error.code,
              page: error.page,
              metadata: error.metadata,
            },
            userAgent: request.headers.get('user-agent') || undefined,
          },
        });
      } catch (dbError) {
        // Table might not exist, log but continue
        console.error('[DB_ERROR] Failed to store account error:', dbError);
      }
    }

    // Send notification for critical errors
    if (['AUTH_OAUTH_NOT_LINKED', 'AUTH_SIGNIN_FAILED', 'AUTH_SIGNUP_FAILED'].includes(error.type)) {
      await notifyAdmin(error);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[TRACKING_ERROR]', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

async function notifyAdmin(error: any) {
  // Use existing notification system if configured
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Account Error: ${error.type}\n${error.message}\nPage: ${error.page}`,
      }),
    });
  } catch (e) {
    // Silent fail
  }
}
