'use client';

import { useState, useEffect } from 'react';
import { getPWAManager, initializePWA, PWACapabilities } from '@/lib/pwa/pwa-manager';

interface PWAInstallPromptProps {
  strategy?: 'subtle' | 'prominent' | 'banner';
  className?: string;
}

export default function PWAInstallPrompt({ 
  strategy = 'subtle', 
  className = '' 
}: PWAInstallPromptProps) {
  const [capabilities, setCapabilities] = useState<PWACapabilities | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Initialize PWA Manager
    const pwaManager = initializePWA({
      trigger: 'manual', // We'll handle the UI manually
      minEngagementScore: 2,
      delayMs: 5000,
      maxPrompts: 3,
      cooldownDays: 7
    });

    // Check capabilities
    const caps = pwaManager.getCapabilities();
    setCapabilities(caps);

    // Show prompt if installable and not installed
    if (caps.isInstallable && !caps.isInstalled && !dismissed) {
      // Delay showing the prompt for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }

    // Listen for PWA events
    const handlePWAInstalled = () => {
      setShowPrompt(false);
      setCapabilities(prev => prev ? { ...prev, isInstalled: true } : null);
    };

    window.addEventListener('pwa-installed', handlePWAInstalled);
    
    return () => {
      window.removeEventListener('pwa-installed', handlePWAInstalled);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    const pwaManager = getPWAManager();
    if (!pwaManager) return;

    setIsInstalling(true);
    
    try {
      const success = await pwaManager.showInstallPrompt();
      
      if (success) {
        setShowPrompt(false);
      } else {
        setIsInstalling(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    
    // Store dismissal in localStorage
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if not installable, already installed, or dismissed
  if (!capabilities?.isInstallable || capabilities.isInstalled || !showPrompt) {
    return null;
  }

  // Check if recently dismissed
  const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
  if (lastDismissed && Date.now() - parseInt(lastDismissed) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  if (strategy === 'banner') {
    return (
      <div className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ${className}`}>
        <div className="px-4 py-3 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📱</div>
            <div>
              <p className="font-semibold text-sm">Install Fly2Any App</p>
              <p className="text-xs opacity-90">Get faster access and offline features</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isInstalling ? '🔄 Installing...' : '📲 Install'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-gray-200 p-2 rounded"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (strategy === 'prominent') {
    return (
      <div className={`fixed bottom-6 left-6 right-6 z-50 max-w-md mx-auto ${className}`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                ✈️
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Install Fly2Any App
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                • Offline flight search<br/>
                • Instant booking updates<br/>
                • Faster performance<br/>
                • Home screen access
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {isInstalling ? '🔄 Installing...' : '📲 Install App'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Subtle strategy (default)
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Install App</p>
            <p className="text-xs text-gray-600">For better experience</p>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              title="Install App"
            >
              {isInstalling ? '🔄' : '📲'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 p-2"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}