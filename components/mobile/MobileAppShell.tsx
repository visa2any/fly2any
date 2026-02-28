'use client';

/**
 * MobileAppShell — Capacitor-aware app wrapper
 * 
 * Handles:
 * - Mobile initialization (push, deep links, network, haptics)
 * - Hardware back button (Android)
 * - Network status banner (offline/online)
 * - Safe area insets
 * - Status bar integration
 */

import { useEffect, useState, useCallback, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

interface MobileAppShellProps {
  children: ReactNode;
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const [isNative, setIsNative] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize mobile features
  useEffect(() => {
    let native = false;
    try {
      native = Capacitor.isNativePlatform();
    } catch {
      // Capacitor not available (web environment)
    }
    setIsNative(native);

    if (!native) {
      setInitialized(true);
      return;
    }

    const init = async () => {
      try {
        const { initializeMobileApp } = await import('@/lib/mobile-utils');
        await initializeMobileApp();

        // Setup hardware back button handler (Android)
        const { App } = await import('@capacitor/app');
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });

        // Setup network monitoring with UI feedback
        const { Network } = await import('@capacitor/network');
        const status = await Network.getStatus();
        setIsOnline(status.connected);

        Network.addListener('networkStatusChange', (status) => {
          setIsOnline(status.connected);
          if (!status.connected) {
            setShowOfflineBanner(true);
          } else {
            // Show "back online" briefly
            setTimeout(() => setShowOfflineBanner(false), 3000);
          }
        });

        console.log('[MobileAppShell] Initialized successfully');
      } catch (error) {
        console.error('[MobileAppShell] Initialization failed:', error);
      } finally {
        setInitialized(true);
      }
    };

    init();
  }, []);

  return (
    <div className={isNative ? 'mobile-app-shell' : ''}>
      {/* Offline Banner */}
      {isNative && showOfflineBanner && (
        <div
          className={`fixed top-0 left-0 right-0 z-[9999] px-4 py-2 text-center text-sm font-semibold transition-all duration-300 safe-area-top ${
            isOnline
              ? 'bg-green-500 text-white'
              : 'bg-neutral-800 text-white'
          }`}
          role="alert"
          aria-live="polite"
        >
          {isOnline ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Back online
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
              </svg>
              No internet connection
            </span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

export default MobileAppShell;
