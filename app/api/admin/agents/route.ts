// app/api/admin/agents/route.ts
// Admin Agents Management API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma!.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [agents, total] = await Promise.all([
      prisma!.travelAgent.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          _count: { select: { quotes: true, bookings: true, clients: true, commissions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma!.travelAgent.count({ where }),
    ]);

    // Stats
    const stats = await prisma!.travelAgent.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const totalCommissions = await prisma!.agentCommission.aggregate({
      _sum: { agentEarnings: true, platformFee: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        agents,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        stats: {
          byStatus: Object.fromEntries(stats.map(s => [s.status, s._count.id])),
          totalCommissions: totalCommissions._sum.agentEarnings || 0,
          platformFees: totalCommissions._sum.platformFee || 0,
        },
      },
    });
  } catch (error) {
    console.error('Admin agents error:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma!.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { agentId, status, commissionRate, notes } = await req.json();

    const updated = await prisma!.travelAgent.update({
      where: { id: agentId },
      data: {
        ...(status && { status }),
        ...(commissionRate !== undefined && { commissionRate }),
        ...(notes && { adminNotes: notes }),
      },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin agent update error:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}
