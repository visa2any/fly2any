import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/loyalty/redeem
 * Redeem loyalty points
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await liteAPI.redeemLoyaltyPoints(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
