/**
 * API Route: Conversation Management
 * GET /api/ai/conversation/:id - Get a specific conversation
 * DELETE /api/ai/conversation/:id - Delete a conversation
 *
 * Returns or deletes a specific conversation by session ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { loadConversationFromDB, deleteConversationFromDB } from '@/lib/ai/conversation-db';

// Force Node.js runtime for Prisma
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    const sessionId = params.id;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Load conversation from database
    const conversation = await loadConversationFromDB(sessionId);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (conversation.userId !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden - not your conversation' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Failed to load conversation:', error);

    return NextResponse.json(
      {
        error: 'Failed to load conversation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    const conversationId = params.id;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Delete conversation from database
    await deleteConversationFromDB(conversationId, session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete conversation:', error);

    // Check if it's a "not found" or "forbidden" error
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: 'Forbidden - not your conversation' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to delete conversation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
