import type { CapacitorConfig } from '@capacitor/cli';

const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'com.fly2any.app',
  appName: 'Fly2Any',
  webDir: 'out',

  // Server configuration — Remote mode (loads from Vercel production)
  // This is the recommended approach for a Next.js SSR app
  server: {
    url: 'https://fly2any-fresh.vercel.app',
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'fly2any-fresh.vercel.app',
    cleartext: false,
  },

  // iOS-specific configuration
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    scheme: 'Fly2Any',
    preferredContentMode: 'mobile',
  },

  // Android-specific configuration
  android: {
    // SECURITY: No mixed content in production
    allowMixedContent: false,
    captureInput: true,
    // SECURITY: Only enable WebView debugging in development
    webContentsDebuggingEnabled: !isProduction,
    // Brand color while app loads
    backgroundColor: '#E74035',
  },

  // Plugin configurations
  plugins: {
    // Splash Screen — Brand identity
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#E74035', // Brand red
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },

    // Status Bar — Brand aligned
    StatusBar: {
      style: 'light', // Light text on dark/brand background
      backgroundColor: '#E74035', // Brand red
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
      iconColor: '#E74035', // Brand red
      sound: 'beep.wav',
    },
  },
};

export default config;
