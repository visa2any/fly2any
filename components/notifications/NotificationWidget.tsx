'use client';

/**
 * NotificationWidget Component
 *
 * A compact notification widget for the account dashboard showing:
 * - Recent notifications
 * - Quick actions (mark as read, view all)
 * - Real-time updates via SSE
 *
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  CheckCircle,
  XCircle,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Settings,
  Tag,
  Shield,
  Edit,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/lib/types/notifications';

interface NotificationWidgetProps {
  userId?: string;
  limit?: number;
  className?: string;
  showHeader?: boolean;
  showViewAll?: boolean;
}

// Icon mapping for notification types
const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  booking_confirmed: <CheckCircle className="h-4 w-4 text-green-600" />,
  booking_cancelled: <XCircle className="h-4 w-4 text-red-600" />,
  booking_modified: <Edit className="h-4 w-4 text-primary-500" />,
  price_alert_triggered: <TrendingDown className="h-4 w-4 text-orange-600" />,
  payment_successful: <CreditCard className="h-4 w-4 text-green-600" />,
  payment_failed: <AlertTriangle className="h-4 w-4 text-red-600" />,
  system_update: <Settings className="h-4 w-4 text-gray-600" />,
  promotion: <Tag className="h-4 w-4 text-purple-600" />,
  account_security: <Shield className="h-4 w-4 text-primary-500" />,
  trip_reminder: <Bell className="h-4 w-4 text-primary-500" />,
};

export function NotificationWidget({
  userId,
  limit = 5,
  className,
  showHeader = true,
  showViewAll = true,
}: NotificationWidgetProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `/api/notifications?limit=${limit}&sortBy=createdAt&sortOrder=desc`
        );

        if (!response.ok) {
          if (response.status === 401) {
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Poll for updates every 60 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [userId, limit]);

  // Mark notification as read
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Navigate to notification action
  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className={cn('bg-white rounded-xl shadow-md border border-gray-200', className)}>
      {showHeader && (
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Bell className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <Link
            href="/account/notifications"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            Settings
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">
              We'll notify you about bookings, deals, and more
            </p>
          </div>
        ) : (
          notifications.map(notification => {
            const icon = NOTIFICATION_ICONS[notification.type as NotificationType] || (
              <Bell className="h-4 w-4 text-gray-600" />
            );

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'p-4 hover:bg-gray-50 transition-colors cursor-pointer group',
                  !notification.read && 'bg-info-50/50'
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={cn(
                      'p-1.5 rounded-full',
                      notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                    )}>
                      {icon}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm font-medium line-clamp-1',
                        notification.read ? 'text-gray-700' : 'text-gray-900'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4 text-primary-600 hover:text-primary-700" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="flex-shrink-0 self-center">
                      <div className="h-2 w-2 rounded-full bg-primary-500" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showViewAll && notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <Link
            href="/account/notifications"
            className="flex items-center justify-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 py-2"
          >
            View all notifications
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationWidget;
