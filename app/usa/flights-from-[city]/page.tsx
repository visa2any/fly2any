/**
 * US MARKET SEO: FLIGHTS FROM [CITY] PAGES
 *
 * Auto-generates SEO-optimized landing pages targeting US travelers
 * Example URLs:
 * - /usa/flights-from-new-york
 * - /usa/flights-from-los-angeles
 * - /usa/flights-from-miami
 *
 * AI Search Optimized: Clear factual summaries for SGE, ChatGPT, Perplexity
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plane, TrendingDown, Clock, Calendar, MapPin, Star, ArrowRight } from 'lucide-react';
import { generateMetadata as genMeta, getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { TOP_US_CITIES, TOP_INTERNATIONAL_CITIES } from '@/lib/seo/sitemap-helpers';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

type CityParams = { city: string };

// US Cities data for SEO
const US_CITIES_DATA: Record<string, { name: string; state: string; airports: string[]; hub: boolean }> = {
  'new-york': { name: 'New York', state: 'NY', airports: ['JFK', 'LGA', 'EWR'], hub: true },
  'los-angeles': { name: 'Los Angeles', state: 'CA', airports: ['LAX'], hub: true },
  'chicago': { name: 'Chicago', state: 'IL', airports: ['ORD', 'MDW'], hub: true },
  'houston': { name: 'Houston', state: 'TX', airports: ['IAH', 'HOU'], hub: true },
  'miami': { name: 'Miami', state: 'FL', airports: ['MIA', 'FLL'], hub: true },
  'dallas': { name: 'Dallas', state: 'TX', airports: ['DFW', 'DAL'], hub: true },
  'san-francisco': { name: 'San Francisco', state: 'CA', airports: ['SFO', 'OAK', 'SJC'], hub: true },
  'atlanta': { name: 'Atlanta', state: 'GA', airports: ['ATL'], hub: true },
  'denver': { name: 'Denver', state: 'CO', airports: ['DEN'], hub: true },
  'seattle': { name: 'Seattle', state: 'WA', airports: ['SEA'], hub: true },
  'boston': { name: 'Boston', state: 'MA', airports: ['BOS'], hub: true },
  'phoenix': { name: 'Phoenix', state: 'AZ', airports: ['PHX'], hub: false },
  'las-vegas': { name: 'Las Vegas', state: 'NV', airports: ['LAS'], hub: false },
  'orlando': { name: 'Orlando', state: 'FL', airports: ['MCO'], hub: false },
  'washington-dc': { name: 'Washington D.C.', state: 'DC', airports: ['DCA', 'IAD', 'BWI'], hub: true },
  'philadelphia': { name: 'Philadelphia', state: 'PA', airports: ['PHL'], hub: true },
  'san-diego': { name: 'San Diego', state: 'CA', airports: ['SAN'], hub: false },
  'austin': { name: 'Austin', state: 'TX', airports: ['AUS'], hub: false },
  'nashville': { name: 'Nashville', state: 'TN', airports: ['BNA'], hub: false },
  'detroit': { name: 'Detroit', state: 'MI', airports: ['DTW'], hub: true },
};

// Popular international destinations from US
const TOP_INTL_DESTINATIONS = [
  { city: 'London', code: 'LHR', country: 'UK', avgPrice: 450 },
  { city: 'Paris', code: 'CDG', country: 'France', avgPrice: 520 },
  { city: 'Cancun', code: 'CUN', country: 'Mexico', avgPrice: 280 },
  { city: 'Tokyo', code: 'NRT', country: 'Japan', avgPrice: 850 },
  { city: 'Rome', code: 'FCO', country: 'Italy', avgPrice: 580 },
  { city: 'Barcelona', code: 'BCN', country: 'Spain', avgPrice: 490 },
];

// Get city data from slug
function getCityData(slug: string) {
  if (!slug) return null;
  return US_CITIES_DATA[slug.toLowerCase()] || null;
}

// Generate metadata
export async function generateMetadata({ params }: { params: CityParams }): Promise<Metadata> {
  const city = getCityData(params.city);

  if (!city) {
    return genMeta({
      title: 'City Not Found',
      description: 'The city you are looking for could not be found.',
      noindex: true,
    });
  }

  const year = new Date().getFullYear();

  return genMeta({
    title: `Cheap Flights from ${city.name}, ${city.state} ${year} - Compare 500+ Airlines`,
    description: `Find the best flight deals departing from ${city.name} (${city.airports.join('/')}) in ${year}. Compare prices from 500+ airlines, get price alerts, and save up to 40% on flights from ${city.name}.`,
    keywords: [
      `flights from ${city.name}`,
      `${city.name} airport flights`,
      `cheap flights ${city.airports[0]}`,
      `${city.name} flight deals`,
      `flights departing ${city.name}`,
      `${city.state} flight search`,
      `best flight prices ${city.name}`,
    ],
    canonical: `${SITE_URL}/usa/flights-from-${params.city}`,
    ogType: 'website',
  });
}

// Generate static params for all US cities
export async function generateStaticParams(): Promise<CityParams[]> {
  return Object.keys(US_CITIES_DATA).map(city => ({ city }));
}

// ISR: Revalidate every 6 hours
export const revalidate = 21600;

export default async function FlightsFromCityPage({ params }: { params: CityParams }) {
  const city = getCityData(params.city);

  if (!city) {
    notFound();
  }

  const year = new Date().getFullYear();
  const primaryAirport = city.airports[0];

  // Structured data schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'USA Flights', url: `${SITE_URL}/usa` },
    { name: `Flights from ${city.name}`, url: `${SITE_URL}/usa/flights-from-${params.city}` },
  ]);

  const faqSchema = getFAQSchema([
    {
      question: `What airlines fly from ${city.name}?`,
      answer: `Major airlines operating from ${city.airports.join('/')} include American Airlines, Delta, United, Southwest, JetBlue, and Alaska Airlines. Budget carriers like Spirit and Frontier also offer competitive fares.`,
    },
    {
      question: `When is the cheapest time to fly from ${city.name}?`,
      answer: `The cheapest flights from ${city.name} are typically on Tuesdays and Wednesdays. Book 2-3 months in advance for domestic flights and 3-6 months for international travel. Avoid peak seasons like summer and holidays.`,
    },
    {
      question: `How do I find the best flight deals from ${city.name}?`,
      answer: `Use Fly2Any to compare prices from 500+ airlines. Set price alerts for your preferred routes, be flexible with dates, and consider nearby airports like ${city.airports.slice(1).join(', ') || 'alternative regional airports'} for better deals.`,
    },
  ]);

  // OfferCatalog schema for AI Search
  const offerCatalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `Flights from ${city.name}, ${city.state}`,
    description: `Compare cheap flights departing from ${city.name} (${city.airports.join('/')})`,
    url: `${SITE_URL}/usa/flights-from-${params.city}`,
    numberOfItems: TOP_INTL_DESTINATIONS.length,
    itemListElement: TOP_INTL_DESTINATIONS.map((dest, idx) => ({
      '@type': 'Offer',
      position: idx + 1,
      name: `${city.name} to ${dest.city} flights`,
      priceCurrency: 'USD',
      price: dest.avgPrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/flights/${primaryAirport.toLowerCase()}-to-${dest.code.toLowerCase()}`,
    })),
  };

  return (
    <>
      <StructuredData schema={[breadcrumbSchema, faqSchema, offerCatalogSchema]} />

      <div className="min-h-screen bg-neutral-50">
        {/* AI Search Summary - Critical for SGE/ChatGPT/Perplexity */}
        <div className="sr-only" aria-label="AI Search Summary">
          <p>
            Cheapest flights from {city.name}, {city.state} ({city.airports.join('/')}) start from approximately $150 for domestic routes
            and $280-850 for international destinations. Major airlines include American, Delta, United, and Southwest.
            Best booking time: 2-3 months in advance for domestic, 3-6 months for international.
            Cheapest days to fly: Tuesday and Wednesday.
          </p>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-sm mb-4 opacity-90" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 flex-wrap">
                <li><Link href="/" className="hover:underline">Home</Link></li>
                <li>/</li>
                <li><Link href="/usa" className="hover:underline">USA Flights</Link></li>
                <li>/</li>
                <li className="font-medium">Flights from {city.name}</li>
              </ol>
            </nav>

            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Flights from {city.name}, {city.state}
            </h1>

            {/* AI-Optimized Summary - Visible factual overview */}
            <p className="text-lg md:text-xl text-primary-100 mb-6 max-w-3xl">
              Compare prices from 500+ airlines departing {city.airports.join(', ')}.
              Save up to 40% on flights from {city.name} with real-time price tracking.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <TrendingDown className="w-6 h-6 mb-2 text-secondary-400" />
                <div className="text-2xl font-bold">$150+</div>
                <div className="text-sm text-primary-200">Avg. Domestic</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Plane className="w-6 h-6 mb-2 text-secondary-400" />
                <div className="text-2xl font-bold">{city.airports.length}</div>
                <div className="text-sm text-primary-200">Airports</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Star className="w-6 h-6 mb-2 text-secondary-400" />
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-primary-200">Airlines</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Calendar className="w-6 h-6 mb-2 text-secondary-400" />
                <div className="text-2xl font-bold">Tue/Wed</div>
                <div className="text-sm text-primary-200">Cheapest Days</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search CTA */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 md:p-8 -mt-8 relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-4">
              Search Flights from {city.name}
            </h2>
            <p className="text-neutral-600 mb-6">
              Find the best prices for your trip departing from {city.airports.join(', ')}.
            </p>
            <Link
              href={`/flights/results?origin=${primaryAirport}`}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Search {primaryAirport} Flights <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-6">
            Popular Destinations from {city.name}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOP_INTL_DESTINATIONS.map((dest) => (
              <Link
                key={dest.code}
                href={`/flights/${primaryAirport.toLowerCase()}-to-${dest.code.toLowerCase()}`}
                className="bg-white rounded-xl p-5 shadow-soft hover:shadow-soft-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
                        {dest.city}
                      </h3>
                      <p className="text-sm text-neutral-500">{dest.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">${dest.avgPrice}+</div>
                    <div className="text-xs text-neutral-500">round-trip</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-neutral-600">
                  <span>{primaryAirport} → {dest.code}</span>
                  <span className="text-primary-600 font-medium group-hover:underline">View deals →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Airports Info */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6">
              Airports Serving {city.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {city.airports.map((airport) => (
                <div key={airport} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <Plane className="w-4 h-4 text-neutral-600" />
                    </div>
                    <span className="font-bold text-lg text-neutral-800">{airport}</span>
                  </div>
                  <Link
                    href={`/flights/results?origin=${airport}`}
                    className="text-primary-600 text-sm font-medium hover:underline"
                  >
                    Search {airport} flights →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="border-b border-neutral-200 pb-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  What airlines fly from {city.name}?
                </h3>
                <p className="text-neutral-600">
                  Major airlines operating from {city.airports.join('/')} include American Airlines, Delta, United,
                  Southwest, JetBlue, and Alaska Airlines. Budget carriers like Spirit and Frontier also offer competitive fares.
                </p>
              </div>
              <div className="border-b border-neutral-200 pb-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  When is the cheapest time to fly from {city.name}?
                </h3>
                <p className="text-neutral-600">
                  The cheapest flights from {city.name} are typically on Tuesdays and Wednesdays.
                  Book 2-3 months in advance for domestic flights and 3-6 months for international travel.
                </p>
              </div>
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  How do I find the best flight deals from {city.name}?
                </h3>
                <p className="text-neutral-600">
                  Use Fly2Any to compare prices from 500+ airlines. Set price alerts for your preferred routes,
                  be flexible with dates, and consider nearby airports for better deals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Book Your Flight?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Search now and compare prices from 500+ airlines departing {city.name}
            </p>
            <Link
              href={`/flights/results?origin=${primaryAirport}`}
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-neutral-50 transition-colors shadow-lg"
            >
              Find Flights from {city.name} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
