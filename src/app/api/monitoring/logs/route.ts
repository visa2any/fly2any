import { NextRequest, NextResponse } from 'next/server';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  message: string;
  category: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration?: number;
    memory?: number;
    timing?: Record<string, number>;
  };
  user?: {
    id?: string;
    sessionId?: string;
    userAgent?: string;
  };
  metadata?: {
    source: 'client' | 'server';
    environment: string;
    version: string;
    component?: string;
    traceId?: string;
  };
}

interface LogBatch {
  entries: LogEntry[];
}

interface LogStorage {
  logs: LogEntry[];
  lastCleanup: string;
}

/**
 * Application Logging API Endpoint
 * Handles structured log entries from client and server with proper storage and analysis
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

    const batch: LogBatch = await request.json();

    // Validate batch structure
    if (!batch.entries || !Array.isArray(batch.entries)) {
      return NextResponse.json(
        { success: false, error: 'Invalid batch format: entries array is required' },
        { status: 400 }
      );
    }

    // Process each log entry
    const processedEntries: LogEntry[] = [];
    const errors: string[] = [];

    for (const entry of batch.entries) {
      try {
        // Validate required fields
        if (!entry.id || !entry.timestamp || !entry.level || !entry.message) {
          errors.push(`Invalid entry ${entry.id || 'unknown'}: missing required fields`);
          continue;
        }

        // Enrich with server-side metadata
        const enrichedEntry: LogEntry = {
          ...entry,
          timestamp: entry.timestamp || new Date().toISOString(),
          metadata: {
            ...entry.metadata,
            source: entry.metadata?.source || 'client',
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0'
          }
        };

        processedEntries.push(enrichedEntry);

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          logToConsole(enrichedEntry);
        }

      } catch (entryError) {
        errors.push(`Failed to process entry ${entry.id}: ${entryError}`);
      }
    }

    // Store valid entries
    if (processedEntries.length > 0) {
      await storeLogEntries(processedEntries);
      await updateLogMetrics(processedEntries);
    }

    // Check for critical logs that need immediate attention
    const criticalLogs = processedEntries.filter((entry: any) => 
      entry.level === 'critical' || 
      (entry.level === 'error' && entry.category === 'EMAIL') ||
      (entry.level === 'error' && entry.category === 'API' && entry.context?.status >= 500)
    );

    if (criticalLogs.length > 0) {
      await handleCriticalLogs(criticalLogs);
    }

    return NextResponse.json({
      success: true,
      processed: processedEntries.length,
      errors: errors.length,
      details: errors.length > 0 ? errors : undefined,
      message: `Processed ${processedEntries.length} log entries`
    });

  } catch (error) {
    console.error('Error processing log batch:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process log batch',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get log entries with filtering and aggregation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as LogEntry['level'] | null;
    const category = searchParams.get('category');
    const timeframe = searchParams.get('timeframe') || '24h';
    const limit = parseInt(searchParams.get('limit') || '100');
    const aggregation = searchParams.get('aggregation'); // 'stats' or 'timeline'
    const traceId = searchParams.get('traceId');

    const filters = {
      level,
      category,
      timeframe,
      limit,
      traceId
    };

    if (aggregation === 'stats') {
      const stats = await getLogStats(filters);
      return NextResponse.json({
        success: true,
        data: stats,
        type: 'stats'
      });
    }

    if (aggregation === 'timeline') {
      const timeline = await getLogTimeline(filters);
      return NextResponse.json({
        success: true,
        data: timeline,
        type: 'timeline'
      });
    }

    // Regular log retrieval
    const logs = await getLogEntries(filters);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        metadata: {
          ...filters,
          total: logs.length,
          timeframe
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving logs:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Log to console with proper formatting
 */
function logToConsole(entry: LogEntry) {
  const consoleMethods = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    critical: console.error
  };

  const method = consoleMethods[entry.level];
  const timestamp = new Date(entry.timestamp).toLocaleTimeString();
  const prefix = `[${timestamp}] ${entry.level.toUpperCase()} [${entry.category}]`;
  
  if (entry.error) {
    method(`${prefix} ${entry.message}`, entry.context || {}, entry.error);
  } else if (entry.performance) {
    method(`${prefix} ${entry.message}`, { ...entry.context, performance: entry.performance });
  } else {
    method(`${prefix} ${entry.message}`, entry.context || {});
  }
}

