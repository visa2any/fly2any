import type { Metadata } from "next";
import "./globals.css";
import { GlobalLayout } from "@/components/layout/GlobalLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

export const metadata: Metadata = {
  title: "Fly2Any - Find & Book Flights, Hotels, and More | Your Travel Experts",
  description: "Discover the best flight deals with AI-powered search. Compare prices, track alerts, and book with confidence. Your travel experts based in USA.",
  keywords: ["fly2any", "flights", "hotels", "travel", "flight search", "cheap flights", "travel experts", "flight booking"],
  openGraph: {
    title: "Fly2Any - Smart Flight Search & Booking",
    description: "AI-powered flight search with price predictions, flexible dates, and multi-flight comparison. Find your perfect flight.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
