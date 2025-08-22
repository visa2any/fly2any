'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryState>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  retryCount: number;
  props?: any;
  state?: any;
}

class ErrorBoundary extends Component<Props, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    this.logError(error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when specified props change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => prevProps.resetKeys?.[index] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  logError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport: ErrorReport = {
        errorId: this.state.errorId || `error_${Date.now()}`,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack || '',
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        retryCount: this.state.retryCount,
        props: this.props,
        state: this.state
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚨 Error Boundary Caught Error: ${errorReport.errorId}`);
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Full Report:', errorReport);
        console.groupEnd();
      }

      // Send to logging service
      await this.sendErrorReport(errorReport);

    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  sendErrorReport = async (errorReport: ErrorReport) => {
    try {
      // Send to your error tracking service (e.g., Sentry, LogRocket, etc.)
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });
    } catch (error) {
      console.error('Failed to send error report:', error);
      
      // Fallback: store in localStorage for later retry
      try {
        const storedErrors = JSON.parse(localStorage.getItem('pendingErrorReports') || '[]');
        storedErrors.push(errorReport);
        localStorage.setItem('pendingErrorReports', JSON.stringify(storedErrors.slice(-10))); // Keep last 10
      } catch (storageError) {
        console.error('Failed to store error report:', storageError);
      }
    }
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: this.state.retryCount + 1
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  reportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const subject = `Bug Report: ${error?.message || 'Unknown Error'}`;
    const body = `
Error ID: ${errorId}
Error Message: ${error?.message}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}

Please describe what you were doing when this error occurred:
`;

    const mailtoUrl = `mailto:support@fly2any.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const { children, fallback: FallbackComponent, showErrorDetails = false } = this.props;

    if (hasError) {
      // Render custom fallback UI if provided
      if (FallbackComponent) {
        return <FallbackComponent {...this.state} />;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Oops! Algo deu errado
              </h1>
              <p className="text-gray-600">
                Encontramos um erro inesperado. Nossa equipe foi notificada automaticamente.
              </p>
            </div>

            {/* Error ID */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm">
                <span className="font-medium text-gray-700">ID do Erro:</span>
                <span className="ml-2 font-mono text-gray-900 text-xs">{errorId}</span>
              </div>
              {retryCount > 0 && (
                <div className="text-sm mt-1">
                  <span className="font-medium text-gray-700">Tentativas:</span>
                  <span className="ml-2 text-gray-900">{retryCount}</span>
                </div>
              )}
            </div>

            {/* Error Details (Development only or when explicitly enabled) */}
            {(process.env.NODE_ENV === 'development' || showErrorDetails) && error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Detalhes Técnicos
                </summary>
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm">
                    <div className="font-medium text-red-800 mb-2">Mensagem:</div>
                    <div className="text-red-700 mb-4 font-mono text-xs">{error.message}</div>
                    
                    {error.stack && (
                      <>
                        <div className="font-medium text-red-800 mb-2">Stack Trace:</div>
                        <pre className="text-red-700 text-xs overflow-x-auto bg-red-100 p-2 rounded border">
                          {error.stack}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Início
                </button>

                <button
                  onClick={this.reportBug}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Reportar Bug
                </button>
              </div>

              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Recarregar Página
              </button>
            </div>

            {/* Contact Support */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Precisa de ajuda? Entre em contato conosco:
              </p>
              <a
                href="mailto:support@fly2any.com"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Mail className="w-4 h-4 mr-1" />
                support@fly2any.com
              </a>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<T extends {}>(
  Component: React.ComponentType<T>,
  errorBoundaryConfig?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for error reporting
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    // Log error
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);

    // Send to error tracking
    const errorReport: Partial<ErrorReport> = {
      errorId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      retryCount: 0
    };

    // Send to logging service
    fetch('/api/monitoring/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport),
    }).catch(reportError => {
      console.error('Failed to report error:', reportError);
    });
  };

  return { handleError };
}

export default ErrorBoundary;