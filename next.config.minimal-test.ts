import type { NextConfig } from "next";

// Absolutely minimal Next.js configuration for testing
const nextConfig: NextConfig = {
  // Only essential settings
  reactStrictMode: false,
  poweredByHeader: false,
  
  // Skip all file system checks and optimizations
  experimental: {
    turbo: undefined
  },
  
  // Disable all webpack customizations
  webpack: undefined,
  
  // Disable all other features
  images: undefined,
  redirects: undefined,
  rewrites: undefined,
  headers: undefined,
  serverExternalPackages: undefined
};

export default nextConfig;