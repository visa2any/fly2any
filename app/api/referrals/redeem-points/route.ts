import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

/**
 * POST /api/referrals/redeem-points
 * Redeem Fly2Any Rewards points on a booking
 *
 * Request Body:
 * {
 *   pointsToRedeem: number,  // Amount of points to use
 *   bookingAmount: number,   // Total booking amount
 *   bookingId?: string       // Optional booking ID for tracking
 * }
 *
 * Business Rules:
 * - 1 point = $1 discount
 * - Can only redeem available (unlocked) points
 * - Cannot redeem more points than booking amount
 * - Points are deducted immediately upon redemption
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    // Get user with points balance
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        fly2anyPoints: true,
        fly2anyPointsLocked: true,
        fly2anyPointsLifetime: true,
        fly2anyPointsRedeemed: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { pointsToRedeem, bookingAmount, bookingId } = body;

    // Validation
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return NextResponse.json(
        { error: 'Invalid points amount' },
        { status: 400 }
      );
    }

    if (!bookingAmount || bookingAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid booking amount' },
        { status: 400 }
      );
    }

    // Check if user has enough available points
    if (pointsToRedeem > user.fly2anyPoints) {
      return NextResponse.json(
        {
          error: 'Insufficient points',
          available: user.fly2anyPoints,
          requested: pointsToRedeem,
        },
        { status: 400 }
      );
    }

    // Cannot redeem more points than booking amount
    if (pointsToRedeem > bookingAmount) {
      return NextResponse.json(
        {
          error: 'Points exceed booking amount',
          message: `Cannot redeem $${pointsToRedeem} points on a $${bookingAmount} booking`,
        },
        { status: 400 }
      );
    }

    // Deduct points from user's balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        fly2anyPoints: { decrement: pointsToRedeem },
        fly2anyPointsRedeemed: { increment: pointsToRedeem },
      },
    });

    console.log(`✅ Redeemed ${pointsToRedeem} points for user ${user.id}`);
    console.log(`   Booking Amount: $${bookingAmount}`);
    console.log(`   Discount: $${pointsToRedeem}`);
    console.log(`   Final Amount: $${bookingAmount - pointsToRedeem}`);

    // Return updated balances
    return NextResponse.json({
      success: true,
      redemption: {
        pointsRedeemed: pointsToRedeem,
        discountAmount: pointsToRedeem, // 1:1 ratio
        originalAmount: bookingAmount,
        finalAmount: bookingAmount - pointsToRedeem,
        bookingId,
      },
      balances: {
        available: user.fly2anyPoints - pointsToRedeem,
        locked: user.fly2anyPointsLocked,
        lifetime: user.fly2anyPointsLifetime,
        redeemed: user.fly2anyPointsRedeemed + pointsToRedeem,
      },
      message: `Successfully redeemed ${pointsToRedeem} points!`,
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    return NextResponse.json(
      { error: 'Failed to redeem points' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/referrals/redeem-points/calculate
 * Calculate redemption preview (dry run)
 *
 * Query params:
 * - points: number of points to redeem
 * - amount: booking amount
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

    // Get user's available points
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        fly2anyPoints: true,
        fly2anyPointsLocked: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pointsParam = searchParams.get('points');
    const amountParam = searchParams.get('amount');

    if (!pointsParam || !amountParam) {
      return NextResponse.json(
        {
          availablePoints: user.fly2anyPoints,
          lockedPoints: user.fly2anyPointsLocked,
        },
        { status: 200 }
      );
    }

    const pointsToRedeem = parseInt(pointsParam);
    const bookingAmount = parseFloat(amountParam);

    // Calculate maximum redeemable
    const maxRedeemable = Math.min(
      user.fly2anyPoints,
      bookingAmount
    );

    // Validate requested amount
    const canRedeem = pointsToRedeem <= maxRedeemable;

    return NextResponse.json({
      availablePoints: user.fly2anyPoints,
      lockedPoints: user.fly2anyPointsLocked,
      bookingAmount,
      pointsRequested: pointsToRedeem,
      maxRedeemable,
      canRedeem,
      discount: Math.min(pointsToRedeem, maxRedeemable),
      finalAmount: bookingAmount - Math.min(pointsToRedeem, maxRedeemable),
    });
  } catch (error) {
    console.error('Error calculating redemption:', error);
    return NextResponse.json(
      { error: 'Failed to calculate redemption' },
      { status: 500 }
    );
  }
}
