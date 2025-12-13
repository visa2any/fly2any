import { NextRequest, NextResponse } from 'next/server';
import { alertCustomerError } from '@/lib/monitoring/customer-error-alerts';
import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

/**
 * Error Log API Endpoint - CLIENT-SIDE ERRORS
 *
 * Receives error logs from the client and processes them.
 * Integrated with customer error alerts system:
 * - Sends Telegram alerts for critical errors
 * - Sends email alerts with full context
 * - Logs to Sentry for tracking
 * - Stores error metadata
 */

interface ErrorLogRequest {
  errorId: string;
  message: string;
  stack?: string;
  severity: 'fatal' | 'error' | 'warning' | 'info';
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ErrorLogRequest = await request.json();

    // Validate required fields
    if (!body.errorId || !body.message || !body.severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log to server console (for development/debugging)
    console.error('[Client Error]', {
      errorId: body.errorId,
      severity: body.severity,
      message: body.message,
      metadata: body.metadata,
    });

    // Map client severity to our system severity
    const severityMap: Record<string, ErrorSeverity> = {
      'fatal': ErrorSeverity.CRITICAL,
      'error': ErrorSeverity.HIGH,
      'warning': ErrorSeverity.NORMAL,
      'info': ErrorSeverity.LOW,
    };

    const severity = severityMap[body.severity] || ErrorSeverity.HIGH;

    // Determine if we should send alerts
    // Send alerts for fatal and error severities only
    const shouldAlert = body.severity === 'fatal' || body.severity === 'error';

    if (shouldAlert) {
      // Send customer error alert
      await alertCustomerError({
        errorMessage: body.message,
        errorCode: body.errorId,
        errorStack: body.stack,
        category: ErrorCategory.UNKNOWN, // Client errors are categorized as unknown
        severity,
        url: body.metadata?.url as string,
        userAgent: body.metadata?.userAgent as string,
        userEmail: body.metadata?.userEmail as string,
        endpoint: 'CLIENT_ERROR',
      }, {
        priority: severity,
        sendTelegram: body.severity === 'fatal', // Only send Telegram for fatal errors
        sendEmail: true,
        sendSentry: true,
      }).catch(err => {
        console.error('Failed to send client error alert:', err);
      });
    }

    return NextResponse.json(
      {
        success: true,
        errorId: body.errorId,
        message: 'Error logged successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Error API] Failed to process error log:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process error log',
      },
      { status: 500 }
    );
  }
}

// Prevent caching of error logs
export const dynamic = 'force-dynamic';
