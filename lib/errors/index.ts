/**
 * Error Handling System - Central Export
 *
 * This module provides a comprehensive error handling system for the application.
 * Import everything you need from this single file.
 */

// Error Handlers
export {
  handleApiError,
  withRetry,
  logApiError,
  checkApiCredentials,
  ApiError,
  type ApiErrorResponse,
  type RetryConfig,
} from './api-error-handler';

export {
  handleDatabaseError,
  withDatabaseRetry,
  getFallbackData,
  saveFallbackData,
  checkDatabaseHealth,
  isDatabaseConfigured,
  logDatabaseError,
  DatabaseError,
  type DatabaseErrorResponse,
} from './database-error-handler';

export {
  checkAllCredentials,
  getMissingCredentials,
  getMissingRequiredCredentials,
  areRequiredCredentialsConfigured,
  isCredentialConfigured,
  getUserMessage,
  getDevHint,
  getConfigurationReport,
  logMissingCredentials,
  createFallbackResponse,
  requireCredentials,
  type CredentialCheck,
} from './missing-credentials-handler';

// Re-export boundary components for convenience
export { GlobalErrorBoundary } from '@/components/errors/GlobalErrorBoundary';
export { ApiErrorBoundary } from '@/components/errors/ApiErrorBoundary';
export { DatabaseErrorBoundary } from '@/components/errors/DatabaseErrorBoundary';

// Re-export display components
export { default as ErrorAlert } from '@/components/errors/ErrorAlert';
export { default as ErrorPage } from '@/components/errors/ErrorPage';
export { default as ErrorToast, useToast } from '@/components/errors/ErrorToast';
export type { ErrorAlertType, ToastType } from '@/components/errors/ErrorToast';
