import { withSentryConfig } from '@sentry/nextjs';
import { createRequire } from 'module';

// Create require function for CommonJS modules in ESM context
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations (Phase 8 - Quick Win 1A)
  compiler: {
    // Remove console.log statements in production (keeps error/warn for monitoring)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'], // Tree-shake icons
  },

  // Webpack configuration (Phase 8 - Quick Win 1D)
  webpack: (config, { dev, isServer }) => {
    // Add bundle analyzer in production builds (client-side only)
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../analyze/client.html',
          generateStatsFile: true,
          statsFilename: '../analyze/client-stats.json',
        })
      );
    }
    return config;
  },

  images: {
    remotePatterns: [
      // Tour images
      {
        protocol: 'https',
        hostname: 'www.tourradar.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'tourradar.com',
        pathname: '/images/**',
      },
      // User avatars
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      // Stock images
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Duffel API images (flights, airlines, airports)
      {
        protocol: 'https',
        hostname: 'assets.duffel.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'duffel.com',
        pathname: '/**',
      },
      // Amadeus API images (hotels, destinations)
      {
        protocol: 'https',
        hostname: '**.amadeus.com',
      },
      // Hotel images (common CDNs)
      {
        protocol: 'https',
        hostname: 'pix*.agoda.net',
      },
      {
        protocol: 'https',
        hostname: 'images.trvl-media.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.booking.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'r-xx.bstatic.com',
        pathname: '/**',
      },
      // Car rental images
      {
        protocol: 'https',
        hostname: 'images.hertz.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.enterprise.com',
        pathname: '/content/**',
      },
      // Generic CDNs
      {
        protocol: 'https',
        hostname: 'cdn.*.com',
      },
      {
        protocol: 'https',
        hostname: 'images.*.com',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern formats with fallback
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Support up to 4K
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images for 30 days
    dangerouslyAllowSVG: true, // Allow SVG for icons and logos
    contentDispositionType: 'attachment', // Security for user-uploaded images
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // CSP for images
  },
};

/**
 * Sentry Configuration Options
 * See: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Organization slug from your Sentry organization settings
  org: process.env.SENTRY_ORG,

  // Project slug from your Sentry project settings
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppresses source map uploading logs during build
  silent: true,

  // Upload source maps in production only
  // This helps with debugging production errors
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Transpile SDK to be compatible with Next.js
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  // (This does *not* increase server-side resource usage)
  tunnelRoute: '/monitoring',

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Disables automatic instrumentation of Vercel Cron Jobs
  // If you want to enable it, remove this option
  automaticVercelMonitors: false,
};

// Export the config wrapped with Sentry
// Only enable Sentry in production builds or when explicitly configured
const shouldUseSentry = process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production';

export default shouldUseSentry
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
