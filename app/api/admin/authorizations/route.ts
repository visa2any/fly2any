import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/middleware';

/**
 * Admin API - Get Card Authorizations
 * GET /api/admin/authorizations
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const prisma = getPrismaClient();

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Get authorizations
    const authorizations = await prisma.cardAuthorization.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get stats
    const [total, pending, verified, rejected, highRisk] = await Promise.all([
      prisma.cardAuthorization.count(),
      prisma.cardAuthorization.count({ where: { status: 'PENDING' } }),
      prisma.cardAuthorization.count({ where: { status: 'VERIFIED' } }),
      prisma.cardAuthorization.count({ where: { status: 'REJECTED' } }),
      prisma.cardAuthorization.count({ where: { riskScore: { gte: 50 } } }),
    ]);

    return NextResponse.json({
      success: true,
      authorizations,
      stats: {
        total,
        pending,
        verified,
        rejected,
        highRisk,
      },
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error: any) {
    console.error('❌ [Admin Auth] Error fetching authorizations:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to fetch authorizations' },
      { status: 500 }
    );
  }
}
