/**
 * RetryableInlineError - Inline alert for HIGH errors with retry button
 * Shows clear explanation, allows retry, no false reassurance
 */

'use client';

import React, { useState } from 'react';

// ========================================
// TYPES
// ========================================

interface RetryableInlineErrorProps {
  error: {
    success: false;
    errorCode: string;
    message: string;
    severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
    retryable: boolean;
    correlationId: string;
    details?: Record<string, any>;
    timestamp: number;
  };
  onRetry: () => void;
  onDismiss?: () => void;
}

// ========================================
// COMPONENT
// ========================================

export function RetryableInlineError({
  error,
  onRetry,
  onDismiss,
}: RetryableInlineErrorProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  /**
   * Copy error details to clipboard
   */
  const handleCopyErrorDetails = async () => {
    const details = `
Error Code: ${error.errorCode}
Severity: ${error.severity}
Message: ${error.message}
Correlation ID: ${error.correlationId}
Timestamp: ${new Date(error.timestamp).toISOString()}
${error.details ? `Details: ${JSON.stringify(error.details, null, 2)}` : ''}
    `.trim();
    
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[RetryableInlineError] Failed to copy error details:', err);
    }
  };

  return (
    <div className="border border-red-300 bg-red-50 rounded-lg p-4 space-y-3">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.715V9.717c0-2.047-1.963-3.715-2.502-3.715H5.082c-1.54 0-2.502 1.667-2.502 3.715v8.568c0 2.047 1.963 3.715 2.502 3.715h13.856c1.54 0 2.502-1.667 2.502-3.715V9.717c0-2.047-1.963-3.715-2.502-3.715z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-red-900">
                Save Error
              </h3>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                HIGH SEVERITY
              </span>
            </div>
            <p className="text-red-800 mt-1">
              {error.message}
            </p>
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ACTIONS */}
      {error.retryable && (
        <button
          onClick={onRetry}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Retry Save</span>
        </button>
      )}

      {/* COLLAPSIBLE ERROR DETAILS */}
      <div className="border border-red-200 rounded-lg bg-white">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <span className="text-sm font-semibold text-gray-700">
            {showDetails ? 'Hide' : 'Show'} Error Details
          </span>
          <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showDetails && (
          <div className="px-3 pb-3 pt-2">
            <div className="text-sm space-y-1">
              <div><span className="font-semibold">Error Code:</span> {error.errorCode}</div>
              <div><span className="font-semibold">Message:</span> {error.message}</div>
              <div><span className="font-semibold">Severity:</span> {error.severity}</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Correlation ID:</span> {error.correlationId}
                <button
                  onClick={handleCopyErrorDetails}
                  className="text-blue-600 hover:text-blue-700 text-xs font-semibold"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div><span className="font-semibold">Timestamp:</span> {new Date(error.timestamp).toISOString()}</div>
              {error.details && (
                <div>
                  <span className="font-semibold">Details:</span>
                  <pre className="mt-1 text-xs bg-gray-50 border rounded p-2 overflow-auto">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}