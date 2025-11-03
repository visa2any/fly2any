/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.tourradar.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'tourradar.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
    ],
  },
};

export default nextConfig;
