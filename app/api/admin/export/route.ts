/**
 * Admin Export API
 * GET /api/admin/export?type=hosts|properties — Export data as CSV
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'hosts') {
      if (!hasPermission(adminUser.role as Role, Resource.HOSTS, Action.EXPORT)) {
        return NextResponse.json({ error: 'No export permission' }, { status: 403 });
      }

      const hosts = await prisma.propertyOwner.findMany({
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { properties: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      });

      const csv = [
        'Name,Email,Business Name,Business Type,Status,Verification,SuperHost,Trust Score,Commission,Properties,Revenue,Phone,Created',
        ...hosts.map((h: any) =>
          [
            `"${h.user?.name || ''}"`,
            h.user?.email || '',
            `"${h.businessName || ''}"`,
            h.businessType,
            h.status,
            h.verificationStatus,
            h.superHost ? 'Yes' : 'No',
            h.trustScore,
            `${h.commissionRate}%`,
            h._count?.properties || 0,
            `$${h.totalRevenue.toFixed(2)}`,
            h.phone || '',
            new Date(h.createdAt).toISOString().split('T')[0],
          ].join(',')
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="hosts_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (type === 'properties') {
      if (!hasPermission(adminUser.role as Role, Resource.PROPERTIES, Action.EXPORT)) {
        return NextResponse.json({ error: 'No export permission' }, { status: 403 });
      }

      const properties = await prisma.property.findMany({
        include: {
          owner: { select: { businessName: true, user: { select: { name: true, email: true } } } },
          _count: { select: { rooms: true, images: true, bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      });

      const csv = [
        'Name,City,Country,Type,Status,Verified,Price/Night,Rooms,Images,Bookings,Host Name,Host Email,Created',
        ...properties.map((p: any) =>
          [
            `"${p.name}"`,
            `"${p.city}"`,
            `"${p.country}"`,
            p.propertyType,
            p.status,
            p.verified ? 'Yes' : 'No',
            p.basePricePerNight ? `$${p.basePricePerNight}` : 'N/A',
            p._count?.rooms || 0,
            p._count?.images || 0,
            p._count?.bookings || 0,
            `"${p.owner?.user?.name || ''}"`,
            p.owner?.user?.email || '',
            new Date(p.createdAt).toISOString().split('T')[0],
          ].join(',')
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="properties_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type. Use ?type=hosts or ?type=properties' }, { status: 400 });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
