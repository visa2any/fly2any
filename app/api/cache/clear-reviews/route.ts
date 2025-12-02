import { NextResponse } from 'next/server';
import { deleteCachePattern, isRedisEnabled } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Clear all hotel review caches
 * GET /api/cache/clear-reviews
 */
export async function GET() {
  try {
    if (!isRedisEnabled()) {
      return NextResponse.json({
        success: true,
        message: 'Redis is not enabled - no caches to clear',
        cleared: 0,
      });
    }

    // Clear all versions of review caches
    const patterns = [
      'hotel:reviews:*',
      'reviews:*',
    ];

    let totalCleared = 0;
    for (const pattern of patterns) {
      const cleared = await deleteCachePattern(pattern);
      totalCleared += cleared;
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${totalCleared} review cache entries`,
      cleared: totalCleared,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to clear caches',
    }, { status: 500 });
  }
}
