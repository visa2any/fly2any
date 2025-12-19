'use client';

/**
 * Global Error Listener
 * Catches unhandled errors from:
 * - Event handlers (onClick, onSubmit, etc.)
 * - Async operations (fetch, setTimeout, etc.)
 * - Promise rejections
 *
 * These errors are NOT caught by React Error Boundaries.
 * This component provides a safety net for the entire app.
 */

import { useEffect } from 'react';
import { logError } from '@/lib/errorLogger';

interface GlobalErrorListenerProps {
  children: React.ReactNode;
}

export function GlobalErrorListener({ children }: GlobalErrorListenerProps) {
  useEffect(() => {
    // Handle uncaught errors (event handlers, sync errors)
    const handleError = (event: ErrorEvent) => {
      event.preventDefault(); // Prevent default browser error handling

      logError(event.error || new Error(event.message), {
        context: 'window-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('[Global Error]', event.error || event.message);
      }
    };

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();

      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

      logError(error, {
        context: 'unhandled-rejection',
        type: 'promise',
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('[Unhandled Rejection]', event.reason);
      }
    };

    // Attach listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return <>{children}</>;
}
