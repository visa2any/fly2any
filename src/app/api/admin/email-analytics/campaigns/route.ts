/**
 * 📈 EMAIL CAMPAIGN ANALYTICS API
 * Provides campaign performance data for analytics dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

// Type for campaign performance data
interface CampaignPerformance {
  id: string;
  name: string;
  type: string;
  status: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  roi: number;
  createdAt: string;
  sentAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const campaignType = searchParams.get('type') || 'all';
    
    // Calculate date range
    const now = new Date();
    const startDate = getStartDateForRange(timeRange, now);

    console.log(`📈 Fetching campaign analytics for ${timeRange}, type: ${campaignType}`);

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    if (campaignType !== 'all') {
      whereClause.type = campaignType;
    }

    // Get campaigns with email statistics
    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            emails: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get detailed performance for each campaign
    const campaignPerformance: CampaignPerformance[] = await Promise.all(
      campaigns.map(async (campaign: any) => {
        // Get email statistics for this campaign
        const emailStats = await prisma.campaignEmail.groupBy({
          by: ['status'],
          where: { campaignId: campaign.id },
          _count: true
        });

        // Get webhook events for this campaign
        const webhookEvents = await prisma.emailAnalyticsEvent.groupBy({
          by: ['eventType'],
          where: { campaignId: campaign.id },
          _count: true
        });

        // Calculate metrics
        const stats = emailStats.reduce((acc: Record<string, number>, stat: any) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>);

        const events = webhookEvents.reduce((acc: Record<string, number>, event: any) => {
          acc[event.eventType] = event._count;
          return acc;
        }, {} as Record<string, number>);

        const sent = stats.sent || 0;
        const delivered = sent - (events.bounced || 0) - (events.failed || 0);
        const opened = events.opened || 0;
        const clicked = events.clicked || 0;
        const conversions = events.converted || 0; // Assuming conversion tracking

        // Calculate estimated revenue (placeholder - implement your revenue tracking)
        const estimatedRevenue = conversions * 25; // $25 average order value
        const campaignCost = sent * 0.001; // $0.001 per email cost
        const roi = campaignCost > 0 ? ((estimatedRevenue - campaignCost) / campaignCost) * 100 : 0;

        return {
          id: campaign.id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          sent,
          delivered,
          opened,
          clicked,
          conversions,
          revenue: estimatedRevenue,
          openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
          clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
          conversionRate: clicked > 0 ? (conversions / clicked) * 100 : 0,
          roi,
          createdAt: campaign.createdAt.toISOString(),
          sentAt: campaign.startDate?.toISOString()
        };
      })
    );

    // Get top performers (sorted by ROI)
    const topPerformers = [...campaignPerformance]
      .filter(c => c.sent > 0)
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);

    const response = {
      campaigns: campaignPerformance,
      topPerformers,
      summary: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter((c: any) => c.status === 'running').length,
        totalEmailsSent: campaignPerformance.reduce((sum: number, c: CampaignPerformance) => sum + c.sent, 0),
        averageOpenRate: campaignPerformance.length > 0 
          ? campaignPerformance.reduce((sum: number, c: CampaignPerformance) => sum + c.openRate, 0) / campaignPerformance.length 
          : 0,
        averageClickRate: campaignPerformance.length > 0 
          ? campaignPerformance.reduce((sum: number, c: CampaignPerformance) => sum + c.clickRate, 0) / campaignPerformance.length 
          : 0,
        totalRevenue: campaignPerformance.reduce((sum: number, c: CampaignPerformance) => sum + c.revenue, 0)
      }
    };

    console.log(`✅ Campaign analytics fetched: ${campaigns.length} campaigns`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Failed to fetch campaign analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign analytics', message: error.message },
      { status: 500 }
    );
  }
}

function getStartDateForRange(timeRange: string, endDate: Date): Date {
  const date = new Date(endDate);
  
  switch (timeRange) {
    case '24h':
      date.setHours(date.getHours() - 24);
      break;
    case '7d':
      date.setDate(date.getDate() - 7);
      break;
    case '30d':
      date.setDate(date.getDate() - 30);
      break;
    case '90d':
      date.setDate(date.getDate() - 90);
      break;
    default:
      date.setDate(date.getDate() - 7);
  }
  
  return date;
}