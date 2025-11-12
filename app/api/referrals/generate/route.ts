/**
 * Referral Code Generation API
 * POST /api/referrals/generate
 *
 * Generates unique referral code for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/db/prisma';

export const runtime = 'nodejs';

function generateReferralCode(name: string): string {
  const prefix = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);

  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${prefix}${randomSuffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a referral code
    let referralCode = await prisma.referral.findFirst({
      where: { referrerId: user.id, status: 'pending' },
    });

    // Generate new code if doesn't exist
    if (!referralCode) {
      let code = generateReferralCode(user.name || 'USER');
      let attempts = 0;

      // Ensure uniqueness
      while (attempts < 10) {
        const existing = await prisma.referral.findUnique({
          where: { code },
        });

        if (!existing) break;

        code = generateReferralCode(user.name || 'USER');
        attempts++;
      }

      referralCode = await prisma.referral.create({
        data: {
          code,
          referrerId: user.id,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
      });
    }

    // Get referral stats
    const stats = await prisma.referral.count({
      where: {
        referrerId: user.id,
        status: 'completed',
      },
    });

    // Calculate total credits from credit transactions
    const creditStats = await prisma.creditTransaction.aggregate({
      where: {
        userId: user.id,
        source: 'referral_reward',
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        code: referralCode.code,
        referralUrl: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL}/ref/${referralCode.code}`,
        stats: {
          totalReferrals: stats,
          totalCreditsEarned: creditStats._sum.amount || 0,
        },
      },
    });
  } catch (error) {
    console.error('Referral generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate referral code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/referrals/generate
 * Get existing referral code
 */
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const referralCode = await prisma.referral.findFirst({
      where: { referrerId: user.id },
    });

    if (!referralCode) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // Get detailed stats
    const [completedReferrals, pendingReferrals, recentReferrals] = await Promise.all([
      prisma.referral.count({
        where: { referrerId: user.id, status: 'completed' },
      }),
      prisma.referral.count({
        where: { referrerId: user.id, status: 'pending' },
      }),
      prisma.referral.findMany({
        where: { referrerId: user.id, status: 'completed' },
        orderBy: { usedAt: 'desc' },
        take: 5,
      }),
    ]);

    // Get referee names for recent referrals
    const refereeIds = recentReferrals.map(ref => ref.refereeId).filter((id): id is string => id !== null);
    const referees = await prisma.user.findMany({
      where: { id: { in: refereeIds } },
      select: { id: true, name: true, createdAt: true },
    });
    const refereeMap = new Map(referees.map(r => [r.id, r]));

    // Calculate total credits earned
    const totalCreditsEarned = await prisma.creditTransaction.aggregate({
      where: {
        userId: user.id,
        source: 'referral_reward',
        status: 'completed',
      },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        code: referralCode.code,
        referralUrl: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL}/ref/${referralCode.code}`,
        stats: {
          completedReferrals,
          pendingReferrals,
          totalCreditsEarned: totalCreditsEarned._sum.amount || 0,
          recentReferrals: recentReferrals.map(ref => ({
            name: ref.refereeId ? refereeMap.get(ref.refereeId)?.name || 'Unknown' : 'Unknown',
            status: ref.status,
            date: ref.usedAt || ref.createdAt,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch referral code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
