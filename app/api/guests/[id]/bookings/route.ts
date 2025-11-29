import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/guests/[id]/bookings
 * Get guest booking history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    const bookings = await liteAPI.getGuestBookings(params.id, { status, limit });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('not found') ? 404 : 500 }
    );
  }
}
