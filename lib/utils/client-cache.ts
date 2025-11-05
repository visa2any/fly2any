/**
 * Client-Side Cache Utility
 *
 * Provides localStorage-based caching with UX safeguards:
 * - Instant 0ms response times on cache hits
 * - Automatic expiry based on TTL
 * - Smart storage management (auto-cleanup when full)
 * - Cache freshness indicators for user transparency
 * - Manual refresh capability
 *
 * UX Benefits:
 * - Page refresh: Instant load (no network call)
 * - Browser close/reopen: Instant load
 * - Navigation: Instant load
 * - Respects data freshness (configurable TTL)
 */

export interface CachedData<T> {
  data: T;
  cachedAt: number; // Timestamp when cached
  expiresAt: number; // Timestamp when expires
  ttl: number; // TTL in seconds
  url: string; // Original URL
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number; // Number of cached entries
  totalSize: string; // Human-readable storage size
}

const CLIENT_CACHE_PREFIX = 'fly2any_cache_';
const STATS_KEY = 'fly2any_cache_stats';

/**
 * Get cache statistics
 */
export function getClientCacheStats(): CacheStats {
  try {
    const stats = localStorage.getItem(STATS_KEY);
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (e) {
    console.warn('Failed to read cache stats:', e);
  }

  return {
    hits: 0,
    misses: 0,
    size: 0,
    totalSize: '0 KB',
  };
}

/**
 * Update cache statistics
 */
function updateCacheStats(type: 'hit' | 'miss') {
  try {
    const stats = getClientCacheStats();

    if (type === 'hit') {
      stats.hits++;
    } else {
      stats.misses++;
    }

    // Calculate size
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CLIENT_CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalBytes += value.length * 2; // UTF-16 uses 2 bytes per char
        }
      }
    }

    stats.size = countCacheEntries();
    stats.totalSize = formatBytes(totalBytes);

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    // Ignore stats update errors
  }
}

/**
 * Count number of cached entries
 */
function countCacheEntries(): number {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CLIENT_CACHE_PREFIX)) {
      count++;
    }
  }
  return count;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Generate cache key from URL
 */
function generateCacheKey(url: string): string {
  // Remove protocol and domain for shorter keys
  const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
  return `${CLIENT_CACHE_PREFIX}${cleanUrl}`;
}

/**
 * Check if cached data is still valid
 */
function isValid<T>(cached: CachedData<T>): boolean {
  return Date.now() < cached.expiresAt;
}

/**
 * Get from client cache
 */
export function getFromClientCache<T>(url: string): CachedData<T> | null {
  try {
    const cacheKey = generateCacheKey(url);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      updateCacheStats('miss');
      return null;
    }

    const parsed: CachedData<T> = JSON.parse(cached);

    // Check if expired
    if (!isValid(parsed)) {
      // Remove expired entry
      localStorage.removeItem(cacheKey);
      updateCacheStats('miss');

      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️  Client cache EXPIRED: ${url.substring(0, 60)}...`);
      }

      return null;
    }

    updateCacheStats('hit');

    if (process.env.NODE_ENV === 'development') {
      const age = Math.round((Date.now() - parsed.cachedAt) / 1000);
      console.log(`📦 Client cache HIT: ${url.substring(0, 60)}... (age: ${age}s)`);
    }

    return parsed;
  } catch (e) {
    console.warn('Client cache read error:', e);
    updateCacheStats('miss');
    return null;
  }
}

/**
 * Save to client cache
 */
export function saveToClientCache<T>(url: string, data: T, ttl: number): boolean {
  try {
    const cacheKey = generateCacheKey(url);
    const now = Date.now();

    const cached: CachedData<T> = {
      data,
      cachedAt: now,
      expiresAt: now + (ttl * 1000),
      ttl,
      url,
    };

    localStorage.setItem(cacheKey, JSON.stringify(cached));

    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 Client cache SAVE: ${url.substring(0, 60)}... (TTL: ${ttl}s)`);
    }

    return true;
  } catch (e) {
    // localStorage quota exceeded - clear expired entries and retry
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('localStorage full - clearing expired entries');
      clearExpiredClientCache();

      // Retry once
      try {
        const cacheKey = generateCacheKey(url);
        const now = Date.now();

        const cached: CachedData<T> = {
          data,
          cachedAt: now,
          expiresAt: now + (ttl * 1000),
          ttl,
          url,
        };

        localStorage.setItem(cacheKey, JSON.stringify(cached));
        return true;
      } catch (retryError) {
        console.error('Client cache save failed even after cleanup:', retryError);
        return false;
      }
    }

    console.error('Client cache save error:', e);
    return false;
  }
}

