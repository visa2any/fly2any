import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/prebooks/[id]
 * Get prebook session status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prebookId = params.id;
    const statusData = await liteAPI.getPrebookStatus(prebookId);

    return NextResponse.json({
      success: true,
      data: statusData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('not found') ? 404 : 500 }
    );
  }
}
