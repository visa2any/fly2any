/**
 * 📉 EMAIL TIMESERIES DATA API
 * Provides time-series data for email performance charts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Calculate date range and interval
    const now = new Date();
    const startDate = getStartDateForRange(timeRange, now);
    const interval = getIntervalForRange(timeRange);

    console.log(`📉 Fetching timeseries data for ${timeRange} with ${interval} interval`);

    // Generate time buckets
    const timeBuckets = generateTimeBuckets(startDate, now, interval);

    // Get email data grouped by time periods
    const timeSeriesData = await Promise.all(
      timeBuckets.map(async (bucket) => {
        const bucketStart = bucket.start;
        const bucketEnd = bucket.end;

        // Get email counts for this time bucket
        const emailStats = await prisma.emailLog.groupBy({
          by: ['status'],
          where: {
            createdAt: {
              gte: bucketStart,
              lt: bucketEnd
            }
          },
          _count: true
        });

        // Get webhook events for this time bucket
        const webhookEvents = await prisma.webhookEvent.groupBy({
          by: ['eventType'],
          where: {
            createdAt: {
              gte: bucketStart,
              lt: bucketEnd
            },
            processed: true
          },
          _count: true
        });

        // Calculate metrics
        const emailCounts = emailStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>);

        const eventCounts = webhookEvents.reduce((acc, event) => {
          acc[event.eventType] = event._count;
          return acc;
        }, {} as Record<string, number>);

        const sent = emailCounts.SENT || 0;
        const delivered = sent - (eventCounts.bounced || 0) - (eventCounts.failed || 0);
        const opened = eventCounts.opened || 0;
        const clicked = eventCounts.clicked || 0;
        const bounced = (eventCounts.bounced || 0) + (eventCounts.failed || 0);

        return {
          date: bucket.label,
          sent,
          delivered,
          opened,
          clicked,
          bounced,
          deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
          openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
          clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
          bounceRate: sent > 0 ? (bounced / sent) * 100 : 0
        };
      })
    );

    console.log(`✅ Timeseries data generated: ${timeSeriesData.length} data points`);
    return NextResponse.json(timeSeriesData);

  } catch (error: any) {
    console.error('❌ Failed to fetch timeseries data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeseries data', message: error.message },
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

function getIntervalForRange(timeRange: string): string {
  switch (timeRange) {
    case '24h':
      return 'hour';
    case '7d':
      return 'day';
    case '30d':
      return 'day';
    case '90d':
      return 'week';
    default:
      return 'day';
  }
}

function generateTimeBuckets(startDate: Date, endDate: Date, interval: string) {
  const buckets = [];
  const current = new Date(startDate);
  
  while (current < endDate) {
    const bucketStart = new Date(current);
    let bucketEnd: Date;
    let label: string;
    
    switch (interval) {
      case 'hour':
        current.setHours(current.getHours() + 1);
        bucketEnd = new Date(current);
        label = bucketStart.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric',
          hour12: true 
        });
        break;
      case 'day':
        current.setDate(current.getDate() + 1);
        bucketEnd = new Date(current);
        label = bucketStart.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        bucketEnd = new Date(current);
        label = `Week of ${bucketStart.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })}`;
        break;
      default:
        current.setDate(current.getDate() + 1);
        bucketEnd = new Date(current);
        label = bucketStart.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
    }
    
    buckets.push({
      start: bucketStart,
      end: bucketEnd,
      label
    });
  }
  
  return buckets;
}