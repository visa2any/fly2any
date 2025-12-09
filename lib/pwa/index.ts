/**
 * PWA Module Exports
 * Comprehensive PWA functionality for Fly2Any
 */

// Engagement tracking and smart install timing
export {
  emitEngagement,
  trackSearchCompleted,
  trackResultsViewed,
  trackBookingStarted,
  trackAlertCreated,
  prefetchRoute,
  addToOfflineQueue,
  requestSync,
  updateBadge,
  clearBadge,
  isInstalledPWA,
  isPushSupported,
} from './engagement';

// IndexedDB operations
export {
  initDB,
  addToSyncQueue,
  getQueuedItems,
  updateQueueItemStatus,
  removeFromSyncQueue,
  cacheSearch,
  getCachedSearch,
  cleanExpiredSearches,
  trackPageVisit,
  getPredictedRoutes,
  saveBookingDraft,
  getBookingDraft,
  deleteBookingDraft,
  savePushSubscription,
  getPushSubscription,
  clearAllData,
} from './indexed-db';

// Push notification management
export {
  isPushSupported as isPushNotificationSupported,
  getPermissionStatus,
  requestPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  showNotification,
  notifyPriceAlert,
  notifyBookingUpdate,
} from './push-manager';

// Re-export types
export type { QueuedItem, CachedSearch, UserBehavior } from './indexed-db';
export type { PushNotificationPayload } from './push-manager';
