/**
 * Loyalty Program Configuration API
 * GET - Get current loyalty settings
 * PUT - Update loyalty settings (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/loyalty/config - Get loyalty program settings
export async function GET() {
  try {
    const config = await liteAPI.getLoyaltyConfig();

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error('Error fetching loyalty config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch loyalty config' },
      { status: 500 }
    );
  }
}

// PUT /api/loyalty/config - Update loyalty settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    // TODO: Add admin check
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, cashbackRate } = body;

    // Validate inputs
    if (status && !['enabled', 'disabled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be "enabled" or "disabled"' },
        { status: 400 }
      );
    }

    if (cashbackRate !== undefined && (cashbackRate < 0 || cashbackRate > 1)) {
      return NextResponse.json(
        { success: false, error: 'Cashback rate must be between 0 and 1' },
        { status: 400 }
      );
    }

    const config = await liteAPI.updateLoyaltyConfig({ status, cashbackRate });

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Loyalty config updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating loyalty config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update loyalty config' },
      { status: 500 }
    );
  }
}
