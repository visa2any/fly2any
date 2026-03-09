import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const property = await prisma.property.findUnique({
      where: { id },
      select: { city: true, owner: { select: { userId: true } } }
    });

    if (!property || property.owner.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized or not found' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');

    const startDate = startStr ? new Date(startStr) : new Date();
    const endDate = endStr ? new Date(endStr) : new Date();

    if (!startStr) {
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 2);
    }

    // Find bookings in same city that overlap with date range
    const cityBookings = await prisma.propertyBooking.findMany({
      where: {
        property: { city: property.city },
        status: { in: ['confirmed', 'completed'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate }
      },
      select: { startDate: true, endDate: true }
    });

    // Bucket by day
    const demandScores: Record<string, number> = {};

    for (const b of cityBookings) {
      let current = new Date(Math.max(b.startDate.getTime(), startDate.getTime()));
      const end = new Date(Math.min(b.endDate.getTime(), endDate.getTime()));

      while (current < end) {
        const dateStr = format(current, 'yyyy-MM-dd');
        demandScores[dateStr] = (demandScores[dateStr] || 0) + 1;
        current.setDate(current.getDate() + 1);
      }
    }

    // Calculate percentiles
    const rawScores = Object.values(demandScores);
    const scoreMap: Record<string, 'peak' | 'high' | 'normal'> = {};

    if (rawScores.length > 0) {
      rawScores.sort((a, b) => a - b);
      const peakThreshold = rawScores[Math.floor(rawScores.length * 0.8)] || 1;
      const highThreshold = rawScores[Math.floor(rawScores.length * 0.5)] || 1;

      for (const [date, count] of Object.entries(demandScores)) {
        if (count >= peakThreshold && count > 0) {
          scoreMap[date] = 'peak';
        } else if (count >= highThreshold && count > 0) {
          scoreMap[date] = 'high';
        } else {
          scoreMap[date] = 'normal';
        }
      }
    }

    return NextResponse.json({ success: true, data: scoreMap });
  } catch (error: unknown) {
    console.error('Demand API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to calculate market demand' }, { status: 500 });
  }
}
