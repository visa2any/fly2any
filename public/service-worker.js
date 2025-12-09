// Fly2Any PWA Service Worker v2.0
// Enhanced with IndexedDB, predictive caching, and advanced offline support

const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `fly2any-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `fly2any-dynamic-${CACHE_VERSION}`;
const API_CACHE = `fly2any-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `fly2any-images-${CACHE_VERSION}`;
const PREFETCH_CACHE = `fly2any-prefetch-${CACHE_VERSION}`;

// Cache durations
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SEARCH_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/fly2any-logo.png',
  '/fly2any-logo.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// Routes to prefetch based on user behavior
const PREFETCH_ROUTES = [
  '/flights/results',
  '/account/bookings',
  '/account/alerts',
];

// IndexedDB Setup
const DB_NAME = 'fly2any-sw';
const DB_VERSION = 1;

let db = null;

async function initDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains('syncQueue')) {
        const store = database.createObjectStore('syncQueue', { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      if (!database.objectStoreNames.contains('cachedSearches')) {
        const store = database.createObjectStore('cachedSearches', { keyPath: 'id' });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
}

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v2.0...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      initDB(),
    ]).then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v2.0...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('fly2any-') && ![
              STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE, PREFETCH_CACHE
            ].includes(name))
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event with intelligent routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Skip non-http requests
  if (!url.protocol.startsWith('http')) return;

  // API requests - Network first with IndexedDB cache for searches
  if (url.pathname.startsWith('/api/')) {
    if (url.pathname.includes('/search') || url.pathname.includes('/flights')) {
      event.respondWith(handleSearchRequest(request));
    } else {
      event.respondWith(networkFirstWithCache(request, API_CACHE, API_CACHE_DURATION));
    }
    return;
  }

  // Images - Cache first
  if (request.destination === 'image') {
    event.respondWith(cacheFirstWithNetwork(request, IMAGE_CACHE, IMAGE_CACHE_DURATION));
    return;
  }

  // Static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // JS/CSS - Stale while revalidate
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }

  // HTML pages - Network first with offline fallback
  if (request.destination === 'document') {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Default
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
});

// Search request handler with IndexedDB caching
async function handleSearchRequest(request) {
  const cacheKey = request.url;

  try {
    // Try network first
    const response = await fetch(request);

    if (response.ok) {
      // Cache successful search results in IndexedDB
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();

      try {
        const database = await initDB();
        const tx = database.transaction('cachedSearches', 'readwrite');
        const store = tx.objectStore('cachedSearches');

        store.put({
          id: cacheKey,
          data: data,
          timestamp: Date.now(),
          expiresAt: Date.now() + SEARCH_CACHE_DURATION,
        });
      } catch (e) {
        console.warn('[SW] IndexedDB cache failed:', e);
      }
    }

    return response;
  } catch (error) {
    // Network failed, try IndexedDB cache
    try {
      const database = await initDB();
      const tx = database.transaction('cachedSearches', 'readonly');
      const store = tx.objectStore('cachedSearches');

      return new Promise((resolve) => {
        const request = store.get(cacheKey);

        request.onsuccess = () => {
          const cached = request.result;
          if (cached && cached.expiresAt > Date.now()) {
            resolve(new Response(JSON.stringify(cached.data), {
              headers: {
                'Content-Type': 'application/json',
                'X-Cache': 'HIT-IndexedDB',
              },
            }));
          } else {
            resolve(new Response(JSON.stringify({ error: 'Offline', cached: false }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }));
          }
        };

        request.onerror = () => {
          resolve(new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }));
        };
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}

// Caching strategies
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    throw error;
  }
}

async function cacheFirstWithNetwork(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const cachedDate = new Date(cached.headers.get('sw-cached-date'));
    if (Date.now() - cachedDate < maxAge) return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      cache.put(request, newResponse.clone());
      return newResponse;
    }
    return response;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

async function networkFirstWithCache(request, cacheName, maxAge = 0) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const headers = new Headers(response.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      cache.put(request, newResponse.clone());
      return newResponse;
    }
    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

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
    if (cached) return cached;

    const staticCache = await caches.open(STATIC_CACHE);
    return staticCache.match('/offline') || staticCache.match('/');
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || fetchPromise;
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-queue') {
    event.waitUntil(processSyncQueue());
  } else if (event.tag.startsWith('sync-booking-')) {
    event.waitUntil(syncBooking(event.tag.replace('sync-booking-', '')));
  } else if (event.tag.startsWith('sync-alert-')) {
    event.waitUntil(syncPriceAlert(event.tag.replace('sync-alert-', '')));
  }
});

