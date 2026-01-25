/**
 * CriticalErrorModal - Blocking modal for CRITICAL errors
 * Explicitly states "Quote was NOT saved". Blocks all interactions.
 */

'use client';

import React, { useState } from 'react';

// ========================================
// TYPES
// ========================================

interface CriticalErrorModalProps {
  isOpen: boolean;
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
  onContactSupport: () => void;
  onDismiss: () => void;
}

// ========================================
// COMPONENT
// ========================================

export function CriticalErrorModal({
  isOpen,
  error,
  onContactSupport,
  onDismiss,
}: CriticalErrorModalProps) {
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
      console.error('[CriticalErrorModal] Failed to copy error details:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="border-b border-red-200 bg-red-50 p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.715V9.717c0-2.047-1.963-3.715-2.502-3.715H5.082c-1.54 0-2.502 1.667-2.502 3.715v8.568c0 2.047 1.963 3.715 2.502 3.715h13.856c1.54 0 2.502-1.667 2.502-3.715V9.717c0-2.047-1.963-3.715-2.502-3.715z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900">
                Save Failed - Quote Was NOT Saved
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  CRITICAL ERROR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-semibold text-lg">
              {error.message}
            </p>
            <p className="text-red-700 mt-3">
              Your quote was not saved. Please contact support with the error details below.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyErrorDetails}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-gray-700">
                {copied ? '✓ Copied' : 'Copy Error Details'}
              </span>
            </button>

            <button
              onClick={onContactSupport}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Contact Support</span>
            </button>
          </div>

          {/* COLLAPSIBLE ERROR DETAILS */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
            >
              <span className="text-sm font-semibold text-gray-700">
                {showDetails ? 'Hide' : 'Show'} Error Details
              </span>
              <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDetails && (
              <div className="px-4 pb-4 pt-2">
                <div className="bg-gray-50 rounded p-4 text-sm font-mono space-y-1">
                  <div><span className="font-semibold">Error Code:</span> {error.errorCode}</div>
                  <div><span className="font-semibold">Severity:</span> {error.severity}</div>
                  <div><span className="font-semibold">Message:</span> {error.message}</div>
                  <div><span className="font-semibold">Correlation ID:</span> {error.correlationId}</div>
                  <div><span className="font-semibold">Timestamp:</span> {new Date(error.timestamp).toISOString()}</div>
                  {error.details && (
                    <div>
                      <span className="font-semibold">Details:</span>
                      <pre className="mt-1 text-xs bg-white border rounded p-2 overflow-auto">
                        {JSON.stringify(error.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Close (Quote NOT Saved)
          </button>
        </div>
      </div>
    </div>
  );
}