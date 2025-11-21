import { Metadata } from 'next';
import Link from 'next/link';
import { WORLD_CUP_STADIUMS } from '@/lib/data/world-cup-2026';

export const metadata: Metadata = {
  title: 'World Cup 2026 Hotels | Official Accommodation Near Stadiums',
  description: 'Book official FIFA World Cup 2026 hotels near all 16 stadiums. Luxury hotels, budget stays, and fan accommodation in USA, Canada & Mexico.',
  keywords: 'world cup hotels, fifa 2026 accommodation, stadium hotels, world cup lodging',
};

export default function HotelsPage() {
  const hotelCategories = [
    {
      id: 'luxury',
      name: 'Luxury Hotels',
      icon: '✨',
      rating: 5,
      price: '$$$$$',
      color: 'from-purple-600 to-indigo-700',
      features: [
        'Presidential suites',
        'Rooftop bars',
        'Spa & wellness',
        'Concierge service',
        'Fine dining',
      ],
      priceRange: '$500-2000/night',
    },
    {
      id: 'premium',
      name: 'Premium Hotels',
      icon: '🌟',
      rating: 4,
      price: '$$$$',
      color: 'from-blue-600 to-blue-700',
      features: [
        'Executive rooms',
        'Gym & pool',
        'Business center',
        'Restaurant & bar',
        'Room service',
      ],
      priceRange: '$200-500/night',
    },
    {
      id: 'comfort',
      name: 'Comfort Hotels',
      icon: '🏨',
      rating: 3,
      price: '$$$',
      color: 'from-green-600 to-green-700',
      features: [
        'Standard rooms',
        'Free breakfast',
        'WiFi included',
        'Central location',
        'Clean & modern',
      ],
      priceRange: '$100-200/night',
    },
    {
      id: 'budget',
      name: 'Budget Stays',
      icon: '💰',
      rating: 2,
      price: '$$',
      color: 'from-orange-600 to-orange-700',
      features: [
        'Basic amenities',
        'Shared facilities',
        'Fan zones nearby',
        'Affordable rates',
        'Group discounts',
      ],
      priceRange: '$50-100/night',
    },
  ];

  const topCityHotels = [
    {
      city: 'Mexico City',
      country: '🇲🇽 Mexico',
      stadium: 'Estadio Azteca',
      hotels: [
        { name: 'Four Seasons Mexico City', stars: 5, price: '$450', distance: '3.2 km' },
        { name: 'St. Regis Mexico City', stars: 5, price: '$380', distance: '4.1 km' },
        { name: 'Hilton Mexico City Reforma', stars: 4, price: '$180', distance: '5.0 km' },
      ],
      matches: 6,
    },
    {
      city: 'New York/New Jersey',
      country: '🇺🇸 USA',
      stadium: 'MetLife Stadium',
      hotels: [
        { name: 'The Plaza Hotel', stars: 5, price: '$650', distance: '15 km' },
        { name: 'Hilton Meadowlands', stars: 4, price: '$220', distance: '2.5 km' },
        { name: 'Sheraton Meadowlands', stars: 4, price: '$190', distance: '3.1 km' },
      ],
      matches: 8,
    },
    {
      city: 'Los Angeles',
      country: '🇺🇸 USA',
      stadium: 'SoFi Stadium',
      hotels: [
        { name: 'Beverly Hills Hotel', stars: 5, price: '$750', distance: '12 km' },
        { name: 'Westin LAX', stars: 4, price: '$200', distance: '5.0 km' },
        { name: 'Aloft El Segundo', stars: 3, price: '$150', distance: '4.2 km' },
      ],
      matches: 7,
    },
    {
      city: 'Toronto',
      country: '🇨🇦 Canada',
      stadium: 'BMO Field',
      hotels: [
        { name: 'Fairmont Royal York', stars: 5, price: '$380', distance: '2.8 km' },
        { name: 'Marriott Downtown', stars: 4, price: '$220', distance: '3.5 km' },
        { name: 'Holiday Inn Express', stars: 3, price: '$140', distance: '4.0 km' },
      ],
      matches: 5,
    },
  ];

  const amenities = [
    { icon: '📶', name: 'Free WiFi', description: 'High-speed internet in all rooms' },
    { icon: '🍳', name: 'Breakfast', description: 'Complimentary buffet breakfast' },
    { icon: '🏋️', name: 'Fitness Center', description: 'State-of-the-art gym facilities' },
    { icon: '🏊', name: 'Pool & Spa', description: 'Relax after the matches' },
    { icon: '🚗', name: 'Parking', description: 'Free parking for all guests' },
    { icon: '🔐', name: 'Safe & Secure', description: '24/7 security and safe deposit' },
    { icon: '🛎️', name: 'Concierge', description: 'Local tips and ticket assistance' },
    { icon: '🍽️', name: 'Restaurant', description: 'On-site dining options' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='5' y='5' width='30' height='30' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
              <span className="text-yellow-400 text-xl">🏨</span>
              <span className="text-sm font-semibold">Official Accommodation Partner</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">
                WORLD CUP HOTELS
              </span>
            </h1>

            <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Book Your Stay Near All 16 Stadiums Across USA, Canada & Mexico
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl">✓</span>
                <span>1000+ Hotels Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl">✓</span>
                <span>Walking Distance to Stadiums</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl">✓</span>
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Find Your Perfect Stay
            </h2>
            <p className="text-xl text-gray-600">
              From luxury suites to budget-friendly options
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {hotelCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className={`bg-gradient-to-br ${category.color} p-8 text-white text-center`}>
                  <div className="text-6xl mb-3">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(category.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <div className="text-3xl font-black mb-1">{category.price}</div>
                  <div className="text-sm opacity-90">{category.priceRange}</div>
                </div>

                <div className="bg-white p-6">
                  <ul className="space-y-3 mb-6">
                    {category.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-3 bg-gradient-to-r ${category.color} text-white font-bold rounded-lg hover:shadow-xl transition-all`}>
                    View {category.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top City Hotels */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Hotels by Stadium
            </h2>
            <p className="text-xl text-gray-600">
              Stay close to the action in every host city
            </p>
          </div>

          <div className="space-y-8">
            {topCityHotels.map((cityData, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* City Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black mb-2">{cityData.city}</h3>
                      <div className="flex items-center gap-3 text-white/90">
                        <span className="text-xl">{cityData.country}</span>
                        <span>•</span>
                        <span className="text-lg">🏟️ {cityData.stadium}</span>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
                      <div className="text-3xl font-black">{cityData.matches}</div>
                      <div className="text-sm">Matches</div>
                    </div>
                  </div>
                </div>

                {/* Hotels List */}
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {cityData.hotels.map((hotel, hotelIdx) => (
                      <div
                        key={hotelIdx}
                        className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">{hotel.name}</h4>
                            <div className="flex gap-1 mb-2">
                              {[...Array(hotel.stars)].map((_, i) => (
                                <span key={i} className="text-yellow-400 text-sm">⭐</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <span>📍</span>
                          <span>{hotel.distance} from stadium</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-500">From</div>
                            <div className="text-2xl font-black text-blue-600">{hotel.price}</div>
                            <div className="text-xs text-gray-500">/night</div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Premium Amenities
            </h2>
            <p className="text-xl text-gray-600">
              Enjoy world-class facilities at all partner hotels
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {amenities.map((amenity, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all"
              >
                <div className="text-5xl mb-3">{amenity.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{amenity.name}</h3>
                <p className="text-sm text-gray-600">{amenity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Benefits */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Why Book With Us?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Best Price Guarantee</h3>
              <p className="text-gray-600">
                Find a lower price? We'll match it and give you an extra 10% discount
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Free Cancellation</h3>
              <p className="text-gray-600">
                Cancel up to 48 hours before check-in for a full refund on most bookings
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Instant Confirmation</h3>
              <p className="text-gray-600">
                Get immediate booking confirmation and access to your reservation details
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🏨</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Secure Your Accommodation Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Hotels are selling out fast • Book now and save up to 30%
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full text-lg hover:scale-105 transition-transform shadow-lg">
              🔍 Search All Hotels
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-full text-lg hover:bg-white/20 transition-all">
              📞 Call Us: 1-800-WORLDCUP
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              24/7 customer support
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              Secure SSL encryption
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              Verified reviews
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
