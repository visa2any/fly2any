'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Plane, Zap, Bell, Wifi } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Engagement tracking for smart timing
const ENGAGEMENT_KEY = 'fly2any-engagement';
const INSTALL_DISMISSED_KEY = 'fly2any-install-prompt-dismissed';

interface Engagement {
  searches: number;
  pageViews: number;
  timeOnSite: number;
  hasViewedResults: boolean;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [engagement, setEngagement] = useState<Engagement>({ searches: 0, pageViews: 0, timeOnSite: 0, hasViewedResults: false });

  // Smart timing: show prompt when user shows high intent
  const shouldShowSmartPrompt = useCallback((eng: Engagement): boolean => {
    // High intent: completed a search and viewed results
    if (eng.hasViewedResults) return true;
    // Medium intent: multiple searches or significant time on site
    if (eng.searches >= 1) return true;
    if (eng.pageViews >= 3 && eng.timeOnSite >= 30000) return true;
    return false;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      if ((navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkIfInstalled()) return;

    // Check if previously dismissed
    const dismissedUntil = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
      setDismissed(true);
      return;
    }

    // Load engagement data
    const stored = sessionStorage.getItem(ENGAGEMENT_KEY);
    const storedEngagement: Engagement = stored
      ? JSON.parse(stored)
      : { searches: 0, pageViews: 0, timeOnSite: 0, hasViewedResults: false };

    storedEngagement.pageViews++;
    setEngagement(storedEngagement);
    sessionStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(storedEngagement));

    // Track time on site
    const startTime = Date.now();
    const timeInterval = setInterval(() => {
      const newEngagement = { ...storedEngagement, timeOnSite: storedEngagement.timeOnSite + (Date.now() - startTime) };
      setEngagement(newEngagement);
      sessionStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(newEngagement));
    }, 10000);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for custom high-intent events
    const handleHighIntent = (e: CustomEvent) => {
      const type = e.detail?.type;
      setEngagement(prev => {
        const updated = { ...prev };
        if (type === 'search') updated.searches++;
        if (type === 'results') updated.hasViewedResults = true;
        sessionStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(updated));

        // Check if we should show prompt now
        if (deferredPrompt && shouldShowSmartPrompt(updated) && !checkIfInstalled()) {
          setShowPrompt(true);
        }
        return updated;
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('fly2any:engagement' as any, handleHighIntent);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      // Clear badge on install
      if ('clearAppBadge' in navigator) (navigator as any).clearAppBadge();
      // Track
      if ((window as any).gtag) {
        (window as any).gtag('event', 'pwa_install', { event_category: 'PWA', event_label: 'App Installed' });
      }
    });

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('fly2any:engagement' as any, handleHighIntent);
    };
  }, [mounted, deferredPrompt, shouldShowSmartPrompt]);

  // Auto-show after delay if engagement is high enough
  useEffect(() => {
    if (!deferredPrompt || showPrompt || dismissed || isInstalled) return;

    const timer = setTimeout(() => {
      if (shouldShowSmartPrompt(engagement)) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [deferredPrompt, engagement, showPrompt, dismissed, isInstalled, shouldShowSmartPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    // Track user choice
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install_prompt', {
        event_category: 'PWA',
        event_label: outcome === 'accepted' ? 'Accepted' : 'Dismissed'
      });
    }

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);

    // Don't show again for 7 days
    const dismissedUntil = new Date();
    dismissedUntil.setDate(dismissedUntil.getDate() + 7);
    localStorage.setItem('fly2any-install-prompt-dismissed', dismissedUntil.toISOString());

    // Track dismissal
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install_dismiss', {
        event_category: 'PWA',
        event_label: 'Dismissed'
      });
    }
  };

  const handleDismissTemporary = () => {
    setShowPrompt(false);
  };

  // Always show persistent button in header, but hide banner if dismissed
  const showBanner = !isInstalled && !dismissed && showPrompt && deferredPrompt;

  // Show persistent install button if not installed and prompt is available
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Persistent Install Button - Always visible if not installed */}
      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Install Fly2Any App"
          title="Install Fly2Any App"
        >
          <Download className="w-6 h-6 group-hover:animate-bounce" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Mobile Bottom Banner - Only show if not dismissed */}
      {showBanner && (
        <div className="fixed bottom-16 left-0 right-0 z-50 md:hidden">
        <div className="bg-gradient-to-r from-primary-500 to-blue-700 text-white shadow-2xl rounded-t-xl">
          <div className="p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Install & get 5% off Hotels + Exclusive Deals 🎁
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="flex-shrink-0 px-4 py-2 bg-white text-primary-500 font-semibold rounded-lg text-sm hover:bg-info-50 transition-colors"
            >
              Install
            </button>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Desktop Popup - Only show if not dismissed */}
      {showBanner && (
        <div className="hidden md:block fixed bottom-6 right-6 z-50 max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Plane className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Install Fly2Any
                </h3>
                <p className="text-sm text-gray-600">
                  Add to your home screen for quick access, offline support, and a better experience.
                </p>
              </div>

              <button
                onClick={handleDismissTemporary}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
              >
                Install App
              </button>

              <button
                onClick={handleDismiss}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Not Now
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs text-gray-600">Faster</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">📱</div>
                  <div className="text-xs text-gray-600">Home Screen</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">✈️</div>
                  <div className="text-xs text-gray-600">Offline Mode</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
