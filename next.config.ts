import type { NextConfig } from "next";

// CRITICAL SYSTEM FIXES - Next.js 15.4.7 + React 19 Stability
const nextConfig: NextConfig = {
  // Core stability settings
  reactStrictMode: false,
  poweredByHeader: false,
  
  // Build optimization
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // CRITICAL: Disable all experimental features causing issues
  experimental: {
    webpackBuildWorker: false,
    esmExternals: true,
  },
  
  // Enhanced webpack configuration for stability and performance
  webpack: (config, { dev, isServer }) => {
    // Performance optimization: Enable build caching in development, disable parallelism issues in production
    if (dev) {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        buildDependencies: {
          config: [__filename],
        },
      };
      config.parallelism = 1; // Reduce parallelism in dev to avoid issues
    } else {
      config.cache = false; // Disable cache in production builds for consistency
      config.parallelism = 4; // Allow more parallelism in production
    }
    
    // Fix EPIPE errors by reducing concurrent operations
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 600,
        ignored: /node_modules/,
      };
    }
    
    // Module resolution will be handled below with more comprehensive fallbacks
    
    // CRITICAL: Advanced optimization for Core Web Vitals
    config.optimization = {
      ...config.optimization,
      minimize: !dev,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: dev ? 250000 : 244000, // ~244KB per chunk for optimal loading
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 244000,
          },
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
            maxSize: 150000,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            chunks: 'all',
            priority: -5,
            maxSize: 244000,
          },
        },
      },
      usedExports: true,
      sideEffects: false,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    };

    // Performance optimization plugins
    if (!dev) {
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
        })
      );
      
      // Tree shaking and dead code elimination
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Improve build performance with better module ids
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }
    
    // TypeScript performance optimization
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    // Exclude problematic packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        querystring: false,
        buffer: false,
      };
    }

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },
  
  // Enhanced image optimization for Core Web Vitals
  images: {
    formats: ['image/webp', 'image/avif'],
    unoptimized: process.env.NODE_ENV === 'development',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['fly2any.com', 'www.fly2any.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fly2any.com',
      },
    ],
  },
  
  // Essential transpile packages only
  transpilePackages: [
    '@headlessui/react',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@tiptap/react',
    '@tiptap/starter-kit',
    '@tiptap/extension-text-align',
    '@tiptap/extension-text-style',
    '@tiptap/extension-color',
    '@tiptap/extension-link',
    '@tiptap/extension-placeholder',
    '@tiptap/extension-character-count'
  ],
  
  // Server externals  
  serverExternalPackages: ['@prisma/client'],
  
  // Production output
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Performance and compression settings
  compress: true,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  
  // Logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Headers for performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
        ],
      },
      {
        source: '/(.*)\\.(js|css|png|jpg|jpeg|gif|webp|avif|woff|woff2|ttf|otf|eot|svg|ico)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

export default nextConfig;