import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
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
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
