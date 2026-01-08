import { NextRequest, NextResponse } from 'next/server';
import { notifyTelegramAdmins, sendAdminAlert } from '@/lib/notifications/notification-service';

/**
 * Test Notifications Endpoint
 * Tests Telegram and Email notification system
 *
 * GET /api/test-notifications?test=telegram
 * GET /api/test-notifications?test=email
 * GET /api/test-notifications?test=both
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('test') || 'both';

    const results = {
      telegram: false,
      email: false,
      timestamp: new Date().toISOString(),
    };

    // Test Telegram
    if (testType === 'telegram' || testType === 'both') {
      try {
        const telegramResult = await notifyTelegramAdmins(`
🧪 <b>NOTIFICATION TEST</b>

📱 <b>Type:</b> Telegram Test Alert
⏰ <b>Time:</b> ${new Date().toLocaleString()}
✅ <b>Status:</b> System Operational

<i>If you're seeing this, Telegram notifications are working!</i>
        `.trim());

        results.telegram = telegramResult.sent > 0;
        console.log('✅ Telegram test result:', telegramResult);
      } catch (error: any) {
        console.error('❌ Telegram test failed:', error);
        results.telegram = false;
      }
    }

    // Test Email
    if (testType === 'email' || testType === 'both') {
      try {
        const emailResult = await sendAdminAlert({
          type: 'notification_test',
          priority: 'normal',
          timestamp: new Date().toISOString(),
          message: 'Email notification system test',
          testData: {
            testType: 'email',
            sentAt: new Date().toISOString(),
            status: 'SUCCESS',
          },
        });

        results.email = emailResult;
        console.log('✅ Email test result:', emailResult);
      } catch (error: any) {
        console.error('❌ Email test failed:', error);
        results.email = false;
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      message: 'Notification test completed',
      results,
      config: {
        hasTelegramToken: !!process.env.TELEGRAM_BOT_TOKEN,
        hasTelegramChatIds: !!process.env.TELEGRAM_ADMIN_CHAT_IDS,
        hasMailgunKey: !!process.env.MAILGUN_API_KEY,
        hasMailgunDomain: !!process.env.MAILGUN_DOMAIN,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Notification test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
