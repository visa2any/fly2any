/**
 * React Hook for PWA Features
 * Provides easy access to PWA functionality in React components
 */

import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  getServiceWorkerStatus,
  isStandalone,
  setupServiceWorkerListeners,
} from './register-sw';
import {
  setupPushNotifications,
  unsubscribeFromPushNotifications,
  getNotificationSettings,
} from '../notifications/push-subscription';
import { getSyncStatus, syncAll } from '../sync/background-sync';

export interface PWAState {
  // Service Worker
  swRegistered: boolean;
  swInstalling: boolean;
  swWaiting: boolean;
  swActive: boolean;
  swUpdateAvailable: boolean;

  // Installation
  isInstalled: boolean;
  isInstallable: boolean;
  installPromptEvent: any;

  // Network
  isOnline: boolean;

  // Notifications
  notificationsSupported: boolean;
  notificationsEnabled: boolean;
  notificationPermission: NotificationPermission;

  // Sync
  syncPending: number;
  syncInProgress: boolean;
}

export interface PWAActions {
  // Service Worker
  registerSW: () => Promise<void>;
  updateSW: () => Promise<void>;

  // Installation
  promptInstall: () => Promise<boolean>;
  dismissInstallPrompt: () => void;

  // Notifications
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;

  // Sync
  triggerSync: () => Promise<void>;
}

/**
 * Main PWA hook
 */
export function usePWA(): [PWAState, PWAActions] {
  const [state, setState] = useState<PWAState>({
    swRegistered: false,
    swInstalling: false,
    swWaiting: false,
    swActive: false,
    swUpdateAvailable: false,
    isInstalled: false,
    isInstallable: false,
    installPromptEvent: null,
    isOnline: true,
    notificationsSupported: false,
    notificationsEnabled: false,
    notificationPermission: 'default',
    syncPending: 0,
    syncInProgress: false,
  });

  // Initialize state
  useEffect(() => {
    const initialize = async () => {
      // Check SW status
      const swStatus = await getServiceWorkerStatus();

      // Check installation status
      const installed = isStandalone();

      // Check online status
      const online = navigator.onLine;

      // Check notification settings
      const notifSettings = await getNotificationSettings();

      // Check sync status
      const syncStatus = await getSyncStatus();

      setState((prev) => ({
        ...prev,
        swRegistered: swStatus.registered,
        swInstalling: swStatus.installing,
        swWaiting: swStatus.waiting,
        swActive: swStatus.active,
        isInstalled: installed,
        isOnline: online,
        notificationsSupported: notifSettings.supported,
        notificationsEnabled: notifSettings.subscribed,
        notificationPermission: notifSettings.permission,
        syncPending: syncStatus.pending,
      }));
    };

    initialize();

    // Setup listeners
    const cleanup = setupServiceWorkerListeners({
      onUpdateAvailable: () => {
        setState((prev) => ({ ...prev, swUpdateAvailable: true }));
      },
      onOffline: () => {
        setState((prev) => ({ ...prev, isOnline: false }));
      },
      onOnline: () => {
        setState((prev) => ({ ...prev, isOnline: true }));
      },
    });

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState((prev) => ({
        ...prev,
        isInstallable: true,
        installPromptEvent: e,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPromptEvent: null,
      }));
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      cleanup();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Actions
  const actions: PWAActions = {
    registerSW: useCallback(async () => {
      await registerServiceWorker();
      const status = await getServiceWorkerStatus();
      setState((prev) => ({
        ...prev,
        swRegistered: status.registered,
        swActive: status.active,
      }));
    }, []),

    updateSW: useCallback(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }, []),

    promptInstall: useCallback(async () => {
      if (!state.installPromptEvent) {
        return false;
      }

      state.installPromptEvent.prompt();
      const { outcome } = await state.installPromptEvent.userChoice;

      setState((prev) => ({
        ...prev,
        installPromptEvent: null,
        isInstallable: false,
      }));

      return outcome === 'accepted';
    }, [state.installPromptEvent]),

    dismissInstallPrompt: useCallback(() => {
      setState((prev) => ({
        ...prev,
        isInstallable: false,
        installPromptEvent: null,
      }));
    }, []),

    enableNotifications: useCallback(async () => {
      const result = await setupPushNotifications();

      if (result.success) {
        setState((prev) => ({
          ...prev,
          notificationsEnabled: true,
          notificationPermission: 'granted',
        }));
        return true;
      }

      return false;
    }, []),

    disableNotifications: useCallback(async () => {
      await unsubscribeFromPushNotifications();
      setState((prev) => ({
        ...prev,
        notificationsEnabled: false,
      }));
    }, []),

    triggerSync: useCallback(async () => {
      setState((prev) => ({ ...prev, syncInProgress: true }));

      try {
        await syncAll();
        const status = await getSyncStatus();
        setState((prev) => ({
          ...prev,
          syncPending: status.pending,
          syncInProgress: false,
        }));
      } catch (error) {
        setState((prev) => ({ ...prev, syncInProgress: false }));
      }
    }, []),
  };

  return [state, actions];
}

/**
 * Hook for online/offline status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for service worker status
 */
export function useServiceWorker() {
  const [status, setStatus] = useState({
    registered: false,
    installing: false,
    waiting: false,
    active: false,
  });

  useEffect(() => {
    const updateStatus = async () => {
      const swStatus = await getServiceWorkerStatus();
      setStatus(swStatus);
    };

    updateStatus();

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

/**
 * Hook for installation status
 */
export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const installed = isStandalone();
    setIsInstalled(installed);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      return false;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);

    return outcome === 'accepted';
  }, [installPrompt]);

  return {
    isInstalled,
    canInstall: !!installPrompt,
    promptInstall,
  };
}

/**
 * Hook for notification permission
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return {
    permission,
    granted: permission === 'granted',
    denied: permission === 'denied',
    requestPermission,
  };
}
