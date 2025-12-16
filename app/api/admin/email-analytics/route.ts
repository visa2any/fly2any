/**
 * Admin Email Analytics API
 *
 * Provides comprehensive email metrics:
 * - Send/open/click rates
 * - Revenue attribution
 * - AI decision breakdown
 * - Campaign performance
 *
 * @route GET /api/admin/email-analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/middleware';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const type = searchParams.get('type') || 'overview';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    if (type === 'overview') {
      return NextResponse.json(await getOverviewStats(startDate));
    }

    if (type === 'campaigns') {
      return NextResponse.json(await getCampaignStats(startDate));
    }

    if (type === 'decisions') {
      return NextResponse.json(await getAIDecisionStats(startDate));
    }

    if (type === 'deliverability') {
      return NextResponse.json(await getDeliverabilityStats(startDate));
    }

    return NextResponse.json(await getOverviewStats(startDate));

  } catch (error) {
    console.error('[Email Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getOverviewStats(startDate: Date) {
  if (!prisma) {
    return getMockStats();
  }

  try {
    // Get email counts
    const [totalSent, delivered, opened, clicked, bounced, complained] = await Promise.all([
      prisma.emailLog.count({ where: { sentAt: { gte: startDate } } }),
      prisma.emailLog.count({ where: { deliveredAt: { gte: startDate } } }),
      prisma.emailLog.count({ where: { openedAt: { gte: startDate } } }),
      prisma.emailLog.count({ where: { clickedAt: { gte: startDate } } }),
      prisma.emailLog.count({ where: { status: 'bounced', sentAt: { gte: startDate } } }),
      prisma.emailLog.count({ where: { status: 'complained', sentAt: { gte: startDate } } }),
    ]);

    // Calculate rates
    const deliveryRate = totalSent > 0 ? (delivered / totalSent * 100).toFixed(1) : '0';
    const openRate = delivered > 0 ? (opened / delivered * 100).toFixed(1) : '0';
    const clickRate = opened > 0 ? (clicked / opened * 100).toFixed(1) : '0';
    const bounceRate = totalSent > 0 ? (bounced / totalSent * 100).toFixed(2) : '0';
    const complaintRate = totalSent > 0 ? (complained / totalSent * 100).toFixed(3) : '0';

    // Get by type breakdown
    const byType = await prisma.emailLog.groupBy({
      by: ['emailType'],
      where: { sentAt: { gte: startDate } },
      _count: { id: true },
    });

    // Get daily trend
    const dailyTrend = await prisma.$queryRaw`
      SELECT
        DATE(sentAt) as date,
        COUNT(*) as sent,
        COUNT(CASE WHEN openedAt IS NOT NULL THEN 1 END) as opened,
        COUNT(CASE WHEN clickedAt IS NOT NULL THEN 1 END) as clicked
      FROM "EmailLog"
      WHERE sentAt >= ${startDate}
      GROUP BY DATE(sentAt)
      ORDER BY date ASC
    ` as any[];

    return {
      success: true,
      data: {
        overview: {
          totalSent,
          delivered,
          opened,
          clicked,
          bounced,
          complained,
          deliveryRate: parseFloat(deliveryRate),
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
          bounceRate: parseFloat(bounceRate),
          complaintRate: parseFloat(complaintRate),
        },
        byType: byType.map(t => ({
          type: t.emailType,
          count: t._count.id,
        })),
        trend: dailyTrend,
      },
    };

  } catch (error) {
    console.warn('[Email Analytics] DB query failed, using mock data');
    return getMockStats();
  }
}

async function getCampaignStats(startDate: Date) {
  if (!prisma) {
    return { success: true, data: { campaigns: [] } };
  }

  try {
    const campaigns = await prisma.campaignLog?.groupBy({
      by: ['campaignId'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    });

    const campaignDetails = await Promise.all(
      (campaigns || []).map(async (c: any) => {
        const started = await prisma.campaignLog?.count({
          where: { campaignId: c.campaignId, event: 'started' },
        });
        const completed = await prisma.campaignLog?.count({
          where: { campaignId: c.campaignId, event: 'completed' },
        });
        const converted = await prisma.campaignLog?.count({
          where: { campaignId: c.campaignId, event: 'converted' },
        });

        return {
          campaignId: c.campaignId,
          totalEvents: c._count.id,
          started: started || 0,
          completed: completed || 0,
          converted: converted || 0,
          conversionRate: started ? ((converted || 0) / started * 100).toFixed(1) : '0',
        };
      })
    );

    return {
      success: true,
      data: { campaigns: campaignDetails },
    };

  } catch {
    return { success: true, data: { campaigns: [] } };
  }
}

async function getAIDecisionStats(startDate: Date) {
  if (!prisma) {
    return { success: true, data: { decisions: [] } };
  }

  try {
    const decisions = await prisma.emailDecisionLog?.groupBy({
      by: ['decision'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      _avg: { confidence: true },
    });

    const byEvent = await prisma.emailDecisionLog?.groupBy({
      by: ['event', 'decision'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    });

    return {
      success: true,
      data: {
        summary: (decisions || []).map((d: any) => ({
          decision: d.decision,
          count: d._count.id,
          avgConfidence: d._avg?.confidence?.toFixed(2) || 0,
        })),
        byEvent: byEvent || [],
      },
    };

  } catch {
    return { success: true, data: { decisions: [] } };
  }
}

async function getDeliverabilityStats(startDate: Date) {
  if (!prisma) {
    return { success: true, data: {} };
  }

  try {
    // Bounce breakdown
    const bounces = await prisma.emailLog.groupBy({
      by: ['bounceType'],
      where: {
        status: 'bounced',
        sentAt: { gte: startDate },
      },
      _count: { id: true },
    });

    // Suppression list count
    const suppressedCount = await prisma.emailSuppression?.count() || 0;

    // Recent bounces
    const recentBounces = await prisma.emailLog.findMany({
      where: {
        status: 'bounced',
        sentAt: { gte: startDate },
      },
      select: {
        recipientEmail: true,
        bounceType: true,
        bounceReason: true,
        sentAt: true,
      },
      orderBy: { sentAt: 'desc' },
      take: 10,
    });

    return {
      success: true,
      data: {
        bounceBreakdown: bounces.map(b => ({
          type: b.bounceType || 'unknown',
          count: b._count.id,
        })),
        suppressedCount,
        recentBounces,
      },
    };

  } catch {
    return { success: true, data: {} };
  }
}

function getMockStats() {
  return {
    success: true,
    data: {
      overview: {
        totalSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        complaintRate: 0,
      },
      byType: [],
      trend: [],
      note: 'Email tracking tables not yet created. Run migration to enable.',
    },
  };
}
