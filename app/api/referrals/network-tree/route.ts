import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { getReferralNetworkTree } from '@/lib/services/referralNetworkService';

/**
 * GET /api/referrals/network-tree
 * Get user's referral network tree (all 3 levels)
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get network tree
    const networkTree = await getReferralNetworkTree(user.id);

    return NextResponse.json({
      success: true,
      data: networkTree,
    });
  } catch (error) {
    console.error('Error fetching network tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network tree' },
      { status: 500 }
    );
  }
}
