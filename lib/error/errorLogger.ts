/**
 * Error Logger
 * Handles logging to Sentry, Datadog, and console
 */

import { NormalizedError, ErrorSeverity, ErrorHandlerConfig } from './errorTypes';
import { addErrorListener } from './errorHandler';

// ============================================
// DEFAULT CONFIG
// ============================================
const defaultConfig: ErrorHandlerConfig = {
  enableSentry: true,
  enableDatadog: false,
  enableConsole: process.env.NODE_ENV === 'development',
  silentInProduction: true,
};

let config: ErrorHandlerConfig = { ...defaultConfig };

// ============================================
// CONFIGURE LOGGER
// ============================================
export function configureErrorLogger(newConfig: Partial<ErrorHandlerConfig>): void {
  config = { ...config, ...newConfig };
}

// ============================================
// SENTRY INTEGRATION
// ============================================
function logToSentry(error: NormalizedError): void {
  if (!config.enableSentry) return;

  const Sentry = (window as any).Sentry;
  if (!Sentry) return;

  try {
    Sentry.withScope((scope: any) => {
      scope.setTag('error_id', error.id);
      scope.setTag('fingerprint', error.fingerprint);
      scope.setTag('category', error.category);
      scope.setLevel(mapSeverityToSentry(error.severity));

      if (error.componentStack) {
        scope.setExtra('componentStack', error.componentStack);
      }
      if (error.metadata) {
        scope.setExtras(error.metadata);
      }

      Sentry.captureException(new Error(error.message), {
        fingerprint: [error.fingerprint],
      });
    });
  } catch (e) {
    // Sentry error - fail silently
  }
}

function mapSeverityToSentry(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.CRITICAL: return 'fatal';
    case ErrorSeverity.HIGH: return 'error';
    case ErrorSeverity.MEDIUM: return 'warning';
    case ErrorSeverity.LOW: return 'info';
    default: return 'error';
  }
}

// ============================================
// DATADOG INTEGRATION
// ============================================
function logToDatadog(error: NormalizedError): void {
  if (!config.enableDatadog) return;

  const DD_LOGS = (window as any).DD_LOGS;
  if (!DD_LOGS) return;

  try {
    DD_LOGS.logger.error(error.message, {
      error_id: error.id,
      fingerprint: error.fingerprint,
      category: error.category,
      severity: error.severity,
      url: error.url,
      stack: error.stack,
      metadata: error.metadata,
    });
  } catch (e) {
    // Datadog error - fail silently
  }
}

// ============================================
// CONSOLE LOGGER
// ============================================
function logToConsole(error: NormalizedError): void {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd && config.silentInProduction) return;
  if (!config.enableConsole && !isProd) return;

  const style = 'color: #E74035; font-weight: bold;';

  console.group(`%c[Error] ${error.fingerprint}`, style);
  console.error('Message:', error.message);
  console.log('Category:', error.category);
  console.log('Severity:', error.severity);
  console.log('URL:', error.url);
  if (error.componentStack) {
    console.log('Component Stack:', error.componentStack);
  }
  if (error.stack) {
    console.log('Stack:', error.stack);
  }
  console.groupEnd();
}

// ============================================
// CUSTOM CALLBACK
// ============================================
function notifyCallback(error: NormalizedError): void {
  if (config.onError) {
    try {
      config.onError(error);
    } catch (e) {
      // Callback error - fail silently
    }
  }
}

// ============================================
// MAIN LOGGER
// ============================================
function logError(error: NormalizedError): void {
  logToConsole(error);
  logToSentry(error);
  logToDatadog(error);
  notifyCallback(error);
}

// ============================================
// INITIALIZE LISTENER
// ============================================
let initialized = false;

export function initializeErrorLogger(): void {
  if (initialized) return;
  if (typeof window === 'undefined') return;

  addErrorListener(logError);
  initialized = true;
}

// Auto-initialize on import (client-side only)
if (typeof window !== 'undefined') {
  initializeErrorLogger();
}
