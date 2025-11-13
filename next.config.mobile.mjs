import { withSentryConfig } from '@sentry/nextjs';
import { createRequire } from 'module';

// Create require function for CommonJS modules in ESM context
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // MOBILE BUILD: Static export for Capacitor
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Enable SWC minification
  swcMinify: true,

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@/components'],
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Suppress warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@prisma\/instrumentation/ },
      { module: /node_modules\/@opentelemetry\/instrumentation/ },
      { module: /node_modules\/require-in-the-middle/ },
    ];

    return config;
  },

  // Trailing slash for static export
  trailingSlash: true,

  // Skip type checking during build (faster mobile builds)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
};

/**
 * Sentry Configuration Options - Disabled for mobile builds
 */
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  hideSourceMaps: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  reactComponentAnnotation: {
    enabled: true,
  },
  automaticVercelMonitors: false,
};

// Only enable Sentry in production web builds
const shouldUseSentry = false; // Disabled for mobile builds

export default shouldUseSentry
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
