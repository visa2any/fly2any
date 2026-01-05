/**
 * SEO Metadata Utilities
 * 
 * Functions for generating structured data schemas
 * 
 * @version 2.0.0 - Added Review, Event, SoftwareApplication, TravelAgency schemas
 */

/**
 * Generate FAQPage schema for JSON-LD
 */
export function getFAQSchema(faqItems: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqItems.map(({ question, answer }) => ({
      '@type': 'Question',
      'name': question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': answer
      }
    }))
  };
}

/**
 * Generate Organization schema
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Fly2Any',
    'url': 'https://www.fly2any.com',
    'logo': 'https://www.fly2any.com/logo.png',
    'sameAs': [
      'https://twitter.com/fly2any',
      'https://www.facebook.com/fly2any',
      'https://www.instagram.com/fly2any',
      'https://www.linkedin.com/company/fly2any'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+1-800-FLY2ANY',
      'contactType': 'customer service',
      'availableLanguage': ['English', 'Spanish', 'Portuguese']
    }
  };
}

/**
 * Generate Website schema
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': 'https://www.fly2any.com',
    'name': 'Fly2Any',
    'description': 'Find and book the cheapest flights, hotels, and car rentals worldwide.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://www.fly2any.com/flights/results?from={from}&to={to}&departure={departure}'
      },
      'query-input': 'required name=from name=to name=departure'
    }
  };
}

/**
 * Generate Flight schema for a specific flight
 */
export function getFlightSchema(flight: {
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
  };
  arrival: {
    airport: string;
    time: string;
  };
  price: number;
  currency: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Flight',
    'flightNumber': flight.flightNumber,
    'airline': {
      '@type': 'Airline',
      'name': flight.airline
    },
    'departureAirport': {
      '@type': 'Airport',
      'name': flight.departure.airport
    },
    'departureTime': flight.departure.time,
    'arrivalAirport': {
      '@type': 'Airport',
      'name': flight.arrival.airport
    },
    'arrivalTime': flight.arrival.time,
    'offers': {
      '@type': 'Offer',
      'price': flight.price,
      'priceCurrency': flight.currency,
      'availability': 'https://schema.org/InStock',
      'url': flight.url
    }
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}

/**
 * Generate LocalBusiness schema for airport/city pages
 */
export function getLocalBusinessSchema(city: string, airportCode: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': `Flights from ${city} (${airportCode})`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': city,
      'addressCountry': 'US'
    },
    'description': `Book cheap flights from ${city} (${airportCode}) to destinations worldwide.`,
    'openingHours': 'Mo-Su 00:00-23:59',
    'telephone': '+1-800-FLY2ANY',
    'url': `https://www.fly2any.com/flights/from/${airportCode}`
  };
}

/**
 * Generate Review/AggregateRating schema for flights, hotels, etc.
 */
export function getReviewSchema(rating: {
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  ratingCount: number;
  reviewCount: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    'ratingValue': rating.ratingValue,
    'bestRating': rating.bestRating || 5,
    'worstRating': rating.worstRating || 1,
    'ratingCount': rating.ratingCount,
    'reviewCount': rating.reviewCount
  };
}

/**
 * Generate Event schema for tours/activities
 */
export function getEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address: string;
  };
  offers?: {
    price: number;
    priceCurrency: string;
    url: string;
    availability: string;
  }[];
  image?: string;
  url: string;
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': event.name,
    'description': event.description,
    'startDate': event.startDate,
    'location': {
      '@type': 'Place',
      'name': event.location.name,
      'address': event.location.address
    },
    'url': event.url
  };

  if (event.endDate) {
    schema.endDate = event.endDate;
  }

  if (event.image) {
    schema.image = event.image;
  }

  if (event.offers && event.offers.length > 0) {
    schema.offers = event.offers.map(offer => ({
      '@type': 'Offer',
      'price': offer.price,
      'priceCurrency': offer.priceCurrency,
      'url': offer.url,
      'availability': offer.availability || 'https://schema.org/InStock'
    }));
  }

  return schema;
}

