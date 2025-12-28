export const dynamic = 'force-dynamic';

/**
 * Admin API: Price Monitor Status
 *
 * Returns current status and statistics of the price monitoring system.
 *
 * @route GET /api/admin/price-monitor/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMonitoringStats } from '@/lib/services/price-monitor';

/**
 * GET /api/admin/price-monitor/status
 * Get monitoring system status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get monitoring statistics
    const stats = await getMonitoringStats();

    // Calculate next scheduled run (every 6 hours from last run)
    let nextScheduledRun: string | null = null;
    if (stats.lastRun) {
      const nextRun = new Date(stats.lastRun.getTime() + 6 * 60 * 60 * 1000);
      nextScheduledRun = nextRun.toISOString();
    }

    // Determine system health
    const isHealthy = stats.successRate >= 80 && stats.recentErrors < 10;
    const status = isHealthy ? 'healthy' : 'degraded';

    return NextResponse.json(
      {
        success: true,
        status,
        statistics: {
          totalActiveAlerts: stats.totalActiveAlerts,
          lastRun: stats.lastRun,
          nextScheduledRun,
          successRate: stats.successRate,
          recentErrors: stats.recentErrors,
        },
        lastExecution: stats.lastRunStats
          ? {
              alertsChecked: stats.lastRunStats.alertsChecked,
              alertsTriggered: stats.lastRunStats.alertsTriggered,
              alertsFailed: stats.lastRunStats.alertsFailed,
              duration: stats.lastRunStats.duration,
            }
          : null,
        health: {
          status,
          message: isHealthy
            ? 'System is operating normally'
            : 'System is experiencing issues. Please check logs.',
          checks: {
            successRate: {
              value: stats.successRate,
              threshold: 80,
              passing: stats.successRate >= 80,
            },
            recentErrors: {
              value: stats.recentErrors,
              threshold: 10,
              passing: stats.recentErrors < 10,
            },
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Admin] Error getting price monitor status:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get monitoring status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
