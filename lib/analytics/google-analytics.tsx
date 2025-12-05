/**
 * GOOGLE ANALYTICS 4 INTEGRATION
 *
 * Easy-to-use GA4 tracking for Fly2Any
 * Tracks key SEO and conversion events
 *
 * @version 1.0.0
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

// Get GA4 Measurement ID from environment
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Event tracking types
export interface FlightSearchEvent {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: string;
}

export interface FlightViewEvent {
  origin: string;
  destination: string;
  airline: string;
  price: number;
  currency: string;
}

export interface BookingEvent {
  bookingId?: string;
  origin: string;
  destination: string;
  totalPrice: number;
  currency: string;
  passengers: number;
}

/**
 * Google Analytics Script Component
 * Add this to your root layout
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    if (!GA_ID) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Send pageview event
    gtag('config', GA_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  if (!GA_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}

/**
 * Helper function to track events
 */
export function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
}

/**
 * Track flight search
 */
export function trackFlightSearch(params: FlightSearchEvent) {
  gtag('event', 'search_flights', {
    origin: params.origin,
    destination: params.destination,
    depart_date: params.departDate,
    return_date: params.returnDate,
    passengers: params.passengers,
    cabin_class: params.cabinClass,
  });
}

/**
 * Track flight results view
 */
export function trackFlightResults(count: number, origin: string, destination: string) {
  gtag('event', 'view_search_results', {
    search_term: `${origin} to ${destination}`,
    result_count: count,
  });
}

/**
 * Track individual flight view
 */
export function trackFlightView(params: FlightViewEvent) {
  gtag('event', 'view_item', {
    currency: params.currency,
    value: params.price,
    items: [{
      item_id: `${params.origin}-${params.destination}`,
      item_name: `Flight ${params.origin} to ${params.destination}`,
      item_brand: params.airline,
      item_category: 'Flights',
      price: params.price,
    }],
  });
}

/**
 * Track flight card click
 */
export function trackFlightClick(params: FlightViewEvent) {
  gtag('event', 'select_item', {
    currency: params.currency,
    value: params.price,
    items: [{
      item_id: `${params.origin}-${params.destination}`,
      item_name: `Flight ${params.origin} to ${params.destination}`,
      item_brand: params.airline,
      price: params.price,
    }],
  });
}

/**
 * Track booking initiation
 */
export function trackBeginCheckout(params: BookingEvent) {
  gtag('event', 'begin_checkout', {
    currency: params.currency,
    value: params.totalPrice,
    items: [{
      item_id: `${params.origin}-${params.destination}`,
      item_name: `Flight ${params.origin} to ${params.destination}`,
      quantity: params.passengers,
      price: params.totalPrice,
    }],
  });
}

/**
 * Track completed booking
 */
export function trackPurchase(params: BookingEvent) {
  gtag('event', 'purchase', {
    transaction_id: params.bookingId,
    value: params.totalPrice,
    currency: params.currency,
    items: [{
      item_id: `${params.origin}-${params.destination}`,
      item_name: `Flight ${params.origin} to ${params.destination}`,
      quantity: params.passengers,
      price: params.totalPrice,
    }],
  });
}

/**
 * Track price alert creation
 */
export function trackPriceAlert(origin: string, destination: string, targetPrice: number) {
  gtag('event', 'create_price_alert', {
    origin,
    destination,
    target_price: targetPrice,
  });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup() {
  gtag('event', 'generate_lead', {
    currency: 'USD',
    value: 5, // Estimated lead value
  });
}

/**
 * Track user registration
 */
export function trackSignUp(method: string = 'email') {
  gtag('event', 'sign_up', {
    method,
  });
}

/**
 * Track user login
 */
export function trackLogin(method: string = 'email') {
  gtag('event', 'login', {
    method,
  });
}

/**
 * Track custom events
 */
export function trackCustomEvent(eventName: string, params?: Record<string, any>) {
  gtag('event', eventName, params);
}

/**
 * Set user properties (for segmentation)
 */
export function setUserProperties(properties: Record<string, any>) {
  gtag('set', 'user_properties', properties);
}

// ===================================
// WORLD CUP 2026 SPECIFIC TRACKING
// ===================================

/**
 * Track World Cup page view
 */
export function trackWorldCupPageView(pageType: 'main' | 'team' | 'stadium' | 'packages' | 'schedule', itemName?: string) {
  gtag('event', 'view_world_cup_page', {
    page_type: pageType,
    item_name: itemName,
    event_category: 'World Cup 2026',
  });
}

/**
 * Track World Cup team page view
 */
export function trackTeamView(teamName: string, teamSlug: string) {
  gtag('event', 'view_world_cup_team', {
    team_name: teamName,
    team_slug: teamSlug,
    event_category: 'World Cup 2026',
  });
}

/**
 * Track World Cup stadium page view
 */
export function trackStadiumView(stadiumName: string, city: string, capacity: number) {
  gtag('event', 'view_world_cup_stadium', {
    stadium_name: stadiumName,
    city,
    capacity,
    event_category: 'World Cup 2026',
  });
}

/**
 * Track World Cup package view
 */
export function trackPackageView(packageName: string, price: string) {
  gtag('event', 'view_world_cup_package', {
    package_name: packageName,
    price,
    event_category: 'World Cup 2026',
  });
}

/**
 * Track CTA clicks (Book Flight, Book Hotel, etc.)
 */
export function trackWorldCupCTA(ctaType: 'flight' | 'hotel' | 'package' | 'tickets', location: string, itemName?: string) {
  gtag('event', 'click_world_cup_cta', {
    cta_type: ctaType,
    location,
    item_name: itemName,
    event_category: 'World Cup 2026',
    event_label: `${ctaType} - ${location}`,
  });
}

/**
 * Track email signup for World Cup updates
 */
export function trackWorldCupEmailSignup(source: string) {
  gtag('event', 'world_cup_email_signup', {
    source,
    event_category: 'World Cup 2026',
    value: 10, // Lead value
  });
}

/**
 * Track package interest/inquiry
 */
export function trackPackageInterest(packageType: string, price: number) {
  gtag('event', 'world_cup_package_interest', {
    package_type: packageType,
    package_price: price,
    event_category: 'World Cup 2026',
    value: price * 0.1, // 10% conversion value
  });
}

/**
 * Track World Cup countdown interaction
 */
export function trackCountdownView() {
  gtag('event', 'view_world_cup_countdown', {
    event_category: 'World Cup 2026',
  });
}

/**
 * Track social sharing
 */
export function trackWorldCupShare(platform: string, pageType: string) {
  gtag('event', 'share_world_cup_content', {
    platform,
    page_type: pageType,
    event_category: 'World Cup 2026',
  });
}

/**
 * Example usage in components:
 *
 * import { trackFlightSearch, trackFlightClick } from '@/lib/analytics/google-analytics';
 *
 * function SearchForm() {
 *   const handleSearch = (formData) => {
 *     trackFlightSearch({
 *       origin: formData.origin,
 *       destination: formData.destination,
 *       departDate: formData.departDate,
 *       passengers: formData.passengers,
 *     });
 *   };
 * }
 *
 * function FlightCard({ flight }) {
 *   const handleClick = () => {
 *     trackFlightClick({
 *       origin: flight.origin,
 *       destination: flight.destination,
 *       airline: flight.airline,
 *       price: flight.price,
 *       currency: flight.currency,
 *     });
 *   };
 * }
 */
