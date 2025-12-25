import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { GlobalLayout } from "@/components/layout/GlobalLayout";
import { GlobalErrorBoundary } from "@/components/error/GlobalErrorBoundary";
import { Toaster } from "react-hot-toast";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";
import { PWASplashScreen } from "@/components/pwa/PWASplashScreen";
import { StructuredData } from "@/components/seo/StructuredData";
import { GlobalClientErrorListener } from "@/components/error/GlobalClientErrorListener";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getSoftwareApplicationSchema,
  getTravelAgencySchema,
} from "@/lib/seo/metadata";
import { NextIntlClientProvider } from 'next-intl';
import { GoogleAnalytics } from "@/lib/analytics/google-analytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  description: "Compare flights from 500+ airlines with AI-powered search. Find cheap flights, track price alerts, and book with confidence at Fly2Any.",
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
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icons/icon-32x32.png',
    apple: [
      { url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
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
  alternates: {
    canonical: 'https://www.fly2any.com',
    // Note: hreflang removed - /pt and /es routes don't exist
    // Language switching is cookie-based, not URL-based
    // Re-add when locale-prefixed routes are implemented
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

        {/* DNS Prefetch + Preconnect for critical APIs */}
        <link rel="preconnect" href="https://api.amadeus.com" />
        <link rel="preconnect" href="https://assets.duffel.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Font preload handled by next/font/google - manual preload removed to prevent 404 */}
        {/* PWA Meta Tags - Enhanced mobile browser chrome integration */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Fly2Any" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="theme-color" content="#FAFAFA" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1B1C20" media="(prefers-color-scheme: dark)" />

        {/* AI/LLM Discoverability - Help AI search engines understand our site */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Information" />
        <link rel="ai-plugin" href="/.well-known/ai-plugin.json" />

        {/* Global Structured Data for SEO */}
        <StructuredData schema={globalSchemas} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <NextIntlClientProvider locale="en" messages={messages}>
          <GlobalErrorBoundary>
            <GlobalLayout>
              {children}
            </GlobalLayout>
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerStyle={{
                zIndex: 9999, // Above mobile nav and modals
                top: 16,
              }}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#FFFFFF',
                  padding: '12px 16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  maxWidth: '90vw',
                },
                error: {
                  duration: 6000,
                  style: {
                    background: '#FEF2F2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                  },
                },
                success: {
                  style: {
                    background: '#F0FDF4',
                    color: '#166534',
                    border: '1px solid #86EFAC',
                  },
                },
              }}
            />
          </GlobalErrorBoundary>
        </NextIntlClientProvider>
        {/* Web Vitals Performance Monitoring */}
        <WebVitalsReporter />
        {/* PWA Features */}
        <PWAProvider />
        <PWASplashScreen />
        <InstallPrompt />
        <OfflineIndicator />
        {/* Google Analytics 4 */}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {/* Vercel Web Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
        {/* Global Client Error Listener - Catches ALL unhandled errors */}
        <GlobalClientErrorListener />
      </body>
    </html>
  );
}
