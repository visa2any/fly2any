/**
 * Schema.org Structured Data Generators
 *
 * Generates JSON-LD markup for rich snippets in search results
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const SITE_NAME = 'Fly2Any';

// Organization Schema (site-wide)
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Find the cheapest flights and hotels with AI-powered search',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/fly2any',
      'https://facebook.com/fly2any',
      'https://instagram.com/fly2any',
      'https://linkedin.com/company/fly2any',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@fly2any.com',
      availableLanguage: ['English', 'Spanish', 'Portuguese'],
    },
  };
}

// Website Schema with SearchAction
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI-powered flight and hotel search engine',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/flights/search?query={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Flight Offer Schema
export interface FlightOfferData {
  origin: { code: string; name: string; city: string };
  destination: { code: string; name: string; city: string };
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  price: number;
  currency: string;
}

export function generateFlightOfferSchema(flight: FlightOfferData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FlightReservation',
    reservationFor: {
      '@type': 'Flight',
      flightNumber: flight.flightNumber,
      provider: {
        '@type': 'Airline',
        name: flight.airline,
      },
      departureAirport: {
        '@type': 'Airport',
        name: flight.origin.name,
        iataCode: flight.origin.code,
      },
      arrivalAirport: {
        '@type': 'Airport',
        name: flight.destination.name,
        iataCode: flight.destination.code,
      },
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
    },
    totalPrice: flight.price,
    priceCurrency: flight.currency,
  };
}

// FAQ Schema
export interface FAQ {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Breadcrumb Schema
export interface Breadcrumb {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(breadcrumbs: Breadcrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

// Article/Blog Post Schema
export interface ArticleData {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  modifiedAt: string;
  image: string;
  url: string;
}

export function generateArticleSchema(article: ArticleData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt,
    image: article.image,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

// Product Schema (for deals)
export interface DealData {
  name: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  image?: string;
  validUntil?: string;
}

export function generateDealSchema(deal: DealData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.name,
    description: deal.description,
    image: deal.image || `${SITE_URL}/og-deal.png`,
    offers: {
      '@type': 'Offer',
      price: deal.price,
      priceCurrency: deal.currency,
      availability: 'https://schema.org/InStock',
      url: deal.url,
      ...(deal.validUntil && { priceValidUntil: deal.validUntil }),
    },
  };
}

// Local Business Schema (Travel Agency)
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    image: `${SITE_URL}/logo.png`,
    url: SITE_URL,
    description: 'Online travel agency specializing in finding the best flight and hotel deals',
    priceRange: '$-$$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.7128,
      longitude: -74.006,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
    },
  };
}

// Route Page Schema (Flight Search Landing Page)
export interface RoutePageData {
  origin: { code: string; city: string };
  destination: { code: string; city: string };
  lowestPrice: number;
  averagePrice: number;
  currency: string;
}

export function generateRoutePageSchema(route: RoutePageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Flights from ${route.origin.city} to ${route.destination.city}`,
    description: `Find cheap flights from ${route.origin.code} to ${route.destination.code}. Prices starting from $${route.lowestPrice}.`,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: route.lowestPrice,
      highPrice: route.averagePrice * 1.5,
      priceCurrency: route.currency,
      offerCount: 50,
    },
  };
}

// Event Schema (for World Cup, etc.)
export interface EventData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  image: string;
  url: string;
}

export function generateEventSchema(event: EventData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    image: event.image,
    url: event.url,
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

// Combine multiple schemas
export function combineSchemas(...schemas: object[]): string {
  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
}

// Generate common FAQs for route pages
export function generateRouteFAQs(
  origin: string,
  destination: string,
  price: number
): FAQ[] {
  return [
    {
      question: `How much is the cheapest flight from ${origin} to ${destination}?`,
      answer: `The cheapest flight from ${origin} to ${destination} starts at $${price}. Prices vary based on dates and booking time.`,
    },
    {
      question: `What is the best time to book flights from ${origin} to ${destination}?`,
      answer: `We recommend booking 2-3 months in advance for the best prices. Use our price alerts to get notified when prices drop.`,
    },
    {
      question: `Which airlines fly from ${origin} to ${destination}?`,
      answer: `Multiple airlines operate this route. Compare all options on Fly2Any to find the best combination of price and schedule.`,
    },
    {
      question: `How long is the flight from ${origin} to ${destination}?`,
      answer: `Flight duration varies by airline and route. Direct flights are typically the fastest option when available.`,
    },
    {
      question: `Can I find last-minute deals from ${origin} to ${destination}?`,
      answer: `Yes! Check our deals page for last-minute offers. Sign up for price alerts to never miss a deal.`,
    },
  ];
}
