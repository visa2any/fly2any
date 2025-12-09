/**
 * USA FLIGHTS HUB - SEO LANDING PAGE
 *
 * Main hub for all US-based flight searches
 * Targets "flights from USA", "US flight deals" keywords
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Plane, MapPin, TrendingDown, Star, ArrowRight } from 'lucide-react';
import { generateMetadata as genMeta, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export const metadata: Metadata = genMeta({
  title: 'Cheap Flights from USA 2025 - Compare 500+ Airlines',
  description: 'Find the best flight deals departing from US cities. Compare prices from 500+ airlines, get price alerts, and save up to 40% on domestic and international flights from the United States.',
  keywords: [
    'flights from USA',
    'US flight deals',
    'cheap flights USA',
    'domestic flights USA',
    'international flights from USA',
    'American flight search',
    'US airline tickets',
  ],
  canonical: `${SITE_URL}/usa`,
});

// Major US cities for hub page
const US_CITIES = [
  { slug: 'new-york', name: 'New York', state: 'NY', airports: ['JFK', 'LGA', 'EWR'], domestic: 150, intl: 450 },
  { slug: 'los-angeles', name: 'Los Angeles', state: 'CA', airports: ['LAX'], domestic: 120, intl: 550 },
  { slug: 'chicago', name: 'Chicago', state: 'IL', airports: ['ORD', 'MDW'], domestic: 130, intl: 500 },
  { slug: 'miami', name: 'Miami', state: 'FL', airports: ['MIA', 'FLL'], domestic: 140, intl: 350 },
  { slug: 'san-francisco', name: 'San Francisco', state: 'CA', airports: ['SFO'], domestic: 135, intl: 600 },
  { slug: 'dallas', name: 'Dallas', state: 'TX', airports: ['DFW', 'DAL'], domestic: 125, intl: 520 },
  { slug: 'atlanta', name: 'Atlanta', state: 'GA', airports: ['ATL'], domestic: 110, intl: 480 },
  { slug: 'denver', name: 'Denver', state: 'CO', airports: ['DEN'], domestic: 115, intl: 560 },
  { slug: 'seattle', name: 'Seattle', state: 'WA', airports: ['SEA'], domestic: 140, intl: 580 },
  { slug: 'boston', name: 'Boston', state: 'MA', airports: ['BOS'], domestic: 145, intl: 420 },
  { slug: 'las-vegas', name: 'Las Vegas', state: 'NV', airports: ['LAS'], domestic: 100, intl: 450 },
  { slug: 'orlando', name: 'Orlando', state: 'FL', airports: ['MCO'], domestic: 120, intl: 380 },
  { slug: 'phoenix', name: 'Phoenix', state: 'AZ', airports: ['PHX'], domestic: 115, intl: 520 },
  { slug: 'washington-dc', name: 'Washington D.C.', state: 'DC', airports: ['DCA', 'IAD'], domestic: 140, intl: 460 },
  { slug: 'houston', name: 'Houston', state: 'TX', airports: ['IAH', 'HOU'], domestic: 125, intl: 490 },
  { slug: 'philadelphia', name: 'Philadelphia', state: 'PA', airports: ['PHL'], domestic: 130, intl: 440 },
];

export default function USAFlightsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'USA Flights', url: `${SITE_URL}/usa` },
  ]);

  // ItemList schema for AI Search
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Flights from USA Major Cities',
    description: 'Compare cheap flights departing from major US cities',
    numberOfItems: US_CITIES.length,
    itemListElement: US_CITIES.map((city, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Flights from ${city.name}, ${city.state}`,
      url: `${SITE_URL}/usa/flights-from-${city.slug}`,
    })),
  };

  return (
    <>
      <StructuredData schema={[breadcrumbSchema, itemListSchema]} />

      {/* AI Search Summary */}
      <div className="sr-only" aria-label="AI Search Summary">
        <p>
          Compare cheap flights from USA major cities including New York (JFK/LGA/EWR), Los Angeles (LAX),
          Chicago (ORD), Miami (MIA), and 12+ other hubs. Domestic flights from $100, international from $350.
          500+ airlines compared. Best booking: 2-3 months advance for domestic, 3-6 months for international.
        </p>
      </div>

      <div className="min-h-screen bg-neutral-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <nav className="text-sm mb-4 opacity-90">
              <ol className="flex items-center gap-2">
                <li><Link href="/" className="hover:underline">Home</Link></li>
                <li>/</li>
                <li className="font-medium">USA Flights</li>
              </ol>
            </nav>

            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Cheap Flights from USA
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-3xl">
              Compare prices from 500+ airlines across all major US airports.
              Save up to 40% on domestic and international flights.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <TrendingDown className="w-6 h-6 mb-2 text-secondary-400" />
                <div className="text-2xl font-bold">$100+</div>
                <div className="text-sm text-primary-200">Domestic</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Plane className="w-6 h-6 mb-2 text-secondary-400" />
                <div className="text-2xl font-bold">$350+</div>
                <div className="text-sm text-primary-200">International</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <MapPin className="w-6 h-6 mb-2 text-secondary-400" />
                <div className="text-2xl font-bold">16+</div>
                <div className="text-sm text-primary-200">Major Hubs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Star className="w-6 h-6 mb-2 text-secondary-400" />
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-primary-200">Airlines</div>
              </div>
            </div>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-8">
            Find Flights from Major US Cities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {US_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/usa/flights-from-${city.slug}`}
                className="bg-white rounded-xl p-5 shadow-soft hover:shadow-soft-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-xs text-neutral-500">{city.airports.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-neutral-500">From </span>
                    <span className="font-bold text-primary-600">${city.domestic}</span>
                  </div>
                  <span className="text-primary-600 font-medium group-hover:underline flex items-center gap-1">
                    View <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6">
              Finding Cheap Flights from the USA
            </h2>
            <div className="prose max-w-none text-neutral-700 space-y-4">
              <p>
                The United States has an extensive network of airports serving domestic and international destinations.
                Major hubs like New York (JFK, LGA, EWR), Los Angeles (LAX), Chicago (ORD), and Atlanta (ATL)
                offer the most flight options and often competitive prices due to high airline competition.
              </p>
              <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">Tips for Finding the Best Deals</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Book domestic flights 2-3 months in advance, international flights 3-6 months ahead</li>
                <li>Tuesday and Wednesday departures are typically 15-20% cheaper</li>
                <li>Consider nearby airports (e.g., Newark instead of JFK) for better prices</li>
                <li>Use Fly2Any price alerts to track fare drops on your preferred routes</li>
                <li>Be flexible with dates - even shifting by 1-2 days can save hundreds</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Explore?
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Search flights from any US city and compare prices from 500+ airlines
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-neutral-50 transition-colors shadow-lg"
            >
              Start Your Search <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
