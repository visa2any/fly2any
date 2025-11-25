'use client';

/**
 * Admin Notification Center
 *
 * Real-time notification bell with dropdown for admin dashboard.
 * Features:
 * - SSE connection for instant updates
 * - Unread badge count
 * - Notification list with actions
 * - Click to view booking details
 * - Mark as read functionality
 * - Sound alert for new notifications
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  Plane,
  Clock,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: any;
  read: boolean;
  createdAt: string;
}

interface SSEEvent {
  type: string;
  bookingReference?: string;
  timestamp: string;
  payload?: any;
}

export default function NotificationCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled) {
      // Try to play the audio element, or use Web Audio API as fallback
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Autoplay blocked by browser - try Web Audio API beep
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
          } catch {
            // Silent fallback
          }
        });
      }
    }
  }, [soundEnabled]);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Connect to SSE for real-time updates
  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Setup SSE connection
    const eventSource = new EventSource('/api/notifications/sse?type=admin');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('📡 SSE connected for admin notifications');
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      console.warn('📡 SSE connection error, will retry...');
      setIsConnected(false);
    };

    // Handle new booking events
    eventSource.addEventListener('booking_created', (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        console.log('🔔 New booking notification:', data);

        // Add to local notifications
        const newNotification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'booking',
          title: `🎫 New Booking: ${data.bookingReference}`,
          message: data.payload
            ? `${data.payload.customerName} - ${data.payload.route}`
            : 'New booking received',
          priority: 'high',
          actionUrl: data.payload?.bookingId
            ? `/admin/bookings/${data.payload.bookingId}`
            : '/admin/bookings',
          metadata: data.payload,
          read: false,
          createdAt: data.timestamp,
        };

        setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]);
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    });

    // Handle ticket issued events
    eventSource.addEventListener('booking_ticketed', (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        console.log('🔔 Ticket issued notification:', data);

        const newNotification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'booking',
          title: `✈️ Ticket Issued: ${data.bookingReference}`,
          message: `Ticketed by ${data.payload?.ticketedBy || 'Admin'}`,
          priority: 'medium',
          actionUrl: `/admin/bookings`,
          metadata: data,
          read: false,
          createdAt: data.timestamp,
        };

        setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]);
        setUnreadCount((prev) => prev + 1);
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    });

    // Handle heartbeat to maintain connection status
    eventSource.addEventListener('heartbeat', () => {
      setIsConnected(true);
    });

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [playNotificationSound]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', {
        method: 'POST',
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setIsOpen(false);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Sound */}
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />

      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
      >
        <Bell
          className={`w-6 h-6 ${isConnected ? 'text-gray-600' : 'text-gray-400'}`}
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Indicator */}
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-gray-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll see booking alerts here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                      notification.read
                        ? 'border-l-transparent bg-white'
                        : getPriorityColor(notification.priority)
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'booking'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {notification.type === 'booking' ? (
                        <Plane className="w-5 h-5 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          notification.read
                            ? 'text-gray-600'
                            : 'text-gray-900 font-medium'
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Read Indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <span className="w-2 h-2 bg-blue-500 rounded-full block" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t text-center">
              <button
                onClick={() => {
                  router.push('/admin/notifications');
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
