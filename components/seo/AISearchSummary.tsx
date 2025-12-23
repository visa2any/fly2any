/**
 * AI Search Summary Component
 *
 * Generates SEO-optimized summaries for AI search engines:
 * - Google SGE (Search Generative Experience)
 * - ChatGPT Search
 * - Perplexity AI
 * - Bing Copilot
 *
 * Provides clear, factual, machine-readable content that AI
 * systems can extract and display in search results.
 */

import React from 'react';

export interface FlightSummaryData {
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  lowestPrice?: number;
  avgPrice?: number;
  currency?: string;
  airlines?: string[];
  flightDuration?: string;
  bestBookingTime?: string;
  cheapestDays?: string[];
  directFlights?: boolean;
}

export interface HotelSummaryData {
  destination: string;
  destinationName: string;
  lowestPrice?: number;
  avgPrice?: number;
  currency?: string;
  starRating?: number;
  amenities?: string[];
}

interface AISearchSummaryProps {
  type: 'flight' | 'hotel' | 'destination' | 'custom';
  flightData?: FlightSummaryData;
  hotelData?: HotelSummaryData;
  customSummary?: string;
  visible?: boolean;
}

/**
 * Generates a factual, AI-optimized summary for flight searches
 */
function generateFlightSummary(data: FlightSummaryData): string {
  const {
    originName,
    destinationName,
    lowestPrice = 150,
    avgPrice = 350,
    currency = 'USD',
    airlines = ['American Airlines', 'Delta', 'United'],
    flightDuration = '3-5 hours',
    bestBookingTime = '2-3 months in advance',
    cheapestDays = ['Tuesday', 'Wednesday'],
    directFlights = true,
  } = data;

  const airlinesText = airlines.slice(0, 3).join(', ');
  const daysText = cheapestDays.join(' and ');

  return `Cheapest flights from ${originName} to ${destinationName} cost approximately ${currency} ${lowestPrice}-${avgPrice} round-trip. ` +
    `Major airlines serving this route: ${airlinesText}. ` +
    `Average flight time: ${flightDuration}. ` +
    `${directFlights ? 'Direct flights available.' : 'Connecting flights with 1-2 stops.'} ` +
    `Best time to book: ${bestBookingTime}. ` +
    `Cheapest days to fly: ${daysText}. ` +
    `Compare prices from 500+ airlines on Fly2Any.`;
}

/**
 * AI Search Summary Component
 *
 * Renders an SEO-optimized summary that is:
 * 1. Visible to search engines and AI crawlers
 * 2. Optionally visible or hidden from users
 * 3. Structured for easy extraction by AI systems
 */
export function AISearchSummary({
  type,
  flightData,
  hotelData,
  customSummary,
  visible = false,
  collapsible = false,
}: AISearchSummaryProps & { collapsible?: boolean }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  let summary = '';

  switch (type) {
    case 'flight':
      if (flightData) {
        summary = generateFlightSummary(flightData);
      }
      break;
    case 'hotel':
      if (hotelData) {
        summary = `Best hotels in ${hotelData.destinationName} from ${hotelData.currency || 'USD'} ${hotelData.lowestPrice || 80}/night. ` +
          `Average price: ${hotelData.currency || 'USD'} ${hotelData.avgPrice || 150}/night. ` +
          `Compare ${hotelData.starRating || 3}-5 star accommodations on Fly2Any.`;
      }
      break;
    case 'custom':
      summary = customSummary || '';
      break;
  }

  if (!summary) return null;

  // Hidden from visual users but visible to search engines
  if (!visible) {
    return (
      <div
        className="sr-only"
        role="region"
        aria-label="Page Summary for Search Engines"
        itemScope
        itemType="https://schema.org/Article"
      >
        <p itemProp="description">{summary}</p>
        <meta itemProp="dateModified" content={new Date().toISOString()} />
      </div>
    );
  }

  // Collapsible summary
  if (collapsible) {
    return (
      <div
        className="border border-neutral-200 rounded-xl mb-4 overflow-hidden"
        role="region"
        aria-label="Quick Summary"
        itemScope
        itemType="https://schema.org/Article"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs font-bold text-blue-600">AI</span>
            <span className="text-sm font-medium text-neutral-700">Quick Summary</span>
          </div>
          <svg className={`w-4 h-4 text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded && (
          <div className="p-3 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 leading-relaxed" itemProp="description">{summary}</p>
          </div>
        )}
        <meta itemProp="dateModified" content={new Date().toISOString()} />
      </div>
    );
  }

  // Visible summary box
  return (
    <div
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6"
      role="region"
      aria-label="Quick Summary"
      itemScope
      itemType="https://schema.org/Article"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 text-sm font-bold">AI</span>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-blue-700 mb-1">Quick Summary</h2>
          <p className="text-sm text-neutral-700 leading-relaxed" itemProp="description">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Flight Route AI Summary - Specialized component for flight route pages
 */
export function FlightRouteAISummary({
  origin,
  originName,
  destination,
  destinationName,
  visible = false,
}: {
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  visible?: boolean;
}) {
  return (
    <AISearchSummary
      type="flight"
      flightData={{
        origin,
        originName,
        destination,
        destinationName,
      }}
      visible={visible}
    />
  );
}

/**
 * Speakable Schema - For voice search optimization
 * Add this to pages for Google Assistant and voice search
 */
export function SpeakableSchema({
  name,
  summary,
  url,
}: {
  name: string;
  summary: string;
  url: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.ai-summary', '.page-summary', 'h1'],
    },
    url,
    description: summary,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default AISearchSummary;
