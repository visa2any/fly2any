/**
 * Predictive Pre-Fetching API
 * Runs background job to pre-fetch popular routes
 * Can be triggered by cron job or manually
 */

import { NextRequest, NextResponse } from 'next/server';
import { predictivePreFetcher } from '@/lib/ml/predictive-prefetch';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

/**
 * POST /api/ml/prefetch
 * Trigger pre-fetching of popular routes
 *
 * Body params:
 * - limit: number (default: 50) - max routes to pre-fetch
 * - force: boolean (default: false) - force run even during non-off-peak hours
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 50;
    const force = body.force || false;

    // Check authorization (optional - add your own auth here)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid cron secret' },
        { status: 401 }
      );
    }

    console.log(`🚀 Pre-fetch triggered: limit=${limit}, force=${force}`);

    // Check if it's off-peak hours (unless forced)
    if (!force && !predictivePreFetcher.isOffPeakHour()) {
      return NextResponse.json(
        {
          status: 'skipped',
          reason: 'Not off-peak hours (run between 2-6 AM EST)',
          currentHour: new Date().getHours(),
          message: 'Use force=true to run anyway',
        },
        { status: 200 }
      );
    }

    // Get candidates first to show what will be pre-fetched
    const candidates = await predictivePreFetcher.getPreFetchCandidates(limit);

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          status: 'completed',
          message: 'No routes found for pre-fetching',
          candidates: 0,
          fetched: 0,
          skipped: 0,
          errors: 0,
          totalSavings: 0,
        },
        { status: 200 }
      );
    }

    // Execute pre-fetching
    const results = await predictivePreFetcher.executePrefetch(limit);

    const response = {
      status: 'completed',
      timestamp: new Date().toISOString(),
      results: {
        candidates: candidates.length,
        fetched: results.fetched,
        skipped: results.skipped,
        errors: results.errors,
        totalSavings: parseFloat(results.totalSavings.toFixed(2)),
      },
      topCandidates: candidates.slice(0, 10).map(c => ({
        route: c.route,
        priority: c.priority,
        expectedSearches: c.expectedSearches,
        estimatedSavings: c.estimatedSavings,
        departureDate: c.departureDate,
      })),
      message: `Pre-fetched ${results.fetched} routes, skipped ${results.skipped} (already cached), ${results.errors} errors`,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store',
      },
    });

  } catch (error: any) {
    console.error('Pre-fetch API error:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to execute pre-fetch',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ml/prefetch
 * Get pre-fetch candidates without executing
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get candidates
    const candidates = await predictivePreFetcher.getPreFetchCandidates(limit);

    // Check if it's off-peak hours
    const isOffPeak = predictivePreFetcher.isOffPeakHour();
    const currentHour = new Date().getHours();

    const response = {
      status: 'preview',
      timestamp: new Date().toISOString(),
      offPeakHours: {
        current: currentHour,
        isOffPeak,
        nextWindow: isOffPeak ? 'Now' : '2-6 AM EST',
      },
      candidates: candidates.map(c => ({
        route: c.route,
        origin: c.origin,
        destination: c.destination,
        departureDate: c.departureDate,
        returnDate: c.returnDate,
        priority: c.priority,
        expectedSearches: c.expectedSearches,
        estimatedSavings: parseFloat(c.estimatedSavings.toFixed(2)),
      })),
      summary: {
        totalCandidates: candidates.length,
        totalExpectedSearches: candidates.reduce((sum, c) => sum + c.expectedSearches, 0),
        totalEstimatedSavings: parseFloat(candidates.reduce((sum, c) => sum + c.estimatedSavings, 0).toFixed(2)),
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minutes
      },
    });

  } catch (error: any) {
    console.error('Pre-fetch preview error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get pre-fetch candidates',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
