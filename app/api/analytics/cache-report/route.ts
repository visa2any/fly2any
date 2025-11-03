/**
 * Cache Performance Report API
 *
 * Provides real-time cache analytics and performance metrics.
 * This endpoint itself uses short-term caching (5 minutes).
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCacheReport } from '@/lib/cache/analytics';
import { withQueryCache, DEFAULT_TTLS, DEFAULT_SWR } from '@/lib/cache';

async function handler(request: NextRequest) {
  try {
    const report = await generateCacheReport();

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cache report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate cache report'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/cache-report
 *
 * Returns comprehensive cache performance metrics:
 * - Hit/miss rates overall and by endpoint
 * - Cost savings calculations
 * - Performance comparisons
 * - Recommendations for optimization
 *
 * Note: Caching temporarily disabled due to type inference issues with error responses.
 * Will be re-enabled after middleware type refinement.
 */
export const GET = handler;

export const runtime = 'nodejs'; // Requires Node.js for Redis
