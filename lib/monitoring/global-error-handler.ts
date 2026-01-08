/**
 * GLOBAL ERROR HANDLER - Production-Grade
 *
 * Catches ALL errors across the application and sends alerts
 * - API errors
 * - Database errors
 * - External API failures
 * - Payment errors
 * - Validation errors
 * - Network errors
 * - Unhandled exceptions
 *
 * @version 2.0.0 - Ultra-robust with full coverage
 */

import { NextRequest, NextResponse } from 'next/server';
import { alertCustomerError, type CustomerErrorContext } from './customer-error-alerts';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for better tracking
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  PAYMENT = 'payment',
  BOOKING = 'booking',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  NETWORK = 'network',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown',
}

/**
 * Structured error for better handling
 */
export interface AppError extends Error {
  code?: string;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  userMessage?: string;
  details?: any;
  statusCode?: number;
}

/**
 * Create a structured application error
 */
export function createAppError(
  message: string,
  options: {
    code?: string;
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    userMessage?: string;
    details?: any;
    statusCode?: number;
  } = {}
): AppError {
  const error = new Error(message) as AppError;
  error.code = options.code || 'UNKNOWN_ERROR';
  error.severity = options.severity || ErrorSeverity.HIGH;
  error.category = options.category || ErrorCategory.UNKNOWN;
  error.userMessage = options.userMessage || 'An unexpected error occurred';
  error.details = options.details;
  error.statusCode = options.statusCode || 500;
  return error;
}

/**
 * Determine error severity automatically based on error type
 */
function determineErrorSeverity(error: any): ErrorSeverity {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  // Critical errors
  if (
    errorMessage.includes('payment') ||
    errorMessage.includes('charge') ||
    errorMessage.includes('booking') ||
    errorMessage.includes('order') ||
    errorCode.includes('payment') ||
    errorCode.includes('booking')
  ) {
    return ErrorSeverity.CRITICAL;
  }

  // High priority errors
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('sold out') ||
    errorMessage.includes('price changed') ||
    errorCode.includes('db') ||
    errorCode.includes('connection')
  ) {
    return ErrorSeverity.HIGH;
  }

  // Normal priority errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorCode.includes('validation')
  ) {
    return ErrorSeverity.NORMAL;
  }

  // Default to high for unknown errors
  return ErrorSeverity.HIGH;
}

/**
 * Determine error category automatically
 */
