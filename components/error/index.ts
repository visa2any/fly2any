/**
 * Error Recovery Components
 *
 * Export all error handling and recovery components
 */

// Main component
export { default as ErrorRecoveryManager, createErrorRecovery, commonAlternatives } from './ErrorRecoveryManager';

// Hooks
export {
  useErrorRecovery,
  useTypedErrorRecovery,
  useAPIErrorRecovery,
  useValidationErrorRecovery,
  useTimeoutErrorRecovery,
  useNoResultsErrorRecovery,
  useErrorRecoveryWrapper,
} from './useErrorRecovery';

// Types
export type {
  SupportedErrorType,
  ConsultantType,
  RecoveryError,
  AlternativeAction,
  ErrorRecoveryManagerProps,
  ErrorRecoveryConfig,
  AlternativeCreator,
  ErrorSeverity,
  ExtendedErrorContext,
  UserContext,
  SearchHistory,
  RecoveryStrategy,
  ErrorAnalytics,
  AlternativeCardProps,
  ErrorBoundaryFallbackProps,
  ValidationError,
  APIError,
  TimeoutError,
  NoResultsError,
  AsyncActionHandler,
  ActionHandler,
  ErrorRecoveryState,
  ErrorRecoveryAction,
  UseErrorRecoveryReturn,
} from './types';

// Type guards
export {
  isValidationError,
  isAPIError,
  isTimeoutError,
  isNoResultsError,
} from './types';

// Example component (for development/testing)
export { default as ErrorRecoveryExample } from './ErrorRecoveryExample';
