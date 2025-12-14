import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { bookingStorage } from '@/lib/bookings/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/customer/bookings
 * Fetch bookings for the authenticated customer
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch bookings for this customer's email
    const bookings = await bookingStorage.getSummaries({
      email: session.user.email,
      limit,
      offset,
    });

    const totalCount = await bookingStorage.count({
      email: session.user.email,
    });

    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching customer bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
