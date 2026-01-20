'use client';

/**
 * Global Error Boundary
 * Production-ready React Error Boundary for Next.js App Router
 *
 * Features:
 * - Catches render, lifecycle, and hook errors
 * - Auto-reset on route change
 * - Suspense/lazy chunk support
 * - Premium fallback UI
 * - SSR-safe
 */

import React, { Component, ReactNode, Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { handleError, normalizeError } from '@/lib/error/errorHandler';
import { attachErrorListeners } from '@/lib/error/errorListeners';
import { NormalizedError, isChunkLoadError, isHydrationError } from '@/lib/error/errorTypes';
import { ErrorFallbackUI } from './ErrorFallbackUI';
import { LoadingSpinner } from './LoadingSpinner';
import { clearServiceWorkerCache } from '@/lib/error/chunkErrorHandler';

// ============================================
// PROPS
// ============================================
interface GlobalErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: NormalizedError) => void;
  suspenseFallback?: ReactNode;
}

// ============================================
// STATE
// ============================================
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  normalizedError: NormalizedError | null;
  isChunkError: boolean;
  isHydrationError: boolean;
}

// ============================================
// ROUTE RESET HOOK
// ============================================
function useRouteChangeReset(onReset: () => void): void {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onReset();
    }
  }, [pathname, onReset]);
}

// ============================================
// ERROR LISTENER HOOK
// ============================================
function useErrorListeners(): void {
  useEffect(() => {
    const cleanup = attachErrorListeners();
    return cleanup;
  }, []);
}

// ============================================
// INNER BOUNDARY (CLASS COMPONENT)
// ============================================
class ErrorBoundaryCore extends Component<
  GlobalErrorBoundaryProps & { resetKey: number },
  State
> {
  constructor(props: GlobalErrorBoundaryProps & { resetKey: number }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      normalizedError: null,
      isChunkError: false,
      isHydrationError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      isChunkError: isChunkLoadError(error),
      isHydrationError: isHydrationError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const normalizedError = normalizeError(error, {
      componentStack: errorInfo.componentStack || undefined,
      context: 'react-error-boundary',
    });

    // For chunk errors, clear cache immediately
    if (isChunkLoadError(error)) {
      clearServiceWorkerCache().catch(console.warn);
    }

    // Dispatch to central handler
    handleError(error, {
      componentStack: errorInfo.componentStack || undefined,
      context: 'react-error-boundary',
    });

    this.setState({
      errorInfo,
      normalizedError,
    });

    // Notify parent
    this.props.onError?.(normalizedError);
  }

  componentDidUpdate(prevProps: GlobalErrorBoundaryProps & { resetKey: number }): void {
    // Auto-reset when resetKey changes (route change)
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      normalizedError: null,
      isChunkError: false,
      isHydrationError: false,
    });
  };

  handleRetry = (): void => {
    this.reset();
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      // Clear service worker cache for chunk errors
      if (this.state.isChunkError && 'caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      window.location.reload();
    }
  };

  handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render(): ReactNode {
    const { hasError, error, normalizedError, isChunkError, isHydrationError } = this.state;
    const { children, fallback, suspenseFallback } = this.props;

    if (hasError) {
      // Custom fallback
      if (fallback) {
        return <>{fallback}</>;
      }

      // For hydration errors, automatically retry after a short delay
      // This helps with temporary hydration mismatches
      if (isHydrationError) {
        setTimeout(() => {
          this.handleRetry();
        }, 100);
      }

      // Default fallback UI
      return (
        <ErrorFallbackUI
          error={error}
          errorId={normalizedError?.fingerprint || null}
          isChunkError={isChunkError}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    // Wrap children with Suspense for lazy/chunk support
    return (
      <Suspense fallback={suspenseFallback || <LoadingSpinner />}>
        {children}
      </Suspense>
    );
  }
}

// ============================================
// WRAPPER WITH HOOKS
// ============================================
export function GlobalErrorBoundary(props: GlobalErrorBoundaryProps): JSX.Element {
  const [resetKey, setResetKey] = useState(0);

  // Attach global listeners
  useErrorListeners();

  // Reset on route change
  const handleRouteChange = useCallback(() => {
    setResetKey((k) => k + 1);
  }, []);

  useRouteChangeReset(handleRouteChange);

  return <ErrorBoundaryCore {...props} resetKey={resetKey} />;
}

export default GlobalErrorBoundary;
