/**
 * Apply Referral Code API
 * POST /api/referrals/apply
 *
 * Applies referral code during signup/onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/db/prisma';

export const runtime = 'nodejs';

interface ApplyReferralBody {
  code: string;
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

    const body: ApplyReferralBody = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        tripMatchCredits: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is new (within 7 days of signup)
    const accountAge = Date.now() - user.createdAt.getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (accountAge > sevenDays) {
      return NextResponse.json(
        { error: 'Referral codes can only be applied within 7 days of signup' },
        { status: 400 }
      );
    }

    // Check if user already used a referral code
    const existingReferral = await prisma.referral.findFirst({
      where: { refereeId: user.id },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: 'You have already used a referral code' },
        { status: 400 }
      );
    }

    // Find referral code
    const referralCode = await prisma.referral.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Check if not self-referral
    if (referralCode.referrerId === user.id) {
      return NextResponse.json(
        { error: 'Cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Check if already used
    if (referralCode.status === 'completed') {
      return NextResponse.json(
        { error: 'This referral code has already been used' },
        { status: 400 }
      );
    }

    // Check if expired
    if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This referral code has expired' },
        { status: 400 }
      );
    }

    // Get referrer user info for notifications
    const referrer = await prisma.user.findUnique({
      where: { id: referralCode.referrerId },
      select: { name: true },
    });

    // Update referral code to mark as used
    await prisma.referral.update({
      where: { id: referralCode.id },
      data: {
        status: 'completed',
        refereeId: user.id,
        usedAt: new Date(),
        rewardPaid: true,
      },
    });

    // Award immediate bonus credits to referee (50 credits)
    const bonusCredits = 50;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tripMatchCredits: { increment: bonusCredits },
        tripMatchLifetimeEarned: { increment: bonusCredits },
      },
    });

    // Create transaction
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: 'earn',
        amount: bonusCredits,
        source: 'referral_signup',
        status: 'completed',
        description: `Referral bonus from ${referrer?.name || 'a friend'}`,
        metadata: {
          referralCode: referralCode.code,
          referrerId: referralCode.referrerId,
        },
      },
    });

    // Create notification for referee
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'referral_bonus',
        title: 'Referral Bonus!',
        message: `You earned ${bonusCredits} credits for using a referral code`,
        actionUrl: '/tripmatch/dashboard',
        metadata: {
          credits: bonusCredits,
        },
      },
    });

    // Create notification for referrer (they'll get credits when referee makes first booking)
    const referrerBonusCredits = 100; // Standard referrer reward
    await prisma.notification.create({
      data: {
        userId: referralCode.referrerId,
        type: 'referral_signup',
        title: 'Someone Used Your Referral!',
        message: `A new user signed up with your code. You'll earn ${referrerBonusCredits} credits when they make their first booking!`,
        actionUrl: '/tripmatch/dashboard',
        metadata: {
          potentialCredits: referrerBonusCredits,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        bonusCredits,
        referrerName: referrer?.name || 'a friend',
        message: `Welcome! You've earned ${bonusCredits} credits`,
      },
    });
  } catch (error) {
    console.error('Apply referral error:', error);
    return NextResponse.json(
      {
        error: 'Failed to apply referral code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
