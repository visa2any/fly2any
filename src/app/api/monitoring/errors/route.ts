import { NextRequest, NextResponse } from 'next/server';

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  retryCount: number;
  props?: any;
  state?: any;
  level?: 'error' | 'critical';
  category?: string;
  context?: Record<string, any>;
}

interface ErrorStorage {
  errors: ErrorReport[];
  lastCleanup: string;
}

/**
 * Error Monitoring API Endpoint
 * Handles error reports from the application with proper storage and alerting
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const errorReport: ErrorReport = await request.json();

    // Validate required fields
    if (!errorReport.errorId || !errorReport.message || !errorReport.timestamp) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: errorId, message, timestamp' },
        { status: 400 }
      );
    }

    // Enrich error report with server-side information
    const enrichedReport: ErrorReport = {
      ...errorReport,
      timestamp: errorReport.timestamp || new Date().toISOString(),
      level: errorReport.level || 'error',
      category: errorReport.category || 'CLIENT_ERROR'
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Report Received: ${enrichedReport.errorId}`);
      console.error('Message:', enrichedReport.message);
      console.error('URL:', enrichedReport.url);
      console.error('User Agent:', enrichedReport.userAgent);
      if (enrichedReport.stack) {
        console.error('Stack:', enrichedReport.stack);
      }
      if (enrichedReport.context) {
        console.error('Context:', enrichedReport.context);
      }
      console.groupEnd();
    }

    // Store error report
    await storeErrorReport(enrichedReport);

    // Send alerts for critical errors
    if (enrichedReport.level === 'critical' || enrichedReport.retryCount > 3) {
      await sendCriticalErrorAlert(enrichedReport);
    }

    // Track error metrics
    await updateErrorMetrics(enrichedReport);

    return NextResponse.json({
      success: true,
      errorId: enrichedReport.errorId,
      message: 'Error report received and processed'
    });

  } catch (error) {
    console.error('Error processing error report:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process error report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get error reports and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const errors = await getErrorReports({
      timeframe,
      level: level as 'error' | 'critical' | undefined,
      category: category || undefined,
      limit
    });

    const stats = await getErrorStats(timeframe);

    return NextResponse.json({
      success: true,
      data: {
        errors,
        stats,
        metadata: {
          timeframe,
          level,
          category,
          limit,
          total: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving error reports:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve error reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Store error report (in production, use proper database)
 */
async function storeErrorReport(errorReport: ErrorReport): Promise<void> {
  try {
    // In a production environment, store in your database
    // For now, we'll use a simple file-based storage as fallback
    
    const fs = await import('fs').catch(() => null);
    const path = await import('path').catch(() => null);
    
    if (fs && path) {
      const logsDir = path.join(process.cwd(), 'logs');
      const errorsFile = path.join(logsDir, 'errors.json');
      
      // Ensure logs directory exists
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      // Read existing errors
      let errorStorage: ErrorStorage = {
        errors: [],
        lastCleanup: new Date().toISOString()
      };
      
      if (fs.existsSync(errorsFile)) {
        try {
          const data = fs.readFileSync(errorsFile, 'utf8');
          errorStorage = JSON.parse(data);
        } catch (parseError) {
          console.warn('Failed to parse existing errors file:', parseError);
        }
      }
      
      // Add new error
      errorStorage.errors.push(errorReport);
      
      // Clean up old errors (keep last 1000)
      if (errorStorage.errors.length > 1000) {
        errorStorage.errors = errorStorage.errors.slice(-1000);
        errorStorage.lastCleanup = new Date().toISOString();
      }
      
      // Write back to file
      fs.writeFileSync(errorsFile, JSON.stringify(errorStorage, null, 2));
    }
    
    // Also log to console for immediate visibility
    console.error(`[ERROR-MONITOR] ${errorReport.level?.toUpperCase()}: ${errorReport.message}`, {
      errorId: errorReport.errorId,
      url: errorReport.url,
      timestamp: errorReport.timestamp,
      retryCount: errorReport.retryCount
    });
    
  } catch (error) {
    console.error('Failed to store error report:', error);
  }
}

/**
 * Send alerts for critical errors
 */
