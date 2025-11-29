import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/vouchers/[id]
 * Get voucher by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voucher = await liteAPI.getVoucher(params.id);

    return NextResponse.json({
      success: true,
      data: voucher,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('not found') ? 404 : 500 }
    );
  }
}

/**
 * PUT /api/vouchers/[id]
 * Update voucher
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const voucher = await liteAPI.updateVoucher(params.id, body);

    return NextResponse.json({
      success: true,
      data: voucher,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('not found') ? 404 : 400 }
    );
  }
}

/**
 * DELETE /api/vouchers/[id]
 * Delete voucher
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await liteAPI.deleteVoucher(params.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('not found') ? 404 : 500 }
    );
  }
}
