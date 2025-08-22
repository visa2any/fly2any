/**
 * 🚨 EMAIL ALERTS API
 * Provides system alerts and notifications for the analytics dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const severity = searchParams.get('severity'); // 'critical', 'warning', 'info'
    const resolved = searchParams.get('resolved'); // 'true', 'false', 'all'

    console.log(`🚨 Fetching alerts: limit=${limit}, severity=${severity || 'all'}, resolved=${resolved || 'all'}`);

    // Build where clause
    const whereClause: any = {};
    
    if (severity) {
      whereClause.severity = severity;
    }
    
    if (resolved === 'true') {
      whereClause.isResolved = true;
    } else if (resolved === 'false') {
      whereClause.isResolved = false;
    }

    // Get alerts
    const alerts = await prisma.systemAlert.findMany({
      where: whereClause,
      orderBy: [
        { isResolved: 'asc' }, // Unresolved first
        { createdAt: 'desc' }  // Most recent first
      ],
      take: limit
    });

    // Get alert summary statistics
    const alertStats = await prisma.systemAlert.groupBy({
      by: ['severity', 'isResolved'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      _count: true
    });

    const summary = alertStats.reduce((acc, stat) => {
      const key = `${stat.severity}_${stat.isResolved ? 'resolved' : 'active'}`;
      acc[key] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    // Format alerts for frontend
    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      service: alert.service,
      threshold: alert.threshold,
      currentValue: alert.currentValue,
      isResolved: alert.isResolved,
      createdAt: alert.createdAt.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
      timeSinceCreated: getTimeSince(alert.createdAt),
      isRecent: (Date.now() - alert.createdAt.getTime()) < (60 * 60 * 1000) // Within last hour
    }));

    const response = {
      alerts: formattedAlerts,
      summary: {
        total: alerts.length,
        critical: summary.critical_active || 0,
        warning: summary.warning_active || 0,
        info: summary.info_active || 0,
        resolved: summary.critical_resolved + summary.warning_resolved + summary.info_resolved || 0,
        activeTotal: (summary.critical_active || 0) + (summary.warning_active || 0) + (summary.info_active || 0)
      },
      metadata: {
        limit,
        severity,
        resolved,
        fetchedAt: new Date().toISOString()
      }
    };

    console.log(`✅ Alerts fetched: ${alerts.length} alerts, ${response.summary.activeTotal} active`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Failed to fetch alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertIds, action } = body;

    if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json(
        { error: 'Alert IDs are required' },
        { status: 400 }
      );
    }

    console.log(`🚨 Processing alert action: ${action} for ${alertIds.length} alerts`);

    let result;
    
    switch (action) {
      case 'resolve':
        result = await prisma.systemAlert.updateMany({
          where: {
            id: { in: alertIds },
            isResolved: false
          },
          data: {
            isResolved: true,
            resolvedAt: new Date()
          }
        });
        break;
      
      case 'delete':
        result = await prisma.systemAlert.deleteMany({
          where: {
            id: { in: alertIds }
          }
        });
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "resolve" or "delete"' },
          { status: 400 }
        );
    }

    console.log(`✅ Alert action completed: ${action} - ${result.count} alerts affected`);
    
    return NextResponse.json({
      success: true,
      action,
      affectedCount: result.count,
      alertIds
    });

  } catch (error: any) {
    console.error('❌ Failed to process alert action:', error);
    return NextResponse.json(
      { error: 'Failed to process alert action', message: error.message },
      { status: 500 }
    );
  }
}

function getTimeSince(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}