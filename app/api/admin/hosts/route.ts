/**
 * Admin Hosts API
 * GET /api/admin/hosts — List all hosts with filters & pagination
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { hasPermission, Role, Resource, Action } from '@/lib/admin/rbac';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    // Verify admin access
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
    });
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // RBAC check
    if (!hasPermission(adminUser.role as Role, Resource.HOSTS, Action.READ)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const verification = searchParams.get('verification');
    const superHost = searchParams.get('superHost');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (verification) where.verificationStatus = verification;
    if (superHost === 'true') where.superHost = true;
    if (superHost === 'false') where.superHost = false;

    const [hosts, total] = await Promise.all([
      prisma.propertyOwner.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
            },
          },
          _count: {
            select: { properties: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.propertyOwner.count({ where }),
    ]);

    // Get aggregate stats
    const [totalHosts, verifiedHosts, superHosts, pendingVerification] = await Promise.all([
      prisma.propertyOwner.count(),
      prisma.propertyOwner.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.propertyOwner.count({ where: { superHost: true } }),
      prisma.propertyOwner.count({ where: { verificationStatus: 'PENDING' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: hosts,
      stats: { totalHosts, verifiedHosts, superHosts, pendingVerification },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Admin hosts API error:', error);
    return NextResponse.json({ error: 'Failed to fetch hosts' }, { status: 500 });
  }
}
