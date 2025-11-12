/**
 * API Route: User TripMatch Credits
 * GET /api/user/credits
 *
 * Returns authenticated user's TripMatch credit balance and stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

// Force Node.js runtime for Prisma
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    // Check if database is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        tripMatchCredits: true,
        tripMatchLifetimeEarned: true,
        tripMatchLifetimeSpent: true,
        tripMatchPendingCredits: true,
        tripMatchTier: true,
        tripMatchBonusMultiplier: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate credit value in USD (10 credits = $1)
    const creditValue = (user.tripMatchCredits || 0) * 0.1;

    // Return credit data
    return NextResponse.json({
      success: true,
      data: {
        balance: user.tripMatchCredits || 0,
        lifetimeEarned: user.tripMatchLifetimeEarned || 0,
        lifetimeSpent: user.tripMatchLifetimeSpent || 0,
        pendingBalance: user.tripMatchPendingCredits || 0,
        tier: user.tripMatchTier || 'bronze',
        bonusMultiplier: user.tripMatchBonusMultiplier || 1.0,
        usdValue: creditValue,
      },
    });
  } catch (error) {
    console.error('Credits API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch credits',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
