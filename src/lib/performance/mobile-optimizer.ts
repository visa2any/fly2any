'use client';

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

export interface PerformanceMetrics {
  cls?: number;
  fid?: number;
  fcp?: number;
  lcp?: number;
  ttfb?: number;
  inp?: number;
  timestamp: number;
  pathname: string;
  userAgent?: string;
}

export class MobilePerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Initialize Web Vitals monitoring
    this.initWebVitals();
    
    // Initialize resource monitoring
    this.initResourceMonitoring();
    
    // Initialize network quality monitoring
    this.initNetworkMonitoring();
    
    // Initialize battery optimization
    this.initBatteryOptimization();
    
    // Initialize prefetch strategies
    this.initPrefetchStrategies();
  }

  private initWebVitals() {
    const baseMetric = {
      timestamp: Date.now(),
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    // Core Web Vitals
    onCLS((metric: any) => {
      this.recordMetric({ ...baseMetric, cls: metric.value });
    });

    onLCP((metric: any) => {
      this.recordMetric({ ...baseMetric, lcp: metric.value });
    });

    onFCP((metric: any) => {
      this.recordMetric({ ...baseMetric, fcp: metric.value });
    });

    // Interaction metrics - Note: FID is deprecated in favor of INP in v5
    onINP((metric: any) => {
      this.recordMetric({ ...baseMetric, inp: metric.value });
    });

    onTTFB((metric: any) => {
      this.recordMetric({ ...baseMetric, ttfb: metric.value });
    });
  }

  private initResourceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          this.optimizeResource(entry as PerformanceResourceTiming);
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  private optimizeResource(resource: PerformanceResourceTiming) {
    const { name, transferSize, duration } = resource;
    
    // Log slow resources
    if (duration > 1000) {
      console.warn(`Slow resource detected: ${name} took ${duration}ms`);
      this.sendPerformanceAlert('slow-resource', { name, duration, transferSize });
    }

    // Identify optimization opportunities
    if (name.includes('.js') && transferSize > 100000) {
      console.warn(`Large JavaScript bundle: ${name} (${transferSize} bytes)`);
    }
  }

  private initNetworkMonitoring() {
    if (!('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    if (!connection) return;

    // Adapt behavior based on network conditions
    const networkQuality = this.getNetworkQuality(connection);
    this.adaptToNetworkConditions(networkQuality);

    // Monitor network changes
    connection.addEventListener('change', () => {
      const newQuality = this.getNetworkQuality(connection);
      this.adaptToNetworkConditions(newQuality);
    });
  }

  private getNetworkQuality(connection: any): 'fast' | 'slow' | 'offline' {
    if (!navigator.onLine) return 'offline';
    
    const { effectiveType, downlink, rtt } = connection;
    
    if (effectiveType === '4g' && downlink > 1.5 && rtt < 300) {
      return 'fast';
    }
    
    return 'slow';
  }

  private adaptToNetworkConditions(quality: 'fast' | 'slow' | 'offline') {
    const isSlowNetwork = quality === 'slow' || quality === 'offline';

    // Disable non-critical animations on slow networks
    if (isSlowNetwork) {
      document.body.classList.add('reduced-motion');
      this.disableHeavyAnimations();
    } else {
      document.body.classList.remove('reduced-motion');
    }

    // Adjust image quality
    this.adjustImageQuality(quality);
    
    // Modify prefetch behavior
    this.adjustPrefetchStrategy(quality);
  }

  private disableHeavyAnimations() {
    const style = document.createElement('style');
    style.id = 'performance-optimized-animations';
    style.textContent = `
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      .heavy-animation {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  private adjustImageQuality(quality: 'fast' | 'slow' | 'offline') {
    const images = document.querySelectorAll('img[data-adaptive]');
    images.forEach((img: any) => {
      const baseSrc = img.dataset.src || img.src;
      if (quality === 'slow') {
        img.src = baseSrc.replace(/\.(jpg|jpeg|png)$/, '.webp');
      }
    });
  }

  private adjustPrefetchStrategy(quality: 'fast' | 'slow' | 'offline') {
    const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
    
    if (quality === 'slow' || quality === 'offline') {
      prefetchLinks.forEach((link) => link.remove());
    }
  }

  private initBatteryOptimization() {
    if (!('getBattery' in navigator)) return;

    (navigator as any).getBattery().then((battery: any) => {
      const optimizeForBattery = () => {
        const isLowBattery = battery.level < 0.2;
        const isCharging = battery.charging;

        if (isLowBattery && !isCharging) {
          this.enableBatterySaveMode();
        } else {
          this.disableBatterySaveMode();
        }
      };

      battery.addEventListener('levelchange', optimizeForBattery);
      battery.addEventListener('chargingchange', optimizeForBattery);
      optimizeForBattery();
    });
  }

  private enableBatterySaveMode() {
    document.body.classList.add('battery-save-mode');
    
    // Reduce refresh rates
    this.reduceAnimationFrameRate();
    
    // Disable non-essential features
    this.disableNonEssentialFeatures();
  }

  private disableBatterySaveMode() {
    document.body.classList.remove('battery-save-mode');
  }

  private reduceAnimationFrameRate() {
    // Implement frame rate throttling for animations
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    let lastTime = 0;
    
    window.requestAnimationFrame = (callback) => {
      const now = Date.now();
      const nextTime = Math.max(lastTime + 32, now); // 30fps instead of 60fps
      
      return originalRequestAnimationFrame(() => {
        lastTime = nextTime;
        callback(now);
      });
    };
  }

  private disableNonEssentialFeatures() {
    // Disable background video autoplay
    const videos = document.querySelectorAll('video[autoplay]');
    videos.forEach((video: any) => {
      video.autoplay = false;
      video.pause();
    });
  }

  private initPrefetchStrategies() {
    // Intelligent prefetching based on user behavior
    this.setupIntersectionObserver();
    this.setupHoverPrefetch();
    this.setupRoutePrefetch();
  }

  private setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          this.handleElementVisible(element);
        }
      });
    }, { rootMargin: '50px' });

    // Observe critical elements
    setTimeout(() => {
      const criticalElements = document.querySelectorAll('[data-prefetch-on-view]');
      criticalElements.forEach((el) => observer.observe(el));
    }, 1000);
  }

  private handleElementVisible(element: HTMLElement) {
    const prefetchUrl = element.dataset.prefetchUrl;
    if (prefetchUrl) {
      this.prefetchResource(prefetchUrl);
    }
  }

  private setupHoverPrefetch() {
    let hoverTimeout: NodeJS.Timeout;

    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.hostname === window.location.hostname) {
        hoverTimeout = setTimeout(() => {
          this.prefetchResource(link.href);
        }, 100);
      }
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    });
  }

  private setupRoutePrefetch() {
    // Prefetch likely next routes based on current page
    const currentPath = window.location.pathname;
    const likePrefetches = this.getLikelyRoutes(currentPath);
    
    likePrefetches.forEach((route) => {
      setTimeout(() => this.prefetchResource(route), 2000);
    });
  }

  private getLikelyRoutes(currentPath: string): string[] {
    const routes: Record<string, string[]> = {
      '/': ['/flights', '/hotels'],
      '/flights': ['/flights/search', '/flights/results'],
      '/hotels': ['/hotels/search']
    };

    return routes[currentPath] || [];
  }

  public prefetchResource(url: string) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Send to analytics if metric is concerning
    this.evaluateMetric(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  private evaluateMetric(metric: PerformanceMetrics) {
    // LCP should be under 2.5s
    if (metric.lcp && metric.lcp > 2500) {
      this.sendPerformanceAlert('poor-lcp', { value: metric.lcp });
    }

    // CLS should be under 0.1
    if (metric.cls && metric.cls > 0.1) {
      this.sendPerformanceAlert('poor-cls', { value: metric.cls });
    }

    // INP should be under 200ms
    if (metric.inp && metric.inp > 200) {
      this.sendPerformanceAlert('poor-inp', { value: metric.inp });
    }
  }

  private sendPerformanceAlert(type: string, data: any) {
    // Send to analytics service
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.sendBeacon) {
      const payload = JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      navigator.sendBeacon('/api/performance-alerts', payload);
    }
  }

  // Critical CSS inlining
  public inlineCriticalCSS() {
    const criticalCSS = `
      /* Critical mobile styles */
      body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
      .mobile-container { width: 100%; overflow-x: hidden; }
      .mobile-header-fixed { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
      .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
      @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  // Resource hints
  public addResourceHints() {
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//api.fly2any.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    ];

    hints.forEach(({ rel, href, crossorigin }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (crossorigin) link.crossOrigin = crossorigin;
      document.head.appendChild(link);
    });
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
  }
}

export const mobileOptimizer = new MobilePerformanceOptimizer();