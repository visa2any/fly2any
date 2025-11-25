/**
 * Admin Cache Clear API
 *
 * Clears all cached flight prices to ensure fresh data
 * Protected by CRON_SECRET for security
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

/**
 * Verify admin authentication
 */
function isAuthorized(request: NextRequest): boolean {
  // Method 1: Vercel cron (automatic)
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (isVercelCron) return true;

  // Method 2: Manual trigger - uses Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isManualAuth = !!(cronSecret && authHeader === `Bearer ${cronSecret}`);

  return isManualAuth;
}

/**
 * POST /api/admin/cache/clear
 *
 * Clears all flight-related caches:
 * - flight:search:* (flight search results)
 * - calendar-price:* (calendar price estimates)
 * - smart:flight:* (smart flight cache)
 * - api:selection:* (API selection history)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    if (!isAuthorized(request)) {
      console.warn('Unauthorized cache clear request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check Redis availability
    if (!isRedisEnabled()) {
      return NextResponse.json(
        { error: 'Redis not configured', message: 'Cache system not available' },
        { status: 503 }
      );
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { error: 'Redis not available' },
        { status: 503 }
      );
    }

    console.log('Starting cache clear operation...');

    const results: Record<string, number> = {};
    const patterns = [
      'flight:search:*',      // Flight search results
      'calendar-price:*',     // Calendar prices
      'smart:flight:*',       // Smart flight cache
      'api:selection:*',      // API selection history
      'approx-price:*',       // Approximate prices
      'route:*',              // Route data
    ];

    // Clear each pattern
    for (const pattern of patterns) {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          const deleted = await redis.del(...keys);
          results[pattern] = deleted;
          console.log(`Cleared ${deleted} keys matching: ${pattern}`);
        } else {
          results[pattern] = 0;
          console.log(`No keys found matching: ${pattern}`);
        }
      } catch (error) {
        console.error(`Error clearing pattern ${pattern}:`, error);
        results[pattern] = -1; // Error indicator
      }
    }

    const totalCleared = Object.values(results)
      .filter(v => v > 0)
      .reduce((a, b) => a + b, 0);

    console.log(`Cache clear complete. Total keys cleared: ${totalCleared}`);

    return NextResponse.json({
      success: true,
      message: `Cleared ${totalCleared} cache entries`,
      timestamp: new Date().toISOString(),
      details: results,
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Support GET for easy manual trigger
export async function GET(request: NextRequest) {
  return POST(request);
}
