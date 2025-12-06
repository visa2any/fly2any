/**
 * Admin Test Telegram API
 *
 * Test and configure Telegram bot notifications for admin alerts
 * GET - Get setup instructions and current config
 * POST - Send a test notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_IDS = process.env.TELEGRAM_ADMIN_CHAT_IDS?.split(',').filter(Boolean) || [];

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(chatId: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!TELEGRAM_BOT_TOKEN) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN not configured' };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );

    const result = await response.json();
    if (!result.ok) {
      return { success: false, error: result.description };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function GET() {
  const isConfigured = !!TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_IDS.length > 0;

  return NextResponse.json({
    status: isConfigured ? 'configured' : 'not_configured',
    config: {
      hasBotToken: !!TELEGRAM_BOT_TOKEN,
      adminChatIds: TELEGRAM_ADMIN_CHAT_IDS.length,
    },
    setupGuide: {
      step1: {
        title: 'Create Telegram Bot',
        instructions: [
          '1. Open Telegram and search for @BotFather',
          '2. Send /newbot command',
          '3. Follow prompts to name your bot (e.g., "Fly2Any Admin Bot")',
          '4. Copy the bot token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)',
        ],
      },
      step2: {
        title: 'Get Your Chat ID',
        instructions: [
          '1. Start a chat with your new bot',
          '2. Send any message to the bot',
          '3. Visit: https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates',
          '4. Find "chat":{"id": YOUR_CHAT_ID}',
          '5. Copy the chat ID number',
        ],
      },
      step3: {
        title: 'Add Environment Variables',
        instructions: [
          'Add to Vercel Environment Variables:',
          'TELEGRAM_BOT_TOKEN=your_bot_token_here',
          'TELEGRAM_ADMIN_CHAT_IDS=chat_id_1,chat_id_2',
        ],
      },
    },
    testEndpoint: {
      method: 'POST',
      url: '/api/admin/test-telegram',
      body: '{ "chatId": "optional - uses configured IDs if not provided" }',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Auth check - require admin
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma?.adminUser.findUnique({
      where: { userId: session.user.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check configuration
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Telegram bot not configured',
        hint: 'Add TELEGRAM_BOT_TOKEN to your environment variables. GET this endpoint for setup guide.',
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const targetChatIds = body.chatId ? [body.chatId] : TELEGRAM_ADMIN_CHAT_IDS;

    if (targetChatIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No chat IDs configured',
        hint: 'Add TELEGRAM_ADMIN_CHAT_IDS to your environment variables (comma-separated for multiple admins)',
      }, { status: 400 });
    }

    // Send test message
    const testMessage = `
🧪 <b>TEST NOTIFICATION</b>

✅ Telegram integration is working!

📋 <b>Configuration:</b>
• Bot: Connected
• Chat IDs: ${targetChatIds.length} configured
• Time: ${new Date().toISOString()}

🔔 You will receive instant alerts for:
• New bookings
• Payment confirmations
• Schedule changes
• System alerts

<i>Sent from Fly2Any Admin Dashboard</i>
`.trim();

    const results = await Promise.all(
      targetChatIds.map(chatId => sendTelegramMessage(chatId.trim(), testMessage))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: successful > 0,
      message: `Test sent to ${successful}/${targetChatIds.length} chat(s)`,
      results: targetChatIds.map((id, i) => ({
        chatId: id,
        success: results[i].success,
        error: results[i].error,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[TEST_TELEGRAM_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test message' },
      { status: 500 }
    );
  }
}
