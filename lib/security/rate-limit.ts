/**
 * Redis-based Rate Limiting
 * 
 * Uses Redis for distributed rate limiting across all instances
 * Replaces in-memory rate limiting that resets on server restart
 */

import { redis } from '@/lib/redis';

const LOGIN_PREFIX = 'ratelimit:login:';
const AUTH_WINDOW = 300; // 5 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 900; // 15 minutes

const GENERAL_PREFIX = 'ratelimit:general:';

export interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining: number;
  locked: boolean;
  lockoutRemaining?: number;
  retryAfter?: number;
}

/**
 * Check and enforce login rate limiting
 * Blocks IP after 5 failed attempts in 5 minutes
 * Locks for 15 minutes
 */
export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  // Check if already locked
  const lockKey = `${LOGIN_PREFIX}locked:${ip}`;
  const locked = await redis.get(lockKey);
  
  if (locked) {
    const ttl = await redis.ttl(lockKey);
    return {
      allowed: false,
      attemptsRemaining: 0,
      locked: true,
      lockoutRemaining: ttl,
      retryAfter: ttl,
    };
  }

  // Count attempts in window
  const attemptsKey = `${LOGIN_PREFIX}${ip}`;
  const attempts = await redis.incr(attemptsKey);
  
  if (attempts === 1) {
    await redis.expire(attemptsKey, AUTH_WINDOW);
  }

  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attempts);

  // Lock if max attempts reached
  if (attempts >= MAX_ATTEMPTS) {
    await redis.setex(lockKey, LOCKOUT_DURATION, '1');
    console.error(`🚨 IP ${ip} locked due to too many failed login attempts`);
    
    return {
      allowed: false,
      attemptsRemaining: 0,
      locked: true,
      lockoutRemaining: LOCKOUT_DURATION,
      retryAfter: LOCKOUT_DURATION,
    };
  }

  return {
    allowed: true,
    attemptsRemaining,
    locked: false,
  };
}

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(ip: string, email?: string): Promise<void> {
  const result = await checkLoginRateLimit(ip);
  
  if (result.locked) {
    console.error(`🚨 Login blocked for IP: ${ip}, Email: ${email || 'unknown'}`);
    // TODO: Send security alert to monitoring
  }
}

/**
 * Clear login attempts on successful login
 */
export async function clearLoginAttempts(ip: string): Promise<void> {
  const attemptsKey = `${LOGIN_PREFIX}${ip}`;
  await redis.del(attemptsKey);
}

/**
 * General purpose rate limiting for API endpoints
 * 
 * @param identifier - IP or user ID
 * @param window - time window in seconds
 * @param maxRequests - maximum requests allowed
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  identifier: string,
  window: 'minute' | 'hour' | 'day',
  maxRequests: number
): Promise<RateLimitResult> {
  const windowSeconds = {
    minute: 60,
    hour: 3600,
    day: 86400,
  }[window];

  const key = `${GENERAL_PREFIX}${window}:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  const attemptsRemaining = Math.max(0, maxRequests - current);

  if (current > maxRequests) {
    const ttl = await redis.ttl(key);
    return {
      allowed: false,
      attemptsRemaining: 0,
      locked: true,
      lockoutRemaining: ttl,
      retryAfter: ttl,
    };
  }

  return {
    allowed: true,
    attemptsRemaining,
    locked: false,
  };
}

/**
 * Reset rate limit for identifier
 * Use carefully - only for admin resets or user requests
 */
export async function resetRateLimit(
  identifier: string,
  window: 'minute' | 'hour' | 'day'
): Promise<void> {
  const key = `${GENERAL_PREFIX}${window}:${identifier}`;
  await redis.del(key);
}