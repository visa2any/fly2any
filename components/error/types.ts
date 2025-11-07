/**
 * TypeScript Type Definitions for Error Recovery System
 *
 * These types provide full type safety when working with
 * the ErrorRecoveryManager component and error handling system.
 */

import type { ReactNode } from 'react';
import type { ErrorType, ErrorContext, ErrorResponse } from '@/lib/ai/agent-error-handling';

/**
 * Error types supported by ErrorRecoveryManager
 */
export type SupportedErrorType = 'api-failure' | 'no-results' | 'timeout' | 'invalid-input';

/**
 * Consultant types for context-specific error messaging
 */
export type ConsultantType = 'flight-operations' | 'hotel-accommodations' | 'customer-service';

/**
 * Error object passed to ErrorRecoveryManager
 */
export interface RecoveryError {
  /** The type of error that occurred */
  type: SupportedErrorType;

  /** User-friendly error message (can be raw, will be enhanced) */
  message: string;

  /** The user's original request for context */
  originalRequest?: string;
}

/**
 * Alternative action that user can take
 */
export interface AlternativeAction {
  /** Display label for the action */
  label: string;

  /** Function to execute when action is clicked */
  action: () => void | Promise<void>;

  /** Optional icon to display with the action */
  icon?: ReactNode;
}

/**
 * Props for ErrorRecoveryManager component
 */
export interface ErrorRecoveryManagerProps {
  /** Error details */
  error: RecoveryError;

  /** Optional retry callback */
  onRetry?: () => void | Promise<void>;

  /** Optional alternative actions for the user */
  alternatives?: AlternativeAction[];

  /** Whether retry is allowed (default: true) */
  canRetry?: boolean;

  /** Consultant type for context-specific messaging (default: 'customer-service') */
  consultant?: ConsultantType;
}

/**
 * Return type for createErrorRecovery helper
 */
export interface ErrorRecoveryConfig {
  error: RecoveryError;
}

/**
 * Common alternative action creator function type
 */
export type AlternativeCreator = (onAction: () => void | Promise<void>) => AlternativeAction;

/**
 * Error severity levels for styling
 */
export interface ErrorSeverity {
  bg: string;
  border: string;
  text: string;
  icon: string;
}

/**
 * Extended error context with recovery information
 */
export interface ExtendedErrorContext extends ErrorContext {
  /** Whether the error can be retried */
  canRetry: boolean;

  /** Suggested alternative actions */
  alternatives?: AlternativeAction[];

  /** User's session context */
  userContext?: UserContext;
}

/**
 * User context for context-aware error recovery
 */
export interface UserContext {
  /** Whether user has flexible travel dates */
  flexibleDates?: boolean;

  /** User's date range if flexible */
  dateRange?: {
    start: Date;
    end: Date;
  };

  /** Whether user is a loyalty member */
  loyaltyMember?: boolean;

  /** User's loyalty tier */
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';

  /** Previous search history */
  previousSearches?: SearchHistory[];

  /** User preferences */
  preferences?: {
    preferredAirlines?: string[];
    preferredHotels?: string[];
    maxLayovers?: number;
    cabinClass?: 'economy' | 'premium-economy' | 'business' | 'first';
  };
}

/**
 * Search history item
 */
export interface SearchHistory {
  query: string;
  timestamp: Date;
  type: 'flight' | 'hotel' | 'car';
  successful: boolean;
}

/**
 * Error recovery strategy
 */
export interface RecoveryStrategy {
  /** Strategy name */
  name: string;

  /** Strategy description */
  description: string;

  /** Function to execute strategy */
  execute: () => Promise<void>;

  /** Strategy priority (higher = more important) */
  priority: number;

  /** Estimated success rate (0-1) */
  successRate?: number;
}

/**
 * Error analytics data
 */
export interface ErrorAnalytics {
  /** Error ID for tracking */
  errorId: string;

  /** When error occurred */
  timestamp: Date;

  /** Error type */
  type: SupportedErrorType;

  /** User's original request */
  originalRequest: string;

  /** Whether user retried */
  retried: boolean;

