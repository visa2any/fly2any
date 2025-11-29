import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/markets
 * Get market-specific data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get('marketId');
    
    if (!marketId) {
      return NextResponse.json(
        { success: false, error: 'marketId is required' },
        { status: 400 }
      );
    }

    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const marketData = await liteAPI.getMarketData(marketId, { startDate, endDate });

    return NextResponse.json({
      success: true,
      data: marketData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
