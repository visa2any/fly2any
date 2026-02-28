/**
 * Push Notification Service for Fly2Any
 * 
 * Sends push notifications to mobile app users via FCM HTTP v1 API.
 * Uses Google's FCM as delivery transport (free, unlimited).
 * Business logic and token storage stays in your Prisma/Supabase stack.
 * 
 * Setup required:
 * 1. Create Firebase project at console.firebase.google.com
 * 2. Download google-services.json → android/app/
 * 3. Download GoogleService-Info.plist → ios/App/App/
 * 4. Set FIREBASE_SERVER_KEY env var (from Firebase Console → Project Settings → Cloud Messaging)
 */

import { prisma } from '@/lib/prisma';

const FCM_SEND_URL = 'https://fcm.googleapis.com/fcm/send';

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  badge?: number;
}

interface SendResult {
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Send push notification to a single device token via FCM
 */
export async function sendPushToToken(
  token: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  const serverKey = process.env.FIREBASE_SERVER_KEY;
  
  if (!serverKey) {
    console.warn('[Push] FIREBASE_SERVER_KEY not set — push notifications disabled');
    return false;
  }

  try {
    const message = {
      to: token,
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.imageUrl,
        badge: payload.badge?.toString(),
        sound: 'default',
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // Capacitor compatibility
      },
      data: {
        ...payload.data,
        title: payload.title,
        body: payload.body,
      },
      // Android-specific
      android: {
        priority: 'high' as const,
        notification: {
          channel_id: 'fly2any_default',
          color: '#E74035', // Brand red
          icon: 'ic_stat_icon_config_sample',
        },
      },
      // iOS-specific (APNs via FCM)
      apns: {
        payload: {
          aps: {
            badge: payload.badge || 1,
            sound: 'default',
            'content-available': 1,
          },
        },
      },
    };

    const response = await fetch(FCM_SEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`,
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Push] FCM send failed:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    
    if (result.failure > 0) {
      // Token might be invalid — clean up
      console.warn('[Push] FCM delivery failed for token:', token.substring(0, 20) + '...');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Push] Failed to send push notification:', error);
    return false;
  }
}

/**
 * Send push notification to a specific user (all their registered devices)
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<SendResult> {
  const result: SendResult = { sent: 0, failed: 0, errors: [] };

  if (!prisma) {
    result.errors.push('Prisma client not available');
    return result;
  }

  try {
    // Get all push tokens for this user (mobile devices)
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    // Filter to mobile tokens only (platform stored in p256dh field)
    const mobileTokens = subscriptions.filter(
      (sub) => sub.p256dh === 'ios' || sub.p256dh === 'android'
    );

    if (mobileTokens.length === 0) {
      result.errors.push('No mobile push tokens found for user');
      return result;
    }

    // Send to all devices
    for (const sub of mobileTokens) {
      const success = await sendPushToToken(sub.endpoint, payload);
      if (success) {
        result.sent++;
      } else {
        result.failed++;
        result.errors.push(`Failed for token: ${sub.endpoint.substring(0, 15)}...`);
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    return result;
  }
}

/**
 * Send push notification to all registered mobile users
 * Use for broadcast announcements (flash deals, etc.)
 */
export async function sendPushBroadcast(
  payload: PushNotificationPayload,
  platform?: 'ios' | 'android'
): Promise<SendResult> {
  const result: SendResult = { sent: 0, failed: 0, errors: [] };

  if (!prisma) {
    result.errors.push('Prisma client not available');
    return result;
  }

  try {
    const where: any = {};
    if (platform) {
      where.p256dh = platform;
    } else {
      where.p256dh = { in: ['ios', 'android'] };
    }

    const subscriptions = await prisma.pushSubscription.findMany({ where });

    console.log(`[Push] Broadcasting to ${subscriptions.length} devices...`);

    for (const sub of subscriptions) {
      const success = await sendPushToToken(sub.endpoint, payload);
      if (success) {
        result.sent++;
      } else {
        result.failed++;
      }
    }

    console.log(`[Push] Broadcast complete: ${result.sent} sent, ${result.failed} failed`);
    return result;
  } catch (error) {
    result.errors.push(`Broadcast error: ${error instanceof Error ? error.message : 'Unknown'}`);
    return result;
  }
}

/**
 * Pre-built notification templates for common Fly2Any events
 */
export const pushTemplates = {
  priceDropAlert: (route: string, oldPrice: number, newPrice: number, currency = 'USD') => ({
    title: '✈️ Price Drop Alert!',
    body: `${route} dropped from $${oldPrice} to $${newPrice} ${currency}! Book now before it goes back up.`,
    data: { type: 'price_drop', route },
  }),

  bookingConfirmed: (bookingRef: string, route: string) => ({
    title: '🎉 Booking Confirmed!',
    body: `Your ${route} trip is confirmed. Ref: ${bookingRef}`,
    data: { type: 'booking_confirmed', bookingRef },
  }),

  flashDeal: (destination: string, price: number, currency = 'USD') => ({
    title: '🔥 Flash Deal!',
    body: `Fly to ${destination} from just $${price} ${currency}. Limited time only!`,
    data: { type: 'flash_deal', destination },
  }),

  tripReminder: (destination: string, daysUntil: number) => ({
    title: '🗓️ Trip Coming Up!',
    body: `Your trip to ${destination} is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}. Ready to go?`,
    data: { type: 'trip_reminder', destination },
  }),

  checkInReminder: (airline: string, flightNumber: string) => ({
    title: '📋 Time to Check In!',
    body: `Online check-in is now open for ${airline} ${flightNumber}. Check in early for the best seats!`,
    data: { type: 'check_in', flightNumber },
  }),
};
