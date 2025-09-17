/**
 * 🛡️ SAFE ERROR BOUNDARY
 * React error boundary with security and logging features
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class SafeErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    });

    // Log error securely (avoid logging sensitive data)
    const sanitizedError = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      componentStack: errorInfo.componentStack,
      eventId: this.state.eventId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('SafeErrorBoundary caught an error:', sanitizedError);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry after 5 seconds for transient errors
    if (this.isTransientError(error)) {
      this.scheduleReset(5000);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys = [], resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && (resetOnPropsChange || resetKeys.length > 0)) {
      const hasResetKeyChanged = resetKeys.some(
        (key, idx) => prevProps.resetKeys?.[idx] !== key
      );

      if (resetOnPropsChange || hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private isTransientError(error: Error): boolean {
    const transientErrorPatterns = [
      /network/i,
      /fetch/i,
      /timeout/i,
      /connection/i,
      /temporary/i
    ];

    return transientErrorPatterns.some(pattern =>
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  private scheduleReset(delay: number) {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };

  private retryHandler = () => {
    this.resetErrorBoundary();
  };

  private reportError = () => {
    const { error, errorInfo, eventId } = this.state;

    if (error && errorInfo) {
      // In a real app, this would send to error reporting service
      console.log('Reporting error:', { error, errorInfo, eventId });

      // Show user confirmation
      alert('Error reported. Thank you for helping us improve the application.');
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Something went wrong
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                We encountered an unexpected error. This has been logged and our team will investigate.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600">
                    Technical Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.retryHandler}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Try Again
              </button>

              <button
                onClick={this.reportError}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Report Issue
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Reload Page
              </button>
            </div>

            {this.state.eventId && (
              <div className="mt-4 text-center text-xs text-gray-400">
                Error ID: {this.state.eventId}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeErrorBoundary;