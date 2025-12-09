/**
 * Critical CSS & Core Web Vitals Optimization
 *
 * Implements:
 * - Critical CSS extraction hints
 * - Resource hints (preconnect, preload, prefetch)
 * - LCP optimization
 * - CLS prevention
 * - INP optimization helpers
 */

import React from 'react';

/**
 * Resource hints for faster page loads
 * Add to <head> via layout.tsx or page-specific components
 */
export function ResourceHints() {
  return (
    <>
      {/* DNS Prefetch for third-party domains */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//api.fly2any.com" />
      <link rel="dns-prefetch" href="//cdn.fly2any.com" />

      {/* Preconnect to critical origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.fly2any.com" />

      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/Inter-Variable.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}

/**
 * Skeleton placeholder dimensions to prevent CLS
 * Use these constants for consistent skeleton sizes
 */
export const SKELETON_DIMENSIONS = {
  flightCard: { height: 120, mobileHeight: 140 },
  hotelCard: { height: 200, mobileHeight: 180 },
  searchBar: { height: 72, mobileHeight: 56 },
  filterBar: { height: 48 },
  navbar: { height: 64 },
  footer: { height: 320 },
} as const;

/**
 * Content placeholder with fixed dimensions to prevent CLS
 */
export function ContentPlaceholder({
  height,
  className = '',
  children,
}: {
  height: number | string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
    >
      {children}
    </div>
  );
}

/**
 * Image wrapper that prevents CLS by reserving space
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  loading = 'lazy',
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}) {
  const aspectRatio = (height / width) * 100;

  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${className}`}
      style={{ paddingBottom: `${aspectRatio}%` }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding={priority ? 'sync' : 'async'}
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  );
}

/**
 * Defer non-critical JavaScript
 */
export function DeferredScript({
  src,
  id,
  strategy = 'lazyOnload',
}: {
  src: string;
  id: string;
  strategy?: 'afterInteractive' | 'lazyOnload';
}) {
  return (
    <script
      id={id}
      src={src}
      defer={strategy === 'afterInteractive'}
      async={strategy === 'lazyOnload'}
    />
  );
}

/**
 * INP Optimization: Debounced event handler wrapper
 * Use for expensive operations triggered by user input
 */
export function useINPOptimizedHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay: number = 150
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  return React.useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        handler(...args);
      }, delay);
    }) as T,
    [handler, delay]
  );
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useLazyLoad(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

/**
 * Component that only renders when visible in viewport
 */
export function LazyComponent({
  children,
  fallback,
  className = '',
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}) {
  const { ref, isVisible } = useLazyLoad();

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
}

/**
 * GPU-accelerated animation wrapper
 * Promotes element to its own layer for smoother animations
 */
export function GPUAccelerated({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

export default ResourceHints;
