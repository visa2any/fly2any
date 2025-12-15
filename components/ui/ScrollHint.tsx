'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollHintProps {
  children: ReactNode;
  className?: string;
  fadeColor?: string; // Tailwind bg color for fade
  showDots?: boolean; // Show subtle dot indicators
}

/**
 * Level-6 ScrollHint - Ultra-discreet Apple-class scroll container
 * - Subtle fade edges (6px) indicating more content
 * - Optional dot indicators showing scroll position
 * - No intrusive tooltips or text
 */
export function ScrollHint({
  children,
  className,
  fadeColor = 'from-white',
  showDots = false,
}: ScrollHintProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
    // Progress 0-1
    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, []);

  return (
    <div className="relative">
      {/* Left fade - ultra subtle 6px */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r to-transparent z-10 pointer-events-none transition-opacity duration-200 md:hidden',
          fadeColor,
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className={cn(
          'flex overflow-x-auto scrollbar-hide scroll-smooth',
          className
        )}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>

      {/* Right fade - ultra subtle 6px */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l to-transparent z-10 pointer-events-none transition-opacity duration-200 md:hidden',
          fadeColor,
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Optional dot indicators - appears below on mobile only */}
      {showDots && (canScrollLeft || canScrollRight) && (
        <div className="flex justify-center gap-1 mt-2 md:hidden">
          {[0, 0.5, 1].map((pos, i) => (
            <div
              key={i}
              className={cn(
                'w-1 h-1 rounded-full transition-all duration-200',
                Math.abs(scrollProgress - pos) < 0.3
                  ? 'bg-neutral-400 scale-125'
                  : 'bg-neutral-200'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
