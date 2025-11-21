/**
 * Notification Service
 * Team 2 - Notification & Communication
 *
 * Handles all notification-related business logic
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Redis caching with 5-minute TTL
 * - Parallel database queries
 * - Optimized query patterns
 */

import { getPrismaClient } from '@/lib/prisma';
import redis, { isRedisEnabled } from '@/lib/cache/redis';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  CreateNotificationData,
  NotificationFilters,
  NotificationListParams,
  NotificationListResponse,
  NotificationStatsResponse,
  NOTIFICATION_PAGE_SIZE,
} from '@/lib/types/notifications';

const CACHE_TTL = 300; // 5 minutes

// ==================== Notification Creation ====================

/**
 * Create a new notification
 */
export async function createNotification(
  data: CreateNotificationData
): Promise<Notification> {
  try {
    const prisma = getPrismaClient();
    const notification = await prisma!.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        actionUrl: data.actionUrl,
        metadata: data.metadata || {},
      },
    });

    return {
      ...notification,
      type: notification.type as NotificationType,
      priority: notification.priority as NotificationPriority,
      actionUrl: notification.actionUrl || undefined,
      createdAt: notification.createdAt,
      readAt: notification.readAt || undefined,
      metadata: notification.metadata as any,
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

/**
 * Create multiple notifications in bulk
 */
export async function createBulkNotifications(
  notifications: CreateNotificationData[]
): Promise<Notification[]> {
  try {
    const prisma = getPrismaClient();
    const created = await prisma!.notification.createMany({
      data: notifications.map(n => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        priority: n.priority || 'medium',
        actionUrl: n.actionUrl,
        metadata: n.metadata || {},
      })),
    });

    console.log(`Created ${created.count} notifications`);
    return [];
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw new Error('Failed to create bulk notifications');
  }
}

// ==================== Notification Retrieval ====================

/**
 * Get notifications for a user with filters and pagination
 * PERFORMANCE OPTIMIZATION: Redis caching + parallel queries
 */
export async function getNotifications(
  userId: string,
  params: NotificationListParams = {}
): Promise<NotificationListResponse> {
  try {
    const prisma = getPrismaClient();
    const {
      page = 1,
      limit = NOTIFICATION_PAGE_SIZE,
      filters = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    // Build where clause
    const where: any = {
      userId,
    };

    if (filters.type && filters.type !== 'all') {
      where.type = filters.type;
    }

    if (typeof filters.read === 'boolean') {
      where.read = filters.read;
    }

    if (filters.priority && filters.priority !== 'all') {
      where.priority = filters.priority;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    // Generate cache key from parameters
    const cacheKey = `notifications:${userId}:${JSON.stringify({ page, limit, filters, sortBy, sortOrder })}`;

    // STEP 1: Check Redis cache first
    if (isRedisEnabled() && redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          try {
            // Attempt to parse and validate cached data
            const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;

            // Validate structure - must have notifications array and metadata
            if (
              parsed &&
              typeof parsed === 'object' &&
              Array.isArray(parsed.notifications) &&
              typeof parsed.total === 'number' &&
              typeof parsed.unreadCount === 'number'
            ) {
              console.log('✅ Notifications: Cache HIT');
              return parsed;
            } else {
              // Invalid structure but don't delete - will be overwritten
              console.log('⚠️  Notifications: Invalid cache structure, will refresh');
            }
          } catch (parseError) {
            // Invalid JSON but don't delete - will be overwritten
            console.log('⚠️  Notifications: Cache parse error, will refresh');
          }
        } else {
          console.log('⚠️  Notifications: Cache MISS');
        }
      } catch (cacheError) {
        console.error('⚠️  Redis cache read error:', cacheError);
        // Continue to database query on cache error - don't delete cache
      }
    }

    // STEP 2: Run all 3 database queries IN PARALLEL (not sequential!)
    // This reduces query time from 3x sequential to 1x parallel
    const [total, unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
      prisma.notification.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const result = {
      notifications: notifications.map(n => ({
        ...n,
        type: n.type as NotificationType,
        priority: n.priority as NotificationPriority,
        actionUrl: n.actionUrl || undefined,
        createdAt: n.createdAt,
        readAt: n.readAt || undefined,
        metadata: n.metadata as any,
      })),
      total,
      page,
      limit,
      unreadCount,
    };

    // STEP 3: Cache the result (if Redis enabled)
    if (isRedisEnabled() && redis) {
      try {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
        console.log('✅ Notifications: Cached for', CACHE_TTL, 'seconds');
      } catch (cacheError) {
        console.error('Redis cache write error:', cacheError);
        // Non-critical error, continue
      }
    }

    return result;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw new Error('Failed to get notifications');
  }
}

/**
 * Get a single notification by ID
 */
export async function getNotificationById(
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  try {
    const prisma = getPrismaClient();
    const notification = await prisma!.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      return null;
    }

    return {
      ...notification,
      type: notification.type as NotificationType,
      priority: notification.priority as NotificationPriority,
      actionUrl: notification.actionUrl || undefined,
      createdAt: notification.createdAt,
      readAt: notification.readAt || undefined,
      metadata: notification.metadata as any,
    };
  } catch (error) {
    console.error('Error getting notification by ID:', error);
    throw new Error('Failed to get notification');
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const prisma = getPrismaClient();
    const count = await prisma!.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw new Error('Failed to get unread count');
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(
  userId: string
): Promise<NotificationStatsResponse> {
  try {
    const prisma = getPrismaClient();
    const [total, unread, byType, byPriority] = await Promise.all([
      // Total count
      prisma.notification.count({ where: { userId } }),

      // Unread count
      prisma.notification.count({ where: { userId, read: false } }),

      // Group by type
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: true,
      }),

      // Group by priority
      prisma.notification.groupBy({
        by: ['priority'],
        where: { userId },
        _count: true,
      }),
    ]);

    const byTypeMap = byType.reduce(
      (acc, item) => {
        acc[item.type as NotificationType] = item._count;
        return acc;
      },
      {} as Record<NotificationType, number>
    );

    const byPriorityMap = byPriority.reduce(
      (acc, item) => {
        acc[item.priority as NotificationPriority] = item._count;
        return acc;
      },
      {} as Record<NotificationPriority, number>
    );

    return {
      total,
      unread,
      byType: byTypeMap,
      byPriority: byPriorityMap,
    };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    throw new Error('Failed to get notification stats');
  }
}

