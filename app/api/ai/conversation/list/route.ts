/**
 * API Route: Get User's Conversations
 * GET /api/ai/conversation/list
 *
 * Returns all conversations for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { loadUserConversations } from '@/lib/ai/conversation-db';

// Force Node.js runtime for Prisma
export const runtime = 'nodejs';

// Force dynamic rendering for auth headers and query parameters
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Load user's conversations
    const conversations = await loadUserConversations(
      session.user.email,
      limit
    );

    return NextResponse.json({
      success: true,
      conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error('Failed to load conversations:', error);

    return NextResponse.json(
      {
        error: 'Failed to load conversations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
