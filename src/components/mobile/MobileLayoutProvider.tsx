'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedMobileExperience } from './EnhancedMobileExperience';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { mobileOptimizer } from '@/lib/performance/mobile-optimizer';
import { hapticFeedback } from '@/lib/mobile/haptic-feedback';
import { useRouter, usePathname } from 'next/navigation';
import { TouchButton } from './MicroInteractions';

interface MobileLayoutProviderProps {
  children: React.ReactNode;
}

export const MobileLayoutProvider: React.FC<MobileLayoutProviderProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  
  const { metrics, getInsights } = usePerformanceMonitoring({
    enabled: true,
    reportToAnalytics: true,
  });

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Initialize mobile optimizations
  useEffect(() => {
    if (isMobile) {
      // Preload likely next pages based on current route
      mobileOptimizer.prefetchResource(getLikelyNextRoute(pathname));
      
      // Setup performance monitoring
      mobileOptimizer.inlineCriticalCSS();
      mobileOptimizer.addResourceHints();
    }
  }, [isMobile, pathname]);

  const getLikelyNextRoute = (currentPath: string): string => {
    const routeMap: Record<string, string> = {
      '/': '/flights',
      '/flights': '/flights/search',
      '/hotels': '/hotels/search',
    };
    return routeMap[currentPath] || '/flights';
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      hapticFeedback.success();
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      
      setInstallPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleRefresh = async () => {
    // Clear cache and reload
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    window.location.reload();
  };

  // Don't apply mobile optimizations on desktop
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <EnhancedMobileExperience
      enablePerformanceMonitoring={true}
      enableHapticFeedback={true}
      enablePullToRefresh={true}
      onRefresh={handleRefresh}
    >
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-3 text-center text-sm font-medium z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Você está offline. Algumas funcionalidades podem não funcionar.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 z-40"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Instalar Fly2Any</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Instale nosso app para uma experiência mais rápida e recursos offline.
                </p>
                
                <div className="flex space-x-3">
                  <TouchButton
                    variant="primary"
                    size="sm"
                    onClick={handleInstallApp}
                    haptic={true}
                  >
                    Instalar
                  </TouchButton>
                  
                  <TouchButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstallPrompt(false)}
                    haptic={true}
                  >
                    Agora não
                  </TouchButton>
                </div>
              </div>
              
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Warning (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <AnimatePresence>
          {(() => {
            const insights = getInsights();
            if (insights.warnings.length > 0) {
              return (
                <motion.div
                  className="fixed bottom-20 left-4 right-4 bg-orange-100 border border-orange-200 rounded-xl p-3 z-30"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                >
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-orange-800 text-sm">Performance Warning</h4>
                      <ul className="text-xs text-orange-700 mt-1">
                        {insights.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            }
            return null;
          })()}
        </AnimatePresence>
      )}

      {/* Main Content */}
      <div className="min-h-screen">
        {children}
      </div>

      {/* Mobile-specific styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          /* Disable zoom on form inputs */
          input[type="color"],
          input[type="date"],
          input[type="datetime"],
          input[type="datetime-local"],
          input[type="email"],
          input[type="month"],
          input[type="number"],
          input[type="password"],
          input[type="search"],
          input[type="tel"],
          input[type="text"],
          input[type="time"],
          input[type="url"],
          input[type="week"],
          select:focus,
          textarea {
            font-size: 16px !important;
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }

          /* Hide scrollbars but keep functionality */
          ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }

          /* Touch optimizations */
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }

          /* Allow text selection where needed */
          input,
          textarea,
          [contenteditable],
          .selectable {
            -webkit-user-select: text;
            user-select: text;
          }

          /* Prevent overscroll bounce */
          body {
            overscroll-behavior: none;
          }

          /* Safe area handling for modern devices */
          .safe-area-top {
            padding-top: env(safe-area-inset-top);
          }

          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }

          .safe-area-left {
            padding-left: env(safe-area-inset-left);
          }

          .safe-area-right {
            padding-right: env(safe-area-inset-right);
          }
        }
      `}</style>
    </EnhancedMobileExperience>
  );
};

export default MobileLayoutProvider;