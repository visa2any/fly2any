import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/weekly
 * Get weekly analytics report
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStartDate = searchParams.get('weekStartDate') || undefined;

    const analytics = await liteAPI.getWeeklyAnalytics(weekStartDate);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
