import type { NextConfig } from "next";

// ULTRA-MINIMAL Next.js configuration for debugging React fiber errors
const nextConfig: NextConfig = {
  // Basic image optimization only
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp'],
    unoptimized: false
  },
  
  // Basic settings
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  // Remove all complex webpack and turbopack configurations
  // Remove all experimental features
  // Remove all server external packages
  // Remove all custom redirects and headers temporarily
};

export default nextConfig;