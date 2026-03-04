/**
 * Admin Properties Bulk Actions API
 * POST /api/admin/properties/bulk — Approve/reject/suspend multiple properties at once
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { hasPermission, Role, Resource, Action } from '@/lib/admin/rbac';
import { logAdminAction } from '@/lib/admin/audit-logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    if (!hasPermission(adminUser.role as Role, Resource.PROPERTIES, Action.UPDATE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { propertyIds, action, rejectionReason } = body;

    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json({ error: 'No properties selected' }, { status: 400 });
    }

    if (!['approve', 'reject', 'suspend', 'reactivate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updateData: any = {};
    switch (action) {
      case 'approve':
        updateData.status = 'active';
        updateData.publishedAt = new Date();
        updateData.verified = true;
        updateData.verifiedAt = new Date();
        updateData.rejectionReason = null;
        break;
      case 'reject':
        updateData.status = 'rejected';
        updateData.rejectionReason = rejectionReason || 'Does not meet quality standards';
        updateData.publishedAt = null;
        break;
      case 'suspend':
        updateData.status = 'suspended';
        break;
      case 'reactivate':
        updateData.status = 'active';
        break;
    }

    // Perform bulk update
    const result = await prisma.property.updateMany({
      where: { id: { in: propertyIds } },
      data: updateData,
    });

    // Create notifications for property owners
    if (action === 'approve' || action === 'reject') {
      const properties = await prisma.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, name: true, owner: { select: { userId: true } } },
      });

      const notifications = properties.map((p: any) => ({
        userId: p.owner.userId,
        type: action === 'approve' ? 'property_approved' : 'property_rejected',
        title: action === 'approve' ? '🎉 Property Approved!' : '❌ Property Not Approved',
        message: action === 'approve'
          ? `Your property "${p.name}" has been approved and is now live!`
          : `Your property "${p.name}" was not approved. Reason: ${updateData.rejectionReason}`,
        priority: 'high' as const,
        actionUrl: '/host/properties',
        metadata: { propertyId: p.id, propertyName: p.name },
      }));

      await prisma.notification.createMany({ data: notifications }).catch(() => {});
    }

    // Audit log
    logAdminAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || undefined,
      action: `bulk_${action}`,
      resource: 'properties',
      resourceId: propertyIds.join(','),
      details: { count: propertyIds.length, action },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `${result.count} properties ${action}d successfully`,
    });
  } catch (error: any) {
    console.error('Bulk action error:', error);
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}
