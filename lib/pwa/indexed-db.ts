/**
 * IndexedDB Manager for PWA Offline Queue
 * Handles offline data persistence and sync queue management
 */

const DB_NAME = 'fly2any-pwa';
const DB_VERSION = 1;

export interface QueuedItem {
  id: string;
  type: 'booking' | 'price-alert' | 'search' | 'favorite';
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

export interface CachedSearch {
  id: string;
  query: any;
  results: any;
  timestamp: number;
  expiresAt: number;
}

export interface UserBehavior {
  route: string;
  visits: number;
  lastVisit: number;
  averageTime: number;
}

let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Cached searches store
      if (!db.objectStoreNames.contains('cachedSearches')) {
        const searchStore = db.createObjectStore('cachedSearches', { keyPath: 'id' });
        searchStore.createIndex('timestamp', 'timestamp', { unique: false });
        searchStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }

      // User behavior store for ML predictions
      if (!db.objectStoreNames.contains('userBehavior')) {
        const behaviorStore = db.createObjectStore('userBehavior', { keyPath: 'route' });
        behaviorStore.createIndex('visits', 'visits', { unique: false });
        behaviorStore.createIndex('lastVisit', 'lastVisit', { unique: false });
      }

      // Offline bookings draft store
      if (!db.objectStoreNames.contains('bookingDrafts')) {
        const draftStore = db.createObjectStore('bookingDrafts', { keyPath: 'id' });
        draftStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Push subscription store
      if (!db.objectStoreNames.contains('pushSubscription')) {
        db.createObjectStore('pushSubscription', { keyPath: 'id' });
      }
    };
  });
}

// Sync Queue Operations
export async function addToSyncQueue(item: Omit<QueuedItem, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
  const db = await initDB();
  const id = `${item.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const queueItem: QueuedItem = {
    ...item,
    id,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending',
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const request = store.add(queueItem);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getQueuedItems(type?: string): Promise<QueuedItem[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');

    let request: IDBRequest;
    if (type) {
      const index = store.index('type');
      request = index.getAll(type);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateQueueItemStatus(id: string, status: QueuedItem['status'], retryCount?: number): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.status = status;
        if (retryCount !== undefined) item.retryCount = retryCount;
        store.put(item);
      }
      resolve();
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Cached Search Operations
export async function cacheSearch(query: any, results: any, ttlMinutes = 30): Promise<void> {
  const db = await initDB();
  const id = JSON.stringify(query);

  const cachedSearch: CachedSearch = {
    id,
    query,
    results,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('cachedSearches', 'readwrite');
    const store = tx.objectStore('cachedSearches');
    const request = store.put(cachedSearch);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedSearch(query: any): Promise<any | null> {
  const db = await initDB();
  const id = JSON.stringify(query);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('cachedSearches', 'readonly');
    const store = tx.objectStore('cachedSearches');
    const request = store.get(id);

    request.onsuccess = () => {
      const result = request.result;
      if (result && result.expiresAt > Date.now()) {
        resolve(result.results);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function cleanExpiredSearches(): Promise<void> {
  const db = await initDB();
  const now = Date.now();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('cachedSearches', 'readwrite');
    const store = tx.objectStore('cachedSearches');
    const index = store.index('expiresAt');
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// User Behavior Tracking for ML Predictions
export async function trackPageVisit(route: string, timeSpent: number): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('userBehavior', 'readwrite');
    const store = tx.objectStore('userBehavior');
    const getRequest = store.get(route);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as UserBehavior | undefined;

      const behavior: UserBehavior = existing ? {
        route,
        visits: existing.visits + 1,
        lastVisit: Date.now(),
        averageTime: (existing.averageTime * existing.visits + timeSpent) / (existing.visits + 1),
      } : {
        route,
        visits: 1,
        lastVisit: Date.now(),
        averageTime: timeSpent,
      };

      store.put(behavior);
      resolve();
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function getPredictedRoutes(limit = 5): Promise<string[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('userBehavior', 'readonly');
    const store = tx.objectStore('userBehavior');
    const request = store.getAll();

    request.onsuccess = () => {
      const behaviors = request.result as UserBehavior[];
      // Score routes by recency and frequency
      const scored = behaviors.map(b => ({
        route: b.route,
        score: b.visits * Math.exp(-(Date.now() - b.lastVisit) / (7 * 24 * 60 * 60 * 1000)), // Decay over 7 days
      }));

      scored.sort((a, b) => b.score - a.score);
      resolve(scored.slice(0, limit).map(s => s.route));
    };
    request.onerror = () => reject(request.error);
  });
}

// Booking Draft Operations
export async function saveBookingDraft(id: string, data: any): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookingDrafts', 'readwrite');
    const store = tx.objectStore('bookingDrafts');
    const request = store.put({ id, data, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getBookingDraft(id: string): Promise<any | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookingDrafts', 'readonly');
    const store = tx.objectStore('bookingDrafts');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteBookingDraft(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookingDrafts', 'readwrite');
    const store = tx.objectStore('bookingDrafts');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Push Subscription Storage
export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('pushSubscription', 'readwrite');
    const store = tx.objectStore('pushSubscription');
    const request = store.put({ id: 'current', subscription: subscription.toJSON(), timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPushSubscription(): Promise<PushSubscriptionJSON | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('pushSubscription', 'readonly');
    const store = tx.objectStore('pushSubscription');
    const request = store.get('current');

    request.onsuccess = () => resolve(request.result?.subscription || null);
    request.onerror = () => reject(request.error);
  });
}

// Clear all data
export async function clearAllData(): Promise<void> {
  const db = await initDB();

  const stores = ['syncQueue', 'cachedSearches', 'userBehavior', 'bookingDrafts', 'pushSubscription'];

  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, 'readwrite');
    stores.forEach(storeName => {
      tx.objectStore(storeName).clear();
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
