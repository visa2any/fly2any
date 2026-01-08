import { NextRequest, NextResponse } from 'next/server';
import { alertCustomerError } from '@/lib/monitoring/customer-error-alerts';
import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const runtime = 'nodejs';

/**
 * Client Error Logging Endpoint
 * Receives error reports from the browser via sendBeacon
 * CRITICAL: Now sends Telegram + Email alerts for all client errors
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const errorData = JSON.parse(body);

    // Log to console
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

    // Map string severity to enum
    const severityMap: Record<string, ErrorSeverity> = {
      'CRITICAL': ErrorSeverity.CRITICAL,
      'HIGH': ErrorSeverity.HIGH,
      'NORMAL': ErrorSeverity.NORMAL,
      'LOW': ErrorSeverity.LOW,
    };

    const severityEnum = severityMap[errorData.severity?.toUpperCase()] || ErrorSeverity.HIGH;

    // Send comprehensive alert via Telegram + Email
    await alertCustomerError({
      errorMessage: errorData.message || 'Unknown client error',
      errorCode: `CLIENT_${errorData.category || 'ERROR'}`,
      errorStack: errorData.stack,
      url: errorData.url,
      userAgent: errorData.userAgent,
      endpoint: errorData.url?.split('?')[0],
      category: errorData.category || ErrorCategory.UNKNOWN,
      severity: severityEnum,
      // Additional context from error data
      ...(errorData.additionalData && { ...errorData.additionalData }),
    }, {
      priority: severityEnum,
      sendTelegram: true, // Always send Telegram for visibility
      sendEmail: true,
      sendSentry: true,
      includeStackTrace: true,
    }).catch(alertErr => {
      console.error('[CLIENT ERROR] Failed to send alert:', alertErr);
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[CLIENT ERROR ENDPOINT] Failed:', error);
    return new NextResponse(null, { status: 204 });
  }
}
