/**
 * Customer-Facing Error Alert System
 *
 * Automatically sends admin alerts for ANY error that customers encounter
 * Integrates with:
 * - Telegram (instant mobile notifications)
 * - Email (Mailgun)
 * - Sentry (error tracking with context)
 */

import { notifyTelegramAdmins, sendAdminAlert } from '@/lib/notifications/notification-service';
import * as Sentry from '@sentry/nextjs';

export interface CustomerErrorContext {
  // Error details
  errorMessage: string;
  errorCode?: string;
  errorStack?: string;

  // User context
  userId?: string;
  userEmail?: string;
  userAgent?: string;
  ipAddress?: string;

  // Request context
  url?: string;
  method?: string;
  endpoint?: string;
  requestBody?: any;

  // Business context
  bookingReference?: string;
  paymentIntentId?: string;
  amount?: number;
  currency?: string;

  // Additional metadata
  [key: string]: any;
}

export interface ErrorAlertOptions {
  priority?: 'low' | 'normal' | 'high' | 'critical';
  sendTelegram?: boolean;
  sendEmail?: boolean;
  sendSentry?: boolean;
  includeStackTrace?: boolean;
}

/**
 * Send comprehensive alert for customer-facing error
 *
 * @example
 * ```typescript
 * try {
 *   const booking = await createBooking(data);
 * } catch (error) {
 *   await alertCustomerError({
 *     errorMessage: 'Booking creation failed',
 *     errorCode: 'BOOKING_FAILED',
 *     errorStack: error.stack,
 *     userEmail: data.email,
 *     endpoint: '/api/flights/booking/create',
 *     bookingReference: preGeneratedRef,
 *   }, {
 *     priority: 'critical',
 *   });
 * }
 * ```
 */
export async function alertCustomerError(
  context: CustomerErrorContext,
  options: ErrorAlertOptions = {}
): Promise<{
  telegramSent: boolean;
  emailSent: boolean;
  sentrySent: boolean;
}> {
  const {
    priority = 'high',
    sendTelegram = true,
    sendEmail = true,
    sendSentry = true,
    includeStackTrace = false,
  } = options;

  const results = {
    telegramSent: false,
    emailSent: false,
    sentrySent: false,
  };

  // Log to console for immediate visibility
  console.error('🚨 CUSTOMER ERROR ALERT:', {
    error: context.errorMessage,
    code: context.errorCode,
    user: context.userEmail || context.userId,
    endpoint: context.endpoint || context.url,
    priority,
  });

  // 1. TELEGRAM NOTIFICATION (Instant mobile alert)
  if (sendTelegram) {
    try {
      const telegramMessage = formatTelegramErrorAlert(context, priority);
      const result = await notifyTelegramAdmins(telegramMessage);
      results.telegramSent = result.sent > 0;

      if (results.telegramSent) {
        console.log(`✅ Telegram alert sent (${result.sent} admin${result.sent > 1 ? 's' : ''})`);
      } else {
        console.warn('⚠️ Telegram alert failed:', result.errors);
      }
    } catch (error: any) {
      console.error('❌ Telegram alert error:', error.message);
    }
  }

  // 2. EMAIL NOTIFICATION (Detailed report to admin inbox)
  if (sendEmail) {
    try {
      const emailSent = await sendAdminAlert({
        type: 'customer_error',
        priority,
        timestamp: new Date().toISOString(),

        // Error details
        errorMessage: context.errorMessage,
        errorCode: context.errorCode,
        ...(includeStackTrace && context.errorStack && { errorStack: context.errorStack }),

        // User context
        ...(context.userId && { userId: context.userId }),
        ...(context.userEmail && { userEmail: context.userEmail }),
        ...(context.userAgent && { userAgent: context.userAgent }),
        ...(context.ipAddress && { ipAddress: context.ipAddress }),

        // Request context
        ...(context.url && { url: context.url }),
        ...(context.method && { method: context.method }),
        ...(context.endpoint && { endpoint: context.endpoint }),

        // Business context
        ...(context.bookingReference && { bookingReference: context.bookingReference }),
        ...(context.paymentIntentId && { paymentIntentId: context.paymentIntentId }),
        ...(context.amount && { amount: context.amount }),
        ...(context.currency && { currency: context.currency }),

        // Additional metadata
        ...Object.fromEntries(
          Object.entries(context).filter(([key]) =>
            !['errorMessage', 'errorCode', 'errorStack', 'userId', 'userEmail',
              'userAgent', 'ipAddress', 'url', 'method', 'endpoint', 'bookingReference',
              'paymentIntentId', 'amount', 'currency'].includes(key)
          )
        ),
      });

      results.emailSent = emailSent;
      if (emailSent) {
        console.log('✅ Email alert sent to admin');
      }
    } catch (error: any) {
      console.error('❌ Email alert error:', error.message);
    }
  }

  // 3. SENTRY ERROR TRACKING (Full stack trace with context)
  if (sendSentry) {
    try {
      Sentry.captureException(new Error(context.errorMessage), {
        level: priority === 'critical' || priority === 'high' ? 'error' : 'warning',
        tags: {
          error_source: 'customer_facing',
          error_code: context.errorCode || 'UNKNOWN',
          priority,
        },
        contexts: {
          user: {
            id: context.userId,
            email: context.userEmail,
            ip_address: context.ipAddress,
          },
          request: {
            url: context.url,
            method: context.method,
            endpoint: context.endpoint,
          },
          business: {
            booking_reference: context.bookingReference,
            payment_intent: context.paymentIntentId,
            amount: context.amount,
            currency: context.currency,
          },
        },
        extra: {
          ...context,
          alert_priority: priority,
          alert_timestamp: new Date().toISOString(),
        },
      });

      results.sentrySent = true;
      console.log('✅ Error sent to Sentry');
    } catch (error: any) {
      console.error('❌ Sentry error:', error.message);
    }
  }

  return results;
}

