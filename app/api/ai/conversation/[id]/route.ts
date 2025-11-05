/**
 * API Route: Get Specific Conversation
 * GET /api/ai/conversation/:id
 *
 * Returns a specific conversation by session ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { loadConversationFromDB } from '@/lib/ai/conversation-db';

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
