// Production-grade logging system for Email Marketing
import { EmailMarketingDatabase } from '../email-marketing-database';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stack?: string;
  performance?: {
    duration: number;
    memory: number;
    cpu?: number;
  };
}

export interface MetricData {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

class ProductionLogger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logBuffer: LogEntry[] = [];
  private metricsBuffer: MetricData[] = [];
  private maxBufferSize = 1000;
  private flushInterval = 30000; // 30 seconds
  private performanceMarks = new Map<string, number>();

  constructor() {
    // Set log level from environment
    const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();
    switch (envLogLevel) {
      case 'debug': this.logLevel = LogLevel.DEBUG; break;
      case 'info': this.logLevel = LogLevel.INFO; break;
      case 'warn': this.logLevel = LogLevel.WARN; break;
      case 'error': this.logLevel = LogLevel.ERROR; break;
      case 'critical': this.logLevel = LogLevel.CRITICAL; break;
    }

    // Start periodic flush
    if (typeof window === 'undefined') {
      setInterval(() => this.flush(), this.flushInterval);
    }

    // Handle process shutdown
    if (typeof process !== 'undefined') {
      process.on('SIGINT', () => this.flush());
      process.on('SIGTERM', () => this.flush());
      process.on('beforeExit', () => this.flush());
    }
  }

  // Core logging methods
  debug(category: string, message: string, data?: any, context?: Partial<LogEntry>): void {
    this.log(LogLevel.DEBUG, category, message, data, context);
  }

  info(category: string, message: string, data?: any, context?: Partial<LogEntry>): void {
    this.log(LogLevel.INFO, category, message, data, context);
  }

  warn(category: string, message: string, data?: any, context?: Partial<LogEntry>): void {
    this.log(LogLevel.WARN, category, message, data, context);
  }

  error(category: string, message: string, error?: Error | any, context?: Partial<LogEntry>): void {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error;

    this.log(LogLevel.ERROR, category, message, errorData, {
      ...context,
      stack: error instanceof Error ? error.stack : undefined
    });
  }

  critical(category: string, message: string, error?: Error | any, context?: Partial<LogEntry>): void {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error;

    this.log(LogLevel.CRITICAL, category, message, errorData, {
      ...context,
      stack: error instanceof Error ? error.stack : undefined
    });

    // For critical errors, flush immediately
    this.flush();
  }

  // Performance monitoring
  startPerformanceTimer(operation: string): void {
    this.performanceMarks.set(operation, performance.now());
  }

