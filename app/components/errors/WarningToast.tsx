/**
 * WarningToast - Non-blocking toast for MEDIUM/WARN errors
 * Informational, doesn't interrupt workflow
 */

'use client';

import React, { useState, useEffect } from 'react';

// ========================================
// TYPES
// ========================================

interface WarningToastProps {
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
  onDismiss: () => void;
}

// ========================================
// COMPONENT
// ========================================

export function WarningToast({
  error,
  onDismiss,
}: WarningToastProps) {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  /**
   * Auto-dismiss after 5 seconds
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  /**
   * Copy correlation ID to clipboard
   */
  const handleCopyCorrelationId = async () => {
    try {
      await navigator.clipboard.writeText(error.correlationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[WarningToast] Failed to copy correlation ID:', err);
    }
  };

  /**
   * Handle dismiss
   */
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-md w-full"
      style={{
        transition: 'opacity 300ms, transform 300ms',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      <div className="bg-white border border-amber-300 rounded-lg shadow-xl p-4 space-y-3">
        {/* HEADER */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                Warning
              </h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">
                {error.severity}
              </span>
            </div>
            <p className="text-gray-700 mt-1 text-sm">
              {error.message}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CORRELATION ID */}
        <div className="bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-between">
          <span className="text-xs text-gray-600">
            <span className="font-semibold">Correlation ID:</span> {error.correlationId}
          </span>
          <button
            onClick={handleCopyCorrelationId}
            className="text-blue-600 hover:text-blue-700 text-xs font-semibold"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Auto-dismisses in 5 seconds
          </span>
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}