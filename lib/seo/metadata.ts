/**
 * ADVANCED SEO METADATA UTILITIES - 2025 EDITION
 *
 * Enterprise-grade SEO optimization with:
 * - AI Search Engine Optimization (ChatGPT, Perplexity, Claude)
 * - Comprehensive Schema.org markup
 * - Multi-language support (hreflang)
 * - Rich snippets optimization
 * - Core Web Vitals integration
 * - Voice search optimization
 *
 * @version 2.0.0
 * @last-updated 2025-01-19
 */

import { Metadata } from 'next';

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  nofollow?: boolean;
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
  authors?: Array<{ name: string; url?: string }>;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

// Core site configuration
const SITE_NAME = 'Fly2Any';
// Ensure SITE_URL is always valid - handle empty strings from env vars
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim()) || 'https://www.fly2any.com';
const SITE_DESCRIPTION = 'Find the best flight deals with AI-powered search. Compare prices from 500+ airlines, track price alerts, and book with confidence. Your expert travel platform based in USA.';
const SITE_LOCALE = 'en_US';
const TWITTER_HANDLE = '@fly2any';
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

// Supported languages for hreflang
export const SUPPORTED_LANGUAGES = {
  en: 'en-US',
  pt: 'pt-BR',
  es: 'es-ES',
};

/**
 * Safely create a URL object with fallback
 */
function safeURL(url: string, fallback: string = 'https://www.fly2any.com'): URL {
  try {
    return new URL(url);
  } catch (error) {
    console.warn(`Invalid URL "${url}", using fallback: ${fallback}`);
    return new URL(fallback);
  }
}

/**
 * Generate comprehensive metadata for a page with 2025 best practices
 * Optimized for Google, Bing, ChatGPT, Perplexity, Claude, and other AI search engines
 */
export function generateMetadata(page: PageMetadata): Metadata {
  const title = page.title ? `${page.title} | ${SITE_NAME}` : SITE_NAME;
  const description = page.description || SITE_DESCRIPTION;
  const canonical = page.canonical || SITE_URL;
  const ogImage = page.ogImage || `${SITE_URL}/og-image.jpg`;

  // Build robots directive
  let robotsDirective = 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';
  if (page.noindex) {
    robotsDirective = 'noindex';
    if (page.nofollow) robotsDirective += ',nofollow';
  }

  // Build alternates object
  const alternates: any = {
    canonical,
  };

  // Add language alternates for major pages
  if (!page.noindex) {
    alternates.languages = {
      'en-US': canonical,
      'pt-BR': canonical.replace(SITE_URL, `${SITE_URL}/pt`),
      'es-ES': canonical.replace(SITE_URL, `${SITE_URL}/es`),
      'x-default': canonical, // Default language
    };
  }

  const metadata: Metadata = {
    title,
    description,
    keywords: page.keywords?.join(', '),
    robots: robotsDirective,
    alternates,
    authors: page.authors || [{ name: 'Fly2Any Team' }],
    creator: 'Fly2Any',
    publisher: 'Fly2Any',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: safeURL(SITE_URL),
    openGraph: {
      type: page.ogType || 'website',
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        },
      ],
      ...(page.publishedTime && { publishedTime: page.publishedTime }),
      ...(page.modifiedTime && { modifiedTime: page.modifiedTime }),
      ...(page.section && { section: page.section }),
      ...(page.tags && { tags: page.tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
    ...(FACEBOOK_APP_ID && {
      other: {
        'fb:app_id': FACEBOOK_APP_ID,
      },
    }),
  };

  return metadata;
}

/**
 * Homepage metadata - Optimized for maximum SEO impact
 */
export const homeMetadata: Metadata = generateMetadata({
  title: 'Find Cheap Flights & Best Travel Deals 2025',
  description: 'Search & compare flights from 500+ airlines with AI-powered search. Find the best prices on flights, hotels, and vacation packages. Track price alerts, compare routes, and book with confidence. Expert travel platform based in USA.',
  keywords: [
    'cheap flights',
    'flight deals',
    'airline tickets',
    'travel booking',
    'flight search',
    'airfare',
    'best flight prices',
    'compare flights',
    'flight comparison',
    'travel deals',
    'vacation packages',
    'international flights',
    'domestic flights',
    'last minute flights',
    'flight price alerts',
    'alternative airports',
    'budget travel',
  ],
  canonical: SITE_URL,
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

// ===================================
// ADVANCED SCHEMA TYPES (2025 Edition)
// ===================================

/**
 * WebSite schema with Sitelinks Search Box (enables Google search box in SERP)
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/flights/results?origin={origin}&destination={destination}`,
      },
      'query-input': 'required name=origin,required name=destination',
    },
    inLanguage: ['en-US', 'pt-BR', 'es-ES'],
  };
}

/**
 * SoftwareApplication schema (for Fly2Any platform)
 * Optimized for AI search engines
 */
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI-powered flight search and booking platform',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '15420',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    featureList: [
      'Flight search and comparison',
      'Price alerts and tracking',
      'Multi-city booking',
      'Alternative airport suggestions',
      'Flexible date search',
      'Real-time pricing',
    ],
  };
}