function determineErrorCategory(error: any): ErrorCategory {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  if (errorMessage.includes('validation') || errorCode.includes('validation')) {
    return ErrorCategory.VALIDATION;
  }
  if (errorMessage.includes('payment') || errorCode.includes('payment')) {
    return ErrorCategory.PAYMENT;
  }
  if (errorMessage.includes('booking') || errorMessage.includes('order')) {
    return ErrorCategory.BOOKING;
  }
  if (errorMessage.includes('database') || errorMessage.includes('prisma')) {
    return ErrorCategory.DATABASE;
  }
  if (errorMessage.includes('api') || errorMessage.includes('fetch')) {
    return ErrorCategory.EXTERNAL_API;
  }
  if (errorMessage.includes('auth') || errorCode.includes('auth')) {
    return ErrorCategory.AUTHENTICATION;
  }
  if (errorMessage.includes('config') || errorCode.includes('config')) {
    return ErrorCategory.CONFIGURATION;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Extract user-friendly error message
 */
function getUserFriendlyMessage(error: any): string {
  // Check if error already has a user message
  if ((error as AppError).userMessage) {
    return (error as AppError).userMessage!;
  }

  const category = determineErrorCategory(error);

  switch (category) {
    case ErrorCategory.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorCategory.PAYMENT:
      return 'Payment processing failed. Please check your payment details.';
    case ErrorCategory.BOOKING:
      return 'Booking failed. Please try again or contact support.';
    case ErrorCategory.DATABASE:
      return 'Service temporarily unavailable. Please try again shortly.';
    case ErrorCategory.EXTERNAL_API:
      return 'Unable to connect to booking service. Please try again.';
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication failed. Please log in again.';
    case ErrorCategory.CONFIGURATION:
      return 'Service configuration error. Please contact support.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Global error handler for API routes
 *
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   return handleApiError(request, async () => {
 *     // Your API logic here
 *     const data = await someOperation();
 *     return NextResponse.json({ success: true, data });
 *   });
 * }
 * ```
 */
export async function handleApiError(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  context?: Partial<CustomerErrorContext>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error: any) {
    console.error('❌ [API Error]', error);

    // Determine error details - context values take priority
    const appError = error as AppError;
    const severity = context?.severity || appError.severity || determineErrorSeverity(error);
    const category = context?.category || appError.category || determineErrorCategory(error);
    const statusCode = appError.statusCode || (category === ErrorCategory.VALIDATION ? 400 : 500);
    const errorCode = appError.code || `${category.toUpperCase()}_ERROR`;
    const userMessage = getUserFriendlyMessage(error);

    // Extract request context
    const url = new URL(request.url);

    // Build error context
    const errorContext: CustomerErrorContext = {
      errorMessage: error.message || 'Unknown error',
      errorCode,
      errorStack: error.stack,
      url: url.pathname + url.search,
      method: request.method,
      endpoint: url.pathname,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      category,
      severity,
      ...context,
    };

    // Send alerts (non-blocking)
    alertCustomerError(errorContext, {
      priority: severity,
      sendTelegram: severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH,
      sendEmail: true,
      sendSentry: true,
    }).catch(alertErr => {
      console.error('Failed to send error alert:', alertErr);
    });

    // Return user-friendly error response with debug info
    console.error('🔥 FULL ERROR DETAILS:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack?.substring(0, 500),
    });

    return NextResponse.json(
      {
        success: false,
        error: errorCode,
        message: userMessage,
        // ALWAYS include debug info to diagnose production issues
        debugMessage: error.message || 'No error message',
        debugCode: error.code || error.name || 'Unknown',
        category,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}

/**
 * Wrap async operations with error handling
 *
 * Usage:
 * ```typescript
 * const result = await safeExecute(
 *   async () => await duffelAPI.createOrder(data),
 *   {
 *     operationName: 'Create Duffel Order',
 *     category: ErrorCategory.BOOKING,
 *     severity: ErrorSeverity.CRITICAL,
 *     context: { userId, bookingRef },
 *   }
 * );
 * ```
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  options: {
    operationName: string;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    context?: Partial<CustomerErrorContext>;
    onError?: (error: Error) => void;
    sendAlert?: boolean;
  }
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`❌ [${options.operationName}] Error:`, error);

    const severity = options.severity || determineErrorSeverity(error);
    const category = options.category || determineErrorCategory(error);

    // Send alert if enabled (default: true for high/critical)
    const shouldAlert = options.sendAlert !== false &&
      (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH);

    if (shouldAlert) {
      await alertCustomerError({
        errorMessage: `${options.operationName} failed: ${error.message}`,
        errorCode: error.code || `${category.toUpperCase()}_ERROR`,
        errorStack: error.stack,
        category,
        severity,
        ...options.context,
      }, {
        priority: severity,
        sendTelegram: severity === ErrorSeverity.CRITICAL,
        sendEmail: true,
        sendSentry: true,
      }).catch(alertErr => {
        console.error('Failed to send error alert:', alertErr);
      });
    }

    // Call custom error handler if provided
    if (options.onError) {
      options.onError(error);
    }

    // Re-throw the error
    throw error;
  }
}

/**
 * Database operation wrapper with automatic error handling
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Partial<CustomerErrorContext>
): Promise<T> {
  return safeExecute(operation, {
    operationName: `Database: ${operationName}`,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    context,
  });
}

/**
 * External API call wrapper with automatic error handling
 */
export async function safeApiCall<T>(
  operation: () => Promise<T>,
  apiName: string,
  context?: Partial<CustomerErrorContext>
): Promise<T> {
  return safeExecute(operation, {
    operationName: `External API: ${apiName}`,
    category: ErrorCategory.EXTERNAL_API,
    severity: ErrorSeverity.HIGH,
    context,
  });
}

/**
 * Payment operation wrapper with automatic error handling
 */
export async function safePaymentOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Partial<CustomerErrorContext>
): Promise<T> {
  return safeExecute(operation, {
    operationName: `Payment: ${operationName}`,
    category: ErrorCategory.PAYMENT,
    severity: ErrorSeverity.CRITICAL,
    context,
  });
}

/**
 * Booking operation wrapper with automatic error handling
 */
export async function safeBookingOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Partial<CustomerErrorContext>
): Promise<T> {
  return safeExecute(operation, {
    operationName: `Booking: ${operationName}`,
    category: ErrorCategory.BOOKING,
    severity: ErrorSeverity.CRITICAL,
    context,
  });
}

/**
 * Extract ALL customer context from browser
 */
function extractCustomerContext() {
  const ctx: any = {};

  try {
    // 1. URL params (bookingId, flightId, etc)
    const params = new URLSearchParams(window.location.search);
    const urlData: any = {};
    params.forEach((v, k) => urlData[k] = v);
    if (Object.keys(urlData).length) ctx.urlParams = urlData;

    // 2. SessionStorage - Booking/Flight data
    const bookingKeys = ['flight_', 'flight_search_', 'booking_', 'passenger_'];
    bookingKeys.forEach(prefix => {
      Object.keys(sessionStorage).filter(k => k.startsWith(prefix)).forEach(key => {
        try {
          const data = JSON.parse(sessionStorage.getItem(key) || '{}');
          // Extract customer info
          if (data.contactInfo) ctx.contactInfo = data.contactInfo;
          if (data.passengers) ctx.passengers = data.passengers.map((p: any) => ({
            name: `${p.firstName} ${p.lastName}`,
            email: p.email,
            phone: p.phone,
          }));
          if (data.search) ctx.search = data.search;
        } catch {}
      });
    });

    // 3. LocalStorage - User preferences
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        ctx.user = { email: userData.email, name: userData.name, id: userData.id };
      }
    } catch {}

    // 4. Page context
    ctx.page = {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    };

    // 5. Screen/Device info
    ctx.device = {
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      touch: 'ontouchstart' in window,
    };
  } catch (e) {
    console.warn('Failed to extract customer context:', e);
  }

  return ctx;
}

/**
 * Report client-side errors to the backend for logging/monitoring
 * Use this for fetch errors, network errors, etc.
 */
export async function reportClientError(
  error: Error | string,
  context: {
    component?: string;
    action?: string;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    url?: string;
    userAgent?: string;
    additionalData?: Record<string, any>;
  } = {}
): Promise<void> {
  try {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    // Determine severity
    let severity = context.severity || ErrorSeverity.HIGH;
    if (errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('fetch') ||
        errorMessage.toLowerCase().includes('timeout')) {
      severity = ErrorSeverity.HIGH;
    }

    // CRITICAL: Extract customer context from browser
    const customerContext = typeof window !== 'undefined' ? extractCustomerContext() : {};

    const payload = {
      message: errorMessage,
      stack: errorStack,
      component: context.component || 'Unknown',
      action: context.action || 'Unknown',
      category: context.category || ErrorCategory.NETWORK,
      severity,
      url: context.url || (typeof window !== 'undefined' ? window.location.href : ''),
      userAgent: context.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      timestamp: new Date().toISOString(),
      additionalData: context.additionalData,
      customerContext, // NEW: All customer data
    };

    // Log to console in development
    console.error('[GlobalErrorHandler] Client Error:', payload);

    // Send to backend error logging endpoint
    if (typeof window !== 'undefined') {
      // Use sendBeacon for reliability (won't be cancelled on page unload)
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/monitoring/client-error', blob);
    }
  } catch (reportError) {
    // Silently fail - don't cause additional errors
    console.error('[GlobalErrorHandler] Failed to report error:', reportError);
  }
}

export const globalErrorHandler = {
  handleApiError,
  safeExecute,
  safeDbOperation,
  safeApiCall,
  safePaymentOperation,
  safeBookingOperation,
  createAppError,
  reportClientError,
  ErrorSeverity,
  ErrorCategory,
};
