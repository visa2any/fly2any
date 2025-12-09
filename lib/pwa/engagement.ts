/**
 * PWA Engagement Events
 * Emit events to trigger smart install prompts
 */

export type EngagementType = 'search' | 'results' | 'booking' | 'alert';

/**
 * Emit engagement event to trigger PWA install prompt at optimal time
 */
export function emitEngagement(type: EngagementType): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('fly2any:engagement', {
      detail: { type, timestamp: Date.now() },
    })
  );
}

/**
 * Track search completion - high intent signal
 */
export function trackSearchCompleted(): void {
  emitEngagement('search');
}

/**
 * Track results view - very high intent signal
 */
export function trackResultsViewed(): void {
  emitEngagement('results');
}

/**
 * Track booking started - highest intent signal
 */
export function trackBookingStarted(): void {
  emitEngagement('booking');
}

/**
 * Track price alert created
 */
export function trackAlertCreated(): void {
  emitEngagement('alert');
}

/**
 * Prefetch route for faster navigation
 */
export async function prefetchRoute(route: string): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({
      type: 'PREFETCH_ROUTE',
      payload: { route },
    });
  } catch (error) {
    console.error('Failed to prefetch route:', error);
  }
}

/**
 * Add item to offline sync queue
 */
export async function addToOfflineQueue(
  type: 'booking' | 'price-alert' | 'search' | 'favorite',
  data: any
): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({
      type: 'ADD_TO_SYNC_QUEUE',
      payload: { type, data },
    });
  } catch (error) {
    console.error('Failed to add to offline queue:', error);
  }
}

/**
 * Request background sync
 */
export async function requestSync(tag: string = 'sync-queue'): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await (registration as any).sync.register(tag);
    }
  } catch (error) {
    console.error('Failed to request sync:', error);
  }
}

/**
 * Update app badge count
 */
export async function updateBadge(count: number): Promise<void> {
  if (typeof navigator === 'undefined') return;

  if ('setAppBadge' in navigator) {
    try {
      if (count > 0) {
        await (navigator as any).setAppBadge(count);
      } else {
        await (navigator as any).clearAppBadge();
      }
    } catch (error) {
      console.error('Failed to update badge:', error);
    }
  }
}

/**
 * Clear app badge
 */
export async function clearBadge(): Promise<void> {
  if (typeof navigator === 'undefined') return;

  if ('clearAppBadge' in navigator) {
    try {
      await (navigator as any).clearAppBadge();
    } catch (error) {
      console.error('Failed to clear badge:', error);
    }
  }
}

/**
 * Check if app is installed as PWA
 */
export function isInstalledPWA(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}
