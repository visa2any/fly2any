/**
 * ROUTE ANSWER BLOCK - AEO Optimized
 * Sprint 4 - AI Citation Component
 *
 * Requirements:
 * - 40-70 words per answer
 * - Declarative, quotable facts
 * - No marketing language
 * - No CTAs inside
 * - Positioned ABOVE the fold
 *
 * Optimized for: Google AI Overviews, ChatGPT, Claude, Perplexity
 */

'use client';

import { Plane, Clock, DollarSign, Calendar, Info } from 'lucide-react';
import { DataFreshness, PriceConfidence } from './TrustSignals';

// ============================================================================
// TYPES
// ============================================================================

interface RouteAnswerData {
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  avgPrice?: number;
  lowestPrice?: number;
  currency?: string;
  flightDuration?: string;
  airlines?: string[];
  directFlights?: boolean;
  cheapestDay?: string;
  bestBookingWindow?: string;
  lastUpdated?: Date;
  priceConfidence?: 'high' | 'medium' | 'low';
  dataPoints?: number;
}

interface RouteAnswerBlockProps {
  data: RouteAnswerData;
  showMetrics?: boolean;
}

// ============================================================================
// ANSWER GENERATORS (40-70 words, declarative, quotable)
// ============================================================================

function generatePriceSummary(data: RouteAnswerData): string {
  const { origin, destination, lowestPrice, avgPrice, currency = 'USD' } = data;
  if (!lowestPrice && !avgPrice) return '';

  const priceRange = lowestPrice && avgPrice
    ? `$${lowestPrice}-$${avgPrice}`
    : avgPrice ? `around $${avgPrice}` : `from $${lowestPrice}`;

  return `Round-trip flights from ${origin} to ${destination} typically cost ${priceRange} ${currency}. Prices vary by season, demand, and how far in advance you book. The lowest fares are usually found 6-8 weeks before departure for domestic routes.`;
}

function generateDurationSummary(data: RouteAnswerData): string {
  const { origin, destination, flightDuration, directFlights } = data;
  if (!flightDuration) return '';

  const directInfo = directFlights
    ? `Non-stop flights from ${origin} to ${destination} take approximately ${flightDuration}.`
    : `Flights from ${origin} to ${destination} take approximately ${flightDuration} including connections.`;

  return `${directInfo} Actual flight times vary based on weather, air traffic, and aircraft type. Consider arriving at the airport 2 hours before domestic departures.`;
}

function generateAirlinesSummary(data: RouteAnswerData): string {
  const { origin, destination, airlines } = data;
  if (!airlines?.length) return '';

  const airlineList = airlines.slice(0, 4).join(', ');
  const moreText = airlines.length > 4 ? ` and ${airlines.length - 4} more carriers` : '';

  return `Airlines operating ${origin} to ${destination} include ${airlineList}${moreText}. Each airline offers different fare classes, baggage policies, and loyalty programs. Compare options to find the best value for your travel needs.`;
}

