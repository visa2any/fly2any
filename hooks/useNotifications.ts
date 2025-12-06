'use client';

/**
 * useNotifications Hook
 *
 * State-of-the-art notification management with:
 * - Real-time SSE (Server-Sent Events) updates
 * - Automatic reconnection with exponential backoff
 * - Optimistic UI updates
 * - Toast notifications for new alerts
 * - Connection state management
 *
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import type { Notification, NotificationListParams } from '@/lib/types/notifications';

interface UseNotificationsOptions {
  enableSSE?: boolean;
  enableToast?: boolean;
  enableSound?: boolean;
  pollInterval?: number;
  autoConnect?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  deleteAllRead: () => Promise<number>;
  connect: () => void;
  disconnect: () => void;
}

const DEFAULT_OPTIONS: UseNotificationsOptions = {
  enableSSE: true,
  enableToast: true,
  enableSound: false,
  pollInterval: 60000,
  autoConnect: true,
};

export function useNotifications(
  params?: NotificationListParams,
  options?: UseNotificationsOptions
): UseNotificationsReturn {
  const { data: session, status } = useSession();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const previousUnreadRef = useRef(0);
  const mountedRef = useRef(true);

  const isAuthenticated = status === 'authenticated' && !!session?.user?.id;

  const playSound = useCallback((): void => {
    if (!opts.enableSound) return;
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      // Ignore sound errors
    }
  }, [opts.enableSound]);

  const showToast = useCallback((notification: Notification): void => {
    if (!opts.enableToast) return;
    toast.success(`${notification.title}: ${notification.message.substring(0, 50)}...`, {
      duration: 5000,
    });
    playSound();
  }, [opts.enableToast, playSound]);

  const fetchNotifications = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 20),
        sortBy: params?.sortBy || 'createdAt',
        sortOrder: params?.sortOrder || 'desc',
      });

      if (params?.filters?.type && params.filters.type !== 'all') {
        queryParams.set('type', params.filters.type);
      }
      if (params?.filters?.read !== undefined && params.filters.read !== 'all') {
        queryParams.set('read', String(params.filters.read));
      }

      const response = await fetch(`/api/notifications?${queryParams}`, {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      if (!mountedRef.current) return;

      if (data.unreadCount > previousUnreadRef.current && previousUnreadRef.current > 0) {
        const newCount = data.unreadCount - previousUnreadRef.current;
        if (opts.enableToast) {
          toast.success(`${newCount} new notification${newCount > 1 ? 's' : ''}`);
        }
        playSound();
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setTotal(data.total || 0);
      previousUnreadRef.current = data.unreadCount || 0;
      setError(null);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated, params, opts.enableToast, playSound]);

  const connect = useCallback((): void => {
    if (!isAuthenticated || !opts.enableSSE) return;
    if (eventSourceRef.current) return;

    setConnectionState('connecting');

    try {
      const url = `/api/notifications/sse?type=customer`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = (): void => {
        if (mountedRef.current) {
          setConnectionState('connected');
          reconnectAttemptsRef.current = 0;
        }
      };

      eventSource.onerror = (): void => {
        if (mountedRef.current) {
          setConnectionState('error');
          eventSource.close();
          eventSourceRef.current = null;

          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, delay);
        }
      };

      eventSource.addEventListener('notification', (event: MessageEvent): void => {
        try {
          const data = JSON.parse(event.data);
          if (data.notification) {
            showToast(data.notification);
            fetchNotifications();
          }
        } catch {
          console.error('Error parsing SSE notification');
        }
      });

      eventSource.addEventListener('booking_created', (event: MessageEvent): void => {
        try {
          const data = JSON.parse(event.data);
          toast.success(`Booking confirmed: ${data.bookingReference}`);
          fetchNotifications();
        } catch {
          console.error('Error parsing SSE booking event');
        }
      });

      eventSource.addEventListener('booking_ticketed', (event: MessageEvent): void => {
        try {
          const data = JSON.parse(event.data);
          toast.success(`E-Ticket issued: ${data.bookingReference}`);
          fetchNotifications();
        } catch {
          console.error('Error parsing SSE ticket event');
        }
      });

      eventSource.addEventListener('heartbeat', (): void => {
        // Connection alive
      });

    } catch {
      setConnectionState('error');
      console.error('SSE connection error');
    }
  }, [isAuthenticated, opts.enableSSE, showToast, fetchNotifications]);

  const disconnect = useCallback((): void => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionState('disconnected');
  }, []);

  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        fetchNotifications();
        throw new Error('Failed to mark as read');
      }

      return true;
    } catch {
      toast.error('Failed to mark notification as read');
      return false;
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
      setUnreadCount(0);

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (!response.ok) {
        fetchNotifications();
        throw new Error('Failed to mark all as read');
      }

      toast.success('All notifications marked as read');
      return true;
    } catch {
      toast.error('Failed to mark all as read');
      return false;
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id: string): Promise<boolean> => {
    try {
      const notification = notifications.find(n => n.id === id);

      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotal(prev => prev - 1);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        fetchNotifications();
        throw new Error('Failed to delete notification');
      }

      return true;
    } catch {
      toast.error('Failed to delete notification');
      return false;
    }
  }, [notifications, fetchNotifications]);

  const deleteAllRead = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch('/api/notifications?scope=read', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete read notifications');
      }

      const data = await response.json();
      await fetchNotifications();

      toast.success(`${data.count} notification${data.count !== 1 ? 's' : ''} deleted`);
      return data.count;
    } catch {
      toast.error('Failed to delete notifications');
      return 0;
    }
  }, [fetchNotifications]);

  useEffect(() => {
    mountedRef.current = true;

    if (isAuthenticated) {
      fetchNotifications();

      if (opts.autoConnect && opts.enableSSE) {
        connect();
      }
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated || connectionState === 'connected') return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, opts.pollInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, connectionState, opts.pollInterval, fetchNotifications]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [params?.page, params?.limit, params?.sortBy, params?.sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    notifications,
    unreadCount,
    total,
    loading,
    error,
    isConnected: connectionState === 'connected',
    connectionState,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    connect,
    disconnect,
  };
}

export default useNotifications;
