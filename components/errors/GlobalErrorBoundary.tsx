'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * GlobalErrorBoundary - Catches all unhandled React errors
 *
 * Features:
 * - User-friendly error messages (no technical jargon)
 * - Automatic error logging
 * - Recovery options (refresh, go home)
 * - Preserves user context when possible
 *
 * Usage:
 * Wrap your app or specific sections:
 * <GlobalErrorBoundary>
 *   <YourComponent />
 * </GlobalErrorBoundary>
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    }

    // Log to error tracking service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });

    // For now, just log to console
    console.error('Error logged:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  handleRefresh = () => {
    // Clear error state and reload
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    // Clear error state and navigate home
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-red-200 p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Something went wrong
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
              <p className="text-sm text-gray-500">
                Don't worry - your data is safe. Try refreshing the page or returning to the homepage.
              </p>
            </div>

            {/* Developer Info (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <details className="cursor-pointer">
                  <summary className="text-sm font-semibold text-red-900 mb-2">
                    Developer Info (hidden in production)
                  </summary>
                  <div className="mt-2 text-xs text-red-800 font-mono">
                    <p className="font-bold mb-1">Error: {this.state.error.message}</p>
                    <pre className="overflow-auto max-h-40 bg-red-100 p-2 rounded">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRefresh}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <RefreshCcw className="w-5 h-5" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </button>
            </div>

            {/* Support Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Need help?{' '}
                <a
                  href="mailto:support@fly2any.com"
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
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
