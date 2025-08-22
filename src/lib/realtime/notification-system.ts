/**
 * 🔔 REAL-TIME NOTIFICATIONS SYSTEM
 * Advanced notification system for travel booking updates
 * - Price change alerts
 * - Inventory updates
 * - Booking confirmations
 * - Flight status changes
 * - Push notifications (PWA)
 * - Email/SMS integration
 * - WebSocket real-time updates
 */

import { z } from 'zod';

// ========================================
// TYPE DEFINITIONS & SCHEMAS
// ========================================

export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum([
    'price_change',
    'inventory_update', 
    'booking_confirmation',
    'flight_status',
    'hotel_update',
    'car_update',
    'activity_update',
    'weather_alert',
    'travel_advisory',
    'promotion'
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  title: z.string(),
  message: z.string(),
  data: z.any().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  channels: z.array(z.enum(['push', 'email', 'sms', 'websocket', 'in_app'])),
  scheduledFor: z.string().optional(), // ISO datetime
  expiresAt: z.string().optional(),
  actionUrl: z.string().optional(),
  actionText: z.string().optional(),
  imageUrl: z.string().optional(),
  createdAt: z.string(),
  readAt: z.string().optional(),
  clickedAt: z.string().optional()
});

export type Notification = z.infer<typeof NotificationSchema>;

export interface NotificationPreferences {
  userId: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  types: {
    price_changes: boolean;
    booking_updates: boolean;
    flight_status: boolean;
    promotions: boolean;
    travel_advisories: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;   // HH:mm
    timezone: string;
  };
  frequency: {
    price_alerts: 'instant' | 'daily' | 'weekly';
    promotional: 'instant' | 'daily' | 'weekly' | 'never';
  };
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  sessionId?: string;
}

// ========================================
// REAL-TIME NOTIFICATION SYSTEM
// ========================================

class RealTimeNotificationSystem {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private subscribers: Map<string, ((notification: Notification) => void)[]> = new Map();
  private notificationHistory: Notification[] = [];

