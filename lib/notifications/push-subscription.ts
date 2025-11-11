/**
 * Push Notification Subscription Library
 * Handles web push notification registration and management
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPermissionState {
  permission: NotificationPermission;
  supported: boolean;
  subscribed: boolean;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current notification permission state
 */
export async function getNotificationState(): Promise<NotificationPermissionState> {
  if (!isPushNotificationSupported()) {
    return {
      permission: 'denied',
      supported: false,
      subscribed: false,
    };
  }

  const permission = Notification.permission;
  const subscribed = await isSubscribed();

  return {
    permission,
    supported: true,
    subscribed,
  };
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const permission = await Notification.requestPermission();

  // Track permission request
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'notification_permission', {
      event_category: 'Notifications',
      event_label: permission,
    });
  }

  return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscriptionData> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  // Request permission first
  const permission = await requestNotificationPermission();

  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    // Subscribe to push notifications
    // Note: You need to replace this with your actual VAPID public key
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured');
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
    });
  }

  const subscriptionData = subscriptionToData(subscription);

  // Save subscription to server
  await saveSubscriptionToServer(subscriptionData);

  return subscriptionData;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (!isPushNotificationSupported()) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const subscriptionData = subscriptionToData(subscription);

    // Remove subscription from server
    await removeSubscriptionFromServer(subscriptionData.endpoint);

    // Unsubscribe from browser
    await subscription.unsubscribe();
  }
}

/**
 * Check if currently subscribed
 */
export async function isSubscribed(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
}

/**
 * Get current subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscriptionData | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return null;
    }

    return subscriptionToData(subscription);
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
}

/**
 * Save subscription to server
 */
async function saveSubscriptionToServer(
  subscription: PushSubscriptionData
): Promise<void> {
  try {
    const response = await fetch('/api/pwa/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription to server');
    }

    console.log('Subscription saved to server');
  } catch (error) {
    console.error('Failed to save subscription:', error);
    throw error;
  }
}

/**
 * Remove subscription from server
 */
async function removeSubscriptionFromServer(endpoint: string): Promise<void> {
  try {
    const response = await fetch('/api/pwa/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove subscription from server');
    }

    console.log('Subscription removed from server');
  } catch (error) {
    console.error('Failed to remove subscription:', error);
    throw error;
  }
}

/**
 * Convert PushSubscription to data object
 */
function subscriptionToData(subscription: PushSubscription): PushSubscriptionData {
  const keys = subscription.toJSON().keys as {
    p256dh?: string;
    auth?: string;
  };

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: keys.p256dh || '',
      auth: keys.auth || '',
    },
  };
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Show a test notification
 */
export async function showTestNotification(): Promise<void> {
  if (!isPushNotificationSupported()) {
    throw new Error('Notifications are not supported');
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification('Fly2Any', {
    body: 'Test notification - Your notifications are working!',
    icon: '/fly2any-logo.png',
    badge: '/fly2any-logo.png',
    tag: 'test-notification',
    data: {
      url: '/',
    },
  });
}

/**
 * Request and subscribe in one step
 */
export async function setupPushNotifications(): Promise<{
  success: boolean;
  subscription?: PushSubscriptionData;
  error?: string;
}> {
  try {
    if (!isPushNotificationSupported()) {
      return {
        success: false,
        error: 'Push notifications are not supported on this device/browser',
      };
    }

    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Notification permission was denied',
      };
    }

    const subscription = await subscribeToPushNotifications();

    return {
      success: true,
      subscription,
    };
  } catch (error) {
    console.error('Failed to setup push notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get notification settings summary
 */
export async function getNotificationSettings(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  endpoint?: string;
}> {
  const state = await getNotificationState();
  const subscription = await getCurrentSubscription();

  return {
    supported: state.supported,
    permission: state.permission,
    subscribed: state.subscribed,
    endpoint: subscription?.endpoint,
  };
}
