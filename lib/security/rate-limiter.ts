/**
 * Rate Limiting Middleware
 *
 * Redis-backed rate limiting to prevent API abuse and DDoS attacks.
 * Provides configurable rate limits per endpoint with sliding window algorithm.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/cache/redis';

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Custom identifier function (defaults to IP address)
   */
  getIdentifier?: (request: NextRequest) => string;

  /**
   * Skip rate limiting for certain conditions
   */
  skip?: (request: NextRequest) => boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Seconds until next request allowed
}

/**
 * Default identifier: IP address from various headers
 */
function getDefaultIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwardedFor?.split(',')[0].trim() ||
             realIp ||
             cfConnectingIp ||
             'unknown';

  return ip;
}

/**
 * Rate limiter using Redis sliding window algorithm
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  // If Redis is not available, allow request (fail open)
  if (!redis) {
    console.warn('⚠️ Rate limiting unavailable (Redis not configured)');
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowSeconds * 1000,
    };
  }

  // Check if request should skip rate limiting
  if (config.skip && config.skip(request)) {
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowSeconds * 1000,
    };
  }

  // Get identifier (IP address by default)
  const identifier = config.getIdentifier
    ? config.getIdentifier(request)
    : getDefaultIdentifier(request);

  const key = `rate_limit:${request.nextUrl.pathname}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  try {
    // Use Redis sorted set to implement sliding window
    // Score is timestamp, value is unique request ID

    // 1. Remove old entries outside the window
    await redis.zremrangebyscore(key, 0, windowStart);

    // 2. Count requests in current window
    const requestCount = await redis.zcard(key);

    // 3. Check if limit exceeded
    if (requestCount >= config.maxRequests) {
      // Get oldest request in window to calculate retry-after
      const oldestRequest = await redis.zrange(key, 0, 0, { withScores: true });
      const oldestTimestamp = oldestRequest.length > 0 ? oldestRequest[1] as number : now;
      const retryAfter = Math.ceil((oldestTimestamp + config.windowSeconds * 1000 - now) / 1000);

      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: oldestTimestamp + config.windowSeconds * 1000,
        retryAfter: Math.max(retryAfter, 1),
      };
    }

    // 4. Add current request to window
    const requestId = `${now}:${Math.random()}`;
    await redis.zadd(key, { score: now, member: requestId });

    // 5. Set expiration on key (cleanup)
    await redis.expire(key, config.windowSeconds);

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - requestCount - 1,
      reset: now + config.windowSeconds * 1000,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.windowSeconds * 1000,
    };
  }
}

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  message?: string
): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: message || 'Too many requests. Please try again later.',
      retryAfter: result.retryAfter,
    },
    { status: 429 }
  );

  // Add rate limit headers (standard)
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.floor(result.reset / 1000).toString());

  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString());
  }

  return response;
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.floor(result.reset / 1000).toString());
  return response;
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Strict: For sensitive endpoints (auth, payments)
   * 10 requests per minute
   */
  STRICT: {
    maxRequests: 10,
    windowSeconds: 60,
  },

  /**
   * Standard: For most API endpoints
   * 60 requests per minute
   */
  STANDARD: {
    maxRequests: 60,
    windowSeconds: 60,
  },

  /**
   * Relaxed: For read-only endpoints
   * 120 requests per minute
   */
  RELAXED: {
    maxRequests: 120,
    windowSeconds: 60,
  },

  /**
   * Analytics: For tracking endpoints
   * 30 requests per minute
   */
  ANALYTICS: {
    maxRequests: 30,
    windowSeconds: 60,
  },
} as const;

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply rate limiting
    const result = await rateLimit(request, config);

    // If rate limit exceeded, return 429
    if (!result.allowed) {
      console.warn(`🚨 Rate limit exceeded: ${request.nextUrl.pathname} - ${config.getIdentifier?.(request) || getDefaultIdentifier(request)}`);
      return createRateLimitResponse(result);
    }

    // Execute handler
    const response = await handler(request);

    // Add rate limit headers to response
    return addRateLimitHeaders(response, result);
  };
}
