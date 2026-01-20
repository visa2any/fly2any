/**
 * Central Error Handler
 * Normalizes, fingerprints, and dispatches errors
 */

import {
  NormalizedError,
  ErrorContext,
  ErrorCategory,
  ErrorSeverity,
  isChunkLoadError,
  isNetworkError,
  isHydrationError,
} from './errorTypes';

import { handleChunkLoadError as handleChunkErrorWithCache } from './chunkErrorHandler';
import { handleHydrationError as handleHydrationErrorWithExplanation } from './hydrationErrorHandler';

// ============================================
// ERROR ID GENERATOR
// ============================================
let errorCounter = 0;

function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const counter = (++errorCounter).toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${counter}-${random}`.toUpperCase();
}

// ============================================
// FINGERPRINT GENERATOR
// ============================================
export function generateFingerprint(error: Error): string {
  const hash = (str: string): number => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  };

  const stackLine = error.stack?.split('\n')[1]?.trim() || '';
  const fingerprint = `${error.name}:${error.message}:${stackLine}`;
  return `ERR-${hash(fingerprint).toString(36).toUpperCase().slice(0, 8)}`;
}

// ============================================
// CATEGORY DETECTOR
// ============================================
function detectCategory(error: Error): ErrorCategory {
  if (isChunkLoadError(error)) return ErrorCategory.CHUNK;
  if (isHydrationError(error)) return ErrorCategory.HYDRATION;
  if (isNetworkError(error)) return ErrorCategory.NETWORK;
  if (error.name === 'ValidationError') return ErrorCategory.VALIDATION;
  if (error.name === 'AuthError' || error.message.includes('unauthorized')) {
    return ErrorCategory.AUTH;
  }
  return ErrorCategory.UNKNOWN;
}

// ============================================
// SEVERITY DETECTOR
// ============================================
function detectSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
  if (category === ErrorCategory.AUTH) return ErrorSeverity.HIGH;
  if (category === ErrorCategory.CHUNK) return ErrorSeverity.MEDIUM;
  if (category === ErrorCategory.HYDRATION) return ErrorSeverity.HIGH;
  if (category === ErrorCategory.NETWORK) return ErrorSeverity.MEDIUM;
  if (error.message.includes('critical') || error.message.includes('fatal')) {
    return ErrorSeverity.CRITICAL;
  }
  return ErrorSeverity.MEDIUM;
}

// ============================================
// ERROR NORMALIZER
// ============================================
export function normalizeError(
  error: Error,
  context?: ErrorContext
): NormalizedError {
  const category = detectCategory(error);
  const severity = detectSeverity(error, category);

  return {
    id: generateErrorId(),
    fingerprint: generateFingerprint(error),
    name: error.name,
    message: error.message,
    stack: error.stack,
    category,
    severity,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    componentStack: context?.componentStack,
    metadata: {
      ...context?.metadata,
      context: context?.context,
    },
  };
}

// ============================================
// ERROR DISPATCHER
// ============================================
type ErrorListener = (error: NormalizedError) => void;
const listeners: Set<ErrorListener> = new Set();

export function addErrorListener(listener: ErrorListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dispatchError(normalizedError: NormalizedError): void {
  listeners.forEach((listener) => {
    try {
      listener(normalizedError);
    } catch (e) {
      // Prevent listener errors from breaking the chain
      console.error('[ErrorHandler] Listener error:', e);
    }
  });
}

// ============================================
// MAIN HANDLER
// ============================================
export function handleError(error: Error, context?: ErrorContext): NormalizedError {
  const normalizedError = normalizeError(error, context);
  
  // Handle specific error types with specialized handlers
  if (isChunkLoadError(error)) {
    handleChunkErrorWithCache(error);
  } else if (isHydrationError(error)) {
    handleHydrationErrorWithExplanation(error);
  }
  
  dispatchError(normalizedError);
  return normalizedError;
}

// ============================================
// ERROR FROM UNKNOWN
// ============================================
export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    return new Error(obj.message as string || JSON.stringify(value));
  }
  return new Error(String(value));
}
