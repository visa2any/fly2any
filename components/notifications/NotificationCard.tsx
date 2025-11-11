'use client';

/**
 * NotificationCard Component
 * Team 2 - Notification & Communication
 *
 * Displays a single notification with icon, title, message, and actions
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CheckCircle,
  XCircle,
  Edit,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Settings,
  Tag,
  Shield,
} from 'lucide-react';
import { Notification, NotificationType } from '@/lib/types/notifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAction?: (url: string) => void;
  compact?: boolean;
}

// Icon mapping for notification types
const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  booking_confirmed: <CheckCircle className="h-5 w-5 text-green-600" />,
  booking_cancelled: <XCircle className="h-5 w-5 text-red-600" />,
  booking_modified: <Edit className="h-5 w-5 text-blue-600" />,
  price_alert_triggered: <TrendingDown className="h-5 w-5 text-orange-600" />,
  payment_successful: <CreditCard className="h-5 w-5 text-green-600" />,
  payment_failed: <AlertTriangle className="h-5 w-5 text-red-600" />,
  system_update: <Settings className="h-5 w-5 text-gray-600" />,
  promotion: <Tag className="h-5 w-5 text-purple-600" />,
  account_security: <Shield className="h-5 w-5 text-blue-600" />,
  trip_reminder: <Bell className="h-5 w-5 text-blue-600" />,
};

// Priority badge colors
const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
  compact = false,
}: NotificationCardProps) {
  const handleAction = () => {
    if (notification.actionUrl && onAction) {
      onAction(notification.actionUrl);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  const relativeTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const icon = NOTIFICATION_ICONS[notification.type as NotificationType] || (
    <Bell className="h-5 w-5 text-gray-600" />
  );

  if (compact) {
    return (
      <div
        className={cn(
          'p-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4',
          notification.read ? 'border-transparent' : 'border-primary-500 bg-blue-50'
        )}
        onClick={handleAction}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </p>
            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 mt-1">{relativeTime}</p>
          </div>
          {!notification.read && (
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary-500" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all duration-200',
        notification.read
          ? 'bg-white border-gray-200'
          : 'bg-blue-50 border-primary-300 shadow-sm'
      )}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center',
              notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
            )}
          >
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={cn(
                    'text-base font-semibold',
                    notification.read ? 'text-gray-900' : 'text-gray-900'
                  )}
                >
                  {notification.title}
                </h3>
                {notification.priority !== 'medium' && (
                  <Badge
                    className={cn(
                      'text-xs',
                      PRIORITY_COLORS[notification.priority]
                    )}
                  >
                    {notification.priority}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="flex-shrink-0">
                <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            <span>{relativeTime}</span>
            {notification.readAt && (
              <>
                <span>•</span>
                <span>
                  Read{' '}
                  {formatDistanceToNow(new Date(notification.readAt), {
                    addSuffix: true,
                  })}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {notification.actionUrl && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAction}
              >
                {notification.metadata?.actionLabel || 'View Details'}
              </Button>
            )}
            {!notification.read && onMarkAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
              >
                Mark as read
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Notification card skeleton loader
 */
export function NotificationCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="p-3 animate-pulse">
        <div className="flex gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-gray-200 animate-pulse">
      <div className="flex gap-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
