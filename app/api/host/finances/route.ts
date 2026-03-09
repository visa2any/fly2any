import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfWeek, subWeeks, subYears } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get Property Owner
    const owner = await prisma.propertyOwner.findUnique({
      where: { userId: session.user.id },
    });

    if (!owner) {
      return NextResponse.json({
        success: true,
        data: {
          monthlyData: [],
          pacingData: [],
          netYTD: 0,
          upcomingPayouts: 0,
          platformFees: 0,
          pacingStatus: 'Ahead',
          totalBookings: 0,
          avgBookingValue: 0,
        },
      });
    }

    // 2. Fetch all confirmed/completed bookings for this owner's properties (this year & last year)
    const now = new Date();
    const startOfThisYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);

    const bookings = await prisma.propertyBooking.findMany({
      where: {
        property: { ownerId: owner.id },
        status: { in: ['confirmed', 'completed'] },
        createdAt: { gte: startOfLastYear },
      },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        startDate: true,
      },
    });

    // --- A. Monthly Revenue (YTD) ---
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = new Map<string, { gross: number; net: number }>();
    monthNames.forEach((m) => monthlyMap.set(m, { gross: 0, net: 0 }));

    let netYTD = 0;
    let platformFees = 0;
    let upcomingPayouts = 0;

    const thisYearBookings = bookings.filter((b) => b.createdAt >= startOfThisYear);

    thisYearBookings.forEach((booking) => {
      const monthIndex = booking.createdAt.getMonth();
      const monthName = monthNames[monthIndex];

      const gross = booking.totalPrice;
      const fee = gross * 0.15; // 15% platform fee
      const net = gross - fee;

      netYTD += net;
      platformFees += fee;

      // Upcoming payouts: bookings with future startDate
      if (booking.startDate > now) {
        upcomingPayouts += net;
      }

      const current = monthlyMap.get(monthName)!;
      monthlyMap.set(monthName, {
        gross: current.gross + gross,
        net: current.net + net,
      });
    });

    const monthlyData = Array.from(monthlyMap.entries()).map(([name, data]) => ({
      name,
      gross: Math.round(data.gross),
      net: Math.round(data.net),
    }));

    // --- B. YoY Weekly Pacing (Last 4 Weeks) ---
    const pacingData = [];
    const currentYearString = now.getFullYear().toString();
    const lastYearString = (now.getFullYear() - 1).toString();

    for (let i = 3; i >= 0; i--) {
      const weekStartThisYear = subWeeks(startOfWeek(now), i);
      const weekEndThisYear = new Date(weekStartThisYear);
      weekEndThisYear.setDate(weekEndThisYear.getDate() + 7);

      const weekStartLastYear = subYears(weekStartThisYear, 1);
      const weekEndLastYear = subYears(weekEndThisYear, 1);

      const revThisYear = bookings
        .filter((b) => b.createdAt >= weekStartThisYear && b.createdAt < weekEndThisYear)
        .reduce((sum, b) => sum + b.totalPrice, 0);

      const revLastYear = bookings
        .filter((b) => b.createdAt >= weekStartLastYear && b.createdAt < weekEndLastYear)
        .reduce((sum, b) => sum + b.totalPrice, 0);

      pacingData.push({
        name: `Week -${i}`,
        [currentYearString]: Math.round(revThisYear),
        [lastYearString]: Math.round(revLastYear),
      });
    }

    // --- C. Aggregates ---
    const totalBookings = thisYearBookings.length;
    const avgBookingValue =
      totalBookings > 0
        ? Math.round(thisYearBookings.reduce((sum, b) => sum + b.totalPrice, 0) / totalBookings)
        : 0;

    // Pacing status: compare latest week this year vs last year
    const latestWeekThisYear = pacingData[3]?.[currentYearString] ?? 0;
    const latestWeekLastYear = pacingData[3]?.[lastYearString] ?? 0;
    const pacingStatus = latestWeekThisYear >= latestWeekLastYear ? 'Ahead' : 'Behind';

    return NextResponse.json({
      success: true,
      data: {
        monthlyData,
        pacingData,
        netYTD: Math.round(netYTD),
        upcomingPayouts: Math.round(upcomingPayouts),
        platformFees: Math.round(platformFees),
        pacingStatus,
        totalBookings,
        avgBookingValue,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Finances API Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
