/**
 * API Route: Migrate Conversation from localStorage to Database
 * POST /api/ai/conversation/migrate
 *
 * When user logs in, migrate their localStorage conversation to database
 * Includes fast-fail for database unavailability
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveConversationToDB, associateConversationWithUser } from '@/lib/ai/conversation-db';
import type { ConversationState } from '@/lib/ai/conversation-persistence';

// Force Node.js runtime for Prisma
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Quick database availability check
    const { prisma } = await import('@/lib/db/prisma');
    if (!prisma) {
      console.warn('[Migration] Database not configured - skipping migration');
      return NextResponse.json(
        {
          error: 'Database not available',
          message: 'Conversation saved to localStorage only',
        },
        { status: 503 }
      );
    }

    // Get authenticated user session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    // Get the actual user ID from database with timeout
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 3000)
      ),
    ]) as { id: string } | null;

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
    console.error('[Migration] Conversation migration error:', error);

    // Return 503 (Service Unavailable) for database errors
    // Client can gracefully degrade to localStorage
    if (error instanceof Error && 
        (error.message.includes('timeout') || 
         error.message.includes('database') ||
         error.message.includes('P1001'))) {
      return NextResponse.json(
        {
          error: 'Database temporarily unavailable',
          message: 'Conversation saved to localStorage only',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to migrate conversation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
