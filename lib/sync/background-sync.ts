/**
 * Background Sync Library
 * Handles queuing and syncing of offline actions
 */

export interface SyncItem {
  id: string;
  type: 'booking' | 'price-alert' | 'search' | 'preference';
  data: any;
  timestamp: number;
  retryCount: number;
  lastAttempt?: number;
}

export interface SyncStatus {
  pending: number;
  syncing: boolean;
  lastSync?: number;
  errors: string[];
}

const SYNC_QUEUE_KEY = 'fly2any-pending-sync';
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Queue an action for background sync
 */
export async function queueForSync(
  type: SyncItem['type'],
  data: any
): Promise<string> {
  const id = generateId();
  const item: SyncItem = {
    id,
    type,
    data,
    timestamp: Date.now(),
    retryCount: 0,
  };

  const queue = await getQueue();
  queue.push(item);
  await saveQueue(queue);

  // Register background sync if supported
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await registration.sync.register(`sync-${type}-${id}`);
      } else {
        // Fallback: try to sync immediately if background sync not supported
        await syncItem(item);
      }
    } catch (error) {
      console.error('Failed to register background sync:', error);
      // Will be synced on next online event
    }
  }

  return id;
}

/**
 * Get the current sync queue
 */
export async function getQueue(): Promise<SyncItem[]> {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get sync queue:', error);
    return [];
  }
}

/**
 * Save the sync queue
 */
async function saveQueue(queue: SyncItem[]): Promise<void> {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save sync queue:', error);
  }
}

/**
 * Remove an item from the queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((item) => item.id !== id);
  await saveQueue(filtered);
}

/**
 * Clear the entire queue
 */
export async function clearQueue(): Promise<void> {
  try {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear sync queue:', error);
  }
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  const queue = await getQueue();
  const lastSyncStr = localStorage.getItem('fly2any-last-sync');
  const errorsStr = localStorage.getItem('fly2any-sync-errors');

  return {
    pending: queue.length,
    syncing: false, // This would be managed by a state manager in production
    lastSync: lastSyncStr ? parseInt(lastSyncStr) : undefined,
    errors: errorsStr ? JSON.parse(errorsStr) : [],
  };
}

/**
 * Sync a single item
 */
export async function syncItem(item: SyncItem): Promise<boolean> {
  try {
    const endpoint = getEndpointForType(item.type);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (response.ok) {
      await removeFromQueue(item.id);
      return true;
    } else {
      // Update retry count
      const queue = await getQueue();
      const itemIndex = queue.findIndex((i) => i.id === item.id);
      if (itemIndex !== -1) {
        queue[itemIndex].retryCount++;
        queue[itemIndex].lastAttempt = Date.now();

        if (queue[itemIndex].retryCount >= MAX_RETRY_COUNT) {
          // Max retries reached, log error and remove
          await logSyncError(item, 'Max retries reached');
          queue.splice(itemIndex, 1);
        }

        await saveQueue(queue);
      }
      return false;
    }
  } catch (error) {
    console.error('Failed to sync item:', error);
    return false;
  }
}

/**
 * Sync all pending items
 */
export async function syncAll(): Promise<void> {
  const queue = await getQueue();

  for (const item of queue) {
    // Skip items that were recently attempted
    if (item.lastAttempt && Date.now() - item.lastAttempt < RETRY_DELAY) {
      continue;
    }

    await syncItem(item);
  }

  // Update last sync timestamp
  localStorage.setItem('fly2any-last-sync', Date.now().toString());
}

/**
 * Auto-sync when online
 */
export function setupAutoSync(): void {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    console.log('Connection restored, syncing...');
    await syncAll();
  };

  window.addEventListener('online', handleOnline);

  // Initial sync if online
  if (navigator.onLine) {
    syncAll();
  }
}

/**
 * Get API endpoint for sync type
 */
function getEndpointForType(type: SyncItem['type']): string {
  const endpoints: Record<SyncItem['type'], string> = {
    booking: '/api/bookings',
    'price-alert': '/api/price-alerts',
    search: '/api/searches',
    preference: '/api/user/preferences',
  };

  return endpoints[type] || '/api/sync';
}

/**
 * Log sync error
 */
async function logSyncError(item: SyncItem, error: string): Promise<void> {
  try {
    const errorsStr = localStorage.getItem('fly2any-sync-errors');
    const errors = errorsStr ? JSON.parse(errorsStr) : [];

    errors.push({
      id: item.id,
      type: item.type,
      error,
      timestamp: Date.now(),
    });

    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50);
    }

    localStorage.setItem('fly2any-sync-errors', JSON.stringify(errors));
  } catch (error) {
    console.error('Failed to log sync error:', error);
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if background sync is supported
 */
export function isBackgroundSyncSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype;
}

/**
 * Retry failed sync items
 */
export async function retryFailedSyncs(): Promise<void> {
  const queue = await getQueue();
  const failedItems = queue.filter(
    (item) => item.retryCount > 0 && item.retryCount < MAX_RETRY_COUNT
  );

  for (const item of failedItems) {
    await syncItem(item);
  }
}

/**
 * Get sync statistics
 */
export async function getSyncStats(): Promise<{
  totalPending: number;
  byType: Record<string, number>;
  failedCount: number;
  oldestPending?: number;
}> {
  const queue = await getQueue();

  const byType: Record<string, number> = {};
  let failedCount = 0;
  let oldestPending: number | undefined;

  for (const item of queue) {
    byType[item.type] = (byType[item.type] || 0) + 1;
    if (item.retryCount > 0) failedCount++;
    if (!oldestPending || item.timestamp < oldestPending) {
      oldestPending = item.timestamp;
    }
  }

  return {
    totalPending: queue.length,
    byType,
    failedCount,
    oldestPending,
  };
}
