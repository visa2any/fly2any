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

// Optimized font loading with display swap for better FCP
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Fly2Any - Find & Book Flights, Hotels, and More | Your Travel Experts",
  description: "Discover the best flight deals with AI-powered search. Compare prices, track alerts, and book with confidence. Your travel experts based in USA.",
  keywords: ["fly2any", "flights", "hotels", "travel", "flight search", "cheap flights", "travel experts", "flight booking"],
  openGraph: {
    title: "Fly2Any - Smart Flight Search & Booking",
    description: "AI-powered flight search with price predictions, flexible dates, and multi-flight comparison. Find your perfect flight.",
    type: "website",
  },
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fly2Any",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      </head>
      <body className={inter.className}>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
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
