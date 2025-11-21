import { Metadata } from 'next';
import Link from 'next/link';
import { WORLD_CUP_STADIUMS } from '@/lib/data/world-cup-2026';
import { worldCupPackagesMetadata, getTravelPackageSchema, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = worldCupPackagesMetadata();

export default function PackagesPage() {
  const packageTiers = [
    {
      id: 'bronze',
      name: 'Bronze Package',
      icon: '🥉',
      color: 'from-orange-700 to-amber-900',
      price: '$2,499',
      features: [
        '✈️ Round-trip economy flights',
        '🏨 3-star hotel (5 nights)',
        '🎫 1 Group stage match ticket',
        '🚌 Airport transfers',
        '📱 Mobile app with match updates',
        '🗺️ City guide & map',
      ],
      popular: false,
    },
    {
      id: 'silver',
      name: 'Silver Package',
      icon: '🥈',
      color: 'from-gray-400 to-gray-600',
      price: '$4,999',
      features: [
        '✈️ Round-trip economy+ flights',
        '🏨 4-star hotel near stadium (7 nights)',
        '🎫 2 Group + 1 Round of 16 tickets',
        '🚗 Private airport & stadium transfers',
        '🎉 Welcome dinner with fans',
        '📱 Premium app with live stats',
        '🗺️ City tours & excursions',
        '🏆 FIFA World Cup merchandise',
      ],
      popular: true,
    },
    {
      id: 'gold',
      name: 'Gold Package',
      icon: '🥇',
      color: 'from-yellow-400 to-yellow-600',
      price: '$9,999',
      features: [
        '✈️ Round-trip business class flights',
        '🏨 5-star luxury hotel (10 nights)',
        '🎫 3 Group + Round of 16 + Quarter-final',
        '🚁 VIP helicopter transfers available',
        '🍾 VIP lounge access',
        '🎉 Exclusive meet & greet with legends',
        '🏟️ Stadium tours',
        '🎁 Official FIFA merchandise bundle',
        '📸 Professional photo package',
        '🥂 Champagne & gourmet dining',
      ],
      popular: false,
    },
    {
      id: 'platinum',
      name: 'Platinum VIP',
      icon: '💎',
      color: 'from-purple-600 to-indigo-800',
      price: '$24,999',
      features: [
        '✈️ First-class flights with lounge access',
        '🏨 Presidential suite at 5-star hotel (14 nights)',
        '🎫 VIP seats: Groups + Knockouts + FINAL',
        '🚁 Private helicopter for all transfers',
        '🍾 Private skybox with catering',
        '⚽ Meet & greet with current players',
        '🏆 FIFA World Cup Trophy photo op',
        '💼 Dedicated concierge 24/7',
        '🎁 Luxury FIFA gift collection',
        '🥂 Private yacht party',
        '📸 Professional videographer',
        '🌟 Red carpet VIP treatment',
      ],
      popular: false,
    },
  ];

  const cityPackages = [
    {
      city: 'Mexico City',
      country: 'Mexico',
      flag: '🇲🇽',
      stadium: 'Estadio Azteca',
      matches: 6,
      image: '/stadiums/azteca.jpg',
      highlights: ['Opening Ceremony', 'Historic venue', 'Aztec culture tours'],
    },
    {
      city: 'New York/New Jersey',
      country: 'USA',
      flag: '🇺🇸',
      stadium: 'MetLife Stadium',
      matches: 8,
      image: '/stadiums/metlife.jpg',
      highlights: ['Final Match', 'NYC attractions', 'Statue of Liberty tours'],
    },
    {
      city: 'Los Angeles',
      country: 'USA',
      flag: '🇺🇸',
      stadium: 'SoFi Stadium',
      matches: 7,
      image: '/stadiums/sofi.jpg',
      highlights: ['Hollywood tours', 'Beach access', 'Celebrity sightings'],
    },
    {
      city: 'Toronto',
      country: 'Canada',
      flag: '🇨🇦',
      stadium: 'BMO Field',
      matches: 5,
      image: '/stadiums/bmo.jpg',
      highlights: ['CN Tower', 'Niagara Falls tour', 'Multicultural cuisine'],
    },
  ];

  // Generate structured data for SEO
  const packageSchemas = packageTiers.map(pkg =>
    getTravelPackageSchema({
      name: `FIFA World Cup 2026 ${pkg.name}`,
      description: `All-inclusive World Cup 2026 travel package including ${pkg.features.join(', ')}`,
      price: parseInt(pkg.price.replace(/[^0-9]/g, '')),
      currency: 'USD',
      packageType: pkg.id,
    })
  );

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.fly2any.com' },
    { name: 'World Cup 2026', url: 'https://www.fly2any.com/world-cup-2026' },
    { name: 'Packages', url: 'https://www.fly2any.com/world-cup-2026/packages' },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData schema={[...packageSchemas, breadcrumbSchema]} />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='25' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
              <span className="text-yellow-400 text-xl">⚡</span>
              <span className="text-sm font-semibold">Complete Travel Packages</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">
                ALL-IN-ONE PACKAGES
              </span>
            </h1>

            <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Flights + Hotels + Tickets + VIP Experiences
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl">✓</span>
                <span>Complete Bundles</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl">✓</span>
                <span>Best Value Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl">✓</span>
                <span>Hassle-Free Booking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Tiers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Choose Your Package
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From budget-friendly to ultra-luxury VIP experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packageTiers.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300 ${
                  pkg.popular ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-black px-6 py-2 rounded-bl-2xl font-bold text-sm z-10">
                    🔥 MOST POPULAR
                  </div>
                )}

                <div className={`bg-gradient-to-br ${pkg.color} p-8 text-white`}>
                  <div className="text-6xl mb-4 text-center">{pkg.icon}</div>
                  <h3 className="text-2xl font-black text-center mb-2">{pkg.name}</h3>
                  <div className="text-center">
                    <span className="text-sm opacity-80">Starting from</span>
                    <div className="text-4xl font-black">{pkg.price}</div>
                    <span className="text-sm opacity-80">per person</span>
                  </div>
                </div>

                <div className="bg-white p-8">
                  <ul className="space-y-4 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="mt-0.5">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-4 bg-gradient-to-r ${pkg.color} text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105`}>
                    Book {pkg.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* City-Specific Packages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Packages by City
            </h2>
            <p className="text-xl text-gray-600">
              Experience the World Cup in iconic cities across 3 countries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cityPackages.map((city, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative flex items-center justify-center">
                  <div className="text-8xl">{city.flag}</div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{city.city}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <span className="text-xl">🏟️</span>
                    <span className="text-sm">{city.stadium}</span>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="text-3xl font-black text-blue-600 text-center">
                      {city.matches}
                    </div>
                    <div className="text-xs text-center text-gray-600">Matches Available</div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="text-sm font-semibold text-gray-700">Highlights:</div>
                    {city.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500">✓</span>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-xl transition-all">
                    View {city.city} Packages
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              What's Included
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for the ultimate World Cup experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Flights</h3>
              <p className="text-gray-600">
                Round-trip flights from major airports worldwide with flexible dates and upgraded seats available
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-6xl mb-4">🏨</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Hotels</h3>
              <p className="text-gray-600">
                Handpicked accommodations near stadiums with breakfast, WiFi, and concierge services
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Match Tickets</h3>
              <p className="text-gray-600">
                Guaranteed official FIFA tickets with premium seating options and VIP packages available
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="text-6xl mb-4">🚌</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Transfers</h3>
              <p className="text-gray-600">
                Airport and stadium transfers with comfortable coaches and English-speaking guides
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-red-100">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Fan Events</h3>
              <p className="text-gray-600">
                Exclusive fan zone access, welcome parties, and official FIFA Fan Fest experiences
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Concierge</h3>
              <p className="text-gray-600">
                24/7 support, mobile app, emergency assistance, and local recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Book Your Dream Package Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Limited availability • Best prices guaranteed • Flexible payment plans
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full text-lg hover:scale-105 transition-transform shadow-lg">
              🎁 View All Packages
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-full text-lg hover:bg-white/20 transition-all">
              💬 Talk to an Expert
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              Instant booking confirmation
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              Secure payment
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              Free cancellation
            </span>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
