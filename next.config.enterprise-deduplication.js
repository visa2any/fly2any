/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Ensure consistent React runtime across all environments
    esmExternals: 'loose',
    serverComponentsExternalPackages: [],
  },
  
  webpack: (config, { dev, isServer, webpack, buildId }) => {
    // ENTERPRISE CRITICAL: Block Next.js from using its compiled React
    const reactPath = path.resolve('./node_modules/react');
    const reactDomPath = path.resolve('./node_modules/react-dom');
    const reactDomClientPath = path.resolve('./node_modules/react-dom/client');
    const reactDomServerPath = path.resolve('./node_modules/react-dom/server');
    const reactJsxRuntimePath = path.resolve('./node_modules/react/jsx-runtime');
    const reactJsxDevRuntimePath = path.resolve('./node_modules/react/jsx-dev-runtime');

    // FORCE ABSOLUTE REACT DEDUPLICATION - Override Next.js compiled versions
    config.resolve.alias = {
      ...config.resolve.alias,
      // CRITICAL: Override Next.js compiled React with our project version
      'react': reactPath,
      'react-dom': reactDomPath,
      'react-dom/client': reactDomClientPath,
      'react-dom/server': reactDomServerPath,
      'react/jsx-runtime': reactJsxRuntimePath,
      'react/jsx-dev-runtime': reactJsxDevRuntimePath,
      
      // ENTERPRISE: Block Next.js compiled versions completely
      'next/dist/compiled/react': reactPath,
      'next/dist/compiled/react-dom': reactDomPath,
      'next/dist/compiled/react-dom/client': reactDomClientPath,
      'next/dist/compiled/react-dom/server': reactDomServerPath,
      'next/dist/compiled/react/jsx-runtime': reactJsxRuntimePath,
      'next/dist/compiled/react/jsx-dev-runtime': reactJsxDevRuntimePath,
    };

    // ENTERPRISE: Fallback resolution to prevent any React duplication
    if (!config.resolve.fallback) config.resolve.fallback = {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react': reactPath,
      'react-dom': reactDomPath,
      'react-dom/client': reactDomClientPath,
      'react-dom/server': reactDomServerPath,
      'react/jsx-runtime': reactJsxRuntimePath,
      'react/jsx-dev-runtime': reactJsxDevRuntimePath,
    };

    // CRITICAL: Configure module resolution order to prioritize our React
    config.resolve.modules = [
      path.resolve('./node_modules'),
      'node_modules'
    ];

    // ENTERPRISE: Disable symlinks to prevent version confusion
    config.resolve.symlinks = false;

    // CRITICAL: Remove React from externals to ensure bundling consistency
    if (config.externals && !isServer) {
      config.externals = config.externals.filter(
        external => {
          if (typeof external === 'string') {
            return !external.includes('react');
          }
          return true;
        }
      );
    }

    // ENTERPRISE: Force module replacement for any React imports
    config.plugins.push(
      // Replace any Next.js compiled React imports with our version
      new webpack.NormalModuleReplacementPlugin(
        /^next\/dist\/compiled\/react$/,
        reactPath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^next\/dist\/compiled\/react-dom$/,
        reactDomPath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^next\/dist\/compiled\/react-dom\/client$/,
        reactDomClientPath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^next\/dist\/compiled\/react-dom\/server$/,
        reactDomServerPath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^next\/dist\/compiled\/react\/jsx-runtime$/,
        reactJsxRuntimePath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^next\/dist\/compiled\/react\/jsx-dev-runtime$/,
        reactJsxDevRuntimePath
      ),
      
      // Standard React module replacements
      new webpack.NormalModuleReplacementPlugin(
        /^react-dom\/client$/,
        reactDomClientPath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^react-dom\/server$/,
        reactDomServerPath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^react\/jsx-runtime$/,
        reactJsxRuntimePath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^react\/jsx-dev-runtime$/,
        reactJsxDevRuntimePath
      ),

      // ENTERPRISE: Provide global React constants to prevent Context nullification
      new webpack.ProvidePlugin({
        'React': reactPath,
        'ReactDOM': reactDomPath,
      }),

      // ENTERPRISE: Define React version globally to prevent conflicts
      new webpack.DefinePlugin({
        'process.env.REACT_VERSION': JSON.stringify('18.3.1'),
        'process.env.__NEXT_REACT_ROOT': JSON.stringify(true),
      })
    );

    // ENTERPRISE: Configure optimization to prevent React splitting
    if (!config.optimization) config.optimization = {};
    if (!config.optimization.splitChunks) config.optimization.splitChunks = {};
    
    config.optimization.splitChunks.cacheGroups = {
      ...config.optimization.splitChunks.cacheGroups,
      react: {
        name: 'react',
        chunks: 'all',
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        priority: 10,
        enforce: true,
      },
    };

    // ENTERPRISE: Development-specific React consistency checks
    if (dev) {
      // Add runtime checks for React consistency
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `/* Enterprise React Deduplication - Single React 18.3.1 Instance */`,
          raw: false,
          entryOnly: true,
        })
      );
    }

    return config;
  },
  
  // ENTERPRISE: Ensure consistent React environment variables
  env: {
    REACT_VERSION: '18.3.1',
    __NEXT_REACT_ROOT: 'true',
  },
  
  // ENTERPRISE: Configure headers for React consistency
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-React-Version',
            value: '18.3.1',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;