/**
 * Next.js Enterprise Diagnostics System
 * Monitors and reports Next.js internal errors, webpack issues, and devtools problems
 */

interface DiagnosticReport {
  timestamp: string;
  environment: string;
  nextjsVersion: string;
  reactVersion: string;
  nodeVersion: string;
  buildId?: string;
  errors: DiagnosticError[];
  warnings: DiagnosticWarning[];
  performance: PerformanceMetrics;
  webpackInfo: WebpackInfo;
  hydrationInfo: HydrationInfo;
}

interface DiagnosticError {
  id: string;
  type: 'webpack' | 'next-dev-tools' | 'hydration' | 'runtime' | 'build';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

interface DiagnosticWarning {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

interface PerformanceMetrics {
  pageLoadTime?: number;
  domContentLoaded?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

interface WebpackInfo {
  hmrStatus: string;
  moduleCount: number;
  compilationErrors: string[];
  compilationWarnings: string[];
  devtoolsConnected: boolean;
}

interface HydrationInfo {
  hydrationErrors: string[];
  mismatchedElements: number;
  hydrationTime?: number;
  successful: boolean;
}

class NextJSDiagnostics {
  private errors: DiagnosticError[] = [];
  private warnings: DiagnosticWarning[] = [];
  private isInitialized = false;
  private reportingEndpoint = '/api/diagnostics';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) return;
    
    console.log('🔬 Next.js Diagnostics System Initializing...');
    
    // Monitor console errors
    this.setupConsoleMonitoring();
    
    // Monitor webpack HMR
    this.setupWebpackMonitoring();
    
    // Monitor hydration issues
    this.setupHydrationMonitoring();
    
    // Monitor runtime errors
    this.setupRuntimeErrorMonitoring();
    
    // Monitor performance
    this.setupPerformanceMonitoring();
    
    // Auto-generate reports
    this.setupReporting();
    
    this.isInitialized = true;
    console.log('✅ Next.js Diagnostics System Initialized');
  }

  private setupConsoleMonitoring() {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Override console.error to catch Next.js internal errors
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Detect Next.js dev tools errors
      if (message.includes('next-dev-tools') || message.includes('webpack-internal')) {
        this.addError({
          type: 'next-dev-tools',
          message: message,
          severity: 'medium',
          context: { args }
        });
      }
      
      // Detect webpack errors
      if (message.includes('webpack') || message.includes('HMR') || message.includes('hot update')) {
        this.addError({
          type: 'webpack',
          message: message,
          severity: 'high',
          context: { args }
        });
      }
      
      // Detect hydration errors
      if (message.includes('hydrat') || message.includes('mismatch')) {
        this.addError({
          type: 'hydration',
          message: message,
          severity: 'high',
          context: { args }
        });
      }
      
      originalError.apply(console, args);
    };

    // Override console.warn for warnings
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      if (message.includes('next') || message.includes('react')) {
        this.addWarning({
          type: 'next-warning',
          message: message,
          context: { args }
        });
      }
      
