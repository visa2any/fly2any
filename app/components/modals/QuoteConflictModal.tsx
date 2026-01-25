/**
 * QuoteConflictModal - Blocking modal for version conflicts
 * NEVER auto-overrides. User must explicitly resolve.
 */

'use client';

import React, { useState } from 'react';

// ========================================
// TYPES
// ========================================

interface QuoteConflictModalProps {
  isOpen: boolean;
  error: {
    success: false;
    errorCode: string;
    message: string;
    severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
    retryable: boolean;
    correlationId: string;
    details?: {
      quoteId: string;
      expectedVersion: number;
      actualVersion: number;
    };
    timestamp: number;
  };
  localData: any;
  onReload: () => void;
  onCompare: () => void;
  onCancel: () => void;
}

// ========================================
// COMPONENT
// ========================================

export function QuoteConflictModal({
  isOpen,
  error,
  localData,
  onReload,
  onCompare,
  onCancel,
}: QuoteConflictModalProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  /**
   * Copy local changes to clipboard
   */
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(localData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[ConflictModal] Failed to copy to clipboard:', err);
    }
  };

  /**
   * Copy error details to clipboard
   */
  const handleCopyErrorDetails = async () => {
    const details = `
Error Code: ${error.errorCode}
Message: ${error.message}
Severity: ${error.severity}
Correlation ID: ${error.correlationId}
Expected Version: ${error.details?.expectedVersion}
Actual Version: ${error.details?.actualVersion}
Timestamp: ${new Date(error.timestamp).toISOString()}
    `.trim();
    
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[ConflictModal] Failed to copy error details:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.715V9.717c0-2.047-1.963-3.715-2.502-3.715H5.082c-1.54 0-2.502 1.667-2.502 3.715v8.568c0 2.047 1.963 3.715 2.502 3.715h13.856c1.54 0 2.502-1.667 2.502-3.715V9.717c0-2.047-1.963-3.715-2.502-3.715z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Quote Modified Elsewhere
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Your version is out of date
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-gray-700">
              This quote was modified by another agent while you were editing.
              Your version (v{error.details?.expectedVersion}) is out of date.
              The current version is v{error.details?.actualVersion}.
            </p>
            <p className="text-red-700 font-semibold mt-3">
              ⚠️ Your unsaved changes will be lost if you reload.
            </p>
          </div>

          {/* OPTIONS */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700">
              Choose how to resolve:
            </div>
            
            <button
              onClick={onCompare}
              className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-900">Compare Changes</div>
                <div className="text-sm text-gray-600">See what changed before deciding</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-900">Copy My Changes</div>
                <div className="text-sm text-gray-600">Save to clipboard, then reload</div>
              </div>
              <svg className={`w-5 h-5 ${copied ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 5V5a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5zm6-3h-2v2h2V4zm0 16H8v2h8v-2z" />
              </svg>
            </button>

            <button
              onClick={onReload}
              className="w-full text-left px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">Reload Latest Version</div>
                <div className="text-sm opacity-90">Discard my changes</div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
                <div className="bg-gray-50 rounded p-4 text-sm">
                  <div className="font-mono space-y-1">
                    <div><span className="font-semibold">Error Code:</span> {error.errorCode}</div>
                    <div><span className="font-semibold">Message:</span> {error.message}</div>
                    <div><span className="font-semibold">Severity:</span> {error.severity}</div>
                    <div><span className="font-semibold">Correlation ID:</span> {error.correlationId}</div>
                    <div><span className="font-semibold">Expected Version:</span> {error.details?.expectedVersion}</div>
                    <div><span className="font-semibold">Actual Version:</span> {error.details?.actualVersion}</div>
                    <div><span className="font-semibold">Timestamp:</span> {new Date(error.timestamp).toISOString()}</div>
                  </div>
                  <button
                    onClick={handleCopyErrorDetails}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {copied ? '✓ Copied' : 'Copy Error Details'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Cancel (Remain Blocked)
          </button>
        </div>
      </div>
    </div>
  );
}