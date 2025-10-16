/**
 * Redis Connection Module
 *
 * Provides Redis client instance using Upstash Redis for caching.
 * Falls back gracefully when Redis is unavailable (local development).
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
let redisEnabled = false;

// Initialize Redis client
try {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    redis = new Redis({
      url,
      token,
    });
    redisEnabled = true;
    console.log('✅ Redis cache initialized successfully');
  } else {
    console.warn('⚠️  Redis not configured - caching disabled (set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)');
  }
} catch (error) {
  console.error('❌ Failed to initialize Redis:', error);
  redis = null;
  redisEnabled = false;
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): Redis | null {
  return redis;
}

/**
 * Check if Redis is enabled and available
 */
export function isRedisEnabled(): boolean {
  return redisEnabled;
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<boolean> {
  if (!redis || !redisEnabled) {
    return false;
  }

  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

export default redis;
