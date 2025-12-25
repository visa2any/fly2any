import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Client Error Logging Endpoint
 * Receives error reports from the browser via sendBeacon
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const errorData = JSON.parse(body);

    // Log to console (in production, send to monitoring service)
    console.error('[CLIENT ERROR]', {
      timestamp: errorData.timestamp || new Date().toISOString(),
      message: errorData.message,
      component: errorData.component,
      action: errorData.action,
      category: errorData.category,
      severity: errorData.severity,
      url: errorData.url,
      userAgent: errorData.userAgent?.substring(0, 100),
      stack: errorData.stack?.substring(0, 500),
      additionalData: errorData.additionalData,
    });

    // For critical errors, could send Telegram notification
    // if (errorData.severity === 'CRITICAL') {
    //   await sendTelegramAlert(errorData);
    // }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[CLIENT ERROR ENDPOINT] Failed:', error);
    return new NextResponse(null, { status: 204 });
  }
}
