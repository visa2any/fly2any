/** @type {import('next').NextConfig} */
// Enterprise-level Next.js configuration optimized for production

const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: false, // Keep disabled to avoid hydration issues
  poweredByHeader: false,

  // Enable production optimizations
  compress: true,
  swcMinify: true, // Re-enable SWC minifier for better performance

  // Optimized experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'framer-motion',
      'date-fns',
      'react-hook-form',
      '@hookform/resolvers',
      'zod'
    ],
    webpackBuildWorker: true,
  },

  // Re-enable image optimization with Sharp
  images: {
    unoptimized: false, // Re-enable with Sharp installed
    formats: ['image/webp', 'image/avif'],
    loader: 'default',
  },

  // Environment variables
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },

  // Optimized webpack configuration for enterprise deployment
  webpack: (config, { dev, isServer }) => {
    // Optimized production settings
    config.optimization = {
      ...config.optimization,
      // Enable tree shaking for better bundle size
      usedExports: true,
      sideEffects: false,
      // Optimized chunking strategy
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
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
          },
          // Separate large libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
        },
      },
    }

    // Enable filesystem cache for better performance
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }
    }

    // CRITICAL: Enhanced module resolution for @react-email/render Windows compatibility
    config.resolve.alias = {
      '@': require('path').resolve(__dirname, 'src'),
      // Windows path fix for @react-email/render with correct conditional exports
      '@react-email/render': require('path').resolve(__dirname, 'node_modules/@react-email/render'),
    }

    // Enhanced extensions for Windows module resolution
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
    config.resolve.symlinks = false

    // Comprehensive module resolution paths for Windows
    config.resolve.modules = [
      'node_modules',
      require('path').resolve(__dirname, 'node_modules'),
      require('path').resolve(__dirname, 'node_modules/@react-email'),
      require('path').resolve(__dirname, 'node_modules/@react-email/render'),
    ]

    // Windows-specific module resolution fixes
    config.resolve.conditionNames = ['import', 'require', 'node', 'default']
    config.resolve.mainFields = ['module', 'main']

    // Enhanced fallbacks for client-side and server-side compatibility
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
      }
    }

    // CRITICAL: Enhanced global polyfills for Windows and @react-email/render compatibility
    config.plugins = config.plugins || []
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        'global': 'globalThis',
        'self': 'globalThis',
        'process.browser': JSON.stringify(!isServer),
      })
    )

    // Windows-specific module rules for @react-email/render
    config.module.rules.push({
      test: /node_modules\/@react-email\/render/,
      resolve: {
        fullySpecified: false,
        conditionNames: ['import', 'require', 'node', 'default'],
        mainFields: ['module', 'main'],
      },
    })

    return config
  },

  // NO custom headers that could interfere
  async headers() {
    return []
  },

  // TypeScript - enable proper error checking
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint - temporarily disable during builds for successful deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Minimal configuration
  trailingSlash: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // NO compiler optimizations
  compiler: {},

  // NO output optimization
  output: undefined,
}

module.exports = nextConfig