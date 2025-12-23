/**
 * ENTITY GRAPH & STRUCTURED DATA LAYER
 *
 * Production-grade schema.org implementation for:
 * - Google Rich Results
 * - SGE (Search Generative Experience)
 * - LLM Understanding (GEO/LLMCO)
 *
 * Entity Model:
 * Organization → WebSite → Routes → Offers
 *             → Airlines
 *             → Airports → Cities
 *
 * @version 2.0.0 - Sprint 2
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const SITE_NAME = 'Fly2Any';

// ============================================================================
// ENTITY IDS - Canonical identifiers for entity consistency
// ============================================================================

export const EntityIds = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  searchAction: `${SITE_URL}/#searchaction`,

  // Dynamic entity IDs
  airline: (code: string) => `${SITE_URL}/airlines/${code.toLowerCase()}#airline`,
  airport: (code: string) => `${SITE_URL}/airports/${code.toLowerCase()}#airport`,
  city: (slug: string) => `${SITE_URL}/destinations/${slug}#city`,
  route: (origin: string, dest: string) =>
    `${SITE_URL}/flights/${origin.toLowerCase()}-to-${dest.toLowerCase()}#route`,
  article: (slug: string) => `${SITE_URL}/blog/${slug}#article`,
};

// ============================================================================
// CORE ENTITY: ORGANIZATION (Fly2Any)
// ============================================================================

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  '@id': string;
  name: string;
  alternateName?: string;
  url: string;
  logo: object;
  description: string;
  foundingDate: string;
  areaServed: string;
  sameAs: string[];
  contactPoint: object[];
}

export function getOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': EntityIds.organization,
    name: SITE_NAME,
    alternateName: 'Fly2Any Travel',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    description: 'Fly2Any is an online travel platform that compares flights, hotels, and travel services from 500+ providers. Founded in 2024 in the United States.',
    foundingDate: '2024',
    areaServed: 'Worldwide',
    sameAs: [
      'https://twitter.com/fly2any',
      'https://www.facebook.com/fly2any',
      'https://www.linkedin.com/company/fly2any',
      'https://www.instagram.com/fly2any',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['English', 'Spanish', 'Portuguese'],
        email: 'support@fly2any.com',
      },
    ],
  };
}

// ============================================================================
// CORE ENTITY: WEBSITE
// ============================================================================

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': EntityIds.website,
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Compare flights from 500+ airlines. Find cheap flights, hotels, and travel deals.',
    publisher: { '@id': EntityIds.organization },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      '@id': EntityIds.searchAction,
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/flights/results?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ============================================================================
// ENTITY: AIRLINE
// ============================================================================

export interface AirlineData {
  code: string;
  name: string;
  country?: string;
  alliance?: string;
}

export function getAirlineSchema(airline: AirlineData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Airline',
    '@id': EntityIds.airline(airline.code),
    name: airline.name,
    iataCode: airline.code,
    url: `${SITE_URL}/airlines/${airline.code.toLowerCase()}`,
    ...(airline.country && {
      address: { '@type': 'PostalAddress', addressCountry: airline.country }
    }),
    ...(airline.alliance && { memberOf: airline.alliance }),
  };
}

// ============================================================================
// ENTITY: AIRPORT
// ============================================================================

export interface AirportData {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export function getAirportSchema(airport: AirportData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Airport',
    '@id': EntityIds.airport(airport.code),
    name: airport.name,
    iataCode: airport.code,
    address: {
      '@type': 'PostalAddress',
      addressLocality: airport.city,
      addressCountry: airport.country,
    },
    ...(airport.latitude && airport.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: airport.latitude,
        longitude: airport.longitude,
      },
    }),
  };
}

// ============================================================================
// ENTITY: CITY / DESTINATION
// ============================================================================

export interface CityData {
  name: string;
  slug: string;
  country: string;
  state?: string;
  airports: string[];
  latitude?: number;
  longitude?: number;
  description?: string;
}

export function getCitySchema(city: CityData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    '@id': EntityIds.city(city.slug),
    name: city.name,
    url: `${SITE_URL}/destinations/${city.slug}`,
    containedInPlace: {
      '@type': 'Country',
      name: city.country,
    },
    ...(city.state && {
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: city.state,
        containedInPlace: { '@type': 'Country', name: city.country },
      },
    }),
    ...(city.latitude && city.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: city.latitude,
        longitude: city.longitude,
      },
    }),
    ...(city.description && { description: city.description }),
  };
}

// ============================================================================
// ENTITY: FLIGHT ROUTE
// ============================================================================

export interface RouteData {
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  hasInventory: boolean;
  pricing?: {
    minPrice: number;
    avgPrice: number;
    currency: string;
  };
  airlines?: string[];
  flightDuration?: string;
}

export function getRouteSchema(route: RouteData) {
  const routeId = EntityIds.route(route.origin, route.destination);

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Flight',
    '@id': routeId,
    name: `Flight from ${route.originName} to ${route.destinationName}`,
    description: `Compare flights from ${route.origin} to ${route.destination}. Find cheap airfare and book with confidence.`,
    url: `${SITE_URL}/flights/${route.origin.toLowerCase()}-to-${route.destination.toLowerCase()}`,
    departureAirport: { '@id': EntityIds.airport(route.origin) },
    arrivalAirport: { '@id': EntityIds.airport(route.destination) },
    provider: { '@id': EntityIds.organization },
  };

  // CONDITIONAL: Only add Offer when inventory exists
  if (route.hasInventory && route.pricing && route.pricing.minPrice > 0) {
    return {
      ...baseSchema,
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: route.pricing.minPrice,
        highPrice: route.pricing.avgPrice * 1.5,
        priceCurrency: route.pricing.currency,
        availability: 'https://schema.org/InStock',
        offerCount: route.airlines?.length || 3,
        seller: { '@id': EntityIds.organization },
        url: `${SITE_URL}/flights/${route.origin.toLowerCase()}-to-${route.destination.toLowerCase()}`,
      },
    };
  }

  // No inventory: Return schema WITHOUT Offer
  return baseSchema;
}

// ============================================================================
// ENTITY: ARTICLE (Blog)
// ============================================================================

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  author?: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  category?: string;
}

export function getArticleSchema(article: ArticleData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': EntityIds.article(article.slug),
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}/blog/${article.slug}`,
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate || article.publishedDate,
    author: {
      '@type': 'Person',
      name: article.author || 'Fly2Any Team',
    },
    publisher: { '@id': EntityIds.organization },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${article.slug}`,
    },
    ...(article.image && {
      image: {
        '@type': 'ImageObject',
        url: article.image,
      },
    }),
    ...(article.category && { articleSection: article.category }),
  };
}

// ============================================================================
// BREADCRUMB SCHEMA
// ============================================================================

export function getBreadcrumbListSchema(items: Array<{ name: string; url: string }>) {
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

// ============================================================================
// FAQ SCHEMA
// ============================================================================

export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;

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

// ============================================================================
// COMPOSITE SCHEMAS - Combined for specific page types
// ============================================================================

/**
 * Homepage schema graph
 */