/**
 * Store log entries (in production, use proper database/logging service)
 */
async function storeLogEntries(entries: LogEntry[]): Promise<void> {
  try {
    let fs: any = null;
    let path: any = null;
    try {
      fs = await import('fs');
      path = await import('path');
    } catch (error) {
      // Dynamic imports failed, fs and path remain null
    }
    
    if (fs && path) {
      const logsDir = path.join(process.cwd(), 'logs');
      const logsFile = path.join(logsDir, 'application.json');
      
      // Ensure logs directory exists
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      // Read existing logs
      let logStorage: LogStorage = {
        logs: [],
        lastCleanup: new Date().toISOString()
      };
      
      if (fs.existsSync(logsFile)) {
        try {
          const data = fs.readFileSync(logsFile, 'utf8');
          logStorage = JSON.parse(data);
        } catch (parseError) {
          console.warn('Failed to parse existing logs file:', parseError);
        }
      }
      
      // Add new entries
      logStorage.logs.push(...entries);
      
      // Clean up old logs (keep last 5000)
      if (logStorage.logs.length > 5000) {
        logStorage.logs = logStorage.logs.slice(-5000);
        logStorage.lastCleanup = new Date().toISOString();
      }
      
      // Write back to file
      fs.writeFileSync(logsFile, JSON.stringify(logStorage, null, 2));
    }
    
  } catch (error) {
    console.error('Failed to store log entries:', error);
  }
}

/**
 * Update metrics based on log entries
 */
