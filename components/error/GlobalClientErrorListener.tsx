'use client';

import { useEffect } from 'react';
import { reportClientError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

/**
 * Global Client Error Listener
 *
 * Catches ALL unhandled errors and promise rejections globally:
 * - window.onerror - Catches runtime errors
 * - window.onunhandledrejection - Catches unhandled promise rejections (fetch errors, async errors)
 *
 * Add this component once in your root layout.
 */
export function GlobalClientErrorListener() {
  useEffect(() => {
    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      const msg = event.error?.message || event.message || '';
      if (msg === 'NEXT_REDIRECT' || msg === 'NEXT_NOT_FOUND') {
        event.preventDefault();
        return;
      }
      reportClientError(event.error || event.message, {
        component: 'GlobalErrorListener',
        action: 'uncaughtError',
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.NORMAL,
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    // Handle unhandled promise rejections (fetch errors, async errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Ignore Next.js internal signals — these are navigation events, not errors
      if (
        errorMessage === "NEXT_REDIRECT" ||
        errorMessage === "NEXT_NOT_FOUND" ||
        (error?.digest && (
          String(error.digest).startsWith("NEXT_REDIRECT") ||
          String(error.digest).startsWith("NEXT_NOT_FOUND")
        ))
      ) {
        event.preventDefault();
        return;
      }

      // Determine category based on error type
      let category = ErrorCategory.UNKNOWN;
      let severity = ErrorSeverity.HIGH;

      if (errorMessage.toLowerCase().includes('network') ||
          errorMessage.toLowerCase().includes('fetch') ||
          errorMessage.toLowerCase().includes('failed to fetch')) {
        category = ErrorCategory.NETWORK;
        severity = ErrorSeverity.LOW; // Downgraded to prevent paging admins for common client connectivity issues
      } else if (errorMessage.toLowerCase().includes('api') ||
                 errorMessage.toLowerCase().includes('external')) {
        category = ErrorCategory.EXTERNAL_API;
        severity = ErrorSeverity.LOW; // Same for external APIs
      }

      reportClientError(error instanceof Error ? error : errorMessage, {
        component: 'GlobalErrorListener',
        action: 'unhandledRejection',
        category,
        severity,
        additionalData: {
          type: 'PromiseRejection',
          reason: errorMessage,
        },
      });
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}

export default GlobalClientErrorListener;
