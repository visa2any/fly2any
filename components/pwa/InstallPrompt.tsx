'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Plane, Share, Plus, ArrowUp } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALL_DISMISSED_KEY = 'fly2any-install-dismissed';

// Detect iOS (any browser) - PWA only installs from Safari
function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Detect if on Safari (needed for install)
function isIOSSafari(): boolean {
  if (!isIOS()) return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
}

// Detect if already installed as PWA
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isOnSafari, setIsOnSafari] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsInstalled(isStandalone());
    setIsIOSDevice(isIOS());
    setIsOnSafari(isIOSSafari());
  }, []);

  useEffect(() => {
    if (!mounted || isInstalled) return;

    // Check dismissal
    const dismissedUntil = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissedUntil && new Date(dismissedUntil) > new Date()) return;

    // For iOS: Show prompt after 3 seconds
    if (isIOSSafari()) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // For Android/Desktop: Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [mounted, isInstalled]);

  const handleInstallClick = async () => {
    if (isIOSDevice) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    const dismissedUntil = new Date();
    dismissedUntil.setDate(dismissedUntil.getDate() + 7);
    localStorage.setItem(INSTALL_DISMISSED_KEY, dismissedUntil.toISOString());
  };

  if (!mounted || isInstalled) return null;
  if (!showPrompt && !isIOSDevice && !deferredPrompt) return null;

  // iOS Installation Guide Modal
  if (showIOSGuide) {
    // Show "Open in Safari" message if on iOS but not Safari
    const needsSafari = isIOSDevice && !isOnSafari;

    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slideUp safe-area-bottom">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Install Fly2Any</h3>
                  <p className="text-sm text-gray-500">Add to Home Screen</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {needsSafari ? (
              <>
                {/* Open in Safari Message */}
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2"/>
                      <path d="M12 2C12 2 15 6 15 12C15 18 12 22 12 22" stroke="#3B82F6" strokeWidth="1.5"/>
                      <path d="M12 2C12 2 9 6 9 12C9 18 12 22 12 22" stroke="#3B82F6" strokeWidth="1.5"/>
                      <path d="M2 12H22" stroke="#3B82F6" strokeWidth="1.5"/>
                      <path d="M4 7H20" stroke="#3B82F6" strokeWidth="1"/>
                      <path d="M4 17H20" stroke="#3B82F6" strokeWidth="1"/>
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Open in Safari</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    On iOS, apps can only be installed from Safari browser.
                  </p>
                  <div className="bg-gray-50 rounded-2xl p-4 text-left">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">1.</span> Copy this URL or tap the share button
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">2.</span> Open Safari and paste the URL
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">3.</span> Follow the install instructions
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                    }}
                    className="mt-4 w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Safari Install Steps */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Share className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Step 1</p>
                      <p className="text-sm text-gray-600">Tap the <span className="font-semibold">Share</span> button at the bottom of Safari</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Step 2</p>
                      <p className="text-sm text-gray-600">Scroll and tap <span className="font-semibold">"Add to Home Screen"</span></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Step 3</p>
                      <p className="text-sm text-gray-600">Tap <span className="font-semibold">"Add"</span> to install Fly2Any</p>
                    </div>
                  </div>
                </div>

                {/* Arrow pointing to share button */}
                <div className="flex justify-center mb-4">
                  <ArrowUp className="w-8 h-8 text-primary-500 animate-bounce rotate-180" />
                </div>
              </>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl">
              <div className="text-center">
                <div className="text-xl mb-1">⚡</div>
                <div className="text-[10px] text-gray-600 font-medium">Faster</div>
              </div>
              <div className="text-center">
                <div className="text-xl mb-1">🔔</div>
                <div className="text-[10px] text-gray-600 font-medium">Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-xl mb-1">✈️</div>
                <div className="text-[10px] text-gray-600 font-medium">Offline</div>
              </div>
            </div>

            <button onClick={handleDismiss} className="w-full mt-4 py-3 text-gray-500 text-sm font-medium">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Floating Install Button (always visible when available)
  const showButton = (isIOSDevice || deferredPrompt) && !showPrompt;

  return (
    <>
      {/* Floating Install Button */}
      {showButton && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group safe-area-bottom"
          aria-label="Install Fly2Any App"
        >
          <Download className="w-6 h-6 group-hover:animate-bounce" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Mobile Bottom Banner */}
      {showPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
          <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white shadow-2xl rounded-t-3xl">
            <div className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Plane className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">Install Fly2Any</p>
                <p className="text-[11px] text-white/80 truncate">
                  {isIOSDevice ? 'Tap to see how' : 'Get 5% off Hotels + Deals'}
                </p>
              </div>

              <button
                onClick={handleInstallClick}
                className="flex-shrink-0 px-5 py-2.5 bg-white text-primary-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all active:scale-95 shadow-lg"
              >
                {isIOSDevice ? 'Install' : 'Add'}
              </button>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
