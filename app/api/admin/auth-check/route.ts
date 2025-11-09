import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Admin Auth Check API
 *
 * Utility endpoint to verify admin authentication in API routes
 * Use this as a reference for protecting other admin API endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
