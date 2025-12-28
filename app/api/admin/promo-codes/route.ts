export const dynamic = 'force-dynamic';

/**
 * Admin Promo Codes API
 * Full CRUD operations for promotional codes management
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

// GET - List all promo codes with usage statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await getPrismaClient().user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const adminUser = await getPrismaClient().adminUser.findUnique({
      where: { userId: user.id },
    });

    if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active, expired, all
    const type = searchParams.get('type'); // percentage, fixed
    const product = searchParams.get('product'); // hotel, flight, car, activity

    // Build where clause
    const where: any = {};

    if (status === 'active') {
      where.isActive = true;
      where.validUntil = { gte: new Date() };
    } else if (status === 'expired') {
      where.OR = [
        { isActive: false },
        { validUntil: { lt: new Date() } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (product) {
      where.applicableProducts = { has: product };
    }

    const promoCodes = await getPrismaClient().promoCode.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    // Calculate stats for each promo code
    const promoCodesWithStats = await Promise.all(
      promoCodes.map(async (promo) => {
        // Get total discount given
        const usages = await getPrismaClient().promoCodeUsage.aggregate({
          where: { promoCodeId: promo.id },
          _sum: { discountApplied: true },
          _count: true,
        });

        return {
          ...promo,
          usageCount: usages._count || 0,
          totalDiscountGiven: usages._sum.discountApplied || 0,
          isExpired: promo.validUntil < new Date(),
          usageLimitReached: promo.usageLimit ? usages._count >= promo.usageLimit : false,
        };
      })
    );

    // Overall statistics
    const stats = {
      total: promoCodes.length,
      active: promoCodes.filter(p => p.isActive && p.validUntil >= new Date()).length,
      expired: promoCodes.filter(p => !p.isActive || p.validUntil < new Date()).length,
      totalUsages: promoCodesWithStats.reduce((acc, p) => acc + p.usageCount, 0),
      totalDiscountGiven: promoCodesWithStats.reduce((acc, p) => acc + p.totalDiscountGiven, 0),
    };

    return NextResponse.json({
      promoCodes: promoCodesWithStats,
      stats,
    });
  } catch (error: any) {
    console.error('Admin promo codes GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new promo code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await getPrismaClient().user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const adminUser = await getPrismaClient().adminUser.findUnique({
      where: { userId: user.id },
    });

    if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      type,
      value,
      currency = 'USD',
      minSpend,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      perUserLimit,
      applicableProducts,
      newUsersOnly,
      description,
      isActive = true,
    } = body;

    // Validation
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Code, type, and value are required' },
        { status: 400 }
      );
    }

    if (type !== 'percentage' && type !== 'fixed') {
      return NextResponse.json(
        { error: 'Type must be "percentage" or "fixed"' },
        { status: 400 }
      );
    }

    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage value must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existingCode = await getPrismaClient().promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 409 }
      );
    }

    const promoCode = await getPrismaClient().promoCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        currency,
        minSpend: minSpend ? parseFloat(minSpend) : undefined,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : undefined,
        applicableProducts: applicableProducts && applicableProducts.length > 0 ? applicableProducts : ['hotel', 'flight'],
        newUsersOnly: newUsersOnly || false,
        description: description || '',
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      promoCode,
      message: `Promo code ${promoCode.code} created successfully`,
    });
  } catch (error: any) {
    console.error('Admin promo codes POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create promo code', details: error.message },
      { status: 500 }
    );
  }
}
