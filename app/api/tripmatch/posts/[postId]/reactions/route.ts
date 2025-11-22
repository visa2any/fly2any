/**
 * TripMatch Post Reactions API
 *
 * POST   /api/tripmatch/posts/[postId]/reactions - Add/update reaction
 * DELETE /api/tripmatch/posts/[postId]/reactions - Remove reaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/tripmatch/auth-helpers';

/**
 * POST /api/tripmatch/posts/[postId]/reactions
 *
 * Add or update a reaction to a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const body = await request.json();

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

    // Validate reaction type
    const validReactions = ['like', 'love', 'wow', 'haha', 'fire'];
    if (!body.reactionType || !validReactions.includes(body.reactionType)) {
      return NextResponse.json({
        success: false,
        error: `Invalid reaction type. Must be one of: ${validReactions.join(', ')}`,
      }, { status: 400 });
    }

    // Ensure profile exists
    await prisma.tripMatchUserProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, displayName: 'Traveler' },
    });

    // Upsert reaction (create if doesn't exist, update if it does)
    const reaction = await prisma.postReaction.upsert({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      update: {
        reactionType: body.reactionType,
      },
      create: {
        postId,
        userId,
        reactionType: body.reactionType,
      },
    });

    // Update reaction count on post
    const reactionsCount = await prisma.postReaction.count({
      where: { postId },
    });

    await prisma.tripPost.update({
      where: { id: postId },
      data: { reactionsCount },
    });

    return NextResponse.json({
      success: true,
      data: reaction,
      message: 'Reaction added successfully',
    });

  } catch (error: any) {
    console.error('❌ Error adding reaction:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to add reaction',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * DELETE /api/tripmatch/posts/[postId]/reactions
 *
 * Remove user's reaction from a post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

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

    // Delete reaction
    await prisma.postReaction.deleteMany({
      where: {
        postId,
        userId,
      },
    });

    // Update reaction count on post
    const reactionsCount = await prisma.postReaction.count({
      where: { postId },
    });

    await prisma.tripPost.update({
      where: { id: postId },
      data: { reactionsCount },
    });

    return NextResponse.json({
      success: true,
      message: 'Reaction removed successfully',
    });

  } catch (error: any) {
    console.error('❌ Error removing reaction:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to remove reaction',
      message: error.message,
    }, { status: 500 });
  }
}
