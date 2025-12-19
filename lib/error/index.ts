/**
 * Error Handling System - Public API
 */

// Types
export * from './errorTypes';

// Handler
export {
  handleError,
  normalizeError,
  generateFingerprint,
  addErrorListener,
  dispatchError,
  ensureError,
} from './errorHandler';

// Listeners
export {
  attachErrorListeners,
  detachErrorListeners,
  areListenersAttached,
} from './errorListeners';

// Logger
export {
  configureErrorLogger,
  initializeErrorLogger,
} from './errorLogger';