/**
 * Generate SoftwareApplication schema for mobile apps
 */
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Fly2Any',
    'applicationCategory': 'TravelApplication',
    'operatingSystem': 'Android, iOS, Web',
    'description': 'Fly2Any travel booking app for flights, hotels, cars, and tours.',
    'url': 'https://www.fly2any.com',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '1250'
    }
  };
}

/**
 * Generate TravelAgency schema
 */
export function getTravelAgencySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    'name': 'Fly2Any',
    'description': 'Fly2Any is a leading online travel agency specializing in flight bookings, hotel reservations, car rentals, and tour packages.',
    'url': 'https://www.fly2any.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '123 Travel Street',
      'addressLocality': 'New York',
      'addressRegion': 'NY',
      'postalCode': '10001',
      'addressCountry': 'US'
    },
    'telephone': '+1-800-FLY2ANY',
    'openingHours': 'Mo-Su 00:00-23:59',
    'priceRange': '$$',
    'servesCuisine': 'Global travel services'
  };
}

/**
 * Generate Product schema for flight/hotel offers
 */
export function getProductSchema(product: {
  name: string;
  description: string;
  image: string;
  sku: string;
  brand: {
    name: string;
    url?: string;
  };
  offers: {
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
    priceValidUntil?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
  };
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.image,
    'sku': product.sku,
    'brand': {
      '@type': 'Brand',
      'name': product.brand.name
    },
    'offers': {
      '@type': 'Offer',
      'price': product.offers.price,
      'priceCurrency': product.offers.priceCurrency,
      'availability': product.offers.availability,
      'url': product.offers.url
    }
  };

  if (product.brand.url) {
    schema.brand.url = product.brand.url;
  }

  if (product.offers.priceValidUntil) {
    schema.offers.priceValidUntil = product.offers.priceValidUntil;
  }

  if (product.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': product.aggregateRating.ratingValue,
      'ratingCount': product.aggregateRating.ratingCount
    };
  }

  return schema;
}

/**
 * Generate HowTo schema for travel guides
 */
export function getHowToSchema(howTo: {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
  totalTime?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': howTo.name,
    'description': howTo.description,
    'step': howTo.steps.map((step, index) => {
      const stepSchema: any = {
        '@type': 'HowToStep',
        'position': index + 1,
        'name': step.name,
        'text': step.text
      };
      if (step.image) {
        stepSchema.image = step.image;
      }
      if (step.url) {
        stepSchema.url = step.url;
      }
      return stepSchema;
    }),
    'totalTime': howTo.totalTime,
    'image': howTo.image,
    'url': howTo.url
  };
}

// Alias for backward compatibility
export const getWebSiteSchema = getWebsiteSchema;

// Generic metadata generator
export function generateMetadata(config: any) {
  return {
    title: config.title || 'Fly2Any',
    description: config.description || 'Premium travel booking platform',
    ...config
  };
}

// World Cup metadata functions (stubs for compatibility)
export const worldCupMainMetadata = { title: 'World Cup 2026', description: 'FIFA World Cup 2026' };
export const worldCupPackagesMetadata = { title: 'World Cup Packages', description: 'Travel packages for World Cup 2026' };
export const worldCupScheduleMetadata = { title: 'World Cup Schedule', description: 'FIFA World Cup 2026 schedule' };
export const worldCupStadiumMetadata = (slug: string) => ({ title: `${slug} Stadium`, description: 'World Cup stadium' });
export const worldCupTeamMetadata = (slug: string) => ({ title: `${slug} Team`, description: 'World Cup team' });

export const getWorldCupEventSchema = getEventSchema;
export const getTravelPackageSchema = getProductSchema;
export const getStadiumSchema = getLocalBusinessSchema;
export const getSportsTeamSchema = getOrganizationSchema;

export default {
  getFAQSchema,
  getOrganizationSchema,
  getWebsiteSchema,
  getFlightSchema,
  getBreadcrumbSchema,
  getLocalBusinessSchema,
  getReviewSchema,
  getEventSchema,
  getSoftwareApplicationSchema,
  getTravelAgencySchema,
  getProductSchema,
  getHowToSchema,
  generateMetadata
};
