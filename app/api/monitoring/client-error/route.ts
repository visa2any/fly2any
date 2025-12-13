import { NextRequest, NextResponse } from 'next/server';
import { alertCustomerError } from '@/lib/monitoring/customer-error-alerts';
import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

/**
 * CLIENT ERROR MONITORING API
 *
 * Receives React errors from ErrorBoundary and sends alerts
 * This is specifically for errors caught by React Error Boundaries
 *
 * @endpoint POST /api/monitoring/client-error
 */

interface ClientErrorRequest {
  errorMessage: string;
  errorStack?: string;
  componentStack?: string;
  userAgent?: string;
  url?: string;
  userEmail?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ClientErrorRequest = await request.json();

    console.error('❌ [Client Error Boundary] Error received:', {
      message: body.errorMessage,
      url: body.url,
      userEmail: body.userEmail,
    });

    // Send customer error alert (CRITICAL for React errors)
    await alertCustomerError({
      errorMessage: body.errorMessage,
      errorCode: 'REACT_ERROR_BOUNDARY',
      errorStack: body.errorStack,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.CRITICAL,
      url: body.url,
      userAgent: body.userAgent,
      userEmail: body.userEmail,
      endpoint: 'CLIENT_REACT_ERROR',
    }, {
      priority: ErrorSeverity.CRITICAL,
      sendTelegram: true, // Always send Telegram for React errors
      sendEmail: true,
      sendSentry: true,
    }).catch(err => {
      console.error('Failed to send client error alert:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Client error logged and alerts sent',
    });
  } catch (error: any) {
    console.error('❌ [Client Error API] Failed to process error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to process client error',
    }, { status: 500 });
  }
}

// Prevent caching
export const dynamic = 'force-dynamic';
