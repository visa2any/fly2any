/**
 * TripMatch Trip Posts API (Social Feed)
 *
 * GET  /api/tripmatch/trips/[id]/posts - Get trip posts (feed)
 * POST /api/tripmatch/trips/[id]/posts - Create new post
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/tripmatch/auth-helpers';

/**
 * GET /api/tripmatch/trips/[id]/posts
 *
 * Get posts for a trip (paginated feed)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: tripId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Fetch posts with author profiles, reactions, and comments
    const posts = await prisma.tripPost.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
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
        reactions: {
          select: {
            id: true,
            reactionType: true,
            userId: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 3, // Show latest 3 comments
          include: {
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
                userId: true,
              },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
      hasMore: posts.length === limit,
    });

  } catch (error: any) {
    console.error('❌ Error fetching posts:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch posts',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/tripmatch/trips/[id]/posts
 *
 * Create a new post (photo, update, memory)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: tripId } = params;
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

    // Validate post data
    if (!body.content && (!body.mediaUrls || body.mediaUrls.length === 0)) {
      return NextResponse.json({
        success: false,
        error: 'Post must have either content or media',
      }, { status: 400 });
    }

    // TODO: Verify user is a member of this trip
    // const membership = await prisma.groupMember.findFirst({
    //   where: { tripGroupId: tripId, userId, status: { in: ['confirmed', 'paid'] } }
    // });
    // if (!membership) {
    //   return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    // }

    // Ensure profile exists
    await prisma.tripMatchUserProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, displayName: 'Traveler' },
    });

    // Create post
    const post = await prisma.tripPost.create({
      data: {
        tripId,
        userId,
        content: body.content?.trim() || null,
        mediaUrls: body.mediaUrls || [],
        mediaType: body.mediaType || (body.mediaUrls?.length > 0 ? 'photo' : null),
        location: body.location || null,
        locationLat: body.locationLat || null,
        locationLng: body.locationLng || null,
        visibility: body.visibility || 'group',
        postType: body.postType || 'update',
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

    // TODO: Send real-time notification
    // pusher.trigger(`trip-${tripId}`, 'new-post', post);

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post created successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating post:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to create post',
      message: error.message,
    }, { status: 500 });
  }
}
