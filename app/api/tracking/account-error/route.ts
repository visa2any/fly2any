import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TELEGRAM_ADMIN_CHAT_IDS = process.env.TELEGRAM_ADMIN_CHAT_IDS?.trim().split(',').map(id => id.trim()).filter(Boolean) || [];

// Extract client IP from request headers
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || request.headers.get('cf-connecting-ip')
    || request.ip
    || 'Unknown';
}

// Get geo info from Vercel headers or IP lookup
function getGeoInfo(request: NextRequest) {
  return {
    country: request.headers.get('x-vercel-ip-country') || request.geo?.country,
    city: request.headers.get('x-vercel-ip-city') || request.geo?.city,
    region: request.headers.get('x-vercel-ip-country-region') || request.geo?.region,
  };
}

export async function POST(request: NextRequest) {
  try {
    const error = await request.json();

    // Enrich with server-side security data
    const ip = getClientIP(request);
    const geo = getGeoInfo(request);
    const ua = request.headers.get('user-agent') || 'Unknown';

    const enrichedSecurity = {
      ...error.security,
      ip,
      userAgent: ua,
      geo: { ...error.security?.geo, ...geo },
    };

    // Log FULL details for security monitoring
    console.error('[🔐 ACCOUNT_ERROR]', JSON.stringify({
      type: error.type,
      message: error.message,
      page: error.page,
      email: error.email,
      ip,
      geo,
      browser: error.security?.browser,
      device: error.security?.device,
      attemptCount: error.security?.attemptCount,
      timestamp: new Date().toISOString(),
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
              email: error.email,
              metadata: error.metadata,
              security: enrichedSecurity,
            },
            userAgent: ua,
            ipAddress: ip,
          },
        });
      } catch (dbError) {
        console.error('[DB_ERROR] Failed to store account error:', dbError);
      }
    }

    // Send notification for critical errors via Telegram
    if (['AUTH_OAUTH_NOT_LINKED', 'AUTH_SIGNIN_FAILED', 'AUTH_SIGNUP_FAILED'].includes(error.type)) {
      await notifyAdminViaTelegram(error, enrichedSecurity);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[TRACKING_ERROR]', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

async function notifyAdminViaTelegram(error: any, security: any) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_ADMIN_CHAT_IDS.length === 0) {
    console.warn('[NOTIFY] Telegram not configured - skipping notification');
    return;
  }

  const emoji = {
    AUTH_OAUTH_NOT_LINKED: '🔗',
    AUTH_SIGNIN_FAILED: '🔐',
    AUTH_SIGNUP_FAILED: '📝',
  }[error.type] || '⚠️';

  // Build location string from geo data
  const locationParts = [security?.geo?.city, security?.geo?.region, security?.geo?.country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown';

  // Determine risk level based on attempt count
  const attemptCount = security?.attemptCount || 1;
  const riskLevel = attemptCount >= 5 ? '🚨 HIGH RISK' : attemptCount >= 3 ? '⚠️ ELEVATED' : '📊 NORMAL';

  const message = `
${emoji} <b>ACCOUNT ERROR</b>

<b>Type:</b> ${error.type}
<b>Page:</b> ${error.page || '/auth/signin'}
<b>Error:</b> ${error.code || 'Unknown'}
<b>Email:</b> ${error.email || 'Not provided'}

<b>📍 Location:</b>
${location}

<b>🖥️ Device Info:</b>
• Browser: ${security?.browser || 'Unknown'}
• OS: ${security?.os || 'Unknown'}
• Device: ${security?.device || 'Unknown'}
• Screen: ${security?.screenSize || 'Unknown'}

<b>🔒 Security:</b>
• IP: ${security?.ip || 'Unknown'}
• Attempts: ${attemptCount} ${riskLevel}
• Language: ${security?.language || 'Unknown'}
• Timezone: ${security?.timezone || 'Unknown'}
• Referrer: ${security?.referrer || 'Direct'}

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
