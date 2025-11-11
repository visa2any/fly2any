/**
 * Sentry Monitoring Integration
 *
 * Centralized Sentry configuration and utilities for production monitoring.
 * Provides enhanced error tracking, performance monitoring, and alerting.
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry with production-ready configuration
 * Call this in your application entry point
 */
export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

  if (!dsn) {
    console.warn('[Sentry] No DSN configured. Monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% of transactions in production

    // Session replay for debugging
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Integrations removed - Next.js Sentry integration handles this automatically

    // Filter sensitive data before sending
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
        }
      }

      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            const sanitized = { ...breadcrumb.data };
            delete sanitized.password;
            delete sanitized.token;
            delete sanitized.apiKey;
            delete sanitized.cardNumber;
            delete sanitized.cvv;
            breadcrumb.data = sanitized;
          }
          return breadcrumb;
        });
      }

      return event;
    },

    // Ignore common non-critical errors
    ignoreErrors: [
      // Browser extensions
      /chrome-extension/,
      /moz-extension/,
      // Network errors (handled at application level)
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      // Abort errors (user-initiated)
      'AbortError',
      'The operation was aborted',
      // Next.js hydration warnings (development)
      'Hydration failed',
      'Text content does not match',
    ],
  });

  console.log(`[Sentry] Initialized for ${environment}`);
}

/**
 * Capture an exception with additional context
 */
export function captureException(
  error: Error,
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
) {
  console.error('[Sentry] Capturing exception:', error);

  if (context) {
    // Set user context
    if (context.userId) {
      Sentry.setUser({ id: context.userId });
    }

    // Set additional context
    if (context.component) {
      Sentry.setTag('component', context.component);
    }

    if (context.action) {
      Sentry.setTag('action', context.action);
    }

    if (context.metadata) {
      Sentry.setContext('metadata', context.metadata);
    }
  }

  return Sentry.captureException(error);
}

/**
 * Capture a message with severity level
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' | 'debug' = 'info',
  context?: Record<string, any>
) {
  console.log(`[Sentry] ${level.toUpperCase()}: ${message}`, context);

  if (context) {
    Sentry.setContext('message_context', context);
  }

  return Sentry.captureMessage(message, level);
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  operation: string,
  data?: Record<string, any>
) {
  const transaction = Sentry.startInactiveSpan({
    name,
    op: operation,
  });

  return transaction;
}

/**
 * Track API call performance
 */
export async function trackAPICall<T>(
  endpoint: string,
  method: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(
    `API ${method} ${endpoint}`,
    'http.client',
    { endpoint, method }
  );

  const startTime = Date.now();

  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;

    // Log slow API calls
    if (duration > 3000) {
      captureMessage(
        `Slow API call: ${method} ${endpoint}`,
        'warning',
        { duration, endpoint, method }
      );
    }

    return result;
  } catch (error) {
    captureException(error as Error, {
      component: 'API',
      action: `${method} ${endpoint}`,
      metadata: { endpoint, method },
    });
    throw error;
  } finally {
    transaction?.end();
  }
}

/**
 * Track external API provider performance
 */
export function trackExternalAPI(
  provider: 'amadeus' | 'duffel' | 'liteapi' | 'stripe',
  endpoint: string,
  duration: number,
  success: boolean,
  statusCode?: number
) {
  Sentry.addBreadcrumb({
    category: 'external-api',
    message: `${provider} API call`,
    level: success ? 'info' : 'error',
    data: {
      provider,
      endpoint,
      duration,
      success,
      statusCode,
    },
  });

  // Alert on slow external APIs
  if (duration > 5000) {
    captureMessage(
      `Slow external API: ${provider} ${endpoint}`,
      'warning',
      { provider, endpoint, duration, statusCode }
    );
  }

  // Alert on external API failures
  if (!success) {
    captureMessage(
      `External API failure: ${provider} ${endpoint}`,
      'error',
      { provider, endpoint, statusCode }
    );
  }
}

/**
 * Set user context for current session
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
}

/**
 * Track flight search performance
 */
export function trackFlightSearch(params: {
  origin: string;
  destination: string;
  duration: number;
  resultsCount: number;
  success: boolean;
}) {
  addBreadcrumb('Flight search', 'search', params);

  if (params.duration > 5000) {
    captureMessage(
      `Slow flight search: ${params.origin} to ${params.destination}`,
      'warning',
      params
    );
  }

  if (!params.success) {
    captureMessage(
      `Failed flight search: ${params.origin} to ${params.destination}`,
      'error',
      params
    );
  }
}

/**
 * Track booking flow
 */
export function trackBookingStep(
  step: 'search' | 'select' | 'passenger-info' | 'payment' | 'confirmation',
  data?: Record<string, any>
) {
  addBreadcrumb(`Booking: ${step}`, 'booking', data);
}

/**
 * Track payment processing
 */
export function trackPayment(data: {
  bookingId: string;
  amount: number;
  currency: string;
  success: boolean;
  errorCode?: string;
}) {
  addBreadcrumb('Payment processing', 'payment', {
    bookingId: data.bookingId,
    amount: data.amount,
    currency: data.currency,
    success: data.success,
    errorCode: data.errorCode,
  });

  if (!data.success) {
    captureMessage(
      `Payment failed: ${data.bookingId}`,
      'error',
      data
    );
  }
}

/**
 * Track critical errors that require immediate attention
 */
export function trackCriticalError(
  error: Error,
  context: {
    component: string;
    action: string;
    impact: 'high' | 'medium' | 'low';
    metadata?: Record<string, any>;
  }
) {
  Sentry.setTag('severity', 'critical');
  Sentry.setTag('impact', context.impact);

  captureException(error, context);

  // Optionally trigger additional alerts (PagerDuty, Slack, etc.)
  if (context.impact === 'high') {
    console.error('[CRITICAL ERROR]', {
      component: context.component,
      action: context.action,
      error: error.message,
    });
  }
}
