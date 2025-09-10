/**
 * Enhanced Core Web Vitals Optimization System
 * Comprehensive performance optimization for fly2any.com
 * Target: 95+ Lighthouse Score, Sub-2.5s LCP, <0.1 CLS
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

export interface EnhancedWebVitalsMetrics {
  fcp: number;
  lcp: number;
  inp: number;
  cls: number;
  ttfb: number;
  timestamp: Date;
  page: string;
  device: 'mobile' | 'desktop';
  connection: 'fast' | 'slow' | 'offline';
  performanceScore: number;
  recommendations: string[];
}

export class EnhancedCoreWebVitalsOptimizer {
  private static instance: EnhancedCoreWebVitalsOptimizer;
  private metrics: EnhancedWebVitalsMetrics[] = [];
  private lcpElements: WeakSet<Element> = new WeakSet();
  private criticalImages: HTMLImageElement[] = [];
  private isInitialized = false;

  static getInstance(): EnhancedCoreWebVitalsOptimizer {
    if (!EnhancedCoreWebVitalsOptimizer.instance) {
      EnhancedCoreWebVitalsOptimizer.instance = new EnhancedCoreWebVitalsOptimizer();
    }
    return EnhancedCoreWebVitalsOptimizer.instance;
  }

  /**
   * Initialize comprehensive performance optimization
   */
  public initializeOptimizations(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    // 1. LCP Optimizations
    this.optimizeLCP();
    
    // 2. CLS Optimizations  
    this.optimizeCLS();
    
    // 3. INP/FID Optimizations
    this.optimizeINP();
    
    // 4. Critical Resource Loading
    this.optimizeCriticalResources();
    
    // 5. Advanced Web Vitals Monitoring
    this.setupAdvancedWebVitalsTracking();
    
    // 6. Font Loading Optimization
    this.optimizeFontLoading();
    
    // 7. Image Loading Optimization
    this.optimizeImageLoading();
    
    // 8. JavaScript Execution Optimization
    this.optimizeJavaScriptExecution();

    console.log('🚀 Enhanced Core Web Vitals Optimizer initialized');
  }

  /**
   * LCP (Largest Contentful Paint) Optimizations
   */
  private optimizeLCP(): void {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize images for LCP
    this.identifyAndOptimizeLCPElements();
    
    // Eliminate render-blocking resources
    this.eliminateRenderBlockingResources();
    
    // Server-side optimizations hints
    this.addServerHints();
  }

  private preloadCriticalResources(): void {
    const criticalResources = [
      { href: '/og-image.webp', as: 'image', type: 'image/webp' },
      { href: '/fly2any-logo.svg', as: 'image', type: 'image/svg+xml' },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', as: 'style' },
      { href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', as: 'style' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.as === 'font') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  private identifyAndOptimizeLCPElements(): void {
    // Use Intersection Observer to identify potential LCP elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          this.lcpElements.add(element);
          
          // If it's an image, optimize it
          if (element instanceof HTMLImageElement) {
            this.optimizeImageForLCP(element);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Observe above-the-fold images and large text blocks
    setTimeout(() => {
      document.querySelectorAll('img, h1, h2, .hero-content, .main-content').forEach(el => {
        observer.observe(el);
      });
    }, 0);
  }

  private optimizeImageForLCP(img: HTMLImageElement): void {
    // Add to critical images list
    this.criticalImages.push(img);
    
    // Set fetchpriority high for LCP candidates
    img.fetchPriority = 'high';
    img.loading = 'eager';
    
    // Add error handling
    img.onerror = () => {
      console.warn(`LCP image failed to load: ${img.src}`);
    };
  }

  private eliminateRenderBlockingResources(): void {
    // Defer non-critical CSS
    const criticalCSS = this.extractCriticalCSS();
    this.inlineCriticalCSS(criticalCSS);
    
    // Defer non-critical JavaScript
    this.deferNonCriticalJS();
  }

  private extractCriticalCSS(): string {
    return `
      /* Critical above-the-fold styles */
      body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; }
      .hero-section { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      .main-header { position: fixed; top: 0; width: 100%; z-index: 1000; background: white; }
      .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
      .btn-primary { background: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer; }
      .text-center { text-align: center; }
      .hidden { display: none !important; }
      
      /* Mobile-first responsive */
      @media (max-width: 768px) {
        .container { padding: 0 0.5rem; }
        .hero-section { padding: 2rem 0; }
      }
    `;
  }

  private inlineCriticalCSS(css: string): void {
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical-css', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  }

  private deferNonCriticalJS(): void {
    // Defer analytics scripts
    const analyticsScripts = document.querySelectorAll('script[src*="gtag"], script[src*="facebook"], script[src*="clarity"]');
    analyticsScripts.forEach((script: any) => {
      if (!script.defer && !script.async) {
        script.defer = true;
      }
    });
  }

  private addServerHints(): void {
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
      { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossOrigin: true },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: true },
    ];

    hints.forEach(hint => {
      const existing = document.querySelector(`link[href="${hint.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossOrigin) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }

  /**
   * CLS (Cumulative Layout Shift) Optimizations
   */
  private optimizeCLS(): void {
    // Reserve space for dynamic content
    this.reserveSpaceForDynamicContent();
    
    // Fix font-related layout shifts
    this.preventFontLayoutShifts();
    
    // Optimize ad and widget loading
    this.optimizeThirdPartyContent();
    
    // Monitor layout shifts in real-time
    this.monitorLayoutShifts();
  }

  private reserveSpaceForDynamicContent(): void {
    // Add placeholder dimensions for images without explicit dimensions
    document.querySelectorAll('img:not([width]):not([height])').forEach((img: any) => {
      // Set aspect ratio to prevent layout shift
      img.style.aspectRatio = '16 / 9'; // Default aspect ratio
      img.loading = 'lazy';
      
      // Set explicit dimensions when image loads
      img.addEventListener('load', () => {
        if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
          img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        }
      });
    });
  }

  private preventFontLayoutShifts(): void {
    // Add font-display: swap to all font faces
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        src: local('Inter');
      }
      @font-face {
        font-family: 'Poppins';
        font-display: swap;
        src: local('Poppins');
      }
    `;
    document.head.appendChild(style);
  }

  private optimizeThirdPartyContent(): void {
    // Defer third-party widgets that might cause layout shifts
    const thirdPartySelectors = [
      'iframe[src*="youtube"]',
      'iframe[src*="facebook"]',
      'iframe[src*="twitter"]',
      '.social-media-widget',
      '.advertisement'
    ];

    thirdPartySelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        const htmlElement = element as HTMLElement;
        // Add placeholder height
        if (!htmlElement.style.height && !htmlElement.getAttribute('height')) {
          htmlElement.style.minHeight = '200px';
        }
      });
    });
  }

  private monitorLayoutShifts(): void {
    if (!PerformanceObserver || !('LayoutShift' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput && entry.value > 0.1) {
          console.warn('Significant CLS detected:', entry.value, entry);
          
          // Report to analytics
          this.reportLayoutShift(entry);
        }
      });
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  }

  private reportLayoutShift(entry: any): void {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'cls_issue', {
        'custom_parameter': entry.value,
        'event_category': 'performance',
        'event_label': window.location.pathname
      });
    }
  }

  /**
   * INP (Interaction to Next Paint) Optimizations
   */
  private optimizeINP(): void {
    // Optimize main thread blocking
    this.optimizeMainThread();
    
    // Implement input response optimization
    this.optimizeInputResponse();
    
    // Defer heavy computations
    this.deferHeavyComputations();
  }

  private optimizeMainThread(): void {
    // Break up long tasks
    this.breakUpLongTasks();
    
    // Use scheduler.postTask when available
    this.useSchedulerAPI();
  }

  private breakUpLongTasks(): void {
    // Implement task scheduler for heavy operations
    const yieldToMain = () => {
      return new Promise(resolve => {
        setTimeout(resolve, 0);
      });
    };

    // Make yieldToMain available globally
    (window as any).yieldToMain = yieldToMain;
  }

  private useSchedulerAPI(): void {
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      const scheduler = (window as any).scheduler;
      
      // Override setTimeout for non-urgent tasks (store original)
      const originalSetTimeout = window.setTimeout;
      const newSetTimeout = (callback: TimerHandler, delay = 0, ...args: any[]): number => {
        if (delay === 0) {
          return scheduler.postTask(callback, { priority: 'background' });
        }
        return originalSetTimeout(callback, delay, ...args) as number;
      };
      
      // Copy properties from original setTimeout to maintain compatibility
      Object.defineProperty(newSetTimeout, '__promisify__', {
        value: originalSetTimeout.__promisify__ || undefined,
        configurable: true
      });
      
      window.setTimeout = newSetTimeout as typeof window.setTimeout;
    }
  }

  private optimizeInputResponse(): void {
    // Debounce input handlers
    this.debounceInputHandlers();
    
    // Optimize form interactions
    this.optimizeFormInteractions();
  }

  private debounceInputHandlers(): void {
    // Add event listener delegation for input events
    document.addEventListener('input', this.debounce((e: Event) => {
      // Handle input events efficiently
      const target = e.target as HTMLInputElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Process input with next frame
        requestAnimationFrame(() => {
          // Input processing logic here
        });
      }
    }, 150), { passive: true });
  }

  private debounce(func: Function, wait: number) {
    let timeout: number;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = window.setTimeout(later, wait);
    };
  }

  private optimizeFormInteractions(): void {
    // Add non-blocking validation
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        // Prevent immediate blocking validation
        e.preventDefault();
        
        // Schedule validation in next frame
        requestIdleCallback(() => {
          // Perform validation
          const isValid = this.validateForm(form);
          if (isValid) {
            form.submit();
          }
        });
      });
    });
  }

  private validateForm(form: HTMLFormElement): boolean {
    // Non-blocking form validation
    return form.checkValidity();
  }

  private deferHeavyComputations(): void {
    // Use requestIdleCallback for heavy operations
    if ('requestIdleCallback' in window) {
      // Move heavy computations to idle time
      this.scheduleIdleWork();
    }
  }

  private scheduleIdleWork(): void {
    const heavyTasks: (() => void)[] = [];
    
    const processIdleTasks = (deadline: IdleDeadline) => {
      while (deadline.timeRemaining() > 0 && heavyTasks.length > 0) {
        const task = heavyTasks.shift();
        if (task) task();
      }
      
      if (heavyTasks.length > 0) {
        requestIdleCallback(processIdleTasks);
      }
    };

    requestIdleCallback(processIdleTasks);
  }

  /**
   * Critical Resource Optimization
   */
  private optimizeCriticalResources(): void {
    // Optimize font loading
    this.optimizeFontLoading();
    
    // Optimize image loading
    this.optimizeImageLoading();
    
    // Optimize CSS delivery
    this.optimizeCSSDelivery();
  }

  private optimizeFontLoading(): void {
    // Preload critical fonts
    const criticalFonts = [
      'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJDUc1NECPY.woff2'
    ];

    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontUrl;
      document.head.appendChild(link);
    });

    // Add font fallbacks
    const fontFallbackCSS = `
      .font-inter { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
      .font-poppins { font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
    `;
    
    const style = document.createElement('style');
    style.textContent = fontFallbackCSS;
    document.head.appendChild(style);
  }

  private optimizeImageLoading(): void {
    // Implement advanced lazy loading
    this.setupAdvancedLazyLoading();
    
    // Add image error handling
    this.addImageErrorHandling();
    
    // Optimize image formats
    this.optimizeImageFormats();
  }

  private setupAdvancedLazyLoading(): void {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  private addImageErrorHandling(): void {
    document.addEventListener('error', (e) => {
      if (e.target instanceof HTMLImageElement) {
        const img = e.target;
        
        // Try WebP fallback
        if (img.src.includes('.avif')) {
          img.src = img.src.replace('.avif', '.webp');
        } else if (img.src.includes('.webp')) {
          img.src = img.src.replace('.webp', '.jpg');
        } else {
          // Set fallback image
          img.src = '/images/fallback.svg';
        }
      }
    }, true);
  }

  private optimizeImageFormats(): void {
    // Check browser support and optimize accordingly
    const supportsAVIF = this.supportsImageFormat('avif');
    const supportsWebP = this.supportsImageFormat('webp');

    document.querySelectorAll('img').forEach((img: HTMLImageElement) => {
      const src = img.src || img.dataset.src;
      if (!src) return;

      let optimizedSrc = src;
      
      if (supportsAVIF && !src.includes('.avif')) {
        optimizedSrc = src.replace(/\.(jpe?g|png)$/i, '.avif');
      } else if (supportsWebP && !src.includes('.webp')) {
        optimizedSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
      }

      if (optimizedSrc !== src) {
        if (img.dataset.src) {
          img.dataset.src = optimizedSrc;
        } else {
          img.src = optimizedSrc;
        }
      }
    });
  }

  private supportsImageFormat(format: string): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL(`image/${format}`).startsWith(`data:image/${format}`);
  }

  private optimizeCSSDelivery(): void {
    // Load non-critical CSS asynchronously
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    nonCriticalCSS.forEach((link: any) => {
      // Load CSS asynchronously
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
    });
  }

  private optimizeJavaScriptExecution(): void {
    // Defer non-critical JavaScript
    document.querySelectorAll('script:not([async]):not([defer])').forEach((script: any) => {
      if (!script.src.includes('critical') && !script.innerHTML.includes('critical')) {
        script.defer = true;
      }
    });
  }

  /**
   * Advanced Web Vitals Tracking
   */
  private setupAdvancedWebVitalsTracking(): void {
    const baseMetric = {
      timestamp: new Date(),
      page: window.location.pathname,
      device: this.getDeviceType(),
      connection: this.getConnectionType(),
      performanceScore: 0,
      recommendations: []
    };

    // Enhanced Web Vitals tracking with context
    onCLS((metric: Metric) => {
      this.recordAdvancedMetric({ ...baseMetric, cls: metric.value });
    });

    onLCP((metric: Metric) => {
      this.recordAdvancedMetric({ ...baseMetric, lcp: metric.value });
    });

    onFCP((metric: Metric) => {
      this.recordAdvancedMetric({ ...baseMetric, fcp: metric.value });
    });

    onINP((metric: Metric) => {
      this.recordAdvancedMetric({ ...baseMetric, inp: metric.value });
    });

    onTTFB((metric: Metric) => {
      this.recordAdvancedMetric({ ...baseMetric, ttfb: metric.value });
    });
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

  private recordAdvancedMetric(metric: Partial<EnhancedWebVitalsMetrics>): void {
    const existingIndex = this.metrics.findIndex(m => 
      m.page === metric.page && m.device === metric.device
    );

    if (existingIndex >= 0) {
      this.metrics[existingIndex] = { ...this.metrics[existingIndex], ...metric };
    } else {
      this.metrics.push(metric as EnhancedWebVitalsMetrics);
    }

    // Calculate performance score and recommendations
    const latestMetric = this.metrics[this.metrics.length - 1];
    latestMetric.performanceScore = this.calculatePerformanceScore(latestMetric);
    latestMetric.recommendations = this.generateRecommendations(latestMetric);

    // Send to analytics
    this.sendToAnalytics(latestMetric);
  }

  private calculatePerformanceScore(metric: EnhancedWebVitalsMetrics): number {
    const scores = {
      fcp: this.scoreFCP(metric.fcp),
      lcp: this.scoreLCP(metric.lcp),
      inp: this.scoreINP(metric.inp),
      cls: this.scoreCLS(metric.cls),
      ttfb: this.scoreTTFB(metric.ttfb)
    };

    return Object.values(scores).reduce((sum, score) => sum + score, 0) / 5;
  }

  private scoreFCP(fcp: number): number {
    if (!fcp) return 0;
    if (fcp <= 1000) return 100;
    if (fcp <= 2500) return 90;
    if (fcp <= 4000) return 50;
    return 0;
  }

  private scoreLCP(lcp: number): number {
    if (!lcp) return 0;
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 50;
    return 0;
  }

  private scoreINP(inp: number): number {
    if (!inp) return 100;
    if (inp <= 200) return 100;
    if (inp <= 500) return 50;
    return 0;
  }

  private scoreCLS(cls: number): number {
    if (cls === undefined || cls === null) return 100;
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 50;
    return 0;
  }

  private scoreTTFB(ttfb: number): number {
    if (!ttfb) return 0;
    if (ttfb <= 200) return 100;
    if (ttfb <= 500) return 90;
    if (ttfb <= 1000) return 50;
    return 0;
  }

  private generateRecommendations(metric: EnhancedWebVitalsMetrics): string[] {
    const recommendations = [];
    
    if (metric.fcp > 2500) {
      recommendations.push('Optimize First Contentful Paint by reducing render-blocking resources');
    }
    if (metric.lcp > 2500) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and critical resources');
    }
    if (metric.inp > 200) {
      recommendations.push('Reduce Interaction to Next Paint by optimizing JavaScript execution');
    }
    if (metric.cls > 0.1) {
      recommendations.push('Fix Cumulative Layout Shift by reserving space for dynamic content');
    }
    if (metric.ttfb > 500) {
      recommendations.push('Improve Time to First Byte with server optimization and CDN');
    }

    return recommendations;
  }

  private async sendToAnalytics(metric: EnhancedWebVitalsMetrics): Promise<void> {
    // Send to Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'web_vitals_enhanced', {
        metric_fcp: metric.fcp,
        metric_lcp: metric.lcp,
        metric_inp: metric.inp,
        metric_cls: metric.cls,
        metric_ttfb: metric.ttfb,
        performance_score: metric.performanceScore,
        device_type: metric.device,
        connection_type: metric.connection,
        page_path: metric.page
      });
    }

    // Send to internal analytics
    try {
      await fetch('/api/analytics/web-vitals-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
        keepalive: true
      });
    } catch (error) {
      console.warn('Failed to send enhanced web vitals:', error);
    }
  }

  /**
   * Public API
   */
  public getLatestMetrics(): EnhancedWebVitalsMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  public getAllMetrics(): EnhancedWebVitalsMetrics[] {
    return [...this.metrics];
  }

  public getPerformanceReport(): {
    score: number;
    grade: string;
    metrics: EnhancedWebVitalsMetrics | null;
    recommendations: string[];
  } {
    const latest = this.getLatestMetrics();
    if (!latest) {
      return { score: 0, grade: 'N/A', metrics: null, recommendations: [] };
    }

    const getGrade = (score: number): string => {
      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    };

    return {
      score: latest.performanceScore,
      grade: getGrade(latest.performanceScore),
      metrics: latest,
      recommendations: latest.recommendations
    };
  }
}

// Initialize on DOM ready
if (typeof window !== 'undefined') {
  const optimizer = EnhancedCoreWebVitalsOptimizer.getInstance();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizer.initializeOptimizations();
    });
  } else {
    optimizer.initializeOptimizations();
  }
  
  // Make available globally for debugging
  (window as any).webVitalsOptimizer = optimizer;
}

export default EnhancedCoreWebVitalsOptimizer;