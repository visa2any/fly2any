/**
 * Enhanced Error Tracking
 *
 * Comprehensive error tracking and reporting with Sentry integration.
 * Includes context enrichment, API error tracking, and performance monitoring.
 */

import * as Sentry from '@sentry/nextjs';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface APIErrorContext extends ErrorContext {
  endpoint: string;
  method: string;
  statusCode?: number;
  requestParams?: Record<string, any>;
  responseTime?: number;
}

/**
 * Track general application error
 */
export function trackError(
  error: Error,
  context?: ErrorContext,
  level: 'error' | 'warning' | 'info' = 'error'
) {
  console.error('Error tracked:', error, context);

  // Add context to Sentry
  if (context) {
    Sentry.setContext('error_context', {
      component: context.component,
      action: context.action,
      ...context.metadata,
    });

    if (context.userId) {
      Sentry.setUser({ id: context.userId });
    }

    if (context.sessionId) {
      Sentry.setTag('session_id', context.sessionId);
    }
  }

  // Capture exception
  Sentry.captureException(error, { level });
}

/**
 * Track API error with detailed context
 */
export function trackAPIError(
  error: Error,
  context: APIErrorContext
) {
  console.error('API Error:', {
    endpoint: context.endpoint,
    method: context.method,
    statusCode: context.statusCode,
    error: error.message,
  });

  // Add breadcrumb for API call
  Sentry.addBreadcrumb({
    category: 'api',
    message: `${context.method} ${context.endpoint}`,
    level: 'error',
    data: {
      statusCode: context.statusCode,
      responseTime: context.responseTime,
      ...context.requestParams,
    },
  });

  // Set API context
  Sentry.setContext('api_error', {
    endpoint: context.endpoint,
    method: context.method,
    statusCode: context.statusCode,
    responseTime: context.responseTime,
  });

  // Add tags for filtering
  Sentry.setTag('api_endpoint', context.endpoint);
  Sentry.setTag('http_method', context.method);
  if (context.statusCode) {
    Sentry.setTag('http_status', context.statusCode.toString());
  }

  // Capture exception
  Sentry.captureException(error);
}

/**
 * Track flight search error
 */
export function trackFlightSearchError(
  error: Error,
  searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
  }
) {
  trackAPIError(error, {
    endpoint: '/api/flights/search',
    method: 'POST',
    component: 'FlightSearch',
    action: 'search',
    requestParams: searchParams,
  });

  // Additional context for flight searches
  Sentry.setTag('route', `${searchParams.origin}-${searchParams.destination}`);
}

/**
 * Track hotel search error
 */
export function trackHotelSearchError(
  error: Error,
  searchParams: {
    location: string;
    checkIn: string;
    checkOut: string;
  }
) {
  trackAPIError(error, {
    endpoint: '/api/hotels/search',
    method: 'POST',
    component: 'HotelSearch',
    action: 'search',
    requestParams: searchParams,
  });
}

/**
 * Track booking error
 */
export function trackBookingError(
  error: Error,
  bookingData: {
    offerId: string;
    amount?: number;
    currency?: string;
  }
) {
  trackAPIError(error, {
    endpoint: '/api/bookings',
    method: 'POST',
    component: 'Booking',
    action: 'create_booking',
    requestParams: bookingData,
  });

  // Don't log sensitive passenger data
  Sentry.setTag('offer_id', bookingData.offerId);
}

/**
 * Track payment error
 */
export function trackPaymentError(
  error: Error,
  paymentData: {
    bookingId: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
  }
) {
  trackAPIError(error, {
    endpoint: '/api/payments/create-intent',
    method: 'POST',
    component: 'Payment',
    action: 'process_payment',
    requestParams: {
      bookingId: paymentData.bookingId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethod,
    },
  });
}

/**
 * Track rate limit exceeded
 */
export function trackRateLimitExceeded(
  endpoint: string,
  identifier: string,
  limit: number
) {
  Sentry.addBreadcrumb({
    category: 'rate_limit',
    message: `Rate limit exceeded for ${endpoint}`,
    level: 'warning',
    data: {
      endpoint,
      identifier,
      limit,
    },
  });

  Sentry.captureMessage(`Rate limit exceeded: ${endpoint}`, 'warning');
}

/**
 * Track external API failure
 */
export function trackExternalAPIFailure(
  provider: 'amadeus' | 'duffel' | 'liteapi' | 'stripe',
  error: Error,
  context?: {
    endpoint?: string;
    statusCode?: number;
    responseTime?: number;
  }
) {
  console.error(`External API failure (${provider}):`, error);

  Sentry.addBreadcrumb({
    category: 'external_api',
    message: `${provider} API failure`,
    level: 'error',
    data: {
      provider,
      endpoint: context?.endpoint,
      statusCode: context?.statusCode,
      responseTime: context?.responseTime,
    },
  });

  Sentry.setTag('external_api', provider);
  if (context?.statusCode) {
    Sentry.setTag('external_api_status', context.statusCode.toString());
  }

  Sentry.captureException(error);
}

/**
 * Track cache error (non-critical)
 */
export function trackCacheError(
  operation: 'get' | 'set' | 'delete',
  key: string,
  error: Error
) {
  console.warn(`Cache ${operation} error for key ${key}:`, error);

  Sentry.addBreadcrumb({
    category: 'cache',
    message: `Cache ${operation} failed`,
    level: 'warning',
    data: {
      operation,
      key,
      error: error.message,
    },
  });

  // Don't capture cache errors as exceptions (just breadcrumbs)
  // Cache failures should fail gracefully
}

/**
 * Track performance issue
 */
export function trackPerformanceIssue(
  operation: string,
  duration: number,
  threshold: number,
  context?: Record<string, any>
) {
  console.warn(`Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`);

  Sentry.addBreadcrumb({
    category: 'performance',
    message: `Slow operation: ${operation}`,
    level: 'warning',
    data: {
      operation,
      duration,
      threshold,
      ...context,
    },
  });

  if (duration > threshold * 2) {
    // Only capture as message if significantly over threshold
    Sentry.captureMessage(
      `Performance degradation: ${operation} (${duration}ms)`,
      'warning'
    );
  }
}

/**
 * Track user action (for breadcrumbs)
 */
export function trackUserAction(
  action: string,
  category: string = 'user_action',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    category,
    message: action,
    level: 'info',
    data,
  });
}

/**
 * Start performance transaction
 */
export function startTransaction(
  name: string,
  operation: string
): Sentry.Span | undefined {
  return Sentry.startInactiveSpan({
    name,
    op: operation,
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
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
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add custom tag to all subsequent errors
 */
export function setCustomTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Add custom context to all subsequent errors
 */
export function setCustomContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}
