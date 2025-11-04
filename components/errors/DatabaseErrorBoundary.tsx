'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Database, RefreshCcw, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isDatabaseError: boolean;
}

/**
 * DatabaseErrorBoundary - Handles database-related errors
 *
 * Features:
 * - Detects Prisma/database errors
 * - User-friendly database error messages
 * - Fallback content for unavailable features
 * - Graceful degradation (show cached data or disable features)
 *
 * Usage:
 * Wrap components that access database:
 * <DatabaseErrorBoundary>
 *   <UserAccount />
 * </DatabaseErrorBoundary>
 */
export class DatabaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isDatabaseError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if it's a database error
    const isDatabaseError =
      error.message.includes('Prisma') ||
      error.message.includes('database') ||
      error.message.includes('PrismaClient') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('DATABASE_URL') ||
      error.name === 'PrismaClientInitializationError' ||
      error.name === 'PrismaClientKnownRequestError';

    return {
      hasError: true,
      error,
      isDatabaseError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    if (process.env.NODE_ENV === 'development') {
      console.error('DatabaseErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error tracking service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // TODO: Integrate with error tracking service
    console.error('Database Error logged:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      type: 'database_error',
    });
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isDatabaseError, error } = this.state;

      // Default database error UI
      return (
        <div className="min-h-[400px] bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-purple-200 p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                {isDatabaseError ? (
                  <Database className="w-10 h-10 text-purple-600" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-purple-600" />
                )}
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Account Features Unavailable
              </h2>
              <p className="text-gray-600 mb-4">
                We're having trouble accessing your account data right now. Please try again in a few moments.
              </p>
              <p className="text-sm text-gray-500">
                Don't worry - your data is safe. This is a temporary issue.
              </p>
            </div>

            {/* Developer Info (only in development) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-left">
                <details className="cursor-pointer">
                  <summary className="text-sm font-semibold text-purple-900 mb-2">
                    Developer Info
                  </summary>
                  <div className="mt-2 text-xs text-purple-800 font-mono">
                    <p className="font-bold mb-1">Error: {error.message}</p>
                    <pre className="overflow-auto max-h-32 bg-purple-100 p-2 rounded text-xs">
                      {error.stack}
                    </pre>
                    {!process.env.DATABASE_URL && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                        <p className="text-red-900 font-bold">DATABASE_URL not configured</p>
                        <p className="text-red-800 text-xs mt-1">
                          Add DATABASE_URL to your .env.local file
                        </p>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRefresh}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Continue Without Account
              </button>
            </div>

            {/* Support Link */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Still having issues?{' '}
                <a
                  href="mailto:support@fly2any.com"
                  className="text-purple-600 hover:text-purple-700 underline font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