  endPerformanceTimer(operation: string, category: string = 'performance'): number {
    const startTime = this.performanceMarks.get(operation);
    if (!startTime) {
      this.warn('performance', `Performance timer '${operation}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.performanceMarks.delete(operation);

    // Log performance metric
    this.metric('operation_duration', duration, 'ms', {
      operation,
      category
    });

    // Log slow operations
    if (duration > 1000) {
      this.warn('performance', `Slow operation detected: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`
      });
    }

    return duration;
  }

  // Metrics recording
  metric(name: string, value: number, unit: string = 'count', tags?: Record<string, string>): void {
    const metric: MetricData = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags
    };

    this.metricsBuffer.push(metric);

    // Flush metrics if buffer is full
    if (this.metricsBuffer.length >= this.maxBufferSize) {
      this.flushMetrics();
    }
  }

  // Email Marketing specific logging methods
  emailSent(campaignId: string, contactEmail: string, messageId: string, duration: number): void {
    this.info('email', 'Email sent successfully', {
      campaignId,
      contactEmail: this.maskEmail(contactEmail),
      messageId,
      duration
    });

    this.metric('emails_sent', 1, 'count', {
      campaign: campaignId,
      result: 'success'
    });
  }

  emailFailed(campaignId: string, contactEmail: string, error: string, errorCode?: string): void {
    this.error('email', 'Email send failed', {
      campaignId,
      contactEmail: this.maskEmail(contactEmail),
      error,
      errorCode
    });

    this.metric('emails_sent', 1, 'count', {
      campaign: campaignId,
      result: 'failed',
      error_code: errorCode || 'unknown'
    });
  }

  campaignStarted(campaignId: string, recipientCount: number, campaignType: string): void {
    this.info('campaign', 'Campaign started', {
      campaignId,
      recipientCount,
      campaignType
    });

    this.metric('campaigns_started', 1, 'count', {
      type: campaignType
    });

    this.metric('campaign_recipients', recipientCount, 'count', {
      campaign: campaignId
    });
  }

  campaignCompleted(campaignId: string, sent: number, failed: number, duration: number): void {
    const total = sent + failed;
    const successRate = total > 0 ? (sent / total) * 100 : 0;

    this.info('campaign', 'Campaign completed', {
      campaignId,
      sent,
      failed,
      total,
      successRate: `${successRate.toFixed(2)}%`,
      duration: `${(duration / 1000).toFixed(2)}s`
    });

    this.metric('campaign_completion_rate', successRate, 'percent', {
      campaign: campaignId
    });

    this.metric('campaign_duration', duration, 'ms', {
      campaign: campaignId
    });
  }

  apiRequest(method: string, endpoint: string, statusCode: number, duration: number, userId?: string): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(level, 'api', `${method} ${endpoint} - ${statusCode}`, {
      method,
      endpoint,
      statusCode,
      duration,
      userId
    });

    this.metric('api_requests', 1, 'count', {
      method,
      endpoint: this.normalizeEndpoint(endpoint),
      status_code: statusCode.toString(),
      status_class: this.getStatusClass(statusCode)
    });

    this.metric('api_duration', duration, 'ms', {
      endpoint: this.normalizeEndpoint(endpoint)
    });
  }

  databaseQuery(operation: string, table: string, duration: number, success: boolean): void {
    this.debug('database', `${operation} on ${table}`, {
      operation,
      table,
      duration,
      success
    });

    this.metric('db_queries', 1, 'count', {
      operation,
      table,
      result: success ? 'success' : 'failed'
    });

    this.metric('db_query_duration', duration, 'ms', {
      operation,
      table
    });
  }

  mailgunEvent(eventType: string, campaignId?: string, success: boolean = true): void {
    this.info('mailgun', `MailGun event: ${eventType}`, {
      eventType,
      campaignId,
      success
    });

    this.metric('mailgun_events', 1, 'count', {
      event_type: eventType,
      campaign: campaignId || 'unknown',
      result: success ? 'success' : 'failed'
    });
  }

  // Security and audit logging
  securityEvent(eventType: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any): void {
    const level = severity === 'critical' ? LogLevel.CRITICAL : 
                 severity === 'high' ? LogLevel.ERROR :
                 severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, 'security', `Security event: ${eventType}`, {
      eventType,
      severity,
      ...details
    });

    this.metric('security_events', 1, 'count', {
      event_type: eventType,
      severity
    });
  }

  auditTrail(action: string, resource: string, userId: string, details?: any): void {
    this.info('audit', `User action: ${action} on ${resource}`, {
      action,
      resource,
      userId,
      timestamp: new Date().toISOString(),
      ...details
    });

    this.metric('user_actions', 1, 'count', {
      action,
      resource,
      user: userId
    });
  }

  // System health monitoring
  systemHealth(component: string, status: 'healthy' | 'degraded' | 'unhealthy', metrics?: any): void {
    const level = status === 'unhealthy' ? LogLevel.ERROR :
                 status === 'degraded' ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, 'health', `System health: ${component} is ${status}`, {
      component,
      status,
      metrics
    });

    this.metric('system_health', status === 'healthy' ? 1 : 0, 'bool', {
      component
    });
  }

  // Business metrics
  businessMetric(name: string, value: number, unit: string, context?: Record<string, string>): void {
    this.info('business', `Business metric: ${name} = ${value} ${unit}`, {
      metric: name,
      value,
      unit,
      context
    });

    this.metric(`business_${name}`, value, unit, context);
  }

  // Core logging implementation
  private log(level: LogLevel, category: string, message: string, data?: any, context?: Partial<LogEntry>): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      ...context
    };

    // Add performance data if available
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      entry.performance = {
        duration: 0,
        memory: memUsage.heapUsed
      };
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(entry);
    }

    // Add to buffer
    this.logBuffer.push(entry);

    // Flush if buffer is full or critical error
    if (this.logBuffer.length >= this.maxBufferSize || level === LogLevel.CRITICAL) {
      this.flush();
    }
  }

  private consoleLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const message = `[${timestamp}] ${level} ${entry.category}: ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.data, entry.stack);
        break;
    }
  }

