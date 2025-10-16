import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/cache/helpers';

/**
 * GET /api/cache/stats
 * Get cache statistics and performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const stats = getCacheStats();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
