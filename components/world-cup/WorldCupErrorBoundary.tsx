'use client';

/**
 * ERROR BOUNDARY FOR WORLD CUP COMPONENTS
 *
 * Production-grade error handling with:
 * - Graceful fallback UI
 * - Error logging to analytics
 * - Recovery mechanisms
 * - User-friendly error messages
 */

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class WorldCupErrorBoundary extends Component<Props, State> {
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

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('World Cup Component Error:', error, errorInfo);

    // Log to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `World Cup Error: ${error.message}`,
        fatal: false,
        component: errorInfo.componentStack,
      });
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 flex items-center justify-center">
          <div className="max-w-md text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-600 font-medium">
                We encountered an issue loading the World Cup content. Don't worry, we're on it!
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Again
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all"
              >
                <Home className="w-5 h-5" />
                Go Home
              </a>
            </div>

            {/* Support Link */}
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <a
                href="/contact"
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withWorldCupErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <WorldCupErrorBoundary fallback={fallback}>
        <Component {...props} />
      </WorldCupErrorBoundary>
    );
  };
}
