/**
 * Email Marketing Logger - V2 Compatible Version
 * Lightweight logging system for email marketing operations
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface EmailEvent {
  id: string;
  type: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'unsubscribed' | 'failed';
  contactId?: string;
  campaignId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  location?: {
    country?: string;
    city?: string;
  };
}

// Export EmailEvent types as constants for runtime use
export const EmailEventTypes = {
  SENT: 'sent' as const,
  DELIVERED: 'delivered' as const,
  BOUNCED: 'bounced' as const,
  OPENED: 'opened' as const,
  CLICKED: 'clicked' as const,
  UNSUBSCRIBED: 'unsubscribed' as const,
  FAILED: 'failed' as const
};

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  events?: number;
}

class EmailMarketingLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 10000;

  log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      events: context?.events || 0
    };

    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === LogLevel.ERROR ? 'error' : 
                       level === LogLevel.WARN ? 'warn' : 'log';
      console[logMethod](`[EmailMarketing] ${message}`, context || '');
    }
  }

  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs.reverse(); // Most recent first
  }

  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const log of this.logs) {
      stats[log.level] = (stats[log.level] || 0) + 1;
    }

    return stats;
  }

  clear(): void {
    this.logs = [];
  }

  // Event tracking methods
  trackEvent(event: EmailEvent): void {
    this.info(`Email event: ${event.type}`, {
      contactId: event.contactId,
      campaignId: event.campaignId,
      metadata: event.metadata,
      location: event.location
    });
  }

  // Bulk operations logging
  logBulkOperation(operation: string, count: number, success: number, failed: number): void {
    this.info(`Bulk ${operation} completed`, {
      total: count,
      success,
      failed,
      successRate: Math.round((success / count) * 100)
    });
  }

  // Campaign logging
  logCampaignEvent(campaignId: string, event: string, details?: Record<string, any>): void {
    this.info(`Campaign ${event}`, {
      campaignId,
      ...details
    });
  }

  // Critical logging method
  critical(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, `CRITICAL: ${message}`, context);
  }

  // Email specific logging methods
  logEmailSuccess(campaignId: string, contactId: string, details?: Record<string, any>): void {
    this.info('Email sent successfully', {
      campaignId,
      contactId,
      ...details
    });
  }

  logEmailFailure(campaignId: string, contactId: string, error: string, details?: Record<string, any>): void {
    this.error('Email send failed', {
      campaignId,
      contactId,
      error,
      ...details
    });
  }

  logBatchProcessing(campaignId: string, batchSize: number, processed: number): void {
    this.info('Batch processing completed', {
      campaignId,
      batchSize,
      processed,
      successRate: Math.round((processed / batchSize) * 100)
    });
  }

  logRateLimited(provider: string, retryAfter: number): void {
    this.warn('Rate limit hit', {
      provider,
      retryAfter,
      timestamp: new Date().toISOString()
    });
  }

  logCampaignMetrics(campaignId: string, metrics: Record<string, any>): void {
    this.info('Campaign metrics updated', {
      campaignId,
      metrics
    });
  }

  // Statistics and analytics methods
  getLogStatistics(hours: number = 24): any {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp) >= cutoffTime
    );

    const stats = {
      totalEntries: recentLogs.length,
      errors: recentLogs.filter(log => log.level === LogLevel.ERROR),
      warnings: recentLogs.filter(log => log.level === LogLevel.WARN),
      criticalIssues: recentLogs.filter(log => log.message.includes('CRITICAL')),
      byLevel: {} as Record<string, number>,
      byEvent: {} as Record<string, number>,
      byCampaign: {} as Record<string, number>
    };

    // Count by level
    for (const log of recentLogs) {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    }

    // Count by campaign (extract from context)
    for (const log of recentLogs) {
      if (log.context?.campaignId) {
        stats.byCampaign[log.context.campaignId] = (stats.byCampaign[log.context.campaignId] || 0) + 1;
      }
    }

    // Count by event type (from message analysis)
    const eventPatterns = {
      'sent': /sent|sending/i,
      'delivered': /delivered/i,
      'opened': /opened/i,
      'clicked': /clicked/i,
      'bounced': /bounced|bounce/i,
      'unsubscribed': /unsubscribed/i,
      'failed': /failed|error/i
    };

    for (const log of recentLogs) {
      for (const [eventType, pattern] of Object.entries(eventPatterns)) {
        if (pattern.test(log.message)) {
          stats.byEvent[eventType] = (stats.byEvent[eventType] || 0) + 1;
          break;
        }
      }
    }

    return stats;
  }

  cleanOldLogs(olderThanDays: number = 30): { deleted: number; errors: string[] } {
    const cutoffTime = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));
    const initialCount = this.logs.length;
    
    try {
      this.logs = this.logs.filter(log => 
        new Date(log.timestamp) >= cutoffTime
      );

      const cleanedCount = initialCount - this.logs.length;
      
      if (cleanedCount > 0) {
        this.info(`Cleaned ${cleanedCount} old log entries`, {
          olderThanDays,
          remaining: this.logs.length
        });
      }

      return { deleted: cleanedCount, errors: [] };
    } catch (error) {
      return { deleted: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  // Additional specialized logging methods
  logHeartbeat(campaignId: string, context?: Record<string, any>): void {
    this.debug('Campaign heartbeat', {
      campaignId,
      ...context
    });
  }

  logCampaignStart(campaignId: string, context?: Record<string, any>): void {
    this.info('Campaign started', {
      campaignId,
      ...context
    });
  }

  logEmailError(campaignId: string, errorType: string, contactId: string, errorMessage: string, context?: Record<string, any>): void {
    this.error(`Email error: ${errorType}`, {
      campaignId,
      contactId,
      errorMessage,
      errorType,
      ...context
    });
  }
}

// Export singleton instance
export const emailMarketingLogger = new EmailMarketingLogger();

// Export default for backward compatibility
export default emailMarketingLogger;