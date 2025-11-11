'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);

      // Hide reconnected message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);

      // Trigger background sync
      triggerSync();

      // Track reconnection
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'connection_restored', {
          event_category: 'Network',
          event_label: 'Online'
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);

      // Track disconnection
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'connection_lost', {
          event_category: 'Network',
          event_label: 'Offline'
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending actions periodically
    const interval = setInterval(() => {
      checkPendingActions();
    }, 5000);

    checkPendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkPendingActions = () => {
    try {
      const pending = localStorage.getItem('fly2any-pending-sync');
      if (pending) {
        const actions = JSON.parse(pending);
        setPendingActions(actions.length);
      } else {
        setPendingActions(0);
      }
    } catch (error) {
      console.error('Failed to check pending actions:', error);
    }
  };

  const triggerSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-all');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }
  };

  // Show reconnected banner
  if (showReconnected && isOnline && wasOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3">
              <Wifi className="w-5 h-5" />
              <span className="font-medium">
                Back online! {pendingActions > 0 && `Syncing ${pendingActions} pending ${pendingActions === 1 ? 'action' : 'actions'}...`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show offline banner
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">
                    You're offline
                  </div>
                  <div className="text-xs text-amber-100">
                    Some features may be limited. {pendingActions > 0 && `${pendingActions} ${pendingActions === 1 ? 'action' : 'actions'} queued for sync.`}
                  </div>
                </div>
              </div>

              <CloudOff className="w-5 h-5 flex-shrink-0 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything when online (unless just reconnected)
  return null;
}
