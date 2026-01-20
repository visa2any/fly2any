/**
 * Chunk Error Handler
 * Handles chunk loading failures with retry logic and cache clearing
 */

export interface ChunkLoadError extends Error {
  code: 'CHUNK_LOAD_ERROR';
  chunkId: string;
}

/**
 * Check if an error is a chunk load error
 */
export function isChunkLoadError(error: unknown): error is ChunkLoadError {
  if (!(error instanceof Error)) return false;

  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();

  return (
    errorMessage.includes('loading chunk') ||
    errorMessage.includes('failed to fetch dynamically imported module') ||
    errorMessage.includes('importing a module script failed') ||
    errorName === 'chunkloaderror' ||
    errorName.includes('chunk')
  );
}

/**
 * Extract chunk ID from error message
 */
export function getChunkId(error: Error): string | null {
  const match = error.message.match(/chunk\s*(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Clear service worker cache to force fresh chunk loading
 */
export async function clearServiceWorkerCache(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => caches.delete(cacheName))
    );
    console.log('[ChunkErrorHandler] Service worker cache cleared');
  } catch (error) {
    console.warn('[ChunkErrorHandler] Failed to clear cache:', error);
  }
}

/**
 * Reload the page with cache busting
 */
export function forceReload(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.set('t', Date.now().toString());
  window.location.href = url.toString();
}

/**
 * Reload page with chunk error handling
 */
export function handleChunkLoadError(error: Error): void {
  console.error('[ChunkErrorHandler] Chunk load error:', error);

  const chunkId = getChunkId(error);

  // Clear cache and reload
  clearServiceWorkerCache()
    .then(() => {
      // Small delay to allow cache to clear
      setTimeout(() => {
        forceReload();
      }, 100);
    })
    .catch(() => {
      // If cache clear fails, still reload
      forceReload();
    });
}

/**
 * Create a wrapped dynamic import with error handling
 */
export function createDynamicImportWithRetry<T>(
  importFn: () => Promise<{ default: T }>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: Error) => void;
  } = {}
): () => Promise<{ default: T }> {
  const { maxRetries = 3, retryDelay = 1000, onError } = options;

  return async () => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (isChunkLoadError(lastError)) {
          console.warn(
            `[ChunkErrorHandler] Chunk load failed (attempt ${attempt}/${maxRetries}):`,
            lastError.message
          );

          // Clear cache on first attempt
          if (attempt === 1) {
            await clearServiceWorkerCache();
          }

          // If not the last attempt, wait and retry
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
        }

        // Non-chunk error or final retry failed
        break;
      }
    }

    // All retries failed or non-chunk error
    onError?.(lastError!);

    if (isChunkLoadError(lastError!)) {
      handleChunkLoadError(lastError!);
    }

    throw lastError!;
  };
}
