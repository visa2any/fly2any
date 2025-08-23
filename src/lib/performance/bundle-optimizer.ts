'use client';

export interface BundleConfig {
  mobile: {
    chunks: string[];
    priority: 'high' | 'medium' | 'low';
  };
  desktop: {
    chunks: string[];
    priority: 'high' | 'medium' | 'low';
  };
}

export class BundleOptimizer {
  private loadedChunks = new Set<string>();
  private pendingChunks = new Map<string, Promise<any>>();
  private isMobile = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectDevice();
    }
  }

  private detectDevice() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
  }

  // Dynamic imports for mobile-specific features
  public async loadMobileComponents() {
    if (!this.isMobile) return;

    const components = await Promise.allSettled([
      this.loadChunk('mobile-gestures'),
      this.loadChunk('mobile-interactions'),
      this.loadChunk('mobile-animations'),
    ]);

    return components;
  }

  // Load critical chunks first
  public async loadCriticalChunks() {
    const criticalChunks = this.isMobile 
      ? ['mobile-header', 'mobile-forms', 'touch-handlers']
      : ['desktop-header', 'desktop-forms', 'mouse-handlers'];

    return Promise.all(
      criticalChunks.map(chunk => this.loadChunk(chunk, 'high'))
    );
  }

  // Load chunks based on route
  public async loadRouteChunks(route: string) {
    const routeChunks = this.getRouteChunks(route);
    
    return Promise.all(
      routeChunks.map(chunk => this.loadChunk(chunk, 'medium'))
    );
  }

  private getRouteChunks(route: string): string[] {
    const routeMap: Record<string, string[]> = {
      '/': ['homepage', 'search-form'],
      '/flights': ['flight-search', 'flight-results'],
      '/hotels': ['hotel-search', 'hotel-results'],
      '/admin': ['admin-dashboard', 'admin-forms'],
    };

    return routeMap[route] || [];
  }

  private async loadChunk(chunkName: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<any> {
    if (this.loadedChunks.has(chunkName)) {
      return Promise.resolve();
    }

    if (this.pendingChunks.has(chunkName)) {
      return this.pendingChunks.get(chunkName);
    }

    const loadPromise = this.importChunk(chunkName, priority);
    this.pendingChunks.set(chunkName, loadPromise);

    try {
      const module = await loadPromise;
      this.loadedChunks.add(chunkName);
      this.pendingChunks.delete(chunkName);
      return module;
    } catch (error) {
      this.pendingChunks.delete(chunkName);
      console.warn(`Failed to load chunk: ${chunkName}`, error);
      throw error;
    }
  }

  private async importChunk(chunkName: string, priority: 'high' | 'medium' | 'low'): Promise<any> {
    // Delay loading based on priority
    if (priority === 'low') {
      await this.delay(1000);
    } else if (priority === 'medium') {
      await this.delay(100);
    }

    switch (chunkName) {
      case 'mobile-gestures':
        return import('@/lib/mobile/touch-handlers');
      case 'mobile-interactions':
        return import('@/components/mobile/MicroInteractions');
      case 'mobile-animations':
        return import('@/hooks/useAnimations');
      case 'mobile-header':
        return import('@/components/MobileHeader');
      case 'mobile-forms':
        return import('@/components/forms/MobileOptimizedFormUX');
      case 'touch-handlers':
        return import('@/lib/mobile/touch-handlers');
      case 'flight-search':
        return import('@/components/flights/FlightSearchForm');
      case 'flight-results':
        return import('@/components/flights/FlightResultsList');
      case 'hotel-search':
        return import('@/components/hotels/HotelSearchForm');
      case 'hotel-results':
        return import('@/components/hotels/HotelResultsList');
      default:
        throw new Error(`Unknown chunk: ${chunkName}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Preload chunks based on user interaction patterns
  public preloadLikelyChunks(currentRoute: string) {
    const likelyRoutes = this.getLikelyNextRoutes(currentRoute);
    
    // Preload with low priority to avoid blocking current page
    likelyRoutes.forEach(route => {
      const chunks = this.getRouteChunks(route);
      chunks.forEach(chunk => {
        setTimeout(() => this.loadChunk(chunk, 'low'), 2000);
      });
    });
  }

  private getLikelyNextRoutes(currentRoute: string): string[] {
    const routeFlow: Record<string, string[]> = {
      '/': ['/flights', '/hotels'],
      '/flights': ['/flights/results', '/flights/booking'],
      '/hotels': ['/hotels/results', '/hotels/booking'],
    };

    return routeFlow[currentRoute] || [];
  }

  // Service worker cache strategies
  public setupServiceWorkerCaching() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(registration => {
      // Send cache strategies to service worker
      registration.active?.postMessage({
        type: 'CACHE_STRATEGY',
        data: {
          critical: ['/', '/flights', '/hotels'],
          preload: ['/api/flights/popular', '/api/hotels/popular'],
          mobile: this.isMobile,
        }
      });
    });
  }

  // Code splitting for third-party libraries
  public async loadThirdPartyLibs(libraries: string[]) {
    const libPromises = libraries.map(lib => this.loadLibrary(lib));
    return Promise.allSettled(libPromises);
  }

  private async loadLibrary(lib: string): Promise<any> {
    switch (lib) {
      case 'framer-motion':
        return this.isMobile ? null : import('framer-motion');
      case 'chart-js':
        return import('chart.js');
      case 'date-fns':
        return import('date-fns');
      default:
        throw new Error(`Unknown library: ${lib}`);
    }
  }

  // Tree shaking analysis
  public analyzeUnusedCode() {
    if (process.env.NODE_ENV !== 'development') return;

    // Analyze loaded modules
    const performance = window.performance;
    const resources = performance.getEntriesByType('resource');
    
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && resource.transferSize > 0
    );

    console.group('Bundle Analysis');
    jsResources.forEach(resource => {
      console.log(`${resource.name}: ${resource.transferSize} bytes`);
    });
    console.groupEnd();
  }

  // Webpack bundle analysis integration
  public setupBundleAnalysis() {
    if (process.env.NODE_ENV !== 'production') return;

    // Report bundle metrics to analytics
    const bundleMetrics = {
      totalSize: this.calculateTotalBundleSize(),
      criticalChunks: Array.from(this.loadedChunks),
      userAgent: navigator.userAgent,
      isMobile: this.isMobile,
    };

    this.reportBundleMetrics(bundleMetrics);
  }

  private calculateTotalBundleSize(): number {
    const resources = performance.getEntriesByType('resource');
    return resources
      .filter(r => r.name.includes('.js'))
      .reduce((total, r) => total + (r.transferSize || 0), 0);
  }

  private reportBundleMetrics(metrics: any) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/bundle', JSON.stringify(metrics));
    }
  }

  public getLoadedChunks(): string[] {
    return Array.from(this.loadedChunks);
  }

  public destroy() {
    this.loadedChunks.clear();
    this.pendingChunks.clear();
  }
}

export const bundleOptimizer = new BundleOptimizer();