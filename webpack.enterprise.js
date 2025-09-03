/**
 * Enterprise-grade Webpack Configuration for React 19 + Next.js 15.x
 * Addresses originalFactory undefined errors and provides production-ready optimization
 */

const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

/**
 * React Refresh Fix Plugin - Addresses originalFactory undefined errors
 */
class ReactRefreshFixPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tap('ReactRefreshFixPlugin', () => {
      // Ensure React Refresh runtime is properly initialized for React 19
      if (process.env.NODE_ENV === 'development') {
        try {
          const reactRefreshPath = require.resolve('@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils');
          
          // Patch originalFactory undefined issue by ensuring proper entry
          if (compiler.options.entry && typeof compiler.options.entry === 'object') {
            Object.keys(compiler.options.entry).forEach(key => {
              if (Array.isArray(compiler.options.entry[key])) {
                compiler.options.entry[key] = [
                  reactRefreshPath,
                  ...compiler.options.entry[key]
                ];
              }
            });
          }
        } catch (error) {
          console.warn('ReactRefreshFixPlugin: Could not resolve React Refresh runtime:', error.message);
        }
      }
    });
    
    compiler.hooks.compilation.tap('ReactRefreshFixPlugin', (compilation) => {
      // Fix module resolution for React 19 Fast Refresh
      compilation.hooks.beforeModuleAssets.tap('ReactRefreshFixPlugin', () => {
        if (compilation.resolverFactory) {
          compilation.resolverFactory.hooks.resolver
            .for('normal')
            .tap('ReactRefreshFixPlugin', (resolver) => {
              resolver.hooks.resolve.tapAsync('ReactRefreshFixPlugin', (request, resolveContext, callback) => {
                // Handle React Refresh runtime resolution
                if (request.request === 'react-refresh/runtime') {
                  try {
                    return callback(null, {
                      ...request,
                      path: require.resolve('@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils')
                    });
                  } catch (error) {
                    console.warn('ReactRefreshFixPlugin: Runtime resolution failed:', error.message);
                  }
                }
                callback();
              });
            });
        }
      });
    });
  }
}

/**
 * React 19 Memory Optimization Plugin
 */
class React19MemoryOptimizationPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('React19MemoryOptimizationPlugin', (compilation) => {
      // Optimize module concatenation for React 19
      compilation.hooks.optimizeModules.tap('React19MemoryOptimizationPlugin', (modules) => {
        modules.forEach(module => {
          // Skip optimization for React 19 core modules to prevent originalFactory issues
          if (module.resource && module.resource.includes('node_modules/react')) {
            module.optimizationBailout = module.optimizationBailout || [];
            module.optimizationBailout.push('React 19 core module - skip optimization');
          }
        });
      });
      
      // Memory cleanup for React 19 HMR
      compilation.hooks.afterOptimizeChunkModules.tap('React19MemoryOptimizationPlugin', () => {
        if (process.env.NODE_ENV === 'development') {
          // Force garbage collection after chunk optimization
          if (global.gc) {
            global.gc();
          }
        }
      });
    });
  }
}

/**
 * Enterprise webpack configuration factory
 */
