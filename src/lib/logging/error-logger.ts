/**
 * 🚨 COMPREHENSIVE ERROR LOGGING SYSTEM
 * Advanced error tracking, monitoring, and alerting
 */

import { prisma } from '@/lib/database/prisma';

export interface ErrorLogData {
  level: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  userIp?: string;
  userId?: string;
  bookingId?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface ErrorContext {
  request?: Request;
  userId?: string;
  bookingId?: string;
  additionalData?: Record<string, any>;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorLogData[] = [];
  private isProcessing = false;

  private constructor() {
    // Start background processing
    this.startBackgroundProcessing();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log error with comprehensive context
   */
  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    try {
      const errorData = this.buildErrorData('ERROR', error, context);
      
      // Add to queue for async processing
      this.errorQueue.push(errorData);
      
      // Also log to console immediately
      console.error('🚨 ERROR:', errorData.message, {
        stack: errorData.stack,
        endpoint: errorData.endpoint,
        metadata: errorData.metadata
      });

      // Send critical errors immediately
      if (this.isCriticalError(errorData)) {
        await this.processCriticalError(errorData);
      }

    } catch (logError) {
      console.error('❌ Error logging failed:', logError);
    }
  }

  /**
   * Log warning
   */
  async logWarning(message: string, context?: ErrorContext): Promise<void> {
    try {
      const errorData = this.buildErrorData('WARN', message, context);
      this.errorQueue.push(errorData);
      
      console.warn('⚠️ WARNING:', errorData.message, {
        endpoint: errorData.endpoint,
        metadata: errorData.metadata
      });

    } catch (logError) {
      console.error('❌ Warning logging failed:', logError);
    }
  }

  /**
   * Log info
   */
  async logInfo(message: string, context?: ErrorContext): Promise<void> {
    try {
      const errorData = this.buildErrorData('INFO', message, context);
      this.errorQueue.push(errorData);
      
      console.info('ℹ️ INFO:', errorData.message, {
        endpoint: errorData.endpoint,
        metadata: errorData.metadata
      });

    } catch (logError) {
      console.error('❌ Info logging failed:', logError);
    }
  }

  /**
   * Log booking-specific error
   */
  async logBookingError(
    error: Error | string, 
    bookingId: string, 
    context?: Omit<ErrorContext, 'bookingId'>
  ): Promise<void> {
    await this.logError(error, { ...context, bookingId });
  }

  /**
   * Log payment-specific error
   */
  async logPaymentError(
    error: Error | string,
    paymentIntentId: string,
    context?: ErrorContext
  ): Promise<void> {
    const enhancedContext = {
      ...context,
      additionalData: {
        ...context?.additionalData,
        paymentIntentId,
        errorType: 'PAYMENT_ERROR'
      }
    };
    
    await this.logError(error, enhancedContext);
  }

  /**
   * Log API endpoint error
   */
  async logAPIError(
    error: Error | string,
    request: Request,
    context?: Omit<ErrorContext, 'request'>
  ): Promise<void> {
    await this.logError(error, { ...context, request });
  }

  /**
   * Build error data structure
   */
  private buildErrorData(level: 'ERROR' | 'WARN' | 'INFO', error: Error | string, context?: ErrorContext): ErrorLogData {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    const errorData: ErrorLogData = {
      level,
      message,
      stack,
      userId: context?.userId,
      bookingId: context?.bookingId,
      metadata: context?.additionalData || {}
    };

    // Ensure metadata is always an object
    if (!errorData.metadata) {
      errorData.metadata = {};
    }

    // Extract request information
    if (context?.request) {
      const url = new URL(context.request.url);
      errorData.endpoint = url.pathname;
      errorData.method = context.request.method;
      errorData.userAgent = context.request.headers.get('user-agent') || undefined;
      errorData.userIp = this.extractClientIP(context.request);
      
      // Add query parameters to metadata
      if (url.search) {
        errorData.metadata.queryParams = Object.fromEntries(url.searchParams);
      }
    }

    // Add error classification tags
    errorData.tags = this.classifyError(message, stack);

    // Add timestamp to metadata
    errorData.metadata.timestamp = new Date().toISOString();
    errorData.metadata.environment = process.env.NODE_ENV || 'development';

    return errorData;
  }

  /**
   * Extract client IP from request
   */
  private extractClientIP(request: Request): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    return cfConnectingIP || realIP || forwarded?.split(',')[0] || undefined;
  }

  /**
   * Classify error for better organization
   */
  private classifyError(message: string, stack?: string): string[] {
    const tags: string[] = [];
    const lowerMessage = message.toLowerCase();
    const lowerStack = stack?.toLowerCase() || '';

    // Database errors
    if (lowerMessage.includes('database') || lowerMessage.includes('sql') || lowerMessage.includes('prisma')) {
      tags.push('database');
    }

    // Payment errors
    if (lowerMessage.includes('payment') || lowerMessage.includes('stripe') || lowerMessage.includes('card')) {
      tags.push('payment');
    }

    // External API errors
    if (lowerMessage.includes('amadeus') || lowerMessage.includes('api') || lowerMessage.includes('fetch')) {
      tags.push('external-api');
    }

    // Validation errors
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('required')) {
      tags.push('validation');
    }