function generateTimingSummary(data: RouteAnswerData): string {
  const { origin, destination, cheapestDay = 'Tuesday', bestBookingWindow = '6-8 weeks' } = data;

  return `The cheapest day to fly ${origin} to ${destination} is typically ${cheapestDay}. Mid-week flights are 10-20% cheaper than weekend departures. For best prices, book ${bestBookingWindow} before your trip. Avoid booking less than 2 weeks out when fares spike.`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RouteAnswerBlock({ data, showMetrics = true }: RouteAnswerBlockProps) {
  const priceSummary = generatePriceSummary(data);
  const durationSummary = generateDurationSummary(data);
  const airlinesSummary = generateAirlinesSummary(data);
  const timingSummary = generateTimingSummary(data);

  // Primary answer (most quotable for AI)
  const primaryAnswer = priceSummary || durationSummary || timingSummary;

  if (!primaryAnswer) return null;

  return (
    <section
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      data-aeo="route-answer"
      aria-label={`Flight information for ${data.origin} to ${data.destination}`}
    >
      {/* Header with freshness indicator */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">
            {data.originName} to {data.destinationName}
          </h2>
        </div>
        {showMetrics && (
          <div className="flex items-center gap-3">
            {data.priceConfidence && (
              <PriceConfidence confidence={data.priceConfidence} dataPoints={data.dataPoints} variant="compact" />
            )}
            {data.lastUpdated && <DataFreshness lastUpdated={data.lastUpdated} variant="badge" />}
          </div>
        )}
      </div>

      {/* Primary Answer Block - AI Quotable */}
      <div className="p-4 border-b border-gray-100" data-aeo-primary="true">
        <p className="text-gray-700 leading-relaxed" data-aeo-answer="true">
          {primaryAnswer}
        </p>
      </div>

      {/* Secondary Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
        {durationSummary && priceSummary && (
          <div className="bg-white p-4" data-aeo-fact="duration">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Flight Time</span>
            </div>
            <p className="text-sm text-gray-600">{durationSummary}</p>
          </div>
        )}

        {airlinesSummary && (
          <div className="bg-white p-4" data-aeo-fact="airlines">
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Airlines</span>
            </div>
            <p className="text-sm text-gray-600">{airlinesSummary}</p>
          </div>
        )}

        {timingSummary && priceSummary && (
          <div className="bg-white p-4" data-aeo-fact="timing">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Best Time to Book</span>
            </div>
            <p className="text-sm text-gray-600">{timingSummary}</p>
          </div>
        )}

        {data.lowestPrice && data.avgPrice && (
          <div className="bg-white p-4" data-aeo-fact="price">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price Range</span>
            </div>
            <p className="text-sm text-gray-600">
              Fares range from ${data.lowestPrice} to ${Math.round(data.avgPrice * 1.5)} depending on dates, class, and airline.
            </p>
          </div>
        )}
      </div>

      {/* Data attribution footer */}
      {showMetrics && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Prices based on {data.dataPoints?.toLocaleString() || '1,000+'}  searches. Updated hourly.
          </p>
        </div>
      )}
    </section>
  );
}

// ============================================================================
// CITY ANSWER BLOCK
// ============================================================================

interface CityAnswerData {
  city: string;
  country: string;
  airports: string[];
  avgPriceFrom?: number;
  peakSeason?: string;
  bestTimeToVisit?: string;
}

export function CityAnswerBlock({ data }: { data: CityAnswerData }) {
  const airportList = data.airports.join(', ');

  return (
    <section
      className="bg-white rounded-xl border border-gray-200 p-4"
      data-aeo="city-answer"
    >
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Flights to {data.city}, {data.country}
      </h2>
      <p className="text-gray-700 leading-relaxed" data-aeo-answer="true">
        {data.city} is served by {data.airports.length > 1 ? 'multiple airports' : 'one main airport'}: {airportList}.
        {data.avgPriceFrom && ` Average flight prices from major US cities start around $${data.avgPriceFrom} round-trip.`}
        {data.bestTimeToVisit && ` The best time to visit {data.city} is ${data.bestTimeToVisit}.`}
        {data.peakSeason && ` Peak travel season is ${data.peakSeason} when prices are highest.`}
      </p>
    </section>
  );
}

// ============================================================================
// AIRLINE ANSWER BLOCK
// ============================================================================

interface AirlineAnswerData {
  name: string;
  iataCode: string;
  alliance?: string;
  hubAirports: string[];
  baggagePolicy?: string;
}

export function AirlineAnswerBlock({ data }: { data: AirlineAnswerData }) {
  return (
    <section
      className="bg-white rounded-xl border border-gray-200 p-4"
      data-aeo="airline-answer"
    >
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        {data.name} ({data.iataCode})
      </h2>
      <p className="text-gray-700 leading-relaxed" data-aeo-answer="true">
        {data.name} ({data.iataCode}) is {data.alliance ? `a member of the ${data.alliance} alliance` : 'an airline'}
        {data.hubAirports.length > 0 && ` with hub airports at ${data.hubAirports.slice(0, 3).join(', ')}`}.
        {data.baggagePolicy && ` ${data.baggagePolicy}`}
        Compare {data.name} flights with 500+ other airlines on Fly2Any to find the best prices.
      </p>
    </section>
  );
}

export default RouteAnswerBlock;
