import { NextRequest, NextResponse } from 'next/server';
import { prisma, isPrismaAvailable } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/admin/middleware';

// Force Node.js runtime for database access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - Get User Details
 * GET /api/admin/users/[id]
 *
 * Returns detailed information about a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const userId = params.id;

    console.log('📊 Fetching user details:', userId);

    // Mock user details - replace with real database queries
    const user = {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      emailVerified: true,
      phone: '+1 234 567 8900',

      // Booking statistics
      bookings: {
        total: 12,
        confirmed: 10,
        pending: 1,
        cancelled: 1,
        totalSpent: 4580,
      },

      // Recent bookings
      recentBookings: [
        {
          id: 'booking_1',
          reference: 'FLY2ANY-ABC123',
          route: 'JFK → LAX',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 450,
          status: 'confirmed',
        },
        {
          id: 'booking_2',
          reference: 'FLY2ANY-DEF456',
          route: 'LAX → SFO',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 280,
          status: 'confirmed',
        },
      ],

      // Activity log
      activityLog: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          action: 'login',
          details: 'Successful login from Chrome on Windows',
        },
        {
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          action: 'booking_created',
          details: 'Created booking FLY2ANY-ABC123',
        },
      ],
    };

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('❌ Error fetching user details:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
