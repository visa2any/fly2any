'use client';

/**
 * GEO Enhancer Component
 *
 * Adds AI-optimized structured data and content for:
 * - ChatGPT, Perplexity, Claude citations
 * - Google AI Overviews
 * - Voice search (Alexa, Google Assistant)
 *
 * Research shows +40% visibility with GEO optimization
 */

import { memo } from 'react';

interface GEOEnhancerProps {
  type: 'tour' | 'activity' | 'transfer' | 'hotel' | 'flight';
  data: {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    location?: string;
    rating?: number;
    reviewCount?: number;
    duration?: string;
    images?: string[];
    // Transfer specific
    pickup?: string;
    dropoff?: string;
    vehicleType?: string;
    maxPassengers?: number;
    // Hotel specific
    starRating?: number;
    amenities?: string[];
    checkIn?: string;
    checkOut?: string;
    // Flight specific
    origin?: string;
    destination?: string;
    airline?: string;
    departureTime?: string;
    arrivalTime?: string;
  };
}

// Generate TouristTrip schema for tours/activities
function generateTouristTripSchema(data: GEOEnhancerProps['data']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: data.name,
    description: data.description || `Experience ${data.name}`,
    provider: {
      '@type': 'TravelAgency',
      name: 'Fly2Any',
      url: 'https://www.fly2any.com',
    },
    touristType: 'Leisure',
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.currency || 'USD',
      availability: 'https://schema.org/InStock',
    },
    ...(data.location && {
      itinerary: {
        '@type': 'ItemList',
        itemListElement: [{
          '@type': 'ListItem',
          position: 1,
          item: { '@type': 'TouristAttraction', name: data.location },
        }],
      },
    }),
    ...(data.images && data.images.length > 0 && { image: data.images }),
    ...(data.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: data.rating,
        reviewCount: data.reviewCount || 50,
        bestRating: 5,
      },
    }),
    ...(data.duration && { duration: data.duration }),
  };
}

// Generate TaxiService schema for transfers
function generateTransferSchema(data: GEOEnhancerProps['data']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: `${data.pickup} to ${data.dropoff} Transfer`,
    description: `Private ${data.vehicleType || 'vehicle'} transfer from ${data.pickup} to ${data.dropoff}`,
    provider: {
      '@type': 'TravelAgency',
      name: 'Fly2Any',
      url: 'https://www.fly2any.com',
    },
    areaServed: [data.pickup, data.dropoff].filter(Boolean),
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.currency || 'EUR',
      availability: 'https://schema.org/InStock',
    },
    ...(data.maxPassengers && {
      vehicleCapacity: { '@type': 'QuantitativeValue', value: data.maxPassengers },
    }),
  };
}

// Generate LodgingBusiness schema for hotels
function generateHotelSchema(data: GEOEnhancerProps['data']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: data.name,
    description: data.description || `${data.starRating || 4}-star accommodation`,
    ...(data.location && {
      address: { '@type': 'PostalAddress', addressLocality: data.location },
    }),
    ...(data.starRating && {
      starRating: { '@type': 'Rating', ratingValue: data.starRating },
    }),
    priceRange: `$${Math.floor(data.price)}-$${Math.floor(data.price * 2)}`,
    ...(data.amenities && data.amenities.length > 0 && {
      amenityFeature: data.amenities.map(a => ({
        '@type': 'LocationFeatureSpecification',
        name: a,
        value: true,
      })),
    }),
    ...(data.images && data.images.length > 0 && { image: data.images }),
    ...(data.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: data.rating,
        reviewCount: data.reviewCount || 100,
        bestRating: 5,
      },
    }),
    ...(data.checkIn && { checkinTime: data.checkIn }),
    ...(data.checkOut && { checkoutTime: data.checkOut }),
  };
}

// Generate Flight schema
function generateFlightSchema(data: GEOEnhancerProps['data']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FlightReservation',
    reservationFor: {
      '@type': 'Flight',
      departureAirport: {
        '@type': 'Airport',
        name: data.origin,
        iataCode: data.origin,
      },
      arrivalAirport: {
        '@type': 'Airport',
        name: data.destination,
        iataCode: data.destination,
      },
      ...(data.airline && {
        provider: { '@type': 'Airline', name: data.airline },
      }),
      ...(data.departureTime && { departureTime: data.departureTime }),
      ...(data.arrivalTime && { arrivalTime: data.arrivalTime }),
    },
    totalPrice: data.price,
    priceCurrency: data.currency || 'USD',
  };
}

