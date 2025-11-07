/**
 * useErrorRecovery Hook
 *
 * A custom React hook that simplifies error state management
 * and provides a clean API for working with ErrorRecoveryManager.
 *
 * @example
 * ```tsx
 * const { error, setError, clearError, retry } = useErrorRecovery({
 *   onRetry: async () => {
 *     await searchFlights();
 *   }
 * });
 *
 * // In your code
 * try {
 *   await api.search();
 * } catch (err) {
 *   setError({
 *     type: 'api-failure',
 *     message: err.message,
 *     originalRequest: query
 *   });
 * }
 *
 * // In your JSX
 * {error && (
 *   <ErrorRecoveryManager
 *     error={error}
 *     onRetry={retry}
 *     canRetry={!isRetrying}
 *   />
 * )}
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  RecoveryError,
  ErrorRecoveryState,
  UseErrorRecoveryReturn,
  ActionHandler,
} from './types';

export interface UseErrorRecoveryOptions {
  /** Callback to execute when retry is triggered */
  onRetry?: ActionHandler;

  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;

  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;

  /** Whether to use exponential backoff (default: true) */
  exponentialBackoff?: boolean;

  /** Callback when error is set */
  onError?: (error: RecoveryError) => void;

  /** Callback when error is cleared */
  onClearError?: () => void;

  /** Callback when retry succeeds */
  onRetrySuccess?: () => void;

  /** Callback when retry fails */
  onRetryFailure?: (error: Error) => void;

  /** Whether to auto-clear error after successful retry (default: true) */
  autoClearOnSuccess?: boolean;
}

/**
 * Custom hook for managing error recovery state
 */
export function useErrorRecovery(options: UseErrorRecoveryOptions = {}): UseErrorRecoveryReturn {
  const {
    onRetry,
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onError,
    onClearError,
    onRetrySuccess,
    onRetryFailure,
    autoClearOnSuccess = true,
  } = options;

  const [state, setState] = useState<ErrorRecoveryState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    selectedAlternative: null,
    history: [],
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback(
    (error: RecoveryError) => {
      setState((prev) => ({
        ...prev,
        error,
        retryCount: 0,
        history: [...prev.history, error],
      }));

      // Call onError callback
      if (onError) {
        onError(error);
      }
    },
    [onError]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      isRetrying: false,
      retryCount: 0,
      selectedAlternative: null,
    }));

    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Call onClearError callback
    if (onClearError) {
      onClearError();
    }
  }, [onClearError]);

  /**
   * Retry the last action
   */
  const retry = useCallback(async () => {
    if (!onRetry) {
      console.warn('useErrorRecovery: No onRetry callback provided');
      return;
    }

    if (state.retryCount >= maxRetries) {
      console.warn('useErrorRecovery: Maximum retry attempts reached');
      if (onRetryFailure) {
        onRetryFailure(new Error('Maximum retry attempts reached'));
      }
      return;
    }

    setState((prev) => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }));

    try {
      // Calculate delay with optional exponential backoff
      const delay = exponentialBackoff
        ? retryDelay * Math.pow(2, state.retryCount)
        : retryDelay;

      // Wait before retrying
      if (delay > 0) {
        await new Promise((resolve) => {
          retryTimeoutRef.current = setTimeout(resolve, delay);
        });
      }

      // Execute retry callback
      await onRetry();

      // Retry succeeded
      setState((prev) => ({
        ...prev,
        isRetrying: false,
      }));

      // Auto-clear error on success if enabled
      if (autoClearOnSuccess) {
        clearError();
      }

      // Call success callback
      if (onRetrySuccess) {
        onRetrySuccess();
      }
    } catch (error) {
      // Retry failed
      setState((prev) => ({
        ...prev,
        isRetrying: false,
      }));

      // Call failure callback
      if (onRetryFailure) {
        onRetryFailure(error as Error);
      }

      // Update error with new attempt count
      if (state.error) {
        setError({
          ...state.error,
          message: `${state.error.message} (Retry ${state.retryCount + 1} failed)`,
        });
      }
    }
  }, [
    onRetry,
    state.retryCount,
    state.error,
    maxRetries,
    retryDelay,
    exponentialBackoff,
    autoClearOnSuccess,
    onRetrySuccess,
    onRetryFailure,
    clearError,
    setError,
  ]);

  return {
    error: state.error,
    setError,
    clearError,
    retry,
    isRetrying: state.isRetrying,
    retryCount: state.retryCount,
    history: state.history,
  };
}

