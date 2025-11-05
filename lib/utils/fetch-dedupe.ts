/**
 * Request Deduplication Utility
 * Prevents duplicate concurrent requests to the same URL
 * Returns cloned Response objects so multiple consumers can read the body
 */

interface PendingRequest {
  promise: Promise<Response>;
  timestamp: number;
  originalResponse: Response | null;
}

const pendingRequests = new Map<string, PendingRequest>();
const DEDUPE_WINDOW_MS = 100; // Deduplicate requests within 100ms of each other

/**
 * Fetch with automatic deduplication of concurrent requests
 * If multiple requests to the same URL happen within 100ms, they share the same promise
 * Each caller gets a cloned Response so they can independently read the body
 */
export async function fetchWithDedupe(url: string, options?: RequestInit): Promise<Response> {
  const cacheKey = `${url}${JSON.stringify(options || {})}`;
  const now = Date.now();

  // Check if there's a pending request for this URL
  const pending = pendingRequests.get(cacheKey);
  if (pending && (now - pending.timestamp) < DEDUPE_WINDOW_MS) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Deduped request: ${url.substring(0, 80)}...`);
    }

    // Wait for the original request to complete
    const originalResponse = await pending.promise;

    // CRITICAL FIX: Return a cloned response so the body can be read independently
    return originalResponse.clone();
  }

  // Create new request
  const promise = fetch(url, options).then(response => {
    // Store the original response for cloning
    const entry = pendingRequests.get(cacheKey);
    if (entry) {
      entry.originalResponse = response;
    }
    return response;
  });

  // Store in pending requests
  pendingRequests.set(cacheKey, {
    promise,
    timestamp: now,
    originalResponse: null,
  });

  // Clean up after request completes
  promise
    .finally(() => {
      // Remove from pending after a short delay (to allow other components to join)
      setTimeout(() => {
        const current = pendingRequests.get(cacheKey);
        if (current && current.timestamp === now) {
          pendingRequests.delete(cacheKey);
        }
      }, DEDUPE_WINDOW_MS);
    });

  return promise;
}

/**
 * Clear all pending requests (useful for testing)
 */
export function clearPendingRequests() {
  pendingRequests.clear();
}

/**
 * Get count of pending requests (useful for debugging)
 */
export function getPendingRequestsCount(): number {
  return pendingRequests.size;
}
