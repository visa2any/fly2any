/**
 * JavaScript Bundle Optimization for Core Web Vitals
 * Focuses on reducing FID/INP by optimizing bundle size and loading
 */

export interface BundleMetrics {
  size: number;
  loadTime: number;
  parseTime: number;
  executeTime: number;
  chunks: string[];
  timestamp: Date;
}

export class BundleOptimizer {
  private static instance: BundleOptimizer;
  private metrics: BundleMetrics[] = [];
  private criticalChunks: Set<string> = new Set();
  private deferredChunks: Set<string> = new Set();
  private isInitialized = false;

  static getInstance(): BundleOptimizer {
    if (!BundleOptimizer.instance) {
      BundleOptimizer.instance = new BundleOptimizer();
    }
    return BundleOptimizer.instance;
  }

  /**
   * Initialize bundle optimization
   */
  public initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    // 1. Analyze current bundles
    this.analyzeBundles();
    
    // 2. Implement dynamic imports for non-critical code
    this.setupDynamicImports();
    
    // 3. Preload critical chunks
    this.preloadCriticalChunks();
    
    // 4. Setup intelligent prefetching
    this.setupIntelligentPrefetch();
    
    // 5. Monitor bundle performance
    this.monitorBundlePerformance();

    console.log('🎯 Bundle Optimizer initialized');
  }

  /**
   * Analyze current JavaScript bundles
   */
  private analyzeBundles(): void {
    if (!PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.name.includes('.js') && resourceEntry.transferSize > 0) {
          this.recordBundleMetric(resourceEntry);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private recordBundleMetric(entry: PerformanceResourceTiming): void {
    const metric: BundleMetrics = {
      size: entry.transferSize,
      loadTime: entry.responseEnd - entry.fetchStart,
      parseTime: entry.domainLookupEnd - entry.domainLookupStart, // DNS lookup time
      executeTime: entry.responseEnd - entry.responseStart, // Time to receive response body
      chunks: this.extractChunkNames(entry.name),
      timestamp: new Date()
    };

    this.metrics.push(metric);
    
    // Analyze if bundle is too large
    if (metric.size > 250000) { // 250KB threshold
      console.warn(`Large bundle detected: ${entry.name} (${metric.size} bytes)`);
      this.suggestBundleSplitting(entry.name);
    }
  }

  private extractChunkNames(url: string): string[] {
    const match = url.match(/\/([^\/]+)\.js$/);
    return match ? [match[1]] : [];
  }

  private suggestBundleSplitting(bundleUrl: string): void {
    // Report bundle splitting opportunity
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'bundle_optimization_opportunity', {
        'bundle_url': bundleUrl,
        'event_category': 'performance'
      });
    }
  }

  /**
   * Setup dynamic imports for code splitting
   */
  private setupDynamicImports(): void {
    // Create a registry of dynamic imports
    const dynamicImportRegistry = new Map<string, () => Promise<any>>();

    // Register common non-critical modules for dynamic loading
    this.registerDynamicImports(dynamicImportRegistry);

    // Make registry available globally
    (window as any).__dynamicImports = dynamicImportRegistry;
  }

  private registerDynamicImports(registry: Map<string, () => Promise<any>>): void {
    // Register non-critical components for dynamic loading with proper webpack magic comments
    registry.set('chart.js', () => import(/* webpackChunkName: "chart-js" */ 'chart.js'));
    registry.set('recharts', () => import(/* webpackChunkName: "recharts" */ 'recharts'));
    // registry.set('framer-motion', () => import(/* webpackChunkName: "framer-motion" */ 'framer-motion')); // Removed due to Next.js client boundary issue
    registry.set('react-chartjs-2', () => import(/* webpackChunkName: "react-chartjs" */ 'react-chartjs-2'));
    registry.set('@tiptap/react', () => import(/* webpackChunkName: "tiptap" */ '@tiptap/react'));
    registry.set('jspdf', () => import(/* webpackChunkName: "jspdf" */ 'jspdf'));
    registry.set('qrcode', () => import(/* webpackChunkName: "qrcode" */ 'qrcode'));
  }

  /**
   * Preload critical chunks based on current route
   */
  private preloadCriticalChunks(): void {
    const currentPath = window.location.pathname;
    const criticalChunksForRoute = this.getCriticalChunksForRoute(currentPath);

    criticalChunksForRoute.forEach(chunk => {
      this.preloadChunk(chunk);
      this.criticalChunks.add(chunk);
    });
  }

  private getCriticalChunksForRoute(path: string): string[] {
    const routeChunkMap: Record<string, string[]> = {
      '/': ['framework', 'commons', 'main'],
      '/flights': ['framework', 'commons', 'flights'],
      '/hotels': ['framework', 'commons', 'hotels'],
      '/admin': ['framework', 'commons', 'admin'],
      '/admin/email-marketing': ['framework', 'commons', 'admin', 'email-marketing']
    };

    // Find the most specific route match
    const matchingRoute = Object.keys(routeChunkMap)
      .filter(route => path.startsWith(route))
      .sort((a, b) => b.length - a.length)[0];

    return routeChunkMap[matchingRoute] || routeChunkMap['/'];
  }

  private preloadChunk(chunkName: string): void {
    // Create preload link for chunk
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = `/_next/static/chunks/${chunkName}.js`;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  /**
   * Setup intelligent prefetching based on user behavior
   */
  private setupIntelligentPrefetch(): void {
    // Prefetch on hover (for desktop)
    this.setupHoverPrefetch();
    
    // Prefetch on viewport entry (for mobile)
    this.setupViewportPrefetch();
    
    // Prefetch based on user patterns
    this.setupPatternBasedPrefetch();
  }

  private setupHoverPrefetch(): void {
    let hoverTimer: NodeJS.Timeout;
    
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && this.shouldPrefetchRoute(link.pathname)) {
        hoverTimer = setTimeout(() => {
          this.prefetchRouteChunks(link.pathname);
        }, 100); // Small delay to avoid excessive prefetching
      }
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimer);
    });
  }

  private setupViewportPrefetch(): void {
    if (!IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const link = element.querySelector('a[href]') as HTMLAnchorElement;
          
          if (link && this.shouldPrefetchRoute(link.pathname)) {
            this.prefetchRouteChunks(link.pathname);
          }
        }
      });
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });

    // Observe navigation elements
    setTimeout(() => {
      document.querySelectorAll('[data-prefetch-on-view]').forEach(el => {
        observer.observe(el);
      });
    }, 1000);
  }

  private setupPatternBasedPrefetch(): void {
    // Analyze user navigation patterns
    const navigationHistory = this.getNavigationHistory();
    const likelyNextRoutes = this.predictNextRoutes(navigationHistory);

    // Prefetch likely next routes after a delay
    setTimeout(() => {
      likelyNextRoutes.forEach(route => {
        this.prefetchRouteChunks(route);
      });
    }, 2000);
  }

  private getNavigationHistory(): string[] {
    // Get navigation history from sessionStorage
    const history = sessionStorage.getItem('navigation_history');
    return history ? JSON.parse(history) : [];
  }

  private predictNextRoutes(history: string[]): string[] {
    const currentPath = window.location.pathname;
    
    // Simple prediction based on common patterns
    const patterns: Record<string, string[]> = {
      '/': ['/flights', '/hotels', '/admin'],
      '/flights': ['/flights/search', '/flights/results'],
      '/hotels': ['/hotels/search', '/hotels/results'],
      '/admin': ['/admin/leads', '/admin/email-marketing', '/admin/analytics']
    };

    return patterns[currentPath] || [];
  }

  private shouldPrefetchRoute(path: string): boolean {
    // Don't prefetch external links or already prefetched routes
    return path.startsWith('/') && !this.deferredChunks.has(path);
  }

  private prefetchRouteChunks(route: string): void {
    const chunks = this.getCriticalChunksForRoute(route);
    
    chunks.forEach(chunk => {
      if (!this.criticalChunks.has(chunk)) {
        this.prefetchChunk(chunk);
        this.deferredChunks.add(chunk);
      }
    });
  }

  private prefetchChunk(chunkName: string): void {
    // Use prefetch (lower priority than preload)
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/_next/static/chunks/${chunkName}.js`;
    document.head.appendChild(link);
  }

  /**
   * Monitor bundle performance impact
   */
  private monitorBundlePerformance(): void {
    // Track JavaScript execution time
    this.trackJavaScriptExecutionTime();
    
    // Monitor main thread blocking
    this.monitorMainThreadBlocking();
    
    // Track bundle loading errors
    this.trackBundleErrors();
  }

  private trackJavaScriptExecutionTime(): void {
    if (!PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'measure' && entry.name.includes('script')) {
          const executionTime = entry.duration;
          
          if (executionTime > 50) { // Report long tasks
            this.reportLongTask(entry.name, executionTime);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
  }

  private monitorMainThreadBlocking(): void {
    if (!PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 50) { // Long task threshold
          this.reportMainThreadBlocking(entry.duration);
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  private trackBundleErrors(): void {
    window.addEventListener('error', (e) => {
      if (e.filename && e.filename.includes('.js')) {
        this.reportBundleError(e.filename, e.message);
      }
    });
  }

  private reportLongTask(taskName: string, duration: number): void {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'long_javascript_task', {
        'task_name': taskName,
        'duration': Math.round(duration),
        'event_category': 'performance'
      });
    }
  }

  private reportMainThreadBlocking(duration: number): void {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'main_thread_blocking', {
        'duration': Math.round(duration),
        'event_category': 'performance'
      });
    }
  }

  private reportBundleError(filename: string, error: string): void {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'bundle_error', {
        'filename': filename,
        'error_message': error,
        'event_category': 'performance'
      });
    }
  }

  /**
   * Bundle analysis and optimization suggestions
   */
  public getBundleAnalysis(): {
    totalSize: number;
    largestBundles: BundleMetrics[];
    recommendations: string[];
    performance: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  } {
    const totalSize = this.metrics.reduce((sum, metric) => sum + metric.size, 0);
    const largestBundles = this.metrics
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);

    const recommendations = [];
    
    if (totalSize > 500000) { // 500KB total
      recommendations.push('Consider aggressive code splitting - total bundle size exceeds 500KB');
    }
    
    if (largestBundles.some(bundle => bundle.size > 250000)) {
      recommendations.push('Split large bundles into smaller chunks (aim for <250KB per chunk)');
    }
    
    if (this.metrics.some(metric => metric.loadTime > 1000)) {
      recommendations.push('Some bundles are loading slowly - consider CDN or compression');
    }

    let performance: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    if (totalSize < 200000) performance = 'excellent';
    else if (totalSize < 350000) performance = 'good';
    else if (totalSize < 500000) performance = 'needs-improvement';
    else performance = 'poor';

    return {
      totalSize,
      largestBundles,
      recommendations,
      performance
    };
  }

  /**
   * Load mobile-specific components dynamically
   */
  public async loadMobileComponents(): Promise<void> {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    try {
      // Dynamically import mobile-specific components
      const mobileComponents = [
        'touch-interactions',
        'haptic-feedback', 
        'mobile-gestures',
        'viewport-optimization'
      ];

      const loadPromises = mobileComponents.map(async (component) => {
        try {
          // Use the dynamic import registry if available
          const registry = (window as any).__dynamicImports;
          if (registry && registry.has(component)) {
            await registry.get(component)();
          }
        } catch (error) {
          console.warn(`Failed to load mobile component: ${component}`, error);
        }
      });

      await Promise.allSettled(loadPromises);
      
      // Preload mobile-critical resources
      this.preloadMobileCriticalResources();
      
      console.log('📱 Mobile components loaded successfully');
    } catch (error) {
      console.error('Failed to load mobile components:', error);
    }
  }

  /**
   * Setup service worker caching for improved performance
   */
  public setupServiceWorkerCaching(): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker for caching
    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    }).then((registration) => {
      console.log('🔧 Service Worker registered successfully:', registration.scope);
      
      // Setup cache strategies for different resource types
      this.configureCacheStrategies(registration);
      
      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker installed, notify user of update
              this.notifyServiceWorkerUpdate();
            }
          });
        }
      });
      
    }).catch((error) => {
      console.warn('Service Worker registration failed:', error);
    });

    // Setup cache cleanup
    this.setupCacheCleanup();
  }

  private preloadMobileCriticalResources(): void {
    const criticalResources = [
      '/images/hero-mobile.webp',
      '/images/logo-mobile.svg',
      '/icons/icon-192x192.png',
      '/manifest.json'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.includes('.webp') || resource.includes('.svg') || resource.includes('.png')) {
        link.as = 'image';
      } else if (resource.includes('.json')) {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }

  private configureCacheStrategies(registration: ServiceWorkerRegistration): void {
    // Send cache configuration to service worker
    if (registration.active) {
      registration.active.postMessage({
        type: 'CONFIGURE_CACHE',
        strategies: {
          static: {
            pattern: /\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/,
            strategy: 'CacheFirst',
            maxAge: 30 * 24 * 60 * 60 // 30 days
          },
          api: {
            pattern: /\/api\//,
            strategy: 'NetworkFirst',
            maxAge: 5 * 60 // 5 minutes
          },
          pages: {
            pattern: /\.(html|json)$/,
            strategy: 'StaleWhileRevalidate',
            maxAge: 24 * 60 * 60 // 1 day
          }
        }
      });
    }
  }

  private notifyServiceWorkerUpdate(): void {
    // Create a subtle notification for service worker updates
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: opacity 0.3s ease;
    `;
    notification.textContent = 'Nova versão disponível. Recarregue a página.';
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  }

  private setupCacheCleanup(): void {
    // Setup periodic cache cleanup
    if ('caches' in window) {
      setInterval(async () => {
        try {
          const cacheNames = await caches.keys();
          const oldCaches = cacheNames.filter(name => 
            name.includes('old') || name.includes('expired')
          );
          
          await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));
          
          if (oldCaches.length > 0) {
            console.log(`🧹 Cleaned up ${oldCaches.length} old caches`);
          }
        } catch (error) {
          console.warn('Cache cleanup failed:', error);
        }
      }, 60 * 60 * 1000); // Every hour
    }
  }

  /**
   * Public API
   */
  public getMetrics(): BundleMetrics[] {
    return [...this.metrics];
  }

  public getCriticalChunks(): string[] {
    return Array.from(this.criticalChunks);
  }

  public destroy(): void {
    this.metrics = [];
    this.criticalChunks.clear();
    this.deferredChunks.clear();
    this.isInitialized = false;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).bundleOptimizer = BundleOptimizer.getInstance();
}

export default BundleOptimizer;