/**
 * Mobile Utilities for Fly2Any
 *
 * Comprehensive mobile features:
 * - Biometric authentication (FaceID/TouchID/Fingerprint)
 * - Push notifications
 * - Deep linking
 * - Device information
 * - Network status
 * - App state management
 */

import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { App, AppState } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';

/**
 * Initialize mobile app features
 */
export async function initializeMobileApp() {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Mobile] Running on web platform, skipping mobile initialization');
    return;
  }

  console.log('[Mobile] Initializing mobile app features...');

  try {
    // Initialize status bar
    await initializeStatusBar();

    // Initialize push notifications
    await initializePushNotifications();

    // Initialize deep linking
    await initializeDeepLinking();

    // Initialize app state listeners
    await initializeAppStateListeners();

    // Initialize network listeners
    await initializeNetworkListeners();

    console.log('[Mobile] Mobile app initialized successfully');
  } catch (error) {
    console.error('[Mobile] Failed to initialize mobile app:', error);
  }
}

/**
 * Status Bar Configuration
 */
async function initializeStatusBar() {
  if (!Capacitor.isPluginAvailable('StatusBar')) {
    return;
  }

  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#3B82F6' }); // Blue-600
    console.log('[Mobile] Status bar configured');
  } catch (error) {
    console.error('[Mobile] Status bar configuration failed:', error);
  }
}

/**
 * Push Notifications
 */
async function initializePushNotifications() {
  if (!Capacitor.isPluginAvailable('PushNotifications')) {
    return;
  }

  try {
    // Request permission
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive === 'granted') {
      await PushNotifications.register();
      console.log('[Mobile] Push notifications enabled');
    }

    // Handle registration
    PushNotifications.addListener('registration', (token) => {
      console.log('[Mobile] Push registration success:', token.value);
      // Send token to backend
      savePushToken(token.value);
    });

    // Handle errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Mobile] Push registration failed:', error);
    });

    // Handle received notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Mobile] Push notification received:', notification);
      triggerHapticFeedback('medium');
    });

    // Handle notification tap
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('[Mobile] Push notification tapped:', notification);
      // Handle deep link from notification
      if (notification.notification.data?.url) {
        handleDeepLink(notification.notification.data.url);
      }
    });
  } catch (error) {
    console.error('[Mobile] Push notifications initialization failed:', error);
  }
}

/**
 * Save push token to backend
 */
async function savePushToken(token: string) {
  try {
    const { apiClient } = await import('./api-client');
    await apiClient.post('/api/push/register', { token });
    console.log('[Mobile] Push token saved to backend');
  } catch (error) {
    console.error('[Mobile] Failed to save push token:', error);
  }
}

/**
 * Deep Linking
 */
async function initializeDeepLinking() {
  if (!Capacitor.isPluginAvailable('App')) {
    return;
  }

  try {
    // Handle app URL open (deep links)
    App.addListener('appUrlOpen', (event) => {
      console.log('[Mobile] Deep link opened:', event.url);
      handleDeepLink(event.url);
    });

    console.log('[Mobile] Deep linking configured');
  } catch (error) {
    console.error('[Mobile] Deep linking initialization failed:', error);
  }
}

/**
 * Handle deep link routing
 */
function handleDeepLink(url: string) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    console.log('[Mobile] Handling deep link:', path);

    // Route to appropriate page
    if (typeof window !== 'undefined') {
      window.location.href = path + urlObj.search;
    }
  } catch (error) {
    console.error('[Mobile] Failed to handle deep link:', error);
  }
}

/**
 * App State Listeners
 */
async function initializeAppStateListeners() {
  if (!Capacitor.isPluginAvailable('App')) {
    return;
  }

  try {
    App.addListener('appStateChange', (state: AppState) => {
      console.log('[Mobile] App state changed:', state.isActive ? 'active' : 'background');

      if (state.isActive) {
        // App came to foreground
        onAppForeground();
      } else {
        // App went to background
        onAppBackground();
      }
    });

    console.log('[Mobile] App state listeners configured');
  } catch (error) {
    console.error('[Mobile] App state listeners failed:', error);
  }
}

