/**
 * Admin Host Detail API
 * GET  /api/admin/hosts/[id] — Get single host detail
 * PATCH /api/admin/hosts/[id] — Update host fields (RBAC + Audit)
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { hasPermission, Role, Resource, Action } from '@/lib/admin/rbac';
import { logAdminAction } from '@/lib/admin/audit-logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!hasPermission(adminUser.role as Role, Resource.HOSTS, Action.READ)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const host = await prisma.propertyOwner.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, image: true,
            createdAt: true, emailVerified: true,
          },
        },
        properties: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            _count: { select: { bookings: true, rooms: true, images: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: host });
  } catch (error: any) {
    console.error('Admin host detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch host' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // RBAC check — require UPDATE permission on HOSTS
    if (!hasPermission(adminUser.role as Role, Resource.HOSTS, Action.UPDATE)) {
      return NextResponse.json({ error: 'Insufficient permissions to update hosts' }, { status: 403 });
    }

    const body = await request.json();

    // Capture before state for audit
    const beforeHost = await prisma.propertyOwner.findUnique({
      where: { id: params.id },
      select: { status: true, superHost: true, verificationStatus: true, identityVerified: true, trustScore: true, commissionRate: true },
    });

    // Only allow specific fields to be updated
    const allowedFields = [
      'status', 'superHost', 'commissionRate', 'verificationStatus',
      'identityVerified', 'emailVerified', 'phoneVerified', 'trustScore',
    ];
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const host = await prisma.propertyOwner.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Audit log
    logAdminAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || undefined,
      action: Object.keys(updateData).join(', '),
      resource: 'hosts',
      resourceId: params.id,
      details: { hostName: host.user?.name, hostEmail: host.user?.email },
      before: beforeHost || {},
      after: updateData,
    });

    return NextResponse.json({ success: true, data: host });
  } catch (error: any) {
    console.error('Admin host update error:', error);
    return NextResponse.json({ error: 'Failed to update host' }, { status: 500 });
  }
}
