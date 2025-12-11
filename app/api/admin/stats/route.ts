import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/middleware';

// Force Node.js runtime for database access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - Dashboard Statistics
 * GET /api/admin/stats?period=week|month|year|all
 *
 * Returns aggregated statistics for the admin dashboard
 * - Bookings (total, confirmed, pending, cancelled, revenue)
 * - Users (total, active, new registrations)
 * - Searches (total by service type)
 * - Revenue metrics with trends
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousEndDate = new Date(startDate.getTime() - 1);
        previousStartDate = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), previousEndDate.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEndDate = new Date(startDate.getTime() - 1);
        previousStartDate = new Date(previousEndDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousEndDate = new Date(startDate.getTime() - 1);
        previousStartDate = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousEndDate = new Date(startDate.getTime() - 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      case 'all':
      default:
        startDate = new Date(0);
        previousStartDate = new Date(0);
        previousEndDate = new Date(0);
        break;
    }

    // Fetch real data from database
    const [
      // User counts
      totalUsers,
      newUsers,
      previousNewUsers,
      activeUsers,

      // Hotel Booking counts
      hotelBookings,
      confirmedHotelBookings,
      pendingHotelBookings,
      cancelledHotelBookings,
      previousHotelBookings,

      // Agent Booking counts
      agentBookings,
      confirmedAgentBookings,
      pendingAgentBookings,
      cancelledAgentBookings,

      // Search counts
      totalSearches,
      previousSearches,

      // Recent activity
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      // User queries
      prisma?.user.count() || 0,
      prisma?.user.count({ where: { createdAt: { gte: startDate } } }) || 0,
      period !== 'all' ? (prisma?.user.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } }) || 0) : 0,
      prisma?.user.count({ where: { updatedAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } }) || 0,

      // Hotel Booking queries
      prisma?.hotelBooking.count({ where: { createdAt: { gte: startDate } } }) || 0,
      prisma?.hotelBooking.count({ where: { status: 'confirmed', createdAt: { gte: startDate } } }) || 0,
      prisma?.hotelBooking.count({ where: { status: 'pending', createdAt: { gte: startDate } } }) || 0,
      prisma?.hotelBooking.count({ where: { status: 'cancelled', createdAt: { gte: startDate } } }) || 0,
      period !== 'all' ? (prisma?.hotelBooking.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } }) || 0) : 0,

      // Agent Booking queries
      prisma?.agentBooking.count({ where: { createdAt: { gte: startDate } } }) || 0,
      prisma?.agentBooking.count({ where: { status: 'CONFIRMED', createdAt: { gte: startDate } } }) || 0,
      prisma?.agentBooking.count({ where: { status: 'PENDING', createdAt: { gte: startDate } } }) || 0,
      prisma?.agentBooking.count({ where: { status: 'CANCELLED', createdAt: { gte: startDate } } }) || 0,

      // Search queries
      prisma?.recentSearch.count({ where: { createdAt: { gte: startDate } } }) || 0,
      period !== 'all' ? (prisma?.recentSearch.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } }) || 0) : 0,

      // Recent activity for display
      prisma?.hotelBooking.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          confirmationNumber: true,
          hotelName: true,
          hotelCity: true,
          totalPrice: true,
          status: true,
          createdAt: true,
        },
      }) || [],
      prisma?.user.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }) || [],
    ]);

    // Calculate revenue from hotel bookings
    const hotelRevenueResult = await prisma?.hotelBooking.aggregate({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'completed',
      },
      _sum: { totalPrice: true },
    });
    const hotelRevenue = Number(hotelRevenueResult?._sum?.totalPrice || 0);

    // Calculate revenue from agent bookings
    const agentRevenueResult = await prisma?.agentBooking.aggregate({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'FULLY_PAID',
      },
      _sum: { total: true },
    });
    const agentRevenue = Number(agentRevenueResult?._sum?.total || 0);

    // Previous period revenue
    let previousHotelRevenue = 0;
    let previousAgentRevenue = 0;
    if (period !== 'all') {
      const prevHotelRev = await prisma?.hotelBooking.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          paymentStatus: 'completed',
        },
        _sum: { totalPrice: true },
      });
      previousHotelRevenue = Number(prevHotelRev?._sum?.totalPrice || 0);

      const prevAgentRev = await prisma?.agentBooking.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          paymentStatus: 'FULLY_PAID',
        },
        _sum: { total: true },
      });
      previousAgentRevenue = Number(prevAgentRev?._sum?.total || 0);
    }

    // Get user registrations by day for the chart
    const daysToShow = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 30;
    const registrationsByDay = await getRegistrationsByDay(startDate, daysToShow);

    // Get revenue by day for the chart
    const revenueByDay = await getRevenueByDay(startDate, daysToShow);

    // Get top destinations from searches
    const topRoutes = await getTopRoutes(startDate);

    // Calculate totals
    const totalBookings = hotelBookings + agentBookings;
    const totalConfirmed = confirmedHotelBookings + confirmedAgentBookings;
    const totalPending = pendingHotelBookings + pendingAgentBookings;
    const totalCancelled = cancelledHotelBookings + cancelledAgentBookings;
    const totalRevenue = hotelRevenue + agentRevenue;
    const previousTotalRevenue = previousHotelRevenue + previousAgentRevenue;
    const previousTotalBookings = previousHotelBookings;

    // Calculate percentage changes
    const bookingChange = previousTotalBookings > 0
      ? ((totalBookings - previousTotalBookings) / previousTotalBookings) * 100
      : 0;
    const userChange = previousNewUsers > 0
      ? ((newUsers - previousNewUsers) / previousNewUsers) * 100
      : 0;
    const searchChange = previousSearches > 0
      ? ((totalSearches - previousSearches) / previousSearches) * 100
      : 0;
    const revenueChange = previousTotalRevenue > 0
      ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
      : 0;

    // Calculate conversion rate
    const conversionRate = totalSearches > 0 ? (totalBookings / totalSearches) * 100 : 0;

    // Calculate average booking value
    const averageValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const stats = {
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },

      // Bookings metrics
      bookings: {
        total: totalBookings,
        confirmed: totalConfirmed,
        pending: totalPending,
        cancelled: totalCancelled,
        revenue: totalRevenue,
        averageValue: Math.round(averageValue),
        change: parseFloat(bookingChange.toFixed(1)),
        byStatus: {
          confirmed: totalConfirmed,
          pending: totalPending,
          cancelled: totalCancelled,
        },
      },

      // Users metrics
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        change: parseFloat(userChange.toFixed(1)),
        registrationsByDay,
      },

      // Searches metrics
      searches: {
        total: totalSearches,
        flights: totalSearches, // All searches are currently flight searches
        hotels: 0, // Can be added when hotel search tracking is implemented
        cars: 0,
        conversion: parseFloat(conversionRate.toFixed(2)),
        change: parseFloat(searchChange.toFixed(1)),
      },

      // Revenue metrics
      revenue: {
        total: totalRevenue,
        thisMonth: totalRevenue,
        lastMonth: previousTotalRevenue,
        change: parseFloat(revenueChange.toFixed(1)),
        byDay: revenueByDay,
        averageBookingValue: Math.round(averageValue),
      },

      // Conversion metrics
      conversion: {
        overall: parseFloat(conversionRate.toFixed(2)),
        flights: parseFloat(conversionRate.toFixed(2)),
        hotels: 0,
        cars: 0,
      },

      // Top routes/destinations
      topRoutes,

      // Recent activity
      recentActivity: {
        bookings: recentBookings,
        users: recentUsers,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Error fetching admin stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to get user registrations by day
async function getRegistrationsByDay(startDate: Date, days: number): Promise<Array<{ date: string; count: number }>> {
  const data: Array<{ date: string; count: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await prisma?.user.count({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    }) || 0;

    data.push({
      date: dayStart.toISOString().split('T')[0],
      count,
    });
  }

  return data;
}

// Helper function to get revenue by day
async function getRevenueByDay(startDate: Date, days: number): Promise<Array<{ date: string; amount: number }>> {
  const data: Array<{ date: string; amount: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // Hotel booking revenue
    const hotelRevenue = await prisma?.hotelBooking.aggregate({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        paymentStatus: 'completed',
      },
      _sum: { totalPrice: true },
    });

    // Agent booking revenue
    const agentRevenue = await prisma?.agentBooking.aggregate({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        paymentStatus: 'FULLY_PAID',
      },
      _sum: { total: true },
    });

    const totalAmount = Number(hotelRevenue?._sum?.totalPrice || 0) + Number(agentRevenue?._sum?.total || 0);

    data.push({
      date: dayStart.toISOString().split('T')[0],
      amount: Math.round(totalAmount),
    });
  }

  return data;
}

// Helper function to get top routes/destinations
async function getTopRoutes(startDate: Date): Promise<Array<{ from: string; to: string; count: number; revenue: number }>> {
  // Get top destinations from recent searches
  const searches = await prisma?.recentSearch.groupBy({
    by: ['origin', 'airportCode'],
    where: { createdAt: { gte: startDate } },
    _count: { id: true },
    _sum: { price: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  if (!searches || searches.length === 0) {
    return [];
  }

  return searches.map(s => ({
    from: s.origin || 'N/A',
    to: s.airportCode,
    count: s._count.id,
    revenue: Math.round(s._sum.price || 0),
  }));
}
