'use client';

/**
 * app/error.tsx
 * Next.js App Router Error Boundary
 *
 * Catches errors in route segments and their children.
 * Automatically wraps each route segment.
 */

import { useEffect } from 'react';
import { handleError } from '@/lib/error/errorHandler';
import { ErrorFallbackUI } from '@/components/error/ErrorFallbackUI';
import { generateFingerprint } from '@/lib/error/errorHandler';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps): JSX.Element {
  const fingerprint = generateFingerprint(error);

  useEffect(() => {
    // Log to central error handler
    handleError(error, {
      context: 'next-error-boundary',
      metadata: {
        digest: error.digest,
      },
    });
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
    <ErrorFallbackUI
      error={error}
      errorId={error.digest || fingerprint}
      isChunkError={false}
      onRetry={handleRetry}
      onReload={handleReload}
      onGoHome={handleGoHome}
    />
  );
}
