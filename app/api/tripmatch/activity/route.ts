/**
 * Live Activity Feed API
 * GET /api/tripmatch/activity
 *
 * Returns recent platform activity for social proof
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent members (last 7 days)
    const recentMembers = await prisma.groupMember.findMany({
      where: {
        status: 'confirmed',
        joinedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: {
          select: { name: true },
        },
        tripGroup: {
          select: { title: true, destination: true },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: Math.floor(limit / 2),
    });

    // Get recent trip creations
    const recentTrips = await prisma.tripGroup.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        status: 'published',
      },
      include: {
        creator: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 2),
    });

    // Format activities
    const activities = [
      ...recentMembers.map((member) => ({
        id: `member-${member.id}`,
        type: 'member_joined' as const,
        userName: member.user.name || 'Traveler',
        content: 'joined a trip',
        timestamp: member.joinedAt,
        metadata: {
          tripTitle: member.tripGroup.title,
          destination: member.tripGroup.destination,
        },
      })),
      ...recentTrips.map((trip) => ({
        id: `trip-${trip.id}`,
        type: 'trip_created' as const,
        userName: trip.creator.name || 'Organizer',
        content: 'created a new trip',
        timestamp: trip.createdAt,
        metadata: {
          tripTitle: trip.title,
          destination: trip.destination,
        },
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch activities',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
