import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fly2any.app',
  appName: 'Fly2Any',
  webDir: 'out',

  // Server configuration for development
  server: {
    // Allow live reload during development
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'fly2any.com',
    // Use cleartext for development (localhost)
    cleartext: true,
  },

  // iOS-specific configuration
  ios: {
    contentInset: 'automatic',
    // Use WKWebView with modern features
    scrollEnabled: true,
    scheme: 'Fly2Any',
    // Prefer native navigation
    preferredContentMode: 'mobile',
  },

  // Android-specific configuration
  android: {
    // Allow mixed content for API calls
    allowMixedContent: true,
    // Capture back button
    captureInput: true,
    // Use Android X
    webContentsDebuggingEnabled: true,
    // Background color while app loads
    backgroundColor: '#ffffff',
    // Hide splash on page load
    hideLogs: false,
  },

  // Plugin configurations
  plugins: {
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#0066cc',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },

    // Status Bar
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
    },

    // Keyboard
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true,
    },

    // Push Notifications
    PushNotifications: {
      presentationOptions: ['alert', 'badge', 'sound'],
    },

    // Local Notifications
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#0066cc',
      sound: 'beep.wav',
    },

    // App
    App: {
      handleUrlLinks: true,
      appUrlOpen: true,
    },
  },
};

export default config;
