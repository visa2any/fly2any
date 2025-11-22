/**
 * TripMatch Post Comments API
 *
 * GET  /api/tripmatch/posts/[postId]/comments - Get comments
 * POST /api/tripmatch/posts/[postId]/comments - Add comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/tripmatch/auth-helpers';

/**
 * GET /api/tripmatch/posts/[postId]/comments
 *
 * Get comments for a post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const comments = await prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' }, // Chronological order
      skip: offset,
      take: limit,
      include: {
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            userId: true,
            verificationLevel: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: comments,
      count: comments.length,
    });

  } catch (error: any) {
    console.error('❌ Error fetching comments:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch comments',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/tripmatch/posts/[postId]/comments
 *
 * Add a comment to a post
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

    // Validate comment
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Comment content is required',
      }, { status: 400 });
    }

    if (body.content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Comment cannot be empty',
      }, { status: 400 });
    }

    if (body.content.length > 1000) {
      return NextResponse.json({
        success: false,
        error: 'Comment too long (max 1000 characters)',
      }, { status: 400 });
    }

    // Ensure profile exists
    await prisma.tripMatchUserProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, displayName: 'Traveler' },
    });

    // Create comment
    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId,
        content: body.content.trim(),
      },
      include: {
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            userId: true,
            verificationLevel: true,
          },
        },
      },
    });

    // Update comment count on post
    const commentsCount = await prisma.postComment.count({
      where: { postId },
    });

    await prisma.tripPost.update({
      where: { id: postId },
      data: { commentsCount },
    });

    return NextResponse.json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error adding comment:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to add comment',
      message: error.message,
    }, { status: 500 });
  }
}
