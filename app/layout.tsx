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
import { getMessages } from 'next-intl/server';

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
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Fly2Any - Find Cheap Flights',
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
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport = {
  themeColor: "#2563eb",
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
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://assets.duffel.com" />
        <link rel="dns-prefetch" href="https://api.amadeus.com" />
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fly2Any" />
        {/* Global Structured Data for SEO */}
        <StructuredData schema={globalSchemas} />
      </head>
      <body className={inter.className}>
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
      </body>
    </html>
  );
}
