// Fly2Any PWA Service Worker
// Enhanced with offline support, caching strategies, and background sync

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `fly2any-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `fly2any-dynamic-${CACHE_VERSION}`;
const API_CACHE = `fly2any-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `fly2any-images-${CACHE_VERSION}`;

// Cache duration in milliseconds
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/fly2any-logo.png',
  '/fly2any-logo.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('fly2any-') &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== API_CACHE &&
                     cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - Network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, API_CACHE_DURATION));
    return;
  }

  // Images - Cache first with network fallback
  if (request.destination === 'image') {
    event.respondWith(cacheFirstWithNetwork(request, IMAGE_CACHE, IMAGE_CACHE_DURATION));
    return;
  }

  // Static assets - Cache first
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // JavaScript and CSS - Stale while revalidate
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }

  // HTML pages - Network first with offline fallback
  if (request.destination === 'document') {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Default - Network first with cache fallback
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
});

// Caching Strategies

// Cache First - Check cache first, fallback to network
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Cache first failed:', error);
    throw error;
  }
}

// Cache First with Network Fallback and TTL
async function cacheFirstWithNetwork(request, cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      const cachedDate = new Date(cached.headers.get('sw-cached-date'));
      const now = new Date();

      if (now - cachedDate < maxAge) {
        return cached;
      }
    }

    const response = await fetch(request);
    if (response.ok) {
      const clonedResponse = response.clone();
      const headers = new Headers(clonedResponse.headers);
      headers.append('sw-cached-date', new Date().toISOString());

      const newResponse = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: headers
      });

      cache.put(request, newResponse);
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Network First with Cache Fallback and TTL
async function networkFirstWithCache(request, cacheName, maxAge = 0) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      const headers = new Headers(response.headers);
      headers.append('sw-cached-date', new Date().toISOString());

      const clonedResponse = response.clone();
      const newResponse = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: headers
      });

      cache.put(request, newResponse);
    }

    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      if (maxAge > 0) {
        const cachedDate = new Date(cached.headers.get('sw-cached-date'));
        const now = new Date();

        if (now - cachedDate < maxAge) {
          return cached;
        }
      } else {
        return cached;
      }
    }

    throw error;
  }
}

// Network First with Offline Page Fallback
async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Return offline page
    const offlineCache = await caches.open(STATIC_CACHE);
    return offlineCache.match('/offline.html') || offlineCache.match('/offline');
  }
}

// Stale While Revalidate - Return cached version immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag.startsWith('sync-booking-')) {
    event.waitUntil(syncBooking(event.tag));
  } else if (event.tag.startsWith('sync-price-alert-')) {
    event.waitUntil(syncPriceAlert(event.tag));
  } else if (event.tag === 'sync-all') {
    event.waitUntil(syncAll());
  }
});

// Sync booking data
async function syncBooking(tag) {
  try {
    const bookingId = tag.replace('sync-booking-', '');
    const bookingData = await getQueuedData('booking', bookingId);

    if (!bookingData) {
      console.log('[Service Worker] No booking data to sync');
      return;
    }

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (response.ok) {
      await removeQueuedData('booking', bookingId);
      await notifyClient({ type: 'sync-success', data: 'booking' });
      console.log('[Service Worker] Booking synced successfully');
    }
  } catch (error) {
    console.error('[Service Worker] Booking sync failed:', error);
    throw error;
  }
}

// Sync price alert
async function syncPriceAlert(tag) {
  try {
    const alertId = tag.replace('sync-price-alert-', '');
    const alertData = await getQueuedData('price-alert', alertId);

    if (!alertData) {
      console.log('[Service Worker] No price alert data to sync');
      return;
    }

    const response = await fetch('/api/price-alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    });

    if (response.ok) {
      await removeQueuedData('price-alert', alertId);
      await notifyClient({ type: 'sync-success', data: 'price-alert' });
      console.log('[Service Worker] Price alert synced successfully');
    }
  } catch (error) {
    console.error('[Service Worker] Price alert sync failed:', error);
    throw error;
  }
}

// Sync all queued data
async function syncAll() {
  const queuedItems = await getAllQueuedData();
  const syncPromises = [];

  for (const item of queuedItems) {
    if (item.type === 'booking') {
      syncPromises.push(syncBooking(`sync-booking-${item.id}`));
    } else if (item.type === 'price-alert') {
      syncPromises.push(syncPriceAlert(`sync-price-alert-${item.id}`));
    }
  }

  await Promise.allSettled(syncPromises);
}

// IndexedDB helpers for queue management
async function getQueuedData(type, id) {
  // Implementation would use IndexedDB
  return null;
}

async function removeQueuedData(type, id) {
  // Implementation would use IndexedDB
}

async function getAllQueuedData() {
  // Implementation would use IndexedDB
  return [];
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Fly2Any';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/fly2any-logo.png',
    badge: '/fly2any-logo.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'fly2any-notification',
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      ...data.data
    },
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CLAIM_CLIENTS') {
    self.clients.claim();
  } else if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  } else if (event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(getCacheSize().then((size) => {
      event.ports[0].postMessage({ size });
    }));
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(name => name.startsWith('fly2any-'))
      .map(name => caches.delete(name))
  );

  await notifyClient({ type: 'cache-cleared' });
}

// Get total cache size
async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}

// Notify all clients
async function notifyClient(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic sync:', event.tag);

  if (event.tag === 'check-price-alerts') {
    event.waitUntil(checkPriceAlerts());
  }
});

// Check price alerts in background
async function checkPriceAlerts() {
  try {
    const response = await fetch('/api/price-alerts/check', {
      method: 'POST',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.triggered && data.triggered.length > 0) {
        await self.registration.showNotification('Price Alert', {
          body: `${data.triggered.length} price alert(s) triggered!`,
          icon: '/fly2any-logo.png',
          badge: '/fly2any-logo.png',
          tag: 'price-alert',
          data: { url: '/account/alerts' }
        });
      }
    }
  } catch (error) {
    console.error('[Service Worker] Price alert check failed:', error);
  }
}

console.log('[Service Worker] Loaded successfully');
