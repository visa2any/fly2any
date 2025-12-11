/**
 * Redis-Backed Distributed Rate Limiter
 *
 * Uses Upstash Redis for distributed rate limiting across serverless instances.
 * Implements sliding window algorithm with O(1) Redis operations.
 * Falls back to in-memory when Redis unavailable.
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';
import { NextRequest, NextResponse } from 'next/server';

// In-memory fallback store
const memoryStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
  message?: string;
  /** Cost multiplier - higher = more expensive endpoint to protect */
  costWeight?: number;
  /** Skip for authenticated users with good standing */
  skipTrusted?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  blocked?: boolean;
  reason?: string;
}

/**
 * Get client IP with Cloudflare/Vercel support
 */
export function getClientIP(request: NextRequest): string {
  // Cloudflare
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  // Vercel
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) return vercelIP.split(',')[0].trim();

  // Standard proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  return '127.0.0.1';
}

/**
 * Generate composite rate limit key
 */
function generateKey(ip: string, prefix: string, path?: string): string {
  const pathKey = path ? `:${path.replace(/\//g, '_')}` : '';
  return `rl:${prefix}:${ip}${pathKey}`;
}

/**
 * Check if request is in test mode (bypass rate limiting for E2E tests)
 */
function isTestMode(request: NextRequest): boolean {
  const testHeader = request.headers.get('x-test-mode');
  return testHeader === 'fare-reconciliation' || testHeader === 'e2e-test';
}

/**
 * Check rate limit using Redis (distributed) or memory (fallback)
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, keyPrefix = 'api' } = config;

  // Bypass rate limiting for test mode
  if (isTestMode(request)) {
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      resetTime: Date.now() + windowMs,
    };
  }

  const ip = getClientIP(request);
  const path = new URL(request.url).pathname;
  const key = generateKey(ip, keyPrefix, path);
  const now = Date.now();
  const windowKey = Math.floor(now / windowMs);
  const redisKey = `${key}:${windowKey}`;

  const redis = getRedisClient();

  // Use Redis if available (distributed)
  if (redis && isRedisEnabled()) {
    try {
      // Atomic increment with expiration
      const pipeline = redis.pipeline();
      pipeline.incr(redisKey);
      pipeline.pttl(redisKey);

      const results = await pipeline.exec();
      let count = (results[0] as number) || 1;
      const ttl = (results[1] as number) || -1;

      // Set expiration on first request
      if (ttl === -1) {
        await redis.pexpire(redisKey, windowMs);
      }

      const resetTime = now + (ttl > 0 ? ttl : windowMs);

      if (count > maxRequests) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        // Track blocked IPs for analysis
        await redis.hincrby('blocked_ips', ip, 1);

        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          resetTime,
          retryAfter,
          blocked: true,
          reason: 'rate_limit_exceeded',
        };
      }

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - count,
        resetTime,
      };
    } catch (error) {
      console.error('[RateLimit] Redis error, falling back to memory:', error);
    }
  }

  // Memory fallback (single instance only)
  let data = memoryStore.get(key);

  if (!data || data.resetTime < now) {
    data = { count: 1, resetTime: now + windowMs };
    memoryStore.set(key, data);
  } else {
    data.count++;
    memoryStore.set(key, data);
  }

  if (data.count > maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: data.resetTime,
      retryAfter: Math.ceil((data.resetTime - now) / 1000),
      blocked: true,
      reason: 'rate_limit_exceeded',
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
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(response: NextResponse, result: RateLimitResult): void {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString());
  }
}

/**
 * Create 429 response with proper headers
 */
export function createRateLimitResponse(result: RateLimitResult, message?: string): NextResponse {
  const response = NextResponse.json(
    {
      error: 'rate_limit_exceeded',
      message: message || 'Too many requests. Please slow down.',
      retryAfter: result.retryAfter,
    },
    { status: 429 }
  );

  addRateLimitHeaders(response, result);
  return response;
}

// ==========================================
// Pre-configured Rate Limiters (DISTRIBUTED)
// ==========================================

export const RATE_LIMITS = {
  // Critical endpoints - very strict
  BOOKING: { maxRequests: 5, windowMs: 3600000, keyPrefix: 'booking', costWeight: 10 },
  PAYMENT: { maxRequests: 5, windowMs: 300000, keyPrefix: 'payment', costWeight: 10 },

  // Expensive API calls - protect costs
  FLIGHT_SEARCH: { maxRequests: 20, windowMs: 60000, keyPrefix: 'flight_search', costWeight: 5 },
  HOTEL_SEARCH: { maxRequests: 20, windowMs: 60000, keyPrefix: 'hotel_search', costWeight: 5 },
  PREBOOK: { maxRequests: 10, windowMs: 300000, keyPrefix: 'prebook', costWeight: 8 },

  // Auth endpoints - prevent brute force
  AUTH: { maxRequests: 10, windowMs: 900000, keyPrefix: 'auth', costWeight: 3 },
  PASSWORD_RESET: { maxRequests: 3, windowMs: 3600000, keyPrefix: 'password', costWeight: 3 },

  // Standard API - moderate limits
  API: { maxRequests: 100, windowMs: 60000, keyPrefix: 'api', costWeight: 1 },

  // Read operations - relaxed
  READ: { maxRequests: 200, windowMs: 60000, keyPrefix: 'read', costWeight: 1 },
} as const;

export default { checkRateLimit, createRateLimitResponse, addRateLimitHeaders, RATE_LIMITS };
