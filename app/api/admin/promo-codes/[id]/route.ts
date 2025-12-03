/**
 * Admin Promo Code Individual API
 * GET, PUT, DELETE operations for single promo code
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get single promo code with detailed stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        usages: {
          orderBy: { usedAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!promoCode) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    // Get usage statistics
    const usageStats = await prisma.promoCodeUsage.aggregate({
      where: { promoCodeId: id },
      _sum: { discountApplied: true },
      _avg: { discountApplied: true },
      _count: true,
    });

    // Get usage by day for chart
    const usageByDay = await prisma.promoCodeUsage.groupBy({
      by: ['usedAt'],
      where: { promoCodeId: id },
      _count: true,
      orderBy: { usedAt: 'asc' },
    });

    return NextResponse.json({
      promoCode: {
        ...promoCode,
        stats: {
          totalUsages: usageStats._count || 0,
          totalDiscountGiven: usageStats._sum.discountApplied || 0,
          averageDiscount: usageStats._avg.discountApplied || 0,
          usageByDay,
          isExpired: promoCode.validUntil < new Date(),
          usageLimitReached: promoCode.usageLimit ? usageStats._count >= promoCode.usageLimit : false,
        },
      },
    });
  } catch (error: any) {
    console.error('Admin promo code GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update promo code
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Check if promo code exists
    const existingCode = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existingCode) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    // If code is being changed, check for duplicates
    if (body.code && body.code.toUpperCase() !== existingCode.code) {
      const duplicateCode = await prisma.promoCode.findUnique({
        where: { code: body.code.toUpperCase() },
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Promo code already exists' },
          { status: 409 }
        );
      }
    }

    // Validation for type and value
    if (body.type && body.type !== 'percentage' && body.type !== 'fixed') {
      return NextResponse.json(
        { error: 'Type must be "percentage" or "fixed"' },
        { status: 400 }
      );
    }

    const type = body.type || existingCode.type;
    const value = body.value !== undefined ? parseFloat(body.value) : existingCode.value;

    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage value must be between 0 and 100' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = parseFloat(body.value);
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.minBookingAmount !== undefined) updateData.minBookingAmount = body.minBookingAmount ? parseFloat(body.minBookingAmount) : null;
    if (body.maxDiscount !== undefined) updateData.maxDiscount = body.maxDiscount ? parseFloat(body.maxDiscount) : null;
    if (body.validFrom !== undefined) updateData.validFrom = new Date(body.validFrom);
    if (body.validUntil !== undefined) updateData.validUntil = new Date(body.validUntil);
    if (body.usageLimit !== undefined) updateData.usageLimit = body.usageLimit ? parseInt(body.usageLimit) : null;
    if (body.perUserLimit !== undefined) updateData.perUserLimit = body.perUserLimit ? parseInt(body.perUserLimit) : null;
    if (body.applicableProducts !== undefined) updateData.applicableProducts = body.applicableProducts;
    if (body.newUsersOnly !== undefined) updateData.newUsersOnly = body.newUsersOnly;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      promoCode,
      message: `Promo code ${promoCode.code} updated successfully`,
    });
  } catch (error: any) {
    console.error('Admin promo code PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete promo code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if promo code exists
    const existingCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!existingCode) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    // If promo code has been used, deactivate instead of delete
    if (existingCode._count.usages > 0) {
      const promoCode = await prisma.promoCode.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        deactivated: true,
        message: `Promo code ${existingCode.code} has been deactivated (has ${existingCode._count.usages} usages)`,
      });
    }

    // Delete if never used
    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      deleted: true,
      message: `Promo code ${existingCode.code} deleted successfully`,
    });
  } catch (error: any) {
    console.error('Admin promo code DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code', details: error.message },
      { status: 500 }
    );
  }
}