/**
 * TravelAgency schema for local SEO
 */
export function getTravelAgencySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: `${SITE_URL}/fly2any-logo.png`,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: '+1-800-FLY-2ANY',
    email: 'support@fly2any.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressLocality: 'United States',
    },
    priceRange: '$$',
    sameAs: [
      'https://twitter.com/fly2any',
      'https://facebook.com/fly2any',
      'https://instagram.com/fly2any',
      'https://linkedin.com/company/fly2any',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '15420',
    },
  };
}

/**
 * Article schema for blog posts
 */
export function getArticleSchema(params: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  keywords?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url: params.url,
    image: params.image || `${SITE_URL}/og-image.jpg`,
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    author: {
      '@type': 'Person',
      name: params.authorName || 'Fly2Any Team',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/fly2any-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': params.url,
    },
    keywords: params.keywords?.join(', '),
    inLanguage: 'en-US',
  };
}

/**
 * Product schema for flight deals (for shopping results)
 */
export function getProductSchema(params: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  sku?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description,
    image: params.image || `${SITE_URL}/og-image.jpg`,
    brand: {
      '@type': 'Brand',
      name: params.brand || SITE_NAME,
    },
    sku: params.sku,
    offers: {
      '@type': 'Offer',
      price: params.price.toFixed(2),
      priceCurrency: params.currency,
      availability: `https://schema.org/${params.availability}`,
      url: SITE_URL,
      priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };
}

/**
 * HowTo schema for tutorials and guides
 */
export function getHowToSchema(params: {
  name: string;
  description: string;
  totalTime?: string;
  steps: Array<{ name: string; text: string; image?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    totalTime: params.totalTime || 'PT10M',
    step: params.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}

/**
 * VideoObject schema for video content
 */
export function getVideoSchema(params: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: params.name,
    description: params.description,
    thumbnailUrl: params.thumbnailUrl,
    uploadDate: params.uploadDate,
    duration: params.duration || 'PT5M',
    contentUrl: params.contentUrl,
    embedUrl: params.embedUrl,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/fly2any-logo.png`,
      },
    },
  };
}

/**
 * Review schema for airline/hotel reviews
 */
export function getReviewSchema(params: {
  itemName: string;
  rating: number;
  reviewBody: string;
  authorName: string;
  datePublished: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Thing',
      name: params.itemName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: params.rating,
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: params.reviewBody,
    author: {
      '@type': 'Person',
      name: params.authorName,
    },
    datePublished: params.datePublished,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}

/**
 * Event schema for travel events
 */
export function getEventSchema(params: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  url: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: params.name,
    description: params.description,
    startDate: params.startDate,
    endDate: params.endDate || params.startDate,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: params.location,
    },
    url: params.url,
    image: params.image || `${SITE_URL}/og-image.jpg`,
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Speakable schema for voice search optimization
 */
export function getSpeakableSchema(cssSelectors: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  };
}

// ===================================
// WORLD CUP 2026 SPECIFIC SCHEMAS
// ===================================

/**
 * Enhanced Event schema for FIFA World Cup 2026
 */
export function getWorldCupEventSchema(params: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  url: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: params.name,
    description: params.description,
    startDate: params.startDate,
    endDate: params.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: params.location ? {
      '@type': 'Place',
      name: params.location,
    } : undefined,
    url: params.url,
    image: params.image || `${SITE_URL}/world-cup-2026-og.jpg`,
    organizer: {
      '@type': 'SportsOrganization',
      name: 'FIFA',
      url: 'https://www.fifa.com',
    },
    sport: 'Soccer',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '2499',
      highPrice: '24999',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/world-cup-2026/packages`,
      offerCount: 4,
    },
  };
}

