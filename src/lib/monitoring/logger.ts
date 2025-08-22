/**
 * Enterprise Logging Service
 * Comprehensive application monitoring with structured logging,
 * performance tracking, and real-time analytics
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  category: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: any;
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
    ip?: string;
  };
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, any>;
  };
  metadata?: {
    source: 'client' | 'server';
    environment: string;
    version: string;
    component?: string;
    function?: string;
    traceId?: string;
  };
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  enablePerformance: boolean;
  enableUserTracking: boolean;
  batchSize: number;
  batchTimeout: number;
  remoteEndpoint: string;
  maxRetries: number;
  enableLocalStorage: boolean;
  maxLocalEntries: number;
}

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memory?: {
    used: number;
    total: number;
  };
  timing?: Record<string, number>;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private performanceTrackers: Map<string, PerformanceMetrics> = new Map();
  private isClient: boolean;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.isClient = typeof window !== 'undefined';
    
    this.config = {
      level: 'info',
      enableConsole: true,
      enableRemote: true,
      enablePerformance: true,
      enableUserTracking: true,
      batchSize: 10,
      batchTimeout: 5000,
      remoteEndpoint: '/api/monitoring/logs',
      maxRetries: 3,
      enableLocalStorage: true,
      maxLocalEntries: 1000,
      ...config
    };

    if (this.isClient) {
      this.initializeClientLogging();
    }
  }

  private initializeClientLogging() {
    // Set up automatic error catching
    window.addEventListener('error', (event) => {
      this.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Set up performance monitoring
    if (this.config.enablePerformance && 'performance' in window) {
      this.initializePerformanceMonitoring();
    }

    // Set up periodic flushing
    this.scheduleFlush();
  }

  private initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationTiming) {
          this.info('Page Load Performance', {
            domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart,
            loadComplete: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          });
        }
      }, 1000);
    });

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) { // Log slow resources
          this.warn('Slow Resource Loading', {
            name: entry.name,
            duration: entry.duration,
            type: entry.entryType
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource', 'navigation'] });
  }

  private getLevelPriority(level: LogLevel): number {
    const priorities = { debug: 0, info: 1, warn: 2, error: 3, critical: 4 };
    return priorities[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.config.level);
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMetadata(): LogEntry['metadata'] {
    return {
      source: this.isClient ? 'client' : 'server',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      traceId: this.generateTraceId()
    };
  }

  private generateTraceId(): string {
    // Generate or get existing trace ID for request correlation
    if (this.isClient) {
      let traceId = sessionStorage.getItem('traceId');
      if (!traceId) {
        traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('traceId', traceId);
      }
      return traceId;
    }
    return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserInfo(): LogEntry['user'] | undefined {
    if (!this.config.enableUserTracking || !this.isClient) return undefined;

    return {
      sessionId: sessionStorage.getItem('sessionId') || undefined,
      userAgent: navigator.userAgent,
      // Note: IP would be determined server-side
    };
  }

  private getPerformanceInfo(): LogEntry['performance'] | undefined {
    if (!this.config.enablePerformance || !this.isClient) return undefined;

    const memory = (performance as any).memory;
    return {
      memory: memory ? memory.usedJSHeapSize : undefined,
      timing: {
        navigationStart: performance.timeOrigin,
        now: performance.now()
      }
    };
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    category: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      context,
      metadata: this.getMetadata(),
      user: this.getUserInfo(),
      performance: this.getPerformanceInfo()
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      };
    }

    return entry;
  }

  private logToConsole(entry: LogEntry) {
    if (!this.config.enableConsole) return;

    const consoleMethods = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
      critical: console.error
    };

    const method = consoleMethods[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    method(
      `[${timestamp}] ${entry.level.toUpperCase()} [${entry.category}] ${entry.message}`,
      entry.context || {},
      entry.error || ''
    );
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry);

    // Store in localStorage as backup
    if (this.config.enableLocalStorage && this.isClient) {
      try {
        const stored = JSON.parse(localStorage.getItem('logger_entries') || '[]');
        stored.push(entry);
        
        // Keep only recent entries
        const recent = stored.slice(-this.config.maxLocalEntries);
        localStorage.setItem('logger_entries', JSON.stringify(recent));
      } catch (error) {
        console.warn('Failed to store log entry in localStorage:', error);
      }
    }

    // Flush if buffer is full
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private scheduleFlush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flush();
      this.scheduleFlush();
    }, this.config.batchTimeout);
  }

  private async flush() {
    if (this.logBuffer.length === 0 || !this.config.enableRemote) return;

    const entries = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Remove from localStorage backup on successful send
      if (this.config.enableLocalStorage && this.isClient) {
        try {
          const stored = JSON.parse(localStorage.getItem('logger_entries') || '[]');
          const remaining = stored.filter((entry: LogEntry) => 
            !entries.find(sent => sent.id === entry.id)
          );
          localStorage.setItem('logger_entries', JSON.stringify(remaining));
        } catch (error) {
          console.warn('Failed to clean localStorage after successful flush:', error);
        }
      }

    } catch (error) {
      console.warn('Failed to flush logs to remote endpoint:', error);
      
      // Re-add to buffer for retry
      this.logBuffer.unshift(...entries);
      
      // Limit buffer size to prevent memory issues
      if (this.logBuffer.length > this.config.batchSize * 5) {
        this.logBuffer = this.logBuffer.slice(-this.config.batchSize * 3);
      }
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>, category = 'DEBUG') {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, category, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  info(message: string, context?: Record<string, any>, category = 'INFO') {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, category, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  warn(message: string, context?: Record<string, any>, category = 'WARNING') {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, category, context);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  error(message: string, contextOrError?: Record<string, any> | Error, category = 'ERROR') {
    if (!this.shouldLog('error')) return;
    
    let context: Record<string, any> | undefined;
    let error: Error | undefined;

    if (contextOrError instanceof Error) {
      error = contextOrError;
    } else {
      context = contextOrError;
    }
    
    const entry = this.createLogEntry('error', message, category, context, error);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  critical(message: string, contextOrError?: Record<string, any> | Error, category = 'CRITICAL') {
    const entry = this.createLogEntry('critical', message, category, 
      contextOrError instanceof Error ? undefined : contextOrError,
      contextOrError instanceof Error ? contextOrError : undefined
    );
    this.logToConsole(entry);
    this.addToBuffer(entry);
    
    // Force immediate flush for critical errors
    this.flush();
  }

  // Performance tracking
  startPerformanceTracking(id: string): void {
    if (!this.config.enablePerformance) return;

    this.performanceTrackers.set(id, {
      startTime: performance.now()
    });
  }

  endPerformanceTracking(id: string, context?: Record<string, any>): number | undefined {
    if (!this.config.enablePerformance) return;

    const tracker = this.performanceTrackers.get(id);
    if (!tracker) {
      this.warn('Performance tracker not found', { trackerId: id });
      return;
    }

    const endTime = performance.now();
    const duration = endTime - tracker.startTime;

    this.info(`Performance: ${id}`, {
      duration,
      startTime: tracker.startTime,
      endTime,
      ...context
    }, 'PERFORMANCE');

    this.performanceTrackers.delete(id);
    return duration;
  }

  // API request logging
  logApiRequest(
    method: string,
    url: string,
    status: number,
    duration: number,
    context?: Record<string, any>
  ) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    
    this[level](`API ${method} ${url}`, {
      method,
      url,
      status,
      duration,
      ...context
    }, 'API');
  }

  // User action logging
  logUserAction(action: string, context?: Record<string, any>) {
    this.info(`User Action: ${action}`, context, 'USER_ACTION');
  }

  // Business logic logging
  logBusinessEvent(event: string, context?: Record<string, any>) {
    this.info(`Business Event: ${event}`, context, 'BUSINESS');
  }

  // Email notification logging
  logEmailEvent(event: string, context?: Record<string, any>) {
    this.info(`Email Event: ${event}`, context, 'EMAIL');
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    
    // Flush remaining logs
    this.flush();
  }
}

// Singleton instance
const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  enableConsole: process.env.NODE_ENV === 'development',
  enableRemote: true,
  enablePerformance: true,
  enableUserTracking: true
});

// Performance monitoring utilities
export const performanceMonitor = {
  time: (id: string) => logger.startPerformanceTracking(id),
  timeEnd: (id: string, context?: Record<string, any>) => logger.endPerformanceTracking(id, context),
  
  // Decorator for function performance monitoring
  monitor: (name?: string) => {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const trackingId = name || `${target.constructor.name}.${propertyKey}`;

      descriptor.value = async function (...args: any[]) {
        logger.startPerformanceTracking(trackingId);
        try {
          const result = await originalMethod.apply(this, args);
          logger.endPerformanceTracking(trackingId, { success: true });
          return result;
        } catch (error) {
          logger.endPerformanceTracking(trackingId, { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
          throw error;
        }
      };

      return descriptor;
    };
  }
};

// API monitoring utilities
export const apiMonitor = {
  logRequest: (method: string, url: string, status: number, duration: number, context?: Record<string, any>) => {
    logger.logApiRequest(method, url, status, duration, context);
  },
  
  // Fetch wrapper with automatic logging
  fetch: async (url: string, options?: RequestInit) => {
    const startTime = performance.now();
    const method = options?.method || 'GET';
    
    try {
      const response = await fetch(url, options);
      const duration = performance.now() - startTime;
      
      logger.logApiRequest(method, url, response.status, duration, {
        success: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      logger.logApiRequest(method, url, 0, duration, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
};

export default logger;
export type { LogEntry, LogLevel, LoggerConfig };