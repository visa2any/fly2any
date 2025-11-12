/**
 * Apply Referral Code API
 * POST /api/referrals/apply
 *
 * Applies referral code during signup/onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

interface ApplyReferralBody {
  code: string;
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
    const referralCode = await prisma.referralCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Check if not self-referral
    if (referralCode.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Check if max uses reached
    if (referralCode.maxUses && referralCode.uses >= referralCode.maxUses) {
      return NextResponse.json(
        { error: 'This referral code has reached its maximum uses' },
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

    // Create referral record
    const referral = await prisma.referral.create({
      data: {
        referrerId: referralCode.userId,
        refereeId: user.id,
        code: referralCode.code,
        status: 'pending', // Will be completed after first booking
        creditsAwarded: 0,
      },
    });

    // Update referral code usage count
    await prisma.referralCode.update({
      where: { id: referralCode.id },
      data: {
        uses: { increment: 1 },
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
        description: `Referral bonus from ${referralCode.user.name}`,
        metadata: {
          referralCode: referralCode.code,
          referrerId: referralCode.userId,
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

    // Create notification for referrer
    await prisma.notification.create({
      data: {
        userId: referralCode.userId,
        type: 'referral_signup',
        title: 'Someone Used Your Referral!',
        message: `A new user signed up with your code. You'll earn ${referralCode.credits} credits when they make their first booking!`,
        actionUrl: '/tripmatch/dashboard',
        metadata: {
          potentialCredits: referralCode.credits,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        bonusCredits,
        referrerName: referralCode.user.name,
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
