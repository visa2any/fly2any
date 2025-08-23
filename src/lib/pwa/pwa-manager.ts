/**
 * Fly2Any PWA Manager
 * Handles PWA installation prompts, service worker registration,
 * background sync, push notifications, and offline functionality
 */

// PWA Installation and Management Types
export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  hasNotificationPermission: boolean;
  supportsPushNotifications: boolean;
  supportsBackgroundSync: boolean;
  supportsBadging: boolean;
}

export interface InstallPromptStrategy {
  trigger: 'immediate' | 'engagement' | 'timer' | 'manual';
  minEngagementScore: number;
  delayMs: number;
  maxPrompts: number;
  cooldownDays: number;
}

export interface BackgroundSyncData {
  type: 'lead-form' | 'quote-request' | 'newsletter' | 'analytics';
  data: any;
  timestamp: number;
  attempts: number;
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private installPromptStrategy: InstallPromptStrategy;
  private engagementScore: number = 0;
  private installPromptCount: number = 0;
  private lastPromptDate: Date | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private isInitialized: boolean = false;

  constructor(strategy: Partial<InstallPromptStrategy> = {}) {
    this.installPromptStrategy = {
      trigger: 'engagement',
      minEngagementScore: 3,
      delayMs: 30000, // 30 seconds
      maxPrompts: 3,
      cooldownDays: 7,
      ...strategy
    };

    this.loadPersistentData();
    this.initialize();
  }

