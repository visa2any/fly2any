/**
 * PROGRAMMATIC SEO: DYNAMIC FLIGHT ROUTE PAGES
 *
 * Auto-generates 50,000+ SEO-optimized landing pages for flight routes
 * Example URLs:
 * - /flights/jfk-to-lax
 * - /flights/new-york-to-los-angeles
 * - /flights/nyc-lax
 *
 * Features:
 * - ISR (Incremental Static Regeneration) - regenerates every 6 hours
 * - Dynamic metadata for each route
 * - Comprehensive schema markup (conditional - only with real pricing)
 * - Cache-first pricing strategy
 * - Soft 404 prevention with alternative content
 * - Alternative airport suggestions
 * - Related routes and destinations
 * - FAQ section per route
 *
 * @version 2.1.0 - Entity Graph integration (Sprint 2)
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateMetadata as genMeta } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { formatRouteSlug, TOP_US_CITIES, TOP_INTERNATIONAL_CITIES, MAJOR_AIRLINES } from '@/lib/seo/sitemap-helpers';
import { generateRouteFAQs } from '@/lib/seo/route-faq-generator';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { NoFlightsAvailable } from '@/components/seo/NoFlightsAvailable';
import { EntitySchema, getRoutePageSchemaGraph, type RouteData } from '@/lib/seo/entity-schema';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

// Route parameter type
type RouteParams = {
  route: string;
};

// Parse route slug to extract origin and destination
function parseRouteSlug(slug: string): { origin: string; destination: string } | null {
  // Handle different formats:
  // jfk-to-lax, jfk-lax, new-york-to-los-angeles
  const patterns = [
    /^([a-z]{3})-to-([a-z]{3})$/i,  // jfk-to-lax
    /^([a-z]{3})-([a-z]{3})$/i,      // jfk-lax
    /^(.+)-to-(.+)$/,                 // new-york-to-los-angeles
  ];

  for (const pattern of patterns) {
    const match = slug.match(pattern);
    if (match) {
      return {
        origin: match[1].toUpperCase(),
        destination: match[2].toUpperCase(),
      };
    }
  }

  return null;
}

// Get airport/city name from code
function getLocationName(code: string): string {
  // Try US cities first
  const usCity = TOP_US_CITIES.find(c =>
    c.airports.includes(code.toUpperCase())
  );
  if (usCity) return `${usCity.city}, ${usCity.state}`;

  // Try international cities
  const intlCity = TOP_INTERNATIONAL_CITIES.find(c =>
    c.airports.includes(code.toUpperCase())
  );
  if (intlCity) return `${intlCity.city}, ${intlCity.country}`;

  // Fallback to code
  return code.toUpperCase();
}

// Generate metadata for this route
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const parsed = parseRouteSlug(params.route);

  if (!parsed) {
    return genMeta({
      title: 'Flight Not Found',
      description: 'The flight route you are looking for could not be found.',
      noindex: true,
    });
  }

  const { origin, destination } = parsed;
  const originName = getLocationName(origin);
  const destinationName = getLocationName(destination);

  const currentYear = new Date().getFullYear();

  return genMeta({
    title: `Cheap Flights from ${originName} to ${destinationName} ${currentYear} - Compare Prices`,
    description: `Find the best flight deals from ${originName} (${origin}) to ${destinationName} (${destination}). Compare prices from 500+ airlines, track price alerts, and book with confidence. Save up to 40% on flights to ${destinationName}.`,
    keywords: [
      `${origin} to ${destination} flights`,
      `flights from ${originName} to ${destinationName}`,
      `cheap ${origin} ${destination} flights`,
      `${origin}-${destination} airfare`,
      `best time to fly ${origin} to ${destination}`,
      `${destinationName} flights from ${originName}`,
      `book ${origin} to ${destination}`,
      `${origin} ${destination} flight deals`,
    ],
    canonical: `${SITE_URL}/flights/${params.route}`,
    ogType: 'website',
  });
}

// Generate static params for most popular routes (pre-render top routes)
export async function generateStaticParams(): Promise<RouteParams[]> {
  // Pre-render top 100 routes at build time
  // The rest will be generated on-demand (ISR)
  const topRoutes = [
    'jfk-to-lax', 'lax-to-jfk', 'ord-to-mia', 'atl-to-las', 'dfw-to-sfo',
    'jfk-to-lhr', 'lax-to-nrt', 'ord-to-cdg', 'sfo-to-hkg', 'mia-to-bcn',
    'ewr-to-fra', 'bos-to-lhr', 'lax-to-sin', 'jfk-to-cdg', 'sfo-to-nrt',
    'dfw-to-lhr', 'ord-to-nrt', 'iah-to-lhr', 'atl-to-cdg', 'den-to-lhr',
  ];

  return topRoutes.map(route => ({ route }));
}

// Enable ISR: revalidate every 6 hours
export const revalidate = 21600; // 6 hours in seconds

// CRITICAL: Allow dynamic params for routes not in generateStaticParams
// Without this, routes not pre-rendered will 404
export const dynamicParams = true;

// Route pricing data interface
interface RoutePricing {
  hasInventory: boolean;
  minPrice: number | null;
  avgPrice: number | null;
  currency: string;
  airlines: string[];
  flightDuration: string | null;
  lastUpdated: Date | null;
}

// Check if route has real pricing data (cache/API)
// Returns null if no data available - prevents soft 404
async function getRoutePricing(origin: string, destination: string): Promise<RoutePricing> {
  // Popular routes that typically have inventory (simulated)
  // In production: Replace with actual cache/API lookup
  const popularRoutes = [
    'JFK-LAX', 'LAX-JFK', 'ORD-MIA', 'ATL-LAS', 'DFW-SFO',
    'JFK-LHR', 'LAX-NRT', 'ORD-CDG', 'SFO-HKG', 'MIA-BCN',
    'EWR-FRA', 'BOS-LHR', 'LAX-SIN', 'JFK-CDG', 'SFO-NRT',
    'DFW-LHR', 'ORD-NRT', 'IAH-LHR', 'ATL-CDG', 'DEN-LHR',
    'JFK-MIA', 'LAX-SEA', 'ORD-DEN', 'ATL-ORD', 'DFW-LAX',
    'SFO-LAX', 'BOS-JFK', 'SEA-LAX', 'PHX-DEN', 'MCO-ATL',
  ];

  const routeKey = `${origin}-${destination}`;
  const hasInventory = popularRoutes.includes(routeKey);

  if (hasInventory) {
    // Simulate real pricing data for popular routes
    const basePrices: Record<string, number> = {
      'JFK-LAX': 189, 'LAX-JFK': 199, 'ORD-MIA': 149, 'JFK-LHR': 449,
      'LAX-NRT': 699, 'SFO-HKG': 799, 'JFK-CDG': 499, 'BOS-LHR': 429,
    };
    const basePrice = basePrices[routeKey] || Math.floor(Math.random() * 300) + 150;

    return {
      hasInventory: true,
      minPrice: basePrice,
      avgPrice: Math.floor(basePrice * 1.3),
      currency: 'USD',
      airlines: ['AA', 'UA', 'DL', 'WN'].slice(0, Math.floor(Math.random() * 3) + 2),
      flightDuration: `${Math.floor(Math.random() * 5) + 2}h ${Math.floor(Math.random() * 50) + 10}m`,
      lastUpdated: new Date(),
    };
  }

  // No inventory found - will show NoFlightsAvailable
  return {
    hasInventory: false,
    minPrice: null,
    avgPrice: null,
    currency: 'USD',
    airlines: [],
    flightDuration: null,
    lastUpdated: null,
  };
}

export default async function FlightRoutePage({ params }: { params: RouteParams }) {
  const parsed = parseRouteSlug(params.route);

  if (!parsed) {
    notFound();
  }

  const { origin, destination } = parsed;
  const originName = getLocationName(origin);
  const destinationName = getLocationName(destination);

  // Fetch real pricing data - prevents soft 404
  const pricing = await getRoutePricing(origin, destination);

  // Generate FAQs (always included for SEO value)
  const routeFAQs = generateRouteFAQs({
    origin,
    originName,
    destination,
    destinationName,
    flightDuration: pricing.flightDuration || '3-6 hours',
  });

  // Build route data for entity schema
  const routeData: RouteData = {
    origin,
    originName,
    destination,
    destinationName,
    hasInventory: pricing.hasInventory,
    ...(pricing.hasInventory && pricing.minPrice && {
      pricing: {
        minPrice: pricing.minPrice,
        avgPrice: pricing.avgPrice!,
        currency: pricing.currency,
      },
      airlines: pricing.airlines,
      flightDuration: pricing.flightDuration || undefined,
    }),
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Flights', url: `${SITE_URL}/flights` },
    { name: `${origin} to ${destination}`, url: `${SITE_URL}/flights/${params.route}` },
  ];

  // Generate complete schema graph using entity system
  // CONDITIONAL: Offer schema only included when hasInventory=true
  const schemas = getRoutePageSchemaGraph(routeData, breadcrumbItems, routeFAQs);

  // NO INVENTORY: Show alternative content (prevents soft 404)
  if (!pricing.hasInventory) {
    return (
      <>
        <StructuredData schema={schemas} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          {/* Hero Section - Simplified */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
            <div className="container mx-auto px-4">
              <nav className="text-sm mb-6 opacity-90">
                <a href="/" className="hover:underline">Home</a>
                {' > '}
                <a href="/flights" className="hover:underline">Flights</a>
                {' > '}
                <span>{origin} to {destination}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Flights from {originName} to {destinationName}
              </h1>
            </div>
          </section>

          {/* No Flights Available Component */}
          <section className="container mx-auto px-4 py-8">
            <NoFlightsAvailable
              origin={origin}
              destination={destination}
              originName={originName}
              destinationName={destinationName}
            />
          </section>

          {/* FAQ Section - Still valuable for SEO */}
          <section className="container mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                FAQs - {origin} to {destination} Flights
              </h2>
              <div className="space-y-4">
                {routeFAQs.slice(0, 5).map((faq, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  // HAS INVENTORY: Show full content with pricing
  const averagePrice = pricing.avgPrice!;
  const flightDuration = pricing.flightDuration!;

  return (
    <>
      {/* Structured Data - Offer schema only when pricing available */}
      <StructuredData schema={schemas} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="container mx-auto px-4">
            <nav className="text-sm mb-6 opacity-90">
              <a href="/" className="hover:underline">Home</a>
              {' > '}
              <a href="/flights" className="hover:underline">Flights</a>
              {' > '}
              <span>{origin} to {destination}</span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Flights from {originName} to {destinationName}
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Compare prices from 500+ airlines and find the best deals on flights from {origin} to {destination}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">${averagePrice}+</div>
                <div className="text-blue-100">Average Price</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{flightDuration}</div>
                <div className="text-blue-100">Flight Time</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">Daily</div>
                <div className="text-blue-100">Flight Frequency</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Widget */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 -mt-16 relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Search Flights from {origin} to {destination}
            </h2>
            <p className="text-gray-600 mb-6">
              Use our search tool below to find and compare the best flight options for your trip.
            </p>
            {/* TODO: Integrate actual search widget - preserve existing UI */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
              <p className="text-blue-700 font-semibold">🔍 Search Widget Integration Point</p>
              <p className="text-sm text-blue-600 mt-2">
                Your existing search bar component will be integrated here
              </p>
              <a
                href={`/flights/results?origin=${origin}&destination=${destination}`}
                className="inline-block mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Search {origin} to {destination} Flights →
              </a>
            </div>
          </div>
        </section>

        {/* About This Route */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              About Flights from {originName} to {destinationName}
            </h2>

            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                Looking for cheap flights from <strong>{originName} ({origin})</strong> to <strong>{destinationName} ({destination})</strong>?
                You've come to the right place. Fly2Any compares prices from over 500 airlines to help you find the best deals on this popular route.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Flight Information</h3>
              <p>
                Direct flights from {origin} to {destination} typically take around {flightDuration}, covering approximately XXX miles.
                Multiple airlines operate this route daily, offering both non-stop and connecting flight options.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Best Time to Book</h3>
              <p>
                For the best prices on {origin} to {destination} flights, we recommend booking 2-3 months in advance.
                Prices tend to be lowest for mid-week departures (Tuesday and Wednesday). Use our Price Calendar feature
                to compare prices across different dates and find the cheapest options.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Airlines on This Route</h3>
              <p>
                Several major airlines serve the {originName} to {destinationName} route, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                {MAJOR_AIRLINES.slice(0, 6).map(airline => (
                  <li key={airline.code}>
                    <strong>{airline.name} ({airline.code})</strong> - Multiple daily flights
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section - Dynamically Generated */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions - {origin} to {destination} Flights
            </h2>

            <div className="space-y-6">
              {routeFAQs.slice(0, 8).map((faq, idx) => (
                <div
                  key={idx}
                  className={idx < routeFAQs.length - 1 ? 'border-b border-gray-200 pb-6' : 'pb-6'}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <h3
                    className="text-xl font-semibold text-gray-900 mb-2 faq-question"
                    itemProp="name"
                  >
                    {faq.question}
                  </h3>
                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p className="text-gray-700 faq-answer" itemProp="text">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Routes */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Related Flight Routes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href={`/flights/${destination.toLowerCase()}-to-${origin.toLowerCase()}`}
                 className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {destination} → {origin}
                </h3>
                <p className="text-sm text-gray-600">Return flights</p>
              </a>
            </div>

            {/* Helpful Resources */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <RelatedLinks
                category="route"
                variant="horizontal"
                title="Helpful Travel Resources"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Book Your Flight?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Search now and compare prices from 500+ airlines
            </p>
            <a
              href={`/flights/results?origin=${origin}&destination=${destination}`}
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
            >
              Find Flights {origin} → {destination}
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
