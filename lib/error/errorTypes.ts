/**
 * Error Types & Interfaces
 * Central type definitions for the error handling system
 */

// ============================================
// ERROR SEVERITY LEVELS
// ============================================
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ============================================
// ERROR CATEGORIES
// ============================================
export enum ErrorCategory {
  RENDER = 'render',
  NETWORK = 'network',
  CHUNK = 'chunk',
  VALIDATION = 'validation',
  AUTH = 'auth',
  HYDRATION = 'hydration',
  UNKNOWN = 'unknown',
}

// ============================================
// NORMALIZED ERROR OBJECT
// ============================================
export interface NormalizedError {
  id: string;
  fingerprint: string;
  name: string;
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  url: string;
  userAgent: string;
  componentStack?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// ERROR CONTEXT
// ============================================
export interface ErrorContext {
  componentStack?: string;
  context?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

// ============================================
// ERROR BOUNDARY STATE
// ============================================
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  normalizedError: NormalizedError | null;
}

// ============================================
// ERROR HANDLER CONFIG
// ============================================
export interface ErrorHandlerConfig {
  enableSentry: boolean;
  enableDatadog: boolean;
  enableConsole: boolean;
  silentInProduction: boolean;
  onError?: (error: NormalizedError) => void;
}

// ============================================
// TYPE GUARDS
// ============================================
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  );
}

export function isHydrationError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('hydration') ||
    message.includes('minified react error #418') ||
    message.includes('minified react error #422') ||
    message.includes('minified react error #425') ||
    message.includes('text content does not match') ||
    message.includes('server-rendered html') ||
    message.includes('client-rendered html') ||
    message.includes('cannot update a component') ||
    message.includes('cannot perform react state update')
  );
}

export function isNetworkError(error: Error): boolean {
  return (
    error.name === 'NetworkError' ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed') ||
    error.message.includes('net::ERR_')
  );
}
