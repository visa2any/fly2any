/**
 * 📊 EMAIL ANALYTICS METRICS API
 * Provides comprehensive email metrics for the analytics dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Calculate date range
    const now = new Date();
    const startDate = getStartDateForRange(timeRange, now);

    console.log(`📊 Fetching email metrics for ${timeRange} (${startDate.toISOString()} to ${now.toISOString()})`);

    // Get email statistics
    const emailStats = await prisma.emailLog.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      _count: true
    });

    // Get webhook event statistics
    const webhookStats = await prisma.webhookEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        },
        processed: true
      },
      _count: true
    });

    // Calculate metrics
    const stats = emailStats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    const webhookCounts = webhookStats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.eventType] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    const totalSent = stats.SENT || 0;
    const totalDelivered = totalSent - (webhookCounts.bounced || 0) - (webhookCounts.failed || 0);
    const totalOpened = webhookCounts.opened || 0;
    const totalClicked = webhookCounts.clicked || 0;
    const totalBounced = (webhookCounts.bounced || 0) + (webhookCounts.failed || 0);
    const totalUnsubscribed = webhookCounts.unsubscribed || 0;
    const totalComplaints = webhookCounts.complained || 0;

    const metrics = {
      totalSent,
      delivered: totalDelivered,
      opened: totalOpened,
      clicked: totalClicked,
      bounced: totalBounced,
      unsubscribed: totalUnsubscribed,
      complaints: totalComplaints,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
      unsubscribeRate: totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0,
      complaintRate: totalSent > 0 ? (totalComplaints / totalSent) * 100 : 0
    };

    console.log(`✅ Metrics calculated:`, {
      timeRange,
      totalSent: metrics.totalSent,
      deliveryRate: `${metrics.deliveryRate.toFixed(1)}%`,
      openRate: `${metrics.openRate.toFixed(1)}%`,
      clickRate: `${metrics.clickRate.toFixed(1)}%`
    });

    return NextResponse.json(metrics);

  } catch (error: any) {
    console.error('❌ Failed to fetch email metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics', message: error.message },
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