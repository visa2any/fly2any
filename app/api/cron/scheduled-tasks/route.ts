/**
 * Consolidated Scheduled Tasks Handler
 *
 * This endpoint consolidates multiple scheduled tasks into a single cron job
 * to optimize Vercel cron job usage.
 *
 * Tasks:
 * 1. ML Predictive Pre-fetching (3 AM daily)
 * 2. Price Monitoring (midnight daily)
 *
 * Authentication: Requires either:
 * - Vercel cron header (x-vercel-cron: "1")
 * - CRON_SECRET token in Authorization header
 *
 * @route GET /api/cron/scheduled-tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitorAllActiveAlerts } from '@/lib/services/price-monitor';
import { predictivePreFetcher } from '@/lib/ml/predictive-prefetch';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

/**
 * GET /api/cron/scheduled-tasks
 * Execute all scheduled tasks (runs daily at 3 AM via Vercel cron)
 *
 * This consolidated endpoint runs both:
 * - Price Monitoring
 * - ML Predictive Pre-fetching
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authentication
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const token = authHeader?.replace('Bearer ', '');
    const isManualAuth = cronSecret && token === cronSecret;

    if (!isVercelCron && !isManualAuth) {
      console.error('[Cron] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting consolidated scheduled tasks (daily run at 3 AM)...');

    const tasksExecuted: string[] = [];
    const taskResults: Record<string, any> = {};

    // Task 1: Price Monitoring
    console.log('[Cron] Running price monitoring task...');
    try {
      const summary = await monitorAllActiveAlerts('cron');
      tasksExecuted.push('price-monitoring');
      taskResults.priceMonitoring = {
        success: true,
        alertsChecked: summary.totalChecked,
        alertsTriggered: summary.totalTriggered,
        alertsFailed: summary.totalFailed,
        duration: summary.duration,
        errors: summary.errors.length > 0 ? summary.errors : undefined,
      };
      console.log('[Cron] Price monitoring completed successfully');
    } catch (error) {
      console.error('[Cron] Price monitoring failed:', error);
      tasksExecuted.push('price-monitoring (failed)');
      taskResults.priceMonitoring = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Task 2: ML Predictive Pre-fetching
    console.log('[Cron] Running ML pre-fetch task...');
    try {
      const candidates = await predictivePreFetcher.getPreFetchCandidates(50);

      if (candidates.length > 0) {
        const results = await predictivePreFetcher.executePrefetch(50);
        tasksExecuted.push('ml-prefetch');
        taskResults.mlPrefetch = {
          success: true,
          candidates: candidates.length,
          fetched: results.fetched,
          skipped: results.skipped,
          errors: results.errors,
          totalSavings: parseFloat(results.totalSavings.toFixed(2)),
        };
        console.log('[Cron] ML pre-fetch completed successfully');
      } else {
        tasksExecuted.push('ml-prefetch (no candidates)');
        taskResults.mlPrefetch = {
          success: true,
          message: 'No routes to pre-fetch',
          candidates: 0,
        };
        console.log('[Cron] ML pre-fetch: no candidates found');
      }
    } catch (error) {
      console.error('[Cron] ML pre-fetch failed:', error);
      tasksExecuted.push('ml-prefetch (failed)');
      taskResults.mlPrefetch = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    const duration = Date.now() - startTime;

    console.log('[Cron] Consolidated tasks completed');
    console.log(`[Cron] Duration: ${duration}ms`);
    console.log(`[Cron] Tasks executed: ${tasksExecuted.join(', ')}`);

    // Return summary
    return NextResponse.json(
      {
        success: true,
        message: 'All scheduled tasks completed',
        executionTime: new Date().toISOString(),
        tasksExecuted,
        duration,
        results: taskResults,
      },
      { status: 200 }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Cron] Error during scheduled tasks:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Scheduled tasks failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        executionTime: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/cron/scheduled-tasks
 * Health check endpoint
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

/**
 * POST /api/cron/scheduled-tasks
 * Manually trigger specific task(s)
 *
 * Body params:
 * - tasks: string[] - Array of tasks to run: ['price-monitoring', 'ml-prefetch']
 * - force: boolean - Force execution regardless of time
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const token = authHeader?.replace('Bearer ', '');
    const isManualAuth = cronSecret && token === cronSecret;

    if (!isManualAuth) {
      console.error('[Cron] Unauthorized manual trigger attempt');
      return NextResponse.json(
        { error: 'Unauthorized - valid Bearer token required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const tasks = body.tasks || ['price-monitoring', 'ml-prefetch'];
    const force = body.force || false;

    console.log(`[Cron] Manual trigger: tasks=${tasks.join(',')}, force=${force}`);

    const tasksExecuted: string[] = [];
    const taskResults: Record<string, any> = {};

    // Execute requested tasks
    if (tasks.includes('price-monitoring')) {
      console.log('[Cron] Running price monitoring task (manual)...');
      try {
        const summary = await monitorAllActiveAlerts('manual');
        tasksExecuted.push('price-monitoring');
        taskResults.priceMonitoring = {
          success: true,
          alertsChecked: summary.totalChecked,
          alertsTriggered: summary.totalTriggered,
          alertsFailed: summary.totalFailed,
          duration: summary.duration,
        };
      } catch (error) {
        console.error('[Cron] Price monitoring failed:', error);
        tasksExecuted.push('price-monitoring (failed)');
        taskResults.priceMonitoring = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    if (tasks.includes('ml-prefetch')) {
      console.log('[Cron] Running ML pre-fetch task (manual)...');
      try {
        const candidates = await predictivePreFetcher.getPreFetchCandidates(50);
        const results = await predictivePreFetcher.executePrefetch(50);
        tasksExecuted.push('ml-prefetch');
        taskResults.mlPrefetch = {
          success: true,
          candidates: candidates.length,
          fetched: results.fetched,
          skipped: results.skipped,
          totalSavings: parseFloat(results.totalSavings.toFixed(2)),
        };
      } catch (error) {
        console.error('[Cron] ML pre-fetch failed:', error);
        tasksExecuted.push('ml-prefetch (failed)');
        taskResults.mlPrefetch = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        message: 'Manual tasks completed',
        executionTime: new Date().toISOString(),
        tasksExecuted,
        duration,
        results: taskResults,
      },
      { status: 200 }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Cron] Error during manual task execution:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Manual task execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        executionTime: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
