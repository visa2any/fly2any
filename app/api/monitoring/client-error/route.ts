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

    // Suppress known third-party script errors (not actionable)
    const IGNORED_PATTERNS = [
      'tawk.to',     // Tawk.to chat widget internal errors
      'embed.tawk',  // Tawk.to embed script
      'twk-chunk',   // Tawk.to chunk loader
      'gtag',        // Google Analytics
      'fbq',         // Facebook Pixel
    ];
    
    const errorSource = `${errorData.message || ''} ${errorData.stack || ''}`.toLowerCase();
    const isThirdParty = IGNORED_PATTERNS.some(pattern => errorSource.includes(pattern));
    
    if (isThirdParty) {
      // Brief log only, no alerts/DB/Sentry
      if (process.env.NODE_ENV === 'development') {
        console.log(`[CLIENT] Ignored third-party error: ${errorData.message?.substring(0, 80)}`);
      }
      return new NextResponse(null, { status: 204 });
    }

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

    // Extract customer info from context
    const customer = errorData.customerContext || {};
    const contact = customer.contactInfo || {};
    const user = customer.user || {};
    const passengers = customer.passengers || [];

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
      // CRITICAL: Customer contact details
      customerEmail: contact.email || user.email || passengers[0]?.email,
      customerPhone: contact.phone || passengers[0]?.phone,
      customerName: contact.name || user.name || passengers[0]?.name,
      // Additional context
      ...(errorData.additionalData && { ...errorData.additionalData }),
      ...(customer.page && { pageContext: customer.page }),
      ...(customer.device && { deviceInfo: customer.device }),
      ...(customer.search && { flightSearch: customer.search }),
    }, {
      priority: severityEnum,
      sendTelegram: true, // Always send Telegram for visibility
      sendEmail: true,
      sendSentry: true,
      includeStackTrace: true,
    }).catch(alertErr => {
      console.error('[CLIENT ERROR] Failed to send alert:', alertErr);
    });

    // Save to database for admin dashboard
    try {
      const { getPrismaClient } = await import('@/lib/prisma');
      const prisma = getPrismaClient();

      await prisma.errorLog.create({
        data: {
          message: errorData.message || 'Unknown error',
          stack: errorData.stack,
          errorType: errorData.category || 'UNKNOWN',
          url: errorData.url || 'unknown',
          userId: customer.user?.id,
          sessionId: errorData.additionalData?.sessionId || `anon-${Date.now()}`,
          userAgent: errorData.userAgent?.substring(0, 500),
          severity: errorData.severity?.toUpperCase() || 'HIGH',
          fingerprint: `${errorData.category}-${errorData.message?.substring(0, 50)}`.replace(/\s+/g, '-'),
        },
      });
    } catch (dbError: any) {
      console.error('[CLIENT ERROR] Failed to save to DB:', dbError.message);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[CLIENT ERROR ENDPOINT] Failed:', error);
    return new NextResponse(null, { status: 204 });
  }
}
