/**
 * Admin Properties API
 * GET /api/admin/properties — List all properties with filters & pagination
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
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
    });
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // RBAC check
    if (!hasPermission(adminUser.role as Role, Resource.PROPERTIES, Action.READ)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const propertyType = searchParams.get('propertyType');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const hostId = searchParams.get('hostId');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { owner: { businessName: { contains: search, mode: 'insensitive' } } },
        { owner: { user: { email: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (status) where.status = status;
    if (propertyType) where.propertyType = propertyType;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };
    if (hostId) where.ownerId = hostId;
    if (featured === 'true') where.featuredUntil = { gte: new Date() };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          owner: {
            select: {
              id: true,
              businessName: true,
              superHost: true,
              verificationStatus: true,
              user: { select: { name: true, email: true, image: true } },
            },
          },
          _count: { select: { rooms: true, images: true, bookings: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    // Aggregate stats
    const [totalProperties, activeProperties, pendingReview, draftProperties, rejectedProperties] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'active' } }),
      prisma.property.count({ where: { status: 'pending_review' } }),
      prisma.property.count({ where: { status: 'draft' } }),
      prisma.property.count({ where: { status: 'rejected' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: properties,
      stats: { totalProperties, activeProperties, pendingReview, draftProperties, rejectedProperties },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Admin properties API error:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