export function getHomePageSchemaGraph() {
  return [
    getOrganizationSchema(),
    getWebSiteSchema(),
  ];
}

/**
 * Route page schema graph - conditional Offer
 */
export function getRoutePageSchemaGraph(
  route: RouteData,
  breadcrumbs: Array<{ name: string; url: string }>,
  faqs?: Array<{ question: string; answer: string }>
) {
  const schemas: object[] = [
    getRouteSchema(route),
    getBreadcrumbListSchema(breadcrumbs),
  ];

  if (faqs && faqs.length > 0) {
    const faqSchema = getFAQSchema(faqs);
    if (faqSchema) schemas.push(faqSchema);
  }

  return schemas;
}

/**
 * City/Destination page schema graph
 */
export function getCityPageSchemaGraph(
  city: CityData,
  breadcrumbs: Array<{ name: string; url: string }>,
  airports?: AirportData[]
) {
  const schemas: object[] = [
    getCitySchema(city),
    getBreadcrumbListSchema(breadcrumbs),
  ];

  if (airports) {
    airports.forEach(airport => {
      schemas.push(getAirportSchema(airport));
    });
  }

  return schemas;
}

/**
 * Blog article page schema graph
 */
export function getArticlePageSchemaGraph(
  article: ArticleData,
  breadcrumbs: Array<{ name: string; url: string }>,
  faqs?: Array<{ question: string; answer: string }>
) {
  const schemas: object[] = [
    getArticleSchema(article),
    getBreadcrumbListSchema(breadcrumbs),
  ];

  if (faqs && faqs.length > 0) {
    const faqSchema = getFAQSchema(faqs);
    if (faqSchema) schemas.push(faqSchema);
  }

  return schemas;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if schema has valid Offer (prevents schema spam)
 */
export function hasValidOffer(schema: any): boolean {
  if (!schema.offers) return false;
  const offer = schema.offers;
  return (
    offer.lowPrice > 0 &&
    offer.priceCurrency &&
    offer.availability === 'https://schema.org/InStock'
  );
}

/**
 * Validate schema has required @id for entity consistency
 */
export function hasValidEntityId(schema: any): boolean {
  return Boolean(schema['@id']);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const EntitySchema = {
  organization: getOrganizationSchema,
  website: getWebSiteSchema,
  airline: getAirlineSchema,
  airport: getAirportSchema,
  city: getCitySchema,
  route: getRouteSchema,
  article: getArticleSchema,
  breadcrumb: getBreadcrumbListSchema,
  faq: getFAQSchema,

  // Composite
  homePage: getHomePageSchemaGraph,
  routePage: getRoutePageSchemaGraph,
  cityPage: getCityPageSchemaGraph,
  articlePage: getArticlePageSchemaGraph,

  // Validation
  hasValidOffer,
  hasValidEntityId,

  // IDs
  ids: EntityIds,
};

export default EntitySchema;
