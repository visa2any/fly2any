/**
 * Service Worker Registration Helper
 * Registers and manages the service worker lifecycle
 */

export interface ServiceWorkerStatus {
  registered: boolean;
  installing: boolean;
  waiting: boolean;
  active: boolean;
  registration?: ServiceWorkerRegistration;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration.scope);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('Service Worker update found');

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Service Worker available, reload to update');

            // Optionally notify user about update
            if (typeof window !== 'undefined' && (window as any).swUpdateAvailable) {
              (window as any).swUpdateAvailable(newWorker);
            }
          }
        });
      }
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorkers(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );

    console.log('All service workers unregistered');
  } catch (error) {
    console.error('Failed to unregister service workers:', error);
  }
}

/**
 * Get service worker status
 */
export async function getServiceWorkerStatus(): Promise<ServiceWorkerStatus> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return {
      registered: false,
      installing: false,
      waiting: false,
      active: false,
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return {
        registered: false,
        installing: false,
        waiting: false,
        active: false,
      };
    }

    return {
      registered: true,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
      active: !!registration.active,
      registration,
    };
  } catch (error) {
    console.error('Failed to get service worker status:', error);
    return {
      registered: false,
      installing: false,
      waiting: false,
      active: false,
    };
  }
}

/**
 * Update service worker
 */
export async function updateServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration) {
      await registration.update();
      console.log('Service Worker update check complete');
    }
  } catch (error) {
    console.error('Failed to update service worker:', error);
  }
}

/**
 * Skip waiting and activate new service worker
 */
export async function skipWaitingAndActivate(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload the page when the new service worker activates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  } catch (error) {
    console.error('Failed to skip waiting:', error);
  }
}

/**
 * Send message to service worker
 */
export async function sendMessageToServiceWorker(message: any): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration && registration.active) {
      registration.active.postMessage(message);
    }
  } catch (error) {
    console.error('Failed to send message to service worker:', error);
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    await sendMessageToServiceWorker({ type: 'CLEAR_CACHE' });
    console.log('Cache clear request sent');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return 0;
  }

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      // Rough estimate: each cached item is ~5KB
      totalSize += keys.length * 5000;
    }

    return totalSize;
  } catch (error) {
    console.error('Failed to calculate cache size:', error);
    return 0;
  }
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Check if running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Setup service worker event listeners
 */
export function setupServiceWorkerListeners(callbacks: {
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
  onMessage?: (event: MessageEvent) => void;
}): () => void {
  if (!isServiceWorkerSupported()) {
    return () => {};
  }

  const cleanupFunctions: (() => void)[] = [];

  // Listen for update available
  if (callbacks.onUpdateAvailable) {
    navigator.serviceWorker.addEventListener('controllerchange', async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        callbacks.onUpdateAvailable!(registration);
      }
    });
  }

  // Listen for offline/online events
  if (callbacks.onOffline) {
    window.addEventListener('offline', callbacks.onOffline);
    cleanupFunctions.push(() => {
      window.removeEventListener('offline', callbacks.onOffline!);
    });
  }

  if (callbacks.onOnline) {
    window.addEventListener('online', callbacks.onOnline);
    cleanupFunctions.push(() => {
      window.removeEventListener('online', callbacks.onOnline!);
    });
  }

  // Listen for messages from service worker
  if (callbacks.onMessage) {
    navigator.serviceWorker.addEventListener('message', callbacks.onMessage);
    cleanupFunctions.push(() => {
      navigator.serviceWorker.removeEventListener('message', callbacks.onMessage!);
    });
  }

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

/**
 * Initialize PWA features
 */
export async function initializePWA(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    console.log('PWA features not supported');
    return;
  }

  try {
    // Register service worker
    await registerServiceWorker();

    // Setup background sync
    if ('sync' in ServiceWorkerRegistration.prototype) {
      console.log('Background sync supported');
    }

    // Setup push notifications
    if ('Notification' in window && 'PushManager' in window) {
      console.log('Push notifications supported');
    }

    console.log('PWA initialized');
  } catch (error) {
    console.error('Failed to initialize PWA:', error);
  }
}
