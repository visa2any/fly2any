/**
 * Service Worker for Fly2Any Mobile App
 *
 * Features:
 * - Offline caching for static assets
 * - API response caching with network-first strategy
 * - Background sync for failed requests
 * - Push notification handling
 */

// Version with timestamp to force updates on new deployments
const VERSION = 'v4-' + new Date().getTime();
const STATIC_CACHE = 'fly2any-static-' + VERSION;
const API_CACHE = 'fly2any-api-' + VERSION;
const IMAGE_CACHE = 'fly2any-images-' + VERSION;

// Assets to cache immediately on install - only existing assets
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets with individual error handling
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      console.log('[SW] Caching static assets');
      
      // Cache assets individually to prevent one failure from blocking installation
      const cachePromises = STATIC_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
            console.log('[SW] Cached:', url);
          } else {
            console.warn('[SW] Failed to cache (non-200):', url, response.status);
          }
        } catch (err) {
          console.warn('[SW] Failed to cache:', url, err.message);
        }
      });
      
      await Promise.allSettled(cachePromises);
      console.log('[SW] Installation complete');
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE &&
                   cacheName !== API_CACHE &&
                   cacheName !== IMAGE_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );

  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Ignore cross-origin requests (Google Tag Manager, Unsplash, external APIs)
  // Let the browser handle these directly to avoid opaque response issues and NetworkErrors
  if (url.origin !== self.location.origin) {
    return;
  }

  // ─── CRITICAL: Never intercept Next.js RSC (React Server Component) requests ───
  // RSC requests use ?_rsc= query params or Rsc/Next-Router headers.
  // Their request.destination is "" (empty), so they fall through to the default handler.
  // If the SW fetch fails, the entire page hangs with no error boundary catching it.
  if (url.searchParams.has('_rsc') || request.headers.get('Rsc') || request.headers.get('Next-Router-State-Tree')) {
    return;
  }

  // ─── CRITICAL: Never intercept auth routes ───
  // Caching auth responses corrupts session state and causes NetworkError loops
  if (url.pathname.startsWith('/api/auth')) {
    return;
  }

  // Don't cache Next.js internal routes
  if (url.pathname.startsWith('/_next/')) {
    return;
  }

  // API routes (non-auth) - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Images - cache first for performance
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // HTML documents - network first
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Everything else (empty destination, etc.) - let browser handle natively
  // Do NOT call event.respondWith() — this returns control to the browser
  return;
});

async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    // No offline page fallback - let browser handle offline state
    throw error;
  }
}

async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    throw error;
  }
}

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Fly2Any',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
  };
  event.waitUntil(
    self.registration.showNotification('Fly2Any', options)
  );
});

console.log('[SW] Service worker script loaded');
