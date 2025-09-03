/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Disable experimental features that might cause issues
  },
  webpack: (config, { dev, isServer }) => {
    // Essential React 19 JSX runtime configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime')
    };

    return config;
  },
};

module.exports = nextConfig;