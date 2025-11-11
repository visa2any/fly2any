/**
 * Admin API: Price Monitor Logs
 *
 * Returns execution history logs with pagination support.
 *
 * @route GET /api/admin/price-monitor/logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getExecutionLogs } from '@/lib/services/price-monitor';

/**
 * GET /api/admin/price-monitor/logs
 * Get execution logs with pagination
 *
 * Query parameters:
 * - limit: Number of logs to return (default: 20, max: 100)
 * - offset: Number of logs to skip (default: 0)
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    // Validate parameters
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Get execution logs
    const { logs, total } = await getExecutionLogs({ limit, offset });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const hasNextPage = offset + limit < total;
    const hasPreviousPage = offset > 0;

    return NextResponse.json(
      {
        success: true,
        logs: logs.map(log => ({
          id: log.id,
          executionTime: log.executionTime,
          alertsChecked: log.alertsChecked,
          alertsTriggered: log.alertsTriggered,
          alertsFailed: log.alertsFailed,
          duration: log.duration,
          triggeredBy: log.triggeredBy,
          hasErrors: log.errors !== null,
          errors: log.errors,
        })),
        pagination: {
          total,
          limit,
          offset,
          currentPage,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Admin] Error getting price monitor logs:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get monitoring logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
