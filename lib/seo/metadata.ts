/**
 * SEO Metadata Utilities
 *
 * Dynamic metadata generation for optimal SEO performance.
 * Includes Open Graph, Twitter Cards, and structured data (JSON-LD).
 */

import { Metadata } from 'next';

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
}

const SITE_NAME = 'Fly2Any';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const SITE_DESCRIPTION = 'Find the best flight deals with intelligent search. Compare prices from multiple airlines, get real-time pricing, and book your perfect trip.';

/**
 * Generate comprehensive metadata for a page
 */
export function generateMetadata(page: PageMetadata): Metadata {
  const title = page.title ? `${page.title} | ${SITE_NAME}` : SITE_NAME;
  const description = page.description || SITE_DESCRIPTION;
  const canonical = page.canonical || SITE_URL;
  const ogImage = page.ogImage || `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    keywords: page.keywords,
    robots: page.noindex ? 'noindex,nofollow' : 'index,follow',
    alternates: page.alternates,
    openGraph: {
      type: (page.ogType === 'article' ? 'article' : 'website') as 'website' | 'article',
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@fly2any',
    },
  };
}

/**
 * Homepage metadata
 */
export const homeMetadata: Metadata = generateMetadata({
  title: 'Find Cheap Flights & Best Travel Deals',
  description: 'Search and compare flights from multiple airlines. Get the best prices on airfare with intelligent search, flexible dates, and real-time pricing.',
  keywords: ['cheap flights', 'flight deals', 'airline tickets', 'travel booking', 'flight search', 'airfare'],
  ogType: 'website',
});

/**
 * Flight search results metadata
 */
export function flightSearchMetadata(origin: string, destination: string, date: string): Metadata {
  return generateMetadata({
    title: `Flights from ${origin} to ${destination} on ${date}`,
    description: `Find the best flight deals from ${origin} to ${destination}. Compare prices, airlines, and flight times to book your perfect trip.`,
    keywords: [`${origin} to ${destination} flights`, 'flight deals', 'cheap flights', 'airline tickets'],
    ogType: 'website',
  });
}

/**
 * Hotel search results metadata
 */
export function hotelSearchMetadata(city: string, checkIn: string): Metadata {
  return generateMetadata({
    title: `Hotels in ${city} - Best Rates from ${checkIn}`,
    description: `Find the perfect hotel in ${city}. Compare prices from over 1.5 million properties worldwide and book with confidence.`,
    keywords: [`${city} hotels`, 'hotel deals', 'accommodation', 'hotel booking'],
    ogType: 'website',
  });
}

/**
 * Booking confirmation metadata
 */
export const bookingConfirmationMetadata: Metadata = generateMetadata({
  title: 'Booking Confirmation',
  description: 'Your booking has been confirmed. Check your email for details.',
  noindex: true, // Don't index confirmation pages
});

/**
 * Error page metadata
 */
export const errorMetadata: Metadata = generateMetadata({
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
  noindex: true,
});

/**
 * Generate JSON-LD structured data for Organization
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    sameAs: [
      'https://twitter.com/fly2any',
      'https://facebook.com/fly2any',
      'https://instagram.com/fly2any',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@fly2any.com',
    },
  };
}

/**
 * Generate JSON-LD structured data for Flight
 */
export function getFlightSchema(params: {
  origin: string;
  destination: string;
  departureDate: string;
  price: number;
  currency: string;
  airline: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Flight',
    flightNumber: 'Multiple options available',
    provider: {
      '@type': 'Airline',
      name: params.airline,
    },
    departureAirport: {
      '@type': 'Airport',
      iataCode: params.origin,
    },
    arrivalAirport: {
      '@type': 'Airport',
      iataCode: params.destination,
    },
    departureTime: params.departureDate,
    offers: {
      '@type': 'Offer',
      price: params.price,
      priceCurrency: params.currency,
      availability: 'https://schema.org/InStock',
    },
  };
}

/**
 * Generate JSON-LD structured data for Hotel
 */
export function getHotelSchema(params: {
  name: string;
  address: string;
  city: string;
  country: string;
  rating?: number;
  price: number;
  currency: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: params.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address,
      addressLocality: params.city,
      addressCountry: params.country,
    },
    starRating: params.rating ? {
      '@type': 'Rating',
      ratingValue: params.rating,
      bestRating: 5,
    } : undefined,
    priceRange: `${params.currency} ${params.price}+`,
    image: params.image,
  };
}

/**
 * Generate JSON-LD structured data for Breadcrumb List
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD structured data for FAQ
 */
export function getFAQSchema(questions: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/**
 * Generate structured data script content
 * Usage: Add to your page/layout as a script tag with type="application/ld+json"
 */
export function generateStructuredDataScript(data: Record<string, any>): string {
  return JSON.stringify(data, null, 2);
}
