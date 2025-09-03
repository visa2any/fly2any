/**
 * ULTRATHINK ENTERPRISE - Advanced Hydration Error Boundary
 * 
 * This component provides enterprise-grade error boundaries specifically
 * designed to handle hydration mismatches and other SSR/CSR issues.
 * 
 * Features:
 * - Specialized hydration error detection and recovery
 * - Graceful fallback rendering during hydration errors
 * - Comprehensive error logging and monitoring
 * - Automatic retry mechanisms for transient issues
 * - Development mode debugging assistance
 * - Production-ready error tracking integration
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface HydrationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isHydrationError: boolean;
  retryCount: number;
  lastErrorTime: number;
}

interface HydrationErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error, errorInfo: ErrorInfo, isHydrationError: boolean) => void;
  enableLogging?: boolean;
  showDevHelp?: boolean;
}

class HydrationErrorBoundary extends Component<
  HydrationErrorBoundaryProps,
  HydrationErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: HydrationErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isHydrationError: false,
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<HydrationErrorBoundaryState> {
    const isHydrationError = HydrationErrorBoundary.isHydrationRelatedError(error);
    
    return {
      hasError: true,
      error,
      isHydrationError,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableLogging = true } = this.props;
    const isHydrationError = HydrationErrorBoundary.isHydrationRelatedError(error);
    
    this.setState({
      errorInfo,
      isHydrationError
    });

    // Log error for debugging
    if (enableLogging) {
      this.logError(error, errorInfo, isHydrationError);
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, isHydrationError);
    }

    // Enhanced enterprise logging for RSC-compliant architecture
    console.error('ULTRATHINK Enterprise: Hydration error captured', {
      error: error.message,
      isHydrationError,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : 'No stack trace'
    });

    // Attempt automatic retry for hydration errors
    if (isHydrationError && this.shouldRetry()) {
      this.scheduleRetry();
    }
  }

  private static isHydrationRelatedError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    const hydrationKeywords = [
      'hydration',
      'hydrate',
      'server-side',
      'client-side',
      'mismatch',
      'rendered on the server',
      'rendered on the client',
      'react-dom-client',
      'hydrateroot'
    ];

    return hydrationKeywords.some(keyword => 
      errorMessage.includes(keyword) || stack.includes(keyword)
    );
  }

  private shouldRetry(): boolean {
    const { maxRetries = 3 } = this.props;
    const { retryCount, lastErrorTime } = this.state;
    
    // Don't retry if exceeded max attempts
    if (retryCount >= maxRetries) {
      return false;
    }

    // Don't retry if errors are happening too frequently (< 1 second apart)
    const timeSinceLastError = Date.now() - lastErrorTime;
    if (timeSinceLastError < 1000) {
      return false;
    }

    return true;
  }

  private scheduleRetry = (): void => {
    const { retryDelay = 2000 } = this.props;
    
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        isHydrationError: false,
        retryCount: prevState.retryCount + 1
      }));
    }, retryDelay);
  };

  private logError(error: Error, errorInfo: ErrorInfo, isHydrationError: boolean): void {
    const logData = {
      timestamp: new Date().toISOString(),
      isHydrationError,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      retryCount: this.state.retryCount,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 HydrationErrorBoundary: Error Caught');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.info('Is Hydration Error:', isHydrationError);
      console.info('Retry Count:', this.state.retryCount);
      console.groupEnd();
    }

    // Structured logging for production monitoring
    if (typeof window !== 'undefined' && (window as any).__ENTERPRISE_ERROR_LOGGER__) {
      (window as any).__ENTERPRISE_ERROR_LOGGER__(logData);
    }
  }

  private renderFallback(): ReactNode {
    const { fallback, showDevHelp = process.env.NODE_ENV === 'development' } = this.props;
    const { error, isHydrationError, retryCount } = this.state;

    if (fallback) {
      return fallback;
    }

    return (
      <div style={{
        padding: '20px',
        margin: '20px',
        borderRadius: '8px',
        border: '2px solid #fca5a5',
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
          {isHydrationError ? '🔄 Hydration Error Detected' : '⚠️ Something Went Wrong'}
        </h3>
        
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' }}>
          {isHydrationError 
            ? 'A hydration mismatch occurred between server and client rendering. This is usually temporary and should resolve automatically.'
            : 'An unexpected error occurred while rendering this component.'
          }
        </p>

        {retryCount > 0 && (
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', opacity: 0.8 }}>
            Retry attempt: {retryCount}
          </p>
        )}

        {showDevHelp && error && (
          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
              🔧 Developer Information
            </summary>
            <pre style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {error.stack || error.message}
            </pre>
          </details>
        )}

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Reload Page
        </button>
      </div>
    );
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export default HydrationErrorBoundary;