// ==================== Notification Updates ====================

/**
 * Mark a notification as read
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<Notification> {
  try {
    const prisma = getPrismaClient();
    const notification = await prisma!.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return {
      ...notification,
      type: notification.type as NotificationType,
      priority: notification.priority as NotificationPriority,
      actionUrl: notification.actionUrl || undefined,
      createdAt: notification.createdAt,
      readAt: notification.readAt || undefined,
      metadata: notification.metadata as any,
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  try {
    const prisma = getPrismaClient();
    const result = await prisma!.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
}

/**
 * Mark notification as unread
 */
export async function markAsUnread(
  notificationId: string,
  userId: string
): Promise<Notification> {
  try {
    const prisma = getPrismaClient();
    const notification = await prisma!.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: false,
        readAt: null,
      },
    });

    return {
      ...notification,
      type: notification.type as NotificationType,
      priority: notification.priority as NotificationPriority,
      actionUrl: notification.actionUrl || undefined,
      createdAt: notification.createdAt,
      readAt: notification.readAt || undefined,
      metadata: notification.metadata as any,
    };
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    throw new Error('Failed to mark notification as unread');
  }
}

// ==================== Notification Deletion ====================

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  try {
    const prisma = getPrismaClient();
    await prisma!.notification.delete({
      where: {
        id: notificationId,
        userId,
      },
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error('Failed to delete notification');
  }
}

/**
 * Delete all read notifications for a user
 */
export async function deleteAllRead(userId: string): Promise<number> {
  try {
    const prisma = getPrismaClient();
    const result = await prisma!.notification.deleteMany({
      where: {
        userId,
        read: true,
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    throw new Error('Failed to delete read notifications');
  }
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: string): Promise<number> {
  try {
    const prisma = getPrismaClient();
    const result = await prisma!.notification.deleteMany({
      where: { userId },
    });

    return result.count;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw new Error('Failed to delete all notifications');
  }
}

// ==================== Helper Functions ====================

/**
 * Send notification for booking confirmation
 */
export async function sendBookingConfirmationNotification(
  userId: string,
  bookingId: string,
  bookingDetails: {
    origin: string;
    destination: string;
    departDate: string;
    totalPrice: number;
    currency: string;
  }
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: `Your flight from ${bookingDetails.origin} to ${bookingDetails.destination} on ${bookingDetails.departDate} has been confirmed.`,
    priority: 'high',
    actionUrl: `/account/bookings/${bookingId}`,
    metadata: {
      bookingId,
      route: {
        origin: bookingDetails.origin,
        destination: bookingDetails.destination,
      },
      originalPrice: bookingDetails.totalPrice,
      currency: bookingDetails.currency,
    },
  });
}

/**
 * Send notification for price alert
 */
export async function sendPriceAlertNotification(
  userId: string,
  priceAlertId: string,
  alertDetails: {
    origin: string;
    destination: string;
    originalPrice: number;
    newPrice: number;
    currency: string;
  }
): Promise<Notification> {
  const savingsPercent = Math.round(
    ((alertDetails.originalPrice - alertDetails.newPrice) /
      alertDetails.originalPrice) *
      100
  );

  return createNotification({
    userId,
    type: 'price_alert_triggered',
    title: 'Price Alert Triggered',
    message: `The price for ${alertDetails.origin} to ${alertDetails.destination} has dropped by ${savingsPercent}%! Now ${alertDetails.currency} ${alertDetails.newPrice}.`,
    priority: 'high',
    actionUrl: `/account/alerts/${priceAlertId}`,
    metadata: {
      priceAlertId,
      route: {
        origin: alertDetails.origin,
        destination: alertDetails.destination,
      },
      originalPrice: alertDetails.originalPrice,
      newPrice: alertDetails.newPrice,
      currency: alertDetails.currency,
    },
  });
}

/**
 * Send notification for payment success
 */
export async function sendPaymentSuccessNotification(
  userId: string,
  bookingId: string,
  amount: number,
  currency: string
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'payment_successful',
    title: 'Payment Successful',
    message: `Your payment of ${currency} ${amount} has been processed successfully.`,
    priority: 'medium',
    actionUrl: `/account/bookings/${bookingId}`,
    metadata: {
      bookingId,
      originalPrice: amount,
      currency,
    },
  });
}

/**
 * Send notification for system update
 */
export async function sendSystemUpdateNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'system_update',
    title,
    message,
    priority: 'low',
    actionUrl,
  });
}

/**
 * Send notification for promotion
 */
export async function sendPromotionNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string,
  imageUrl?: string
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'promotion',
    title,
    message,
    priority: 'low',
    actionUrl,
    metadata: {
      imageUrl,
    },
  });
}
