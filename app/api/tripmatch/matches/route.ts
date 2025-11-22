/**
 * TripMatch Matches API
 *
 * POST /api/tripmatch/matches - Create a match (like/pass)
 * GET  /api/tripmatch/matches - Get user's matches
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/tripmatch/auth-helpers';

/**
 * POST /api/tripmatch/matches
 *
 * Create a match (like or pass on another user)
 */
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { targetUserId, action } = body;

    if (!targetUserId || !action) {
      return NextResponse.json({
        success: false,
        error: 'targetUserId and action are required',
      }, { status: 400 });
    }

    if (!['like', 'pass', 'blocked'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'action must be "like", "pass", or "blocked"',
      }, { status: 400 });
    }

    // Check if user is trying to match with themselves
    if (userId === targetUserId) {
      return NextResponse.json({
        success: false,
        error: 'Cannot match with yourself',
      }, { status: 400 });
    }

    // Ensure both profiles exist
    await prisma.tripMatchUserProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, displayName: 'Traveler' },
    });

    await prisma.tripMatchUserProfile.upsert({
      where: { userId: targetUserId },
      update: {},
      create: { userId: targetUserId, displayName: 'Traveler' },
    });

    // Check if this user already swiped on the target
    const existingAction = await prisma.travelerMatch.findFirst({
      where: {
        fromUserId: userId,
        toUserId: targetUserId,
      },
    });

    if (existingAction) {
      // Update existing action
      await prisma.travelerMatch.update({
        where: { id: existingAction.id },
        data: {
          action,
          actionTaken: true,
        },
      });
    } else {
      // Create new action
      await prisma.travelerMatch.create({
        data: {
          fromUserId: userId,
          toUserId: targetUserId,
          action,
          actionTaken: true,
        },
      });
    }

    // Check for mutual match (both users liked each other)
    let isMatch = false;
    if (action === 'like') {
      const reciprocalLike = await prisma.travelerMatch.findFirst({
        where: {
          fromUserId: targetUserId,
          toUserId: userId,
          action: 'like',
        },
      });

      isMatch = !!reciprocalLike;
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        targetUserId,
        isMatch,
      },
      message: isMatch ? 'It\'s a match!' : 'Action recorded',
    });

  } catch (error: any) {
    console.error('❌ Error creating match:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to create match',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * GET /api/tripmatch/matches
 *
 * Get user's matches (mutual likes)
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get all users this user liked
    const userLikes = await prisma.travelerMatch.findMany({
      where: {
        fromUserId: userId,
        action: 'like',
      },
      select: {
        toUserId: true,
      },
    });

    const likedUserIds = userLikes.map(m => m.toUserId);

    // Find mutual matches (users who also liked this user back)
    const mutualMatches = await prisma.travelerMatch.findMany({
      where: {
        fromUserId: { in: likedUserIds },
        toUserId: userId,
        action: 'like',
      },
      include: {
        fromUser: {
          select: {
            userId: true,
            displayName: true,
            avatarUrl: true,
            locationCity: true,
            locationCountry: true,
            avgRating: true,
            verificationLevel: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format matches
    const formattedMatches = mutualMatches.map(match => ({
      id: match.id,
      matchedAt: match.createdAt,
      otherUser: match.fromUser,
    }));

    return NextResponse.json({
      success: true,
      data: formattedMatches,
      count: formattedMatches.length,
    });

  } catch (error: any) {
    console.error('❌ Error fetching matches:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch matches',
      message: error.message,
    }, { status: 500 });
  }
}
