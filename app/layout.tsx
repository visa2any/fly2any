import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { GlobalLayout } from "@/components/layout/GlobalLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getSoftwareApplicationSchema,
  getTravelAgencySchema,
} from "@/lib/seo/metadata";
import { NextIntlClientProvider } from 'next-intl';
import { GoogleAnalytics } from "@/lib/analytics/google-analytics";
import { getMessages } from 'next-intl/server';
import { Suspense } from 'react';

// Optimized font loading with display swap for better FCP
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Fly2Any - Find Cheap Flights & Best Travel Deals 2025",
  description: "Search & compare flights from 500+ airlines with AI-powered search. Find the best prices on flights, hotels, and vacation packages. Track price alerts, compare routes, and book with confidence. Expert travel platform based in USA.",
  keywords: "cheap flights, flight deals, airline tickets, travel booking, flight search, airfare, best flight prices, compare flights, flight comparison, travel deals, vacation packages, international flights, domestic flights",
  openGraph: {
    title: "Fly2Any - Smart Flight Search & Booking with AI",
    description: "AI-powered flight search with price predictions, flexible dates, and multi-flight comparison. Compare 500+ airlines and find your perfect flight.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com',
    siteName: "Fly2Any",
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Fly2Any - Find Cheap Flights & Best Travel Deals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Fly2Any - Find Cheap Flights & Best Travel Deals",
    description: "AI-powered flight search. Compare 500+ airlines, track price alerts, and book with confidence.",
    creator: '@fly2any',
    site: '@fly2any',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fly2Any",
    startupImage: "/icon-512.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport = {
  themeColor: "#FAFAFA",  // Match hero gradient (neutral-50 background)
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  minimumScale: 1,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global structured data schemas for SEO
  const globalSchemas = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getSoftwareApplicationSchema(),
    getTravelAgencySchema(),
  ];

  // Load messages server-side for SSR/static generation
  // Default to English for static generation, client will switch based on cookie/preference
  const messages = await getMessages({ locale: 'en' });

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* ===== CRITICAL RESOURCE HINTS FOR CORE WEB VITALS ===== */}
        {/* Preconnect: Establish early connections to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* DNS Prefetch: Resolve DNS for third-party resources early */}
        <link rel="dns-prefetch" href="https://assets.duffel.com" />
        <link rel="dns-prefetch" href="https://api.amadeus.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Preload: Critical fonts for LCP text rendering */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* PWA Meta Tags - Enhanced mobile browser chrome integration */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Fly2Any" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="theme-color" content="#FAFAFA" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1B1C20" media="(prefers-color-scheme: dark)" />
        {/* Global Structured Data for SEO */}
        <StructuredData schema={globalSchemas} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <NextIntlClientProvider locale="en" messages={messages}>
          <ErrorBoundary
            variant="full-page"
            context="root-layout"
            showDetails={process.env.NODE_ENV === 'development'}
          >
            <GlobalLayout>
              {children}
            </GlobalLayout>
            <Toaster
              position="bottom-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'transparent',
                  padding: 0,
                  boxShadow: 'none',
                },
              }}
            />
          </ErrorBoundary>
        </NextIntlClientProvider>
        {/* Web Vitals Performance Monitoring */}
        <WebVitalsReporter />
        {/* PWA Features */}
        <PWAProvider />
        <InstallPrompt />
        <OfflineIndicator />
        {/* Google Analytics 4 */}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
