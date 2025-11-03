'use client';

import React, { Component, ReactNode } from 'react';
import { logError } from '@/lib/errorLogger';

/**
 * Error Boundary Props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  variant?: 'full-page' | 'section' | 'inline';
  showDetails?: boolean;
  context?: string;
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

/**
 * Main Error Boundary Component
 *
 * Production-ready React Error Boundary that:
 * - Catches JavaScript errors in child component tree
 * - Logs errors to monitoring service (Sentry-ready)
 * - Displays fallback UI based on variant
 * - Provides retry functionality
 * - Supports different error contexts
 *
 * @example
 * ```tsx
 * <ErrorBoundary variant="section" context="flight-search">
 *   <FlightSearchForm />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    const errorId = logError(error, {
      componentStack: errorInfo.componentStack,
      context: this.props.context,
    });

    // Update state with error details
    this.setState({
      errorInfo,
      errorId,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use variant-specific fallback
      const { variant = 'section', showDetails = false } = this.props;

      return (
        <ErrorFallback
          variant={variant}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          showDetails={showDetails}
          onReset={this.handleReset}
          context={this.props.context}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component Props
 */
interface ErrorFallbackProps {
  variant: 'full-page' | 'section' | 'inline';
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  showDetails: boolean;
  onReset: () => void;
  context?: string;
}

/**
 * Error Fallback Component
 *
 * Renders different UI based on error variant
 */
function ErrorFallback({
  variant,
  error,
  errorInfo,
  errorId,
  showDetails,
  onReset,
  context,
}: ErrorFallbackProps) {
  switch (variant) {
    case 'full-page':
      return (
        <FullPageError
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          showDetails={showDetails}
          onReset={onReset}
          context={context}
        />
      );
    case 'inline':
      return (
        <InlineError
          error={error}
          errorId={errorId}
          showDetails={showDetails}
          onReset={onReset}
        />
      );
    case 'section':
    default:
      return (
        <SectionError
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          showDetails={showDetails}
          onReset={onReset}
          context={context}
        />
      );
  }
}

/**
 * Full Page Error Component
 *
 * Used for critical errors that affect the entire page
 */
function FullPageError({
  error,
  errorInfo,
  errorId,
  showDetails,
  onReset,
  context,
}: Omit<ErrorFallbackProps, 'variant'>) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>

        {/* Error Description */}
        <p className="text-lg text-gray-600 mb-8">
          We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
        </p>

        {/* Error ID */}
        {errorId && (
          <p className="text-sm text-gray-500 mb-8">
            Error ID: <span className="font-mono">{errorId}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go to Homepage
          </button>
        </div>

        {/* Error Details (Development/Debug) */}
        {showDetails && error && (
          <details className="text-left bg-gray-50 border border-gray-200 rounded-lg p-6">
            <summary className="cursor-pointer font-semibold text-gray-900 mb-4">
              Error Details (Debug)
            </summary>
            <div className="space-y-4">
              {context && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Context:</p>
                  <p className="text-sm text-gray-600 font-mono">{context}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-700">Error Message:</p>
                <p className="text-sm text-red-600 font-mono">{error.message}</p>
              </div>
              {error.stack && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Stack Trace:</p>
                  <pre className="text-xs text-gray-600 overflow-x-auto bg-white p-3 rounded border">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Component Stack:</p>
                  <pre className="text-xs text-gray-600 overflow-x-auto bg-white p-3 rounded border">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Support Link */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Section Error Component
 *
 * Used for errors within a specific section of the page
 */
function SectionError({
  error,
  errorInfo,
  errorId,
  showDetails,
  onReset,
  context,
}: Omit<ErrorFallbackProps, 'variant'>) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 my-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Unable to Load This Section
        </h2>

        {/* Error Description */}
        <p className="text-gray-600 mb-6">
          {context
            ? `We're having trouble loading the ${context.replace(/-/g, ' ')} section.`
            : 'We're having trouble loading this section. Please try again.'}
        </p>

        {/* Error ID */}
        {errorId && (
          <p className="text-xs text-gray-500 mb-6">
            Error ID: <span className="font-mono">{errorId}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh Page
          </button>
        </div>

        {/* Error Details (Development/Debug) */}
        {showDetails && error && (
          <details className="text-left bg-white border border-red-200 rounded-lg p-4 mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900 mb-3">
              Error Details (Debug)
            </summary>
            <div className="space-y-3">
              {context && (
                <div>
                  <p className="text-xs font-semibold text-gray-700">Context:</p>
                  <p className="text-xs text-gray-600 font-mono">{context}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-700">Error Message:</p>
                <p className="text-xs text-red-600 font-mono">{error.message}</p>
              </div>
              {error.stack && (
                <div>
                  <p className="text-xs font-semibold text-gray-700">Stack Trace:</p>
                  <pre className="text-xs text-gray-600 overflow-x-auto bg-gray-50 p-2 rounded">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Inline Error Component
 *
 * Used for small, inline errors (e.g., form fields, small widgets)
 */
function InlineError({
  error,
  errorId,
  showDetails,
  onReset,
}: Omit<ErrorFallbackProps, 'variant' | 'errorInfo' | 'context'>) {
  return (
    <div className="bg-red-50 border border-red-200 rounded p-4">
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <svg
          className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <div className="flex-1 min-w-0">
          {/* Error Message */}
          <p className="text-sm text-gray-900 font-medium mb-1">
            Something went wrong
          </p>

          {/* Error ID */}
          {errorId && (
            <p className="text-xs text-gray-500 mb-2">
              Error ID: {errorId}
            </p>
          )}

          {/* Retry Button */}
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Try again
          </button>

          {/* Error Details (Development/Debug) */}
          {showDetails && error && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-gray-700 font-semibold">
                Details
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-x-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook-based Error Boundary Wrapper
 *
 * For use in functional components that need error handling
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
