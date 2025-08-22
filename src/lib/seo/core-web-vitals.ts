/**
 * Core Web Vitals Optimization System
 * Target: 95+ Lighthouse Score, <1s FCP, <2.5s LCP
 */

export interface WebVitalsMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  timestamp: Date;
  page: string;
  device: 'mobile' | 'desktop';
}

export class CoreWebVitalsOptimizer {
  private static instance: CoreWebVitalsOptimizer;
  private metrics: WebVitalsMetrics[] = [];

  static getInstance(): CoreWebVitalsOptimizer {
    if (!CoreWebVitalsOptimizer.instance) {
      CoreWebVitalsOptimizer.instance = new CoreWebVitalsOptimizer();
    }
    return CoreWebVitalsOptimizer.instance;
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Web Vitals monitoring
    this.setupWebVitalsTracking();
    
    // Resource hint injection
    this.injectResourceHints();
    
    // Lazy loading optimization
    this.optimizeLazyLoading();
    
    // Critical CSS extraction
    this.extractCriticalCSS();
  }

  private setupWebVitalsTracking(): void {
    // First Contentful Paint (FCP)
    this.measureFCP();
    
    // Largest Contentful Paint (LCP)
    this.measureLCP();
    
    // First Input Delay (FID)
    this.measureFID();
    
    // Cumulative Layout Shift (CLS)
    this.measureCLS();
    
    // Time to First Byte (TTFB)
    this.measureTTFB();
  }

  private measureFCP(): void {
    if (!window.PerformanceObserver) return;

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('fcp', entry.startTime);
        }
      }
    }).observe({ type: 'paint', buffered: true });
  }

  private measureLCP(): void {
    if (!window.PerformanceObserver) return;

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('lcp', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }

  private measureFID(): void {
    if (!window.PerformanceObserver) return;

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('fid', (entry as any).processingStart - entry.startTime);
      }
    }).observe({ type: 'first-input', buffered: true });
  }

  private measureCLS(): void {
    if (!window.PerformanceObserver) return;

    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordMetric('cls', clsValue);
    }).observe({ type: 'layout-shift', buffered: true });
  }

  private measureTTFB(): void {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.fetchStart;
      this.recordMetric('ttfb', ttfb);
    }
  }

  private recordMetric(metric: keyof WebVitalsMetrics, value: number): void {
    const existingMetric = this.metrics.find(m => 
      m.page === window.location.pathname && 
      m.device === this.getDeviceType()
    );

    if (existingMetric) {
      (existingMetric as any)[metric] = value;
    } else {
      this.metrics.push({
        fcp: metric === 'fcp' ? value : 0,
        lcp: metric === 'lcp' ? value : 0,
        fid: metric === 'fid' ? value : 0,
        cls: metric === 'cls' ? value : 0,
        ttfb: metric === 'ttfb' ? value : 0,
        timestamp: new Date(),
        page: window.location.pathname,
        device: this.getDeviceType()
      });
    }

    // Send to analytics
    this.sendMetricsToAnalytics();
  }

  private getDeviceType(): 'mobile' | 'desktop' {
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  }

  /**
   * Inject critical resource hints
   */
  private injectResourceHints(): void {
    const head = document.head;

    // DNS prefetch for external domains
    const dnsPrefetch = [
      'https://www.googletagmanager.com',
      'https://connect.facebook.net',
      'https://www.clarity.ms',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    dnsPrefetch.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      head.appendChild(link);
    });

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter.woff2',
      '/fonts/poppins.woff2'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = font;
      head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      '/og-image.webp',
      '/fly2any-logo.png'
    ];

    criticalImages.forEach(image => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = image;
      head.appendChild(link);
    });
  }

  /**
   * Advanced lazy loading with intersection observer
   */
  private optimizeLazyLoading(): void {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
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

  /**
   * Extract and inline critical CSS
   */
  private extractCriticalCSS(): void {
    const criticalCSS = `
      /* Critical CSS for above-the-fold content */
      .hero-section { 
        display: block; 
        min-height: 100vh; 
        background: linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%);
      }
      .mobile-container { 
        max-width: 1280px; 
        margin: 0 auto; 
        padding: 0 24px; 
      }
      @media (max-width: 768px) {
        .mobile-container { padding: 0 16px; }
        .mobile-section { margin-bottom: 24px !important; }
      }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }

  /**
   * Send metrics to analytics
   */
  private async sendMetricsToAnalytics(): Promise<void> {
    const latestMetric = this.metrics[this.metrics.length - 1];
    
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'web_vitals', {
        'metric_fcp': latestMetric.fcp,
        'metric_lcp': latestMetric.lcp,
        'metric_fid': latestMetric.fid,
        'metric_cls': latestMetric.cls,
        'metric_ttfb': latestMetric.ttfb,
        'page_path': latestMetric.page,
        'device_type': latestMetric.device
      });
    }

    // Send to internal analytics
    try {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latestMetric)
      });
    } catch (error) {
      console.warn('Failed to send web vitals to analytics:', error);
    }
  }

  /**
   * Get performance score
   */
  getPerformanceScore(): { score: number; details: any } {
    const latestMetric = this.metrics[this.metrics.length - 1];
    if (!latestMetric) return { score: 0, details: {} };

    const scores = {
      fcp: this.scoreFCP(latestMetric.fcp),
      lcp: this.scoreLCP(latestMetric.lcp),
      fid: this.scoreFID(latestMetric.fid),
      cls: this.scoreCLS(latestMetric.cls),
      ttfb: this.scoreTTFB(latestMetric.ttfb)
    };

    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 5;

    return {
      score: Math.round(overallScore),
      details: {
        metrics: latestMetric,
        scores,
        recommendations: this.getRecommendations(scores)
      }
    };
  }

  private scoreFCP(fcp: number): number {
    if (fcp <= 1000) return 100;
    if (fcp <= 2500) return 90;
    if (fcp <= 4000) return 50;
    return 0;
  }

  private scoreLCP(lcp: number): number {
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 50;
    return 0;
  }

  private scoreFID(fid: number): number {
    if (fid <= 100) return 100;
    if (fid <= 300) return 50;
    return 0;
  }

  private scoreCLS(cls: number): number {
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 50;
    return 0;
  }

  private scoreTTFB(ttfb: number): number {
    if (ttfb <= 200) return 100;
    if (ttfb <= 500) return 90;
    if (ttfb <= 1000) return 50;
    return 0;
  }

  private getRecommendations(scores: any): string[] {
    const recommendations = [];
    
    if (scores.fcp < 90) recommendations.push('Optimize First Contentful Paint by reducing render-blocking resources');
    if (scores.lcp < 90) recommendations.push('Improve Largest Contentful Paint by optimizing images and fonts');
    if (scores.fid < 90) recommendations.push('Reduce First Input Delay by minimizing JavaScript execution');
    if (scores.cls < 90) recommendations.push('Fix Cumulative Layout Shift by specifying image dimensions');
    if (scores.ttfb < 90) recommendations.push('Improve server response time and use CDN');

    return recommendations;
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    CoreWebVitalsOptimizer.getInstance().initializePerformanceMonitoring();
  });
}

export default CoreWebVitalsOptimizer;