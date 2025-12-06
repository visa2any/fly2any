import { useState, useEffect } from 'react';

/**
 * Custom hook to detect mobile devices
 * Breakpoint: 768px (matches Tailwind's md: breakpoint)
 *
 * Returns:
 * - true for mobile devices (< 768px width)
 * - false for desktop devices (>= 768px width)
 *
 * Usage:
 * const isMobile = useIsMobile();
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}
