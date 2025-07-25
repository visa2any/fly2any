import fs from 'fs';
import path from 'path';

// Log levels enum
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  campaignId?: string;
  contactId?: string;
  email?: string;
  event: string;
  message: string;
  metadata?: Record<string, any>;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    memoryUsage: NodeJS.MemoryUsage;
    processingTime: number;
  };
}

// Email marketing events enum
export enum EmailEvent {
  CAMPAIGN_CREATED = 'campaign_created',
  CAMPAIGN_STARTED = 'campaign_started',
  CAMPAIGN_PAUSED = 'campaign_paused',
  CAMPAIGN_RESUMED = 'campaign_resumed',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  CAMPAIGN_FAILED = 'campaign_failed',
  BATCH_STARTED = 'batch_started',
  BATCH_COMPLETED = 'batch_completed',
  EMAIL_SENT = 'email_sent',
  EMAIL_FAILED = 'email_failed',
  EMAIL_BOUNCED = 'email_bounced',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  RATE_LIMITED = 'rate_limited',
  RETRY_SCHEDULED = 'retry_scheduled',
  RETRY_ATTEMPTED = 'retry_attempted',
  CONTACT_UNSUBSCRIBED = 'contact_unsubscribed',
  TEMPLATE_LOADED = 'template_loaded',
  CREDENTIALS_LOADED = 'credentials_loaded',
  HEARTBEAT = 'heartbeat',
  SYSTEM_ERROR = 'system_error'
}

// Logger configuration
export interface LoggerConfig {
  logDir: string;
  maxFileSize: number; // in MB
  maxFiles: number;
  enableConsole: boolean;
  enableFile: boolean;
  logLevel: LogLevel;
  rotationInterval: 'daily' | 'weekly' | 'monthly';
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  logDir: path.join(process.cwd(), 'logs', 'email-marketing'),
  maxFileSize: 50, // 50MB
  maxFiles: 30,
  enableConsole: true,
  enableFile: true,
  logLevel: LogLevel.INFO,
  rotationInterval: 'daily'
};

