/**
 * Cache Middleware for API Routes
 *
 * Provides reusable caching wrappers for Next.js API routes with:
 * - Automatic cache key generation
 * - TTL configuration per route
 * - Stale-while-revalidate support
 * - Cache hit/miss logging
 * - Background revalidation
 * - Error handling and fallbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache } from './helpers';
import { generateSmartCacheKey } from './smart-keys';
import { trackCacheHit, trackCacheMiss } from './analytics';

export interface CacheMiddlewareOptions {
  /**
   * Cache namespace (e.g., 'flight', 'hotel', 'analytics')
   */
  namespace: string;

  /**
   * Resource type (e.g., 'search', 'details', 'featured')
   */
  resource: string;

  /**
   * TTL in seconds (default: 900 = 15 minutes)
   */
  ttl?: number;

  /**
   * Stale-while-revalidate duration in seconds
   * If specified, will serve stale content while revalidating in background
   */
  staleWhileRevalidate?: number;

  /**
   * Custom cache key generator
   * If not provided, will use smart-keys with request params
   */
  keyGenerator?: (request: NextRequest) => string | Promise<string>;

  /**
   * Cache condition - only cache if this returns true
   * Useful for conditional caching (e.g., only cache successful responses)
   */
  shouldCache?: (response: any) => boolean;

  /**
   * Enable cache headers in HTTP response
   */
  includeCacheHeaders?: boolean;

  /**
   * Custom cache key from request body/query params
   * Will be merged with namespace and resource
   */
  getParams?: (request: NextRequest) => Record<string, any> | Promise<Record<string, any>>;

  /**
   * Enable verbose logging
   */
  verbose?: boolean;
}

/**
 * Default TTL values by use case
 */
export const DEFAULT_TTLS = {
  STATIC: 86400, // 24 hours - airports, airlines, cities
  SEARCH: 900, // 15 minutes - flight/hotel search
  POPULAR: 3600, // 1 hour - popular routes, trending deals
  REALTIME: 300, // 5 minutes - analytics, live data
  VOLATILE: 180, // 3 minutes - flash deals, limited inventory
} as const;

/**
 * Default stale-while-revalidate values
 */
export const DEFAULT_SWR = {
  STATIC: 604800, // 7 days
  SEARCH: 1800, // 30 minutes
  POPULAR: 7200, // 2 hours
  REALTIME: 600, // 10 minutes
  VOLATILE: 300, // 5 minutes
} as const;

/**
 * Wrap an API handler with caching middleware
 *
 * @example
 * export const GET = withCache(
 *   async (request) => {
 *     const data = await fetchExpensiveData();
 *     return NextResponse.json(data);
 *   },
 *   {
 *     namespace: 'flight',
 *     resource: 'airports',
 *     ttl: DEFAULT_TTLS.STATIC,
 *     staleWhileRevalidate: DEFAULT_SWR.STATIC,
 *   }
 * );
 */
export function withCache<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  options: CacheMiddlewareOptions
): (request: NextRequest) => Promise<NextResponse<T>> {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    const {
      namespace,
      resource,
      ttl = DEFAULT_TTLS.SEARCH,
      staleWhileRevalidate,
      keyGenerator,
      shouldCache,
      includeCacheHeaders = true,
      getParams,
      verbose = false,
    } = options;

    try {
      // Generate cache key
      let cacheKey: string;

      if (keyGenerator) {
        cacheKey = await keyGenerator(request);
      } else if (getParams) {
        const params = await getParams(request);
        cacheKey = generateSmartCacheKey(namespace, resource, params);
      } else {
        // Default: use query params or empty object
        const searchParams = request.nextUrl.searchParams;
        const params: Record<string, any> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        cacheKey = generateSmartCacheKey(namespace, resource, params);
      }

      if (verbose) {
        console.log(`[Cache Middleware] Key: ${cacheKey}`);
      }

      // Try to get from cache
      const cached = await getCached<any>(cacheKey);

      if (cached) {
        // Cache HIT
        if (verbose) {
          console.log(`[Cache Middleware] HIT: ${cacheKey}`);
        }

        // Track cache hit for analytics
        trackCacheHit(namespace, resource, cacheKey);

        // Build cache headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (includeCacheHeaders) {
          headers['X-Cache-Status'] = 'HIT';
          headers['Cache-Control'] = staleWhileRevalidate
            ? `public, max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`
            : `public, max-age=${ttl}`;
        }

        return NextResponse.json(cached, {
          status: 200,
          headers,
        });
      }

      // Cache MISS - execute handler
      if (verbose) {
        console.log(`[Cache Middleware] MISS: ${cacheKey}`);
      }

      // Track cache miss
      trackCacheMiss(namespace, resource, cacheKey);

      const startTime = Date.now();
      const response = await handler(request);
      const duration = Date.now() - startTime;

      if (verbose) {
        console.log(`[Cache Middleware] Handler took ${duration}ms`);
      }

      // Extract response data
      const responseData = await response.json();

      // Check if we should cache this response
      const canCache = !shouldCache || shouldCache(responseData);

      if (canCache) {
        // Store in cache (fire and forget - don't block response)
        setCache(cacheKey, responseData, ttl).catch((err) => {
          console.error(`[Cache Middleware] Failed to cache: ${err.message}`);
        });

        if (verbose) {
          console.log(`[Cache Middleware] Cached with TTL=${ttl}s`);
        }
      }

      // Build response with cache headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (includeCacheHeaders) {
        headers['X-Cache-Status'] = 'MISS';
        headers['X-Response-Time'] = `${duration}ms`;
        headers['Cache-Control'] = staleWhileRevalidate
          ? `public, max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`
          : `public, max-age=${ttl}`;
      }

      return NextResponse.json(responseData, {
        status: response.status,
        headers,
      });
    } catch (error: any) {
      console.error(`[Cache Middleware] Error:`, error);

      // Return error response
      return NextResponse.json(
        {
          error: error.message || 'Internal server error',
          cached: false,
        },
        { status: 500 }
      ) as NextResponse<T>;
    }
  };
}

