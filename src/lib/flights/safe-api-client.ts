/**
 * 🛡️ Safe API Client - Browser-Safe Wrapper
 * Ensures all Amadeus API calls go through server-side routes
 */

export interface SafeApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'server-route' | 'cache' | 'fallback';
}

export class SafeApiClient {
  private static instance: SafeApiClient;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  static getInstance(): SafeApiClient {
    if (!SafeApiClient.instance) {
      SafeApiClient.instance = new SafeApiClient();
    }
    return SafeApiClient.instance;
  }

  /**
   * 🎯 Safe API call that works in both browser and server environments
   */
  async callAmadeusApi<T>(
    endpoint: string,
    data?: any,
    options: {
      method?: 'GET' | 'POST';
      useCache?: boolean;
      cacheKey?: string;
    } = {}
  ): Promise<SafeApiResponse<T>> {
    const { method = 'GET', useCache = true, cacheKey } = options;
    const finalCacheKey = cacheKey || `${method}:${endpoint}:${JSON.stringify(data || {})}`;

    // Check cache first
    if (useCache && this.cache.has(finalCacheKey)) {
      const cached = this.cache.get(finalCacheKey)!;
      if (Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
        return {
          success: true,
          data: cached.data,
          source: 'cache'
        };
      }
    }

    try {
      // Always use Next.js API routes for Amadeus calls
      const apiRoute = `/api/flights${endpoint}`;
      
      const response = await fetch(apiRoute, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Cache successful results
      if (useCache && result.success) {
        this.cache.set(finalCacheKey, {
          data: result.data,
          timestamp: Date.now()
        });
      }

      return {
        success: true,
        data: result.data,
        source: 'server-route'
      };

    } catch (error) {
      console.error(`Safe API call failed for ${endpoint}:`, error);
      
      // Return cached data if available, even if expired
      if (this.cache.has(finalCacheKey)) {
        const cached = this.cache.get(finalCacheKey)!;
        return {
          success: false,
          data: cached.data,
          error: error instanceof Error ? error.message : 'Unknown error',
          source: 'cache'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'fallback'
      };
    }
  }

  /**
   * 🧹 Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TIMEOUT) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 🗑️ Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 📊 Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const safeApiClient = SafeApiClient.getInstance();