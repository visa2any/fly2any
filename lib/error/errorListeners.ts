/**
 * Global Error Listeners
 * Catches window.onerror and unhandledrejection events
 */

import { handleError, ensureError } from './errorHandler';

// ============================================
// STATE
// ============================================
let listenersAttached = false;

// ============================================
// WINDOW ERROR HANDLER
// ============================================
function handleWindowError(event: ErrorEvent): void {
  event.preventDefault();

  const error = event.error || new Error(event.message);

  handleError(error, {
    context: 'window-error',
    metadata: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      source: 'window.onerror',
    },
  });
}

// ============================================
// UNHANDLED REJECTION HANDLER
// ============================================
function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  event.preventDefault();

  const error = ensureError(event.reason);

  handleError(error, {
    context: 'unhandled-rejection',
    metadata: {
      source: 'unhandledrejection',
      type: 'promise',
    },
  });
}

// ============================================
// ATTACH LISTENERS
// ============================================
export function attachErrorListeners(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (listenersAttached) return () => {};

  window.addEventListener('error', handleWindowError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  listenersAttached = true;

  // Return cleanup function
  return () => {
    window.removeEventListener('error', handleWindowError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    listenersAttached = false;
  };
}

// ============================================
// DETACH LISTENERS
// ============================================
export function detachErrorListeners(): void {
  if (typeof window === 'undefined') return;

  window.removeEventListener('error', handleWindowError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  listenersAttached = false;
}

// ============================================
// CHECK STATE
// ============================================
export function areListenersAttached(): boolean {
  return listenersAttached;
}
