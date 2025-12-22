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
      item: {
        '@type': 'WebPage',
        '@id': crumb.url,
        name: crumb.name,
      },
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

// Review Schema (for social proof)
export interface ReviewData {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}

export function generateReviewSchema(reviews: ReviewData[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Fly2Any Flight Search',
    description: 'AI-powered flight and hotel search platform',
    brand: { '@type': 'Brand', name: SITE_NAME },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      reviewCount: reviews.length.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.reviewBody,
      datePublished: r.datePublished,
    })),
  };
}

// HowTo Schema (for booking guides)
export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export function generateHowToSchema(title: string, description: string, steps: HowToStep[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description,
    totalTime: 'PT5M',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.image && { image: s.image }),
    })),
  };
}

// Video Schema
export interface VideoData {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl: string;
}

export function generateVideoSchema(video: VideoData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
  };
}

// Combine multiple schemas
export function combineSchemas(...schemas: object[]): string {
  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
}

// ============================================
// GEO-OPTIMIZED TRAVEL SCHEMAS (2025)
// ============================================

// TouristTrip Schema - For tours and activities
export interface TouristTripData {
  name: string;
  description: string;
  provider?: string;
  duration: string;
  price: number;
  currency: string;
  location: { name: string; lat?: number; lng?: number };
  images: string[];
  rating?: number;
  reviewCount?: number;
  includes?: string[];
}

export function generateTouristTripSchema(trip: TouristTripData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: trip.name,
    description: trip.description,
    provider: {
      '@type': 'TravelAgency',
      name: trip.provider || SITE_NAME,
      url: SITE_URL,
    },
    touristType: 'Leisure',
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: 1,
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'TouristAttraction',
          name: trip.location.name,
          ...(trip.location.lat && {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: trip.location.lat,
              longitude: trip.location.lng,
            },
          }),
        },
      }],
    },
    offers: {
      '@type': 'Offer',
      price: trip.price,
      priceCurrency: trip.currency,
      availability: 'https://schema.org/InStock',
    },
    ...(trip.images.length > 0 && { image: trip.images }),
    ...(trip.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: trip.rating,
        reviewCount: trip.reviewCount || 50,
        bestRating: 5,
      },
    }),
  };
}

// LodgingBusiness Schema - For hotel listings
export interface HotelSchemaData {
  name: string;
  description: string;
  address: { city: string; country: string; street?: string };
  starRating: number;
  priceRange: string;
  amenities: string[];
  images: string[];
  rating?: number;
  reviewCount?: number;
  checkInTime?: string;
  checkOutTime?: string;
}

export function generateHotelSchema(hotel: HotelSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: hotel.name,
    description: hotel.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: hotel.address.city,
      addressCountry: hotel.address.country,
      ...(hotel.address.street && { streetAddress: hotel.address.street }),
    },
    starRating: { '@type': 'Rating', ratingValue: hotel.starRating },
    priceRange: hotel.priceRange,
    amenityFeature: hotel.amenities.map(a => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
    image: hotel.images,
    ...(hotel.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: hotel.rating,
        reviewCount: hotel.reviewCount || 100,
        bestRating: 5,
      },
    }),
  };
}

// TaxiService Schema - For airport transfers
export interface TransferSchemaData {
  pickup: string;
  dropoff: string;
  vehicleType: string;
  price: number;
  currency: string;
  maxPassengers: number;
}

export function generateTransferSchema(transfer: TransferSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: `${transfer.pickup} to ${transfer.dropoff} Transfer`,
    description: `Private ${transfer.vehicleType} transfer service`,
    provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
    areaServed: [transfer.pickup, transfer.dropoff],
    offers: {
      '@type': 'Offer',
      price: transfer.price,
      priceCurrency: transfer.currency,
      availability: 'https://schema.org/InStock',
    },
  };
}

// SoftwareApplication Schema - For app visibility
export function generateAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
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
      ratingCount: '5000',
      bestRating: '5',
    },
    description: 'AI-powered travel booking platform for flights, hotels, tours, and transfers',
  };
}

// Speakable Schema - For voice search
export function generateSpeakableSchema(url: string, cssSelectors: string[] = ['h1', '.summary', '.description']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  };
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
