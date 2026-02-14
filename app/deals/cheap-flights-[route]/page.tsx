/**
 * DEALS SEO: Cheap Flights Route Pages
 *
 * URLs: /deals/cheap-flights-new-york-to-miami
 * Targets: "cheap flights [origin] to [destination]" searches
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plane, TrendingDown, Clock, Calendar, Bell, ArrowRight, Zap } from 'lucide-react';
import { generateMetadata as genMeta, getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

type RouteParams = { route: string };

// Popular routes with deal data
const DEAL_ROUTES: Record<string, { origin: string; originName: string; destination: string; destName: string; lowestPrice: number; avgPrice: number; savings: number; duration: string }> = {
  'new-york-to-miami': { origin: 'JFK', originName: 'New York', destination: 'MIA', destName: 'Miami', lowestPrice: 89, avgPrice: 180, savings: 50, duration: '3h 15m' },
  'los-angeles-to-las-vegas': { origin: 'LAX', originName: 'Los Angeles', destination: 'LAS', destName: 'Las Vegas', lowestPrice: 49, avgPrice: 120, savings: 60, duration: '1h 10m' },
  'chicago-to-new-york': { origin: 'ORD', originName: 'Chicago', destination: 'JFK', destName: 'New York', lowestPrice: 79, avgPrice: 160, savings: 50, duration: '2h 30m' },
  'new-york-to-london': { origin: 'JFK', originName: 'New York', destination: 'LHR', destName: 'London', lowestPrice: 349, avgPrice: 650, savings: 46, duration: '7h 30m' },
  'miami-to-cancun': { origin: 'MIA', originName: 'Miami', destination: 'CUN', destName: 'Cancun', lowestPrice: 129, avgPrice: 280, savings: 54, duration: '1h 45m' },
  'san-francisco-to-los-angeles': { origin: 'SFO', originName: 'San Francisco', destination: 'LAX', destName: 'Los Angeles', lowestPrice: 59, avgPrice: 140, savings: 58, duration: '1h 25m' },
  'boston-to-miami': { origin: 'BOS', originName: 'Boston', destination: 'MIA', destName: 'Miami', lowestPrice: 99, avgPrice: 200, savings: 50, duration: '3h 30m' },
  'dallas-to-denver': { origin: 'DFW', originName: 'Dallas', destination: 'DEN', destName: 'Denver', lowestPrice: 69, avgPrice: 150, savings: 54, duration: '2h 15m' },
  'atlanta-to-orlando': { origin: 'ATL', originName: 'Atlanta', destination: 'MCO', destName: 'Orlando', lowestPrice: 59, avgPrice: 130, savings: 55, duration: '1h 30m' },
  'seattle-to-phoenix': { origin: 'SEA', originName: 'Seattle', destination: 'PHX', destName: 'Phoenix', lowestPrice: 89, avgPrice: 180, savings: 50, duration: '3h' },
};

function getRouteData(slug: string) {
  if (!slug) return null;
  return DEAL_ROUTES[slug.toLowerCase()] || null;
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const route = getRouteData(params.route);
  if (!route) {
    return genMeta({ title: 'Deal Not Found', description: 'Flight deal not found.', noindex: true });
  }
  const year = new Date().getFullYear();
  return genMeta({
    title: `Cheap Flights ${route.originName} to ${route.destName} from $${route.lowestPrice} - ${year} Deals`,
    description: `Find cheap flights from ${route.originName} to ${route.destName} starting at $${route.lowestPrice}. Save up to ${route.savings}% on ${route.origin}-${route.destination} flights. Compare 500+ airlines.`,
    keywords: [`cheap flights ${route.originName} to ${route.destName}`, `${route.origin} to ${route.destination} deals`, `low cost ${route.originName} ${route.destName} flights`],
    canonical: `${SITE_URL}/deals/cheap-flights-${params.route}`,
  });
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  return Object.keys(DEAL_ROUTES).map(route => ({ route }));
}

export const revalidate = 3600; // 1 hour

export default async function CheapFlightsRoutePage({ params }: { params: RouteParams }) {
  const route = getRouteData(params.route);
  if (!route) notFound();

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Deals', url: `${SITE_URL}/deals` },
    { name: `${route.originName} to ${route.destName}`, url: `${SITE_URL}/deals/cheap-flights-${params.route}` },
  ]);

  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: `Cheap flights from ${route.originName} to ${route.destName}`,
    description: `Flight deals from ${route.origin} to ${route.destination}`,
    price: route.lowestPrice,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    validFrom: new Date().toISOString(),
    url: `${SITE_URL}/deals/cheap-flights-${params.route}`,
  };

  return (
    <>
      <StructuredData schema={[breadcrumbSchema, offerSchema]} />

      {/* AI Search Summary */}
      <div className="sr-only">
        <p>Cheapest flights from {route.originName} ({route.origin}) to {route.destName} ({route.destination}) cost ${route.lowestPrice} one-way. Average price: ${route.avgPrice}. Flight time: {route.duration}. Save up to {route.savings}%.</p>
      </div>

      <div className="min-h-screen bg-neutral-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-10 md:py-14">
          <div className="container mx-auto px-4">
            <nav className="text-sm mb-3 opacity-90">
              <Link href="/" className="hover:underline">Home</Link> / <Link href="/deals" className="hover:underline">Deals</Link> / <span className="font-medium">{route.originName} to {route.destName}</span>
            </nav>

            <div className="flex items-center gap-2 mb-3">
              <span className="bg-secondary-500 text-neutral-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Zap className="w-4 h-4" /> HOT DEAL
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Save {route.savings}%</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              Cheap Flights {route.originName} to {route.destName}
            </h1>
            <p className="text-lg text-primary-100 mb-6">
              From <span className="text-3xl font-bold text-white">${route.lowestPrice}</span> one-way • {route.duration} flight time
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <TrendingDown className="w-5 h-5 mb-1 text-secondary-400" />
                <div className="text-xl font-bold">${route.lowestPrice}</div>
                <div className="text-xs text-primary-200">Lowest Price</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Clock className="w-5 h-5 mb-1 text-secondary-400" />
                <div className="text-xl font-bold">{route.duration}</div>
                <div className="text-xs text-primary-200">Direct Flight</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Calendar className="w-5 h-5 mb-1 text-secondary-400" />
                <div className="text-xl font-bold">Tue/Wed</div>
                <div className="text-xs text-primary-200">Cheapest Days</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Plane className="w-5 h-5 mb-1 text-secondary-400" />
                <div className="text-xl font-bold">500+</div>
                <div className="text-xs text-primary-200">Airlines</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 -mt-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-800">Search {route.origin} → {route.destination} Flights</h2>
                <p className="text-neutral-600 text-sm">Compare prices and find the best deals</p>
              </div>
              <Link
                href={`/flights/results?origin=${route.origin}&destination=${route.destination}`}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Search Flights <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Price Alert */}
        <section className="container mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-800">Get Price Drop Alerts</h3>
              <p className="text-sm text-neutral-600">We'll notify you when prices drop for {route.originName} to {route.destName} flights</p>
            </div>
            <Link href={`/flights/results?origin=${route.origin}&destination=${route.destination}&alerts=1`} className="text-primary-600 font-semibold text-sm hover:underline whitespace-nowrap">
              Set Alert →
            </Link>
          </div>
        </section>

        {/* SEO Content */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Finding Cheap Flights from {route.originName} to {route.destName}</h2>
            <div className="prose max-w-none text-neutral-700 space-y-4">
              <p>Looking for the best deals on flights from {route.originName} ({route.origin}) to {route.destName} ({route.destination})? Fly2Any compares prices from 500+ airlines to help you find cheap flights starting at just ${route.lowestPrice}.</p>
              <h3 className="text-lg font-semibold text-neutral-800 mt-6 mb-2">Tips for Cheaper Flights</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Book 3-4 weeks ahead for best domestic prices</li>
                <li>Fly on Tuesday or Wednesday for savings up to 30%</li>
                <li>Set price alerts to catch sudden drops</li>
                <li>Be flexible with dates - even 1 day shift saves money</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related Deals */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Related Flight Deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(DEAL_ROUTES).filter(([k]) => k !== params.route).slice(0, 6).map(([slug, r]) => (
              <Link key={slug} href={`/deals/cheap-flights-${slug}`} className="bg-white rounded-xl p-4 shadow-soft hover:shadow-soft-md transition-shadow group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-neutral-800 group-hover:text-primary-600">{r.originName} → {r.destName}</span>
                  <span className="text-primary-600 font-bold">${r.lowestPrice}</span>
                </div>
                <div className="text-xs text-neutral-500">{r.duration} • Save {r.savings}%</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
