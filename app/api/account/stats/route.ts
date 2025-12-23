import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bookingStorage } from '@/lib/bookings/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ success: true, stats: {} });
    }

    // Fetch real stats in parallel
    const [searches, alerts, bookings, user] = await Promise.all([
      prisma.savedSearch.count({ where: { userId: session.user.id } }).catch(() => 0),
      prisma.priceAlert.count({ where: { userId: session.user.id } }).catch(() => 0),
      bookingStorage.count({ userId: session.user.id }).catch(() => 0),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          fly2anyPoints: true,
          tripMatchCredits: true,
          directReferralsCount: true,
        }
      }).catch(() => null),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        searches,
        alerts,
        bookings,
        points: (user?.fly2anyPoints || 0) + (user?.tripMatchCredits || 0),
        referrals: user?.directReferralsCount || 0,
      }
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
