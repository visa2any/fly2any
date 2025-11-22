/**
 * TripMatch Trip Messages API (Group Chat)
 *
 * GET  /api/tripmatch/trips/[id]/messages - Get chat messages
 * POST /api/tripmatch/trips/[id]/messages - Send message
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/tripmatch/auth-helpers';

/**
 * GET /api/tripmatch/trips/[id]/messages
 *
 * Get chat messages for a trip (paginated)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: tripId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Message ID for pagination

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

    // Build query
    const where: any = { tripId };
    if (before) {
      // Get messages before this ID (for loading older messages)
      const beforeMessage = await prisma.tripMessage.findUnique({
        where: { id: before },
        select: { createdAt: true },
      });
      if (beforeMessage) {
        where.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    // Fetch messages with sender profiles
    const messages = await prisma.tripMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            userId: true,
          },
        },
      },
    });

    // Reverse to chronological order (oldest first)
    const orderedMessages = messages.reverse();

    return NextResponse.json({
      success: true,
      data: orderedMessages,
      count: messages.length,
      hasMore: messages.length === limit,
    });

  } catch (error: any) {
    console.error('❌ Error fetching messages:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch messages',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/tripmatch/trips/[id]/messages
 *
 * Send a new message to trip chat
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

    // Validate message
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message text is required',
      }, { status: 400 });
    }

    if (body.message.length > 5000) {
      return NextResponse.json({
        success: false,
        error: 'Message too long (max 5000 characters)',
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

    // Create message
    const message = await prisma.tripMessage.create({
      data: {
        tripId,
        userId,
        message: body.message.trim(),
        messageType: body.messageType || 'text',
        attachments: body.attachments || [],
        isSystemMessage: false,
      },
      include: {
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            userId: true,
          },
        },
      },
    });

    // TODO: Send real-time notification via Pusher/WebSocket
    // pusher.trigger(`trip-${tripId}`, 'new-message', message);

    // TODO: Send push notifications to other members
    // await sendPushNotifications(tripId, userId, message);

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error sending message:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to send message',
      message: error.message,
    }, { status: 500 });
  }
}