/**
 * SportsTeam schema for World Cup teams
 */
export function getSportsTeamSchema(params: {
  name: string;
  country: string;
  slug: string;
  confederation: string;
  worldCupWins: number;
  fifaRanking?: number;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: params.name,
    sport: 'Soccer',
    memberOf: {
      '@type': 'SportsOrganization',
      name: params.confederation,
    },
    url: `${SITE_URL}/world-cup-2026/teams/${params.slug}`,
    description: params.description,
    location: {
      '@type': 'Country',
      name: params.country,
    },
    award: params.worldCupWins > 0 ? `FIFA World Cup Champions (${params.worldCupWins}x)` : undefined,
  };
}

/**
 * Stadium/Place schema for World Cup venues
 */
export function getStadiumSchema(params: {
  name: string;
  city: string;
  state?: string;
  country: string;
  capacity: number;
  airportCode: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'StadiumOrArena',
    name: params.name,
    description: params.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: params.city,
      addressRegion: params.state,
      addressCountry: params.country,
    },
    geo: params.latitude && params.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: params.latitude,
      longitude: params.longitude,
    } : undefined,
    maximumAttendeeCapacity: params.capacity,
    url: `${SITE_URL}/world-cup-2026/stadiums/${params.slug}`,
    event: {
      '@type': 'SportsEvent',
      name: 'FIFA World Cup 2026',
      startDate: '2026-06-11',
      endDate: '2026-07-19',
    },
  };
}

/**
 * TravelAction schema for World Cup packages
 */
