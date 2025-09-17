/**
 * 🛡️ SAFE ASYNC HOOK
 * Provides safe async operations with error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface SafeAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  called: boolean;
}

export interface UseSafeAsyncReturn<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
  data: T | null;
  loading: boolean;
  error: Error | null;
  called: boolean;
}

export function useSafeAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): UseSafeAsyncReturn<T> {
  const [state, setState] = useState<SafeAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    called: false
  });

  const cancelRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      called: true
    }));

    try {
      const result = await asyncFunction(...args);

      if (!cancelRef.current) {
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null
        }));
      }

      return result;
    } catch (error) {
      if (!cancelRef.current) {
        const safeError = error instanceof Error ? error : new Error('Unknown error');
        setState(prev => ({
          ...prev,
          data: null,
          loading: false,
          error: safeError
        }));
      }
      return null;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      called: false
    });
  }, []);

  const retry = useCallback(async (): Promise<T | null> => {
    return execute();
  }, [execute]);

  return {
    execute,
    reset,
    retry,
    data: state.data,
    loading: state.loading,
    error: state.error,
    called: state.called
  };
}

export function useSafeAsyncError() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    setError(errorObj);
    console.error('Safe async error:', errorObj);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}