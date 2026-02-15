import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import { createRequire } from 'module';

// Create require function for CommonJS modules in ESM context
const require = createRequire(import.meta.url);

// Create next-intl plugin
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip type checking during build to prevent memory issues
  // Types are checked separately via `npm run lint` and in CI
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // SEO Rewrites - Clean .xml URLs for sitemaps
  async rewrites() {
    return [
      { source: '/sitemaps/routes.xml', destination: '/sitemaps/routes' },
      { source: '/sitemaps/cities.xml', destination: '/sitemaps/cities' },
      { source: '/sitemaps/destinations.xml', destination: '/sitemaps/destinations' },
      { source: '/sitemaps/blog.xml', destination: '/sitemaps/blog' },
    ];
  },

  // SEO Redirects - Legacy URLs to current routes (301 permanent)
  async redirects() {
    return [
      // === LEGACY HOME/MISC ===
      { source: '/home-new', destination: '/', permanent: true },
      { source: '/sitemap', destination: '/sitemap.xml', permanent: true },

      // === PORTUGUESE ROUTES → ENGLISH ===
      { source: '/cotacao', destination: '/', permanent: true },
      { source: '/cotacao/voos', destination: '/journey/flights', permanent: true },
      { source: '/cotacao/hoteis', destination: '/hotels', permanent: true },
      { source: '/cotacao/carros', destination: '/cars', permanent: true },
      { source: '/cotacao/passeios', destination: '/tours', permanent: true },
      { source: '/hoteis', destination: '/hotels', permanent: true },
      { source: '/hoteis-brasil', destination: '/hotels', permanent: true },
      { source: '/passagens-aereas', destination: '/journey/flights', permanent: true },
      { source: '/aluguel-carros', destination: '/cars', permanent: true },
      { source: '/aluguel-carros-brasil', destination: '/cars', permanent: true },
      { source: '/seguro-viagem', destination: '/', permanent: true },
      { source: '/seguro-viagem-brasil', destination: '/', permanent: true },
      { source: '/passeios-tours', destination: '/tours', permanent: true },
      { source: '/sobre', destination: '/', permanent: true },
      { source: '/sobre-nos', destination: '/', permanent: true },
      { source: '/contato', destination: '/', permanent: true },
      { source: '/como-funciona', destination: '/', permanent: true },
      { source: '/termos-uso', destination: '/', permanent: true },
      { source: '/seguranca', destination: '/', permanent: true },
      // REMOVED: /cookies page now exists

      // === PORTUGUESE FLIGHT ROUTES ===
      { source: '/voos-miami-sao-paulo', destination: '/journey/flights?origin=MIA&destination=GRU', permanent: true },
      { source: '/voos-new-york-rio-janeiro', destination: '/journey/flights?origin=JFK&destination=GIG', permanent: true },
      { source: '/voos-brasil-eua', destination: '/journey/flights', permanent: true },

      // === ENGLISH STATIC PAGES ===
      // REMOVED: /about page now exists
      // REMOVED: /contact page now exists
      { source: '/support', destination: '/help', permanent: true },
      // REMOVED: /help page now exists
      // NOTE: /faq page exists - do NOT redirect
      { source: '/careers', destination: '/', permanent: false }, // Hidden for now
      { source: '/baggage-fees', destination: '/', permanent: false }, // Hidden for now
      // REMOVED: /press page now exists
      { source: '/accessibility', destination: '/', permanent: true },
      // NOTE: /terms and /privacy pages exist - redirect aliases only
      { source: '/terms-of-service', destination: '/terms', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/cookie-policy', destination: '/cookies', permanent: true },
      { source: '/security', destination: '/', permanent: true },
      { source: '/how-it-works', destination: '/', permanent: true },

      // === ENGLISH FEATURE PAGES ===
      // NOTE: /packages, /deals, /travel-insurance pages exist - do NOT redirect
      { source: '/manage-booking', destination: '/account/bookings', permanent: true },
      { source: '/flight-status', destination: '/', permanent: true },
      { source: '/price-alerts', destination: '/account/alerts', permanent: true },
      { source: '/group-bookings', destination: '/', permanent: true },
      { source: '/ai-assistant', destination: '/', permanent: true },
      { source: '/chat', destination: '/', permanent: true },
      // NOTE: /refer and /affiliate have dedicated landing pages - do NOT redirect

      // === AUTH PAGES ===
      { source: '/login', destination: '/auth/login', permanent: true },
      { source: '/forgot-password', destination: '/auth/login', permanent: true },

      // === LEGACY FLIGHT ROUTES (specific patterns only - do NOT catch /flights/[route]) ===
      { source: '/miami-sao-paulo-flights', destination: '/journey/flights?origin=MIA&destination=GRU', permanent: true },
      { source: '/new-york-rio-flights', destination: '/journey/flights?origin=JFK&destination=GIG', permanent: true },
      // REMOVED: '/flights/:path*' - was breaking programmatic SEO route pages at /flights/[route]
      { source: '/usa/flights-from-miami', destination: '/journey/flights?origin=MIA', permanent: true },

      // === DESTINATION PAGES ===
      // NOTE: /destinations/[city] pages are now live with ISR - do NOT redirect
      // Only redirect legacy URLs that don't match our slug format

      // === MULTILINGUAL CITY PAGES ===
      { source: '/en/city/:slug', destination: '/', permanent: true },
      { source: '/en/cidade/:slug', destination: '/', permanent: true },
      { source: '/es/ciudad/:slug', destination: '/', permanent: true },
      { source: '/es/cidade/:slug', destination: '/', permanent: true },
      { source: '/pt/cidade/:slug', destination: '/', permanent: true },

      // === SPANISH PAGES ===
      { source: '/es/nosotros', destination: '/', permanent: true },
      { source: '/es/contacto', destination: '/', permanent: true },

      // === ENGLISH INFO PAGES ===
      { source: '/en/contact', destination: '/', permanent: true },
      { source: '/en/brazil-travel-guide', destination: '/', permanent: true },

      // === BLOG REDIRECTS (only legacy Portuguese posts) ===
      { source: '/blog/como-economizar-passagens-aereas', destination: '/', permanent: true },
      { source: '/blog/melhores-voos-brasil-eua', destination: '/', permanent: true },
      { source: '/blog/documentos-viagem-brasil-eua', destination: '/', permanent: true },
      // NOTE: /blog and /blog/:slug are now live pages - do NOT redirect

      // === GARBAGE URLs (invalid characters) ===
      { source: '/%24', destination: '/', permanent: true }, // /$
      { source: '/%26', destination: '/', permanent: true }, // /&

      // === OLD LOCALE-PREFIXED ROUTES (CATCH-ALL) ===
      // These must come LAST - they catch any remaining locale-prefixed URLs
      // that weren't caught by specific patterns above
      // Root locale paths (no subpath)
      { source: '/en', destination: '/', permanent: true },
      { source: '/pt', destination: '/', permanent: true },
      { source: '/es', destination: '/', permanent: true },
      // Catch-all patterns (redirect to equivalent path without locale)
      { source: '/en/:path*', destination: '/:path*', permanent: true },
      { source: '/es/:path*', destination: '/:path*', permanent: true },
      { source: '/pt/:path*', destination: '/:path*', permanent: true },
    ];
  },

  // Production Security & Performance Headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          // ===== SECURITY HEADERS =====
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://embed.tawk.to https://*.tawk.to https://www.googletagmanager.com https://vercel.live https://accounts.google.com https://*.google.com blob:",
              "worker-src 'self' blob:",
              "connect-src 'self' https://embed.tawk.to https://*.tawk.to wss://*.tawk.to https://www.google-analytics.com https://www.googletagmanager.com https://vercel.live https://nominatim.openstreetmap.org https://accounts.google.com https://play.google.com https://*.google.com https://*.googleapis.com https://viacep.com.br https://api.zippopotam.us https://*.cartocdn.com https://*.fastly.net",
              "frame-src 'self' https://embed.tawk.to https://*.tawk.to https://vercel.live https://accounts.google.com https://*.google.com",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline' https://embed.tawk.to https://*.tawk.to https://accounts.google.com https://*.google.com",
              "media-src 'self' https://embed.tawk.to https://*.tawk.to",
              "font-src 'self' data: https://embed.tawk.to https://*.tawk.to https://fonts.gstatic.com",
            ].join('; '),
          },
        ],
      },
      // ===== STATIC ASSETS - AGGRESSIVE CACHING =====
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ===== JAVASCRIPT & CSS - LONG CACHE =====
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ===== API ROUTES - NO CACHE FOR FRESH DATA =====
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      // ===== HTML PAGES - SHORT CACHE WITH REVALIDATION =====
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Mobile build: static export for Capacitor
  ...(process.env.MOBILE_BUILD === 'true' && {
    output: 'export',
    images: { unoptimized: true },
    trailingSlash: true,
  }),

  // Production optimizations (Phase 8 - Quick Win 1A)
  compiler: {
    // Remove console.log statements in production (keeps error/warn for monitoring)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Experimental optimizations for Core Web Vitals
  experimental: {
    optimizePackageImports: [
      'lucide-react',      // Tree-shake icons (reduces bundle by ~50KB)
      '@/components',      // Component tree-shaking
      'date-fns',          // Date utility tree-shaking
      'lodash',            // Utility tree-shaking
    ],
    optimizeCss: true,     // CSS optimization for reduced CLS
    instrumentationHook: true, // Enable instrumentation.ts for error handlers
  },

  // Enable Partial Pre-Rendering for faster initial load (when available)
  // ppr: 'incremental',

  // Webpack configuration (Phase 8 - Quick Win 1D + Performance Optimization)
  webpack: (config, { dev, isServer }) => {
    // Mobile build: Ignore API routes (they're server-side only)
    // Mobile apps call the production web API instead
    if (process.env.MOBILE_BUILD === 'true' && !dev) {
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/app\/api\//,
          contextRegExp: /\//,
        })
      );
    }

    // Add bundle analyzer ONLY in production builds (disabled in dev for performance)
    if (!dev && !isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../analyze/client.html',
          generateStatsFile: true,
          statsFilename: '../analyze/client-stats.json',
        })
      );
    }

    // Suppress warnings from Prisma instrumentation and OpenTelemetry
    config.ignoreWarnings = [
      { module: /node_modules\/@prisma\/instrumentation/ },
      { module: /node_modules\/@opentelemetry\/instrumentation/ },
      { module: /node_modules\/require-in-the-middle/ },
    ];

    return config;
  },

  images: {
    unoptimized: false, // Keep optimization enabled
    remotePatterns: [
      // Tour images - Holibob (Amadeus Tours & Activities)
      {
        protocol: 'https',
        hostname: 'images.holibob.tech',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.holibob.tech',
      },
      // Tour images - TourRadar
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
      // User avatars
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      // Stock images - Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      // Duffel API images (flights, airlines, airports)
      {
        protocol: 'https',
        hostname: 'assets.duffel.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'duffel.com',
        pathname: '/**',
      },
      // Amadeus API images (hotels, destinations)
      {
        protocol: 'https',
        hostname: '**.amadeus.com',
      },
      // Hotel images (common CDNs)
      {
        protocol: 'https',
        hostname: 'static.cupid.travel',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'snaphotelapi.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pix*.agoda.net',
      },
      {
        protocol: 'https',
        hostname: 'images.trvl-media.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.booking.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'r-xx.bstatic.com',
        pathname: '/**',
      },
      // Wikimedia for company logos
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      // Car rental images
      {
        protocol: 'https',
        hostname: 'images.hertz.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.enterprise.com',
        pathname: '/content/**',
      },
      // Placeholder service for car categories
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      // Generic CDNs
      {
        protocol: 'https',
        hostname: 'cdn.*.com',
      },
      {
        protocol: 'https',
        hostname: 'images.*.com',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern formats (PNG works as source)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Support up to 4K
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images for 30 days
    dangerouslyAllowSVG: true, // Allow SVG for icons and logos
    contentDispositionType: 'attachment', // Security for user-uploaded images
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // CSP for images
  },
};

/**
 * Sentry Configuration Options
 * See: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  hideSourceMaps: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  reactComponentAnnotation: {
    enabled: true,
    ignoreComponents: [
      '**/quote-workspace/**',
      '**/discovery/**',
    ],
  },
  automaticVercelMonitors: false,
};

// Apply next-intl plugin first, then optionally Sentry
const shouldUseSentry = process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production';

export default shouldUseSentry
  ? withSentryConfig(withNextIntl(nextConfig), sentryWebpackPluginOptions)
  : withNextIntl(nextConfig);
