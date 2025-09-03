/**
 * 🛠️ SIMPLE WEBPACK CONFIGURATION - Hot-fix for React fiber errors
 * ULTRATHINK: Bypass complex webpack configuration causing build failures
 */

const path = require('path');

/**
 * Simple enterprise webpack configuration
 * Removes complex optimizations that cause build failures
 */
function createEnterpriseWebpackConfig(config, { dev, isServer }) {
  // Skip modifications for server-side
  if (isServer) {
    return config;
  }

  console.log('🛠️ Using simplified webpack configuration...');

  // Basic path resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@lib': path.resolve(__dirname, 'src/lib'),
    '@types': path.resolve(__dirname, 'src/types'),
  };

  // Basic optimization for development
  if (dev) {
    config.optimization = {
      ...config.optimization,
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    };
  }

  return config;
}

module.exports = {
  createEnterpriseWebpackConfig
};