  constructor() {
    this.initializeWebSocket();
    this.requestNotificationPermission();
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private async initializeWebSocket() {
    if (typeof window === 'undefined') return; // Server-side check

    // Skip WebSocket in development if server is not running
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 WebSocket disabled in development mode');
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected for real-time notifications');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.sendQueuedMessages();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.stopHeartbeat();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket connection failed - running in offline mode');
        // Don't spam console in development
        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
          console.error('WebSocket error:', error);
        }
      };

    } catch (error) {
      console.warn('WebSocket not available - running in offline mode');
      if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
        console.error('Failed to initialize WebSocket:', error);
      }
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'notification':
        this.processNotification(message.payload);
        break;
      case 'price_update':
        this.handlePriceUpdate(message.payload);
        break;
      case 'inventory_update':
        this.handleInventoryUpdate(message.payload);
        break;
      case 'booking_status':
        this.handleBookingStatus(message.payload);
        break;
      case 'flight_status':
        this.handleFlightStatus(message.payload);
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  /**
   * Process and display notification
   */
  private processNotification(notificationData: any) {
    try {
      const notification = NotificationSchema.parse(notificationData);
      
      // Add to history
      this.notificationHistory.unshift(notification);
      
      // Keep only last 50 notifications
      if (this.notificationHistory.length > 50) {
        this.notificationHistory = this.notificationHistory.slice(0, 50);
      }

      // Notify subscribers
      const subscribers = this.subscribers.get(notification.type) || [];
      subscribers.forEach(callback => callback(notification));

      // Show notification based on channels
      if (notification.channels.includes('push') && this.canShowPushNotification()) {
        this.showPushNotification(notification);
      }

      if (notification.channels.includes('in_app')) {
        this.showInAppNotification(notification);
      }

      // Track analytics
      this.trackNotificationEvent('delivered', notification);

    } catch (error) {
      console.error('Failed to process notification:', error);
    }
  }

  /**
   * Handle price update notifications
   */
  private handlePriceUpdate(data: any) {
    const notification: Notification = {
      id: `price_${Date.now()}`,
      type: 'price_change',
      priority: data.change > 0 ? 'high' : 'medium',
      title: data.change > 0 ? 'Price Increased!' : 'Price Dropped!',
      message: `${data.itemType} price ${data.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(data.change)}${data.currency}`,
      data: data,
      channels: ['push', 'in_app'],
      actionUrl: data.bookingUrl,
      actionText: data.change < 0 ? 'Book Now' : 'View Options',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    this.processNotification(notification);
  }

  /**
   * Handle inventory updates
   */
  private handleInventoryUpdate(data: any) {
    if (data.remaining <= 3) { // Low inventory threshold
      const notification: Notification = {
        id: `inventory_${Date.now()}`,
        type: 'inventory_update',
        priority: 'urgent',
        title: 'Limited Availability!',
        message: `Only ${data.remaining} ${data.itemType} left at this price`,
        data: data,
        channels: ['push', 'in_app'],
        actionUrl: data.bookingUrl,
        actionText: 'Book Now',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      };

      this.processNotification(notification);
    }
  }

  /**
   * Handle booking status updates
   */
  private handleBookingStatus(data: any) {
    const notification: Notification = {
      id: `booking_${data.bookingId}`,
      type: 'booking_confirmation',
      priority: 'high',
      title: `Booking ${data.status}`,
      message: data.message || `Your booking has been ${data.status.toLowerCase()}`,
      data: data,
      channels: ['push', 'email', 'in_app'],
      actionUrl: `/bookings/${data.bookingId}`,
      actionText: 'View Details',
      createdAt: new Date().toISOString()
    };

    this.processNotification(notification);
  }

  /**
   * Handle flight status updates
   */
  private handleFlightStatus(data: any) {
    const isDelayOrCancellation = ['delayed', 'cancelled'].includes(data.status.toLowerCase());
    
    const notification: Notification = {
      id: `flight_${data.flightNumber}_${Date.now()}`,
      type: 'flight_status',
      priority: isDelayOrCancellation ? 'urgent' : 'medium',
      title: `Flight ${data.flightNumber} ${data.status}`,
      message: data.message || `Your flight status has been updated to ${data.status}`,
      data: data,
      channels: ['push', 'email', 'sms', 'in_app'],
      actionUrl: `/bookings/${data.bookingId}`,
      actionText: 'View Flight',
      createdAt: new Date().toISOString()
    };

    this.processNotification(notification);
  }

  /**
   * Show push notification
   */
  private showPushNotification(notification: Notification) {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(notification.title, {
            body: notification.message,
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            // image: notification.imageUrl, // image property not supported in standard NotificationOptions
            data: {
              id: notification.id,
              url: notification.actionUrl
            },
            // actions: notification.actionText ? [{ // actions not supported in standard NotificationOptions
            //   action: 'open',
            //   title: notification.actionText
            // }] : [],
            requireInteraction: notification.priority === 'urgent',
            silent: notification.priority === 'low'
          });
        });
      }
    }
  }

  /**
   * Show in-app notification
   */
  private showInAppNotification(notification: Notification) {
    // Dispatch custom event that UI components can listen to
    const event = new CustomEvent('fly2any-notification', {
      detail: notification
    });
    window.dispatchEvent(event);
  }

  /**
   * Request notification permission
   */
  private async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  }

  /**
   * Check if push notifications can be shown
   */
  private canShowPushNotification(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Start WebSocket heartbeat
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop WebSocket heartbeat
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max WebSocket reconnection attempts reached');
    }
  }

  /**
   * Schedule reconnect
   */
  private scheduleReconnect() {
    setTimeout(() => {
      this.initializeWebSocket();
    }, 5000);
  }

  /**
   * Send queued messages
   */
  private sendQueuedMessages() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Track notification analytics
   */
  private trackNotificationEvent(event: string, notification: Notification) {
    // Integration with analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'notification', {
        event_category: 'engagement',
        event_label: notification.type,
        custom_parameter_1: event,
        custom_parameter_2: notification.priority
      });
    }
  }

  // ========================================
  // PUBLIC API METHODS
  // ========================================

  /**
   * Subscribe to specific notification types
   */
  subscribe(notificationType: string, callback: (notification: Notification) => void) {
    if (!this.subscribers.has(notificationType)) {
      this.subscribers.set(notificationType, []);
    }
    
    this.subscribers.get(notificationType)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(notificationType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Send message via WebSocket
   */
  sendMessage(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Get notification history
   */
  getHistory(limit = 20): Notification[] {
    return this.notificationHistory.slice(0, limit);
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.notificationHistory.filter(n => !n.readAt).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string) {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.readAt = new Date().toISOString();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    const now = new Date().toISOString();
    this.notificationHistory.forEach(n => {
      if (!n.readAt) {
        n.readAt = now;
      }
    });
  }

  /**
   * Create price alert
   */
  createPriceAlert(itemId: string, targetPrice: number, currency: string = 'USD') {
    const message: WebSocketMessage = {
      type: 'create_price_alert',
      payload: {
        itemId,
        targetPrice,
        currency,
        userId: this.getUserId(),
        sessionId: this.getSessionId()
      },
      timestamp: new Date().toISOString()
    };

    this.sendMessage(message);
  }

  /**
   * Cancel price alert
   */
  cancelPriceAlert(alertId: string) {
    const message: WebSocketMessage = {
      type: 'cancel_price_alert',
      payload: { alertId },
      timestamp: new Date().toISOString()
    };

    this.sendMessage(message);
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Send test notification
   */
  sendTestNotification() {
    const testNotification: Notification = {
      id: `test_${Date.now()}`,
      type: 'promotion',
      priority: 'medium',
      title: 'Test Notification',
      message: 'This is a test notification from Fly2Any',
      channels: ['push', 'in_app'],
      createdAt: new Date().toISOString()
    };

    this.processNotification(testNotification);
  }

  /**
   * Close WebSocket connection
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private getUserId(): string {
    // Get from localStorage or session
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getSessionId(): string {
    // Get from session storage
    return sessionStorage.getItem('sessionId') || `session_${Date.now()}`;
  }
}

// ========================================
// EXPORT SINGLETON INSTANCE
// ========================================

export const notificationSystem = new RealTimeNotificationSystem();
export default notificationSystem;

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format notification time
 */
export function formatNotificationTime(timestamp: string): string {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffMs = now.getTime() - notificationTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return notificationTime.toLocaleDateString();
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: Notification['type']): string {
  const iconMap: { [key in Notification['type']]: string } = {
    price_change: '💰',
    inventory_update: '⚠️',
    booking_confirmation: '✅',
    flight_status: '✈️',
    hotel_update: '🏨',
    car_update: '🚗',
    activity_update: '🎭',
    weather_alert: '🌤️',
    travel_advisory: '📢',
    promotion: '🎉'
  };

  return iconMap[type] || '🔔';
}

/**
 * Get notification color based on priority
 */
export function getNotificationColor(priority: Notification['priority']): string {
  const colorMap: { [key in Notification['priority']]: string } = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  };

  return colorMap[priority];
}

/**
 * Check if notification should be shown based on quiet hours
 */
export function shouldShowNotification(
  notification: Notification,
  preferences: NotificationPreferences
): boolean {
  if (!preferences.quiet_hours.enabled) return true;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Simple time comparison (doesn't handle cross-day ranges)
  return !(currentTime >= preferences.quiet_hours.start && currentTime <= preferences.quiet_hours.end);
}