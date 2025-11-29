import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/guests
 * Create a new guest profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const guest = await liteAPI.createGuest(body);

    return NextResponse.json({
      success: true,
      data: guest,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
