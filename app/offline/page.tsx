'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle, Plane } from 'lucide-react';

interface CachedFlight {
  id: string;
  origin: string;
  destination: string;
  price: number;
  airline: string;
  departureTime: string;
}

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [cachedFlights, setCachedFlights] = useState<CachedFlight[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        window.location.href = '/';
      }
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Load cached data
    loadCachedFlights();
    loadPendingRequests();

    // Listen for sync events
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data.type === 'sync-success') {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
      loadPendingRequests();
    } else if (event.data.type === 'sync-error') {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const loadCachedFlights = async () => {
    try {
      // Try to load from localStorage (in real app, use IndexedDB)
      const cached = localStorage.getItem('fly2any-cached-flights');
      if (cached) {
        setCachedFlights(JSON.parse(cached).slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load cached flights:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      // Load pending sync requests count
      const pending = localStorage.getItem('fly2any-pending-sync');
      if (pending) {
        const count = JSON.parse(pending).length;
        setPendingRequests(count);
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);

    // Wait a moment for the connection check
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (navigator.onLine) {
      window.location.href = '/';
    } else {
      setRetrying(false);
      // Shake animation effect
      const button = document.getElementById('retry-button');
      button?.classList.add('shake');
      setTimeout(() => button?.classList.remove('shake'), 500);
    }
  };

  const triggerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        setSyncStatus('syncing');
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-all');
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (error) {
        console.error('Background sync failed:', error);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Offline Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <WifiOff className="w-10 h-10 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            It looks like you've lost your internet connection. Don't worry, we've saved your progress
            and will sync everything when you're back online.
          </p>

          {/* Retry Button */}
          <button
            id="retry-button"
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <RefreshCw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Checking Connection...' : 'Try Again'}
          </button>

          {/* Sync Status */}
          {pendingRequests > 0 && (
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {pendingRequests} pending {pendingRequests === 1 ? 'request' : 'requests'}
                  </span>
                </div>
                <button
                  onClick={triggerBackgroundSync}
                  disabled={syncStatus === 'syncing' || !navigator.onLine}
                  className="text-sm px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              {syncStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sync completed successfully</span>
                </div>
              )}

              {syncStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Sync failed. Will retry when online.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cached Flights */}
        {cachedFlights.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Plane className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Recently Viewed Flights
              </h2>
            </div>

            <div className="space-y-4">
              {cachedFlights.map((flight) => (
                <div
                  key={flight.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-sm text-gray-500">Route</div>
                        <div className="font-semibold text-gray-900">
                          {flight.origin} → {flight.destination}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="text-xl font-bold text-blue-600">
                        ${flight.price}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{flight.airline}</span>
                    <span>•</span>
                    <span>{new Date(flight.departureTime).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-500 text-center">
              These flights were cached for offline viewing. Prices may have changed.
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">While you're offline:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Your bookings and searches are saved locally</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>We'll automatically sync when you reconnect</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>You can still view cached content</span>
            </li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
