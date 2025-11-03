/**
 * Image Optimization Utilities for Next.js Image Component
 *
 * Purpose: Provide blur placeholders, shimmer effects, and responsive image utilities
 * for improved Core Web Vitals (LCP and CLS)
 *
 * Features:
 * - Base64 blur placeholder generation
 * - Shimmer loading effect
 * - Responsive image sizing
 * - Image loader configuration
 */

/**
 * Generate a base64-encoded shimmer SVG for loading state
 * This creates a subtle animated shimmer effect while images load
 */
export function generateShimmerSVG(width: number = 400, height: number = 300): string {
  const shimmer = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#f0f0f0" stop-opacity="1" />
          <stop offset="50%" stop-color="#e8e8e8" stop-opacity="1">
            <animate attributeName="offset" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stop-color="#f0f0f0" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#shimmer)" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(shimmer).toString('base64')}`;
}

/**
 * Generate a simple gray blur placeholder
 * Ultra-lightweight for optimal initial page load
 */
export function generateBlurPlaceholder(width: number = 400, height: number = 300): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#e5e7eb"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate a gradient blur placeholder with brand colors
 * For premium visual experience during load
 */
export function generateGradientBlurPlaceholder(
  width: number = 400,
  height: number = 300,
  colors: [string, string] = ['#3b82f6', '#06b6d4']
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Calculate responsive image sizes for different breakpoints
 * Optimizes bandwidth by loading appropriate image size
 */
export function getResponsiveSizes(type: 'hero' | 'card' | 'thumbnail' | 'full'): string {
  const sizesMap = {
    hero: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px',
    card: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px',
    thumbnail: '(max-width: 640px) 50vw, 200px',
    full: '100vw',
  };

  return sizesMap[type];
}

/**
 * Get optimal image dimensions for specific use cases
 * Prevents CLS by providing consistent dimensions
 */
export function getImageDimensions(type: 'hotel-card' | 'destination-card' | 'hero' | 'thumbnail'): {
  width: number;
  height: number;
  aspectRatio: string;
} {
  const dimensionsMap = {
    'hotel-card': { width: 400, height: 300, aspectRatio: '4/3' },
    'destination-card': { width: 360, height: 240, aspectRatio: '3/2' },
    'hero': { width: 1200, height: 600, aspectRatio: '2/1' },
    'thumbnail': { width: 200, height: 200, aspectRatio: '1/1' },
  };

  return dimensionsMap[type];
}

/**
 * Image loader for external URLs (Amadeus, Duffel, external CDNs)
 * Required when using images from external domains
 */
export function externalImageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // For external URLs, return as-is
  // In production, you might want to proxy through an image optimization service
  return src;
}

/**
 * Check if image URL is from an external domain
 */
export function isExternalImage(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://');
}

/**
 * Get blur data URL based on image source
 * Returns shimmer for external images, blur for local images
 */
export function getBlurDataURL(src: string, width: number = 400, height: number = 300): string {
  if (isExternalImage(src)) {
    return generateShimmerSVG(width, height);
  }
  return generateBlurPlaceholder(width, height);
}

/**
 * Image optimization presets for common use cases
 */
export const imagePresets = {
  hotelCard: {
    width: 400,
    height: 300,
    sizes: getResponsiveSizes('card'),
    quality: 75,
    loading: 'lazy' as const,
  },
  destinationCard: {
    width: 360,
    height: 240,
    sizes: getResponsiveSizes('card'),
    quality: 75,
    loading: 'lazy' as const,
  },
  hero: {
    width: 1200,
    height: 600,
    sizes: getResponsiveSizes('hero'),
    quality: 80,
    priority: true,
  },
  thumbnail: {
    width: 200,
    height: 200,
    sizes: getResponsiveSizes('thumbnail'),
    quality: 70,
    loading: 'lazy' as const,
  },
} as const;

/**
 * TypeScript types for image optimization
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  quality?: number;
  sizes?: string;
  blurDataURL?: string;
  placeholder?: 'blur' | 'empty';
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Get complete image props for Next.js Image component
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  preset: keyof typeof imagePresets,
  overrides?: Partial<OptimizedImageProps>
): OptimizedImageProps {
  const presetConfig = imagePresets[preset];
  const isExternal = isExternalImage(src);

  return {
    src,
    alt,
    ...presetConfig,
    blurDataURL: getBlurDataURL(src, presetConfig.width, presetConfig.height),
    placeholder: 'blur',
    objectFit: 'cover',
    ...overrides,
  };
}

/**
 * Performance monitoring: Calculate LCP improvement
 */
export function calculateLCPImprovement(
  beforeLCP: number,
  afterLCP: number
): {
  improvement: number;
  improvementPercent: number;
  rating: 'good' | 'needs-improvement' | 'poor';
} {
  const improvement = beforeLCP - afterLCP;
  const improvementPercent = (improvement / beforeLCP) * 100;

  let rating: 'good' | 'needs-improvement' | 'poor';
  if (afterLCP <= 2500) {
    rating = 'good';
  } else if (afterLCP <= 4000) {
    rating = 'needs-improvement';
  } else {
    rating = 'poor';
  }

  return {
    improvement,
    improvementPercent: Math.round(improvementPercent * 10) / 10,
    rating,
  };
}

/**
 * CSS utility for maintaining aspect ratio (prevents CLS)
 */
export function getAspectRatioStyle(aspectRatio: string): React.CSSProperties {
  return {
    aspectRatio,
    width: '100%',
    height: 'auto',
  };
}