/**
 * Format error for Telegram notification
 */
function formatTelegramErrorAlert(
  context: CustomerErrorContext,
  priority: string
): string {
  const priorityEmojis = {
    low: '🟢',
    normal: '🟡',
    high: '🟠',
    critical: '🔴',
  };

  const emoji = priorityEmojis[priority as keyof typeof priorityEmojis] || '⚠️';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com';

  // Build metadata from custom fields (offerId, passengerCount, errorDetail, duffelErrorsRaw, etc)
  const customFields = Object.entries(context)
    .filter(([key]) => !['errorMessage', 'errorCode', 'userEmail', 'endpoint', 'bookingReference', 'amount', 'currency', 'userId', 'userAgent', 'ipAddress', 'url', 'method', 'errorStack', 'category', 'severity'].includes(key))
    .map(([key, value]) => {
      if (typeof value === 'string' && value.length > 150) {
        return `${key}: ${value.substring(0, 150)}...`;
      }
      return `${key}: ${typeof value === 'object' ? JSON.stringify(value).substring(0, 150) : value}`;
    });

  return `
${emoji} <b>CUSTOMER ERROR - ${priority.toUpperCase()}</b>

❌ <b>Error:</b> ${context.errorMessage}
${context.errorCode ? `📋 <b>Code:</b> <code>${context.errorCode}</code>` : ''}

${context.userEmail ? `📧 <b>User:</b> ${context.userEmail}` : ''}
${context.endpoint ? `🔗 <b>Endpoint:</b> <code>${context.endpoint}</code>` : ''}
${context.bookingReference ? `📋 <b>Booking:</b> <code>${context.bookingReference}</code>` : ''}
${context.amount ? `💰 <b>Amount:</b> ${context.currency || 'USD'} ${context.amount}` : ''}

${customFields.length > 0 ? `\n📊 <b>Details:</b>\n${customFields.map(f => `  • ${f}`).join('\n')}` : ''}

${context.bookingReference ? `🔗 <a href="${baseUrl}/admin/bookings?search=${context.bookingReference}">View Booking</a>` : ''}

⏰ ${new Date().toLocaleString()}
  `.trim();
}

/**
 * Express/Next.js middleware for automatic error alerting
 *
 * @example
 * ```typescript
 * // In API route
 * export async function POST(request: NextRequest) {
 *   try {
 *     // ... your code
 *   } catch (error: any) {
 *     await alertApiError(request, error, {
 *       bookingReference: someRef,
 *       amount: totalAmount,
 *     });
 *     return NextResponse.json({ error: 'Failed' }, { status: 500 });
 *   }
 * }
 * ```
 */
export async function alertApiError(
  request: Request,
  error: Error,
  additionalContext: Partial<CustomerErrorContext> = {},
  options?: ErrorAlertOptions
): Promise<void> {
  const url = new URL(request.url);

  await alertCustomerError({
    errorMessage: error.message,
    errorStack: error.stack,
    url: url.pathname + url.search,
    method: request.method,
    endpoint: url.pathname,
    userAgent: request.headers.get('user-agent') || undefined,
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    ...additionalContext,
  }, options);
}

/**
 * Quick helper for booking errors
 */
export async function alertBookingError(
  bookingReference: string,
  errorMessage: string,
  context: Partial<CustomerErrorContext> = {}
): Promise<void> {
  await alertCustomerError({
    errorMessage,
    errorCode: 'BOOKING_ERROR',
    bookingReference,
    ...context,
  }, {
    priority: 'critical',
  });
}

/**
 * Quick helper for payment errors
 */
export async function alertPaymentError(
  paymentIntentId: string,
  amount: number,
  currency: string,
  errorMessage: string,
  context: Partial<CustomerErrorContext> = {}
): Promise<void> {
  await alertCustomerError({
    errorMessage,
    errorCode: 'PAYMENT_ERROR',
    paymentIntentId,
    amount,
    currency,
    ...context,
  }, {
    priority: 'critical',
  });
}

/**
 * Monitor and export functions
 */
export const customerErrorAlerts = {
  alert: alertCustomerError,
  alertApiError,
  alertBookingError,
  alertPaymentError,
};
