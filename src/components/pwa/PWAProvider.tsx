'use client';

import React, { useEffect, useState } from 'react';
import { initializePWA, getPWAManager, PWACapabilities } from '@/lib/pwa/pwa-manager';
import { offlineFormHandler } from '@/lib/pwa/offline-form-handler';
import PWAInstallPrompt from './PWAInstallPrompt';

interface PWAProviderProps {
  children: React.ReactNode;
  enableInstallPrompt?: boolean;
  installPromptStrategy?: 'subtle' | 'prominent' | 'banner';
  installPromptConfig?: {
    trigger: 'immediate' | 'engagement' | 'timer' | 'manual';
    minEngagementScore: number;
    delayMs: number;
    maxPrompts: number;
    cooldownDays: number;
  };
}

export default function PWAProvider({ 
  children, 
  enableInstallPrompt = true,
  installPromptStrategy = 'subtle',
  installPromptConfig
}: PWAProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [capabilities, setCapabilities] = useState<PWACapabilities | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set up event listeners for PWA events
    const handlePWAUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    const handlePWAInstalled = () => {
      setCapabilities((prev: any) => prev ? { ...prev, isInstalled: true } : null);
    };

    window.addEventListener('pwa-update-available', handlePWAUpdateAvailable);
    window.addEventListener('pwa-installed', handlePWAInstalled);

    const initializePWASystem = async (): Promise<void> => {
      try {
        console.log('🚀 Initializing PWA system...');
        
        // Initialize PWA system
        await initializePWA();
        
        // Get PWA Manager
        const pwaManager = getPWAManager();
        
        // Get capabilities
        const caps = pwaManager.getCapabilities();
        setCapabilities(caps);

        // Initialize badge API if supported
        if ('setAppBadge' in navigator) {
          await pwaManager.updateBadgeCount(0);
        }

        // Request notification permission if PWA is installed
        if (caps?.isInstalled && !caps.hasNotificationPermission) {
          // Delay request to avoid overwhelming user on first install
          setTimeout(async () => {
            await pwaManager.requestNotificationPermission();
            
            // Subscribe to push notifications if permission granted
            if (Notification.permission === 'granted') {
              await pwaManager.subscribeToPushNotifications();
            }
          }, 5000);
        }

        setIsInitialized(true);
        console.log('✅ PWA system initialized successfully');
        
      } catch (error) {
        console.error('Failed to initialize PWA system:', error);
        setIsInitialized(true); // Still set to true to not block the app
      }
    };

    initializePWASystem();

    // Cleanup function
    return () => {
      window.removeEventListener('pwa-update-available', handlePWAUpdateAvailable);
      window.removeEventListener('pwa-installed', handlePWAInstalled);
    };
  }, []);

  const handleUpdateApp = async (): Promise<void> => {
    try {
      // Reload to get the new service worker
      window.location.reload();
    } catch (error) {
      console.error('Failed to update app:', error);
    }
  };

  const handleDismissUpdate = () => {
    setUpdateAvailable(false);
  };

  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* PWA Install Prompt */}
      {enableInstallPrompt && (
        <PWAInstallPrompt strategy={installPromptStrategy} />
      )}
      
      {/* PWA Update Available Notification */}
      {updateAvailable && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🔄</div>
                <div>
                  <h4 className="font-semibold text-sm">App Update Available</h4>
                  <p className="text-xs opacity-90 mt-1">
                    A new version of Fly2Any is available with improved features and bug fixes.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismissUpdate}
                className="text-white hover:text-gray-200 ml-2"
              >
                ✕
              </button>
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleUpdateApp}
                className="bg-white text-blue-600 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Update Now
              </button>
              <button
                onClick={handleDismissUpdate}
                className="text-white border border-white/30 px-4 py-2 rounded text-sm hover:bg-white/10 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && capabilities && (
        <div className="fixed bottom-4 left-4 z-50">
          <details className="bg-black/80 text-white p-3 rounded text-xs font-mono">
            <summary className="cursor-pointer">PWA Debug</summary>
            <div className="mt-2 space-y-1">
              <div>Installable: {capabilities.isInstallable ? '✅' : '❌'}</div>
              <div>Installed: {capabilities.isInstalled ? '✅' : '❌'}</div>
              <div>Offline: {capabilities.isOffline ? '🔴' : '🟢'}</div>
              <div>Push Notifications: {capabilities.supportsPushNotifications ? '✅' : '❌'}</div>
              <div>Background Sync: {capabilities.supportsBackgroundSync ? '✅' : '❌'}</div>
              <div>Badging: {capabilities.supportsBadging ? '✅' : '❌'}</div>
              <div>Queue: {offlineFormHandler.getQueueStatus().count} forms</div>
            </div>
          </details>
        </div>
      )}
    </>
  );
}