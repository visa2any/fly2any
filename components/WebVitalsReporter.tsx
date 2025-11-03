'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/vitals';

/**
 * Web Vitals Reporter Component
 *
 * Client-side component that initializes Web Vitals tracking.
 * This must be a separate client component because Web Vitals
 * can only run in the browser.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Initialize Web Vitals tracking on mount
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
      initWebVitals();
    }
  }, []);

  // This component doesn't render anything
  return null;
}
