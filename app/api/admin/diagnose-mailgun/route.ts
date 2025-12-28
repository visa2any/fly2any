export const dynamic = 'force-dynamic';

/**
 * Mailgun Diagnostic Endpoint
 *
 * Tests Mailgun configuration and returns detailed error information
 * GET - Check configuration
 * POST - Send test email with detailed error reporting
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.fly2any.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Fly2Any <support@fly2any.com>';

export async function GET() {
  return NextResponse.json({
    status: 'diagnostic',
    config: {
      hasApiKey: !!MAILGUN_API_KEY,
      apiKeyPreview: MAILGUN_API_KEY ? `${MAILGUN_API_KEY.slice(0, 8)}...${MAILGUN_API_KEY.slice(-4)}` : null,
      domain: MAILGUN_DOMAIN,
      fromEmail: EMAIL_FROM,
      nodeEnv: process.env.NODE_ENV,
      mailgunUrl: `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
    },
    troubleshooting: {
      step1: 'Verify domain is verified in Mailgun dashboard',
      step2: 'Check DNS records are configured correctly',
      step3: 'Ensure API key is correct (not sandbox key)',
      step4: 'If using sandbox, add authorized recipients',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma?.adminUser.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { email: true } } },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!MAILGUN_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'MAILGUN_API_KEY not configured',
        fix: 'Add MAILGUN_API_KEY to Vercel environment variables',
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const testEmail = body.email || adminUser.user.email;

    // Build form data
    const formData = new FormData();
    formData.append('from', EMAIL_FROM);
    formData.append('to', testEmail);
    formData.append('subject', 'Fly2Any - Mailgun Diagnostic Test');
    formData.append('html', `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Mailgun Test Successful!</h1>
        <p>If you're reading this, your Mailgun configuration is working.</p>
        <p><strong>Domain:</strong> ${MAILGUN_DOMAIN}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      </div>
    `);
    formData.append('o:tracking', 'yes');

    // Make API call
    const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;

    console.log('[MAILGUN_DIAG] Sending to:', testEmail);
    console.log('[MAILGUN_DIAG] Domain:', MAILGUN_DOMAIN);
    console.log('[MAILGUN_DIAG] URL:', mailgunUrl);

    const response = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
      },
      body: formData,
    });

    const responseText = await response.text();
    let responseJson;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { raw: responseText };
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: responseJson,
        config: {
          domain: MAILGUN_DOMAIN,
          fromEmail: EMAIL_FROM,
          toEmail: testEmail,
        },
        possibleFixes: response.status === 401 ? [
          'API key is invalid or expired',
          'Check Mailgun dashboard for correct API key',
        ] : response.status === 404 ? [
          `Domain '${MAILGUN_DOMAIN}' not found in Mailgun`,
          'Verify domain is created and verified in Mailgun',
          'Check if you need to use a different domain',
        ] : [
          'Check Mailgun logs for more details',
          'Verify DNS records are configured',
        ],
      }, { status: 200 }); // Return 200 so we can see the details
    }

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${testEmail}`,
      messageId: responseJson.id,
      response: responseJson,
    });
  } catch (error: any) {
    console.error('[MAILGUN_DIAG_ERROR]', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
