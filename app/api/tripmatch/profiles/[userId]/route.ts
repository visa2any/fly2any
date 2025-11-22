/**
 * TripMatch User Profile API
 *
 * GET /api/tripmatch/profiles/[userId] - Get user's public profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/tripmatch/profiles/[userId]
 *
 * Get a user's TripMatch profile (public view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
    }

    // Check if database is configured
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get profile with related data
    const profile = await prisma.tripMatchUserProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            posts: true,
            reviewsReceived: true,
            reviewsGiven: true,
            connectionsFrom: true,
            connectionsTo: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'Profile not found',
      }, { status: 404 });
    }

    // Get recent reviews (public only)
    const recentReviews = await prisma.tripReview.findMany({
      where: {
        reviewedUserId: userId,
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        reviewer: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Calculate stats
    const stats = {
      totalPosts: profile._count.posts,
      totalReviews: profile._count.reviewsReceived,
      totalConnections: profile._count.connectionsFrom + profile._count.connectionsTo,
      responseRate: 95, // TODO: Calculate from actual message data
      averageResponseTime: '< 1 hour', // TODO: Calculate from actual data
    };

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        userId: profile.userId,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        coverImageUrl: profile.coverImageUrl,
        travelStyle: profile.travelStyle,
        interests: profile.interests,
        languagesSpoken: profile.languagesSpoken,
        ageRange: profile.ageRange,
        gender: profile.gender,
        locationCity: profile.locationCity,
        locationCountry: profile.locationCountry,
        emailVerified: profile.emailVerified,
        phoneVerified: profile.phoneVerified,
        idVerified: profile.idVerified,
        safetyScore: profile.safetyScore,
        verificationLevel: profile.verificationLevel,
        tripsCreated: profile.tripsCreated,
        tripsJoined: profile.tripsJoined,
        tripsCompleted: profile.tripsCompleted,
        totalCompanionsMet: profile.totalCompanionsMet,
        avgRating: profile.avgRating,
        totalReviews: profile.totalReviews,
        memberSince: profile.user.createdAt,
        stats,
        recentReviews,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching profile:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message,
    }, { status: 500 });
  }
}
