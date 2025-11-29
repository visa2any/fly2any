import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/guests/[id]
 * Get guest profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guest = await liteAPI.getGuest(params.id);

    return NextResponse.json({
      success: true,
      data: guest,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('not found') ? 404 : 500 }
    );
  }
}

/**
 * PUT /api/guests/[id]
 * Update guest profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const guest = await liteAPI.updateGuest(params.id, body);

    return NextResponse.json({
      success: true,
      data: guest,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('not found') ? 404 : 400 }
    );
  }
}
