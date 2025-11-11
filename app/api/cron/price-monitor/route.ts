/**
 * Cron Job Handler for Price Monitoring
 *
 * This endpoint is called by Vercel Cron (or external cron service)
 * to automatically check price alerts every 6 hours.
 *
 * Authentication: Requires CRON_SECRET token in Authorization header
 * Schedule: Every 6 hours (cron: 0 star-slash-6 star star star)
 *
 * @route GET /api/cron/price-monitor
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitorAllActiveAlerts } from '@/lib/services/price-monitor';

/**
 * GET /api/cron/price-monitor
 * Trigger automated price monitoring
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authentication token
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cron] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    // Check for Bearer token or direct secret
    const token = authHeader?.replace('Bearer ', '');

    if (token !== cronSecret) {
      console.error('[Cron] Invalid authentication token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting automated price monitoring...');

    // Run the price monitoring
    const summary = await monitorAllActiveAlerts('cron');

    const duration = Date.now() - startTime;

    console.log('[Cron] Price monitoring completed successfully');
    console.log(`[Cron] Duration: ${duration}ms`);
    console.log(`[Cron] Summary: ${JSON.stringify(summary)}`);

    // Return summary
    return NextResponse.json(
      {
        success: true,
        message: 'Price monitoring completed',
        summary: {
          alertsChecked: summary.totalChecked,
          alertsTriggered: summary.totalTriggered,
          alertsFailed: summary.totalFailed,
          duration: summary.duration,
          executionTime: new Date().toISOString(),
        },
        errors: summary.errors.length > 0 ? summary.errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Cron] Error during price monitoring:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Price monitoring failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        executionTime: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/cron/price-monitor
 * Health check endpoint for monitoring services
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
