/**
 * Prefetch Utilities for Performance Optimization
 *
 * Implements intelligent prefetching for:
 * - Search results
 * - Flight details
 * - Related routes
 */

/**
 * Prefetch a URL in the background using link preload
 */
export function prefetchRoute(url: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';
  document.head.appendChild(link);
}

/**
 * Prefetch multiple routes
 */
export function prefetchRoutes(urls: string[]): void {
  urls.forEach(url => prefetchRoute(url));
}

/**
 * Prefetch search results page when user focuses on search inputs
 */
export function setupSearchPrefetch(
  origin: string,
  destination: string
): void {
  if (!origin || !destination) return;

  const searchUrl = `/flights/results?origin=${origin}&destination=${destination}`;
  prefetchRoute(searchUrl);

  // Also prefetch the route SEO page
  const routeSlug = `${origin.toLowerCase()}-to-${destination.toLowerCase()}`;
  prefetchRoute(`/flights/${routeSlug}`);
}

/**
 * Intersection Observer-based prefetching
 * Prefetches link when it enters viewport
 */
export function observeAndPrefetch(
  element: HTMLElement,
  url: string
): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          prefetchRoute(url);
          observer.disconnect();
        }
      });
    },
    { rootMargin: '200px', threshold: 0.1 }
  );

  observer.observe(element);

  return () => observer.disconnect();
}

/**
 * Prefetch on hover with debounce
 */
export function prefetchOnHover(url: string): {
  onMouseEnter: () => void;
  onTouchStart: () => void;
} {
  let prefetched = false;

  const doPrefetch = () => {
    if (!prefetched) {
      prefetchRoute(url);
      prefetched = true;
    }
  };

  return {
    onMouseEnter: doPrefetch,
    onTouchStart: doPrefetch,
  };
}

export default { prefetchRoute, prefetchRoutes, setupSearchPrefetch, observeAndPrefetch, prefetchOnHover };
