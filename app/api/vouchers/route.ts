import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/vouchers
 * Create a new voucher
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const voucher = await liteAPI.createVoucher(body);

    return NextResponse.json({
      success: true,
      data: voucher,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

/**
 * GET /api/vouchers
 * Get all vouchers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const vouchers = await liteAPI.getVouchers({ status, limit, offset });

    return NextResponse.json({
      success: true,
      data: vouchers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