    // Authentication errors
    if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
      tags.push('authentication');
    }

    // Email/SMS errors
    if (lowerMessage.includes('email') || lowerMessage.includes('sms') || lowerMessage.includes('sendgrid') || lowerMessage.includes('twilio')) {
      tags.push('communication');
    }

    // Network errors
    if (lowerMessage.includes('network') || lowerMessage.includes('timeout') || lowerMessage.includes('connection')) {
      tags.push('network');
    }

    // Critical system errors
    if (lowerMessage.includes('out of memory') || lowerMessage.includes('system') || lowerStack.includes('segfault')) {
      tags.push('critical', 'system');
    }

    return tags;
  }

  /**
   * Check if error is critical
   */
  private isCriticalError(errorData: ErrorLogData): boolean {
    const criticalKeywords = ['payment failed', 'database unavailable', 'system error', 'out of memory'];
    const lowerMessage = errorData.message.toLowerCase();
    
    return Boolean(criticalKeywords.some(keyword => lowerMessage.includes(keyword))) ||
           Boolean(errorData.tags?.includes('critical')) ||
           (errorData.level === 'ERROR' && Boolean(errorData.tags?.includes('payment')));
  }

  /**
   * Process critical errors immediately
   */
  private async processCriticalError(errorData: ErrorLogData): Promise<void> {
    try {
      // Store in database immediately
      await this.storeErrorInDatabase(errorData);
      
      // Send alerts (email, Slack, etc.)
      await this.sendCriticalErrorAlert(errorData);
      
    } catch (error) {
      console.error('❌ Critical error processing failed:', error);
    }
  }

  /**
   * Send critical error alerts
   */
  private async sendCriticalErrorAlert(errorData: ErrorLogData): Promise<void> {
    try {
      // In production, integrate with alerting services
      // Examples: Slack, Discord, PagerDuty, email alerts
      
      if (process.env.SLACK_WEBHOOK_URL) {
        // Send to Slack
        const slackMessage = {
          text: `🚨 Critical Error Alert`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Error', value: errorData.message, short: false },
              { title: 'Endpoint', value: errorData.endpoint || 'N/A', short: true },
              { title: 'User ID', value: errorData.userId || 'N/A', short: true },
              { title: 'Booking ID', value: errorData.bookingId || 'N/A', short: true },
              { title: 'Environment', value: process.env.NODE_ENV || 'unknown', short: true }
            ],
            ts: Math.floor(Date.now() / 1000)
          }]
        };

        // Would send to Slack webhook
        console.log('🚨 CRITICAL ERROR ALERT:', slackMessage);
      }

      // Send critical error email
      if (process.env.CRITICAL_ERROR_EMAIL) {
        const { emailService } = await import('@/lib/email/email-service');
        
        await emailService.sendEmail({
          to: process.env.CRITICAL_ERROR_EMAIL,
          subject: `🚨 Critical Error - ${process.env.NODE_ENV?.toUpperCase()}`,
          htmlContent: this.generateErrorEmailHTML(errorData),
          textContent: this.generateErrorEmailText(errorData)
        });
      }

    } catch (alertError) {
      console.error('❌ Error alert sending failed:', alertError);
    }
  }

  /**
   * Generate error email HTML
   */
  private generateErrorEmailHTML(errorData: ErrorLogData): string {
    return `
      <html>
        <body style="font-family: monospace; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h2 style="color: #dc2626; margin: 0 0 20px;">🚨 Critical Error Alert</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="font-weight: bold; padding: 8px; background: #f9f9f9;">Level:</td><td style="padding: 8px;">${errorData.level}</td></tr>
              <tr><td style="font-weight: bold; padding: 8px; background: #f9f9f9;">Message:</td><td style="padding: 8px;">${errorData.message}</td></tr>
              <tr><td style="font-weight: bold; padding: 8px; background: #f9f9f9;">Endpoint:</td><td style="padding: 8px;">${errorData.endpoint || 'N/A'}</td></tr>
              <tr><td style="font-weight: bold; padding: 8px; background: #f9f9f9;">Method:</td><td style="padding: 8px;">${errorData.method || 'N/A'}</td></tr>
              <tr><td style="font-weight: bold; padding: 8px; background: #f9f9f9;">User ID:</td><td style="padding: 8px;">${errorData.userId || 'N/A'}</td></tr>
              <tr><td style="font-weight: bold; padding: 8px; background: #f9f9f9;">Booking ID:</td><td style="padding: 8px;">${errorData.bookingId || 'N/A'}</td></tr>
              <tr><td style="font-weight: bold; padding: 8px; background: #f9f9f9;">Environment:</td><td style="padding: 8px;">${process.env.NODE_ENV || 'unknown'}</td></tr>
              <tr><td style="font-weight: bold; padding: 8px; background: #f9f9f9;">Tags:</td><td style="padding: 8px;">${errorData.tags?.join(', ') || 'None'}</td></tr>
            </table>
            
            ${errorData.stack ? `
            <div style="margin-top: 20px;">
              <h3>Stack Trace:</h3>
              <pre style="background: #f1f1f1; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${errorData.stack}</pre>
            </div>
            ` : ''}
            
            ${Object.keys(errorData.metadata || {}).length > 0 ? `
            <div style="margin-top: 20px;">
              <h3>Metadata:</h3>
              <pre style="background: #f1f1f1; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(errorData.metadata, null, 2)}</pre>
            </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate error email text
   */
  private generateErrorEmailText(errorData: ErrorLogData): string {
    return `
CRITICAL ERROR ALERT

Level: ${errorData.level}
Message: ${errorData.message}
Endpoint: ${errorData.endpoint || 'N/A'}
Method: ${errorData.method || 'N/A'}
User ID: ${errorData.userId || 'N/A'}
Booking ID: ${errorData.bookingId || 'N/A'}
Environment: ${process.env.NODE_ENV || 'unknown'}
Tags: ${errorData.tags?.join(', ') || 'None'}

${errorData.stack ? `
Stack Trace:
${errorData.stack}
` : ''}

${Object.keys(errorData.metadata || {}).length > 0 ? `
Metadata:
${JSON.stringify(errorData.metadata, null, 2)}
` : ''}
    `.trim();
  }

  /**
   * Store error in database
   */
  private async storeErrorInDatabase(errorData: ErrorLogData): Promise<void> {
    try {
      await prisma.errorLog.create({
        data: {
          level: errorData.level,
          message: errorData.message,
          stack: errorData.stack,
          endpoint: errorData.endpoint,
          method: errorData.method,
          userAgent: errorData.userAgent,
          userIp: errorData.userIp,
          userId: errorData.userId,
          bookingId: errorData.bookingId,
          metadata: errorData.metadata || {}
        }
      });
    } catch (dbError) {
      console.error('❌ Database error logging failed:', dbError);
      // Fallback to file logging or external service
    }
  }

  /**
   * Background processing of error queue
   */
  private startBackgroundProcessing(): void {
    setInterval(() => {
      if (!this.isProcessing && this.errorQueue.length > 0) {
        this.processErrorQueue();
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process queued errors
   */
  private async processErrorQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batch = this.errorQueue.splice(0, 10); // Process 10 at a time
      
      for (const errorData of batch) {
        try {
          await this.storeErrorInDatabase(errorData);
        } catch (error) {
          console.error('❌ Background error processing failed:', error);
          // Put back in queue for retry (with limit)
          if (!errorData.metadata) {
            errorData.metadata = {};
          }
          if (!errorData.metadata.retryCount || errorData.metadata.retryCount < 3) {
            errorData.metadata.retryCount = (errorData.metadata.retryCount || 0) + 1;
            this.errorQueue.push(errorData);
          }
        }
      }

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStats(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byTag: Record<string, number>;
    recent: any[];
  }> {
    try {
      const now = new Date();
      const timeframeMap = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000
      };

      const since = new Date(now.getTime() - timeframeMap[timeframe]);

      const errors = await prisma.errorLog.findMany({
        where: {
          createdAt: {
            gte: since
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      });

      const stats = {
        total: errors.length,
        byLevel: {} as Record<string, number>,
        byTag: {} as Record<string, number>,
        recent: errors.slice(0, 10)
      };

      // Count by level
      errors.forEach((error: any) => {
        stats.byLevel[error.level] = (stats.byLevel[error.level] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('❌ Error stats retrieval failed:', error);
      return {
        total: 0,
        byLevel: {},
        byTag: {},
        recent: []
      };
    }
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Export convenience functions
export const logError = (error: Error | string, context?: ErrorContext) => errorLogger.logError(error, context);
export const logWarning = (message: string, context?: ErrorContext) => errorLogger.logWarning(message, context);
export const logInfo = (message: string, context?: ErrorContext) => errorLogger.logInfo(message, context);
export const logBookingError = (error: Error | string, bookingId: string, context?: Omit<ErrorContext, 'bookingId'>) => errorLogger.logBookingError(error, bookingId, context);
export const logPaymentError = (error: Error | string, paymentIntentId: string, context?: ErrorContext) => errorLogger.logPaymentError(error, paymentIntentId, context);
export const logAPIError = (error: Error | string, request: Request, context?: Omit<ErrorContext, 'request'>) => errorLogger.logAPIError(error, request, context);