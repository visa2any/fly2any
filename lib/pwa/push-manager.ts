/**
 * Push Notification Manager
 * Handles web push subscription, permissions, and notifications
 */

import { savePushSubscription, getPushSubscription } from './indexed-db';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: Record<string, any>;
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;
}

// Get current permission status
export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

// Request notification permission
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Subscribe to push notifications
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  if (Notification.permission !== 'granted') {
    const permission = await requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription && VAPID_PUBLIC_KEY) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    if (subscription) {
      // Store locally
      await savePushSubscription(subscription);

      // Send to server
      await sendSubscriptionToServer(subscription);
    }

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await removeSubscriptionFromServer(subscription);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
}

// Get current subscription
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
}

// Send subscription to server
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
  }
}

// Remove subscription from server
async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });
  } catch (error) {
    console.error('Failed to remove subscription from server:', error);
  }
}

// Show local notification (for in-app use)
export async function showNotification(payload: PushNotificationPayload): Promise<void> {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    console.warn('Cannot show notification - not supported or not permitted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/fly2any-logo.png',
      badge: payload.badge || '/fly2any-logo.png',
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      data: {
        url: payload.url || '/',
        image: payload.image,
        actions: payload.actions, // Store in data for service worker
        ...payload.data,
      },
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

// Update app badge (notification count)
export async function updateBadge(count: number): Promise<void> {
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

// Clear app badge
export async function clearBadge(): Promise<void> {
  if ('clearAppBadge' in navigator) {
    try {
      await (navigator as any).clearAppBadge();
    } catch (error) {
      console.error('Failed to clear badge:', error);
    }
  }
}

// Helper: Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer;
}

// Price alert notification helper
export async function notifyPriceAlert(
  flightInfo: { from: string; to: string; date: string },
  oldPrice: number,
  newPrice: number,
  currency: string = 'USD'
): Promise<void> {
  const savings = oldPrice - newPrice;
  const percentOff = Math.round((savings / oldPrice) * 100);

  await showNotification({
    title: `Price Drop Alert! ${percentOff}% off`,
    body: `${flightInfo.from} → ${flightInfo.to} now ${currency} ${newPrice} (was ${currency} ${oldPrice})`,
    icon: '/icons/price-drop.png',
    tag: `price-alert-${flightInfo.from}-${flightInfo.to}`,
    url: `/flights/results?from=${flightInfo.from}&to=${flightInfo.to}&date=${flightInfo.date}`,
    requireInteraction: true,
    actions: [
      { action: 'book', title: 'Book Now' },
      { action: 'dismiss', title: 'Later' },
    ],
  });
}

// Booking update notification helper
export async function notifyBookingUpdate(
  bookingId: string,
  type: 'confirmed' | 'cancelled' | 'modified' | 'reminder',
  message: string
): Promise<void> {
  const titles: Record<string, string> = {
    confirmed: 'Booking Confirmed!',
    cancelled: 'Booking Cancelled',
    modified: 'Flight Schedule Changed',
    reminder: 'Trip Reminder',
  };

  await showNotification({
    title: titles[type],
    body: message,
    icon: `/icons/${type}.png`,
    tag: `booking-${bookingId}`,
    url: `/account/bookings/${bookingId}`,
    requireInteraction: type === 'modified',
  });
}