async function sendCriticalErrorAlert(errorReport: ErrorReport): Promise<void> {
  try {
    // Import email notification system
    const { notificationService } = await import('@/lib/email/notification-service');
    
    // Send alert to admin team
    await notificationService.sendNotification('critical_error_alert', [
      'admin@fly2any.com',
      'alerts@fly2any.com'
    ], {
      errorId: errorReport.errorId,
      message: errorReport.message,
      url: errorReport.url,
      timestamp: errorReport.timestamp,
      userAgent: errorReport.userAgent,
      retryCount: errorReport.retryCount,
      stack: errorReport.stack,
      context: errorReport.context
    }, {
      priority: 'critical',
      tags: ['alert', 'critical', 'error']
    });
    
    console.log(`🚨 Critical error alert sent for: ${errorReport.errorId}`);
    
  } catch (error) {
    console.error('Failed to send critical error alert:', error);
  }
}

/**
 * Update error metrics for monitoring
 */
async function updateErrorMetrics(errorReport: ErrorReport): Promise<void> {
  try {
    // In production, update your metrics/monitoring system
    // For now, we'll log metrics
    
    const metrics = {
      timestamp: new Date().toISOString(),
      errorId: errorReport.errorId,
      level: errorReport.level,
      category: errorReport.category,
      url: errorReport.url,
      userAgent: errorReport.userAgent,
      retryCount: errorReport.retryCount
    };
    
    console.log('[ERROR-METRICS]', JSON.stringify(metrics));
    
  } catch (error) {
    console.error('Failed to update error metrics:', error);
  }
}

/**
 * Get error reports with filtering
 */
async function getErrorReports(filters: {
  timeframe: string;
  level?: 'error' | 'critical';
  category?: string;
  limit: number;
}): Promise<ErrorReport[]> {
  try {
    const fs = await import('fs').catch(() => null);
    const path = await import('path').catch(() => null);
    
    if (!fs || !path) {
      return [];
    }
    
    const errorsFile = path.join(process.cwd(), 'logs', 'errors.json');
    
    if (!fs.existsSync(errorsFile)) {
      return [];
    }
    
    const data = fs.readFileSync(errorsFile, 'utf8');
    const errorStorage: ErrorStorage = JSON.parse(data);
    
    // Filter by timeframe
    const now = new Date();
    const timeframeMs = parseTimeframe(filters.timeframe);
    const cutoffTime = new Date(now.getTime() - timeframeMs);
    
    let filtered = errorStorage.errors.filter(error => 
      new Date(error.timestamp) >= cutoffTime
    );
    
    // Filter by level
    if (filters.level) {
      filtered = filtered.filter(error => error.level === filters.level);
    }
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(error => error.category === filters.category);
    }
    
    // Sort by timestamp (newest first) and limit
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, filters.limit);
    
  } catch (error) {
    console.error('Failed to get error reports:', error);
    return [];
  }
}

/**
 * Get error statistics
 */
async function getErrorStats(timeframe: string): Promise<{
  total: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  byHour: Record<string, number>;
  topErrors: Array<{ message: string; count: number }>;
}> {
  try {
    const errors = await getErrorReports({ timeframe, limit: 1000 });
    
    const stats = {
      total: errors.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byHour: {} as Record<string, number>,
      topErrors: [] as Array<{ message: string; count: number }>
    };
    
    // Count by level
    errors.forEach(error => {
      const level = error.level || 'error';
      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
    });
    
    // Count by category
    errors.forEach(error => {
      const category = error.category || 'UNKNOWN';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });
    
    // Count by hour
    errors.forEach(error => {
      const hour = new Date(error.timestamp).getHours().toString().padStart(2, '0');
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    });
    
    // Top error messages
    const messageCounts = errors.reduce((acc, error) => {
      acc[error.message] = (acc[error.message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    stats.topErrors = Object.entries(messageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));
    
    return stats;
    
  } catch (error) {
    console.error('Failed to get error stats:', error);
    return {
      total: 0,
      byLevel: {},
      byCategory: {},
      byHour: {},
      topErrors: []
    };
  }
}

/**
 * Parse timeframe string to milliseconds
 */
function parseTimeframe(timeframe: string): number {
  const timeframes: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };
  
  return timeframes[timeframe] || timeframes['24h'];
}