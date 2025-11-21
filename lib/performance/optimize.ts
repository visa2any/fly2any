/**
 * PERFORMANCE OPTIMIZATION UTILITIES
 *
 * Tools to improve Core Web Vitals and overall performance
 * - Image optimization helpers
 * - Script loading optimization
 * - Resource prioritization
 * - Performance monitoring
 *
 * @version 1.0.0
 */

/**
 * Preload critical resources
 * Call this in your layout or page component
 */
export function preloadCriticalResources(resources: Array<{
  href: string;
  as: 'script' | 'style' | 'font' | 'image';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}>) {
  if (typeof document === 'undefined') return;

  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
    document.head.appendChild(link);
  });
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImages(selector: string = 'img[data-src]') {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll(selector);

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

/**
 * Defer non-critical scripts
 */
export function deferNonCriticalScripts() {
  if (typeof document === 'undefined') return;

  const scripts = document.querySelectorAll('script[data-defer]');
  scripts.forEach(script => {
    const newScript = document.createElement('script');
    newScript.src = script.getAttribute('src') || '';
    newScript.defer = true;
    script.parentNode?.replaceChild(newScript, script);
  });
}

/**
 * Optimize font loading
 */
export function optimizeFontLoading() {
  if (typeof document === 'undefined') return;

  // Use font-display: swap for all custom fonts
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Measure Core Web Vitals
 */
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Send to analytics in production
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Send to custom endpoint
  if (process.env.NODE_ENV === 'production') {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Use sendBeacon if available, fallback to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/web-vitals', body);
    } else {
      fetch('/api/analytics/web-vitals', {
        body,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(console.error);
    }
  }
}

/**
 * Image optimization helpers
 */
export const ImageOptimization = {
  /**
   * Get optimized image URL with Vercel Image Optimization
   */
  getOptimizedUrl(src: string, width: number, quality: number = 75): string {
    if (!src) return '';

    // If already using next/image optimization, return as is
    if (src.includes('/_next/image')) return src;

    // Build optimized URL
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: quality.toString(),
    });

    return `/_next/image?${params.toString()}`;
  },

  /**
   * Get responsive srcset
   */
  getSrcSet(src: string, widths: number[] = [640, 750, 828, 1080, 1200, 1920]): string {
    return widths
      .map(width => `${this.getOptimizedUrl(src, width)} ${width}w`)
      .join(', ');
  },

  /**
   * Get blur data URL for placeholder
   */
  getBlurDataUrl(width: number = 10, height: number = 10): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#e5e7eb');
      gradient.addColorStop(1, '#d1d5db');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL();
  },
};

/**
 * Resource hints for critical third-party resources
 */
export const ResourceHints = {
  /**
   * DNS prefetch for third-party domains
   */
  dnsPrefetch: [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://assets.duffel.com',
    'https://api.amadeus.com',
  ],

  /**
   * Preconnect for critical third-party domains
   */
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],

  /**
   * Prefetch for likely next navigations
   */
  prefetch: [
    '/flights',
    '/hotels',
    '/deals',
  ],
};

/**
 * Performance budget checker
 */
export const PerformanceBudget = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 600, // Time to First Byte (ms)

  /**
   * Check if metric is within budget
   */
  isWithinBudget(metric: WebVitalsMetric): boolean {
    const budgets: Record<string, number> = {
      LCP: this.LCP,
      FID: this.FID,
      CLS: this.CLS,
      FCP: this.FCP,
      TTFB: this.TTFB,
    };

    const budget = budgets[metric.name];
    return budget ? metric.value <= budget : true;
  },

  /**
   * Get rating for metric
   */
  getRating(metric: WebVitalsMetric): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 600, poor: 1500 },
    };

    const threshold = thresholds[metric.name];
    if (!threshold) return 'good';

    if (metric.value <= threshold.good) return 'good';
    if (metric.value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  },
};

/**
 * Critical CSS inlining helper
 */
export function inlineCriticalCSS(css: string) {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
}

/**
 * Service Worker registration for caching
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

/**
 * Prefetch routes on hover
 */
export function prefetchOnHover(selector: string = 'a[href^="/"]') {
  if (typeof document === 'undefined') return;

  const links = document.querySelectorAll(selector);
  const prefetched = new Set<string>();

  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      if (!href || prefetched.has(href)) return;

      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = href;
      document.head.appendChild(prefetchLink);
      prefetched.add(href);
    }, { once: true });
  });
}

/**
 * Example usage in _app or layout:
 *
 * useEffect(() => {
 *   // Preload critical resources
 *   preloadCriticalResources([
 *     { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
 *   ]);
 *
 *   // Lazy load images
 *   lazyLoadImages();
 *
 *   // Prefetch on hover
 *   prefetchOnHover();
 *
 *   // Register service worker
 *   registerServiceWorker();
 * }, []);
 */
