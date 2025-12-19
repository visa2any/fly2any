'use client';

/**
 * app/global-error.tsx
 * Next.js Global Error Boundary
 *
 * Catches errors in the ROOT layout.
 * Last resort fallback - must include own <html> and <body>.
 * Uses inline styles (CSS may not be loaded).
 */

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps): JSX.Element {
  useEffect(() => {
    // Log critical error
    console.error('[CRITICAL] Global Error:', error);

    // Send to Sentry if available
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      Sentry.captureException(error, {
        level: 'fatal',
        tags: { boundary: 'global-error' },
      });
    }
  }, [error]);

  const handleRetry = (): void => {
    reset();
  };

  const handleReload = (): void => {
    window.location.reload();
  };

  const handleGoHome = (): void => {
    window.location.href = '/';
  };

  return (
    <html lang="en">
      <head>
        <title>Error | Fly2Any</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.content}>
            {/* Icon */}
            <div style={styles.iconWrapper}>
              <svg
                style={styles.icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="#DC2626"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 style={styles.title}>Something went wrong</h1>

            {/* Description */}
            <p style={styles.description}>
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>

            {/* Actions */}
            <div style={styles.actions}>
              <button onClick={handleRetry} style={styles.primaryButton}>
                Try again
              </button>
              <button onClick={handleGoHome} style={styles.secondaryButton}>
                Go home
              </button>
            </div>

            {/* Error reference */}
            {error.digest && (
              <p style={styles.errorId}>Reference: {error.digest}</p>
            )}

            {/* Support */}
            <p style={styles.support}>
              Need help?{' '}
              <a href="mailto:support@fly2any.com" style={styles.link}>
                Contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

// ============================================
// INLINE STYLES (CSS may not be loaded)
// ============================================
const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#F9FAFB',
    minHeight: '100vh',
  },
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  content: {
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    margin: '0 auto 24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '40px',
    height: '40px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 12px',
  },
  description: {
    fontSize: '16px',
    color: '#6B7280',
    margin: '0 0 32px',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#FFFFFF',
    backgroundColor: '#111827',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#F3F4F6',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  errorId: {
    marginTop: '32px',
    fontSize: '12px',
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  support: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#6B7280',
  },
  link: {
    color: '#374151',
    textDecoration: 'underline',
  },
};
