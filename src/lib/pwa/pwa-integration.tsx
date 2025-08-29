'use client';
import React from 'react';

import { useEffect } from 'react';
import { initializePWA, getPWAManager } from './pwa-manager';
import { offlineFormHandler } from './offline-form-handler';

/**
 * PWA Integration Hook - Use in root layout or app component
 * Initializes PWA functionality including service worker, offline handling, and notifications
 */
export function usePWAIntegration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize PWA system
    const initPWA = async (): Promise<void> => {
      try {
        console.log('🚀 Initializing PWA integration...');
        
        // Initialize PWA system
        await initializePWA();
        
        // Get PWA Manager
        const pwaManager = getPWAManager();

        // Initialize offline form handler
        offlineFormHandler.initialize();

        console.log('✅ PWA integration completed');
      } catch (error) {
        console.error('❌ PWA initialization failed:', error);
      }
    };

    initPWA();
  }, []);
}

/**
 * PWA Script Component - Add to layout head section
 * Registers service worker and initializes PWA functionality
 */
export function PWAScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // PWA Service Worker Registration
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(function(registration) {
                  console.log('✅ SW registered: ', registration);
                })
                .catch(function(registrationError) {
                  console.log('❌ SW registration failed: ', registrationError);
                });
            });
          }

          // Initialize PWA on page load
          window.addEventListener('DOMContentLoaded', function() {
            // Import and initialize PWA manager
            if (typeof window !== 'undefined') {
              import('/src/lib/pwa/pwa-manager.js').then(module => {
                if (module.initializePWA) {
                  module.initializePWA({
                    trigger: 'engagement',
                    minEngagementScore: 3,
                    delayMs: 30000,
                    maxPrompts: 3,
                    cooldownDays: 7
                  });
                  console.log('🚀 PWA Manager initialized from script');
                }
              }).catch(error => {
                console.warn('PWA Manager initialization from script failed:', error);
              });

              // Import and initialize offline form handler
              import('/src/lib/pwa/offline-form-handler.js').then(module => {
                if (module.offlineFormHandler) {
                  module.offlineFormHandler.initialize();
                  console.log('📝 Offline form handler initialized from script');
                }
              }).catch(error => {
                console.warn('Offline form handler initialization failed:', error);
              });
            }
          });

          // Handle online/offline events
          window.addEventListener('online', function() {
            console.log('🌐 Connection restored');
            document.body.classList.remove('offline');
            document.body.classList.add('online');
            
            // Show connection restored message
            if (window.showNotification) {
              window.showNotification('✅ Connection Restored', 'You are back online!');
            }
          });

          window.addEventListener('offline', function() {
            console.log('📴 Connection lost');
            document.body.classList.remove('online');
            document.body.classList.add('offline');
            
            // Show offline message
            if (window.showNotification) {
              window.showNotification('📴 You are Offline', 'Some features may be limited while offline.');
            }
          });

          // Add PWA install detection
          let deferredPrompt;
          
          window.addEventListener('beforeinstallprompt', function(e) {
            console.log('📱 PWA install prompt available');
            e.preventDefault();
            deferredPrompt = e;
            
            // Show custom install button
            const installButtons = document.querySelectorAll('[data-pwa-install]');
            installButtons.forEach(button => {
              button.style.display = 'block';
              button.addEventListener('click', function() {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then(function(choiceResult) {
                    console.log('Install choice:', choiceResult.outcome);
                    if (choiceResult.outcome === 'accepted') {
                      console.log('🎉 PWA installed');
                    }
                    deferredPrompt = null;
                  });
                }
              });
            });
          });

          window.addEventListener('appinstalled', function(evt) {
            console.log('🎉 PWA was installed successfully');
            
            // Hide install buttons
            const installButtons = document.querySelectorAll('[data-pwa-install]');
            installButtons.forEach(button => {
              button.style.display = 'none';
            });
            
            // Track installation
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'pwa_installed', {
                event_category: 'PWA',
                event_label: 'success'
              });
            }
          });

          // Utility function for notifications
          window.showNotification = function(title, message) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(title, {
                body: message,
                icon: '/favicon-32x32.png',
                tag: 'connection-status'
              });
            } else {
              console.log(title + ': ' + message);
            }
          };
        `,
      }}
    />
  );
}

/**
 * PWA Styles Component - Add offline/online styling
 */
export function PWAStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* PWA Connection Status Styles */
          body.offline {
            --connection-color: #dc2626;
            --connection-bg: #fef2f2;
          }
          
          body.online {
            --connection-color: #059669;
            --connection-bg: #ecfdf5;
          }
          
          /* PWA Install Button Styles */
          [data-pwa-install] {
            display: none;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          [data-pwa-install]:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
          }
          
          /* Offline indicator */
          .offline-indicator {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: var(--connection-color, #dc2626);
            color: white;
            text-align: center;
            padding: 8px;
            font-size: 14px;
            z-index: 9999;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
          }
          
          body.offline .offline-indicator {
            transform: translateY(0);
          }
          
          /* PWA-specific styles when installed */
          @media (display-mode: standalone) {
            body {
              --pwa-padding-top: env(safe-area-inset-top);
              padding-top: var(--pwa-padding-top);
            }
            
            .pwa-hide {
              display: none;
            }
            
            .pwa-show {
              display: block;
            }
          }
          
          /* Loading states for offline forms */
          .form-offline-queued {
            position: relative;
          }
          
          .form-offline-queued::after {
            content: '📝 Queued for when online';
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #f59e0b;
            color: white;
            padding: 8px;
            text-align: center;
            font-size: 12px;
            margin-top: 4px;
            border-radius: 4px;
          }
        `,
      }}
    />
  );
}

/**
 * Simple PWA Install Button Component
 */
export function PWAInstallButton({ 
  className = '',
  children = '📲 Install App'
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      data-pwa-install
      className={`pwa-install-button ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Offline Status Indicator Component
 */
export function OfflineIndicator() {
  return (
    <div className="offline-indicator">
      📴 You are offline - Some features may be limited
    </div>
  );
}