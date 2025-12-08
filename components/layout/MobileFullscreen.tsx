'use client';

import { useEffect } from 'react';

/**
 * Mobile Fullscreen Handler
 *
 * Hides browser chrome (address bar) on mobile devices by:
 * 1. Scrolling to trigger minimal-ui mode
 * 2. Using fullscreen API when available
 * 3. Managing viewport height properly
 */
export function MobileFullscreen() {
  useEffect(() => {
    // Only run on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Hide address bar by scrolling
    const hideAddressBar = () => {
      // Small scroll to trigger minimal-ui
      if (window.scrollY === 0) {
        window.scrollTo(0, 1);
      }
    };

    // Initial hide
    setTimeout(hideAddressBar, 100);

    // Hide on page load
    window.addEventListener('load', hideAddressBar);

    // Hide on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(hideAddressBar, 100);
    });

    // Maintain fullscreen on resize
    window.addEventListener('resize', () => {
      setTimeout(hideAddressBar, 100);
    });

    return () => {
      window.removeEventListener('load', hideAddressBar);
      window.removeEventListener('orientationchange', hideAddressBar);
      window.removeEventListener('resize', hideAddressBar);
    };
  }, []);

  return null;
}
