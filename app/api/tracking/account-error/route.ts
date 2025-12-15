import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TELEGRAM_ADMIN_CHAT_IDS = process.env.TELEGRAM_ADMIN_CHAT_IDS?.trim().split(',').map(id => id.trim()).filter(Boolean) || [];

export async function POST(request: NextRequest) {
  try {
    const error = await request.json();

    // Log to console for immediate visibility
    console.error('[ACCOUNT_ERROR]', JSON.stringify({
      type: error.type,
      message: error.message,
      page: error.page,
      code: error.code,
      email: error.email?.substring(0, 3) + '***',
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
        console.error('[DB_ERROR] Failed to store account error:', dbError);
      }
    }

    // Send notification for critical errors via Telegram
    if (['AUTH_OAUTH_NOT_LINKED', 'AUTH_SIGNIN_FAILED', 'AUTH_SIGNUP_FAILED'].includes(error.type)) {
      await notifyAdminViaTelegram(error);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[TRACKING_ERROR]', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

async function notifyAdminViaTelegram(error: any) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_ADMIN_CHAT_IDS.length === 0) {
    console.warn('[NOTIFY] Telegram not configured - skipping notification');
    return;
  }

  const emoji = {
    AUTH_OAUTH_NOT_LINKED: '🔗',
    AUTH_SIGNIN_FAILED: '🔐',
    AUTH_SIGNUP_FAILED: '📝',
  }[error.type] || '⚠️';

  const message = `
${emoji} <b>ACCOUNT ERROR</b>

<b>Type:</b> ${error.type}
<b>Page:</b> ${error.page || '/auth/signin'}
<b>Error:</b> ${error.code || 'Unknown'}

<b>Details:</b>
${error.message}

<b>Time:</b> ${new Date().toISOString()}
`.trim();

  for (const chatId of TELEGRAM_ADMIN_CHAT_IDS) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    } catch (e) {
      console.error('[TELEGRAM] Failed to send:', e);
    }
  }
}
