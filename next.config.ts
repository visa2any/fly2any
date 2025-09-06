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
  
  // ULTRATHINK: Enhanced transpile packages for ESM compatibility
  transpilePackages: [
    '@headlessui/react',
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
    '@radix-ui/react-tooltip',
    'framer-motion'
  ],

  // ULTRATHINK: Advanced server external packages (Next.js 15+ format)
  serverExternalPackages: [
    '@prisma/client',
    '@aws-sdk/client-ses',
    'bcryptjs',
    'nodemailer'
  ],
  
  // ULTRATHINK: Advanced experimental features for React Server Components and Next.js 15
  experimental: {
    // Enhanced bundle loading optimization
    optimizePackageImports: [
      '@headlessui/react',
      '@heroicons/react', 
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
      '@radix-ui/react-tooltip',
      'clsx',
      'date-fns'
    ],
    
    // ULTRATHINK: Valid Next.js 15 experimental features
    optimizeCss: true,
    esmExternals: true,
    webpackBuildWorker: true,
    
    // Enhanced React features (disabled until stable)
    reactCompiler: false,
    ppr: false, // Partial Prerendering
    
    // ULTRATHINK: Advanced memory and performance management
    memoryBasedWorkersCount: true,
    workerThreads: true,
    
    // Enhanced development and build performance
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    
    // ULTRATHINK: Advanced CPU utilization  
    cpus: Math.max(1, 4 - 1),
  },
  
  // Enhanced build output configuration
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Build stability enhancements
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  
  // Performance monitoring and optimization
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
  
  // Enhanced build performance
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
  },
};

// Enhanced build output configuration
nextConfig.output = process.env.NODE_ENV === 'production' ? 'standalone' : undefined;

// 🔧 TEMPORARY FIX: Force dynamic rendering to resolve DataCloneError
// This bypasses static generation that's causing serialization issues
export const dynamic = 'force-dynamic';

export default nextConfig;