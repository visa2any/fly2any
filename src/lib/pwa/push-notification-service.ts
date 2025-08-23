/**
 * Push Notification Service for Fly2Any
 * Handles sending booking updates, price alerts, and travel notifications
 */

import webpush from 'web-push';

// Configure VAPID details
const vapidConfig = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_SUBJECT || 'mailto:info@fly2any.com'
};

if (vapidConfig.publicKey && vapidConfig.privateKey) {
  webpush.setVapidDetails(
    vapidConfig.subject,
    vapidConfig.publicKey,
    vapidConfig.privateKey
  );
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  data?: {
    type: string;
    url?: string;
    bookingId?: string;
    flightId?: string;
    timestamp: string;
    [key: string]: any;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface BookingUpdate {
  bookingId: string;
  type: 'confirmation' | 'cancellation' | 'change' | 'reminder' | 'delay' | 'gate_change';
  title: string;
  message: string;
  flightNumber?: string;
  route?: string;
  newTime?: string;
  gate?: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface PriceAlert {
  route: string;
  originalPrice: number;
  newPrice: number;
  currency: string;
  savings: number;
  validUntil: string;
}

export interface TravelTip {
  title: string;
  content: string;
  category: 'visa' | 'weather' | 'culture' | 'money' | 'safety' | 'general';
  destination?: string;
}

class PushNotificationService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(vapidConfig.publicKey && vapidConfig.privateKey);
    
    if (!this.isConfigured) {
      console.warn('Push notifications not configured - VAPID keys missing');
    }
  }

  /**
   * Send booking update notification
   */
  async sendBookingUpdate(
    subscriptions: PushSubscription[],
    update: BookingUpdate
  ): Promise<void> {
    if (!this.isConfigured) {
      console.error('Push notifications not configured');
      return;
    }

    const payload = this.createBookingUpdatePayload(update);
    await this.sendToSubscriptions(subscriptions, payload);
  }

  /**
   * Send price alert notification
   */
  async sendPriceAlert(
    subscriptions: PushSubscription[],
    alert: PriceAlert
  ): Promise<void> {
    if (!this.isConfigured) {
      console.error('Push notifications not configured');
      return;
    }

    const payload = this.createPriceAlertPayload(alert);
    await this.sendToSubscriptions(subscriptions, payload);
  }

  /**
   * Send travel tip notification
   */
  async sendTravelTip(
    subscriptions: PushSubscription[],
    tip: TravelTip
  ): Promise<void> {
    if (!this.isConfigured) {
      console.error('Push notifications not configured');
      return;
    }

    const payload = this.createTravelTipPayload(tip);
    await this.sendToSubscriptions(subscriptions, payload);
  }

  /**
   * Send promotional notification
   */
  async sendPromotion(
    subscriptions: PushSubscription[],
    title: string,
    message: string,
    url?: string
  ): Promise<void> {
    if (!this.isConfigured) {
      console.error('Push notifications not configured');
      return;
    }

    const payload: NotificationPayload = {
      title: `🎉 ${title}`,
      body: message,
      icon: '/apple-touch-icon.png',
      badge: '/favicon-32x32.png',
      tag: 'promotion',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        type: 'promotion',
        url: url || '/',
        timestamp: new Date().toISOString()
      },
      actions: [
        {
          action: 'view_deal',
          title: 'View Deal',
          icon: '/favicon-32x32.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    await this.sendToSubscriptions(subscriptions, payload);
  }

  /**
   * Create booking update payload
   */
  private createBookingUpdatePayload(update: BookingUpdate): NotificationPayload {
    const icons = {
      confirmation: '✅',
      cancellation: '❌',
      change: '🔄',
      reminder: '⏰',
      delay: '⚠️',
      gate_change: '🚪'
    };

    const vibrations = {
      low: [100],
      medium: [200, 100, 200],
      high: [300, 100, 300, 100, 300]
    };

    let actions = [];
    
    if (update.type === 'confirmation') {
      actions = [
        { action: 'view_booking', title: 'View Booking', icon: '/favicon-32x32.png' },
        { action: 'download_ticket', title: 'Download Ticket' }
      ];
    } else if (update.type === 'delay' || update.type === 'gate_change') {
      actions = [
        { action: 'view_status', title: 'Flight Status', icon: '/favicon-32x32.png' },
        { action: 'contact_support', title: 'Contact Support' }
      ];
    } else {
      actions = [
        { action: 'view_booking', title: 'View Details', icon: '/favicon-32x32.png' }
      ];
    }

    return {
      title: `${icons[update.type]} ${update.title}`,
      body: update.message,
      icon: '/apple-touch-icon.png',
      badge: '/favicon-32x32.png',
      tag: `booking-${update.bookingId}`,
      requireInteraction: update.urgency === 'high',
      vibrate: vibrations[update.urgency],
      data: {
        type: 'booking_update',
        bookingId: update.bookingId,
        updateType: update.type,
        url: `/account/bookings/${update.bookingId}`,
        timestamp: new Date().toISOString(),
        urgency: update.urgency
      },
      actions
    };
  }

  /**
   * Create price alert payload
   */
  private createPriceAlertPayload(alert: PriceAlert): NotificationPayload {
    const savingsPercent = Math.round((alert.savings / alert.originalPrice) * 100);
    
    return {
      title: `💰 Price Drop Alert!`,
      body: `${alert.route} flights dropped by ${alert.currency}${alert.savings} (${savingsPercent}% off)`,
      icon: '/apple-touch-icon.png',
      badge: '/favicon-32x32.png',
      tag: 'price-alert',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        type: 'price_alert',
        route: alert.route,
        originalPrice: alert.originalPrice,
        newPrice: alert.newPrice,
        savings: alert.savings,
        url: `/flights?route=${encodeURIComponent(alert.route)}`,
        timestamp: new Date().toISOString()
      },
      actions: [
        {
          action: 'search_flights',
          title: 'Search Flights',
          icon: '/favicon-32x32.png'
        },
        {
          action: 'view_deals',
          title: 'More Deals'
        }
      ]
    };
  }

  /**
   * Create travel tip payload
   */
  private createTravelTipPayload(tip: TravelTip): NotificationPayload {
    const icons = {
      visa: '📋',
      weather: '🌤️',
      culture: '🎭',
      money: '💱',
      safety: '🛡️',
      general: '💡'
    };

    return {
      title: `${icons[tip.category]} ${tip.title}`,
      body: tip.content,
      icon: '/apple-touch-icon.png',
      badge: '/favicon-32x32.png',
      tag: 'travel-tip',
      requireInteraction: false,
      data: {
        type: 'travel_tip',
        category: tip.category,
        destination: tip.destination,
        url: '/blog',
        timestamp: new Date().toISOString()
      },
      actions: [
        {
          action: 'read_more',
          title: 'Read More',
          icon: '/favicon-32x32.png'
        }
      ]
    };
  }

  /**
   * Send notification to multiple subscriptions
   */
  private async sendToSubscriptions(
    subscriptions: PushSubscription[],
    payload: NotificationPayload
  ): Promise<void> {
    const payloadString = JSON.stringify(payload);
    const promises = subscriptions.map(subscription =>
      this.sendSingleNotification(subscription, payloadString)
    );

    const results = await Promise.allSettled(promises);
    
    // Log results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Push notifications sent: ${successful} successful, ${failed} failed`);
    
    // Handle failed subscriptions
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send to subscription ${index}:`, result.reason);
        
        // Check if subscription is expired/invalid and should be removed
        if (this.isSubscriptionInvalid(result.reason)) {
          this.handleInvalidSubscription(subscriptions[index]);
        }
      }
    });
  }

  /**
   * Send notification to single subscription
   */
  private async sendSingleNotification(
    subscription: any,
    payload: string
  ): Promise<void> {
    try {
      // Convert to web-push compatible format
      const webPushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys?.p256dh || '',
          auth: subscription.keys?.auth || ''
        }
      };
      await webpush.sendNotification(webPushSubscription, payload);
    } catch (error: any) {
      // Re-throw for proper error handling in sendToSubscriptions
      throw new Error(`Push notification failed: ${error.message}`);
    }
  }

  /**
   * Check if subscription error indicates invalid subscription
   */
  private isSubscriptionInvalid(error: any): boolean {
    const errorMessage = error.message || '';
    return (
      errorMessage.includes('expired') ||
      errorMessage.includes('unsubscribed') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('410') // HTTP 410 Gone
    );
  }

  /**
   * Handle invalid subscription (remove from database)
   */
  private async handleInvalidSubscription(subscription: PushSubscription): Promise<void> {
    try {
      // Remove from database
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      
      console.log('Removed invalid subscription:', subscription.endpoint);
    } catch (error) {
      console.error('Failed to remove invalid subscription:', error);
    }
  }

  /**
   * Get all active subscriptions for user preferences
   */
  async getSubscriptionsForNotificationType(
    type: 'bookingUpdates' | 'priceAlerts' | 'travelTips' | 'promotions'
  ): Promise<PushSubscription[]> {
    try {
      // This would query your database for subscriptions with the specific preference enabled
      // For now, return empty array as placeholder
      
      /*
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          isActive: true,
          preferences: {
            path: [type],
            equals: true
          }
        }
      });
      
      return subscriptions.map(sub => ({
        endpoint: sub.endpoint,
        keys: sub.keys
      }));
      */
      
      return [];
    } catch (error) {
      console.error('Failed to get subscriptions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Export utility functions for booking updates
export async function sendBookingConfirmation(bookingId: string, flightDetails: any): Promise<void> {
  const subscriptions = await pushNotificationService.getSubscriptionsForNotificationType('bookingUpdates');
  
  const update: BookingUpdate = {
    bookingId,
    type: 'confirmation',
    title: 'Booking Confirmed',
    message: `Your flight to ${flightDetails.destination} is confirmed! Check-in opens 24 hours before departure.`,
    flightNumber: flightDetails.flightNumber,
    route: flightDetails.route,
    urgency: 'medium'
  };

  await pushNotificationService.sendBookingUpdate(subscriptions, update);
}

export async function sendFlightDelay(bookingId: string, delayInfo: any): Promise<void> {
  const subscriptions = await pushNotificationService.getSubscriptionsForNotificationType('bookingUpdates');
  
  const update: BookingUpdate = {
    bookingId,
    type: 'delay',
    title: 'Flight Delayed',
    message: `Your flight ${delayInfo.flightNumber} is delayed by ${delayInfo.delayMinutes} minutes. New departure: ${delayInfo.newTime}`,
    flightNumber: delayInfo.flightNumber,
    route: delayInfo.route,
    newTime: delayInfo.newTime,
    urgency: 'high'
  };

  await pushNotificationService.sendBookingUpdate(subscriptions, update);
}

export async function sendGateChange(bookingId: string, gateInfo: any): Promise<void> {
  const subscriptions = await pushNotificationService.getSubscriptionsForNotificationType('bookingUpdates');
  
  const update: BookingUpdate = {
    bookingId,
    type: 'gate_change',
    title: 'Gate Change',
    message: `Gate changed for flight ${gateInfo.flightNumber}. New gate: ${gateInfo.newGate}`,
    flightNumber: gateInfo.flightNumber,
    route: gateInfo.route,
    gate: gateInfo.newGate,
    urgency: 'high'
  };

  await pushNotificationService.sendBookingUpdate(subscriptions, update);
}

export async function sendPriceDropAlert(route: string, priceData: any): Promise<void> {
  const subscriptions = await pushNotificationService.getSubscriptionsForNotificationType('priceAlerts');
  
  const alert: PriceAlert = {
    route,
    originalPrice: priceData.originalPrice,
    newPrice: priceData.newPrice,
    currency: priceData.currency,
    savings: priceData.originalPrice - priceData.newPrice,
    validUntil: priceData.validUntil
  };

  await pushNotificationService.sendPriceAlert(subscriptions, alert);
}

export default pushNotificationService;