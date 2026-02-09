'use client';

import { useState, useEffect } from 'react';

interface ScrollProgressProps {
  color?: string;
  height?: number;
}

function ScrollProgress({
  color = 'bg-primary-600',
  height = 3
}: ScrollProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const calculateScrollProgress = () => {
      // Safety check for document.documentElement
      if (!document.documentElement) return;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const totalScrollableHeight = documentHeight - windowHeight;
      const progress = totalScrollableHeight > 0
        ? (scrollTop / totalScrollableHeight) * 100
        : 0;

      setScrollProgress(Math.min(progress, 100));
    };

    // Calculate on mount
    calculateScrollProgress();

    // Update on scroll
    window.addEventListener('scroll', calculateScrollProgress);
    // Update on resize (document height might change)
    window.addEventListener('resize', calculateScrollProgress);

    return () => {
      window.removeEventListener('scroll', calculateScrollProgress);
      window.removeEventListener('resize', calculateScrollProgress);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{ height: `${height}px` }}
    >
      <div
        className={`h-full ${color} transition-all duration-150 ease-out shadow-lg`}
        style={{
          width: `${scrollProgress}%`,
          boxShadow: scrollProgress > 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
        }}
      />
    </div>
  );
}

// Export both named and default
export { ScrollProgress };
export default ScrollProgress;
