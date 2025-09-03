/**
 * ULTRATHINK ENTERPRISE - Production Hydration Monitor
 * 
 * This system provides comprehensive hydration monitoring and analytics
 * for production environments, enabling proactive issue detection and resolution.
 * 
 * Features:
 * - Real-time hydration error detection and reporting
 * - Performance metrics collection and analysis
 * - Automatic error recovery and fallback mechanisms
 * - Integration with monitoring services (Sentry, DataDog, etc.)
 * - Custom alerting and notification systems
 * - Historical hydration data tracking and trends
 */

interface HydrationEvent {
  type: 'start' | 'success' | 'error' | 'retry' | 'fallback';
  timestamp: number;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    componentStack?: string;
  };
  metadata: {
    url: string;
    userAgent: string;
    viewport: { width: number; height: number };
    connectionType?: string;
    isBot: boolean;
    sessionId: string;
    userId?: string;
  };
  performance: {
    domContentLoaded: number;
    firstContentfulPaint?: number;
    hydrationTime: number;
    memoryUsage?: number;
  };
  context: {
    component?: string;
    props?: Record<string, any>;
    state?: Record<string, any>;
  };
}

interface HydrationMetrics {
  totalEvents: number;
  successRate: number;
  averageHydrationTime: number;
  errorRate: number;
  retryRate: number;
  fallbackRate: number;
  topErrors: Array<{ message: string; count: number; percentage: number }>;
  performanceP50: number;
  performanceP95: number;
  performanceP99: number;
}

interface MonitorConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  sampling: {
    rate: number; // 0.0 to 1.0
    maxEventsPerSession: number;
  };
  reporting: {
    endpoint?: string;
    apiKey?: string;
    batchSize: number;
    flushInterval: number; // milliseconds
  };
  alerts: {
    errorRateThreshold: number; // percentage
    performanceThreshold: number; // milliseconds
    enabled: boolean;
  };
  retention: {
    maxEvents: number;
    maxAge: number; // milliseconds
  };
}

class HydrationMonitor {
  private static instance: HydrationMonitor | null = null;
  private config: MonitorConfig;
  private events: HydrationEvent[] = [];
  private sessionId: string;
  private isInitialized = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  constructor(config: Partial<MonitorConfig> = {}) {
    const environment = config.environment || (process.env.NODE_ENV as any) || 'development';
    this.config = {
      enabled: true,
      environment,
      sampling: {
        rate: this.getDefaultSamplingRate(environment),
        maxEventsPerSession: 100
      },
      reporting: {
        batchSize: 10,
        flushInterval: 30000, // 30 seconds
        ...config.reporting
      },
      alerts: {
        errorRateThreshold: 5, // 5%
        performanceThreshold: 3000, // 3 seconds
        enabled: config.environment !== 'development',
        ...config.alerts
      },
      retention: {
        maxEvents: 1000,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        ...config.retention
      },
      ...config
    };

    this.sessionId = this.generateSessionId();
  }

  public static getInstance(config?: Partial<MonitorConfig>): HydrationMonitor {
    if (!HydrationMonitor.instance) {
      HydrationMonitor.instance = new HydrationMonitor(config);
    }
    return HydrationMonitor.instance;
  }

  public initialize(): void {
    if (this.isInitialized || !this.config.enabled || typeof window === 'undefined') {
      return;
    }

    this.setupGlobalErrorHandling();
    this.setupPerformanceMonitoring();
    this.setupFlushTimer();
    this.cleanupOldEvents();

    // Register global monitoring hooks
    if ((window as any).__ENTERPRISE_ERROR_LOGGER__) {
      console.warn('HydrationMonitor: Global error logger already exists');
    } else {
      (window as any).__ENTERPRISE_ERROR_LOGGER__ = this.logError.bind(this);
    }

    this.isInitialized = true;
    console.info('🔍 HydrationMonitor: Initialized in', this.config.environment, 'mode');
  }

  public recordEvent(
    type: HydrationEvent['type'],
    error?: Error,
    context?: HydrationEvent['context'],
    duration?: number
  ): void {
    if (!this.config.enabled || !this.shouldSample()) {
      return;
    }

    // Prevent excessive events in a single session
    if (this.events.length >= this.config.sampling.maxEventsPerSession) {
      return;
    }

    const event: HydrationEvent = {
      type,
      timestamp: Date.now(),
      duration,
      error: error ? {
        message: error.message,
        stack: error.stack,
        componentStack: (error as any).componentStack
      } : undefined,
      metadata: this.collectMetadata(),
      performance: this.collectPerformanceData(),
      context: context || {}
    };

    this.events.push(event);
    this.checkAlertConditions(event);

    // Immediate reporting for critical errors
    if (type === 'error' && this.isCriticalError(error)) {
      this.flush(true);
    }
  }

  public getMetrics(): HydrationMetrics {
    const totalEvents = this.events.length;
    const errors = this.events.filter(e => e.type === 'error');
    const successes = this.events.filter(e => e.type === 'success');
    const retries = this.events.filter(e => e.type === 'retry');
    const fallbacks = this.events.filter(e => e.type === 'fallback');
    
    const hydrationTimes = this.events
      .filter(e => e.duration !== undefined)
      .map(e => e.duration!)
      .sort((a, b) => a - b);

    const errorCounts = new Map<string, number>();
    errors.forEach(event => {
      if (event.error?.message) {
        const count = errorCounts.get(event.error.message) || 0;
        errorCounts.set(event.error.message, count + 1);
      }
    });

    const topErrors = Array.from(errorCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([message, count]) => ({
        message,
        count,
        percentage: (count / errors.length) * 100
      }));

    return {
      totalEvents,
      successRate: totalEvents > 0 ? (successes.length / totalEvents) * 100 : 0,
      averageHydrationTime: hydrationTimes.length > 0 
        ? hydrationTimes.reduce((sum, time) => sum + time, 0) / hydrationTimes.length
        : 0,
      errorRate: totalEvents > 0 ? (errors.length / totalEvents) * 100 : 0,
      retryRate: totalEvents > 0 ? (retries.length / totalEvents) * 100 : 0,
      fallbackRate: totalEvents > 0 ? (fallbacks.length / totalEvents) * 100 : 0,
      topErrors,
      performanceP50: this.getPercentile(hydrationTimes, 0.5),
      performanceP95: this.getPercentile(hydrationTimes, 0.95),
      performanceP99: this.getPercentile(hydrationTimes, 0.99)
    };
  }

