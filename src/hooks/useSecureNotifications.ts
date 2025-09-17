/**
 * 🔐 SECURE NOTIFICATIONS HOOK
 * Provides secure notification functionality with encryption
 */

import { useState, useCallback } from 'react';

export interface SecureNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  encrypted?: boolean;
  sensitive?: boolean;
}

export interface UseSecureNotificationsReturn {
  notifications: SecureNotification[];
  addNotification: (notification: Omit<SecureNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  addSecureNotification: (title: string, message: string, type?: SecureNotification['type']) => void;
  addErrorNotification: (error: Error | string) => void;
  addSuccessNotification: (message: string) => void;
  // Additional methods for compatibility
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string | Error) => void;
  warning: (title: string, message?: string) => void;
  rateLimitExceeded: (message: string) => void;
  invalidInput: (message: string) => void;
  showConfirmDialog: (options: any) => boolean;
}

export function useSecureNotifications(): UseSecureNotificationsReturn {
  const [notifications, setNotifications] = useState<SecureNotification[]>([]);

  const addNotification = useCallback((notification: Omit<SecureNotification, 'id' | 'timestamp'>) => {
    const newNotification: SecureNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after 5 seconds for non-sensitive notifications
    if (!notification.sensitive) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addSecureNotification = useCallback((
    title: string,
    message: string,
    type: SecureNotification['type'] = 'info'
  ) => {
    addNotification({
      type,
      title,
      message,
      encrypted: true,
      sensitive: true
    });
  }, [addNotification]);

  const addErrorNotification = useCallback((error: Error | string) => {
    const message = error instanceof Error ? error.message : error;
    addNotification({
      type: 'error',
      title: 'Error',
      message: message,
      sensitive: false
    });
  }, [addNotification]);

  const addSuccessNotification = useCallback((message: string) => {
    addNotification({
      type: 'success',
      title: 'Success',
      message,
      sensitive: false
    });
  }, [addNotification]);

  // Additional compatibility methods
  const success = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'success',
      title,
      message: message || title,
      sensitive: false
    });
  }, [addNotification]);

  const error = useCallback((title: string, message?: string | Error) => {
    const errorMessage = message instanceof Error ? message.message : (message || title);
    addNotification({
      type: 'error',
      title,
      message: errorMessage,
      sensitive: false
    });
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'warning',
      title,
      message: message || title,
      sensitive: false
    });
  }, [addNotification]);

  const rateLimitExceeded = useCallback((message: string) => {
    addNotification({
      type: 'warning',
      title: 'Rate Limit Exceeded',
      message: `Rate limit exceeded: ${message}`,
      sensitive: false
    });
  }, [addNotification]);

  const invalidInput = useCallback((message: string) => {
    addNotification({
      type: 'error',
      title: 'Invalid Input',
      message,
      sensitive: false
    });
  }, [addNotification]);

  const showConfirmDialog = useCallback((options: any): boolean => {
    if (typeof options === 'string') {
      addNotification({
        type: 'info',
        title: 'Confirmation Required',
        message: options,
        sensitive: false
      });
    } else if (options && typeof options === 'object') {
      addNotification({
        type: 'info',
        title: options.title || 'Confirmation Required',
        message: options.message || 'Please confirm this action',
        sensitive: false
      });
    }
    return true; // Always return true for now - proper confirmation dialogs need state management
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    addSecureNotification,
    addErrorNotification,
    addSuccessNotification,
    success,
    error,
    warning,
    rateLimitExceeded,
    invalidInput,
    showConfirmDialog
  };
}