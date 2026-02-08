/**
 * Image Loader for Performance Optimization
 * Handles lazy loading, responsive images, and WebP conversion
 */

export interface ImageLoaderOptions {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export interface ResponsiveImageSet {
  src: string;
  srcSet: string;
  sizes: string;
  webpSrcSet?: string;
}

/**
 * Check if WebP is supported
 */
let webpSupportCache: boolean | null = null;

export async function isWebPSupported(): Promise<boolean> {
  if (webpSupportCache !== null) {
    return webpSupportCache;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const webpData =
      'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    const img = new Image();

    const supported = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(img.width === 1);
      img.onerror = () => resolve(false);
      img.src = webpData;
    });

    webpSupportCache = supported;
    return supported;
  } catch {
    webpSupportCache = false;
    return false;
  }
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
): string {
  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(src, width);
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute
 */
export function generateSizes(breakpoints?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const defaults = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
    ...breakpoints,
  };

  return `(max-width: 640px) ${defaults.mobile}, (max-width: 1024px) ${defaults.tablet}, ${defaults.desktop}`;
}

/**
 * Get optimized image URL
 */
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  quality: number = 75,
  format?: 'webp' | 'jpeg' | 'png'
): string {
  // If it's an external URL or already optimized, return as-is
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }

  // Build query params for Next.js Image Optimization API
  const params = new URLSearchParams();

  if (width) {
    params.set('w', width.toString());
  }

  params.set('q', quality.toString());

  if (format) {
    params.set('f', format);
  }

  return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
}

/**
 * Create responsive image set
 */
export async function createResponsiveImageSet(
  src: string,
  options: {
    widths?: number[];
    quality?: number;
    sizes?: string;
  } = {}
): Promise<ResponsiveImageSet> {
  const { widths, quality = 75, sizes } = options;

  const srcSet = generateSrcSet(src, widths);
  const finalSizes = sizes || generateSizes();

  const result: ResponsiveImageSet = {
    src: getOptimizedImageUrl(src, widths?.[0], quality),
    srcSet,
    sizes: finalSizes,
  };

  // Add WebP srcset if supported
  const webpSupported = await isWebPSupported();
  if (webpSupported) {
    result.webpSrcSet = generateSrcSet(src, widths).replace(/\.(jpg|jpeg|png)/gi, '.webp');
  }

  return result;
}

/**
 * Lazy load image with IntersectionObserver
 */
export function lazyLoadImage(
  element: HTMLImageElement,
  src: string,
  options: {
    rootMargin?: string;
    threshold?: number;
    onLoad?: () => void;
    onError?: () => void;
  } = {}
): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: load immediately
    element.src = src;
    return () => {};
  }

  const { rootMargin = '50px', threshold = 0.01, onLoad, onError } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;

          img.src = src;

          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }

          if (onLoad) {
            img.onload = onLoad;
          }

          if (onError) {
            img.onerror = onError;
          }

          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin,
      threshold,
    }
  );

  observer.observe(element);

  // Return cleanup function
  return () => {
    observer.unobserve(element);
    observer.disconnect();
  };
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, options: { as?: string } = {}): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = options.as || 'image';
  link.href = src;

  document.head.appendChild(link);
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurPlaceholder(
  width: number = 8,
  height: number = 8,
  color: string = '#e5e7eb'
): string {
  // Create a simple blur placeholder
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;

  if (!canvas) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${color}' width='${width}' height='${height}'/%3E%3C/svg%3E`;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL();
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser environment'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = src;
  });
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Create image loader hook for React
 */
export function createImageLoader(defaultQuality: number = 75) {
  return ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    return getOptimizedImageUrl(src, width, quality || defaultQuality);
  };
}

/**
 * Estimate image file size
 */
export function estimateImageSize(
  width: number,
  height: number,
  quality: number = 75,
  format: 'webp' | 'jpeg' | 'png' = 'jpeg'
): number {
  const pixels = width * height;

  // Rough estimates in bytes per pixel
  const bytesPerPixel: Record<string, number> = {
    webp: quality > 80 ? 0.5 : 0.3,
    jpeg: quality > 80 ? 1.0 : 0.5,
    png: 2.5,
  };

  return Math.round(pixels * (bytesPerPixel[format] || 1));
}

/**
 * Check if image should be lazy loaded
 */
export function shouldLazyLoad(
  element: HTMLElement,
  priority: boolean = false
): boolean {
  if (priority) {
    return false;
  }

  // Check if image is in viewport
  if (typeof window === 'undefined') {
    return true;
  }

  const rect = element.getBoundingClientRect();
  // Safe viewport height check
  let viewportHeight = 800; // default fallback
  try {
    if (typeof window !== 'undefined') {
       viewportHeight = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : 800);
    }
  } catch (e) {
    // Fallback on any error
  }

  // Load if within 200px of viewport
  return rect.top > viewportHeight + 200;
}

/**
 * Optimize image for thumbnail
 */
export function getThumbnailUrl(
  src: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  const sizes = {
    small: 150,
    medium: 300,
    large: 600,
  };

  return getOptimizedImageUrl(src, sizes[size], 60);
}

/**
 * Create image URL with transformations
 */
export function transformImage(
  src: string,
  transformations: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
    blur?: number;
  }
): string {
  const params = new URLSearchParams();

  if (transformations.width) params.set('w', transformations.width.toString());
  if (transformations.height) params.set('h', transformations.height.toString());
  if (transformations.quality) params.set('q', transformations.quality.toString());
  if (transformations.format) params.set('f', transformations.format);
  if (transformations.fit) params.set('fit', transformations.fit);
  if (transformations.blur) params.set('blur', transformations.blur.toString());

  return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
}
