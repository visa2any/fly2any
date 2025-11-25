/**
 * Cron Job Handler for Price Monitoring
 *
 * This endpoint is called by Vercel Cron (or external cron service)
 * to automatically check price alerts.
 *
 * Authentication: Vercel cron header or CRON_SECRET Bearer token
 * Schedule: Every 4 hours
 *
 * @route GET /api/cron/price-monitor
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitorAllActiveAlerts } from '@/lib/services/price-monitor';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

/**
 * Verify Vercel cron or manual authentication
 */
function isAuthorized(request: NextRequest): boolean {
  // Method 1: Vercel cron (automatic) - sends x-vercel-cron: "1"
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (isVercelCron) return true;

  // Method 2: Manual trigger - uses Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const token = authHeader?.replace('Bearer ', '');
  const isManualAuth = !!(cronSecret && token === cronSecret);

  return isManualAuth;
}

/**
 * GET /api/cron/price-monitor
 * Trigger automated price monitoring
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authentication (Vercel cron or manual)
    if (!isAuthorized(request)) {
      console.error('[Cron] Unauthorized price-monitor request');
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