      originalWarn.apply(console, args);
    };
  }

  private setupWebpackMonitoring() {
    // Check for webpack hot module replacement
    if (typeof window !== 'undefined' && (window as any).__webpack_require__) {
      console.log('📦 Webpack detected - setting up HMR monitoring');
      
      // Monitor webpack module status
      if ((window as any).module?.hot) {
        (window as any).module.hot.addStatusHandler((status: string) => {
          console.log(`🔄 Webpack HMR Status: ${status}`);
          
          if (status === 'fail') {
            this.addError({
              type: 'webpack',
              message: 'Webpack HMR failed',
              severity: 'high',
              context: { hmrStatus: status }
            });
          }
        });
      }
    }
  }

  private setupHydrationMonitoring() {
    // Monitor for hydration completion
    let hydrationStartTime = performance.now();
    
    // Check for React DevTools
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('⚛️ React DevTools detected');
    }
    
    // Monitor DOM changes that might indicate hydration issues
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check for hydration error markers
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                const element = node as Element;
                if (element.textContent?.includes('Hydration failed') || 
                    element.textContent?.includes('server-side HTML')) {
                  this.addError({
                    type: 'hydration',
                    message: 'Hydration mismatch detected in DOM',
                    severity: 'critical',
                    context: { 
                      elementText: element.textContent?.substring(0, 200),
                      tagName: element.tagName
                    }
                  });
                }
              }
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      // Stop observing after hydration period
      setTimeout(() => {
        observer.disconnect();
        const hydrationTime = performance.now() - hydrationStartTime;
        console.log(`⚛️ Hydration monitoring completed in ${hydrationTime.toFixed(2)}ms`);
      }, 5000);
    }
  }

  private setupRuntimeErrorMonitoring() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.addError({
        type: 'runtime',
        message: event.error?.message || event.message,
        stack: event.error?.stack,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        severity: 'high',
        context: {
          errorEvent: {
            type: event.type,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.addError({
        type: 'runtime',
        message: `Unhandled promise rejection: ${event.reason}`,
        severity: 'high',
        context: {
          reason: event.reason,
          promise: event.promise
        }
      });
    });
  }

  private setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if (typeof PerformanceObserver !== 'undefined') {
      // First Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const paintTiming = entry as PerformancePaintTiming;
          console.log(`📊 ${entry.name}: ${(entry as any).value || paintTiming.startTime}ms`);
        });
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcpEntry = lastEntry as any;
        console.log(`📊 LCP: ${lcpEntry.renderTime || lcpEntry.loadTime || lcpEntry.startTime}ms`);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private setupReporting() {
    // Generate diagnostic report every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        if (this.errors.length > 0 || this.warnings.length > 0) {
          this.generateReport();
        }
      }, 30000);
    }

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      if (this.errors.length > 0) {
        this.generateReport(true);
      }
    });
  }

  private addError(errorData: Omit<DiagnosticError, 'id' | 'timestamp'>) {
    const error: DiagnosticError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...errorData
    };
    
    this.errors.push(error);
    console.group(`🚨 Diagnostic Error - ${error.type.toUpperCase()}`);
    console.error('Error:', error.message);
    console.error('Context:', error.context);
    console.groupEnd();
    
    // Immediate report for critical errors
    if (error.severity === 'critical') {
      this.generateReport(false, [error]);
    }
  }

  private addWarning(warningData: Omit<DiagnosticWarning, 'id' | 'timestamp'>) {
    const warning: DiagnosticWarning = {
      id: `warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...warningData
    };
    
    this.warnings.push(warning);
    console.warn(`⚠️ Diagnostic Warning - ${warning.type}:`, warning.message);
  }

  public generateReport(immediate = false, specificErrors?: DiagnosticError[]): DiagnosticReport {
    const report: DiagnosticReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      nextjsVersion: this.getNextJSVersion(),
      reactVersion: this.getReactVersion(),
      nodeVersion: process.env.NODE_VERSION || 'unknown',
      buildId: this.getBuildId(),
      errors: specificErrors || this.errors,
      warnings: this.warnings,
      performance: this.getPerformanceMetrics(),
      webpackInfo: this.getWebpackInfo(),
      hydrationInfo: this.getHydrationInfo()
    };

    console.group('📋 Next.js Diagnostic Report');
    console.log('Report:', report);
    console.groupEnd();

    if (immediate || process.env.NODE_ENV === 'production') {
      this.sendReport(report);
    }

    // Store report locally
    this.storeReport(report);

    return report;
  }

  private getNextJSVersion(): string {
    try {
      return (window as any).__NEXT_DATA__?.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private getReactVersion(): string {
    try {
      return (window as any).React?.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private getBuildId(): string | undefined {
    try {
      return (window as any).__NEXT_DATA__?.buildId;
    } catch {
      return undefined;
    }
  }

  private getPerformanceMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {};

    if (typeof performance !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      }

      // Memory usage (Chrome only)
      if ((performance as any).memory) {
        metrics.memoryUsage = {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        };
      }
    }

    return metrics;
  }

  private getWebpackInfo(): WebpackInfo {
    const info: WebpackInfo = {
      hmrStatus: 'unknown',
      moduleCount: 0,
      compilationErrors: [],
      compilationWarnings: [],
      devtoolsConnected: false
    };

    if (typeof window !== 'undefined') {
      // Check webpack
      if ((window as any).__webpack_require__) {
        info.hmrStatus = (window as any).module?.hot?.status() || 'no-hmr';
        
        // Count modules
        try {
          const cache = (window as any).__webpack_require__.cache;
          if (cache) {
            info.moduleCount = Object.keys(cache).length;
          }
        } catch {}
      }

      // Check React DevTools
      info.devtoolsConnected = !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    }

    return info;
  }

  private getHydrationInfo(): HydrationInfo {
    const info: HydrationInfo = {
      hydrationErrors: [],
      mismatchedElements: 0,
      successful: true
    };

    // Check for hydration-related errors in our error list
    const hydrationErrors = this.errors.filter(error => error.type === 'hydration');
    info.hydrationErrors = hydrationErrors.map(error => error.message);
    info.successful = hydrationErrors.length === 0;

    return info;
  }

  private async sendReport(report: DiagnosticReport) {
    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.warn('Failed to send diagnostic report:', error);
    }
  }

  private storeReport(report: DiagnosticReport) {
    try {
      const reports = JSON.parse(localStorage.getItem('nextjs_diagnostic_reports') || '[]');
      reports.push(report);
      // Keep only last 5 reports
      const recentReports = reports.slice(-5);
      localStorage.setItem('nextjs_diagnostic_reports', JSON.stringify(recentReports));
    } catch (error) {
      console.warn('Failed to store diagnostic report:', error);
    }
  }

  public getStoredReports(): DiagnosticReport[] {
    try {
      return JSON.parse(localStorage.getItem('nextjs_diagnostic_reports') || '[]');
    } catch {
      return [];
    }
  }

  public clearStoredReports() {
    localStorage.removeItem('nextjs_diagnostic_reports');
    this.errors = [];
    this.warnings = [];
  }
}

// Singleton instance
let diagnostics: NextJSDiagnostics | null = null;

export function initDiagnostics(): NextJSDiagnostics {
  if (!diagnostics && typeof window !== 'undefined') {
    diagnostics = new NextJSDiagnostics();
  }
  return diagnostics!;
}

export function getDiagnostics(): NextJSDiagnostics | null {
  return diagnostics;
}

export type {
  DiagnosticReport,
  DiagnosticError,
  DiagnosticWarning,
  PerformanceMetrics,
  WebpackInfo,
  HydrationInfo
};