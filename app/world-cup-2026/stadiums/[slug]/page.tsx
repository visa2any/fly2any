import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStadiumBySlug } from '@/lib/data/world-cup-2026';
import { MapPinIcon, UsersIcon, CalendarIcon, GlobeAltIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { worldCupStadiumMetadata, getStadiumSchema, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const stadium = getStadiumBySlug(params.slug);

  if (!stadium) {
    return {
      title: 'Stadium Not Found',
    };
  }

  return worldCupStadiumMetadata(stadium.name, stadium.city, stadium.slug, stadium.capacity);
}

export default function StadiumPage({ params }: PageProps) {
  const stadium = getStadiumBySlug(params.slug);

  if (!stadium) {
    notFound();
  }

  // Generate structured data for SEO
  const stadiumSchema = getStadiumSchema({
    name: stadium.name,
    city: stadium.city,
    state: stadium.state,
    country: stadium.country,
    capacity: stadium.capacity,
    airportCode: stadium.airportCode,
    slug: stadium.slug,
    latitude: stadium.latitude,
    longitude: stadium.longitude,
    description: `${stadium.name} is hosting FIFA World Cup 2026 matches. Capacity: ${stadium.capacity.toLocaleString()}. Located in ${stadium.city}, ${stadium.country}.`,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.fly2any.com' },
    { name: 'World Cup 2026', url: 'https://www.fly2any.com/world-cup-2026' },
    { name: 'Stadiums', url: 'https://www.fly2any.com/world-cup-2026/stadiums' },
    { name: stadium.name, url: `https://www.fly2any.com/world-cup-2026/stadiums/${stadium.slug}` },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData schema={[stadiumSchema, breadcrumbSchema]} />

      <div className="min-h-screen bg-gray-50">
      {/* Hero with Stadium Colors */}
      <section
        className="relative overflow-hidden text-white py-24"
        style={{
          background: `linear-gradient(135deg, ${stadium.cityPrimaryColor} 0%, ${stadium.citySecondaryColor} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <Link
            href="/world-cup-2026/stadiums"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>All Stadiums</span>
          </Link>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-7xl mb-6">🏟️</div>

              <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-2xl">
                {stadium.name}
              </h1>

              {stadium.nickname && (
                <p className="text-2xl text-white/90 italic mb-6">
                  "{stadium.nickname}"
                </p>
              )}

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  {stadium.city}, {stadium.country}
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {stadium.matchCount} WC Matches
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">Stadium Information</h2>

              <div className="space-y-6">
                <div>
                  <div className="text-sm text-white/70 mb-1">Capacity</div>
                  <div className="text-3xl font-bold">{stadium.capacity.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm text-white/70 mb-1">Opened</div>
                  <div className="text-2xl font-semibold">{stadium.opened}</div>
                </div>

                <div>
                  <div className="text-sm text-white/70 mb-1">Nearest Airport</div>
                  <div className="text-xl font-semibold">
                    {stadium.airportCode} - {stadium.nearestAirport}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* World Cup Matches at This Stadium */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            World Cup 2026 Matches
          </h2>

          {/* Placeholder for match schedule */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {stadium.matchCount} Matches Scheduled
            </h3>
            <p className="text-gray-600 mb-6">
              Match schedule will be announced after the group draw
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {Array.from({ length: Math.min(3, stadium.matchCount) }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-sm text-gray-500 mb-2">Match {i + 1}</div>
                  <div className="text-2xl font-bold mb-2">Team TBD vs Team TBD</div>
                  <div className="text-gray-600 text-sm mb-4">Date & Time TBD</div>
                  <button
                    disabled
                    className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Tickets Pending
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Travel Information */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-gray-900">
            Travel to {stadium.city}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Flights */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <span className="text-3xl">✈️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Flights</h3>
              <p className="text-gray-600 mb-6">
                Fly into {stadium.airportCode} - {stadium.nearestAirport}
              </p>
              <Link
                href={`/flights?destination=${stadium.airportCode}`}
                className="block w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Search Flights to {stadium.airportCode}
              </Link>
            </div>

            {/* Hotels */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                <span className="text-3xl">🏨</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Hotels</h3>
              <p className="text-gray-600 mb-6">
                Stay near {stadium.name} in {stadium.city}
              </p>
              <Link
                href={`/hotels?city=${encodeURIComponent(stadium.city)}`}
                className="block w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-center"
              >
                Book Hotels in {stadium.city}
              </Link>
            </div>

            {/* Ground Transportation */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <span className="text-3xl">🚗</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Car Rental</h3>
              <p className="text-gray-600 mb-6">
                Rent a car for convenience during your stay
              </p>
              <Link
                href={`/cars?location=${encodeURIComponent(stadium.city)}`}
                className="block w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Rent a Car
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stadium Guide */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Getting There */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Getting to the Stadium
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span>✈️</span>
                  </div>
                  <div>
                    <div className="font-semibold">Nearest Airport</div>
                    <div className="text-gray-600">
                      {stadium.nearestAirport} ({stadium.airportCode})
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span>🚇</span>
                  </div>
                  <div>
                    <div className="font-semibold">Public Transit</div>
                    <div className="text-gray-600">
                      Multiple metro and bus routes available
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span>🅿️</span>
                  </div>
                  <div>
                    <div className="font-semibold">Parking</div>
                    <div className="text-gray-600">
                      On-site parking and nearby lots available
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stadium Features */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Stadium Features
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">Capacity</div>
                  <div className="text-2xl font-bold" style={{ color: stadium.cityPrimaryColor }}>
                    {stadium.capacity.toLocaleString()} fans
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">Surface</div>
                  <div className="text-lg">Natural Grass</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">Opened</div>
                  <div className="text-lg">{stadium.opened}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Placeholder */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            Stadium Location
          </h2>

          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Interactive Map Coming Soon
            </h3>
            <p className="text-gray-600">
              Location: {stadium.latitude?.toFixed(4)}, {stadium.longitude?.toFixed(4)}
            </p>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
