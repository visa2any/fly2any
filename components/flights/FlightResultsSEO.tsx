/**
 * Flight Results SEO Component
 *
 * Adds structured data and AI-optimized summaries
 * to flight search results pages.
 */

'use client';

import React from 'react';

interface FlightResult {
  id: string;
  origin: string;
  destination: string;
  price: number;
  airline: string;
  duration: string;
  stops: number;
}

interface FlightResultsSEOProps {
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  results: FlightResult[];
  currency?: string;
}

/**
 * Generate ItemList schema for flight results (carousel eligibility)
 */
function generateItemListSchema(props: FlightResultsSEOProps) {
  const { origin, originName, destination, destinationName, results, currency = 'USD' } = props;

  if (!results.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Flights from ${originName} to ${destinationName}`,
    description: `Compare ${results.length} flight options from ${origin} to ${destination}`,
    numberOfItems: results.length,
    itemListElement: results.slice(0, 10).map((flight, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: `${flight.airline} ${origin}-${destination}`,
        description: `${flight.duration}, ${flight.stops === 0 ? 'Direct flight' : `${flight.stops} stop(s)`}`,
        offers: {
          '@type': 'Offer',
          price: flight.price,
          priceCurrency: currency,
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'Fly2Any' },
        },
      },
    })),
  };
}

/**
 * Generate AggregateOffer schema for flight results
 */
function generateFlightOffersSchema(props: FlightResultsSEOProps) {
  const { origin, originName, destination, destinationName, results, currency = 'USD' } = props;

  if (!results.length) return null;

  const prices = results.map(r => r.price);
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);

  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateOffer',
    name: `Flights from ${originName} to ${destinationName}`,
    description: `Compare ${results.length} flight options from ${origin} to ${destination}`,
    priceCurrency: currency,
    lowPrice: lowPrice,
    highPrice: highPrice,
    offerCount: results.length,
    seller: {
      '@type': 'Organization',
      name: 'Fly2Any',
      url: 'https://fly2any.com',
    },
  };
}

/**
 * Generate AI-readable summary for search results
 */
function generateAISummary(props: FlightResultsSEOProps): string {
  const { originName, destinationName, results, currency = 'USD' } = props;

  if (!results.length) {
    return `No flights currently available from ${originName} to ${destinationName}. Check back later for updated options.`;
  }

  const prices = results.map(r => r.price);
  const lowPrice = Math.min(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const airlines = [...new Set(results.map(r => r.airline))].slice(0, 4);
  const directFlights = results.filter(r => r.stops === 0);

  return `Found ${results.length} flights from ${originName} to ${destinationName}. ` +
    `Lowest price: ${currency} ${lowPrice}. Average price: ${currency} ${avgPrice}. ` +
    `Airlines: ${airlines.join(', ')}. ` +
    `${directFlights.length} direct flight${directFlights.length !== 1 ? 's' : ''} available. ` +
    `Prices compared from 500+ airlines on Fly2Any.`;
}

export function FlightResultsSEO(props: FlightResultsSEOProps) {
  const itemListSchema = generateItemListSchema(props);
  const aggregateSchema = generateFlightOffersSchema(props);
  const summary = generateAISummary(props);

  return (
    <>
      {/* ItemList Schema for carousel eligibility */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      {/* AggregateOffer Schema for price range */}
      {aggregateSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateSchema) }}
        />
      )}
      {/* AI Search Summary - Hidden from users, visible to crawlers */}
      <div className="sr-only" role="region" aria-label="Search Results Summary">
        <p>{summary}</p>
      </div>
    </>
  );
}

/**
 * Skeleton for search results (prevents CLS)
 */
export function FlightResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading flights...">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse"
          style={{ minHeight: '140px' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-neutral-200 rounded" />
                <div className="h-3 w-16 bg-neutral-100 rounded" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-6 w-20 bg-neutral-200 rounded mb-1" />
              <div className="h-3 w-14 bg-neutral-100 rounded" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-4 w-16 bg-neutral-200 rounded" />
              <div className="flex-1 h-1 bg-neutral-100 rounded-full" />
              <div className="h-4 w-16 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FlightResultsSEO;
