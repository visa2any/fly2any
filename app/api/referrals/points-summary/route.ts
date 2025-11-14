import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { getUserPointsSummary } from '@/lib/services/referralNetworkService';
import { generateReferralCode } from '@/lib/utils';

/**
 * GET /api/referrals/points-summary
 * Get user's Fly2Any Rewards points summary
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

    const prisma = getPrismaClient();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, referralCode: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate referral code if user doesn't have one
    let referralCode = user.referralCode;
    if (!referralCode) {
      // Generate unique code
      referralCode = await generateUniqueCode(prisma);

      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode },
      });
    }

    // Get points summary
    const summary = await getUserPointsSummary(user.id);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching points summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points summary' },
      { status: 500 }
    );
  }
}

/**
 * Generate unique referral code
 */
async function generateUniqueCode(prisma: any): Promise<string> {
  let code = generateReferralCode();
  let attempts = 0;

  while (attempts < 10) {
    const exists = await prisma.user.findUnique({
      where: { referralCode: code },
    });

    if (!exists) {
      return code;
    }

    code = generateReferralCode();
    attempts++;
  }

  // Fallback: add timestamp
  return `${code}${Date.now().toString(36).slice(-3)}`;
}