  /**
   * Initialize PWA Manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Register service worker
      await this.registerServiceWorker();

      // Set up event listeners
      this.setupEventListeners();

      // Request notification permission if not already granted
      await this.requestNotificationPermission();

      // Initialize background sync
      await this.initializeBackgroundSync();

      // Track PWA capabilities
      this.trackPWACapabilities();

      this.isInitialized = true;
      console.log('🚀 PWA Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PWA Manager:', error);
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('✅ Service Worker registered:', this.serviceWorkerRegistration.scope);

      // Handle service worker updates
      this.serviceWorkerRegistration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
        this.handleServiceWorkerUpdate();
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Set up PWA event listeners
   */
  private setupEventListeners(): void {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', this.handleInstallPrompt.bind(this));

    // Listen for app installed event
    window.addEventListener('appinstalled', this.handleAppInstalled.bind(this));

    // Track user engagement for install prompt timing
    this.trackUserEngagement();

    // Handle online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Handle page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Handle install prompt event
   */
  private handleInstallPrompt(event: Event): void {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();
    
    // Store the event for later use
    this.deferredPrompt = event as any;
    
    console.log('📱 PWA install prompt available');
    
    // Show install prompt based on strategy
    this.evaluateInstallPrompt();
  }

  /**
   * Evaluate whether to show install prompt based on strategy
   */
  private evaluateInstallPrompt(): void {
    const strategy = this.installPromptStrategy;
    const now = new Date();

    // Check if we've exceeded max prompts
    if (this.installPromptCount >= strategy.maxPrompts) {
      console.log('Max install prompts reached');
      return;
    }

    // Check cooldown period
    if (this.lastPromptDate) {
      const daysSinceLastPrompt = (now.getTime() - this.lastPromptDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastPrompt < strategy.cooldownDays) {
        console.log(`Install prompt in cooldown (${daysSinceLastPrompt.toFixed(1)} days)`);
        return;
      }
    }

    // Execute strategy
    switch (strategy.trigger) {
      case 'immediate':
        this.showInstallPrompt();
        break;
      case 'engagement':
        if (this.engagementScore >= strategy.minEngagementScore) {
          setTimeout(() => this.showInstallPrompt(), strategy.delayMs);
        }
        break;
      case 'timer':
        setTimeout(() => this.showInstallPrompt(), strategy.delayMs);
        break;
      case 'manual':
        // Only show when manually triggered
        break;
    }
  }

  /**
   * Show install prompt to user
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      await this.deferredPrompt.prompt();

      // Wait for user choice
      const choiceResult = await this.deferredPrompt.userChoice;
      console.log('Install prompt result:', choiceResult.outcome);

      // Track the attempt
      this.installPromptCount++;
      this.lastPromptDate = new Date();
      this.persistData();

      // Analytics tracking
      this.trackInstallPrompt(choiceResult.outcome);

      // Clear the prompt
      this.deferredPrompt = null;

      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  /**
   * Track user engagement for install prompt timing
   */
  private trackUserEngagement(): void {
    const engagementEvents = [
      'click',
      'scroll',
      'keydown',
      'touchstart'
    ];

    const trackEngagement = () => {
      this.engagementScore++;
      
      // Remove listeners after reaching threshold to avoid over-tracking
      if (this.engagementScore >= this.installPromptStrategy.minEngagementScore) {
        engagementEvents.forEach(event => {
          document.removeEventListener(event, trackEngagement);
        });
      }
    };

    engagementEvents.forEach(event => {
      document.addEventListener(event, trackEngagement, { once: false, passive: true });
    });
  }

  /**
   * Handle app installed event
   */
  private handleAppInstalled(): void {
    console.log('🎉 PWA installed successfully');
    this.deferredPrompt = null;
    
    // Track installation
    this.trackAppInstalled();
    
    // Show welcome message or onboarding
    this.showInstallationSuccess();
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      console.log('Service Worker not registered');
      return null;
    }

    if (!('PushManager' in window)) {
      console.log('Push notifications not supported');
      return null;
    }

    try {
      // Check for existing subscription
      let subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.log('VAPID public key not configured');
          return null;
        }

        subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      console.log('✅ Subscribed to push notifications');
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Send push subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  /**
   * Initialize background sync
   */
  private async initializeBackgroundSync(): Promise<void> {
    if (!this.serviceWorkerRegistration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.log('Background sync not supported');
      return;
    }

    try {
      // Register sync events
      if ('sync' in this.serviceWorkerRegistration) {
        await (this.serviceWorkerRegistration as any).sync.register('sync-analytics');
      }
      console.log('✅ Background sync initialized');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  /**
   * Store data for background sync
   */
  async storeForBackgroundSync(data: BackgroundSyncData): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Store in IndexedDB for background sync
      const db = await this.openIndexedDB();
      const transaction = db.transaction([this.getStoreName(data.type)], 'readwrite');
      const store = transaction.objectStore(this.getStoreName(data.type));
      
      const syncData = {
        id: `${data.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data: data.data,
        timestamp: data.timestamp || Date.now(),
        attempts: data.attempts || 0
      };
      
      await store.add(syncData);
      
      // Register background sync if supported
      if (this.serviceWorkerRegistration && 'sync' in window.ServiceWorkerRegistration.prototype) {
        await (this.serviceWorkerRegistration as any).sync.register(`sync-${data.type}`);
      }
      
      console.log('📦 Data stored for background sync:', data.type);
    } catch (error) {
      console.error('Failed to store data for background sync:', error);
      
      // Fallback: try immediate submission
      await this.submitDataDirectly(data);
    }
  }

  /**
   * Submit data directly when background sync fails
   */
  private async submitDataDirectly(data: BackgroundSyncData): Promise<void> {
    try {
      let endpoint = '';
      switch (data.type) {
        case 'lead-form':
          endpoint = '/api/leads';
          break;
        case 'quote-request':
          endpoint = '/api/leads';
          break;
        case 'newsletter':
          endpoint = '/api/newsletter';
          break;
        case 'analytics':
          endpoint = '/api/analytics/track';
          break;
        default:
          throw new Error(`Unknown data type: ${data.type}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Data submitted directly:', data.type);
    } catch (error) {
      console.error('Failed to submit data directly:', error);
    }
  }

  /**
   * Update app badge count
   */
  async updateBadgeCount(count: number = 0): Promise<void> {
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
        } else {
          await (navigator as any).clearAppBadge();
        }
      } catch (error) {
        console.log('Badge API not supported or failed:', error);
      }
    }
  }

  /**
   * Get PWA capabilities
   */
  getCapabilities(): PWACapabilities {
    return {
      isInstallable: !!this.deferredPrompt,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      isOffline: !navigator.onLine,
      hasNotificationPermission: Notification.permission === 'granted',
      supportsPushNotifications: 'PushManager' in window,
      supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      supportsBadging: 'setAppBadge' in navigator
    };
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log('🌐 Connection restored');
    this.updateBadgeCount(0); // Clear offline badge
    
    // Trigger background sync
    if (this.serviceWorkerRegistration && 'sync' in this.serviceWorkerRegistration) {
      (this.serviceWorkerRegistration as any).sync.register('sync-all').catch(console.error);
    }
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('📴 Connection lost - entering offline mode');
    this.updateBadgeCount(1); // Show offline indicator
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden, could be a good time for background tasks
      this.handlePageHidden();
    } else {
      // Page is visible again
      this.handlePageVisible();
    }
  }

  /**
   * Handle page hidden event
   */
  private handlePageHidden(): void {
    // Trigger background sync for any pending data
    if (this.serviceWorkerRegistration && 'sync' in window.ServiceWorkerRegistration.prototype) {
      (this.serviceWorkerRegistration as any).sync.register('sync-all').catch(console.error);
    }
  }

  /**
   * Handle page visible event
   */
  private handlePageVisible(): void {
    // Check for updates or refresh data
    this.checkForUpdates();
  }

  /**
   * Handle service worker update
   */
  private handleServiceWorkerUpdate(): void {
    const newWorker = this.serviceWorkerRegistration?.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker installed, show update notification
          this.showUpdateAvailable();
        }
      });
    }
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data || {};
    
    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', payload);
        break;
      case 'OFFLINE_FALLBACK':
        console.log('Offline fallback used:', payload);
        break;
      case 'SYNC_COMPLETE':
        console.log('Background sync complete:', payload);
        this.updateBadgeCount(0);
        break;
      default:
        console.log('Unknown service worker message:', type, payload);
    }
  }

  /**
   * Check for service worker updates
   */
  private async checkForUpdates(): Promise<void> {
    if (this.serviceWorkerRegistration) {
      try {
        await this.serviceWorkerRegistration.update();
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  }

  /**
   * Show update available notification
   */
  private showUpdateAvailable(): void {
    // Create or show update notification UI
    console.log('🔄 App update available');
    
    // Could dispatch custom event for UI components to handle
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  /**
   * Show installation success message
   */
  private showInstallationSuccess(): void {
    // Create or show success notification
    console.log('🎉 App installed successfully');
    
    // Could dispatch custom event for UI components to handle
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  }

  /**
   * Utility functions
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray as Uint8Array<ArrayBuffer>;
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('Fly2AnyPWA', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('leadForms')) {
          db.createObjectStore('leadForms', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('quoteRequests')) {
          db.createObjectStore('quoteRequests', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('newsletterSubscriptions')) {
          db.createObjectStore('newsletterSubscriptions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('analyticsEvents')) {
          db.createObjectStore('analyticsEvents', { keyPath: 'id' });
        }
      };
    });
  }

  private getStoreName(type: string): string {
    switch (type) {
      case 'lead-form': return 'leadForms';
      case 'quote-request': return 'quoteRequests';
      case 'newsletter': return 'newsletterSubscriptions';
      case 'analytics': return 'analyticsEvents';
      default: return 'leadForms';
    }
  }

  private loadPersistentData(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const data = localStorage.getItem('fly2any-pwa-data');
      if (data) {
        const parsed = JSON.parse(data);
        this.installPromptCount = parsed.installPromptCount || 0;
        this.lastPromptDate = parsed.lastPromptDate ? new Date(parsed.lastPromptDate) : null;
      }
    } catch (error) {
      console.error('Failed to load persistent data:', error);
    }
  }

  private persistData(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const data = {
        installPromptCount: this.installPromptCount,
        lastPromptDate: this.lastPromptDate?.toISOString()
      };
      localStorage.setItem('fly2any-pwa-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist data:', error);
    }
  }

  private trackPWACapabilities(): void {
    const capabilities = this.getCapabilities();
    console.log('PWA Capabilities:', capabilities);
    
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_capabilities', {
        event_category: 'PWA',
        ...capabilities
      });
    }
  }

  private trackInstallPrompt(outcome: string): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install_prompt', {
        event_category: 'PWA',
        event_label: outcome,
        value: this.installPromptCount
      });
    }
  }

  private trackAppInstalled(): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_installed', {
        event_category: 'PWA',
        event_label: 'success'
      });
    }
  }
}

// Global PWA Manager instance
let pwaManager: PWAManager | null = null;

export function initializePWA(strategy?: Partial<InstallPromptStrategy>): PWAManager {
  if (!pwaManager) {
    pwaManager = new PWAManager(strategy);
  }
  return pwaManager;
}

export function getPWAManager(): PWAManager | null {
  return pwaManager;
}

export default PWAManager;