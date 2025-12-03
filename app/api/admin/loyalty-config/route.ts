/**
 * Admin Loyalty Configuration API
 * Manages loyalty program settings for Hotels and Flights
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Default loyalty configuration
const DEFAULT_LOYALTY_CONFIG = {
  // Global settings
  global: {
    programName: 'Fly2Any Rewards',
    programEnabled: true,
    signupBonusPoints: 500,
    referralBonusPoints: 1000,
    pointsExpiryDays: 365,
    minRedemptionPoints: 1000,
    pointsToValueRatio: 0.01, // 1 point = $0.01
  },
  // Hotel-specific settings
  hotels: {
    enabled: true,
    pointsPerDollar: 10,
    bonusMultiplier: 1.0,
    welcomeDiscountPercent: 5, // WELCOME5 discount
    maxWelcomeDiscount: 50,
    loyaltyTiers: {
      bronze: { minPoints: 0, bonusMultiplier: 1.0, perks: ['Basic rewards'] },
      silver: { minPoints: 5000, bonusMultiplier: 1.25, perks: ['Free breakfast on select hotels', '10% bonus points'] },
      gold: { minPoints: 15000, bonusMultiplier: 1.5, perks: ['Free breakfast', 'Room upgrades', 'Late checkout'] },
      platinum: { minPoints: 50000, bonusMultiplier: 2.0, perks: ['All gold perks', 'Free cancellation', 'Priority support'] },
    },
    cashbackEnabled: true,
    cashbackPercent: 5,
    maxCashbackPerBooking: 100,
  },
  // Flight-specific settings
  flights: {
    enabled: true,
    pointsPerDollar: 5,
    bonusMultiplier: 1.0,
    welcomeDiscountPercent: 5,
    maxWelcomeDiscount: 50,
    loyaltyTiers: {
      bronze: { minPoints: 0, milesMultiplier: 1.0, perks: ['Basic miles'] },
      silver: { minPoints: 10000, milesMultiplier: 1.25, perks: ['Priority boarding'] },
      gold: { minPoints: 30000, milesMultiplier: 1.5, perks: ['Lounge access', 'Extra baggage'] },
      platinum: { minPoints: 100000, milesMultiplier: 2.0, perks: ['Business class upgrades', 'Companion pass'] },
    },
    cashbackEnabled: true,
    cashbackPercent: 3,
    maxCashbackPerBooking: 50,
  },
  // LiteAPI Integration settings
  liteApiIntegration: {
    enabled: true,
    syncEnabled: true,
    guestIdPrefix: 'F2A_',
    loyaltyProgramId: 'fly2any_rewards',
  },
};

// GET - Get current loyalty configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Try to get config from database
    let config = await prisma.systemConfig.findUnique({
      where: { key: 'loyalty_config' },
    });

    if (!config) {
      // Create default config if doesn't exist
      config = await prisma.systemConfig.create({
        data: {
          key: 'loyalty_config',
          value: DEFAULT_LOYALTY_CONFIG as any,
          description: 'Loyalty program configuration for Hotels and Flights',
        },
      });
    }

    // Get statistics
    const stats = await getLoyaltyStats();

    return NextResponse.json({
      config: config.value,
      stats,
      updatedAt: config.updatedAt,
    });
  } catch (error: any) {
    console.error('Loyalty config GET error:', error);

    // If SystemConfig table doesn't exist, return default config
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        config: DEFAULT_LOYALTY_CONFIG,
        stats: null,
        message: 'Using default configuration (database table not yet created)',
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch loyalty config', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update loyalty configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { section, updates } = body;

    // Get current config
    let currentConfig = await prisma.systemConfig.findUnique({
      where: { key: 'loyalty_config' },
    });

    let configValue = currentConfig?.value || DEFAULT_LOYALTY_CONFIG;

    // Update specific section or entire config
    if (section && updates) {
      // Update specific section (hotels, flights, global, liteApiIntegration)
      (configValue as any)[section] = {
        ...(configValue as any)[section],
        ...updates,
      };
    } else if (updates) {
      // Full config update
      configValue = {
        ...configValue,
        ...updates,
      };
    }

    // Save updated config
    const config = await prisma.systemConfig.upsert({
      where: { key: 'loyalty_config' },
      update: {
        value: configValue as any,
        updatedAt: new Date(),
      },
      create: {
        key: 'loyalty_config',
        value: configValue as any,
        description: 'Loyalty program configuration for Hotels and Flights',
      },
    });

    return NextResponse.json({
      success: true,
      config: config.value,
      message: `Loyalty configuration updated successfully`,
    });
  } catch (error: any) {
    console.error('Loyalty config PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update loyalty config', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Reset to default configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      const config = await prisma.systemConfig.upsert({
        where: { key: 'loyalty_config' },
        update: {
          value: DEFAULT_LOYALTY_CONFIG as any,
          updatedAt: new Date(),
        },
        create: {
          key: 'loyalty_config',
          value: DEFAULT_LOYALTY_CONFIG as any,
          description: 'Loyalty program configuration for Hotels and Flights',
        },
      });

      return NextResponse.json({
        success: true,
        config: config.value,
        message: 'Configuration reset to defaults',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Loyalty config POST error:', error);
    return NextResponse.json(
      { error: 'Failed to reset loyalty config', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get loyalty statistics
async function getLoyaltyStats() {
  try {
    // Get user stats
    const totalUsers = await prisma.user.count();
    const usersWithPoints = await prisma.user.count({
      where: {
        OR: [
          { hotelPointsBalance: { gt: 0 } },
          { hotelPointsPending: { gt: 0 } },
        ],
      },
    });

    // Get points stats
    const pointsStats = await prisma.user.aggregate({
      _sum: {
        hotelPointsBalance: true,
        hotelPointsPending: true,
      },
    });

    // Get promo code stats
    const promoStats = await prisma.promoCode.aggregate({
      _count: true,
    });

    const activePromos = await prisma.promoCode.count({
      where: {
        isActive: true,
        validUntil: { gte: new Date() },
      },
    });

    // Get usage stats
    const totalPromoUsages = await prisma.promoCodeUsage.count();

    return {
      users: {
        total: totalUsers,
        withRewards: usersWithPoints,
        engagementRate: totalUsers > 0 ? ((usersWithPoints / totalUsers) * 100).toFixed(1) : '0',
      },
      points: {
        totalBalance: pointsStats._sum.hotelPointsBalance || 0,
        totalPending: pointsStats._sum.hotelPointsPending || 0,
        totalIssued: (pointsStats._sum.hotelPointsBalance || 0) + (pointsStats._sum.hotelPointsPending || 0),
      },
      promoCodes: {
        total: promoStats._count || 0,
        active: activePromos,
        totalUsages: totalPromoUsages,
      },
    };
  } catch (error) {
    console.error('Error getting loyalty stats:', error);
    return null;
  }
}
