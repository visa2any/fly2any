/**
 * Production-ready logging utility for Fly2Any
 *
 * Features:
 * - Environment-aware logging (development vs production)
 * - Structured logging with context data
 * - Integration-ready for error monitoring (Sentry, etc.)
 * - Type-safe with TypeScript
 * - Emoji indicators for quick visual scanning
 *
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * // Debug logging (dev only)
 * logger.debug('Cache hit', { key: 'flight-123', ttl: 3600 });
 *
 * // Info logging (dev only)
 * logger.info('User logged in', { userId: 'usr_123', method: 'oauth' });
 *
 * // Warnings (always logged)
 * logger.warn('Rate limit approaching', { requests: 95, limit: 100 });
 *
 * // Errors (always logged + sent to monitoring)
 * logger.error('Payment failed', error, { userId: 'usr_123', amount: 499 });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface ErrorMonitoringService {
  captureException: (error: Error, context?: LogContext) => void;
  captureMessage: (message: string, level: 'warning' | 'error' | 'info', context?: LogContext) => void;
}

/**
 * Performance timing utility for measuring operation duration
 */
class PerformanceTimer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
  }

  end(context?: LogContext): void {
    const duration = performance.now() - this.startTime;
    logger.debug(`${this.label} completed`, {
      ...context,
      duration: `${duration.toFixed(2)}ms`
    });
  }
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private errorMonitoring?: ErrorMonitoringService;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.errorMonitoring = undefined;

    // TODO: Initialize error monitoring service in production
    // this.initializeErrorMonitoring();
  }

  /**
   * Initialize error monitoring service (Sentry, Datadog, etc.)
   * Call this method during app initialization
   */
  initializeErrorMonitoring(service: ErrorMonitoringService): void {
    this.errorMonitoring = service;
    this.info('Error monitoring initialized', { service: service.constructor.name });
  }

  /**
   * Debug-level logging - only visible in development
   * Use for detailed debugging information, cache hits/misses, etc.
   *
   * @example
   * logger.debug('Cache hit', { key: 'flight-search-123', ttl: 3600 });
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const emoji = this.getEmojiForMessage(message);
      console.log(`${emoji} [DEBUG]`, message, context ? this.formatContext(context) : '');
    }
  }

  /**
   * Info-level logging - only visible in development
   * Use for general informational messages about app flow
   *
   * @example
   * logger.info('User authenticated', { userId: 'usr_123', method: 'oauth' });
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const emoji = this.getEmojiForMessage(message);
      console.log(`${emoji} [INFO]`, message, context ? this.formatContext(context) : '');
    }
  }

  /**
   * Warning-level logging - always logged
   * Use for recoverable issues that need attention
   *
   * @example
   * logger.warn('Rate limit approaching', { requests: 95, limit: 100 });
   */
  warn(message: string, context?: LogContext): void {
    const emoji = this.getEmojiForMessage(message);
    console.warn(`${emoji} [WARN]`, message, context ? this.formatContext(context) : '');

    // Send warnings to monitoring in production
    if (this.isProduction && this.errorMonitoring) {
      this.errorMonitoring.captureMessage(message, 'warning', context);
    }
  }

  /**
   * Error-level logging - always logged and sent to monitoring
   * Use for exceptions, failed operations, and critical issues
   *
   * @example
   * logger.error('Payment processing failed', error, { userId: 'usr_123', amount: 499 });
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error('❌ [ERROR]', message, error || '', context ? this.formatContext(context) : '');

    // Send errors to monitoring service
    if (this.errorMonitoring) {
      if (error instanceof Error) {
        this.errorMonitoring.captureException(error, {
          message,
          ...context
        });
      } else {
        this.errorMonitoring.captureMessage(message, 'error', {
          error: String(error),
          ...context
        });
      }
    }
  }

  /**
   * Success-level logging - visible in development
   * Use for successful operations, confirmations
   *
   * @example
   * logger.success('Booking created', { bookingId: 'bkg_123', amount: 499 });
   */
  success(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log('✅ [SUCCESS]', message, context ? this.formatContext(context) : '');
    }
  }

  /**
   * Performance timing utility
   * Returns a timer that can be ended to log the operation duration
   *
   * @example
   * const timer = logger.startTimer('API request');
   * await fetchData();
   * timer.end({ endpoint: '/api/flights' });
   */
  startTimer(label: string): PerformanceTimer {
    return new PerformanceTimer(label);
  }

  /**
   * Group related logs together (development only)
   * Useful for debugging complex operations
   *
   * @example
   * logger.group('Flight search operation');
   * logger.debug('Validating input');
   * logger.debug('Fetching from cache');
   * logger.groupEnd();
   */
  group(label: string): void {
    if (this.isDevelopment && typeof console.group === 'function') {
      console.group(`📦 ${label}`);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment && typeof console.groupEnd === 'function') {
      console.groupEnd();
    }
  }

  /**
   * Format context object for better readability
   */
  private formatContext(context: LogContext): string | LogContext {
    if (this.isDevelopment) {
      // In development, return the full object for browser console
      return context;
    }
    // In production, stringify for log aggregation services
    return JSON.stringify(context);
  }

  /**
   * Get appropriate emoji based on message content
   * This helps with quick visual scanning of logs
   */
  private getEmojiForMessage(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Cache-related
    if (lowerMessage.includes('cache')) {
      if (lowerMessage.includes('hit')) return '🎯';
      if (lowerMessage.includes('miss')) return '💨';
      if (lowerMessage.includes('clear') || lowerMessage.includes('invalidate')) return '🧹';
      return '💾';
    }

    // Database-related
    if (lowerMessage.includes('database') || lowerMessage.includes('db') || lowerMessage.includes('query')) {
      return '🗄️';
    }

    // API-related
    if (lowerMessage.includes('api') || lowerMessage.includes('request') || lowerMessage.includes('response')) {
      return '🌐';
    }

    // Payment-related
    if (lowerMessage.includes('payment') || lowerMessage.includes('stripe') || lowerMessage.includes('transaction')) {
      return '💳';
    }

    // Booking-related
    if (lowerMessage.includes('booking') || lowerMessage.includes('reservation')) {
      return '🎫';
    }

    // Email-related
    if (lowerMessage.includes('email') || lowerMessage.includes('mail')) {
      return '📧';
    }

    // User-related
    if (lowerMessage.includes('user') || lowerMessage.includes('auth') || lowerMessage.includes('login')) {
      return '👤';
    }

    // Search-related
    if (lowerMessage.includes('search') || lowerMessage.includes('query')) {
      return '🔍';
    }

    // Flight-related
    if (lowerMessage.includes('flight')) return '✈️';

    // Hotel-related
    if (lowerMessage.includes('hotel')) return '🏨';

    // Car-related
    if (lowerMessage.includes('car')) return '🚗';

    // Performance-related
    if (lowerMessage.includes('performance') || lowerMessage.includes('timing') || lowerMessage.includes('duration')) {
      return '⚡';
    }

    // Default emoji
    return 'ℹ️';
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for consumers
export type { LogLevel, LogContext, ErrorMonitoringService };
export { PerformanceTimer };
