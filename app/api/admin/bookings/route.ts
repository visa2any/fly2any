import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import type { BookingStatus } from '@/lib/bookings/types';
import { requireAdmin } from '@/lib/admin/middleware';

// Force Node.js runtime and dynamic rendering for database access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - Get All Bookings
 * GET /api/admin/bookings
 *
 * Query Parameters:
 * - status: Filter by booking status (optional)
 * - limit: Number of results (default: 100)
 * - offset: Pagination offset (default: 0)
 * - email: Filter by customer email (optional)
 */
export async function GET(request: NextRequest) {
  // CRITICAL: Require admin authentication
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401/403 error
  }

  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const status = searchParams.get('status') as BookingStatus | null;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const email = searchParams.get('email') || undefined;

    console.log('📊 Fetching bookings with filters:', { status, limit, offset, email });

    // Fetch booking summaries from database
    const bookingSummaries = await bookingStorage.getSummaries({
      status: status || undefined,
      limit,
      offset,
      email,
    });

    // Get total count
    const totalCount = await bookingStorage.count({
      status: status || undefined,
      email,
    });

    console.log(`✅ Found ${bookingSummaries.length} bookings (${totalCount} total)`);

    return NextResponse.json(
      {
        success: true,
        bookings: bookingSummaries,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error fetching bookings:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bookings',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Admin API - Export Bookings
 * POST /api/admin/bookings (with export=true query param)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get('export') === 'true') {
      // Export functionality - return all bookings as CSV or JSON
      const allBookings = await bookingStorage.getAll();

      return NextResponse.json(
        {
          success: true,
          bookings: allBookings,
          count: allBookings.length,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid operation',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('❌ Error in POST /api/admin/bookings:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Operation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
