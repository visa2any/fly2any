import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const now = new Date();
    const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Get bookings for last 24h and previous 24h
    const [bookings24h, bookings48h, recentBookings] = await Promise.all([
      prisma.booking.count({ where: { createdAt: { gte: h24 } } }).catch(() => 0),
      prisma.booking.count({ where: { createdAt: { gte: h48, lt: h24 } } }).catch(() => 0),
      prisma.booking.findMany({
        where: { createdAt: { gte: h24 } },
        select: { totalAmount: true },
      }).catch(() => []),
    ]);

    const revenue = recentBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
    const bookingChange = bookings48h > 0 ? Math.round(((bookings24h - bookings48h) / bookings48h) * 100) : 0;

    // Searches from analytics events (if table exists)
    let searches = 0;
    let searchChange = 0;
    try {
      const s24 = await prisma.analyticsEvent.count({
        where: { eventType: 'flight_search', createdAt: { gte: h24 } }
      });
      const s48 = await prisma.analyticsEvent.count({
        where: { eventType: 'flight_search', createdAt: { gte: h48, lt: h24 } }
      });
      searches = s24;
      searchChange = s48 > 0 ? Math.round(((s24 - s48) / s48) * 100) : 0;
    } catch {
      // Table may not exist
    }

    return NextResponse.json({
      searches,
      searchChange,
      bookings: bookings24h,
      bookingChange,
      revenue,
      revenueChange: bookingChange, // Approximate
      activeUsers: Math.max(searches, bookings24h * 10), // Estimate
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    return NextResponse.json({ searches: 0, bookings: 0, revenue: 0, activeUsers: 0 });
  }
}
