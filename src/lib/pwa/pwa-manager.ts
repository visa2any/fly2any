/**
 * PWA Manager
 * Handles Progressive Web App functionality including installation and capabilities
 */

export interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isOffline: boolean;
  hasNotificationPermission: boolean;
  supportsPush: boolean;
  supportsPushNotifications: boolean;
  supportsBackgroundSync: boolean;
  supportsBadging: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private capabilities: PWACapabilities | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private async init(): Promise<void> {
    if (this.isInitialized) return;

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.updateCapabilities();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.updateCapabilities();
    });

    // Initialize capabilities
    await this.updateCapabilities();
    this.isInitialized = true;
  }

  private async updateCapabilities(): Promise<void> {
    if (typeof window === 'undefined') {
      this.capabilities = null;
      return;
    }

    const isInstallable = !!this.deferredPrompt;
    const isInstalled = this.checkIfInstalled();
    const isOnline = navigator.onLine;
    const isOffline = !navigator.onLine;
    
    let hasNotificationPermission = false;
    let supportsPush = false;
    let supportsPushNotifications = false;
    let supportsBackgroundSync = false;
    let supportsBadging = false;

    // Check notification permission
    if ('Notification' in window) {
      hasNotificationPermission = Notification.permission === 'granted';
    }

    // Check push notification support
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      supportsPush = true;
      supportsPushNotifications = true;
    }

    // Check background sync support
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      supportsBackgroundSync = true;
    }

    // Check badging support
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      supportsBadging = true;
    }

    this.capabilities = {
      isInstallable,
      isInstalled,
      isOnline,
      isOffline,
      hasNotificationPermission,
      supportsPush,
      supportsPushNotifications,
      supportsBackgroundSync,
      supportsBadging,
    };
  }

  private checkIfInstalled(): boolean {
    if (typeof window === 'undefined') return false;

    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check for iOS PWA
    if ('navigator' in window && (window.navigator as any).standalone === true) {
      return true;
    }

    // Check document referrer for Android
    if (document.referrer.includes('android-app://')) {
      return true;
    }

    return false;
  }

  public getCapabilities(): PWACapabilities | null {
    return this.capabilities;
  }

  public async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;

      // Clear the saved prompt since it can only be used once
      this.deferredPrompt = null;
      
      // Update capabilities
      await this.updateCapabilities();

      return outcome === 'accepted';
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      await this.updateCapabilities();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public async showInstallPrompt(): Promise<boolean> {
    // Alias for install() method for compatibility
    return this.install();
  }

  public async updateBadgeCount(count: number): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('setAppBadge' in navigator)) {
      return false;
    }

    try {
      if (count === 0) {
        await (navigator as any).clearAppBadge();
      } else {
        await (navigator as any).setAppBadge(count);
      }
      return true;
    } catch (error) {
      console.error('Error updating badge count:', error);
      return false;
    }
  }

  public async subscribeToPushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as BufferSource
      });
      
      // In a real app, you'd send this subscription to your server
      console.log('Push subscription:', subscription);
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public async registerServiceWorker(path: string = '/sw.js'): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register(path);
      console.log('Service Worker registered successfully:', registration);
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  public async unregisterServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const unregistrationPromises = registrations.map(reg => reg.unregister());
      await Promise.all(unregistrationPromises);
      return true;
    } catch (error) {
      console.error('Error unregistering service workers:', error);
      return false;
    }
  }

  public onInstallPromptReady(callback: () => void): void {
    if (this.deferredPrompt) {
      callback();
    } else {
      window.addEventListener('beforeinstallprompt', callback);
    }
  }

  public onAppInstalled(callback: () => void): void {
    window.addEventListener('appinstalled', callback);
  }

  public onOnlineStatusChange(callback: (isOnline: boolean) => void): void {
    window.addEventListener('online', () => {
      callback(true);
      this.updateCapabilities();
    });
    
    window.addEventListener('offline', () => {
      callback(false);
      this.updateCapabilities();
    });
  }
}

// Global PWA manager instance
let globalPWAManager: PWAManager | null = null;

// Initialize PWA functionality
export async function initializePWA(): Promise<PWACapabilities | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!globalPWAManager) {
    globalPWAManager = new PWAManager();
  }

  // Wait a bit for initialization to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return globalPWAManager.getCapabilities();
}

// Get PWA manager instance
export function getPWAManager(): {
  getCapabilities: () => PWACapabilities | null;
  install: () => Promise<boolean>;
  checkInstalled: () => boolean;
  showInstallPrompt: () => Promise<boolean>;
  updateBadgeCount: (count: number) => Promise<boolean>;
  subscribeToPushNotifications: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;
} {
  if (!globalPWAManager) {
    globalPWAManager = new PWAManager();
  }

  return {
    getCapabilities: () => globalPWAManager!.getCapabilities(),
    install: () => globalPWAManager!.install(),
    checkInstalled: () => globalPWAManager!.getCapabilities()?.isInstalled ?? false,
    showInstallPrompt: () => globalPWAManager!.showInstallPrompt(),
    updateBadgeCount: (count: number) => globalPWAManager!.updateBadgeCount(count),
    subscribeToPushNotifications: () => globalPWAManager!.subscribeToPushNotifications(),
    requestNotificationPermission: () => globalPWAManager!.requestNotificationPermission(),
  };
}

// Utility functions
export function isPWASupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
}

export function isRunningAsPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// PWA detection utilities
export const PWAUtils = {
  isSupported: isPWASupported,
  isRunningAsPWA,
  initializePWA,
  getPWAManager,
};

export default PWAManager;