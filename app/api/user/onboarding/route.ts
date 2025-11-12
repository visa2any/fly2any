/**
 * User Onboarding API
 * POST /api/user/onboarding
 *
 * Awards welcome bonus and initializes user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/db/prisma';
import { EmailService } from '@/lib/services/email-service';

export const runtime = 'nodejs';

const WELCOME_BONUS_CREDITS = 100; // $10 value

interface OnboardingData {
  interests?: string[];
  travelStyle?: string;
  preferredDestinations?: string[];
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

    const body: OnboardingData = await request.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        tripMatchCredits: true,
        tripMatchLifetimeEarned: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already onboarded
    if (user.tripMatchLifetimeEarned > 0) {
      return NextResponse.json(
        {
          error: 'User already onboarded',
          alreadyOnboarded: true,
        },
        { status: 400 }
      );
    }

    // Award welcome bonus
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        tripMatchCredits: WELCOME_BONUS_CREDITS,
        tripMatchLifetimeEarned: WELCOME_BONUS_CREDITS,
        tripMatchTier: 'bronze',
      },
    });

    // Create credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: 'earn',
        amount: WELCOME_BONUS_CREDITS,
        source: 'welcome_bonus',
        status: 'completed',
        description: 'Welcome bonus for joining TripMatch',
        metadata: {
          onboardingDate: new Date().toISOString(),
        },
      },
    });

    // Send welcome email
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL;
    await EmailService.sendWelcomeEmail(user.email, {
      userName: user.name || 'Traveler',
      welcomeCredits: WELCOME_BONUS_CREDITS,
      browseUrl: `${baseUrl}/tripmatch/browse`,
      createUrl: `${baseUrl}/tripmatch/create`,
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'welcome',
        title: 'Welcome to TripMatch!',
        message: `You've received ${WELCOME_BONUS_CREDITS} welcome credits ($${(WELCOME_BONUS_CREDITS / 10).toFixed(2)})`,
        actionUrl: '/tripmatch/dashboard',
        metadata: {
          credits: WELCOME_BONUS_CREDITS,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        creditsAwarded: WELCOME_BONUS_CREDITS,
        currentBalance: updatedUser.tripMatchCredits,
        tier: updatedUser.tripMatchTier,
        message: 'Welcome bonus awarded successfully!',
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/onboarding
 * Check onboarding status
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
      select: {
        id: true,
        tripMatchLifetimeEarned: true,
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

    const isOnboarded = user.tripMatchLifetimeEarned > 0;

    return NextResponse.json({
      success: true,
      data: {
        isOnboarded,
        currentCredits: user.tripMatchCredits,
        accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)), // days
      },
    });
  } catch (error) {
    console.error('Onboarding status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check onboarding status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
