import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/guests/[id]/loyalty-points/history
 * Get loyalty points transaction history for a guest
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guestId } = await params;

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: 'Guest ID required' },
        { status: 400 }
      );
    }

    // Verify user is authenticated and authorized
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    console.log(`📊 Getting loyalty points history for guest ${guestId}`);

    const history = await liteAPI.getLoyaltyHistory(guestId, limit);

    return NextResponse.json({
      success: true,
      data: history,
      meta: {
        guestId,
        count: history.length,
        limit,
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to get loyalty history:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get loyalty history' },
      { status: 500 }
    );
  }
}