  // Flush logs to persistent storage
  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // In production, this would send to logging service like CloudWatch, Datadog, etc.
      // For now, we'll store in database
      await this.persistLogs(logsToFlush);
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Put logs back in buffer for retry
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      // In production, this would send to metrics service like CloudWatch, Prometheus, etc.
      await this.persistMetrics(metricsToFlush);
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Put metrics back in buffer for retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  private async persistLogs(logs: LogEntry[]): Promise<void> {
    // Store logs in database or send to external service
    if (typeof window === 'undefined') {
      // Server-side: could store in database
      console.log(`Persisting ${logs.length} log entries...`);
      
      // Example: Store critical errors in database
      const criticalLogs = logs.filter(log => log.level === LogLevel.CRITICAL);
      for (const log of criticalLogs) {
        try {
          // Store in email_events table with 'sent' as event_type (system logging)
          await EmailMarketingDatabase.recordEmailEvent({
            contact_id: 'system',
            event_type: 'sent', // Using 'sent' for system logging
            event_data: {
              level: LogLevel[log.level],
              category: log.category,
              message: log.message,
              data: log.data,
              stack: log.stack,
              timestamp: log.timestamp.toISOString()
            }
          });
        } catch (dbError) {
          console.error('Failed to store critical log in database:', dbError);
        }
      }
    }
  }

  private async persistMetrics(metrics: MetricData[]): Promise<void> {
    // Store metrics in time-series database or send to external service
    console.log(`Persisting ${metrics.length} metrics...`);
    
    // In production, this would send to services like:
    // - AWS CloudWatch
    // - Prometheus
    // - Datadog
    // - New Relic
  }

  // Utility methods
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local.substring(0, 2)}***@${domain}`;
  }

  private normalizeEndpoint(endpoint: string): string {
    // Replace IDs with placeholders for better grouping
    return endpoint
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
      .replace(/\/[a-zA-Z0-9]{20,}/g, '/:token');
  }

  private getStatusClass(statusCode: number): string {
    if (statusCode < 200) return '1xx';
    if (statusCode < 300) return '2xx';
    if (statusCode < 400) return '3xx';
    if (statusCode < 500) return '4xx';
    return '5xx';
  }

  // Public utility methods
  getCurrentLogLevel(): LogLevel {
    return this.logLevel;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getBufferSize(): number {
    return this.logBuffer.length;
  }

  getMetricsBufferSize(): number {
    return this.metricsBuffer.length;
  }

  // Error boundary integration
  logReactError(error: Error, errorInfo: any, componentStack: string): void {
    this.error('react', 'React component error', error, {
      data: {
        componentStack,
        errorInfo,
        errorBoundary: true
      }
    });
  }

  // Express middleware integration
  getExpressMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.apiRequest(
          req.method,
          req.originalUrl || req.url,
          res.statusCode,
          duration,
          req.user?.id
        );
      });
      
      next();
    };
  }
}

// Create singleton instance
export const logger = new ProductionLogger();

// Export convenience functions
export const log = {
  debug: (category: string, message: string, data?: any) => logger.debug(category, message, data),
  info: (category: string, message: string, data?: any) => logger.info(category, message, data),
  warn: (category: string, message: string, data?: any) => logger.warn(category, message, data),
  error: (category: string, message: string, error?: any) => logger.error(category, message, error),
  critical: (category: string, message: string, error?: any) => logger.critical(category, message, error),
  
  // Performance
  startTimer: (operation: string) => logger.startPerformanceTimer(operation),
  endTimer: (operation: string, category?: string) => logger.endPerformanceTimer(operation, category),
  
  // Metrics
  metric: (name: string, value: number, unit?: string, tags?: Record<string, string>) => 
    logger.metric(name, value, unit, tags),
  
  // Email Marketing
  emailSent: (campaignId: string, email: string, messageId: string, duration: number) =>
    logger.emailSent(campaignId, email, messageId, duration),
  emailFailed: (campaignId: string, email: string, error: string, code?: string) =>
    logger.emailFailed(campaignId, email, error, code),
  campaignStarted: (id: string, count: number, type: string) =>
    logger.campaignStarted(id, count, type),
  campaignCompleted: (id: string, sent: number, failed: number, duration: number) =>
    logger.campaignCompleted(id, sent, failed, duration),
  
  // System
  health: (component: string, status: 'healthy' | 'degraded' | 'unhealthy', metrics?: any) =>
    logger.systemHealth(component, status, metrics),
  security: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any) =>
    logger.securityEvent(event, severity, details),
  audit: (action: string, resource: string, userId: string, details?: any) =>
    logger.auditTrail(action, resource, userId, details)
};

export default logger;