async function processSyncQueue() {
  try {
    const database = await initDB();
    const tx = database.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    const index = store.index('status');

    return new Promise((resolve) => {
      const request = index.getAll('pending');

      request.onsuccess = async () => {
        const items = request.result;
        const results = await Promise.allSettled(
          items.map((item) => syncItem(item))
        );
        resolve(results);
      };

      request.onerror = () => resolve([]);
    });
  } catch (error) {
    console.error('[SW] Sync queue processing failed:', error);
  }
}

async function syncItem(item) {
  const endpoints = {
    booking: '/api/bookings',
    'price-alert': '/api/price-alerts',
    search: '/api/search/save',
    favorite: '/api/favorites',
  };

  try {
    const response = await fetch(endpoints[item.type], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data),
    });

    if (response.ok) {
      await removeFromQueue(item.id);
      await notifyClients({ type: 'sync-success', item: item.type });
    } else {
      await updateQueueStatus(item.id, 'failed', item.retryCount + 1);
    }
  } catch (error) {
    await updateQueueStatus(item.id, 'pending', item.retryCount + 1);
    throw error;
  }
}

async function removeFromQueue(id) {
  const database = await initDB();
  const tx = database.transaction('syncQueue', 'readwrite');
  tx.objectStore('syncQueue').delete(id);
}

async function updateQueueStatus(id, status, retryCount) {
  const database = await initDB();
  const tx = database.transaction('syncQueue', 'readwrite');
  const store = tx.objectStore('syncQueue');

  return new Promise((resolve) => {
    const request = store.get(id);
    request.onsuccess = () => {
      const item = request.result;
      if (item) {
        item.status = status;
        item.retryCount = retryCount;
        store.put(item);
      }
      resolve();
    };
  });
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New notification from Fly2Any',
    icon: data.icon || '/fly2any-logo.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || `fly2any-${Date.now()}`,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      ...data.data,
    },
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Fly2Any', options)
  );

  // Update badge count
  if ('setAppBadge' in navigator && data.badgeCount) {
    navigator.setAppBadge(data.badgeCount);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const url = event.notification.data?.url || '/';

  if (action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

// Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);

  if (event.tag === 'check-price-alerts') {
    event.waitUntil(checkPriceAlerts());
  } else if (event.tag === 'prefetch-routes') {
    event.waitUntil(prefetchPredictedRoutes());
  }
});

async function checkPriceAlerts() {
  try {
    const response = await fetch('/api/price-alerts/check', { method: 'POST' });

    if (response.ok) {
      const data = await response.json();
      if (data.triggered?.length > 0) {
        await self.registration.showNotification('Price Alert!', {
          body: `${data.triggered.length} flight(s) dropped in price!`,
          icon: '/fly2any-logo.png',
          badge: '/icon-192.png',
          tag: 'price-alerts',
          data: { url: '/account/alerts' },
        });
      }
    }
  } catch (error) {
    console.error('[SW] Price alert check failed:', error);
  }
}

async function prefetchPredictedRoutes() {
  const cache = await caches.open(PREFETCH_CACHE);

  for (const route of PREFETCH_ROUTES) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
      }
    } catch (e) {
      // Ignore prefetch failures
    }
  }
}

// Message handler
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLAIM_CLIENTS':
      self.clients.claim();
      break;

    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(DYNAMIC_CACHE).then((cache) => cache.addAll(payload.urls))
      );
      break;

    case 'PREFETCH_ROUTE':
      event.waitUntil(prefetchRoute(payload.route));
      break;

    case 'ADD_TO_SYNC_QUEUE':
      event.waitUntil(addToSyncQueue(payload));
      break;

    case 'CLEAR_CACHES':
      event.waitUntil(clearAllCaches());
      break;

    case 'GET_CACHE_SIZE':
      event.waitUntil(
        getCacheSize().then((size) => {
          event.ports[0]?.postMessage({ size });
        })
      );
      break;
  }
});

async function prefetchRoute(route) {
  const cache = await caches.open(PREFETCH_CACHE);
  try {
    const response = await fetch(route);
    if (response.ok) {
      await cache.put(route, response);
    }
  } catch (e) {
    // Ignore
  }
}

async function addToSyncQueue(item) {
  const database = await initDB();
  const tx = database.transaction('syncQueue', 'readwrite');
  tx.objectStore('syncQueue').add({
    ...item,
    id: `${item.type}-${Date.now()}`,
    timestamp: Date.now(),
    status: 'pending',
    retryCount: 0,
  });

  // Request background sync
  if ('sync' in self.registration) {
    await self.registration.sync.register('sync-queue');
  }
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.filter((n) => n.startsWith('fly2any-')).map((n) => caches.delete(n))
  );
  await notifyClients({ type: 'cache-cleared' });
}

async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}

async function notifyClients(message) {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  allClients.forEach((client) => client.postMessage(message));
}

console.log('[SW] Service Worker v2.0 loaded');
