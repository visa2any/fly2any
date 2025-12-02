/**
 * Rate Limiter for API Protection
 *
 * Implements a sliding window rate limiter to prevent abuse and fraud.
 * Uses in-memory storage with automatic cleanup for serverless compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup interval (every 5 minutes)
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Start cleanup on module load
if (typeof window === 'undefined') {
  startCleanup();
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  maxRequests: number;
  /** Time window in milliseconds (preferred) */
  windowMs?: number;
  /** Time window in seconds (alternative, converted to ms internally) */
  windowSeconds?: number;
  /** Key prefix for different rate limit categories */
  keyPrefix?: string;
  /** Custom error message */
  message?: string;
  /** Skip rate limiting for certain conditions */
  skip?: (request: NextRequest) => boolean | Promise<boolean>;
}

/**
 * Get window time in milliseconds from config
 */
function getWindowMs(config: RateLimitConfig): number {
  if (config.windowMs !== undefined) {
    return config.windowMs;
  }
  if (config.windowSeconds !== undefined) {
    return config.windowSeconds * 1000;
  }
  // Default: 1 minute
  return 60 * 1000;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback for development
  return '127.0.0.1';
}

/**
 * Generate rate limit key
 */
function generateKey(request: NextRequest, prefix: string): string {
  const ip = getClientIP(request);
  const path = new URL(request.url).pathname;
  return `${prefix}:${ip}:${path}`;
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const {
    maxRequests,
    keyPrefix = 'rl',
    skip,
  } = config;
  const windowMs = getWindowMs(config);

  // Check if rate limiting should be skipped
  if (skip) {
    const shouldSkip = await skip(request);
    if (shouldSkip) {
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests,
        resetTime: Date.now() + windowMs,
      };
    }
  }

  const key = generateKey(request, keyPrefix);
  const now = Date.now();

  // Get current rate limit data
  let data = rateLimitStore.get(key);

  // If no data or window expired, create new entry
  if (!data || data.resetTime < now) {
    data = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, data);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: data.resetTime,
    };
  }

  // Increment count
  data.count++;
  rateLimitStore.set(key, data);

  // Check if limit exceeded
  if (data.count > maxRequests) {
    const retryAfter = Math.ceil((data.resetTime - now) / 1000);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: data.resetTime,
      retryAfter,
    };
  }

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - data.count,
    resetTime: data.resetTime,
  };
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<RateLimitResult> => {
    return checkRateLimit(request, config);
  };
}

// ============================================
// Pre-configured Rate Limiters
// ============================================

/**
 * Strict rate limiter for booking/payment endpoints
 * 5 requests per IP per hour
 */
export const bookingRateLimit = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: 'booking',
  message: 'Too many booking attempts. Please try again later.',
};

/**
 * Standard rate limiter for API endpoints
 * 100 requests per IP per minute
 */
export const apiRateLimit = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'api',
  message: 'Rate limit exceeded. Please slow down.',
};

/**
 * Strict rate limiter for authentication endpoints
 * 10 requests per IP per 15 minutes
 */
export const authRateLimit = {
  maxRequests: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please try again later.',
};

/**
 * Rate limiter for search endpoints
 * 30 requests per IP per minute
 */
export const searchRateLimit = {
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'search',
  message: 'Too many search requests. Please slow down.',
};

/**
 * Rate limiter for prebook endpoints
 * 10 requests per IP per 5 minutes
 */
export const prebookRateLimit = {
  maxRequests: 10,
  windowMs: 5 * 60 * 1000, // 5 minutes
  keyPrefix: 'prebook',
  message: 'Too many prebook attempts. Please try again later.',
};

// ============================================
// Response Headers Helper
// ============================================

/**
 * Legacy rate limit result format (uses 'allowed' instead of 'success')
 */
export interface LegacyRateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Add rate limit headers to response
 * Overloaded to return the correct type based on input
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult | LegacyRateLimitResult
): Headers;
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult | LegacyRateLimitResult
): NextResponse;
export function addRateLimitHeaders(
  headersOrResponse: Headers | NextResponse,
  result: RateLimitResult | LegacyRateLimitResult
): Headers | NextResponse {
  // Handle legacy result format (uses 'allowed' instead of 'success')
  const legacyResult = result as LegacyRateLimitResult;
  const normalizedResult: RateLimitResult = 'allowed' in result
    ? {
        success: legacyResult.allowed,
        limit: legacyResult.limit,
        remaining: legacyResult.remaining,
        resetTime: legacyResult.reset,
        retryAfter: legacyResult.retryAfter,
      }
    : result as RateLimitResult;

  if (headersOrResponse instanceof Headers) {
    headersOrResponse.set('X-RateLimit-Limit', normalizedResult.limit.toString());
    headersOrResponse.set('X-RateLimit-Remaining', normalizedResult.remaining.toString());
    headersOrResponse.set('X-RateLimit-Reset', normalizedResult.resetTime.toString());

    if (normalizedResult.retryAfter !== undefined) {
      headersOrResponse.set('Retry-After', normalizedResult.retryAfter.toString());
    }

    return headersOrResponse;
  } else {
    // NextResponse - add headers
    headersOrResponse.headers.set('X-RateLimit-Limit', normalizedResult.limit.toString());
    headersOrResponse.headers.set('X-RateLimit-Remaining', normalizedResult.remaining.toString());
    headersOrResponse.headers.set('X-RateLimit-Reset', normalizedResult.resetTime.toString());

    if (normalizedResult.retryAfter !== undefined) {
      headersOrResponse.headers.set('Retry-After', normalizedResult.retryAfter.toString());
    }

    return headersOrResponse;
  }
}

// ============================================
// Legacy Compatibility (for flights/search route)
// ============================================

/**
 * Rate limit presets for different API categories
 */
export const RateLimitPresets = {
  /** Standard API rate limit - 100 requests per minute */
  STANDARD: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    keyPrefix: 'standard',
  } as RateLimitConfig,

  /** Strict rate limit for sensitive operations - 10 requests per minute */
  STRICT: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    keyPrefix: 'strict',
  } as RateLimitConfig,

  /** Relaxed rate limit for read operations - 200 requests per minute */
  RELAXED: {
    maxRequests: 200,
    windowMs: 60 * 1000,
    keyPrefix: 'relaxed',
  } as RateLimitConfig,

  /** Search rate limit - 30 requests per minute */
  SEARCH: searchRateLimit as RateLimitConfig,

  /** Booking rate limit - 5 requests per hour */
  BOOKING: bookingRateLimit as RateLimitConfig,

  /** Auth rate limit - 10 requests per 15 minutes */
  AUTH: authRateLimit as RateLimitConfig,
};

/**
 * Legacy rate limit function (for backwards compatibility)
 * Returns result with 'allowed' property instead of 'success'
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<LegacyRateLimitResult> {
  const result = await checkRateLimit(request, config);

  return {
    allowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.resetTime,
    retryAfter: result.retryAfter,
  };
}

/**
 * Create a rate limit exceeded response
 */
export function createRateLimitResponse(
  result: LegacyRateLimitResult,
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

  // Add rate limit headers
  addRateLimitHeaders(response, result);

  return response;
}

export default {
  checkRateLimit,
  withRateLimit,
  getClientIP,
  addRateLimitHeaders,
  bookingRateLimit,
  apiRateLimit,
  authRateLimit,
  searchRateLimit,
  prebookRateLimit,
  // Legacy exports
  rateLimit,
  createRateLimitResponse,
  RateLimitPresets,
};
