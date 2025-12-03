/**
 * Loyalty Points API
 * GET - Get user's unified loyalty points balance
 * POST - Redeem points for voucher
 */
import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/loyalty/points - Get user's unified points balance
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');

    // If guestId provided (for guest users), fetch from LiteAPI directly
    if (guestId) {
      const points = await liteAPI.getGuestLoyaltyPoints(guestId);
      return NextResponse.json({
        success: true,
        data: {
          hotel: points,
          general: { currentPoints: 0, lifetimePoints: 0, redeemedPoints: 0 },
          totalAvailable: points.currentPoints,
          conversionRate: { pointsPerDollar: 10, description: '10 points = $1 USD' },
        },
      });
    }

    // For authenticated users, get unified points
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        data: {
          hotel: { currentPoints: 0, pendingPoints: 0, tier: 'bronze', tierBenefits: [] },
          general: { currentPoints: 0, lifetimePoints: 0, redeemedPoints: 0 },
          totalAvailable: 0,
          conversionRate: { pointsPerDollar: 10, description: '10 points = $1 USD' },
        },
      });
    }

    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get user's points from DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        liteApiGuestId: true,
        fly2anyPoints: true,
        fly2anyPointsLifetime: true,
        fly2anyPointsRedeemed: true,
        hotelPointsBalance: true,
        hotelPointsPending: true,
      },
    });

    let hotelPoints = {
      currentPoints: user?.hotelPointsBalance || 0,
      pendingPoints: user?.hotelPointsPending || 0,
      tier: 'bronze' as string,
      tierBenefits: ['5% cashback on hotels'],
    };

    // If user has LiteAPI guest linked, fetch real-time points
    if (user?.liteApiGuestId) {
      try {
        const liteApiPoints = await liteAPI.getGuestLoyaltyPoints(user.liteApiGuestId);
        hotelPoints = {
          currentPoints: liteApiPoints.currentPoints,
          pendingPoints: 0,
          tier: liteApiPoints.tier,
          tierBenefits: liteApiPoints.tierBenefits,
        };

        // Sync to local DB
        await prisma.user.update({
          where: { id: session.user.id },
          data: { hotelPointsBalance: liteApiPoints.currentPoints },
        });
      } catch (e) {
        console.warn('Could not fetch LiteAPI points, using local cache');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        hotel: hotelPoints,
        general: {
          currentPoints: user?.fly2anyPoints || 0,
          lifetimePoints: user?.fly2anyPointsLifetime || 0,
          redeemedPoints: user?.fly2anyPointsRedeemed || 0,
        },
        totalAvailable: (user?.fly2anyPoints || 0) + hotelPoints.currentPoints,
        totalPending: hotelPoints.pendingPoints,
        conversionRate: {
          pointsPerDollar: 10,
          description: '10 points = $1 USD',
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching points:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch points' },
      { status: 500 }
    );
  }
}

// POST /api/loyalty/points - Redeem points for voucher
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { points, currency = 'USD', source = 'hotel' } = body;

    if (!points || points < 10) {
      return NextResponse.json(
        { success: false, error: 'Minimum 10 points required for redemption' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        liteApiGuestId: true,
        fly2anyPoints: true,
        hotelPointsBalance: true,
      },
    });

    if (source === 'hotel' && user?.liteApiGuestId) {
      // Redeem via LiteAPI
      if ((user.hotelPointsBalance || 0) < points) {
        return NextResponse.json(
          { success: false, error: 'Insufficient hotel points' },
          { status: 400 }
        );
      }

      const voucher = await liteAPI.redeemPoints({
        guestId: user.liteApiGuestId,
        points,
        redemptionType: 'discount',
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { hotelPointsBalance: { decrement: points } },
      });

      await prisma.loyaltyTransaction.create({
        data: {
          userId: session.user.id,
          type: 'redeem',
          source: 'hotel',
          points: -points,
          description: `Redeemed ${points} points for $${points / 10} voucher`,
        },
      });

      return NextResponse.json({
        success: true,
        data: { voucher, pointsRedeemed: points, dollarValue: points / 10 },
        message: `Successfully redeemed ${points} points for a $${points / 10} voucher`,
      });
    } else {
      // Local redemption
      if ((user?.fly2anyPoints || 0) < points) {
        return NextResponse.json(
          { success: false, error: 'Insufficient points' },
          { status: 400 }
        );
      }

      const voucherCode = `FLY2ANY-${Date.now().toString(36).toUpperCase()}`;
      const dollarValue = points / 10;

      await prisma.promoCode.create({
        data: {
          code: voucherCode,
          type: 'fixed',
          value: dollarValue,
          currency,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          usageLimit: 1,
          perUserLimit: 1,
          applicableProducts: ['hotel', 'flight'],
          description: `Points redemption - ${points} points`,
        },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          fly2anyPoints: { decrement: points },
          fly2anyPointsRedeemed: { increment: points },
        },
      });

      await prisma.loyaltyTransaction.create({
        data: {
          userId: session.user.id,
          type: 'redeem',
          source: 'general',
          points: -points,
          description: `Redeemed ${points} points for $${dollarValue} voucher (${voucherCode})`,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          voucher: { code: voucherCode, type: 'fixed', value: dollarValue, currency },
          pointsRedeemed: points,
          dollarValue,
        },
        message: `Successfully redeemed ${points} points for a $${dollarValue} voucher`,
      });
    }
  } catch (error: any) {
    console.error('Error redeeming points:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to redeem points' },
      { status: 500 }
    );
  }
}
