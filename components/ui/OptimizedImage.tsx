/**
 * OptimizedImage Component
 *
 * A wrapper around Next.js Image component with automatic optimization,
 * blur placeholders, and responsive sizing for improved Core Web Vitals
 *
 * Features:
 * - Automatic blur placeholders
 * - Responsive image sizing
 * - Lazy loading with intersection observer
 * - Priority loading for above-the-fold images
 * - Error handling with fallback images
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';
import { getOptimizedImageProps } from '@/lib/utils/image-optimization';

export interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  preset?: 'hotelCard' | 'destinationCard' | 'hero' | 'thumbnail';
  fallbackSrc?: string;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  preset = 'hotelCard',
  fallbackSrc = '/images/placeholder.jpg',
  priority = false,
  className = '',
  onError,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      console.warn(`Failed to load image: ${imgSrc}`);
      setHasError(true);
      setImgSrc(fallbackSrc);
      onError?.();
    }
  };

  // Get optimized props from preset
  const optimizedProps = getOptimizedImageProps(
    imgSrc,
    alt,
    preset,
    { width, height, priority }
  );

  return (
    <Image
      {...optimizedProps}
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}

/**
 * HotelImage - Preset for hotel card images
 */
export function HotelImage({ src, alt, priority = false, className = '', ...props }: Omit<OptimizedImageProps, 'preset'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      preset="hotelCard"
      priority={priority}
      className={className}
      {...props}
    />
  );
}

/**
 * DestinationImage - Preset for destination card images
 */
export function DestinationImage({ src, alt, priority = false, className = '', ...props }: Omit<OptimizedImageProps, 'preset'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      preset="destinationCard"
      priority={priority}
      className={className}
      {...props}
    />
  );
}

/**
 * HeroImage - Preset for hero/banner images
 */
export function HeroImage({ src, alt, className = '', ...props }: Omit<OptimizedImageProps, 'preset' | 'priority'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      preset="hero"
      priority={true} // Heroes are always above the fold
      className={className}
      {...props}
    />
  );
}

/**
 * ThumbnailImage - Preset for small thumbnail images
 */
export function ThumbnailImage({ src, alt, priority = false, className = '', ...props }: Omit<OptimizedImageProps, 'preset'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      preset="thumbnail"
      priority={priority}
      className={className}
      {...props}
    />
  );
}
