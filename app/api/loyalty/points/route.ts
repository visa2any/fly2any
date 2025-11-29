import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/loyalty/points?guestId=xxx
 * Get guest loyalty points balance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: 'guestId is required' },
        { status: 400 }
      );
    }

    const points = await liteAPI.getGuestLoyaltyPoints(guestId);

    return NextResponse.json({
      success: true,
      data: points,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('not found') ? 404 : 500 }
    );
  }
}