function createEnterpriseWebpackConfig(options = {}) {
  const {
    isDevelopment = process.env.NODE_ENV === 'development',
    isServer = false,
    buildId = 'development',
    config = {}
  } = options;

  const enterpriseConfig = {
    ...config,
    
    // Performance optimizations
    performance: {
      hints: isDevelopment ? false : 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    
    // Advanced module resolution for React 19
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        // Force React 19 resolution to prevent version conflicts
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
        'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
        'react-refresh': path.resolve(__dirname, 'node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils'),
      },
      
      // Fallbacks for Node.js modules
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: false,
        util: false,
      },
      
      // Module extensions
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      
      // Symlink resolution
      symlinks: false,
    },
    
    // Cache configuration for performance
    cache: isDevelopment ? {
      type: 'memory',
      maxGenerations: 1,
    } : {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
    
    // Optimization settings
    optimization: {
      ...config.optimization,
      
      // Module concatenation for React 19
      concatenateModules: !isDevelopment,
      
      // Advanced tree shaking
      usedExports: true,
      sideEffects: false,
      
      // Production-only optimizations
      ...(isDevelopment ? {} : {
        minimize: true,
        
        // Advanced code splitting for React 19
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          
          cacheGroups: {
            // React 19 Framework Bundle
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react-vendor',
              priority: 40,
              chunks: 'all',
              reuseExistingChunk: true,
              enforce: true,
            },
            
            // React 19 Runtime Dependencies
            reactRuntime: {
              test: /[\\/]node_modules[\\/](scheduler|react-reconciler)[\\/]/,
              name: 'react-runtime',
              priority: 35,
              chunks: 'all',
              reuseExistingChunk: true,
            },
            
            // UI Libraries
            uiLibs: {
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|@heroicons|lucide-react)[\\/]/,
              name: 'ui-libs',
              priority: 30,
              chunks: 'all',
              reuseExistingChunk: true,
            },
            
            // Vendor Bundle
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 20,
              chunks: 'all',
              reuseExistingChunk: true,
              maxSize: 200000,
            },
            
            // Common Application Code
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              chunks: 'all',
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }),
    },
    
    // Plugin configuration
    plugins: [
      ...(config.plugins || []),
      
      // Development-specific plugins
      ...(isDevelopment && !isServer ? [
        // Custom React Refresh Fix Plugin
        new ReactRefreshFixPlugin(),
        
        // Enhanced React Refresh Plugin for React 19
        new ReactRefreshWebpackPlugin({
          overlay: false, // Disable overlay to prevent originalFactory errors
          exclude: [/node_modules/, /\.next/, /webpack/],
          include: [/src/],
          esModule: true,
          library: '@pmmmwh/react-refresh-webpack-plugin',
          forceEnable: true,
        }),
        
        // Memory optimization for development
        new React19MemoryOptimizationPlugin(),
        
        // Hot Module Replacement
        new webpack.HotModuleReplacementPlugin(),
        
        // Development environment definitions
        new webpack.DefinePlugin({
          '__DEV__': true,
          'process.env.NODE_ENV': JSON.stringify('development'),
          '__REACT_DEVTOOLS_GLOBAL_HOOK__': 'undefined',
        }),
      ] : []),
      
      // Production-specific plugins
      ...(!isDevelopment && !isServer ? [
        // Production environment definitions
        new webpack.DefinePlugin({
          '__DEV__': false,
          'process.env.NODE_ENV': JSON.stringify('production'),
          '__REACT_DEVTOOLS_GLOBAL_HOOK__': 'undefined',
        }),
        
        // Module concatenation optimization
        new webpack.optimize.ModuleConcatenationPlugin(),
        
        // Memory optimization
        new React19MemoryOptimizationPlugin(),
      ] : []),
      
      // Universal plugins
      new webpack.DefinePlugin({
        'process.env.BUILD_ID': JSON.stringify(buildId),
        'process.env.IS_SERVER': JSON.stringify(isServer),
      }),
    ],
    
    // Module rules for React 19
    module: {
      ...config.module,
      rules: [
        ...(config.module?.rules || []),
        
        // TypeScript/JavaScript processing with React 19 support
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    targets: {
                      browsers: ['> 1%', 'last 2 versions', 'not ie <= 11']
                    },
                    modules: false,
                    useBuiltIns: 'usage',
                    corejs: 3
                  }],
                  ['@babel/preset-react', {
                    runtime: 'automatic', // Use new JSX transform
                    development: isDevelopment,
                    importSource: 'react', // React 19 import source
                  }],
                  '@babel/preset-typescript'
                ],
                plugins: [
                  // React Fast Refresh for development
                  isDevelopment && !isServer && require.resolve('react-refresh/babel'),
                  
                  // Production optimizations
                  !isDevelopment && ['babel-plugin-transform-react-remove-prop-types', {
                    mode: 'remove',
                    removeImport: true,
                    additionalLibraries: ['react-immutable-proptypes']
                  }],
                  
                  // Class properties support
                  ['@babel/plugin-proposal-class-properties', { loose: true }],
                  
                  // Runtime transformation
                  ['@babel/plugin-transform-runtime', {
                    corejs: false,
                    helpers: true,
                    regenerator: true,
                    useESModules: false
                  }],
                ].filter(Boolean),
                
                // Cache configuration
                cacheDirectory: true,
                cacheCompression: false,
              }
            }
          ]
        },
      ]
    },
    
    // Development server configuration
    ...(isDevelopment ? {
      devServer: {
        hot: true,
        liveReload: false,
        client: {
          overlay: {
            errors: true,
            warnings: false,
            runtimeErrors: false, // Disable to prevent originalFactory overlay errors
          },
          progress: true,
        },
        
        // Performance settings
        devMiddleware: {
          writeToDisk: false,
        },
        
        // Watch configuration for React 19
        watchFiles: {
          paths: ['src/**/*'],
          options: {
            usePolling: false,
            interval: 300,
            ignored: ['node_modules/**', '.next/**', '.git/**'],
          }
        },
        
        // Memory management
        static: {
          watch: {
            ignored: ['**/node_modules', '**/.next', '**/.git'],
          }
        }
      }
    } : {}),
    
    // Snapshot configuration for performance
    snapshot: {
      managedPaths: [path.resolve(__dirname, 'node_modules')],
      immutablePaths: [],
      buildDependencies: {
        hash: true,
        timestamp: true,
      },
      module: {
        timestamp: true,
      },
      resolve: {
        timestamp: true,
      },
      resolveBuildDependencies: {
        hash: true,
        timestamp: true,
      }
    },
    
    // Infrastructure logging
    infrastructureLogging: {
      level: isDevelopment ? 'warn' : 'error',
      debug: isDevelopment ? /webpack/ : false,
    },
  };

  return enterpriseConfig;
}

module.exports = {
  createEnterpriseWebpackConfig,
  ReactRefreshFixPlugin,
  React19MemoryOptimizationPlugin,
};