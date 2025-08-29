'use client';

/**
 * 🛡️ ENTERPRISE ERROR BOUNDARY COMPONENT
 * Advanced error handling with monitoring integration
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolateErrors?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: this.generateErrorId() 
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorData = {
      error,
      errorInfo,
      errorId: this.state.errorId,
      level: this.props.level || 'component',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      retryCount: this.retryCount
    };

    // Enhanced logging for different environments
    if (process.env.NODE_ENV === 'production') {
      // Production: Send to monitoring service
      console.error('🚨 ErrorBoundary [PROD]:', {
        message: error.message,
        stack: error.stack,
        errorId: this.state.errorId,
        level: this.props.level,
        componentStack: errorInfo.componentStack 
          ? errorInfo.componentStack.split('\n').slice(0, 5).join('\n') // First 5 lines only for privacy
          : 'Component stack not available'
      });
      
      // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
      // this.sendToMonitoringService(errorData);
      
    } else {
      // Development: Detailed logging
      console.group('🚨 ErrorBoundary caught an error');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack || 'Component stack not available');
      console.error('Error Boundary Level:', this.props.level);
      console.error('Error ID:', this.state.errorId);
      console.error('Retry Count:', this.retryCount);
      console.groupEnd();
    }

    this.setState({ error, errorInfo });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    if (this.retryCount >= this.maxRetries) {
      console.warn('Max retry attempts reached for ErrorBoundary');
      return;
    }

    this.retryCount++;
    console.log(`🔄 Retrying component (attempt ${this.retryCount}/${this.maxRetries})`);
    
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: this.generateErrorId()
    });
  };

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private renderErrorUI(): ReactNode {
    const { level = 'component' } = this.props;
    const isPageLevel = level === 'page';
    const isCritical = level === 'critical';

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className={`
        flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg
        ${isPageLevel ? 'min-h-screen' : 'min-h-[300px]'}
        ${isCritical ? 'border-2 border-red-300' : 'border border-red-200'}
      `}>
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full text-center">
          <div className={`text-6xl mb-4 ${isCritical ? 'text-red-600' : 'text-orange-500'}`}>
            {isCritical ? '🔥' : '⚠️'}
          </div>
          
          <h2 className={`text-xl font-bold mb-3 ${isCritical ? 'text-red-800' : 'text-gray-800'}`}>
            {isCritical ? 'Critical Error' : 'Something went wrong'}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {isCritical 
              ? 'A critical error occurred. Please contact support if this persists.'
              : 'We encountered an error while loading this section. You can try again or continue browsing.'
            }
          </p>

          {/* Development debugging info */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left">
              <details>
                <summary className="font-semibold text-red-800 cursor-pointer text-sm">
                  🐛 Debug Info (Dev Only)
                </summary>
                <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            {this.retryCount < this.maxRetries && (
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                Try Again ({this.maxRetries - this.retryCount} left)
              </button>
            )}
            
            {isPageLevel && (
              <button
                onClick={this.handleReload}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Reload Page
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400 font-mono">
            Error ID: {this.state.errorId.slice(-8)}
          </div>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Partial<ErrorBoundaryProps> = {}
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for async error handling in functional components
export function useAsyncError() {
  const [, setError] = React.useState<Error>();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

export default ErrorBoundary;