/**
 * Fetch with client-side cache
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param ttl - Time to live in seconds (default: 900 = 15 minutes)
 * @param forceRefresh - Skip cache and force fresh fetch
 */
export async function fetchWithClientCache<T = any>(
  url: string,
  options?: RequestInit,
  ttl: number = 900,
  forceRefresh: boolean = false
): Promise<T> {
  // Skip cache if force refresh
  if (!forceRefresh) {
    // Try client cache first
    const cached = getFromClientCache<T>(url);
    if (cached) {
      return cached.data;
    }
  }

  // Cache miss or force refresh - fetch from server
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Client cache ${forceRefresh ? 'FORCED REFRESH' : 'MISS'}: ${url.substring(0, 60)}...`);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: T = await response.json();

  // Save to client cache
  saveToClientCache(url, data, ttl);

  return data;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredClientCache(): number {
  let clearedCount = 0;
  const now = Date.now();

  try {
    const keysToRemove: string[] = [];

    // Find all expired entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CLIENT_CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed: CachedData<any> = JSON.parse(cached);
            if (now >= parsed.expiresAt) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          // Invalid entry - remove it
          keysToRemove.push(key);
        }
      }
    }

    // Remove expired entries
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      clearedCount++;
    });

    if (clearedCount > 0 && process.env.NODE_ENV === 'development') {
      console.log(`🗑️  Cleared ${clearedCount} expired cache entries`);
    }
  } catch (e) {
    console.error('Error clearing expired cache:', e);
  }

  return clearedCount;
}

/**
 * Clear all client cache
 */
export function clearAllClientCache(): number {
  let clearedCount = 0;

  try {
    const keysToRemove: string[] = [];

    // Find all cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CLIENT_CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    // Remove all entries
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      clearedCount++;
    });

    // Reset stats
    localStorage.removeItem(STATS_KEY);

    if (process.env.NODE_ENV === 'development') {
      console.log(`🗑️  Cleared all ${clearedCount} cache entries`);
    }
  } catch (e) {
    console.error('Error clearing all cache:', e);
  }

  return clearedCount;
}

/**
 * Clear cache for specific URL pattern
 */
export function clearClientCacheByPattern(pattern: string): number {
  let clearedCount = 0;

  try {
    const keysToRemove: string[] = [];

    // Find matching entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CLIENT_CACHE_PREFIX) && key.includes(pattern)) {
        keysToRemove.push(key);
      }
    }

    // Remove matching entries
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      clearedCount++;
    });

    if (clearedCount > 0 && process.env.NODE_ENV === 'development') {
      console.log(`🗑️  Cleared ${clearedCount} cache entries matching "${pattern}"`);
    }
  } catch (e) {
    console.error('Error clearing cache by pattern:', e);
  }

  return clearedCount;
}

/**
 * Get cache age in seconds
 */
export function getCacheAge(url: string): number | null {
  const cached = getFromClientCache(url);
  if (!cached) return null;

  return Math.round((Date.now() - cached.cachedAt) / 1000);
}

/**
 * Get time until expiry in seconds
 */
export function getTimeUntilExpiry(url: string): number | null {
  const cached = getFromClientCache(url);
  if (!cached) return null;

  return Math.max(0, Math.round((cached.expiresAt - Date.now()) / 1000));
}

/**
 * Format cache age for display
 */
export function formatCacheAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Auto-cleanup expired cache on page load (once)
if (typeof window !== 'undefined') {
  // Run cleanup after 1 second (don't block page load)
  setTimeout(() => {
    clearExpiredClientCache();
  }, 1000);
}
