/**
 * Request Deduplication System
 *
 * Problem: Multiple users searching for the same route simultaneously
 * Example: 5 users search JFK→LAX at 10:00 AM
 * Without deduplication: 10 API calls (2 per user × 5 users)
 * With deduplication: 2 API calls (shared result)
 * Savings: 80% API call reduction on concurrent searches
 *
 * How it works:
 * 1. Hash search parameters to create unique key
 * 2. Check if there's a pending request for that key
 * 3. If yes: Wait for existing request to complete
 * 4. If no: Execute request and cache the promise
 * 5. Clear cache after 5 seconds to prevent stale data
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
  requesters: number; // Track how many are waiting
}

export class RequestDeduplicator {
  private pending: Map<string, PendingRequest<any>>;
  private stats: {
    totalRequests: number;
    dedupedRequests: number;
    apiCallsSaved: number;
  };

  constructor() {
    this.pending = new Map();
    this.stats = {
      totalRequests: 0,
      dedupedRequests: 0,
      apiCallsSaved: 0,
    };
  }

  /**
   * Create unique hash from search parameters
   */
  private createKey(params: Record<string, any>): string {
    // Sort keys for consistent hashing
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    return JSON.stringify(sorted);
  }

  /**
   * Deduplicate request execution
   *
   * @param key Unique identifier for the request (usually search params)
   * @param executor Function that executes the actual API call
   * @returns Promise with the result
   */
  async deduplicate<T>(
    params: Record<string, any>,
    executor: () => Promise<T>
  ): Promise<{
    data: T;
    deduped: boolean;
    waiters: number;
  }> {
    const key = this.createKey(params);
    this.stats.totalRequests++;

    // Check if there's already a pending request
    const existing = this.pending.get(key);

    if (existing) {
      // Request already in progress - wait for it
      console.log(`🔄 Request deduplication: Reusing pending request for ${key.substring(0, 50)}...`);

      existing.requesters++;
      this.stats.dedupedRequests++;
      this.stats.apiCallsSaved++;

      try {
        const data = await existing.promise;
        return {
          data,
          deduped: true,
          waiters: existing.requesters,
        };
      } catch (error) {
        // If the original request failed, remove from cache and rethrow
        this.pending.delete(key);
        throw error;
      }
    }

    // No pending request - execute new one
    console.log(`🚀 Executing new request for ${key.substring(0, 50)}...`);

    const promise = executor();

    // Cache the promise
    this.pending.set(key, {
      promise,
      timestamp: Date.now(),
      requesters: 1,
    });

    try {
      const data = await promise;

      // Remove from pending after completion
      setTimeout(() => {
        const pendingReq = this.pending.get(key);
        if (pendingReq && Date.now() - pendingReq.timestamp > 5000) {
          this.pending.delete(key);
          console.log(`🧹 Cleaned up deduplication cache for ${key.substring(0, 50)}...`);
        }
      }, 5000); // Clear after 5 seconds

      return {
        data,
        deduped: false,
        waiters: 1,
      };
    } catch (error) {
      // Remove from cache on error
      this.pending.delete(key);
      throw error;
    }
  }

  /**
   * Get deduplication statistics
   */
  getStats() {
    return {
      ...this.stats,
      savingsRate: this.stats.totalRequests > 0
        ? Math.round((this.stats.dedupedRequests / this.stats.totalRequests) * 100)
        : 0,
      pendingRequests: this.pending.size,
    };
  }

  /**
   * Reset statistics (useful for testing)
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      dedupedRequests: 0,
      apiCallsSaved: 0,
    };
  }

  /**
   * Clear all pending requests (useful for testing)
   */
  clearPending() {
    this.pending.clear();
  }

  /**
   * Log current statistics (for debugging)
   */
  logStats() {
    const stats = this.getStats();
    console.log('📊 Request Deduplication Stats:', {
      totalRequests: stats.totalRequests,
      dedupedRequests: stats.dedupedRequests,
      apiCallsSaved: stats.apiCallsSaved,
      savingsRate: `${stats.savingsRate}%`,
      pendingRequests: stats.pendingRequests,
    });
  }
}

// Singleton instance
export const requestDeduplicator = new RequestDeduplicator();

// Log stats every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    requestDeduplicator.logStats();
  }, 5 * 60 * 1000);
}