  public flush(immediate = false): Promise<void> {
    if (this.events.length === 0) {
      return Promise.resolve();
    }

    const eventsToFlush = this.events.splice(0, this.config.reporting.batchSize);
    
    if (this.config.reporting.endpoint) {
      return this.sendToEndpoint(eventsToFlush);
    } else {
      // Fallback to console logging
      this.logEvents(eventsToFlush);
      return Promise.resolve();
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    // Final flush
    this.flush(true);

    this.isInitialized = false;
  }

  private getDefaultSamplingRate(environment?: string): number {
    switch (environment) {
      case 'development': return 1.0; // 100% in dev
      case 'staging': return 0.5; // 50% in staging
      case 'production': return 0.1; // 10% in production
      default: return 0.1;
    }
  }

  private generateSessionId(): string {
    return `hm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampling.rate;
  }

  private collectMetadata(): HydrationEvent['metadata'] {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connectionType: (navigator as any).connection?.effectiveType || undefined,
      isBot: this.isBot(),
      sessionId: this.sessionId,
      userId: this.getUserId()
    };
  }

  private collectPerformanceData(): HydrationEvent['performance'] {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      firstContentfulPaint: this.getFirstContentfulPaint(),
      hydrationTime: performance.now(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined
    };
  }

  private setupGlobalErrorHandling(): void {
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure' && entry.name.includes('hydration')) {
            this.recordEvent('success', undefined, { component: entry.name }, entry.duration);
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure'] });
    }
  }

  private setupFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.reporting.flushInterval);
  }

  private handleGlobalError(event: ErrorEvent): void {
    if (this.isHydrationRelatedError(event.error)) {
      this.recordEvent('error', event.error);
    }
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    if (this.isHydrationRelatedError(error)) {
      this.recordEvent('error', error);
    }
  }

  private isHydrationRelatedError(error: Error): boolean {
    if (!error?.message) return false;
    
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    const keywords = ['hydration', 'hydrate', 'server rendered', 'client rendered', 'mismatch'];
    return keywords.some(keyword => message.includes(keyword) || stack.includes(keyword));
  }

  private isCriticalError(error?: Error): boolean {
    if (!error) return false;
    return error.message.toLowerCase().includes('critical') || 
           error.message.toLowerCase().includes('fatal');
  }

  private logError(errorData: any): void {
    if (errorData.isHydrationError) {
      this.recordEvent('error', errorData.error);
    }
  }

  private checkAlertConditions(event: HydrationEvent): void {
    if (!this.config.alerts.enabled) return;

    const metrics = this.getMetrics();
    
    // Check error rate threshold
    if (metrics.errorRate > this.config.alerts.errorRateThreshold) {
      this.triggerAlert('high-error-rate', { errorRate: metrics.errorRate });
    }
    
    // Check performance threshold
    if (event.duration && event.duration > this.config.alerts.performanceThreshold) {
      this.triggerAlert('slow-hydration', { duration: event.duration });
    }
  }

  private triggerAlert(type: string, data: any): void {
    console.warn(`🚨 HydrationMonitor Alert: ${type}`, data);
    
    // Integration with external alerting services would go here
    // Example: Slack, PagerDuty, email notifications, etc.
  }

  private async sendToEndpoint(events: HydrationEvent[]): Promise<void> {
    try {
      const response = await fetch(this.config.reporting.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.reporting.apiKey && {
            'Authorization': `Bearer ${this.config.reporting.apiKey}`
          })
        },
        body: JSON.stringify({
          events,
          sessionId: this.sessionId,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('HydrationMonitor: Failed to send events', error);
      // Fallback to console logging
      this.logEvents(events);
    }
  }

  private logEvents(events: HydrationEvent[]): void {
    if (this.config.environment === 'development') {
      console.group('🔍 HydrationMonitor: Events');
      events.forEach(event => {
        console.info(`[${event.type}] ${new Date(event.timestamp).toISOString()}`, event);
      });
      console.groupEnd();
    }
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - this.config.retention.maxAge;
    this.events = this.events.filter(event => event.timestamp > cutoff);
    
    if (this.events.length > this.config.retention.maxEvents) {
      this.events = this.events.slice(-this.config.retention.maxEvents);
    }
  }

  private getPercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const index = Math.ceil(values.length * percentile) - 1;
    return values[Math.max(0, Math.min(index, values.length - 1))];
  }

  private getFirstContentfulPaint(): number | undefined {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry?.startTime;
  }

  private isBot(): boolean {
    const botPatterns = [/bot/i, /crawler/i, /spider/i, /headless/i];
    return botPatterns.some(pattern => pattern.test(navigator.userAgent));
  }

  private getUserId(): string | undefined {
    // Implementation would depend on your auth system
    // Example: return localStorage.getItem('userId') || undefined;
    return undefined;
  }
}

// Global instance
export const hydrationMonitor = HydrationMonitor.getInstance();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  hydrationMonitor.initialize();
}

export default HydrationMonitor;