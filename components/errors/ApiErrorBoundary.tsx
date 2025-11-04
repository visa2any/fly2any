'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
  isRetrying: boolean;
}

/**
 * ApiErrorBoundary - Handles API-related errors
 *
 * Features:
 * - Detects network/API failures
 * - Automatic retry logic
 * - User-friendly API error messages
 * - Graceful degradation
 *
 * Usage:
 * Wrap components that make API calls:
 * <ApiErrorBoundary>
 *   <FlightResults />
 * </ApiErrorBoundary>
 */
export class ApiErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isNetworkError: false,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if it's a network error
    const isNetworkError =
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.name === 'TypeError';

    return {
      hasError: true,
      error,
      isNetworkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    if (process.env.NODE_ENV === 'development') {
      console.error('ApiErrorBoundary caught an error:', error, errorInfo);
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
    console.error('API Error logged:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      type: 'api_error',
    });
  }

  handleRetry = async () => {
    if (this.retryCount >= this.maxRetries) {
      console.warn('Max retries reached');
      return;
    }

    this.retryCount++;
    this.setState({ isRetrying: true });

    // Wait with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 5000);
    await new Promise(resolve => setTimeout(resolve, delay));

    // Clear error state and retry
    this.setState({
      hasError: false,
      error: null,
      isRetrying: false,
    });
  };

  handleRefresh = () => {
    this.retryCount = 0;
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isNetworkError, isRetrying, error } = this.state;

      // Default API error UI
      return (
        <div className="min-h-[400px] bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-orange-200 p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                {isNetworkError ? (
                  <WifiOff className="w-10 h-10 text-orange-600" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-orange-600" />
                )}
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {isNetworkError
                  ? "Connection Problem"
                  : "Service Temporarily Unavailable"}
              </h2>
              <p className="text-gray-600 mb-4">
                {isNetworkError
                  ? "We're having trouble connecting. Please check your internet connection."
                  : "We're experiencing technical difficulties. Our team is working on it."}
              </p>
              {this.retryCount > 0 && (
                <p className="text-sm text-gray-500">
                  Retry attempt {this.retryCount} of {this.maxRetries}
                </p>
              )}
            </div>

            {/* Developer Info (only in development) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-left">
                <details className="cursor-pointer">
                  <summary className="text-sm font-semibold text-orange-900 mb-2">
                    Developer Info
                  </summary>
                  <div className="mt-2 text-xs text-orange-800 font-mono">
                    <p className="font-bold mb-1">Error: {error.message}</p>
                    <pre className="overflow-auto max-h-32 bg-orange-100 p-2 rounded text-xs">
                      {error.stack}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {this.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isRetrying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-5 h-5" />
                      Try Again
                    </>
                  )}
                </button>
              )}
              <button
                onClick={this.handleRefresh}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <RefreshCcw className="w-5 h-5" />
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
