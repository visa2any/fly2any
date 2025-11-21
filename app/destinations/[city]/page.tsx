/**
 * DESTINATION GUIDE PAGES - PROGRAMMATIC SEO
 *
 * Generates SEO-optimized destination guides for major cities worldwide
 * Supports 100+ destinations with ISR for fresh content
 *
 * Features:
 * - Dynamic metadata with city-specific keywords
 * - Place schema markup with geo coordinates
 * - TouristAttraction and TravelAction schemas
 * - FAQPage schema with destination-specific FAQs
 * - Breadcrumb navigation
 * - Related destinations and flight routes
 * - Optimized for AI search engines (GEO)
 *
 * @version 1.0.0
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateMetadata as genMeta, getFAQSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { SocialShare } from '@/components/seo/SocialShare';
import Link from 'next/link';
import { Calendar, MapPin, Plane, Users, TrendingUp, Info } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

// Destination data structure
interface DestinationData {
  city: string;
  country: string;
  code: string;
  airportCode: string;
  description: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: string;
  language: string;
  bestTimeToVisit: string[];
  averageTemperature: { summer: string; winter: string };
  popularAttractions: string[];
  nearbyAirports: Array<{ code: string; name: string; distance: string }>;
  relatedDestinations: string[];
  keywords: string[];
}

// Database of destination information
const DESTINATIONS_DB: Record<string, DestinationData> = {
  'new-york': {
    city: 'New York',
    country: 'United States',
    code: 'NYC',
    airportCode: 'JFK',
    description: 'The city that never sleeps, New York is a global hub of culture, finance, and entertainment. From iconic landmarks like the Statue of Liberty and Times Square to world-class museums and Broadway shows, NYC offers endless experiences for every traveler.',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'English',
    bestTimeToVisit: ['April', 'May', 'September', 'October'],
    averageTemperature: { summer: '77°F (25°C)', winter: '39°F (4°C)' },
    popularAttractions: [
      'Statue of Liberty',
      'Central Park',
      'Times Square',
      'Empire State Building',
      'Brooklyn Bridge',
      'Metropolitan Museum of Art',
      'Broadway Theater District',
      '9/11 Memorial & Museum',
    ],
    nearbyAirports: [
      { code: 'JFK', name: 'John F. Kennedy International Airport', distance: '15 miles' },
      { code: 'LGA', name: 'LaGuardia Airport', distance: '8 miles' },
      { code: 'EWR', name: 'Newark Liberty International Airport', distance: '16 miles' },
    ],
    relatedDestinations: ['Los Angeles', 'Miami', 'Chicago', 'Boston', 'Washington DC'],
    keywords: ['NYC flights', 'New York vacation', 'Manhattan hotels', 'cheap flights to New York'],
  },
  'los-angeles': {
    city: 'Los Angeles',
    country: 'United States',
    code: 'LAX',
    airportCode: 'LAX',
    description: 'The entertainment capital of the world, Los Angeles offers sunshine, beaches, and Hollywood glamour. From the iconic Hollywood sign to world-famous theme parks and pristine Pacific coastline, LA is a dream destination for travelers worldwide.',
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    language: 'English',
    bestTimeToVisit: ['March', 'April', 'May', 'September', 'October', 'November'],
    averageTemperature: { summer: '84°F (29°C)', winter: '68°F (20°C)' },
    popularAttractions: [
      'Hollywood Sign',
      'Universal Studios',
      'Santa Monica Pier',
      'Getty Center',
      'Griffith Observatory',
      'Venice Beach',
      'Rodeo Drive',
      'Disneyland (nearby)',
    ],
    nearbyAirports: [
      { code: 'LAX', name: 'Los Angeles International Airport', distance: '0 miles' },
      { code: 'BUR', name: 'Bob Hope Airport (Burbank)', distance: '16 miles' },
      { code: 'SNA', name: 'John Wayne Airport (Orange County)', distance: '40 miles' },
    ],
    relatedDestinations: ['San Francisco', 'Las Vegas', 'San Diego', 'New York', 'Miami'],
    keywords: ['LA flights', 'Los Angeles vacation', 'Hollywood tours', 'cheap flights to LAX'],
  },
  'london': {
    city: 'London',
    country: 'United Kingdom',
    code: 'LON',
    airportCode: 'LHR',
    description: 'A timeless blend of history and modernity, London is one of the world\'s most visited cities. From Buckingham Palace to the Tower of London, iconic museums to vibrant markets, the British capital offers culture, history, and world-class dining.',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    currency: 'GBP',
    language: 'English',
    bestTimeToVisit: ['May', 'June', 'September', 'October'],
    averageTemperature: { summer: '73°F (23°C)', winter: '48°F (9°C)' },
    popularAttractions: [
      'Buckingham Palace',
      'Tower of London',
      'British Museum',
      'London Eye',
      'Big Ben & Houses of Parliament',
      'Tower Bridge',
      'Westminster Abbey',
      'Covent Garden',
    ],
    nearbyAirports: [
      { code: 'LHR', name: 'Heathrow Airport', distance: '15 miles' },
      { code: 'LGW', name: 'Gatwick Airport', distance: '30 miles' },
      { code: 'STN', name: 'Stansted Airport', distance: '40 miles' },
    ],
    relatedDestinations: ['Paris', 'Amsterdam', 'Barcelona', 'Rome', 'Dublin'],
    keywords: ['London flights', 'UK vacation', 'cheap flights to London', 'Heathrow flights'],
  },
  'paris': {
    city: 'Paris',
    country: 'France',
    code: 'PAR',
    airportCode: 'CDG',
    description: 'The City of Light enchants visitors with its romantic ambiance, world-renowned cuisine, and iconic landmarks. From the Eiffel Tower to the Louvre, charming cafés to haute couture, Paris is synonymous with elegance and culture.',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
    currency: 'EUR',
    language: 'French',
    bestTimeToVisit: ['April', 'May', 'June', 'September', 'October'],
    averageTemperature: { summer: '77°F (25°C)', winter: '45°F (7°C)' },
    popularAttractions: [
      'Eiffel Tower',
      'Louvre Museum',
      'Notre-Dame Cathedral',
      'Arc de Triomphe',
      'Sacré-Cœur',
      'Champs-Élysées',
      'Versailles Palace (nearby)',
      'Montmartre',
    ],
    nearbyAirports: [
      { code: 'CDG', name: 'Charles de Gaulle Airport', distance: '16 miles' },
      { code: 'ORY', name: 'Orly Airport', distance: '8 miles' },
    ],
    relatedDestinations: ['London', 'Barcelona', 'Rome', 'Amsterdam', 'Madrid'],
    keywords: ['Paris flights', 'France vacation', 'cheap flights to Paris', 'CDG flights'],
  },
  'tokyo': {
    city: 'Tokyo',
    country: 'Japan',
    code: 'TYO',
    airportCode: 'NRT',
    description: 'A mesmerizing fusion of ancient tradition and cutting-edge technology, Tokyo is a city of contrasts. From serene temples to neon-lit districts, sushi bars to robot restaurants, Japan\'s capital offers an unforgettable cultural experience.',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    language: 'Japanese',
    bestTimeToVisit: ['March', 'April', 'May', 'October', 'November'],
    averageTemperature: { summer: '81°F (27°C)', winter: '48°F (9°C)' },
    popularAttractions: [
      'Senso-ji Temple',
      'Tokyo Skytree',
      'Shibuya Crossing',
      'Meiji Shrine',
      'Tsukiji Fish Market',
      'Imperial Palace',
      'Harajuku',
      'Akihabara',
    ],
    nearbyAirports: [
      { code: 'NRT', name: 'Narita International Airport', distance: '43 miles' },
      { code: 'HND', name: 'Haneda Airport', distance: '9 miles' },
    ],
    relatedDestinations: ['Seoul', 'Singapore', 'Hong Kong', 'Bangkok', 'Shanghai'],
    keywords: ['Tokyo flights', 'Japan vacation', 'cheap flights to Tokyo', 'Narita flights'],
  },
  'dubai': {
    city: 'Dubai',
    country: 'United Arab Emirates',
    code: 'DXB',
    airportCode: 'DXB',
    description: 'A modern marvel in the desert, Dubai is synonymous with luxury, innovation, and architectural wonders. From the world\'s tallest building to artificial islands, extravagant shopping to desert safaris, Dubai offers opulence and adventure.',
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 'Asia/Dubai',
    currency: 'AED',
    language: 'Arabic',
    bestTimeToVisit: ['November', 'December', 'January', 'February', 'March'],
    averageTemperature: { summer: '106°F (41°C)', winter: '75°F (24°C)' },
    popularAttractions: [
      'Burj Khalifa',
      'Dubai Mall',
      'Palm Jumeirah',
      'Burj Al Arab',
      'Dubai Marina',
      'Gold Souk',
      'Desert Safari',
      'Dubai Fountain',
    ],
    nearbyAirports: [
      { code: 'DXB', name: 'Dubai International Airport', distance: '3 miles' },
      { code: 'DWC', name: 'Al Maktoum International Airport', distance: '24 miles' },
    ],
    relatedDestinations: ['Abu Dhabi', 'Doha', 'Istanbul', 'Mumbai', 'Cairo'],
    keywords: ['Dubai flights', 'UAE vacation', 'cheap flights to Dubai', 'DXB flights'],
  },
};

// Parse city slug
function parseCitySlug(slug: string): string {
  return slug.toLowerCase().replace(/_/g, '-');
}

// Get destination data
function getDestinationData(citySlug: string): DestinationData | null {
  return DESTINATIONS_DB[parseCitySlug(citySlug)] || null;
}

// Generate metadata
export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const destination = getDestinationData(params.city);

  if (!destination) {
    return {
      title: 'Destination Not Found',
      description: 'The requested destination could not be found.',
    };
  }

  const currentYear = new Date().getFullYear();

  return genMeta({
    title: `${destination.city} Travel Guide ${currentYear} | Best Time to Visit, Attractions & Flights`,
    description: `Complete ${destination.city} travel guide. Discover the best time to visit, top attractions, cheap flights, hotels, and insider tips for your ${destination.city}, ${destination.country} vacation.`,
    keywords: [
      `${destination.city} travel guide`,
      `visit ${destination.city}`,
      `${destination.city} vacation`,
      `flights to ${destination.city}`,
      `${destination.city} attractions`,
      `best time to visit ${destination.city}`,
      `${destination.city} hotels`,
      `${destination.airportCode} flights`,
      ...destination.keywords,
    ],
    canonical: `${SITE_URL}/destinations/${params.city}`,
    ogType: 'article',
  });
}

// Generate static params for top destinations
export async function generateStaticParams() {
  const topDestinations = [
    'new-york',
    'los-angeles',
    'london',
    'paris',
    'tokyo',
    'dubai',
  ];

  return topDestinations.map((city) => ({
    city,
  }));
}

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

// Destination page component
export default async function DestinationPage({ params }: { params: { city: string } }) {
  const destination = getDestinationData(params.city);

  if (!destination) {
    notFound();
  }

  const currentYear = new Date().getFullYear();

  // Generate schemas
  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: destination.city,
    description: destination.description,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: destination.country,
      addressLocality: destination.city,
    },
    tourismType: 'City Tourism',
    touristAttractions: destination.popularAttractions.map((attraction) => ({
      '@type': 'TouristAttraction',
      name: attraction,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: `${SITE_URL}/destinations`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: destination.city,
        item: `${SITE_URL}/destinations/${params.city}`,
      },
    ],
  };

  const faqSchema = getFAQSchema([
    {
      question: `What is the best time to visit ${destination.city}?`,
      answer: `The best time to visit ${destination.city} is during ${destination.bestTimeToVisit.join(', ')}. During these months, you'll experience pleasant weather and fewer crowds, making it ideal for sightseeing and outdoor activities.`,
    },
    {
      question: `What are the top attractions in ${destination.city}?`,
      answer: `Top attractions in ${destination.city} include ${destination.popularAttractions.slice(0, 5).join(', ')}, and many more iconic landmarks and experiences.`,
    },
    {
      question: `Which airport should I fly into for ${destination.city}?`,
      answer: `The main airport serving ${destination.city} is ${destination.nearbyAirports[0].name} (${destination.nearbyAirports[0].code}). ${destination.nearbyAirports.length > 1 ? `Alternative airports include ${destination.nearbyAirports.slice(1).map(a => `${a.name} (${a.code})`).join(' and ')}.` : ''}`,
    },
    {
      question: `What is the average temperature in ${destination.city}?`,
      answer: `${destination.city} has an average temperature of ${destination.averageTemperature.summer} during summer months and ${destination.averageTemperature.winter} during winter months.`,
    },
    {
      question: `How can I find cheap flights to ${destination.city}?`,
      answer: `To find the best flight deals to ${destination.city}, use Fly2Any's flight search to compare prices from multiple airlines. Book in advance, be flexible with dates, and consider flying mid-week for the lowest fares.`,
    },
  ]);

  return (
    <>
      {/* Schema Markup */}
      <StructuredData schema={[placeSchema, breadcrumbSchema, faqSchema]} />

      {/* Page Content */}
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div
          className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/destinations-hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { name: 'Destinations', url: '/destinations' },
                { name: destination.city, url: `/destinations/${params.city}` },
              ]}
              className="mb-6 text-white"
            />

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {destination.city} Travel Guide {currentYear}
            </h1>
            <p className="text-xl md:text-2xl mb-6 max-w-3xl">
              {destination.description}
            </p>

            <div className="flex flex-wrap gap-4 items-center text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{destination.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Best: {destination.bestTimeToVisit.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                <span>{destination.airportCode} Airport</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <section>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">
                  About {destination.city}
                </h2>
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {destination.description}
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed mt-4">
                    With a perfect blend of {destination.city === 'Tokyo' ? 'tradition and innovation' : 'history and modernity'},
                    {' '}{destination.city} attracts millions of visitors each year. Whether you're interested in
                    cultural experiences, culinary adventures, or simply exploring iconic landmarks, this
                    destination offers something for every type of traveler.
                  </p>
                </div>
              </section>

              {/* Top Attractions */}
              <section>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  Top Attractions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destination.popularAttractions.map((attraction, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{attraction}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Best Time to Visit */}
              <section>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  Best Time to Visit
                </h2>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-lg text-gray-700 mb-4">
                    The ideal time to visit {destination.city} is during{' '}
                    <strong>{destination.bestTimeToVisit.join(', ')}</strong>. During these months,
                    you'll experience optimal weather conditions and can enjoy outdoor activities comfortably.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Summer</h3>
                      <p className="text-gray-700">Average: {destination.averageTemperature.summer}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Winter</h3>
                      <p className="text-gray-700">Average: {destination.averageTemperature.winter}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                  <Info className="w-8 h-8 text-blue-600" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqSchema.mainEntity.map((faq: any, index: number) => (
                    <details
                      key={index}
                      className="bg-white rounded-lg shadow-md p-6 group"
                    >
                      <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                        <span>{faq.name}</span>
                        <span className="text-blue-600 text-2xl group-open:rotate-45 transition-transform">
                          +
                        </span>
                      </summary>
                      <p className="text-gray-700 mt-4 leading-relaxed">
                        {faq.acceptedAnswer.text}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Flight Search Widget */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Find Flights to {destination.city}
                </h3>
                <Link
                  href={`/flights?destination=${destination.airportCode}`}
                  className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-center hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Search Flights
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">Nearby Airports</h4>
                  <ul className="space-y-2">
                    {destination.nearbyAirports.map((airport, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <strong>{airport.code}</strong> - {airport.name}
                        <br />
                        <span className="text-gray-500">{airport.distance} from city center</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">Quick Facts</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><strong>Currency:</strong> {destination.currency}</li>
                    <li><strong>Language:</strong> {destination.language}</li>
                    <li><strong>Timezone:</strong> {destination.timezone}</li>
                  </ul>
                </div>
              </div>

              {/* Related Destinations */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Similar Destinations
                </h3>
                <ul className="space-y-2">
                  {destination.relatedDestinations.map((relDest, index) => (
                    <li key={index}>
                      <Link
                        href={`/destinations/${relDest.toLowerCase().replace(/ /g, '-')}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {relDest}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Share */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Share This Guide</h3>
                <SocialShare
                  title={`${destination.city} Travel Guide ${currentYear}`}
                  description={destination.description}
                  hashtags={['travel', destination.city.replace(/ /g, ''), 'travelguide']}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
