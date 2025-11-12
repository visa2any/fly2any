/**
 * Referral Code Generation API
 * POST /api/referrals/generate
 *
 * Generates unique referral code for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

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
    let referralCode = await prisma.referralCode.findFirst({
      where: { userId: user.id },
    });

    // Generate new code if doesn't exist
    if (!referralCode) {
      let code = generateReferralCode(user.name || 'USER');
      let attempts = 0;

      // Ensure uniqueness
      while (attempts < 10) {
        const existing = await prisma.referralCode.findUnique({
          where: { code },
        });

        if (!existing) break;

        code = generateReferralCode(user.name || 'USER');
        attempts++;
      }

      referralCode = await prisma.referralCode.create({
        data: {
          code,
          userId: user.id,
          credits: 500, // 500 credits = $50
        },
      });
    }

    // Get referral stats
    const stats = await prisma.referral.aggregate({
      where: {
        referrerId: user.id,
        status: 'completed',
      },
      _sum: {
        creditsAwarded: true,
      },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        code: referralCode.code,
        credits: referralCode.credits,
        referralUrl: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL}/ref/${referralCode.code}`,
        stats: {
          totalReferrals: stats._count,
          totalCreditsEarned: stats._sum.creditsAwarded || 0,
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

    const referralCode = await prisma.referralCode.findFirst({
      where: { userId: user.id },
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
        where: { referrerId: user.id },
        include: {
          referee: {
            select: { name: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalCreditsEarned = await prisma.referral.aggregate({
      where: { referrerId: user.id, status: 'completed' },
      _sum: { creditsAwarded: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        code: referralCode.code,
        credits: referralCode.credits,
        referralUrl: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL}/ref/${referralCode.code}`,
        stats: {
          completedReferrals,
          pendingReferrals,
          totalCreditsEarned: totalCreditsEarned._sum.creditsAwarded || 0,
          recentReferrals: recentReferrals.map(ref => ({
            name: ref.referee.name,
            status: ref.status,
            credits: ref.creditsAwarded,
            date: ref.createdAt,
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