export function getTravelPackageSchema(params: {
  name: string;
  description: string;
  price: number;
  currency: string;
  packageType: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description,
    category: 'Travel Package',
    offers: {
      '@type': 'Offer',
      price: params.price,
      priceCurrency: params.currency,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/world-cup-2026/packages`,
      priceValidUntil: '2026-06-10',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1247',
      bestRating: '5',
      worstRating: '1',
    },
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
  };
}

// ===================================
// METADATA GENERATORS FOR SPECIFIC PAGES
// ===================================

/**
 * Generate metadata for destination pages
 */
export function destinationMetadata(destination: string, country?: string): Metadata {
  const destinationFull = country ? `${destination}, ${country}` : destination;
  return generateMetadata({
    title: `Cheap Flights to ${destinationFull} 2025 - Best Deals & Prices`,
    description: `Find the best flight deals to ${destinationFull}. Compare prices from 500+ airlines, track price alerts, and book with confidence. Save up to 40% on flights to ${destination}.`,
    keywords: [
      `flights to ${destination}`,
      `cheap flights ${destination}`,
      `${destination} airfare`,
      `best time to visit ${destination}`,
      `${destination} travel deals`,
      `how to get to ${destination}`,
    ],
    canonical: `${SITE_URL}/flights/${destination.toLowerCase().replace(/\s+/g, '-')}`,
    ogType: 'website',
  });
}

/**
 * Generate metadata for airline pages
 */
export function airlineMetadata(airlineName: string, airlineCode: string): Metadata {
  return generateMetadata({
    title: `${airlineName} Flights - Compare ${airlineCode} Prices & Book Deals`,
    description: `Find the best ${airlineName} (${airlineCode}) flight deals. Compare prices, baggage fees, and seat selection. Read reviews and book ${airlineName} flights with confidence.`,
    keywords: [
      `${airlineName} flights`,
      `${airlineCode} deals`,
      `${airlineName} baggage fees`,
      `${airlineName} reviews`,
      `book ${airlineName}`,
    ],
    canonical: `${SITE_URL}/airlines/${airlineCode.toLowerCase()}`,
    ogType: 'website',
  });
}

/**
 * Generate metadata for blog/content pages
 */
export function blogMetadata(params: {
  title: string;
  description: string;
  slug: string;
  publishedDate: string;
  modifiedDate?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
}): Metadata {
  return generateMetadata({
    title: params.title,
    description: params.description,
    canonical: `${SITE_URL}/blog/${params.slug}`,
    ogType: 'article',
    publishedTime: params.publishedDate,
    modifiedTime: params.modifiedDate,
    authors: params.authorName ? [{ name: params.authorName }] : undefined,
    section: params.category,
    tags: params.tags,
  });
}

// ===================================
// WORLD CUP 2026 METADATA GENERATORS
// ===================================

/**
 * Main World Cup 2026 page metadata
 */
export function worldCupMainMetadata(): Metadata {
  return generateMetadata({
    title: 'FIFA World Cup 2026 | Complete Travel Guide, Tickets, Flights & Hotels',
    description: 'Your ultimate guide to FIFA World Cup 2026 in USA, Canada & Mexico. Book complete travel packages with flights, hotels, tickets, and match schedules. Find the best deals for the biggest sporting event.',
    keywords: [
      'FIFA World Cup 2026',
      'world cup 2026 tickets',
      'world cup 2026 travel packages',
      'world cup 2026 hotels',
      'world cup 2026 flights',
      'USA Canada Mexico 2026',
      'world cup travel deals',
      'world cup packages',
      'world cup 2026 schedule',
      'fifa 2026 booking',
    ],
    canonical: `${SITE_URL}/world-cup-2026`,
    ogType: 'website',
    ogImage: `${SITE_URL}/world-cup-2026-og.jpg`,
  });
}

/**
 * World Cup team page metadata
 */
export function worldCupTeamMetadata(teamName: string, slug: string, bestFinish: string): Metadata {
  return generateMetadata({
    title: `${teamName} at FIFA World Cup 2026 | Fixtures, Squad, Travel & Tickets`,
    description: `Complete guide to ${teamName} at FIFA World Cup 2026. View fixtures, squad info, book tickets, flights, and hotels. ${bestFinish}. Plan your trip to support ${teamName}.`,
    keywords: [
      `${teamName} world cup 2026`,
      `${teamName} fixtures 2026`,
      `${teamName} world cup tickets`,
      `${teamName} travel packages`,
      `${teamName} world cup schedule`,
      `watch ${teamName} world cup`,
    ],
    canonical: `${SITE_URL}/world-cup-2026/teams/${slug}`,
    ogType: 'website',
  });
}

/**
 * World Cup stadium page metadata
 */
export function worldCupStadiumMetadata(
  stadiumName: string,
  city: string,
  slug: string,
  capacity: number
): Metadata {
  return generateMetadata({
    title: `${stadiumName} - World Cup 2026 Venue in ${city} | Travel Guide & Hotels`,
    description: `Complete travel guide to ${stadiumName} for FIFA World Cup 2026. Capacity: ${capacity.toLocaleString()}. Find nearby hotels, flights to ${city}, match schedule, and travel tips.`,
    keywords: [
      `${stadiumName}`,
      `${city} world cup 2026`,
      `${stadiumName} world cup`,
      `hotels near ${stadiumName}`,
      `flights to ${city}`,
      `${city} world cup matches`,
      `${stadiumName} tickets`,
    ],
    canonical: `${SITE_URL}/world-cup-2026/stadiums/${slug}`,
    ogType: 'website',
  });
}

/**
 * World Cup packages page metadata
 */
export function worldCupPackagesMetadata(): Metadata {
  return generateMetadata({
    title: 'World Cup 2026 Travel Packages | All-Inclusive Deals from $2,499',
    description: 'Book all-inclusive FIFA World Cup 2026 travel packages. Complete bundles with flights, luxury hotels, match tickets, and VIP experiences. Bronze to Platinum packages available.',
    keywords: [
      'world cup 2026 packages',
      'world cup travel deals',
      'world cup all inclusive',
      'world cup 2026 vacation packages',
      'fifa 2026 travel packages',
      'world cup VIP packages',
    ],
    canonical: `${SITE_URL}/world-cup-2026/packages`,
    ogType: 'website',
  });
}

/**
 * World Cup schedule page metadata
 */
export function worldCupScheduleMetadata(): Metadata {
  return generateMetadata({
    title: 'FIFA World Cup 2026 Schedule | Complete Match Fixtures & Dates',
    description: 'Complete FIFA World Cup 2026 match schedule. View all fixtures from June 11 - July 19, 2026. 104 matches across 16 stadiums in USA, Canada & Mexico. Plan your trip around key matches.',
    keywords: [
      'world cup 2026 schedule',
      'world cup 2026 fixtures',
      'world cup 2026 match dates',
      'fifa 2026 calendar',
      'world cup 2026 timetable',
      'when is world cup 2026',
    ],
    canonical: `${SITE_URL}/world-cup-2026/schedule`,
    ogType: 'website',
  });
}
