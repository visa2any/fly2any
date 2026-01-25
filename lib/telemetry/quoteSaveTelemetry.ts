/**
 * Quote Save Telemetry - Fire-and-forget tracking
 * Non-blocking telemetry that never affects save functionality
 */

// ========================================
// TYPES
// ========================================

export type TelemetryEventType = 
  | 'quote_save_attempt'
  | 'quote_save_retry'
  | 'quote_save_success'
  | 'quote_save_conflict'
  | 'quote_save_failure';

export interface TelemetryEvent {
  eventType: TelemetryEventType;
  quoteId: string;
  version: number;
  correlationId?: string;
  errorCode?: string;
  severity?: string;
  retryCount?: number;
  durationMs?: number;
  timestamp: number;
}

// ========================================
// TRACKING
// ========================================

/**
 * Send telemetry event (fire-and-forget)
 * NEVER blocks or affects save functionality
 */
export function trackTelemetry(event: TelemetryEvent): void {
  // Fire-and-forget - don't await
  fetch('/api/telemetry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  }).catch(err => {
    // Silently fail - telemetry shouldn't affect functionality
    console.error('[Telemetry] Failed to send:', err);
  });
}

/**
 * Track save attempt
 */
export function trackSaveAttempt(
  quoteId: string,
  version: number,
  correlationId: string
): void {
  trackTelemetry({
    eventType: 'quote_save_attempt',
    quoteId,
    version,
    correlationId,
    timestamp: Date.now(),
  });
}

/**
 * Track save success
 */
export function trackSaveSuccess(
  quoteId: string,
  version: number,
  correlationId: string,
  durationMs: number
): void {
  trackTelemetry({
    eventType: 'quote_save_success',
    quoteId,
    version,
    correlationId,
    durationMs,
    timestamp: Date.now(),
  });
}

/**
 * Track save error
 */
export function trackSaveError(
  quoteId: string,
  version: number,
  correlationId: string,
  errorCode: string,
  severity: string,
  durationMs: number,
  retryCount?: number
): void {
  trackTelemetry({
    eventType: 'quote_save_failure',
    quoteId,
    version,
    correlationId,
    errorCode,
    severity,
    durationMs,
    retryCount,
    timestamp: Date.now(),
  });
}

/**
 * Track conflict
 */
export function trackConflict(
  quoteId: string,
  version: number,
  correlationId: string,
  errorCode: string,
  severity: string
): void {
  trackTelemetry({
    eventType: 'quote_save_conflict',
    quoteId,
    version,
    correlationId,
    errorCode,
    severity,
    timestamp: Date.now(),
  });
}

/**
 * Track retry
 */
export function trackRetry(
  quoteId: string,
  version: number,
  correlationId: string,
  retryCount: number,
  durationMs: number
): void {
  trackTelemetry({
    eventType: 'quote_save_retry',
    quoteId,
    version,
    correlationId,
    retryCount,
    durationMs,
    timestamp: Date.now(),
  });
}