async function updateLogMetrics(entries: LogEntry[]): Promise<void> {
  try {
    // Count entries by level
    const levelCounts = entries.reduce((acc, entry) => {
      acc[entry.level] = (acc[entry.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count entries by category
    const categoryCounts = entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Extract performance metrics
    const performanceMetrics = entries
      .filter((entry: any) => entry.performance?.duration)
      .map((entry: any) => ({
        category: entry.category,
        duration: entry.performance!.duration!,
        timestamp: entry.timestamp
      }));

    // Log metrics summary
    console.log('[LOG-METRICS]', {
      timestamp: new Date().toISOString(),
      totalEntries: entries.length,
      levelCounts,
      categoryCounts,
      performanceCount: performanceMetrics.length,
      avgDuration: performanceMetrics.length > 0 
        ? performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / performanceMetrics.length
        : 0
    });
    
  } catch (error) {
    console.error('Failed to update log metrics:', error);
  }
}

/**
 * Handle critical logs that need immediate attention
 */
async function handleCriticalLogs(criticalLogs: LogEntry[]): Promise<void> {
  try {
    for (const log of criticalLogs) {
      console.error(`🚨 CRITICAL LOG: [${log.category}] ${log.message}`, {
        id: log.id,
        timestamp: log.timestamp,
        context: log.context,
        error: log.error,
        traceId: log.metadata?.traceId
      });

      // Send alert for critical errors
      if (log.level === 'critical') {
        await sendCriticalLogAlert(log);
      }
    }
    
  } catch (error) {
    console.error('Failed to handle critical logs:', error);
  }
}

/**
 * Send alert for critical log entries
 */
async function sendCriticalLogAlert(log: LogEntry): Promise<void> {
  try {
    // Import email notification system
    const { notificationService } = await import('@/lib/email/notification-service');
    
    await notificationService.sendNotification('critical_log_alert', [
      'admin@fly2any.com',
      'alerts@fly2any.com'
    ], {
      logId: log.id,
      message: log.message,
      category: log.category,
      timestamp: log.timestamp,
      context: log.context,
      error: log.error,
      traceId: log.metadata?.traceId
    }, {
      priority: 'critical',
      tags: ['alert', 'critical', 'log']
    });
    
  } catch (error) {
    console.error('Failed to send critical log alert:', error);
  }
}

/**
 * Get log entries with filtering
 */
async function getLogEntries(filters: {
  level?: LogEntry['level'] | null;
  category?: string | null;
  timeframe: string;
  limit: number;
  traceId?: string | null;
}): Promise<LogEntry[]> {
  try {
    let fs: any = null;
    let path: any = null;
    try {
      fs = await import('fs');
      path = await import('path');
    } catch (error) {
      // Dynamic imports failed, fs and path remain null
    }
    
    if (!fs || !path) {
      return [];
    }
    
    const logsFile = path.join(process.cwd(), 'logs', 'application.json');
    
    if (!fs.existsSync(logsFile)) {
      return [];
    }
    
    const data = fs.readFileSync(logsFile, 'utf8');
    const logStorage: LogStorage = JSON.parse(data);
    
    // Filter by timeframe
    const now = new Date();
    const timeframeMs = parseTimeframe(filters.timeframe);
    const cutoffTime = new Date(now.getTime() - timeframeMs);
    
    let filtered = logStorage.logs.filter(log => 
      new Date(log.timestamp) >= cutoffTime
    );
    
    // Filter by level
    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    // Filter by trace ID
    if (filters.traceId) {
      filtered = filtered.filter(log => log.metadata?.traceId === filters.traceId);
    }
    
    // Sort by timestamp (newest first) and limit
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, filters.limit);
    
  } catch (error) {
    console.error('Failed to get log entries:', error);
    return [];
  }
}

/**
 * Get log statistics
 */
async function getLogStats(filters: any): Promise<{
  total: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  byHour: Record<string, number>;
  performanceStats: {
    avgDuration: number;
    slowQueries: number;
    errorRate: number;
  };
}> {
  try {
    const logs = await getLogEntries({ ...filters, limit: 10000 });
    
    const stats = {
      total: logs.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byHour: {} as Record<string, number>,
      performanceStats: {
        avgDuration: 0,
        slowQueries: 0,
        errorRate: 0
      }
    };
    
    // Count by level
    logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });
    
    // Count by category
    logs.forEach(log => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });
    
    // Count by hour
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours().toString().padStart(2, '0');
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    });
    
    // Performance statistics
    const performanceLogs = logs.filter(log => log.performance?.duration);
    if (performanceLogs.length > 0) {
      const durations = performanceLogs.map(log => log.performance!.duration!);
      stats.performanceStats.avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      stats.performanceStats.slowQueries = durations.filter(d => d > 1000).length;
    }
    
    // Error rate
    const errorLogs = logs.filter(log => log.level === 'error' || log.level === 'critical');
    stats.performanceStats.errorRate = logs.length > 0 ? (errorLogs.length / logs.length) * 100 : 0;
    
    return stats;
    
  } catch (error) {
    console.error('Failed to get log stats:', error);
    return {
      total: 0,
      byLevel: {},
      byCategory: {},
      byHour: {},
      performanceStats: {
        avgDuration: 0,
        slowQueries: 0,
        errorRate: 0
      }
    };
  }
}

/**
 * Get log timeline for visualization
 */
async function getLogTimeline(filters: any): Promise<Array<{
  timestamp: string;
  count: number;
  errorCount: number;
  warnCount: number;
}>> {
  try {
    const logs = await getLogEntries({ ...filters, limit: 10000 });
    
    // Group by hour
    const hourlyData = logs.reduce((acc, log) => {
      const hour = new Date(log.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      
      if (!acc[hour]) {
        acc[hour] = { count: 0, errorCount: 0, warnCount: 0 };
      }
      
      acc[hour].count++;
      if (log.level === 'error' || log.level === 'critical') {
        acc[hour].errorCount++;
      }
      if (log.level === 'warn') {
        acc[hour].warnCount++;
      }
      
      return acc;
    }, {} as Record<string, { count: number; errorCount: number; warnCount: number }>);
    
    // Convert to array and sort
    return Object.entries(hourlyData)
      .map(([timestamp, data]) => ({ timestamp, ...data }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
  } catch (error) {
    console.error('Failed to get log timeline:', error);
    return [];
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