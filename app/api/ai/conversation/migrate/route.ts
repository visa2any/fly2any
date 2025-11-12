/**
 * API Route: Migrate Conversation from localStorage to Database
 * POST /api/ai/conversation/migrate
 *
 * When user logs in, migrate their localStorage conversation to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveConversationToDB, associateConversationWithUser } from '@/lib/ai/conversation-db';
import type { ConversationState } from '@/lib/ai/conversation-persistence';

// Force Node.js runtime for Prisma
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    // Get the actual user ID from database (not email)
    const { prisma } = await import('@/lib/db/prisma');
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse conversation from request body
    let conversation: ConversationState;
    try {
      conversation = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!conversation || !conversation.sessionId) {
      return NextResponse.json(
        { error: 'Invalid conversation data - missing sessionId' },
        { status: 400 }
      );
    }

    // Save conversation to database with actual user ID
    await saveConversationToDB(conversation, user.id);

    // Associate with user if not already
    if (!conversation.userId) {
      await associateConversationWithUser(
        conversation.sessionId,
        user.id
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation migrated successfully',
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error('Conversation migration error:', error);

    return NextResponse.json(
      {
        error: 'Failed to migrate conversation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
