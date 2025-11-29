import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/vouchers/history
 * Get voucher redemption history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const voucherId = searchParams.get('voucherId') || undefined;
    const guestId = searchParams.get('guestId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    const history = await liteAPI.getVoucherHistory({ voucherId, guestId, limit });

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