/**
 * Cache middleware specifically for GET requests with query params
 *
 * @example
 * export const GET = withQueryCache(
 *   async (request) => {
 *     const data = await fetchData();
 *     return NextResponse.json(data);
 *   },
 *   { namespace: 'hotel', resource: 'search', ttl: 900 }
 * );
 */
export function withQueryCache<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  options: Omit<CacheMiddlewareOptions, 'getParams'>
): (request: NextRequest) => Promise<NextResponse<T>> {
  return withCache(handler, {
    ...options,
    getParams: (request) => {
      const params: Record<string, any> = {};
      request.nextUrl.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    },
  });
}

/**
 * Cache middleware for POST requests with JSON body
 *
 * @example
 * export const POST = withBodyCache(
 *   async (request) => {
 *     const body = await request.json();
 *     const data = await searchFlights(body);
 *     return NextResponse.json(data);
 *   },
 *   { namespace: 'flight', resource: 'search', ttl: 600 }
 * );
 */
export function withBodyCache<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  options: Omit<CacheMiddlewareOptions, 'getParams'>
): (request: NextRequest) => Promise<NextResponse<T>> {
  return withCache(handler, {
    ...options,
    getParams: async (request) => {
      // Clone request to avoid consuming body
      const clonedRequest = request.clone();
      try {
        const body = await clonedRequest.json();
        return body || {};
      } catch {
        return {};
      }
    },
  });
}

/**
 * Time-bucketed cache middleware
 * Cache expires on time boundaries (e.g., every 30 minutes)
 * Useful for data that refreshes on schedule
 *
 * @example
 * export const GET = withTimeBucketedCache(
 *   async (request) => {
 *     const deals = await fetchFlashDeals();
 *     return NextResponse.json(deals);
 *   },
 *   {
 *     namespace: 'analytics',
 *     resource: 'flash-deals',
 *     bucketMinutes: 30,
 *     ttl: 1800,
 *   }
 * );
 */
export function withTimeBucketedCache<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  options: CacheMiddlewareOptions & { bucketMinutes: number }
): (request: NextRequest) => Promise<NextResponse<T>> {
  const { bucketMinutes, ...cacheOptions } = options;

  return withCache(handler, {
    ...cacheOptions,
    getParams: async (request) => {
      const baseParams = cacheOptions.getParams
        ? await cacheOptions.getParams(request)
        : {};

      // Add time bucket to params
      const timestamp = Date.now();
      const bucket = Math.floor(timestamp / (bucketMinutes * 60 * 1000));

      return {
        ...baseParams,
        _timeBucket: bucket,
      };
    },
  });
}

/**
 * Conditional cache middleware
 * Only caches responses that meet certain criteria
 *
 * @example
 * export const GET = withConditionalCache(
 *   async (request) => {
 *     const data = await fetchData();
 *     return NextResponse.json(data);
 *   },
 *   {
 *     namespace: 'flight',
 *     resource: 'search',
 *     ttl: 900,
 *     condition: (data) => data.flights && data.flights.length > 0,
 *   }
 * );
 */