export class EmailMarketingLogger {
  private config: LoggerConfig;
  private currentLogFile: string = '';
  private fileHandle: fs.WriteStream | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureLogDirectory();
    this.initializeLogFile();
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    try {
      if (!fs.existsSync(this.config.logDir)) {
        fs.mkdirSync(this.config.logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  /**
   * Initialize log file with rotation
   */
  private initializeLogFile(): void {
    const now = new Date();
    let dateFormat: string;
    
    switch (this.config.rotationInterval) {
      case 'daily':
        dateFormat = now.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'weekly':
        const weekNum = this.getWeekNumber(now);
        dateFormat = `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
        break;
      case 'monthly':
        dateFormat = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      default:
        dateFormat = now.toISOString().split('T')[0];
    }

    this.currentLogFile = path.join(
      this.config.logDir,
      `email-marketing-${dateFormat}.jsonl`
    );

    if (this.config.enableFile) {
      try {
        this.fileHandle = fs.createWriteStream(this.currentLogFile, { flags: 'a' });
        this.fileHandle.on('error', (error) => {
          console.error('Log file write error:', error);
        });
      } catch (error) {
        console.error('Failed to create log file:', error);
      }
    }
  }

  /**
   * Get week number for weekly rotation
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    event: EmailEvent,
    message: string,
    options: {
      campaignId?: string;
      contactId?: string;
      email?: string;
      metadata?: Record<string, any>;
      error?: Error;
      duration?: number;
    } = {}
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      event,
      message,
      ...options
    };

    // Add error details if provided
    if (options.error) {
      entry.error = {
        name: options.error.name,
        message: options.error.message,
        stack: options.error.stack
      };
    }

    // Add performance metrics for important events
    if ([
      EmailEvent.CAMPAIGN_STARTED,
      EmailEvent.CAMPAIGN_COMPLETED,
      EmailEvent.BATCH_COMPLETED,
      EmailEvent.EMAIL_SENT
    ].includes(event)) {
      entry.performance = {
        memoryUsage: process.memoryUsage(),
        processingTime: options.duration || 0
      };
    }

    return entry;
  }

  /**
   * Write log entry
   */
  private writeLog(entry: LogEntry): void {
    if (entry.level < this.config.logLevel) {
      return; // Skip logs below configured level
    }

    const logLine = JSON.stringify(entry);

    // Console output
    if (this.config.enableConsole) {
      const colorMap = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.CRITICAL]: '\x1b[35m' // Magenta
      };
      
      const color = colorMap[entry.level] || '\x1b[0m';
      const reset = '\x1b[0m';
      
      console.log(
        `${color}[${entry.timestamp}] ${entry.levelName} - ${entry.event}${reset}: ${entry.message}`,
        entry.metadata ? entry.metadata : ''
      );
    }

    // File output
    if (this.config.enableFile && this.fileHandle) {
      try {
        this.fileHandle.write(logLine + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  /**
   * Debug level logging
   */
  debug(event: EmailEvent, message: string, options: {
    campaignId?: string;
    contactId?: string;
    email?: string;
    metadata?: Record<string, any>;
  } = {}): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, event, message, options);
    this.writeLog(entry);
  }

  /**
   * Info level logging
   */
  info(event: EmailEvent, message: string, options: {
    campaignId?: string;
    contactId?: string;
    email?: string;
    metadata?: Record<string, any>;
    duration?: number;
  } = {}): void {
    const entry = this.createLogEntry(LogLevel.INFO, event, message, options);
    this.writeLog(entry);
  }

  /**
   * Warning level logging
   */
  warn(event: EmailEvent, message: string, options: {
    campaignId?: string;
    contactId?: string;
    email?: string;
    metadata?: Record<string, any>;
    error?: Error;
  } = {}): void {
    const entry = this.createLogEntry(LogLevel.WARN, event, message, options);
    this.writeLog(entry);
  }

  /**
   * Error level logging
   */
  error(event: EmailEvent, message: string, options: {
    campaignId?: string;
    contactId?: string;
    email?: string;
    metadata?: Record<string, any>;
    error?: Error;
  } = {}): void {
    const entry = this.createLogEntry(LogLevel.ERROR, event, message, options);
    this.writeLog(entry);
  }

  /**
   * Critical level logging
   */
  critical(event: EmailEvent, message: string, options: {
    campaignId?: string;
    contactId?: string;
    email?: string;
    metadata?: Record<string, any>;
    error?: Error;
  } = {}): void {
    const entry = this.createLogEntry(LogLevel.CRITICAL, event, message, options);
    this.writeLog(entry);
  }

  /**
   * Log campaign metrics
   */
  logCampaignMetrics(campaignId: string, metrics: {
    totalEmails: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    duration: number;
    averageResponseTime?: number;
  }): void {
    this.info(EmailEvent.CAMPAIGN_COMPLETED, 'Campaign metrics recorded', {
      campaignId,
      metadata: {
        ...metrics,
        timestamp: new Date().toISOString()
      },
      duration: metrics.duration
    });
  }

  /**
   * Log batch processing
   */
  logBatchProcessing(campaignId: string, batchIndex: number, batchSize: number, results: {
    successes: number;
    failures: number;
    processingTime: number;
  }): void {
    this.info(EmailEvent.BATCH_COMPLETED, `Batch ${batchIndex} processing completed`, {
      campaignId,
      metadata: {
        batchIndex,
        batchSize,
        ...results,
        successRate: ((results.successes / batchSize) * 100).toFixed(1) + '%'
      },
      duration: results.processingTime
    });
  }

  /**
   * Log email success
   */
  logEmailSuccess(campaignId: string, contactId: string, email: string, options: {
    messageId?: string;
    processingTime?: number;
    retryCount?: number;
  } = {}): void {
    this.info(EmailEvent.EMAIL_SENT, 'Email sent successfully', {
      campaignId,
      contactId,
      email,
      metadata: {
        messageId: options.messageId,
        retryCount: options.retryCount || 0,
        timestamp: new Date().toISOString()
      },
      duration: options.processingTime
    });
  }

  /**
   * Log campaign start
   */
  logCampaignStart(campaignId: string, metadata: Record<string, any> = {}): void {
    this.info(EmailEvent.CAMPAIGN_STARTED, `Campaign ${campaignId} started`, { campaignId, metadata });
  }

  /**
   * Log email error
   */
  logEmailError(campaignId: string, event: string, email: string, message: string): void {
    this.error(EmailEvent.EMAIL_FAILED, `Error in ${event}: ${message}`, { campaignId, email });
  }

  /**
   * Log campaign analysis
   */
  logCampaignAnalysis(campaignId: string, data: Record<string, any>): void {
    this.info(EmailEvent.CAMPAIGN_COMPLETED, `Analysis generated for campaign ${campaignId}`, { campaignId, metadata: data });
  }

  /**
   * Log email failure
   */
  logEmailFailure(campaignId: string, contactId: string, email: string, error: Error, options: {
    retryCount?: number;
    willRetry?: boolean;
    nextRetryAt?: Date;
  } = {}): void {
    this.error(EmailEvent.EMAIL_FAILED, 'Email sending failed', {
      campaignId,
      contactId,
      email,
      error,
      metadata: {
        retryCount: options.retryCount || 0,
        willRetry: options.willRetry || false,
        nextRetryAt: options.nextRetryAt?.toISOString(),
        errorType: error.name,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log rate limiting
   */
  logRateLimited(campaignId: string, delay: number, reason: string): void {
    this.warn(EmailEvent.RATE_LIMITED, 'Rate limit encountered', {
      campaignId,
      metadata: {
        delay,
        reason,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log retry attempt
   */
  logRetryAttempt(campaignId: string, contactId: string, email: string, retryCount: number, originalError: string): void {
    this.info(EmailEvent.RETRY_ATTEMPTED, 'Retry attempt initiated', {
      campaignId,
      contactId,
      email,
      metadata: {
        retryCount,
        originalError,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log heartbeat
   */
  logHeartbeat(campaignId: string, status: string, metrics?: Record<string, any>): void {
    this.debug(EmailEvent.HEARTBEAT, 'Campaign heartbeat', {
      campaignId,
      metadata: {
        status,
        ...metrics,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get log statistics
   */
  async getLogStatistics(hours: number = 24): Promise<{
    totalEntries: number;
    byLevel: Record<string, number>;
    byEvent: Record<string, number>;
    byCampaign: Record<string, number>;
    errors: LogEntry[];
    criticalIssues: LogEntry[];
  }> {
    try {
      const now = new Date();
      const since = new Date(now.getTime() - (hours * 60 * 60 * 1000));
      
      const logFile = this.currentLogFile;
      if (!fs.existsSync(logFile)) {
        return {
          totalEntries: 0,
          byLevel: {},
          byEvent: {},
          byCampaign: {},
          errors: [],
          criticalIssues: []
        };
      }

      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      const entries: LogEntry[] = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);

      // Filter by time range
      const recentEntries = entries.filter(entry => 
        new Date(entry.timestamp) >= since
      );

      const stats = {
        totalEntries: recentEntries.length,
        byLevel: {} as Record<string, number>,
        byEvent: {} as Record<string, number>,
        byCampaign: {} as Record<string, number>,
        errors: recentEntries.filter(entry => entry.level >= LogLevel.ERROR),
        criticalIssues: recentEntries.filter(entry => entry.level === LogLevel.CRITICAL)
      };

      // Aggregate statistics
      recentEntries.forEach(entry => {
        // By level
        const levelName = entry.levelName;
        stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;

        // By event
        stats.byEvent[entry.event] = (stats.byEvent[entry.event] || 0) + 1;

        // By campaign
        if (entry.campaignId) {
          stats.byCampaign[entry.campaignId] = (stats.byCampaign[entry.campaignId] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting log statistics:', error);
      return {
        totalEntries: 0,
        byLevel: {},
        byEvent: {},
        byCampaign: {},
        errors: [],
        criticalIssues: []
      };
    }
  }

  /**
   * Clean old log files
   */
  async cleanOldLogs(): Promise<{ deleted: number; errors: string[] }> {
    const result = { deleted: 0, errors: [] as string[] };

    try {
      const files = fs.readdirSync(this.config.logDir);
      const logFiles = files.filter(file => file.startsWith('email-marketing-') && file.endsWith('.jsonl'));
      
      // Sort by creation time
      const fileStats = logFiles.map(file => ({
        name: file,
        path: path.join(this.config.logDir, file),
        stats: fs.statSync(path.join(this.config.logDir, file))
      })).sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Keep only the configured number of files
      const filesToDelete = fileStats.slice(this.config.maxFiles);

      for (const file of filesToDelete) {
        try {
          fs.unlinkSync(file.path);
          result.deleted++;
        } catch (error) {
          result.errors.push(`Failed to delete ${file.name}: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Failed to clean logs: ${error}`);
    }

    return result;
  }

  /**
   * Close logger and cleanup resources
   */
  close(): void {
    if (this.fileHandle) {
      this.fileHandle.end();
      this.fileHandle = null;
    }
  }
}

// Singleton instance
export const emailMarketingLogger = new EmailMarketingLogger({
  logLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
});

// Graceful shutdown
process.on('SIGINT', () => {
  emailMarketingLogger.close();
});

process.on('SIGTERM', () => {
  emailMarketingLogger.close();
});