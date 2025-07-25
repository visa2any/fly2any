import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Server external packages for database
  serverExternalPackages: ['@vercel/postgres'],
  
  // Variáveis de ambiente disponíveis no cliente quando necessário
  env: {
    DATABASE_CONNECTION_AVAILABLE: process.env.POSTGRES_URL ? 'true' : 'false',
  },

  // Redirecionamentos para resolver problema de SSL
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'fly2any.com',
          },
        ],
        destination: 'https://www.fly2any.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
