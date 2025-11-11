/**
 * Type definitions for Notification System
 * Team 2 - Notification & Communication
 */

// ==================== Notification Types ====================

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_modified'
  | 'price_alert_triggered'
  | 'payment_successful'
  | 'payment_failed'
  | 'system_update'
  | 'promotion'
  | 'account_security'
  | 'trip_reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationChannel = 'in-app' | 'email' | 'push';

// ==================== Notification Interface ====================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  metadata?: NotificationMetadata;
  createdAt: Date;
  readAt?: Date;
}

// ==================== Notification Metadata ====================

export interface NotificationMetadata {
  bookingId?: string;
  priceAlertId?: string;
  paymentId?: string;
  originalPrice?: number;
  newPrice?: number;
  currency?: string;
  route?: {
    origin: string;
    destination: string;
  };
  imageUrl?: string;
  actionLabel?: string;
  [key: string]: any;
}

// ==================== Notification Filters ====================

export interface NotificationFilters {
  type?: NotificationType | 'all';
  read?: boolean | 'all';
  priority?: NotificationPriority | 'all';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  filters?: NotificationFilters;
  sortBy?: 'createdAt' | 'priority' | 'read';
  sortOrder?: 'asc' | 'desc';
}

// ==================== Notification Preferences ====================

export interface NotificationPreferences {
  userId: string;

  // In-app notifications
  inAppEnabled: boolean;

  // Email notifications
  emailEnabled: boolean;
  emailBookingConfirmed: boolean;
  emailBookingCancelled: boolean;
  emailPriceAlerts: boolean;
  emailPaymentUpdates: boolean;
  emailPromotions: boolean;
  emailSystemUpdates: boolean;

  // Push notifications
  pushEnabled: boolean;
  pushBookingUpdates: boolean;
  pushPriceAlerts: boolean;
  pushPromotions: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
  quietHoursTimezone: string;

  // Frequency settings
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'never';

  updatedAt?: Date;
}

// ==================== Notification Creation ====================

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: NotificationMetadata;
  channels?: NotificationChannel[];
}

// ==================== Notification Response ====================

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export interface NotificationStatsResponse {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// ==================== Notification Settings ====================

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  booking_confirmed: 'Booking Confirmed',
  booking_cancelled: 'Booking Cancelled',
  booking_modified: 'Booking Modified',
  price_alert_triggered: 'Price Alert',
  payment_successful: 'Payment Successful',
  payment_failed: 'Payment Failed',
  system_update: 'System Update',
  promotion: 'Promotion',
  account_security: 'Account Security',
  trip_reminder: 'Trip Reminder',
};

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  booking_confirmed: 'CheckCircle',
  booking_cancelled: 'XCircle',
  booking_modified: 'Edit',
  price_alert_triggered: 'TrendingDown',
  payment_successful: 'CreditCard',
  payment_failed: 'AlertTriangle',
  system_update: 'Settings',
  promotion: 'Tag',
  account_security: 'Shield',
  trip_reminder: 'Bell',
};

// ==================== Default Values ====================

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  userId: '',

  // In-app
  inAppEnabled: true,

  // Email
  emailEnabled: true,
  emailBookingConfirmed: true,
  emailBookingCancelled: true,
  emailPriceAlerts: true,
  emailPaymentUpdates: true,
  emailPromotions: false,
  emailSystemUpdates: true,

  // Push
  pushEnabled: false,
  pushBookingUpdates: false,
  pushPriceAlerts: false,
  pushPromotions: false,

  // Quiet hours
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  quietHoursTimezone: 'UTC',

  // Digest
  digestEnabled: false,
  digestFrequency: 'never',
};

export const NOTIFICATION_POLLING_INTERVAL = 30000; // 30 seconds
export const NOTIFICATION_PREVIEW_LIMIT = 5;
export const NOTIFICATION_PAGE_SIZE = 20;

// ==================== Utility Types ====================

export interface NotificationAction {
  label: string;
  url?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}