/**
 * Hook for error recovery with automatic type inference
 */
export function useTypedErrorRecovery<TError extends RecoveryError>(
  options: UseErrorRecoveryOptions = {}
) {
  const recovery = useErrorRecovery(options);

  return {
    ...recovery,
    error: recovery.error as TError | null,
    setError: recovery.setError as (error: TError) => void,
  };
}

/**
 * Hook for handling API errors specifically
 */
export function useAPIErrorRecovery(options: UseErrorRecoveryOptions = {}) {
  const recovery = useErrorRecovery(options);

  const setAPIError = useCallback(
    (message: string, originalRequest?: string, statusCode?: number) => {
      recovery.setError({
        type: 'api-failure',
        message,
        originalRequest,
      });
    },
    [recovery]
  );

  return {
    ...recovery,
    setAPIError,
  };
}

/**
 * Hook for handling validation errors specifically
 */
export function useValidationErrorRecovery(options: UseErrorRecoveryOptions = {}) {
  const recovery = useErrorRecovery(options);

  const setValidationError = useCallback(
    (message: string, originalRequest?: string, field?: string) => {
      recovery.setError({
        type: 'invalid-input',
        message,
        originalRequest,
      });
    },
    [recovery]
  );

  return {
    ...recovery,
    setValidationError,
  };
}

/**
 * Hook for handling timeout errors specifically
 */
export function useTimeoutErrorRecovery(options: UseErrorRecoveryOptions = {}) {
  const recovery = useErrorRecovery(options);

  const setTimeoutError = useCallback(
    (message: string, originalRequest?: string, duration?: number) => {
      recovery.setError({
        type: 'timeout',
        message,
        originalRequest,
      });
    },
    [recovery]
  );

  return {
    ...recovery,
    setTimeoutError,
  };
}

/**
 * Hook for handling no results errors specifically
 */
export function useNoResultsErrorRecovery(options: UseErrorRecoveryOptions = {}) {
  const recovery = useErrorRecovery(options);

  const setNoResultsError = useCallback(
    (message: string, originalRequest?: string, searchCriteria?: Record<string, any>) => {
      recovery.setError({
        type: 'no-results',
        message,
        originalRequest,
      });
    },
    [recovery]
  );

  return {
    ...recovery,
    setNoResultsError,
  };
}

/**
 * Hook that wraps an async function with error recovery
 */
export function useErrorRecoveryWrapper<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: UseErrorRecoveryOptions & {
    /** Custom error mapper */
    mapError?: (error: Error) => RecoveryError;
  } = {}
) {
  const { mapError, ...recoveryOptions } = options;
  const recovery = useErrorRecovery(recoveryOptions);

  const wrappedFn = useCallback(
    async (...args: TArgs): Promise<TReturn | null> => {
      try {
        recovery.clearError();
        const result = await fn(...args);
        return result;
      } catch (error) {
        const recoveryError = mapError
          ? mapError(error as Error)
          : {
              type: 'api-failure' as const,
              message: (error as Error).message,
              originalRequest: JSON.stringify(args),
            };

        recovery.setError(recoveryError);
        return null;
      }
    },
    [fn, mapError, recovery]
  );

  return {
    ...recovery,
    execute: wrappedFn,
  };
}

/**
 * Default export
 */
export default useErrorRecovery;
