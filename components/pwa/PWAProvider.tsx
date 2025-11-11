'use client';

/**
 * PWA Provider Component
 * Handles service worker registration and PWA initialization
 */

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa/register-sw';
import { setupAutoSync } from '@/lib/sync/background-sync';

export function PWAProvider() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Register service worker
    const initPWA = async () => {
      try {
        console.log('[PWA] Initializing...');

        // Register service worker
        const registration = await registerServiceWorker();

        if (registration) {
          console.log('[PWA] Service worker registered successfully');
        } else {
          console.log('[PWA] Service worker not supported or registration failed');
        }

        // Setup auto-sync for offline actions
        setupAutoSync();

        console.log('[PWA] Initialization complete');
      } catch (error) {
        console.error('[PWA] Initialization failed:', error);
      }
    };

    // Register on load
    if (document.readyState === 'complete') {
      initPWA();
    } else {
      window.addEventListener('load', initPWA);
      return () => window.removeEventListener('load', initPWA);
    }
  }, []);

  // This component doesn't render anything
  return null;
}
