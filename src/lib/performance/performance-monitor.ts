/**
 * Comprehensive Performance Monitoring System
 * Real-time Core Web Vitals tracking and analytics
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';
import EnhancedCoreWebVitalsOptimizer from './core-web-vitals-enhanced';
import BundleOptimizer from './bundle-optimizer';
import CLSOptimizer from './cls-optimizer';

export interface PerformanceReport {
  timestamp: Date;
  page: string;
  device: 'mobile' | 'desktop';
  connection: 'fast' | 'slow' | 'offline';
  
  // Core Web Vitals
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  inp: number | null;
  
  // Custom metrics
  domContentLoaded: number;
  windowLoaded: number;
  firstPaint: number;
  
  // Resource metrics
  totalJSSize: number;
  totalCSSSize: number;
  totalImageSize: number;
  requestCount: number;
  
  // Performance scores
  overallScore: number;
  lcpScore: number;
  fidScore: number;
  clsScore: number;
  
  // Recommendations
  recommendations: string[];
  criticalIssues: string[];
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private isInitialized = false;
  private metrics: Map<string, any> = new Map();
  private observers: PerformanceObserver[] = [];
  private reportQueue: PerformanceReport[] = [];
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize comprehensive performance monitoring
   */
  public initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    console.log('🎯 Performance Monitor initializing...');

    // Initialize optimizers
    this.initializeOptimizers();
    
    // Setup Core Web Vitals monitoring
    this.setupWebVitalsMonitoring();
    
    // Setup resource monitoring
    this.setupResourceMonitoring();
    
    // Setup custom metrics
    this.setupCustomMetrics();
    
    // Setup automated reporting
    this.setupAutomatedReporting();
    
    // Setup real-time alerts
    this.setupRealTimeAlerts();

    console.log('📊 Performance Monitor initialized successfully');
  }

  private initializeOptimizers(): void {
    try {
      EnhancedCoreWebVitalsOptimizer.getInstance().initializeOptimizations();
      BundleOptimizer.getInstance().initialize();
      CLSOptimizer.getInstance().initialize();
    } catch (error) {
      console.warn('Some optimizers failed to initialize:', error);
    }
  }

  /**
   * Setup Core Web Vitals monitoring with enhanced tracking
   */
  private setupWebVitalsMonitoring(): void {
    // Enhanced LCP tracking
    onLCP((metric: Metric) => {
      this.metrics.set('lcp', metric.value);
      this.analyzeMetric('lcp', metric);
      this.sendToAnalytics('lcp', metric);
    });

    // Enhanced FID/INP tracking  
    onINP((metric: Metric) => {
      this.metrics.set('inp', metric.value);
      this.analyzeMetric('inp', metric);
      this.sendToAnalytics('inp', metric);
    });

    // Enhanced CLS tracking
    onCLS((metric: Metric) => {
      this.metrics.set('cls', metric.value);
      this.analyzeMetric('cls', metric);
      this.sendToAnalytics('cls', metric);
    });

    // FCP tracking
    onFCP((metric: Metric) => {
      this.metrics.set('fcp', metric.value);
      this.analyzeMetric('fcp', metric);
      this.sendToAnalytics('fcp', metric);
    });

    // TTFB tracking
    onTTFB((metric: Metric) => {
      this.metrics.set('ttfb', metric.value);
      this.analyzeMetric('ttfb', metric);
      this.sendToAnalytics('ttfb', metric);
    });
  }

  private analyzeMetric(name: string, metric: Metric): void {
    // Determine if metric is problematic
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      inp: { good: 200, poor: 500 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 200, poor: 600 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (threshold && metric.value > threshold.poor) {
      this.triggerAlert(`Poor ${name.toUpperCase()}`, metric.value, threshold.poor);
    }
  }

  private sendToAnalytics(metricName: string, metric: Metric): void {
    // Send to Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'web_vitals', {
        metric_name: metricName,
        metric_value: Math.round(metric.value),
        metric_id: metric.id,
        metric_delta: metric.delta,
        event_category: 'performance'
      });
    }

    // Send to internal analytics
    this.queueAnalyticsData({
      type: 'web_vital',
      name: metricName,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      timestamp: Date.now()
    });
  }

  /**
   * Setup comprehensive resource monitoring
   */
  private setupResourceMonitoring(): void {
    if (!PerformanceObserver) return;

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          this.analyzeResource(entry as PerformanceResourceTiming);
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);

    // Monitor navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          this.analyzeNavigation(entry as PerformanceNavigationTiming);
        }
      });
    });

    navigationObserver.observe({ entryTypes: ['navigation'] });
    this.observers.push(navigationObserver);

    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.analyzeLongTask(entry);
      });
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (error) {
      console.warn('Long task monitoring not available');
    }
  }

  private analyzeResource(entry: PerformanceResourceTiming): void {
    const resourceType = this.getResourceType(entry.name);
    const size = entry.transferSize || entry.encodedBodySize;
    const duration = entry.responseEnd - entry.requestStart;

    // Track resource metrics
    this.updateResourceMetrics(resourceType, size);

    // Identify performance issues
    if (duration > 1000) {
      console.warn(`Slow resource: ${entry.name} took ${duration}ms`);
      this.queueAnalyticsData({
        type: 'slow_resource',
        url: entry.name,
        duration,
        size,
        resourceType
      });
    }

    if (size > 500000) { // 500KB
      console.warn(`Large resource: ${entry.name} is ${size} bytes`);
      this.queueAnalyticsData({
        type: 'large_resource',
        url: entry.name,
        size,
        resourceType
      });
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) return 'image';
    if (url.includes('.woff')) return 'font';
    return 'other';
  }

  private updateResourceMetrics(type: string, size: number): void {
    const currentSize = this.metrics.get(`${type}Size`) || 0;
    this.metrics.set(`${type}Size`, currentSize + size);
  }

  private analyzeNavigation(entry: PerformanceNavigationTiming): void {
    // Extract key timing metrics
    const domContentLoaded = entry.domContentLoadedEventEnd - entry.startTime;
    const windowLoaded = entry.loadEventEnd - entry.startTime;
    const ttfb = entry.responseStart - entry.startTime;

    this.metrics.set('domContentLoaded', domContentLoaded);
    this.metrics.set('windowLoaded', windowLoaded);
    this.metrics.set('navigationTTFB', ttfb);

    // Analyze navigation performance
    if (domContentLoaded > 3000) {
      this.triggerAlert('Slow DOM Load', domContentLoaded, 3000);
    }

    if (windowLoaded > 5000) {
      this.triggerAlert('Slow Window Load', windowLoaded, 5000);
    }
  }

  private analyzeLongTask(entry: PerformanceEntry): void {
    const duration = entry.duration;
    
    if (duration > 50) {
      console.warn(`Long task detected: ${duration}ms`);
      this.queueAnalyticsData({
        type: 'long_task',
        duration,
        timestamp: entry.startTime
      });
    }

    // Critical long task alert
    if (duration > 200) {
      this.triggerAlert('Critical Long Task', duration, 200);
    }
  }

  /**
   * Setup custom performance metrics
   */
  private setupCustomMetrics(): void {
    // Time to Interactive estimation
    this.estimateTimeToInteractive();
    
    // Custom business metrics
    this.trackCustomBusinessMetrics();
    
    // Error tracking
    this.setupErrorTracking();
  }

  private estimateTimeToInteractive(): void {
    // Simplified TTI estimation
    let longTaskEnd = 0;
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        longTaskEnd = Math.max(longTaskEnd, entry.startTime + entry.duration);
      });
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
      
      window.addEventListener('load', () => {
        const tti = Math.max(longTaskEnd, performance.timing.domContentLoadedEventEnd);
        this.metrics.set('timeToInteractive', tti);
        
        this.queueAnalyticsData({
          type: 'custom_metric',
          name: 'time_to_interactive',
          value: tti
        });
      });
    } catch (error) {
      console.warn('TTI estimation not available');
    }
  }

  private trackCustomBusinessMetrics(): void {
    // Track form interaction delays
    document.addEventListener('input', this.debounce((e: Event) => {
      const target = e.target as HTMLInputElement;
      const start = performance.now();
      
      setTimeout(() => {
        const delay = performance.now() - start;
        if (delay > 100) {
          this.queueAnalyticsData({
            type: 'input_delay',
            delay,
            element: target.tagName
          });
        }
      }, 0);
    }, 100));

    // Track button click responsiveness
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const start = performance.now();
        
        requestAnimationFrame(() => {
          const delay = performance.now() - start;
          if (delay > 16) { // More than one frame
            this.queueAnalyticsData({
              type: 'click_delay',
              delay,
              element: target.tagName
            });
          }
        });
      }
    });
  }

  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (e) => {
      this.queueAnalyticsData({
        type: 'javascript_error',
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.queueAnalyticsData({
        type: 'unhandled_rejection',
        reason: e.reason?.toString()
      });
    });

    // Resource errors
    document.addEventListener('error', (e) => {
      if (e.target && e.target !== window) {
        const target = e.target as HTMLElement;
        this.queueAnalyticsData({
          type: 'resource_error',
          element: target.tagName,
          src: (target as any).src || (target as any).href
        });
      }
    }, true);
  }

  /**
   * Setup automated performance reporting
   */
  private setupAutomatedReporting(): void {
    // Generate reports periodically
    setInterval(() => {
      this.generateReport();
    }, 30000); // Every 30 seconds

    // Generate report on page unload
    window.addEventListener('beforeunload', () => {
      this.generateReport();
      this.flushAnalyticsQueue();
    });

    // Generate report on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.generateReport();
        this.flushAnalyticsQueue();
      }
    });
  }

  /**
   * Generate comprehensive performance report
   */
  private generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: new Date(),
      page: window.location.pathname,
      device: this.getDeviceType(),
      connection: this.getConnectionType(),
      
      // Core Web Vitals
      lcp: this.metrics.get('lcp') || null,
      fid: this.metrics.get('fid') || null,
      cls: this.metrics.get('cls') || null,
      fcp: this.metrics.get('fcp') || null,
      ttfb: this.metrics.get('ttfb') || null,
      inp: this.metrics.get('inp') || null,
      
      // Custom metrics
      domContentLoaded: this.metrics.get('domContentLoaded') || 0,
      windowLoaded: this.metrics.get('windowLoaded') || 0,
      firstPaint: this.getFirstPaint(),
      
      // Resource metrics
      totalJSSize: this.metrics.get('javascriptSize') || 0,
      totalCSSSize: this.metrics.get('stylesheetSize') || 0,
      totalImageSize: this.metrics.get('imageSize') || 0,
      requestCount: this.getRequestCount(),
      
      // Performance scores
      overallScore: 0,
      lcpScore: 0,
      fidScore: 0,
      clsScore: 0,
      
      // Analysis
      recommendations: [],
      criticalIssues: []
    };

    // Calculate scores
    report.lcpScore = this.calculateLCPScore(report.lcp);
    report.fidScore = this.calculateFIDScore(report.fid || report.inp);
    report.clsScore = this.calculateCLSScore(report.cls);
    report.overallScore = (report.lcpScore + report.fidScore + report.clsScore) / 3;

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);
    report.criticalIssues = this.identifyCriticalIssues(report);

    // Store report
    this.reportQueue.push(report);
    
    // Keep only last 10 reports
    if (this.reportQueue.length > 10) {
      this.reportQueue = this.reportQueue.slice(-10);
    }

    return report;
  }

  private getDeviceType(): 'mobile' | 'desktop' {
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  }

  private getConnectionType(): 'fast' | 'slow' | 'offline' {
    if (!navigator.onLine) return 'offline';
    
    const connection = (navigator as any).connection;
    if (!connection) return 'fast';
    
    const { effectiveType, downlink } = connection;
    return (effectiveType === '4g' && downlink > 1.5) ? 'fast' : 'slow';
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getRequestCount(): number {
    return performance.getEntriesByType('resource').length;
  }

  private calculateLCPScore(lcp: number | null): number {
    if (!lcp) return 0;
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 50;
    return 0;
  }

  private calculateFIDScore(fid: number | null): number {
    if (!fid) return 100; // No interaction delay is perfect
    if (fid <= 100) return 100;
    if (fid <= 300) return 50;
    return 0;
  }

  private calculateCLSScore(cls: number | null): number {
    if (cls === null) return 100;
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 50;
    return 0;
  }

  private generateRecommendations(report: PerformanceReport): string[] {
    const recommendations = [];
    
    if (report.lcpScore < 50) {
      recommendations.push('Optimize Largest Contentful Paint by compressing images and eliminating render-blocking resources');
    }
    
    if (report.fidScore < 50) {
      recommendations.push('Improve interaction responsiveness by reducing JavaScript execution time');
    }
    
    if (report.clsScore < 50) {
      recommendations.push('Fix layout shifts by setting image dimensions and reserving space for dynamic content');
    }
    
    if (report.totalJSSize > 500000) {
      recommendations.push('Reduce JavaScript bundle size through code splitting and tree shaking');
    }
    
    if (report.totalImageSize > 2000000) {
      recommendations.push('Optimize images with modern formats (WebP, AVIF) and appropriate compression');
    }

    return recommendations;
  }

  private identifyCriticalIssues(report: PerformanceReport): string[] {
    const issues = [];
    
    if (report.lcp && report.lcp > 4000) {
      issues.push(`Critical LCP issue: ${report.lcp}ms (should be < 2500ms)`);
    }
    
    if (report.cls && report.cls > 0.25) {
      issues.push(`Critical CLS issue: ${report.cls} (should be < 0.1)`);
    }
    
    if (report.fid && report.fid > 300) {
      issues.push(`Critical FID issue: ${report.fid}ms (should be < 100ms)`);
    }

    return issues;
  }

  /**
   * Setup real-time performance alerts
   */
  private setupRealTimeAlerts(): void {
    // Performance budget alerts
    this.setupPerformanceBudgets();
    
    // Real-time monitoring
    this.setupRealTimeMonitoring();
  }

  private setupPerformanceBudgets(): void {
    const budgets = {
      totalJSSize: 500000,     // 500KB
      totalCSSSize: 100000,    // 100KB
      totalImageSize: 2000000, // 2MB
      requestCount: 50
    };

    setInterval(() => {
      Object.entries(budgets).forEach(([metric, budget]) => {
        const current = this.metrics.get(metric) || 0;
        if (current > budget) {
          this.triggerAlert(`Budget exceeded: ${metric}`, current, budget);
        }
      });
    }, 10000); // Check every 10 seconds
  }

  private setupRealTimeMonitoring(): void {
    // Monitor performance continuously
    setInterval(() => {
      const report = this.generateReport();
      
      // Check for degraded performance
      if (report.overallScore < 50) {
        this.triggerAlert('Performance Degradation', report.overallScore, 50);
      }
    }, 15000); // Check every 15 seconds
  }

  private triggerAlert(type: string, current: number, threshold: number): void {
    console.warn(`🚨 Performance Alert: ${type} - Current: ${current}, Threshold: ${threshold}`);
    
    // Send alert to analytics
    this.queueAnalyticsData({
      type: 'performance_alert',
      alertType: type,
      current,
      threshold,
      severity: current > threshold * 2 ? 'critical' : 'warning'
    });
  }

  /**
   * Analytics queue management
   */
  private analyticsQueue: any[] = [];

  private queueAnalyticsData(data: any): void {
    this.analyticsQueue.push({
      ...data,
      timestamp: Date.now(),
      page: window.location.pathname
    });

    // Auto-flush if queue gets too large
    if (this.analyticsQueue.length > 50) {
      this.flushAnalyticsQueue();
    }
  }

  private async flushAnalyticsQueue(): Promise<void> {
    if (this.analyticsQueue.length === 0) return;

    const batch = [...this.analyticsQueue];
    this.analyticsQueue = [];

    try {
      // Send to internal analytics API
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true
      });
    } catch (error) {
      console.warn('Failed to send analytics batch:', error);
      // Re-queue failed data (with limit)
      if (this.analyticsQueue.length < 100) {
        this.analyticsQueue.unshift(...batch.slice(-25)); // Keep only recent 25
      }
    }
  }

  /**
   * Utility methods
   */
  private debounce<T extends (...args: any[]) => any>(func: T, wait: number = 250): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Public API
   */
  public getCurrentMetrics(): Map<string, any> {
    return new Map(this.metrics);
  }

  public getLatestReport(): PerformanceReport | null {
    return this.reportQueue[this.reportQueue.length - 1] || null;
  }

  public getAllReports(): PerformanceReport[] {
    return [...this.reportQueue];
  }

  public exportPerformanceData(): object {
    return {
      metrics: Object.fromEntries(this.metrics),
      reports: this.reportQueue,
      analyticsQueue: this.analyticsQueue.slice(-10) // Last 10 events
    };
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
    this.reportQueue = [];
    this.analyticsQueue = [];
    this.isInitialized = false;
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  const monitor = PerformanceMonitor.getInstance();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      monitor.initialize();
    });
  } else {
    monitor.initialize();
  }
  
  // Make available globally for debugging
  (window as any).performanceMonitor = monitor;
}

export default PerformanceMonitor;