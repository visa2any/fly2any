'use client';

/**
 * GlobalErrorBoundary - Production-Ready Error Handling
 *
 * Features:
 * - Auto-reset on route change
 * - Error fingerprint generation
 * - Graceful recovery (no full reload)
 * - Suspense/lazy chunk support
 * - Silent production reporting
 * - Mobile + Desktop responsive UI
 */

import React, { Component, ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { logError } from '@/lib/errorLogger';

// ============================================
// ERROR FINGERPRINT GENERATOR
// ============================================
function generateErrorFingerprint(error: Error): string {
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(36);
  };

  const fingerprint = `${error.name}-${error.message}-${error.stack?.split('\n')[1] || ''}`;
  return `ERR-${hash(fingerprint).toUpperCase().slice(0, 8)}`;
}

// ============================================
// CHUNK LOAD ERROR DETECTOR
// ============================================
function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  );
}

// ============================================
// TYPES
// ============================================
interface GlobalErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo, fingerprint: string) => void;
  silentInProduction?: boolean;
  suspenseFallback?: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  fingerprint: string | null;
  isChunkError: boolean;
  retryCount: number;
}

// ============================================
// ROUTE CHANGE RESET WRAPPER
// ============================================
function RouteChangeReset({
  children,
  onRouteChange
}: {
  children: ReactNode;
  onRouteChange: () => void;
}) {
  const pathname = usePathname();
  const prevPathname = React.useRef(pathname);

  React.useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onRouteChange();
    }
  }, [pathname, onRouteChange]);

  return <>{children}</>;
}

// ============================================
// MAIN ERROR BOUNDARY
// ============================================
class ErrorBoundaryInner extends Component<
  GlobalErrorBoundaryProps & { resetKey: number },
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps & { resetKey: number }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      fingerprint: null,
      isChunkError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    const fingerprint = generateErrorFingerprint(error);
    const isChunkError = isChunkLoadError(error);

    return {
      hasError: true,
      error,
      fingerprint,
      isChunkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { fingerprint } = this.state;
    const { onError, silentInProduction = true } = this.props;
    const isProd = process.env.NODE_ENV === 'production';

    // Log to monitoring
    logError(error, {
      componentStack: errorInfo.componentStack || undefined,
      fingerprint: fingerprint || undefined,
      context: 'global-error-boundary',
    });

    // Update state
    this.setState({ errorInfo });

    // Custom handler
    if (onError && fingerprint) {
      onError(error, errorInfo, fingerprint);
    }

    // Console logging (dev only or if not silent)
    if (!isProd || !silentInProduction) {
      console.error('[GlobalErrorBoundary]', error);
      console.error('Fingerprint:', fingerprint);
    }
  }

  componentDidUpdate(prevProps: GlobalErrorBoundaryProps & { resetKey: number }) {
    // Auto-reset when resetKey changes (route change)
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.handleReset();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      fingerprint: null,
      isChunkError: false,
      retryCount: 0,
    });
  };

  handleRetry = () => {
    const { isChunkError, retryCount } = this.state;

    // For chunk errors, try reloading the failed chunk
    if (isChunkError && retryCount < 2) {
      this.setState(
        { hasError: false, retryCount: retryCount + 1 },
        () => {
          // Force re-render to retry chunk load
          this.forceUpdate();
        }
      );
    } else {
      this.handleReset();
    }
  };

  handleHardRefresh = () => {
    // Clear cache and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  };

  render() {
    const { hasError, error, fingerprint, isChunkError } = this.state;
    const { children, fallback, suspenseFallback } = this.props;

    if (hasError) {
      if (fallback) return <>{fallback}</>;

      return (
        <ErrorFallbackUI
          error={error}
          fingerprint={fingerprint}
          isChunkError={isChunkError}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          onHardRefresh={this.handleHardRefresh}
        />
      );
    }

    // Wrap with Suspense for lazy chunk support
    return (
      <Suspense fallback={suspenseFallback || <DefaultSuspenseFallback />}>
        {children}
      </Suspense>
    );
  }
}

// ============================================
// EXPORTED WRAPPER WITH ROUTE RESET
// ============================================
export function GlobalErrorBoundary(props: GlobalErrorBoundaryProps) {
  const [resetKey, setResetKey] = React.useState(0);

  const handleRouteChange = React.useCallback(() => {
    setResetKey(k => k + 1);
  }, []);

  return (
    <ErrorBoundaryInner {...props} resetKey={resetKey}>
      <RouteChangeReset onRouteChange={handleRouteChange}>
        {props.children}
      </RouteChangeReset>
    </ErrorBoundaryInner>
  );
}

// ============================================
// DEFAULT SUSPENSE FALLBACK
// ============================================
function DefaultSuspenseFallback() {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E74035] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ============================================
// ERROR FALLBACK UI (MOBILE + DESKTOP)
// ============================================
function ErrorFallbackUI({
  error,
  fingerprint,
  isChunkError,
  onRetry,
  onReset,
  onHardRefresh,
}: {
  error: Error | null;
  fingerprint: string | null;
  isChunkError: boolean;
  onRetry: () => void;
  onReset: () => void;
  onHardRefresh: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-red-100 flex items-center justify-center">
          {isChunkError ? (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
          {isChunkError ? 'Update Available' : 'Something went wrong'}
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
          {isChunkError
            ? 'A new version is available. Please refresh to get the latest updates.'
            : 'We apologize for the inconvenience. Please try again.'}
        </p>

        {/* Fingerprint */}
        {fingerprint && (
          <p className="text-xs text-gray-400 mb-4 sm:mb-6 font-mono">
            Ref: {fingerprint}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
          <button
            onClick={isChunkError ? onHardRefresh : onRetry}
            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#E74035] text-white font-semibold rounded-lg hover:bg-[#D63930] active:scale-[0.98] transition-all text-sm sm:text-base"
          >
            {isChunkError ? 'Refresh Now' : 'Try Again'}
          </button>
          {!isChunkError && (
            <button
              onClick={() => window.location.href = '/'}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all text-sm sm:text-base"
            >
              Go Home
            </button>
          )}
        </div>

        {/* Support */}
        <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
          Need help?{' '}
          <a href="mailto:support@fly2any.com" className="text-[#E74035] hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default GlobalErrorBoundary;
