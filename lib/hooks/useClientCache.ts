/**
 * useClientCache Hook
 *
 * React hook for fetching data with client-side caching and UX features:
 * - Automatic caching with configurable TTL
 * - Loading states
 * - Error handling
 * - Manual refresh capability
 * - Cache age display
 * - Cache statistics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchWithClientCache,
  getCacheAge,
  getTimeUntilExpiry,
  formatCacheAge,
  clearClientCacheByPattern,
  getClientCacheStats,
  type CachedData,
} from '@/lib/utils/client-cache';

export interface UseClientCacheOptions {
  /**
   * Time to live in seconds
   * @default 900 (15 minutes)
   */
  ttl?: number;

  /**
   * Enable automatic refresh when data is stale
   * @default false
   */
  autoRefresh?: boolean;

  /**
   * Callback when data is loaded
   */
  onLoad?: (data: any, fromCache: boolean) => void;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void;
}

export interface UseClientCacheReturn<T> {
  /** The cached/fetched data */
  data: T | null;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: Error | null;

  /** Whether data is from cache */
  fromCache: boolean;

  /** Cache age in seconds (null if not cached) */
  cacheAge: number | null;

  /** Time until cache expires in seconds (null if not cached) */
  timeUntilExpiry: number | null;

  /** Human-readable cache age */
  cacheAgeFormatted: string | null;

  /** Manual refresh function */
  refresh: () => Promise<void>;

  /** Clear cache for this URL */
  clearCache: () => void;
}

/**
 * Fetch data with client-side caching and UX features
 *
 * @example
 * ```tsx
 * function FlashDeals() {
 *   const { data, loading, cacheAge, refresh } = useClientCache<DealsData>(
 *     '/api/flights/flash-deals-enhanced',
 *     { ttl: 900 }
 *   );
 *
 *   return (
 *     <div>
 *       {loading && <LoadingSpinner />}
 *       {data && <DealsList deals={data.deals} />}
 *       {cacheAge && <CacheIndicator age={cacheAge} onRefresh={refresh} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useClientCache<T = any>(
  url: string | null,
  options: UseClientCacheOptions = {}
): UseClientCacheReturn<T> {
  const {
    ttl = 900,
    autoRefresh = false,
    onLoad,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  // ✅ FIX: Use refs for callbacks to avoid dependency issues
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onLoadRef.current = onLoad;
    onErrorRef.current = onError;
  }, [onLoad, onError]);

  /**
   * Fetch data (with or without cache)
   */
  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const startTime = Date.now();
      const result = await fetchWithClientCache<T>(url, {}, ttl, forceRefresh);
      const fetchTime = Date.now() - startTime;

      const wasFromCache = fetchTime < 100; // If < 100ms, likely from cache

      setData(result);
      setFromCache(wasFromCache && !forceRefresh);

      // Update cache info
      if (!forceRefresh) {
        setCacheAge(getCacheAge(url));
        setTimeUntilExpiry(getTimeUntilExpiry(url));
      } else {
        setCacheAge(0);
        setTimeUntilExpiry(ttl);
      }

      if (onLoadRef.current) {
        onLoadRef.current(result, wasFromCache && !forceRefresh);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);

      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    } finally {
      setLoading(false);
    }
  }, [url, ttl]);

  /**
   * Manual refresh (bypass cache)
   */
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * Clear cache for this URL
   */
  const clearCache = useCallback(() => {
    if (url) {
      clearClientCacheByPattern(url);
      setCacheAge(null);
      setTimeUntilExpiry(null);
      setFromCache(false);
    }
  }, [url]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  /**
   * Auto-refresh when data becomes stale
   */
  useEffect(() => {
    if (!autoRefresh || !url || timeUntilExpiry === null) return;

    if (timeUntilExpiry <= 0) {
      fetchData(true);
    }
  }, [autoRefresh, url, timeUntilExpiry, fetchData]);

  /**
   * Update cache age every 10 seconds
   */
  useEffect(() => {
    if (!url) return;

    const interval = setInterval(() => {
      const age = getCacheAge(url);
      const expiry = getTimeUntilExpiry(url);

      setCacheAge(age);
      setTimeUntilExpiry(expiry);

      // Auto-refresh if enabled and expired
      if (autoRefresh && expiry !== null && expiry <= 0) {
        fetchData(true);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [url, autoRefresh, fetchData]);

  // Format cache age
  const cacheAgeFormatted = cacheAge !== null ? formatCacheAge(cacheAge) : null;

  return {
    data,
    loading,
    error,
    fromCache,
    cacheAge,
    timeUntilExpiry,
    cacheAgeFormatted,
    refresh,
    clearCache,
  };
}

/**
 * Hook for cache statistics
 */
export function useCacheStats() {
  const [stats, setStats] = useState(getClientCacheStats());

  useEffect(() => {
    // Update stats every 5 seconds
    const interval = setInterval(() => {
      setStats(getClientCacheStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}
