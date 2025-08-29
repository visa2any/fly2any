import { NextRequest, NextResponse } from 'next/server';
import { emailMarketingLogger, LogLevel, EmailEvent } from '@/lib/email-marketing-logger';
import fs from 'fs';
import path from 'path';

// Monitoring dashboard API endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    switch (action) {
      case 'dashboard': {
        const hours = parseInt(searchParams.get('hours') || '24');
        const stats = await emailMarketingLogger.getLogStatistics(hours);
        
        // Calculate metrics
        const totalEvents = stats.totalEntries;
        const errorRate = totalEvents > 0 ? (stats.errors.length / totalEvents * 100).toFixed(2) : '0';
        const criticalCount = stats.criticalIssues.length;
        
        // Get recent activity
        const recentErrors = stats.errors.slice(0, 10);
        const recentCritical = stats.criticalIssues.slice(0, 5);
        
        // Campaign performance
        const campaignPerformance = Object.entries(stats.byCampaign).map(([campaignId, count]) => ({
          campaignId,
          events: count,
          lastActivity: new Date().toISOString() // Would need actual timestamp from logs
        })).sort((a, b) => b.events - a.events).slice(0, 10);

        return NextResponse.json({
          success: true,
          data: {
            overview: {
              totalEvents,
              errorRate: `${errorRate}%`,
              criticalCount,
              timeRange: `Last ${hours} hours`,
              generatedAt: new Date().toISOString()
            },
            eventsByLevel: stats.byLevel,
            eventsByType: stats.byEvent,
            campaignActivity: stats.byCampaign,
            recentErrors,
            recentCritical,
            campaignPerformance,
            systemHealth: {
              status: criticalCount === 0 ? 'healthy' : criticalCount < 5 ? 'warning' : 'critical',
              uptime: process.uptime(),
              memoryUsage: process.memoryUsage(),
              nodeVersion: process.version
            }
          }
        });
      }

      case 'realtime': {
        // Get last 50 log entries for real-time monitoring
        const logDir = path.join(process.cwd(), 'logs', 'email-marketing');
        const now = new Date();
        const dateFormat = now.toISOString().split('T')[0];
        const logFile = path.join(logDir, `email-marketing-${dateFormat}.jsonl`);
        
        if (!fs.existsSync(logFile)) {
          return NextResponse.json({
            success: true,
            data: { entries: [], timestamp: new Date().toISOString() }
          });
        }

        const content = fs.readFileSync(logFile, 'utf-8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        const recentLines = lines.slice(-50); // Last 50 entries
        
        const entries = recentLines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);

        return NextResponse.json({
          success: true,
          data: {
            entries: entries.reverse(), // Most recent first
            timestamp: new Date().toISOString(),
            count: entries.length
          }
        });
      }

      case 'campaigns': {
        const campaignId = searchParams.get('campaignId');
        const hours = parseInt(searchParams.get('hours') || '24');
        
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'campaignId parameter is required'
          }, { status: 400 });
        }

        // Get campaign-specific logs
        const stats = await emailMarketingLogger.getLogStatistics(hours);
        const campaignStats = await getCampaignSpecificLogs(campaignId, hours);
        
        return NextResponse.json({
          success: true,
          data: {
            campaignId,
            timeRange: `Last ${hours} hours`,
            totalEvents: campaignStats.totalEvents,
            eventsByType: campaignStats.eventsByType,
            emailMetrics: campaignStats.emailMetrics,
            timeline: campaignStats.timeline,
            errors: campaignStats.errors,
            performance: campaignStats.performance
          }
        });
      }

      case 'alerts': {
        const level = searchParams.get('level') || 'error';
        const hours = parseInt(searchParams.get('hours') || '1');
        
        const stats = await emailMarketingLogger.getLogStatistics(hours);
        let alerts: any[] = [];

        if (level === 'critical') {
          alerts = stats.criticalIssues;
        } else if (level === 'error') {
          alerts = stats.errors;
        }

        // Generate alert summaries
        const alertSummaries = alerts.map(alert => ({
          id: `${alert.timestamp}-${alert.event}`,
          timestamp: alert.timestamp,
          level: alert.levelName,
          event: alert.event,
          message: alert.message,
          campaignId: alert.campaignId,
          contactId: alert.contactId,
          email: alert.email,
          error: alert.error?.message,
          metadata: alert.metadata
        }));

        return NextResponse.json({
          success: true,
          data: {
            alerts: alertSummaries,
            count: alertSummaries.length,
            level,
            timeRange: `Last ${hours} hours`,
            generatedAt: new Date().toISOString()
          }
        });
      }

      case 'performance': {
        const hours = parseInt(searchParams.get('hours') || '24');
        const performanceMetrics = await getPerformanceMetrics(hours);
        
        return NextResponse.json({
          success: true,
          data: performanceMetrics
        });
      }

      case 'export': {
        const format = searchParams.get('format') || 'json';
        const hours = parseInt(searchParams.get('hours') || '24');
        const campaignId = searchParams.get('campaignId');
        
        if (format === 'csv') {
          const csvData = await exportLogsAsCSV(hours, campaignId || undefined);
          return new NextResponse(csvData, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="email-marketing-logs-${new Date().toISOString().split('T')[0]}.csv"`
            }
          });
        } else {
          const stats = await emailMarketingLogger.getLogStatistics(hours);
          return NextResponse.json({
            success: true,
            data: {
              exportedAt: new Date().toISOString(),
              timeRange: `Last ${hours} hours`,
              campaignId,
              ...stats
            }
          });
        }
      }

      case 'cleanup': {
        // Clean old log files
        const result = await emailMarketingLogger.cleanOldLogs();
        
        return NextResponse.json({
          success: true,
          data: {
            message: `Cleaned ${result.deleted} old log files`,
            deleted: result.deleted,
            errors: result.errors
          }
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}. Available actions: dashboard, realtime, campaigns, alerts, performance, export, cleanup`
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in logs API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Helper function to get campaign-specific logs
async function getCampaignSpecificLogs(campaignId: string, hours: number) {
  try {
    const logDir = path.join(process.cwd(), 'logs', 'email-marketing');
    const now = new Date();
    const since = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    // Get today's log file
    const dateFormat = now.toISOString().split('T')[0];
    const logFile = path.join(logDir, `email-marketing-${dateFormat}.jsonl`);
    
    if (!fs.existsSync(logFile)) {
      return {
        totalEvents: 0,
        eventsByType: {},
        emailMetrics: {},
        timeline: [],
        errors: [],
        performance: {}
      };
    }

    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    const entries = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Filter by campaign and time range
    const campaignEntries = entries.filter((entry: any) => 
      entry.campaignId === campaignId && 
      new Date(entry.timestamp) >= since
    );

    // Aggregate statistics
    const eventsByType: Record<string, number> = {};
    const emailMetrics = {
      sent: 0,
      failed: 0,
      opened: 0,
      clicked: 0,
      bounced: 0
    };
    const errors = campaignEntries.filter((entry: any) => entry.level >= LogLevel.ERROR);
    const timeline = campaignEntries.map((entry: any) => ({
      timestamp: entry.timestamp,
      event: entry.event,
      message: entry.message,
      level: entry.levelName
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    campaignEntries.forEach(entry => {
      eventsByType[entry.event] = (eventsByType[entry.event] || 0) + 1;
      
      // Update email metrics
      switch (entry.event) {
        case EmailEvent.EMAIL_SENT:
          emailMetrics.sent++;
          break;
        case EmailEvent.EMAIL_FAILED:
          emailMetrics.failed++;
          break;
        case EmailEvent.EMAIL_OPENED:
          emailMetrics.opened++;
          break;
        case EmailEvent.EMAIL_CLICKED:
          emailMetrics.clicked++;
          break;
        case EmailEvent.EMAIL_BOUNCED:
          emailMetrics.bounced++;
          break;
      }
    });

    // Calculate performance metrics
    const performanceEntries = campaignEntries.filter((entry: any) => entry.performance);
    const avgMemoryUsage = performanceEntries.length > 0 
      ? performanceEntries.reduce((sum, entry) => sum + (entry.performance?.memoryUsage.heapUsed || 0), 0) / performanceEntries.length
      : 0;
    const avgProcessingTime = performanceEntries.length > 0
      ? performanceEntries.reduce((sum, entry) => sum + (entry.performance?.processingTime || 0), 0) / performanceEntries.length
      : 0;

    return {
      totalEvents: campaignEntries.length,
      eventsByType,
      emailMetrics,
      timeline,
      errors,
      performance: {
        avgMemoryUsage: Math.round(avgMemoryUsage / 1024 / 1024), // MB
        avgProcessingTime: Math.round(avgProcessingTime),
        totalDuration: campaignEntries.length > 0 
          ? new Date(timeline[timeline.length - 1]?.timestamp).getTime() - new Date(timeline[0]?.timestamp).getTime()
          : 0
      }
    };
  } catch (error) {
    console.error('Error getting campaign-specific logs:', error);
    return {
      totalEvents: 0,
      eventsByType: {},
      emailMetrics: {},
      timeline: [],
      errors: [],
      performance: {}
    };
  }
}

// Helper function to get performance metrics
async function getPerformanceMetrics(hours: number) {
  const stats = await emailMarketingLogger.getLogStatistics(hours);
  
  // Calculate various performance metrics
  const totalEvents = stats.totalEntries;
  const errorRate = totalEvents > 0 ? (stats.errors.length / totalEvents * 100) : 0;
  
  // Email throughput (emails per hour)
  const emailEvents = [
    EmailEvent.EMAIL_SENT,
    EmailEvent.EMAIL_FAILED,
    EmailEvent.EMAIL_BOUNCED
  ];
  const emailCount = emailEvents.reduce((sum, event) => sum + (stats.byEvent[event] || 0), 0);
  const emailsPerHour = Math.round(emailCount / hours);
  
  // Campaign efficiency
  const campaignEvents = stats.byEvent[EmailEvent.CAMPAIGN_COMPLETED] || 0;
  const avgEmailsPerCampaign = campaignEvents > 0 ? Math.round(emailCount / campaignEvents) : 0;
  
  // Success rates
  const sentEmails = stats.byEvent[EmailEvent.EMAIL_SENT] || 0;
  const failedEmails = stats.byEvent[EmailEvent.EMAIL_FAILED] || 0;
  const successRate = (sentEmails + failedEmails) > 0 ? (sentEmails / (sentEmails + failedEmails) * 100) : 0;
  
  return {
    overview: {
      totalEvents,
      errorRate: `${errorRate.toFixed(2)}%`,
      emailsPerHour,
      avgEmailsPerCampaign,
      successRate: `${successRate.toFixed(2)}%`
    },
    throughput: {
      emailsSent: sentEmails,
      emailsFailed: failedEmails,
      emailsOpened: stats.byEvent[EmailEvent.EMAIL_OPENED] || 0,
      emailsClicked: stats.byEvent[EmailEvent.EMAIL_CLICKED] || 0,
      rateLimits: stats.byEvent[EmailEvent.RATE_LIMITED] || 0
    },
    campaigns: {
      created: stats.byEvent[EmailEvent.CAMPAIGN_CREATED] || 0,
      started: stats.byEvent[EmailEvent.CAMPAIGN_STARTED] || 0,
      completed: stats.byEvent[EmailEvent.CAMPAIGN_COMPLETED] || 0,
      failed: stats.byEvent[EmailEvent.CAMPAIGN_FAILED] || 0,
      paused: stats.byEvent[EmailEvent.CAMPAIGN_PAUSED] || 0
    },
    retries: {
      scheduled: stats.byEvent[EmailEvent.RETRY_SCHEDULED] || 0,
      attempted: stats.byEvent[EmailEvent.RETRY_ATTEMPTED] || 0
    },
    timeRange: `Last ${hours} hours`,
    generatedAt: new Date().toISOString()
  };
}

// Helper function to export logs as CSV
async function exportLogsAsCSV(hours: number, campaignId?: string): Promise<string> {
  try {
    const logDir = path.join(process.cwd(), 'logs', 'email-marketing');
    const now = new Date();
    const since = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    const dateFormat = now.toISOString().split('T')[0];
    const logFile = path.join(logDir, `email-marketing-${dateFormat}.jsonl`);
    
    if (!fs.existsSync(logFile)) {
      return 'timestamp,level,event,message,campaign_id,contact_id,email,error\n';
    }

    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    const entries = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Filter by time range and campaign if specified
    const filteredEntries = entries.filter((entry: any) => {
      const matchesTime = new Date(entry.timestamp) >= since;
      const matchesCampaign = !campaignId || entry.campaignId === campaignId;
      return matchesTime && matchesCampaign;
    });

    // Convert to CSV
    const csvHeader = 'timestamp,level,event,message,campaign_id,contact_id,email,error\n';
    const csvRows = filteredEntries.map((entry: any) => {
      const escapeCsv = (str: string) => `"${str?.replace(/"/g, '""') || ''}"`;
      return [
        escapeCsv(entry.timestamp),
        escapeCsv(entry.levelName),
        escapeCsv(entry.event),
        escapeCsv(entry.message),
        escapeCsv(entry.campaignId || ''),
        escapeCsv(entry.contactId || ''),
        escapeCsv(entry.email || ''),
        escapeCsv(entry.error?.message || '')
      ].join(',');
    }).join('\n');

    return csvHeader + csvRows;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return 'Error exporting logs\n';
  }
}

// POST endpoint for manual actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'test_log': {
        const { level, event, message, campaignId } = body;
        
        // Create a test log entry
        switch (level) {
          case 'debug':
            emailMarketingLogger.debug(event, message, { campaignId });
            break;
          case 'info':
            emailMarketingLogger.info(event, message, { campaignId });
            break;
          case 'warn':
            emailMarketingLogger.warn(event, message, { campaignId });
            break;
          case 'error':
            emailMarketingLogger.error(event, message, { campaignId });
            break;
          case 'critical':
            emailMarketingLogger.critical(event, message, { campaignId });
            break;
        }

        return NextResponse.json({
          success: true,
          message: 'Test log entry created',
          data: { level, event, message, campaignId }
        });
      }

      case 'force_cleanup': {
        const result = await emailMarketingLogger.cleanOldLogs();
        return NextResponse.json({
          success: true,
          message: 'Force cleanup completed',
          data: result
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in logs POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}