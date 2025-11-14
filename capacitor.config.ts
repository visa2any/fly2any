import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fly2any.app',
  appName: 'Fly2Any',
  webDir: 'out',

  // Server configuration
  server: {
    // Production API URL - Mobile apps will call this
    url: 'https://fly2any-fresh.vercel.app',
    // Use HTTPS scheme for security
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'fly2any-fresh.vercel.app',
    // Enable cleartext only for development
    cleartext: false,
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
    // Enable web debugging in debug builds
    webContentsDebuggingEnabled: true,
    // Background color while app loads
    backgroundColor: '#ffffff',
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

    // App - Deep linking is handled via server.url configuration above
    // No additional App plugin configuration needed
  },
};

export default config;
