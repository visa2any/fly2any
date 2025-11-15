import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Admin authentication check
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Search filter (confirmation number, guest email, hotel name)
    if (search) {
      where.OR = [
        { confirmationNumber: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { hotelName: { contains: search, mode: 'insensitive' } },
        { hotelCity: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.hotelBooking.findMany({
        where,
        orderBy: {
          createdAt: sortBy === 'newest' ? 'desc' : 'asc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.hotelBooking.count({ where }),
    ]);

    // Calculate revenue statistics
    const allBookings = await prisma.hotelBooking.findMany({
      where: {
        status: { in: ['confirmed', 'completed'] },
        paymentStatus: 'succeeded',
      },
      select: { totalPrice: true, currency: true },
    });

    const totalRevenue = allBookings.reduce(
      (sum, booking) => sum + parseFloat(booking.totalPrice.toString()),
      0
    );

    // Status breakdown
    const statusCounts = await prisma.hotelBooking.groupBy({
      by: ['status'],
      _count: true,
    });

    const stats = {
      total,
      confirmed: statusCounts.find((s) => s.status === 'confirmed')?._count || 0,
      pending: statusCounts.find((s) => s.status === 'pending')?._count || 0,
      completed: statusCounts.find((s) => s.status === 'completed')?._count || 0,
      cancelled: statusCounts.find((s) => s.status === 'cancelled')?._count || 0,
      totalRevenue,
    };

    return NextResponse.json({
      success: true,
      bookings,
      total,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin hotel bookings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hotel bookings',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Update booking status (for admin actions like cancel, refund)
export async function PATCH(request: NextRequest) {
  try {
    // Admin authentication check
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bookingId, status, paymentStatus, notes } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Update booking
    const updatedBooking = await prisma.hotelBooking.update({
      where: { id: bookingId },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error('Error updating hotel booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update hotel booking',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
