/**
 * TripMatch Potential Matches API
 *
 * GET /api/tripmatch/potential-matches - Get potential travel companions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/tripmatch/auth-helpers';

/**
 * GET /api/tripmatch/potential-matches
 *
 * Get list of potential matches based on compatibility algorithm
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user's own profile to use for matching
    const myProfile = await prisma.tripMatchUserProfile.findUnique({
      where: { userId },
    });

    if (!myProfile) {
      return NextResponse.json({
        success: false,
        error: 'Profile not found',
      }, { status: 404 });
    }

    // Get users that the current user has already swiped on
    const existingMatches = await prisma.travelerMatch.findMany({
      where: {
        fromUserId: userId,
      },
      select: {
        toUserId: true,
      },
    });

    const swipedUserIds = new Set(
      existingMatches.map(m => m.toUserId)
    );

    // Find potential matches (exclude self and already swiped users)
    const potentialMatches = await prisma.tripMatchUserProfile.findMany({
      where: {
        userId: {
          not: userId,
          notIn: Array.from(swipedUserIds),
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate match scores based on shared interests and travel style
    const matchesWithScores = potentialMatches.map(profile => {
      let score = 50; // Base score

      // Shared travel styles (+5 points each)
      const sharedTravelStyles = myProfile.travelStyle.filter(style =>
        profile.travelStyle.includes(style)
      );
      score += sharedTravelStyles.length * 5;

      // Shared interests (+3 points each)
      const sharedInterests = myProfile.interests.filter(interest =>
        profile.interests.includes(interest)
      );
      score += sharedInterests.length * 3;

      // Shared languages (+8 points each)
      const sharedLanguages = myProfile.languagesSpoken.filter(lang =>
        profile.languagesSpoken.includes(lang)
      );
      score += sharedLanguages.length * 8;

      // Verification bonus (+10 points)
      if (profile.verificationLevel >= 3) {
        score += 10;
      }

      // Good rating bonus (+5 points if > 4.0)
      if (profile.avgRating >= 4.0) {
        score += 5;
      }

      // Cap at 100
      score = Math.min(100, score);

      return {
        ...profile,
        matchScore: score,
      };
    });

    // Sort by match score (highest first)
    matchesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      data: matchesWithScores,
      count: matchesWithScores.length,
    });

  } catch (error: any) {
    console.error('❌ Error fetching potential matches:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch potential matches',
      message: error.message,
    }, { status: 500 });
  }
}
