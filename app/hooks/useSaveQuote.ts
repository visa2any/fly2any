/**
 * useSaveQuote - Hook for saving quotes with intelligent retry logic
 * Implements retry strategy, conflict handling, and state machine integration
 */

'use client';

import { useState, useCallback } from 'react';
import { useSaveContext } from '@/app/contexts/SaveContext';
import { trackTelemetry } from '@/lib/telemetry/quoteSaveTelemetry';

// ========================================
// TYPES
// ========================================

interface SaveQuoteOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface ApiError {
  success: false;
  errorCode: string;
  message: string;
  severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
  retryable: boolean;
  correlationId: string;
  details?: Record<string, any>;
  timestamp: number;
}

interface QuoteResponse {
  success: boolean;
  quoteId?: string;
  version?: number;
  savedAt?: string;
  quote?: any;
  error?: ApiError;
}

// ========================================
// CONFIG
// ========================================

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 500,    // 500ms
  maxDelay: 4000,   // 4000ms
  backoffFactor: 1.5, // Exponential backoff
};

// ========================================
// HOOK
// ========================================

export function useSaveQuote() {
  const saveContext = useSaveContext();
  const [isSaving, setIsSaving] = useState(false);
  const [currentRetry, setCurrentRetry] = useState(0);
  const [currentCorrelationId, setCurrentCorrelationId] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  /**
   * Save quote with intelligent retry logic
   */
  const save = useCallback(async (
    quoteId: string,
    payload: any,
    currentVersion: number,
    options?: SaveQuoteOptions
  ): Promise<QuoteResponse> => {
    const startTime = Date.now();
    let retryCount = 0;
    let lastError: ApiError | null = null;
    const correlationId = generateCorrelationId();

    // Track save attempt
    trackTelemetry({
      eventType: 'quote_save_attempt',
      quoteId,
      version: currentVersion,
      correlationId,
      timestamp: Date.now(),
    });

    setIsSaving(true);
    setCurrentCorrelationId(correlationId);
    saveContext.startSave(correlationId);

    // Create new abort controller for this save attempt
    const controller = new AbortController();
    setAbortController(controller);

    try {
      while (retryCount <= RETRY_CONFIG.maxRetries) {
        const attemptStartTime = Date.now();
        lastError = null;

        try {
          // PATCH request to backend
          const response = await fetch(`/api/agents/quotes/${quoteId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...payload,
              version: currentVersion,
            }),
            signal: controller.signal,
          });

          const data: QuoteResponse = await response.json();

          // Backend confirmed success
          if (data.success && data.version) {
            const duration = Date.now() - attemptStartTime;

            // Track success
            trackTelemetry({
              eventType: 'quote_save_success',
              quoteId,
              version: data.version,
              correlationId: data.quoteId ? correlationId : undefined,
              durationMs: duration,
              timestamp: Date.now(),
            });

            // Update state machine
            saveContext.saveSuccess(data.version, correlationId);
            setIsSaving(false);
            setCurrentRetry(0);
            setCurrentCorrelationId(null);
            setAbortController(null);

            options?.onSuccess?.(data);
            return data;
          }

          // Backend returned error
          const error = data.error;
          if (!error) {
            throw new Error('Unexpected response from backend');
          }

          lastError = error;

          // Track error
          trackTelemetry({
            eventType: 'quote_save_failure',
            quoteId,
            version: currentVersion,
            correlationId,
            errorCode: error.errorCode,
            severity: error.severity,
            retryCount,
            durationMs: Date.now() - attemptStartTime,
            timestamp: Date.now(),
          });

          // Check if retryable
          if (!error.retryable || error.severity === 'CRITICAL') {
            // Non-retryable error, abort
            saveContext.saveFatalError(error);
            setIsSaving(false);
            setCurrentRetry(0);
            setCurrentCorrelationId(null);
            setAbortController(null);
            options?.onError?.(error);
            return data;
          }

          // Specific non-retryable errors
          if (error.errorCode === 'QUOTE_CONFLICT_VERSION') {
            // Version conflict, must handle manually
            saveContext.saveConflict(error);
            setIsSaving(false);
            setCurrentRetry(0);
            setCurrentCorrelationId(null);
            setAbortController(null);
            options?.onError?.(error);
            return data;
          }

          if (error.errorCode === 'QUOTE_ALREADY_SENT') {
            // Quote sent, cannot update
            saveContext.saveFatalError(error);
            setIsSaving(false);
            setCurrentRetry(0);
            setCurrentCorrelationId(null);
            setAbortController(null);
            options?.onError?.(error);
            return data;
          }

          // Retryable error - proceed to retry logic
          retryCount++;

          if (retryCount > RETRY_CONFIG.maxRetries) {
            // Max retries exceeded
            saveContext.saveFatalError(error);
            setIsSaving(false);
            setCurrentRetry(0);
            setCurrentCorrelationId(null);
            setAbortController(null);
            options?.onError?.(error);
            return data;
          }

          // Calculate backoff delay
          const delay = Math.min(
            RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, retryCount - 1),
            RETRY_CONFIG.maxDelay
          );

          // Track retry
          trackTelemetry({
            eventType: 'quote_save_retry',
            quoteId,
            version: currentVersion,
            correlationId,
            retryCount,
            durationMs: Date.now() - attemptStartTime,
            timestamp: Date.now(),
          });

          // Update UI with retry count
          setCurrentRetry(retryCount);
          saveContext.startSave(correlationId); // Refresh correlationId for retry

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay));

        } catch (fetchError) {
          // Network error or timeout
          const duration = Date.now() - attemptStartTime;

          // Track network error
          trackTelemetry({
            eventType: 'quote_save_failure',
            quoteId,
            version: currentVersion,
            correlationId,
            errorCode: 'NETWORK_ERROR',
            severity: 'HIGH',
            retryCount,
            durationMs: duration,
            timestamp: Date.now(),
          });

          // Abort if user cancelled
          if (controller.signal.aborted) {
            setIsSaving(false);
            setCurrentRetry(0);
            setCurrentCorrelationId(null);
            setAbortController(null);
            throw new Error('Save cancelled by user');
          }

          // Retry network errors
          retryCount++;

          if (retryCount > RETRY_CONFIG.maxRetries) {
            // Max retries exceeded
            const networkError: ApiError = {
              success: false,
              errorCode: 'NETWORK_ERROR',
              message: 'Failed to connect to server after multiple attempts',
              severity: 'HIGH',
              retryable: false,
              correlationId,
              timestamp: Date.now(),
            };
            saveContext.saveFatalError(networkError);
            setIsSaving(false);
            setCurrentRetry(0);
            setCurrentCorrelationId(null);
            setAbortController(null);
            options?.onError?.(networkError);
            throw networkError;
          }

          // Calculate backoff delay
          const delay = Math.min(
            RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, retryCount - 1),
            RETRY_CONFIG.maxDelay
          );

          // Track retry
          trackTelemetry({
            eventType: 'quote_save_retry',
            quoteId,
            version: currentVersion,
            correlationId,
            retryCount,
            durationMs: duration,
            timestamp: Date.now(),
          });

          // Update UI with retry count
          setCurrentRetry(retryCount);
          saveContext.startSave(correlationId);

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // Should never reach here, but handle gracefully
      throw new Error('Save failed after maximum retries');

    } catch (error) {
      setIsSaving(false);
      setCurrentRetry(0);
      setCurrentCorrelationId(null);
      setAbortController(null);
      throw error;
    }
  }, [saveContext]);

  /**
   * Cancel in-progress save
   */
  const cancelSave = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsSaving(false);
      setCurrentRetry(0);
      setCurrentCorrelationId(null);
    }
  }, [abortController]);

  return {
    save,
    isSaving,
    retryCount: currentRetry,
    lastError: saveContext.lastError,
    correlationId: currentCorrelationId,
    cancelSave,
  };
}

// ========================================
// UTILS
// ========================================

function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 14);
  return `FRONT-${timestamp}-${random}`.toUpperCase();
}