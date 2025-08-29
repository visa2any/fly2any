import type { NextConfig } from "next";

// Enhanced Next.js configuration to resolve TypeScript compilation issues
const nextConfig: NextConfig = {
  // Basic configuration for React 19 compatibility
  reactStrictMode: true, // Enable strict mode for React 19
  poweredByHeader: false,
  compress: true, // Enable compression
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Enable to catch TS errors
    tsconfigPath: './tsconfig.json'
  },
  
  // ESLint configuration - temporarily ignore during builds due to Next.js internal ESLint config issue
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['src'],
  },
  
  // Webpack configuration to handle module resolution and React 19 JSX runtime
  webpack: (config, { dev, isServer }) => {
    // Fix for React 19 JSX runtime resolution and prevent duplicate React
    const path = require('path');
    
    // Configure aliases for React consistency
    config.resolve.alias = {
      ...config.resolve.alias,
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime")
    };

    // Ensure proper module resolution for AWS SDK and other packages
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Handle external dependencies for server-side rendering
    if (isServer) {
      config.externals = [...(config.externals || [])];
    }

    // Ensure proper JSX runtime configuration and module resolution
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    
    // Force consistent module resolution
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ];

    return config;
  },
  
  // Disable all experimental features to avoid conflicts
  experimental: {},
  
  // Ensure proper ESM handling and React 19 compatibility
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
  ]
};

export default nextConfig;