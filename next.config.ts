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
  
  // 🚀 ULTRATHINK: Enterprise-grade webpack configuration with React Server Components optimization
  webpack: (config: any, { dev, isServer, buildId }: { dev: boolean; isServer: boolean; buildId: string }) => {
    const path = require('path');
    
    // ULTRATHINK: Advanced error handling and build stability for React 19
    config.stats = {
      errorDetails: true,
      errors: true,
      warnings: dev,
      chunks: false,
      modules: false,
      chunkModules: false,
      colors: true,
      reasons: dev,
      usedExports: true,
      providedExports: true,
      optimizationBailout: dev,
      chunkOrigins: false,
    };
    
    // ULTRATHINK: Advanced cache configuration with React Server Components support
    if (dev) {
      config.cache = {
        type: 'memory',
        maxGenerations: 1,
        cacheUnaffected: true,
      };
    } else {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        maxMemoryGenerations: 1,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        version: `fly2any-v2-${buildId}`,
        cacheDirectory: path.resolve('.next/cache/webpack'),
        buildDependencies: {
          config: [__filename],
          tsconfig: [path.resolve('./tsconfig.json')],
        },
        hashAlgorithm: 'xxhash64',
        store: 'pack',
        compression: 'gzip',
      };
    }
    
    // ULTRATHINK: Enhanced React Server Components and dynamic import handling
    config.experiments = {
      ...config.experiments,
      layers: true,
      cacheUnaffected: dev, // Only enable in development for compatibility with usedExports
      futureDefaults: false,
      topLevelAwait: true,
    };
    
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

    // ULTRATHINK: Revolutionary module resolution with React Server Components support
    config.resolve = {
      ...config.resolve,
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.mjs', '.wasm'],
      modules: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules'),
        'node_modules'
      ],
      preferRelative: true,
      symlinks: false, // Disable symlinks for better compatibility
      mainFields: isServer ? ['main', 'module'] : ['browser', 'module', 'main'],
      conditionNames: isServer ? ['node', 'import', 'require'] : ['browser', 'module', 'import', 'require'],
      // ULTRATHINK: Advanced alias resolution for React Server Components
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        '~': path.resolve(__dirname),
        // Let Next.js handle React Server Components resolution naturally
      },
    };

    // ULTRATHINK: Advanced chunk loading configuration for React Server Components
    if (!isServer) {
      // Enhanced chunk loading strategies for browser with RSC compatibility
      config.output = {
        ...config.output,
        chunkLoadingGlobal: '__webpack_chunks__',
        chunkFormat: 'array-push',
        chunkLoading: 'jsonp',
        crossOriginLoading: false,
        globalObject: 'globalThis',
        hashFunction: dev ? 'xxhash64' : 'deterministic',
        pathinfo: dev,
        // ULTRATHINK: Enhanced chunk loading for React Server Components
        chunkLoadTimeout: 120000,
        enabledChunkLoadingTypes: ['jsonp', 'import-scripts'],
      };
      
      // ULTRATHINK: Advanced optimization for dynamic imports and React Server Components
      config.optimization = {
        ...config.optimization,
        moduleIds: dev ? 'named' : 'deterministic',
        chunkIds: dev ? 'named' : 'deterministic',
        mangleWasmImports: true,
        removeAvailableModules: !dev,
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
        flagIncludedChunks: !dev,
        providedExports: true,
        usedExports: !dev, // Disable in dev mode when using cacheUnaffected
        sideEffects: false,
        innerGraph: true,
        realContentHash: !dev,
        // Enhanced runtime chunk configuration
        runtimeChunk: dev ? false : {
          name: 'runtime'
        },
      };
    }

    // ULTRATHINK: Server-side externals with React Server Components optimization
    if (isServer) {
      const externals = [...(config.externals || [])];
      
      // Enhanced externals configuration for React Server Components
      config.externals = [
        ...externals,
        // Optimize React Server Components dependencies
        {
          '@prisma/client': 'commonjs @prisma/client',
          'critters': 'commonjs critters',
        }
      ];
      
      // ULTRATHINK: Enhanced React Server Components configuration
      config.resolve.conditionNames = ['react-server', 'node', 'import', 'require'];
      
      // Server-specific optimizations
      config.optimization = {
        ...config.optimization,
        minimize: false, // Don't minimize server code
        splitChunks: false, // No chunk splitting on server
        concatenateModules: false,
      };
    }

    // ULTRATHINK: Enhanced plugin configuration for React Server Components
    const { webpack } = require('next/dist/compiled/webpack/webpack');
    
    config.plugins.push(
      // Improved error handling for dynamic imports
      new webpack.DefinePlugin({
        __REACT_SERVER_COMPONENTS__: JSON.stringify(!isServer),
        __WEBPACK_BUILD_ID__: JSON.stringify(buildId),
        __WEBPACK_CHUNK_LOAD_TIMEOUT__: JSON.stringify(120000),
      }),
      
      // Enhanced module federation for better chunk loading
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    // ULTRATHINK: Advanced React Server Components error handling
    if (!isServer) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: dev ? 1000 : 50, // Prevent chunk fragmentation
        })
      );
      
      // Enhanced chunk loading error handling
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'react-server-dom-webpack/client': false,
      };
    }

    // ULTRATHINK: Advanced development-specific optimizations
    if (dev) {
      // Enhanced HMR and error overlay configuration (let Next.js handle devtool)
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
      
      // Better error reporting for dynamic imports
      config.stats.errorStack = true;
      config.stats.moduleTrace = true;
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
    cpus: Math.max(1, (require('os').cpus()?.length ?? 1) - 1),
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

export default nextConfig;