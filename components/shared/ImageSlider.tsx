'use client';

import { useState, useCallback, useRef, memo, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSliderProps {
  images: (string | { url: string; alt?: string })[];
  alt: string;
  height?: string;
  showDots?: boolean;
  showArrows?: boolean;
  showSwipeHint?: boolean;
  autoSlideOnHover?: boolean;
  autoSlideInterval?: number;
  className?: string;
  children?: React.ReactNode;
  onImageChange?: (index: number) => void;
}

/**
 * Optimized Image Slider Component
 * - Touch swipe support for mobile
 * - Navigation arrows for desktop
 * - Dot indicators
 * - Crossfade transition
 * - Auto-slide on hover
 * - Performance optimized with lazy loading
 */
export const ImageSlider = memo(({
  images,
  alt,
  height = 'h-48',
  showDots = true,
  showArrows = true,
  showSwipeHint = false,
  autoSlideOnHover = false,
  autoSlideInterval = 1500,
  className = '',
  children,
  onImageChange,
}: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(showSwipeHint);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  // Normalize images to array of URLs
  const imageUrls = images.map(img =>
    typeof img === 'string' ? img : img.url
  ).filter(Boolean);

  // No images - show placeholder
  if (imageUrls.length === 0) {
    return (
      <div className={`relative ${height} ${className} overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl opacity-50">🖼️</span>
        </div>
        {children}
      </div>
    );
  }

  // Single image - no slider functionality needed
  if (imageUrls.length === 1) {
    return (
      <div className={`relative ${height} ${className} overflow-hidden`}>
        <Image
          src={imageUrls[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
          loading="lazy"
          unoptimized
        />
        {children}
      </div>
    );
  }

  // Auto-slide on hover effect
  useEffect(() => {
    if (autoSlideOnHover && isHovering && imageUrls.length > 1) {
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const newIndex = (prev + 1) % imageUrls.length;
          onImageChange?.(newIndex);
          return newIndex;
        });
      }, autoSlideInterval);
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
        autoSlideRef.current = null;
      }
    };
  }, [isHovering, autoSlideOnHover, autoSlideInterval, imageUrls.length, onImageChange]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Reset to first image when mouse leaves
    if (autoSlideOnHover) {
      setCurrentIndex(0);
      onImageChange?.(0);
    }
  }, [autoSlideOnHover, onImageChange]);

  const changeImage = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentIndex((prev) => {
        const newIndex = direction === 'next'
          ? (prev + 1) % imageUrls.length
          : (prev - 1 + imageUrls.length) % imageUrls.length;
        onImageChange?.(newIndex);
        return newIndex;
      });
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  }, [imageUrls.length, isTransitioning, onImageChange]);

  const goToImage = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      onImageChange?.(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  }, [currentIndex, isTransitioning, onImageChange]);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    changeImage('next');
  }, [changeImage]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    changeImage('prev');
  }, [changeImage]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) {
      setTouchStart(null);
      setTouchStartY(null);
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStart - touchEndX;
    const diffY = touchStartY !== null ? touchStartY - touchEndY : 0;
    const threshold = 40; // minimum swipe distance

    // Horizontal swipe - must be more horizontal than vertical
    if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY)) {
      changeImage(diffX > 0 ? 'next' : 'prev');
      // Hide hint after first swipe
      if (showHint) {
        setShowHint(false);
      }
    }

    setTouchStart(null);
    setTouchStartY(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${height} ${className} overflow-hidden group`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image with crossfade transition */}
      <Image
        src={imageUrls[currentIndex]}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-200 ease-out ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={currentIndex === 0}
        loading={currentIndex === 0 ? 'eager' : 'lazy'}
        unoptimized
      />

      {/* Touch zones for tap navigation (mobile) */}
      <div
        onClick={(e) => { e.stopPropagation(); prevImage(); }}
        className="absolute left-0 top-0 w-1/4 h-full z-10 md:hidden"
      />
      <div
        onClick={(e) => { e.stopPropagation(); nextImage(); }}
        className="absolute right-0 top-0 w-1/4 h-full z-10 md:hidden"
      />

      {/* Navigation Arrows (desktop, hidden on mobile) */}
      {showArrows && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden md:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden md:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && imageUrls.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
          {imageUrls.slice(0, Math.min(imageUrls.length, 6)).map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); goToImage(idx); }}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-white w-4 shadow-md'
                  : 'bg-white/50 w-1.5 hover:bg-white/70'
              }`}
            />
          ))}
          {imageUrls.length > 6 && (
            <span className="text-white/70 text-[10px] ml-1">+{imageUrls.length - 6}</span>
          )}
        </div>
      )}

      {/* Image counter (desktop) */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md hidden md:block">
        <span className="text-white text-[10px] font-medium">
          {currentIndex + 1}/{imageUrls.length}
        </span>
      </div>

      {/* Swipe hint overlay for first-time users (mobile) */}
      {showHint && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none md:hidden">
          <div
            className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-3 animate-pulse"
          >
            <ChevronLeft className="w-5 h-5 text-white/80" />
            <span className="text-white text-sm font-medium">Swipe for more</span>
            <ChevronRight className="w-5 h-5 text-white/80" />
          </div>
        </div>
      )}

      {/* Children (overlays, badges, etc.) */}
      {children}
    </div>
  );
});

ImageSlider.displayName = 'ImageSlider';

export default ImageSlider;
