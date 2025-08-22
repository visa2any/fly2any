import type { NextConfig } from "next";

// Absolute minimal config for testing
const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: false,
  trailingSlash: false,
  
  // Disable all optimizations that could cause issues
  swcMinify: false,
  experimental: {},
  
  // Simple webpack config to avoid issues
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  }
};

export default nextConfig;