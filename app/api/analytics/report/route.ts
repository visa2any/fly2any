import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/analytics/report
 * Get detailed analytics report
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const report = await liteAPI.getAnalyticsReport(body);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
