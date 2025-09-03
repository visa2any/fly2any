import type { NextConfig } from "next";

// 🚀 ENTERPRISE NEXT.JS CONFIGURATION
// TypeScript-compatible with advanced security and performance optimizations
const nextConfig: NextConfig = {
  // Core React 19 compatibility settings
  reactStrictMode: true,
  poweredByHeader: false, // Security: Remove X-Powered-By header
  compress: true,
  
  // Performance optimizations
  trailingSlash: false,
  productionBrowserSourceMaps: false, // Security: Disable source maps in production
  // Note: swcMinify and optimizeFonts are now enabled by default in Next.js 15
  
  // Advanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false, // Security: disable SVG optimization
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json'
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true, // Temporary for React 19 compatibility
    dirs: ['src'],
  },
  
  // Enterprise-grade webpack configuration
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    const path = require('path');
    
    // React consistency aliases - temporarily disabled for build fix
    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   "react": path.resolve(__dirname, "node_modules/react"),
    //   "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    //   "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
    //   "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime")
    // };

    // Node.js polyfills for client-side builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      querystring: false,
    };

    // Production bundle optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          minRemainingSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            // React ecosystem chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react-vendor',
              priority: 20,
              reuseExistingChunk: true,
            },
            // UI Libraries chunk
            ui: {
              test: /[\\/]node_modules[\\/](@headlessui|@heroicons|@radix-ui)[\\/]/,
              name: 'ui-vendor',
              priority: 15,
              reuseExistingChunk: true,
            },
            // Utilities chunk
            utils: {
              test: /[\\/]node_modules[\\/](lodash|date-fns|clsx|classnames)[\\/]/,
              name: 'utils-vendor',
              priority: 12,
              reuseExistingChunk: true,
            },
            // General vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Default chunk
            default: {
              minChunks: 2,
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
        // Performance optimizations
        usedExports: true,
        sideEffects: false,
        concatenateModules: true,
      };
    }

    // Module resolution
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ];

    // Server-side externals
    if (isServer) {
      config.externals = [...(config.externals || [])];
    }

    return config;
  },
  
  // Security headers configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Basic security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://bat.bing.com https://clarity.ms",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: data:",
              "connect-src 'self' https://api.amadeus.com https://api.liteapi.travel https://www.google-analytics.com https://www.facebook.com https://bat.bing.com",
              "frame-src 'self' https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
          // HSTS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Additional security
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Static assets caching
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes security
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Transpile packages for ESM compatibility
  transpilePackages: [
    '@headlessui/react',
    '@aws-sdk/client-ses',
    '@radix-ui/react-avatar',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-label',
    '@radix-ui/react-popover',
    '@radix-ui/react-select',
    '@radix-ui/react-slot',
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs',
    '@radix-ui/react-tooltip'
  ],

  // Experimental features (disabled for stability)
  experimental: {},
};

export default nextConfig;