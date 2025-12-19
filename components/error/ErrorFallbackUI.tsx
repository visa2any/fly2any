'use client';

/**
 * Error Fallback UI
 * Premium, Apple-level UX for error states
 *
 * Design principles:
 * - Calm, non-alarming language
 * - Clear hierarchy and spacing
 * - Subtle animations
 * - No technical jargon
 * - Error reference ID shown subtly
 */

import React from 'react';

// ============================================
// PROPS
// ============================================
interface ErrorFallbackUIProps {
  error: Error | null;
  errorId: string | null;
  isChunkError: boolean;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
}

// ============================================
// ICON COMPONENTS
// ============================================
function WarningIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function ErrorFallbackUI({
  error,
  errorId,
  isChunkError,
  onRetry,
  onReload,
  onGoHome,
}: ErrorFallbackUIProps): JSX.Element {
  // Content based on error type
  const title = isChunkError
    ? 'Update available'
    : 'Something went wrong';

  const description = isChunkError
    ? 'A new version of the app is available. Please refresh to continue.'
    : 'We ran into an issue loading this page. This has been reported to our team.';

  const primaryAction = isChunkError
    ? { label: 'Refresh', onClick: onReload }
    : { label: 'Try again', onClick: onRetry };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md text-center">
        {/* Icon with subtle animation */}
        <div
          className="mx-auto mb-6 sm:mb-8 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center animate-fade-in"
          style={{
            background: isChunkError
              ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
              : 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
          }}
        >
          {isChunkError ? (
            <RefreshIcon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
          ) : (
            <WarningIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
          {title}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-4 leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
          {/* Primary action */}
          <button
            onClick={primaryAction.onClick}
            className="
              px-6 py-3 rounded-xl font-medium text-sm sm:text-base
              bg-gray-900 text-white
              hover:bg-gray-800 active:scale-[0.98]
              transition-all duration-200
              shadow-sm hover:shadow-md
            "
          >
            {primaryAction.label}
          </button>

          {/* Secondary action - only show for non-chunk errors */}
          {!isChunkError && (
            <button
              onClick={onGoHome}
              className="
                px-6 py-3 rounded-xl font-medium text-sm sm:text-base
                bg-gray-100 text-gray-700
                hover:bg-gray-200 active:scale-[0.98]
                transition-all duration-200
              "
            >
              Go home
            </button>
          )}
        </div>

        {/* Error reference - subtle */}
        {errorId && (
          <p className="mt-8 sm:mt-10 text-xs text-gray-400 font-mono">
            Reference: {errorId}
          </p>
        )}

        {/* Support link */}
        <p className="mt-4 text-xs sm:text-sm text-gray-500">
          Need help?{' '}
          <a
            href="mailto:support@fly2any.com"
            className="text-gray-700 hover:text-gray-900 underline underline-offset-2"
          >
            Contact support
          </a>
        </p>
      </div>

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ErrorFallbackUI;
