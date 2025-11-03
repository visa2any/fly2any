/**
 * Error Logging Utility
 *
 * Centralized error logging system that:
 * - Logs errors to monitoring service (Sentry-ready)
 * - Generates unique error IDs for tracking
 * - Captures context and metadata
 * - Supports different error severity levels
 * - Filters sensitive information
 */

/**
 * Error severity levels
 */
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

/**
 * Error metadata interface
 */
export interface ErrorMetadata {
  componentStack?: string;
  context?: string;
  userId?: string;
  userEmail?: string;
  url?: string;
  userAgent?: string;
  timestamp?: number;
  [key: string]: unknown;
}

/**
 * Error logging configuration
 */
interface ErrorLoggerConfig {
  enabled: boolean;
  sentryDsn?: string;
  environment: string;
  logToConsole: boolean;
  captureUnhandledRejections: boolean;
}

/**
 * Default configuration
 */
const defaultConfig: ErrorLoggerConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  logToConsole: process.env.NODE_ENV === 'development',
  captureUnhandledRejections: true,
};

/**
 * Current configuration
 */
let config: ErrorLoggerConfig = { ...defaultConfig };

/**
 * Initialize error logger
 *
 * @param customConfig - Custom configuration options
 *
 * @example
 * ```ts
 * initErrorLogger({
 *   enabled: true,
 *   sentryDsn: 'https://xxx@xxx.ingest.sentry.io/xxx',
 *   environment: 'production',
 * });
 * ```
 */
export function initErrorLogger(customConfig?: Partial<ErrorLoggerConfig>) {
  config = { ...config, ...customConfig };

  // Initialize Sentry if DSN is provided
  if (config.enabled && config.sentryDsn && typeof window !== 'undefined') {
    try {
      // TODO: Initialize Sentry here when ready
      // import('@sentry/nextjs').then((Sentry) => {
      //   Sentry.init({
      //     dsn: config.sentryDsn,
      //     environment: config.environment,
      //     tracesSampleRate: 1.0,
      //   });
      // });
      console.log('[ErrorLogger] Sentry initialization ready (uncomment when DSN is configured)');
    } catch (error) {
      console.error('[ErrorLogger] Failed to initialize Sentry:', error);
    }
  }

  // Capture unhandled promise rejections
  if (config.captureUnhandledRejections && typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      logError(new Error(event.reason), {
        context: 'unhandled-promise-rejection',
      });
    });
  }
}

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `ERR-${timestamp}-${random}`.toUpperCase();
}

/**
 * Get browser metadata
 */
function getBrowserMetadata(): Partial<ErrorMetadata> {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };
}

/**
 * Filter sensitive information from error messages and metadata
 */
function filterSensitiveData(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'secret',
    'creditCard',
    'ssn',
    'cvv',
    'pin',
  ];

  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some((k) => lowerKey.includes(k));

    if (isSensitive) {
      filtered[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  }

  return filtered;
}

/**
 * Log error to monitoring service
 *
 * @param error - Error object to log
 * @param metadata - Additional metadata
 * @param severity - Error severity level
 * @returns Error ID for tracking
 *
 * @example
 * ```ts
 * try {
 *   // some code
 * } catch (error) {
 *   const errorId = logError(error, {
 *     context: 'flight-search',
 *     userId: user.id,
 *   });
 *   console.log('Error logged with ID:', errorId);
 * }
 * ```
 */
export function logError(
  error: Error | unknown,
  metadata?: ErrorMetadata,
  severity: ErrorSeverity = 'error'
): string {
  const errorId = generateErrorId();

  // Convert unknown errors to Error objects
  const errorObj =
    error instanceof Error
      ? error
      : new Error(typeof error === 'string' ? error : 'Unknown error');

  // Collect all metadata
  const fullMetadata: ErrorMetadata = {
    ...getBrowserMetadata(),
    ...metadata,
  };

  // Filter sensitive data
  const filteredMetadata = filterSensitiveData(fullMetadata) as ErrorMetadata;

  // Log to console in development
  if (config.logToConsole) {
    console.group(`[ErrorLogger] ${severity.toUpperCase()}: ${errorId}`);
    console.error('Error:', errorObj);
    console.log('Metadata:', filteredMetadata);
    console.groupEnd();
  }

  // Log to Sentry (when configured)
  if (config.enabled && config.sentryDsn) {
    try {
      // TODO: Send to Sentry when configured
      // import('@sentry/nextjs').then((Sentry) => {
      //   Sentry.withScope((scope) => {
      //     scope.setLevel(severity);
      //     scope.setTag('errorId', errorId);
      //     Object.entries(filteredMetadata).forEach(([key, value]) => {
      //       scope.setExtra(key, value);
      //     });
      //     Sentry.captureException(errorObj);
      //   });
      // });
    } catch (sentryError) {
      console.error('[ErrorLogger] Failed to send error to Sentry:', sentryError);
    }
  }

  // Log to custom analytics or logging service
  try {
    // TODO: Add custom logging service integration here
    // Example: Send to custom API endpoint
    if (typeof window !== 'undefined' && config.enabled) {
      fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId,
          message: errorObj.message,
          stack: errorObj.stack,
          severity,
          metadata: filteredMetadata,
        }),
      }).catch((fetchError) => {
        // Silently fail - don't want logging to break the app
        console.error('[ErrorLogger] Failed to send error to API:', fetchError);
      });
    }
  } catch (apiError) {
    console.error('[ErrorLogger] Failed to send error to API:', apiError);
  }

  return errorId;
}

/**
 * Log warning (non-critical error)
 */
export function logWarning(message: string, metadata?: ErrorMetadata): string {
  return logError(new Error(message), metadata, 'warning');
}

/**
 * Log info (informational message)
 */
export function logInfo(message: string, metadata?: ErrorMetadata): string {
  return logError(new Error(message), metadata, 'info');
}

/**
 * Log fatal error (critical error that requires immediate attention)
 */
export function logFatal(error: Error | unknown, metadata?: ErrorMetadata): string {
  return logError(error, metadata, 'fatal');
}

/**
 * Create error logger for specific context
 *
 * @example
 * ```ts
 * const logger = createContextLogger('flight-booking');
 * logger.error(new Error('Payment failed'));
 * ```
 */
export function createContextLogger(context: string) {
  return {
    error: (error: Error | unknown, metadata?: ErrorMetadata) =>
      logError(error, { ...metadata, context }, 'error'),
    warning: (message: string, metadata?: ErrorMetadata) =>
      logWarning(message, { ...metadata, context }),
    info: (message: string, metadata?: ErrorMetadata) =>
      logInfo(message, { ...metadata, context }),
    fatal: (error: Error | unknown, metadata?: ErrorMetadata) =>
      logFatal(error, { ...metadata, context }),
  };
}

/**
 * Error boundary logger helper
 *
 * Specialized logger for React error boundaries
 */
export function logErrorBoundary(
  error: Error,
  errorInfo: { componentStack?: string },
  context?: string
): string {
  return logError(
    error,
    {
      componentStack: errorInfo.componentStack,
      context: context || 'error-boundary',
    },
    'error'
  );
}

/**
 * Initialize error logger on import (client-side only)
 */
if (typeof window !== 'undefined') {
  initErrorLogger();
}