  /** Which alternative was chosen (if any) */
  alternativeChosen?: string;

  /** Whether issue was resolved */
  resolved: boolean;

  /** Time to resolution (if resolved) */
  timeToResolution?: number;
}

/**
 * Props for alternative action cards
 */
export interface AlternativeCardProps {
  alternative: AlternativeAction;
  index: number;
  onClick: () => void;
}

/**
 * Error boundary fallback props
 */
export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Validation error with field information
 */
export interface ValidationError extends RecoveryError {
  type: 'invalid-input';
  field?: string;
  validFormat?: string;
  examples?: string[];
}

/**
 * API error with HTTP details
 */
export interface APIError extends RecoveryError {
  type: 'api-failure';
  statusCode?: number;
  endpoint?: string;
  retryAfter?: number; // seconds
}

/**
 * Timeout error with duration information
 */
export interface TimeoutError extends RecoveryError {
  type: 'timeout';
  duration?: number; // milliseconds
  expectedDuration?: number;
}

/**
 * No results error with search details
 */
export interface NoResultsError extends RecoveryError {
  type: 'no-results';
  searchCriteria?: Record<string, any>;
  suggestedModifications?: string[];
}

/**
 * Type guard to check if error is ValidationError
 */
export function isValidationError(error: RecoveryError): error is ValidationError {
  return error.type === 'invalid-input';
}

/**
 * Type guard to check if error is APIError
 */
export function isAPIError(error: RecoveryError): error is APIError {
  return error.type === 'api-failure';
}

/**
 * Type guard to check if error is TimeoutError
 */
export function isTimeoutError(error: RecoveryError): error is TimeoutError {
  return error.type === 'timeout';
}

/**
 * Type guard to check if error is NoResultsError
 */
export function isNoResultsError(error: RecoveryError): error is NoResultsError {
  return error.type === 'no-results';
}

/**
 * Export all types from error handling system
 */
export type { ErrorType, ErrorContext, ErrorResponse } from '@/lib/ai/agent-error-handling';

/**
 * Utility type for async action handlers
 */
export type AsyncActionHandler = () => Promise<void>;

/**
 * Utility type for sync or async action handlers
 */
export type ActionHandler = () => void | Promise<void>;

/**
 * Configuration for error recovery system
 */
export interface ErrorRecoveryConfig {
  /** Maximum number of retry attempts */
  maxRetries?: number;

  /** Retry delay in milliseconds */
  retryDelay?: number;

  /** Whether to use exponential backoff */
  exponentialBackoff?: boolean;

  /** Whether to track analytics */
  trackAnalytics?: boolean;

  /** Custom error messages */
  customMessages?: Record<string, string>;

  /** Custom alternatives */
  customAlternatives?: Record<string, AlternativeAction[]>;
}

/**
 * Error recovery state
 */
export interface ErrorRecoveryState {
  /** Current error */
  error: RecoveryError | null;

  /** Whether currently retrying */
  isRetrying: boolean;

  /** Number of retry attempts */
  retryCount: number;

  /** Selected alternative (if any) */
  selectedAlternative: string | null;

  /** Error history */
  history: RecoveryError[];
}

/**
 * Error recovery actions for state management
 */
export type ErrorRecoveryAction =
  | { type: 'SET_ERROR'; payload: RecoveryError }
  | { type: 'CLEAR_ERROR' }
  | { type: 'START_RETRY' }
  | { type: 'END_RETRY'; payload: { success: boolean } }
  | { type: 'SELECT_ALTERNATIVE'; payload: string }
  | { type: 'ADD_TO_HISTORY'; payload: RecoveryError };

/**
 * Hook return type for useErrorRecovery
 */
export interface UseErrorRecoveryReturn {
  /** Current error state */
  error: RecoveryError | null;

  /** Set error */
  setError: (error: RecoveryError) => void;

  /** Clear error */
  clearError: () => void;

  /** Retry last action */
  retry: () => Promise<void>;

  /** Whether currently retrying */
  isRetrying: boolean;

  /** Number of retries */
  retryCount: number;

  /** Error history */
  history: RecoveryError[];
}
