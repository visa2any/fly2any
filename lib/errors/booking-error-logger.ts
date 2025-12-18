/**
 * Global Booking Error Logger
 * Catches and reports all errors from customer-side booking flows
 * Level 6 - Production-grade error tracking
 */

export type BookingFlow =
  | 'flights'
  | 'hotels'
  | 'tours'
  | 'activities'
  | 'transfers'
  | 'cars'
  | 'experiences-checkout';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface BookingError {
  flow: BookingFlow;
  stage: string; // e.g., 'search', 'details', 'booking', 'payment', 'confirmation'
  error: string;
  errorCode?: string;
  severity: ErrorSeverity;
  userAgent?: string;
  url?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// In-memory queue for batching errors
let errorQueue: BookingError[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

/**
 * Log booking error to console and queue for API
 */
export function logBookingError(
  flow: BookingFlow,
  stage: string,
  error: Error | string,
  severity: ErrorSeverity = 'medium',
  metadata?: Record<string, any>
): void {
  const errorObj: BookingError = {
    flow,
    stage,
    error: error instanceof Error ? error.message : error,
    errorCode: error instanceof Error ? error.name : undefined,
    severity,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
    metadata,
  };

  // Console log with styling
  const styles = {
    low: 'color: #6B7280',
    medium: 'color: #F59E0B',
    high: 'color: #EF4444',
    critical: 'color: #DC2626; font-weight: bold',
  };

  console.error(
    `%c[Booking Error] ${flow}/${stage}`,
    styles[severity],
    errorObj.error,
    metadata || ''
  );

  // Add to queue
  errorQueue.push(errorObj);

  // Debounce flush
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushErrorQueue, 2000);

  // Immediate flush for critical errors
  if (severity === 'critical') {
    flushErrorQueue();
  }
}

/**
 * Flush error queue to API
 */
async function flushErrorQueue(): Promise<void> {
  if (errorQueue.length === 0) return;

  const errors = [...errorQueue];
  errorQueue = [];

  try {
    await fetch('/api/errors/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors }),
    });
  } catch {
    // Re-queue on failure (max 50)
    errorQueue = [...errors.slice(-25), ...errorQueue.slice(-25)];
  }
}

/**
 * HOC wrapper for async operations with error logging
 */
export async function withErrorLogging<T>(
  flow: BookingFlow,
  stage: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    logBookingError(flow, stage, error, 'high', metadata);
    throw error;
  }
}

/**
 * Create error handler for specific flow
 */
export function createFlowErrorHandler(flow: BookingFlow) {
  return {
    log: (stage: string, error: Error | string, severity?: ErrorSeverity, meta?: Record<string, any>) =>
      logBookingError(flow, stage, error, severity, meta),
    wrap: <T>(stage: string, op: () => Promise<T>, meta?: Record<string, any>) =>
      withErrorLogging(flow, stage, op, meta),
  };
}

// Pre-configured handlers for each flow
export const tourErrors = createFlowErrorHandler('tours');
export const activityErrors = createFlowErrorHandler('activities');
export const transferErrors = createFlowErrorHandler('transfers');
export const hotelErrors = createFlowErrorHandler('hotels');
export const flightErrors = createFlowErrorHandler('flights');
export const carErrors = createFlowErrorHandler('cars');
export const checkoutErrors = createFlowErrorHandler('experiences-checkout');
