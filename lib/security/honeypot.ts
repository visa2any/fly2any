/**
 * Honeypot System for Bot Detection
 *
 * Exposes fake API endpoints that real users would never access.
 * Any request to these endpoints = instant bot/scraper detection.
 * Automatically blocks the IP for 24 hours.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';
import { getClientIP } from './redis-rate-limiter';

// Honeypot endpoints - add these to your routes
export const HONEYPOT_PATHS = [
  '/api/v2/internal/debug',
  '/api/v2/admin/config',
  '/api/v3/flights/bulk',
  '/api/internal/test',
  '/api/private/export',
  '/graphql/introspection',
  '/.env',
  '/wp-admin',
  '/wp-login.php',
  '/admin.php',
  '/config.json',
  '/api/swagger.json',
] as const;

// Hidden form field honeypots (for forms)
export const HONEYPOT_FIELDS = ['website', 'url', 'fax', 'company_url', 'homepage'];

/**
 * Check if path is a honeypot
 */
export function isHoneypotPath(path: string): boolean {
  return HONEYPOT_PATHS.some(hp => path.toLowerCase().includes(hp.toLowerCase()));
}

/**
 * Handle honeypot trigger - block IP and log
 */
export async function triggerHoneypot(
  request: NextRequest,
  reason: string = 'honeypot_access'
): Promise<void> {
  const ip = getClientIP(request);
  const redis = getRedisClient();

  if (redis && isRedisEnabled()) {
    try {
      // Block IP for 24 hours
      const blockKey = `blocked:${ip}`;
      await redis.set(blockKey, JSON.stringify({
        reason,
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || 'unknown',
      }), { ex: 86400 }); // 24 hours

      // Increment honeypot counter
      await redis.hincrby('honeypot_triggers', ip, 1);

      // Log the event
      await redis.lpush('honeypot_log', JSON.stringify({
        ip,
        reason,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      }));
      await redis.ltrim('honeypot_log', 0, 999);

      console.log(`🍯 Honeypot triggered: ${ip} - ${reason} - ${request.nextUrl.pathname}`);
    } catch (error) {
      console.error('[Honeypot] Redis error:', error);
    }
  }
}

/**
 * Check if IP is blocked from honeypot
 */
export async function isIPBlockedByHoneypot(ip: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return false;

  try {
    const blocked = await redis.get(`blocked:${ip}`);
    return !!blocked;
  } catch {
    return false;
  }
}

/**
 * Honeypot response - looks like a real error to confuse bots
 */
export function createHoneypotResponse(): NextResponse {
  // Return a fake "success" response to waste bot time
  return NextResponse.json(
    {
      status: 'processing',
      message: 'Request queued for processing',
      estimatedTime: '30-60 seconds',
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    },
    {
      status: 202,
      headers: {
        'Retry-After': '60',
        'X-Queue-Position': '47',
      },
    }
  );
}

/**
 * Check honeypot form fields
 */
export function checkHoneypotFields(body: Record<string, any>): boolean {
  for (const field of HONEYPOT_FIELDS) {
    if (body[field] && String(body[field]).trim().length > 0) {
      return true; // Bot filled the honeypot field
    }
  }
  return false;
}

/**
 * Middleware wrapper for honeypot protection
 */
export async function withHoneypotCheck(
  request: NextRequest
): Promise<NextResponse | null> {
  const path = request.nextUrl.pathname;
  const ip = getClientIP(request);

  // Check if already blocked
  if (await isIPBlockedByHoneypot(ip)) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // Check if accessing honeypot path
  if (isHoneypotPath(path)) {
    await triggerHoneypot(request, 'honeypot_path_access');
    return createHoneypotResponse();
  }

  return null; // Continue to real handler
}

export default {
  isHoneypotPath,
  triggerHoneypot,
  isIPBlockedByHoneypot,
  createHoneypotResponse,
  checkHoneypotFields,
  withHoneypotCheck,
  HONEYPOT_PATHS,
  HONEYPOT_FIELDS,
};
