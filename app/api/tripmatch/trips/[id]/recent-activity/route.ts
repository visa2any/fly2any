/**
 * Recent Activity API
 * GET /api/tripmatch/trips/[id]/recent-activity
 *
 * Returns recent bookings for social proof (anonymized for privacy)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;

    // Get recent confirmed members (last 24 hours)
    const recentMembers = await prisma.groupMember.findMany({
      where: {
        tripGroupId: tripId,
        status: 'confirmed',
        joinedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
      take: 5,
    });

    // Anonymize and format
    const recentBookings = recentMembers.map((member) => {
      const firstName = member.user.name?.split(' ')[0] || 'Someone';
      const timeDiff = Date.now() - member.joinedAt.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      const hoursAgo = Math.floor(minutesAgo / 60);

      let timeAgo;
      if (minutesAgo < 60) {
        timeAgo = `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
      } else {
        timeAgo = `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
      }

      return {
        name: `${firstName} from ${member.user.name?.split(' ').pop() || 'USA'}`,
        timeAgo,
      };
    });

    return NextResponse.json({
      success: true,
      recentBookings,
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch recent activity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
