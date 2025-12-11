import { NextRequest, NextResponse } from 'next/server';
import { airlineDataService } from '@/lib/airlines/airline-data-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/airlines/stats - Get airline statistics
 *
 * Returns aggregate stats: total airlines, by type, by alliance
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await airlineDataService.getStats();

    if (!stats) {
      return NextResponse.json({
        success: true,
        stats: {
          total: 0,
          byType: [],
          byAlliance: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching airline stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