function onAppForeground() {
  console.log('[Mobile] App is now in foreground');
  // Refresh data, check for updates, etc.
}

function onAppBackground() {
  console.log('[Mobile] App is now in background');
  // Save state, pause timers, etc.
}

/**
 * Network Listeners
 */
async function initializeNetworkListeners() {
  if (!Capacitor.isPluginAvailable('Network')) {
    return;
  }

  try {
    Network.addListener('networkStatusChange', (status) => {
      console.log('[Mobile] Network status changed:', status.connected ? 'online' : 'offline');

      if (status.connected) {
        onNetworkOnline();
      } else {
        onNetworkOffline();
      }
    });

    console.log('[Mobile] Network listeners configured');
  } catch (error) {
    console.error('[Mobile] Network listeners failed:', error);
  }
}

function onNetworkOnline() {
  console.log('[Mobile] Device is online');
  // Sync pending data
}

function onNetworkOffline() {
  console.log('[Mobile] Device is offline');
  // Show offline UI
}

/**
 * Biometric Authentication
 * Note: Requires @capacitor-community/biometric-auth plugin
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Mobile] Biometrics not available on web');
    return false;
  }

  try {
    // Check if biometrics are available
    const deviceInfo = await Device.getInfo();
    console.log('[Mobile] Device info:', deviceInfo);

    // TODO: Implement actual biometric authentication with @capacitor-community/biometric-auth
    // For now, return true for testing
    console.log('[Mobile] Biometric authentication would be performed here');
    return true;
  } catch (error) {
    console.error('[Mobile] Biometric authentication failed:', error);
    return false;
  }
}

/**
 * Haptic Feedback
 */
export async function triggerHapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!Capacitor.isPluginAvailable('Haptics')) {
    return;
  }

  try {
    const impactStyle = style === 'light' ? ImpactStyle.Light :
                       style === 'heavy' ? ImpactStyle.Heavy :
                       ImpactStyle.Medium;

    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.error('[Mobile] Haptic feedback failed:', error);
  }
}

/**
 * Share Content
 */
export async function shareContent(title: string, text: string, url?: string) {
  if (!Capacitor.isPluginAvailable('Share')) {
    console.log('[Mobile] Share not available');
    return;
  }

  try {
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Share with',
    });
    console.log('[Mobile] Content shared');
  } catch (error) {
    console.error('[Mobile] Share failed:', error);
  }
}

/**
 * Open URL in Browser
 */
export async function openInBrowser(url: string) {
  if (!Capacitor.isPluginAvailable('Browser')) {
    window.open(url, '_blank');
    return;
  }

  try {
    await Browser.open({ url });
  } catch (error) {
    console.error('[Mobile] Failed to open browser:', error);
    window.open(url, '_blank');
  }
}

/**
 * Get Device Information
 */
export async function getDeviceInfo() {
  if (!Capacitor.isPluginAvailable('Device')) {
    return {
      platform: 'web',
      model: 'Unknown',
      osVersion: 'Unknown',
    };
  }

  try {
    const info = await Device.getInfo();
    return {
      platform: info.platform,
      model: info.model,
      osVersion: info.osVersion,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual,
    };
  } catch (error) {
    console.error('[Mobile] Failed to get device info:', error);
    return null;
  }
}

/**
 * Get Network Status
 */
export async function getNetworkStatus() {
  if (!Capacitor.isPluginAvailable('Network')) {
    return {
      connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
      connectionType: 'unknown',
    };
  }

  try {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  } catch (error) {
    console.error('[Mobile] Failed to get network status:', error);
    return null;
  }
}

/**
 * Check if running on mobile
 */
export function isMobile(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get platform
 */
export function getPlatform(): 'web' | 'ios' | 'android' {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return 'ios';
  if (platform === 'android') return 'android';
  return 'web';
}