export function withConditionalCache<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  options: CacheMiddlewareOptions & {
    condition: (data: any) => boolean;
  }
): (request: NextRequest) => Promise<NextResponse<T>> {
  const { condition, ...cacheOptions } = options;

  return withCache(handler, {
    ...cacheOptions,
    shouldCache: condition,
  });
}

/**
 * Geo-aware cache middleware
 * Caches based on user's geographic region
 *
 * @example
 * export const GET = withGeoCache(
 *   async (request) => {
 *     const routes = await fetchPopularRoutes();
 *     return NextResponse.json(routes);
 *   },
 *   {
 *     namespace: 'analytics',
 *     resource: 'popular-routes',
 *     ttl: 3600,
 *   }
 * );
 */
export function withGeoCache<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  options: Omit<CacheMiddlewareOptions, 'getParams'> & {
    getParams?: (request: NextRequest) => Promise<Record<string, any>> | Record<string, any>
  }
): (request: NextRequest) => Promise<NextResponse<T>> {
  return withCache(handler, {
    ...options,
    getParams: async (request) => {
      // Extract geo headers from Vercel
      const country = request.headers.get('x-vercel-ip-country') || 'UNKNOWN';
      const city = request.headers.get('x-vercel-ip-city') || 'UNKNOWN';

      const baseParams = (options as any).getParams
        ? await (options as any).getParams(request)
        : {};

      return {
        ...baseParams,
        _geo_country: country,
        _geo_city: city,
      };
    },
  });
}

/**
 * Cache presets for common scenarios
 */
export const CachePresets = {
  /**
   * Static content (airports, airlines, cities)
   * 24 hours cache, 7 days stale-while-revalidate
   */
  static: (namespace: string, resource: string) => ({
    namespace,
    resource,
    ttl: DEFAULT_TTLS.STATIC,
    staleWhileRevalidate: DEFAULT_SWR.STATIC,
    includeCacheHeaders: true,
  }),

  /**
   * Search results (flights, hotels)
   * 15 minutes cache, 30 minutes stale-while-revalidate
   */
  search: (namespace: string, resource: string) => ({
    namespace,
    resource,
    ttl: DEFAULT_TTLS.SEARCH,
    staleWhileRevalidate: DEFAULT_SWR.SEARCH,
    includeCacheHeaders: true,
  }),

  /**
   * Popular/trending content
   * 1 hour cache, 2 hours stale-while-revalidate
   */
  popular: (namespace: string, resource: string) => ({
    namespace,
    resource,
    ttl: DEFAULT_TTLS.POPULAR,
    staleWhileRevalidate: DEFAULT_SWR.POPULAR,
    includeCacheHeaders: true,
  }),

  /**
   * Real-time analytics
   * 5 minutes cache, 10 minutes stale-while-revalidate
   */
  realtime: (namespace: string, resource: string) => ({
    namespace,
    resource,
    ttl: DEFAULT_TTLS.REALTIME,
    staleWhileRevalidate: DEFAULT_SWR.REALTIME,
    includeCacheHeaders: true,
  }),

  /**
   * Volatile data (flash deals, limited seats)
   * 3 minutes cache, 5 minutes stale-while-revalidate
   */
  volatile: (namespace: string, resource: string) => ({
    namespace,
    resource,
    ttl: DEFAULT_TTLS.VOLATILE,
    staleWhileRevalidate: DEFAULT_SWR.VOLATILE,
    includeCacheHeaders: true,
  }),
};

/**
 * Example usage in API route:
 *
 * // Simple query cache
 * export const GET = withQueryCache(
 *   async (request) => {
 *     const data = await fetchAirports();
 *     return NextResponse.json(data);
 *   },
 *   CachePresets.static('flight', 'airports')
 * );
 *
 * // POST with body cache
 * export const POST = withBodyCache(
 *   async (request) => {
 *     const body = await request.json();
 *     const results = await searchFlights(body);
 *     return NextResponse.json(results);
 *   },
 *   CachePresets.search('flight', 'search')
 * );
 *
 * // Conditional cache (only cache non-empty results)
 * export const GET = withConditionalCache(
 *   async (request) => {
 *     const flights = await searchFlights();
 *     return NextResponse.json(flights);
 *   },
 *   {
 *     ...CachePresets.search('flight', 'search'),
 *     condition: (data) => data.flights?.length > 0,
 *   }
 * );
 */
