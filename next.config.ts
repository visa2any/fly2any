import type { NextConfig } from "next";

// ULTRA MINIMAL Next.js 15 + React 19 - Production Ready
const nextConfig: NextConfig = {
  // Core settings
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Build optimization
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds for speed
  },
  
  // Basic image config
  images: {
    formats: ['image/webp', 'image/avif']
  },
  
  // Only essential transpile packages
  transpilePackages: [
    '@headlessui/react',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu'
  ],
  
  // Server externals
  serverExternalPackages: ['@prisma/client'],
  
  // Production output
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined
};

export default nextConfig;