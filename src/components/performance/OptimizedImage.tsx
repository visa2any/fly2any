'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  // LCP optimization props
  priority?: boolean;
  preload?: boolean;
  eager?: boolean;
  
  // CLS prevention props
  aspectRatio?: string;
  reserveSpace?: boolean;
  
  // Fallback handling
  fallbackSrc?: string;
  showSkeleton?: boolean;
  
  // Performance hints
  fetchPriority?: 'high' | 'low' | 'auto';
  
  // Event handlers
  onLoadComplete?: () => void;
  onError?: () => void;
  onLCPCandidate?: () => void;
}

/**
 * Optimized Image Component for Core Web Vitals
 * Focuses on LCP optimization and CLS prevention
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  preload = false,
  eager = false,
  aspectRatio,
  reserveSpace = true,
  fallbackSrc,
  showSkeleton = true,
  fetchPriority = 'auto',
  className = '',
  onLoadComplete,
  onError,
  onLCPCandidate,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLCPCandidate, setIsLCPCandidate] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Determine if this image should be prioritized for LCP
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setIsLCPCandidate(true);
            onLCPCandidate?.();
            observer.disconnect();
          }
        });
      },
      { 
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [onLCPCandidate]);

  // Handle image format optimization based on browser support
  useEffect(() => {
    const optimizeSrc = async () => {
      if (typeof src !== 'string') return;

      // Check for modern format support
      const supportsAVIF = await checkImageSupport('avif');
      const supportsWebP = await checkImageSupport('webp');

      let optimizedSrc = src;

      if (supportsAVIF && !src.includes('.avif')) {
        optimizedSrc = src.replace(/\.(jpe?g|png)$/i, '.avif');
      } else if (supportsWebP && !src.includes('.webp')) {
        optimizedSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
      }

      if (optimizedSrc !== src) {
        setCurrentSrc(optimizedSrc);
      }
    };

    optimizeSrc();
  }, [src]);

  // Preload image if specified
  useEffect(() => {
    if (preload && typeof currentSrc === 'string') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = currentSrc;
      if (fetchPriority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [currentSrc, preload, fetchPriority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
    
    // Report LCP candidate
    if (isLCPCandidate) {
      reportLCPCandidate();
    }
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
    
    // Try fallback formats
    if (typeof currentSrc === 'string') {
      if (currentSrc.includes('.avif')) {
        setCurrentSrc(currentSrc.replace('.avif', '.webp'));
        setIsError(false);
      } else if (currentSrc.includes('.webp')) {
        setCurrentSrc(currentSrc.replace('.webp', '.jpg'));
        setIsError(false);
      } else if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setIsError(false);
      }
    }
  };

  const reportLCPCandidate = () => {
    // Report to web vitals for LCP tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'lcp_candidate', {
        'custom_parameter': window.location.pathname,
        'event_category': 'performance'
      });
    }
  };

  // Calculate dynamic priority based on position and importance
  const shouldBePriority = priority || isLCPCandidate || eager;
  const loading = eager || shouldBePriority ? 'eager' : 'lazy';

  // Skeleton/placeholder styles
  const skeletonStyle: React.CSSProperties = {
    backgroundColor: '#f3f4f6',
    background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
    backgroundSize: '200% 100%',
    animation: 'loading-skeleton 1.5s infinite',
    ...(aspectRatio && { aspectRatio }),
  };

  // Container styles for CLS prevention
  const containerStyle: React.CSSProperties = {
    ...(reserveSpace && aspectRatio && { aspectRatio }),
    ...(reserveSpace && width && height && !aspectRatio && {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    }),
  };

  const imageClasses = [
    className,
    'transition-opacity duration-300',
    isLoaded ? 'opacity-100' : 'opacity-0',
    isError && !fallbackSrc ? 'opacity-50' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Inject loading animation CSS if showing skeleton */}
      {showSkeleton && !isLoaded && (
        <style jsx>{`
          @keyframes loading-skeleton {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      )}
      
      <div style={containerStyle} className="relative">
        {/* Skeleton loader */}
        {showSkeleton && !isLoaded && !isError && (
          <div
            style={skeletonStyle}
            className="absolute inset-0 rounded"
            aria-hidden="true"
          />
        )}
        
        {/* Optimized Image */}
        <Image
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          priority={shouldBePriority}
          loading={loading}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          // Add performance hints
          {...(fetchPriority === 'high' && { fetchPriority: 'high' })}
          {...props}
        />
        
        {/* Error state */}
        {isError && !fallbackSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
            Image failed to load
          </div>
        )}
      </div>
    </>
  );
}

// Helper function to check image format support
async function checkImageSupport(format: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    // Test images (1x1 pixel in different formats)
    const testImages = {
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
      webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA'
    };
    
    img.src = testImages[format as keyof typeof testImages];
  });
}

// Export types for reuse
export type { OptimizedImageProps };