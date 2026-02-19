/**
 * Rate Limiting with In-Memory Fallback
 * 
 * Uses Upstash Redis when available (production).
 * Falls back to in-memory Map for local dev or when Redis is not configured.
 * In-memory state resets on server restart, which is acceptable for dev.
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

const LOGIN_PREFIX = 'ratelimit:login:';
const AUTH_WINDOW = 300; // 5 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 900; // 15 minutes

const GENERAL_PREFIX = 'ratelimit:general:';

// In-memory fallback store (for when Redis is not available)
const memStore = new Map<string, { value: number | string; expiresAt: number }>();

function memGet(key: string): string | number | null {
  const entry = memStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { memStore.delete(key); return null; }
  return entry.value;
}

function memSet(key: string, value: string | number, ttlSeconds: number) {
  memStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function memIncr(key: string, ttlSeconds: number): number {
  const existing = memGet(key);
  const newVal = (typeof existing === 'number' ? existing : 0) + 1;
  const entry = memStore.get(key);
  const expiresAt = entry && Date.now() <= entry.expiresAt ? entry.expiresAt : Date.now() + ttlSeconds * 1000;
  memStore.set(key, { value: newVal, expiresAt });
  return newVal;
}

function memTtl(key: string): number {
  const entry = memStore.get(key);
  if (!entry || Date.now() > entry.expiresAt) return 0;
  return Math.ceil((entry.expiresAt - Date.now()) / 1000);
}

function memDel(key: string) { memStore.delete(key); }

export interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining: number;
  locked: boolean;
  lockoutRemaining?: number;
  retryAfter?: number;
}

/**
 * Check and enforce login rate limiting
 * Blocks after 5 failed attempts in 5 minutes, locks for 15 minutes
 */
export async function checkLoginRateLimit(identifier: string): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const lockKey = `${LOGIN_PREFIX}locked:${identifier}`;
  const attemptsKey = `${LOGIN_PREFIX}${identifier}`;

  if (redis && isRedisEnabled()) {
    // Redis path
    const locked = await redis.get(lockKey);
    if (locked) {
      const ttl = await redis.ttl(lockKey);
      return { allowed: false, attemptsRemaining: 0, locked: true, lockoutRemaining: ttl, retryAfter: ttl };
    }
    const attempts = await redis.incr(attemptsKey);
    if (attempts === 1) await redis.expire(attemptsKey, AUTH_WINDOW);
    const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attempts);
    if (attempts >= MAX_ATTEMPTS) {
      await redis.setex(lockKey, LOCKOUT_DURATION, '1');
      return { allowed: false, attemptsRemaining: 0, locked: true, lockoutRemaining: LOCKOUT_DURATION, retryAfter: LOCKOUT_DURATION };
    }
    return { allowed: true, attemptsRemaining, locked: false };
  }

  // In-memory fallback
  const locked = memGet(lockKey);
  if (locked) {
    const ttl = memTtl(lockKey);
    return { allowed: false, attemptsRemaining: 0, locked: true, lockoutRemaining: ttl, retryAfter: ttl };
  }
  const attempts = memIncr(attemptsKey, AUTH_WINDOW);
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attempts);
  if (attempts >= MAX_ATTEMPTS) {
    memSet(lockKey, '1', LOCKOUT_DURATION);
    return { allowed: false, attemptsRemaining: 0, locked: true, lockoutRemaining: LOCKOUT_DURATION, retryAfter: LOCKOUT_DURATION };
  }
  return { allowed: true, attemptsRemaining, locked: false };
}

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(identifier: string, email?: string): Promise<void> {
  const result = await checkLoginRateLimit(identifier);
  if (result.locked) {
    console.error(`🚨 Login blocked for: ${identifier}, Email: ${email || 'unknown'}`);
  }
}

/**
 * Clear login attempts on successful login
 */
export async function clearLoginAttempts(identifier: string): Promise<void> {
  const redis = getRedisClient();
  const attemptsKey = `${LOGIN_PREFIX}${identifier}`;
  if (redis && isRedisEnabled()) {
    await redis.del(attemptsKey);
  } else {
    memDel(attemptsKey);
  }
}

/**
 * General purpose rate limiting for API endpoints
 */
export async function checkRateLimit(
  identifier: string,
  window: 'minute' | 'hour' | 'day',
  maxRequests: number
): Promise<RateLimitResult> {
  const windowSeconds = { minute: 60, hour: 3600, day: 86400 }[window];
  const key = `${GENERAL_PREFIX}${window}:${identifier}`;
  const redis = getRedisClient();

  if (redis && isRedisEnabled()) {
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, windowSeconds);
    if (current > maxRequests) {
      const ttl = await redis.ttl(key);
      return { allowed: false, attemptsRemaining: 0, locked: true, lockoutRemaining: ttl, retryAfter: ttl };
    }
    return { allowed: true, attemptsRemaining: Math.max(0, maxRequests - current), locked: false };
  }

  // In-memory fallback
  const current = memIncr(key, windowSeconds);
  if (current > maxRequests) {
    const ttl = memTtl(key);
    return { allowed: false, attemptsRemaining: 0, locked: true, lockoutRemaining: ttl, retryAfter: ttl };
  }
  return { allowed: true, attemptsRemaining: Math.max(0, maxRequests - current), locked: false };
}

/**
 * Reset rate limit for identifier
 */
export async function resetRateLimit(
  identifier: string,
  window: 'minute' | 'hour' | 'day'
): Promise<void> {
  const key = `${GENERAL_PREFIX}${window}:${identifier}`;
  const redis = getRedisClient();
  if (redis && isRedisEnabled()) {
    await redis.del(key);
  } else {
    memDel(key);
  }
}