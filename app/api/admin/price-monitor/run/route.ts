/**
 * Admin API: Manual Price Monitor Trigger
 *
 * Allows administrators to manually trigger price monitoring
 * outside of the scheduled cron job.
 *
 * @route POST /api/admin/price-monitor/run
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { monitorAllActiveAlerts } from '@/lib/services/price-monitor';

/**
 * POST /api/admin/price-monitor/run
 * Manually trigger price monitoring
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check when role system is implemented
    // For now, any authenticated user can trigger (update in production)
    console.log(`[Admin] Manual price monitoring triggered by ${session.user.email}`);

    // Run the price monitoring
    const summary = await monitorAllActiveAlerts('manual');

    const duration = Date.now() - startTime;

    console.log('[Admin] Manual price monitoring completed');
    console.log(`[Admin] Duration: ${duration}ms`);
    console.log(`[Admin] Summary: ${JSON.stringify(summary)}`);

    // Return detailed summary
    return NextResponse.json(
      {
        success: true,
        message: 'Price monitoring completed successfully',
        summary: {
          totalChecked: summary.totalChecked,
          totalTriggered: summary.totalTriggered,
          totalFailed: summary.totalFailed,
          duration: summary.duration,
          executionTime: new Date().toISOString(),
          triggeredBy: session.user.email,
        },
        errors: summary.errors.length > 0 ? summary.errors : [],
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Admin] Error during manual price monitoring:', error);

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
