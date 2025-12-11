import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/middleware';
import { getUsageStats } from '@/lib/ai/groq-client';
import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - AI/Groq Usage Statistics
 * GET /api/admin/ai/stats
 *
 * Returns Groq AI usage stats from Redis (distributed) or memory
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Get Groq usage stats
    const groqStats = await getUsageStats();

    // Check Redis health
    const redis = getRedisClient();
    let redisHealth = false;
    if (redis && isRedisEnabled()) {
      try {
        await redis.ping();
        redisHealth = true;
      } catch {
        redisHealth = false;
      }
    }

    return NextResponse.json({
      success: true,
      groq: {
        dailyCount: groqStats.dailyCount,
        dailyLimit: groqStats.dailyLimit,
        dailyRemaining: groqStats.dailyRemaining,
        minuteCount: groqStats.minuteCount,
        minuteLimit: groqStats.minuteLimit,
        percentUsed: groqStats.percentUsed,
        resetTime: groqStats.resetTime,
      },
      infrastructure: {
        redisEnabled: isRedisEnabled(),
        redisHealthy: redisHealth,
        rateLimitingMode: isRedisEnabled() ? 'distributed' : 'memory',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin AI stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI stats' },
      { status: 500 }
    );
  }
}