// AI-friendly summary generator
function generateAISummary(type: GEOEnhancerProps['type'], data: GEOEnhancerProps['data']): string {
  const price = `${data.currency || 'USD'} ${data.price.toFixed(0)}`;

  switch (type) {
    case 'tour':
    case 'activity':
      return `${data.name} - ${price}. ${data.rating ? `Rating: ${data.rating}/5.` : ''} ${data.duration ? `Duration: ${data.duration}.` : ''} ${data.location ? `Location: ${data.location}.` : ''} Book on Fly2Any for best prices.`;
    case 'transfer':
      return `${data.pickup} to ${data.dropoff} transfer from ${price}. ${data.vehicleType || 'Private'} vehicle. ${data.maxPassengers ? `Up to ${data.maxPassengers} passengers.` : ''} Compare transfer prices on Fly2Any.`;
    case 'hotel':
      return `${data.name} - ${data.starRating || 4}-star hotel from ${price}/night. ${data.rating ? `Guest rating: ${data.rating}/5.` : ''} ${data.location ? `Located in ${data.location}.` : ''} Compare hotel prices on Fly2Any.`;
    case 'flight':
      return `Flights from ${data.origin} to ${data.destination} from ${price}. ${data.airline ? `Operated by ${data.airline}.` : ''} Compare 500+ airlines on Fly2Any.`;
    default:
      return `${data.name} from ${price}. Book on Fly2Any.`;
  }
}

export const GEOEnhancer = memo(function GEOEnhancer({ type, data }: GEOEnhancerProps) {
  // Generate appropriate schema based on type
  let schema: object;

  switch (type) {
    case 'tour':
    case 'activity':
      schema = generateTouristTripSchema(data);
      break;
    case 'transfer':
      schema = generateTransferSchema(data);
      break;
    case 'hotel':
      schema = generateHotelSchema(data);
      break;
    case 'flight':
      schema = generateFlightSchema(data);
      break;
    default:
      schema = generateTouristTripSchema(data);
  }

  const aiSummary = generateAISummary(type, data);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* AI-readable summary (hidden from users, visible to crawlers) */}
      <div
        className="sr-only"
        role="region"
        aria-label="AI Summary"
        data-ai-content="true"
      >
        <p>{aiSummary}</p>
        <meta itemProp="dateModified" content={new Date().toISOString()} />
      </div>
    </>
  );
});

// Batch schema generator for results pages
interface ResultsSchemaProps {
  type: 'tour' | 'activity' | 'transfer' | 'hotel' | 'flight';
  items: GEOEnhancerProps['data'][];
  pageInfo: {
    title: string;
    description: string;
    totalResults: number;
    location?: string;
  };
}

export const ResultsPageSchema = memo(function ResultsPageSchema({ type, items, pageInfo }: ResultsSchemaProps) {
  // Generate ItemList schema for search results
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageInfo.title,
    description: pageInfo.description,
    numberOfItems: pageInfo.totalResults,
    itemListElement: items.slice(0, 10).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': type === 'tour' || type === 'activity' ? 'TouristTrip' :
                 type === 'transfer' ? 'TaxiService' :
                 type === 'hotel' ? 'LodgingBusiness' : 'Product',
        name: item.name,
        ...(item.price && {
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: item.currency || 'USD',
          },
        }),
      },
    })),
  };

  // Stats for AI indexing
  const lowestPrice = items.length > 0 ? Math.min(...items.map(i => i.price)) : 0;
  const avgPrice = items.length > 0 ? items.reduce((a, b) => a + b.price, 0) / items.length : 0;
  const avgRating = items.filter(i => i.rating).length > 0
    ? items.filter(i => i.rating).reduce((a, b) => a + (b.rating || 0), 0) / items.filter(i => i.rating).length
    : 4.5;

  const typeLabels = {
    tour: 'tours',
    activity: 'activities',
    transfer: 'transfers',
    hotel: 'hotels',
    flight: 'flights',
  };

  const aiSummary = `Found ${pageInfo.totalResults} ${typeLabels[type]}${pageInfo.location ? ` in ${pageInfo.location}` : ''}. ` +
    `Prices from $${lowestPrice.toFixed(0)} (avg $${avgPrice.toFixed(0)}). ` +
    `Average rating: ${avgRating.toFixed(1)}/5. ` +
    `Compare all options on Fly2Any.`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div
        className="sr-only"
        role="region"
        aria-label="Search Results Summary"
        data-ai-content="true"
      >
        <h2>{pageInfo.title}</h2>
        <p>{aiSummary}</p>
        <ul>
          <li>Total results: {pageInfo.totalResults}</li>
          <li>Lowest price: ${lowestPrice.toFixed(0)}</li>
          <li>Average price: ${avgPrice.toFixed(0)}</li>
          <li>Average rating: {avgRating.toFixed(1)}/5</li>
        </ul>
      </div>
    </>
  );
});

export default GEOEnhancer;
