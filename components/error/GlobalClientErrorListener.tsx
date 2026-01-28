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
    // ═══ THIRD-PARTY ERROR FILTER ═══
    // Ignore errors from third-party scripts to reduce noise
    const shouldIgnoreError = (error: ErrorEvent): boolean => {
      const filename = error.filename || '';
      const message = error.message || '';

      // 1. Tawk.to chat widget errors (socket callbacks)
      if (filename.includes('tawk.to') || filename.includes('twk-chunk')) {
        return true; // Ignore all Tawk.to errors
      }

      // 2. Browser extension errors (e.g., Chrome extensions)
      if (filename.startsWith('chrome-extension://') ||
          filename.startsWith('moz-extension://') ||
          filename.startsWith('safari-extension://')) {
        return true;
      }

      // 3. Ad blocker / common extension patterns
      if (message.includes('adsbygoogle') ||
          message.includes('gtag') ||
          message.includes('fbevents') ||
          message.includes('analytics')) {
        return true;
      }

      // 4. Illegal invocation errors (usually from extensions)
      if (message.includes('Illegal invocation')) {
        return true;
      }

      // 5. ServiceWorker installation errors (common during updates)
      if (message.includes('ServiceWorker') || 
          message.includes('sw.js')) {
        return true;
      }

      // 6. Cross-origin script errors
      if (message === 'Script error.' && !filename) {
        return true; // Generic cross-origin error
      }

      return false;
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      // Filter out third-party errors
      if (shouldIgnoreError(event)) {
        console.debug('🔇 Ignored third-party error:', {
          message: event.message,
          filename: event.filename,
        });
        return; // DO NOT report
      }

      reportClientError(event.error || event.message, {
        component: 'GlobalErrorListener',
        action: 'uncaughtError',
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.HIGH,
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

      // Determine category based on error type
      let category = ErrorCategory.UNKNOWN;
      let severity = ErrorSeverity.HIGH;

      if (errorMessage.toLowerCase().includes('network') ||
          errorMessage.toLowerCase().includes('fetch') ||
          errorMessage.toLowerCase().includes('failed to fetch')) {
        category = ErrorCategory.NETWORK;
        severity = ErrorSeverity.HIGH;
      } else if (errorMessage.toLowerCase().includes('api') ||
                 errorMessage.toLowerCase().includes('external')) {
        category = ErrorCategory.EXTERNAL_API;
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
