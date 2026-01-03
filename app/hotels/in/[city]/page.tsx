"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Building2, Star, MapPin, Wifi, Car, Coffee, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Popular US cities for hotels
const CITY_DATA: Record<string, { name: string; state: string; country: string; image: string; description: string }> = {
  "new-york": { name: "New York", state: "NY", country: "USA", image: "/destinations/new-york.jpg", description: "The city that never sleeps offers world-class hotels from Times Square to Central Park." },
  "los-angeles": { name: "Los Angeles", state: "CA", country: "USA", image: "/destinations/los-angeles.jpg", description: "From Hollywood glamour to beachfront luxury, LA has accommodations for every style." },
  "miami": { name: "Miami", state: "FL", country: "USA", image: "/destinations/miami.jpg", description: "Vibrant beachfront resorts and Art Deco boutique hotels in sunny South Florida." },
  "las-vegas": { name: "Las Vegas", state: "NV", country: "USA", image: "/destinations/las-vegas.jpg", description: "Iconic casino resorts and luxury suites on the famous Las Vegas Strip." },
  "chicago": { name: "Chicago", state: "IL", country: "USA", image: "/destinations/chicago.jpg", description: "Magnificent Mile hotels and lakefront luxury in the Windy City." },
  "san-francisco": { name: "San Francisco", state: "CA", country: "USA", image: "/destinations/san-francisco.jpg", description: "Boutique hotels near Fisherman's Wharf and Union Square." },
  "orlando": { name: "Orlando", state: "FL", country: "USA", image: "/destinations/orlando.jpg", description: "Theme park resorts and family-friendly accommodations near Disney and Universal." },
  "seattle": { name: "Seattle", state: "WA", country: "USA", image: "/destinations/seattle.jpg", description: "Pacific Northwest charm with waterfront hotels and Pike Place views." },
  "boston": { name: "Boston", state: "MA", country: "USA", image: "/destinations/boston.jpg", description: "Historic hotels in Back Bay and modern luxury in the Seaport District." },
  "denver": { name: "Denver", state: "CO", country: "USA", image: "/destinations/denver.jpg", description: "Mountain-view hotels and downtown Denver accommodations." },
};

function HotelCard({ hotel }: { hotel: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="aspect-[16/10] bg-gradient-to-br from-purple-100 to-blue-100 relative">
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          {hotel.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{hotel.name}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
          <MapPin className="w-4 h-4" /> {hotel.location}
        </p>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {hotel.amenities?.slice(0, 3).map((a: string) => (
            <span key={a} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{a}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">${hotel.price}</span>
            <span className="text-gray-500 text-sm">/night</span>
          </div>
          <Link
            href={`/hotels?location=${hotel.city}&checkIn=${new Date().toISOString().split('T')[0]}`}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            View Deal
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function HotelsInCityPage() {
  const params = useParams();
  const citySlug = params.city as string;
  const cityInfo = CITY_DATA[citySlug] || { name: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), state: "", country: "USA", image: "", description: "" };

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated hotel data - in production, fetch from API
    const mockHotels = [
      { id: 1, name: `${cityInfo.name} Grand Hotel`, location: `Downtown ${cityInfo.name}`, rating: 4.8, price: 189, city: citySlug, amenities: ["Free WiFi", "Pool", "Spa"] },
      { id: 2, name: `The ${cityInfo.name} Plaza`, location: `${cityInfo.name} City Center`, rating: 4.6, price: 149, city: citySlug, amenities: ["Breakfast", "Gym", "Parking"] },
      { id: 3, name: `${cityInfo.name} Boutique Inn`, location: `Historic District`, rating: 4.9, price: 219, city: citySlug, amenities: ["Rooftop Bar", "Concierge", "WiFi"] },
      { id: 4, name: `Comfort Suites ${cityInfo.name}`, location: `Near Airport`, rating: 4.3, price: 99, city: citySlug, amenities: ["Shuttle", "WiFi", "Breakfast"] },
    ];
    setHotels(mockHotels);
    setLoading(false);
  }, [citySlug, cityInfo.name]);

  // Related destinations for internal linking
  const relatedCities = Object.entries(CITY_DATA)
    .filter(([slug]) => slug !== citySlug)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-sm mb-6 text-purple-200">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/hotels" className="hover:text-white">Hotels</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{cityInfo.name}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hotels in {cityInfo.name}{cityInfo.state ? `, ${cityInfo.state}` : ""}
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mb-8">
            {cityInfo.description || `Find the best hotel deals in ${cityInfo.name}. Compare prices from top booking sites.`}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span>{hotels.length}+ Hotels</span>
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>From $99/night</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Hotels in {cityInfo.name}</h2>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href={`/hotels?location=${citySlug}`}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            View All {cityInfo.name} Hotels <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Internal Linking - Related Destinations */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore More Destinations</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {relatedCities.map(([slug, city]) => (
              <Link
                key={slug}
                href={`/hotels/in/${slug}`}
                className="group p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">{city.name}</h3>
                <p className="text-sm text-gray-500">{city.state}, {city.country}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-sell: Flights */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Need Flights to {cityInfo.name}?</h2>
          <p className="text-blue-100 mb-6">Compare flights from 500+ airlines and save up to 40%</p>
          <Link
            href={`/flights/to/${citySlug}`}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
          >
            Search Flights <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FAQ Schema Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="bg-white rounded-xl p-4 shadow-sm">
            <summary className="font-semibold cursor-pointer">What is the best area to stay in {cityInfo.name}?</summary>
            <p className="mt-3 text-gray-600">The best area depends on your preferences. Downtown offers convenience, while beachfront or historic districts provide unique experiences.</p>
          </details>
          <details className="bg-white rounded-xl p-4 shadow-sm">
            <summary className="font-semibold cursor-pointer">How much do hotels cost in {cityInfo.name}?</summary>
            <p className="mt-3 text-gray-600">Hotel prices in {cityInfo.name} range from $99/night for budget options to $500+ for luxury resorts. Average mid-range hotels cost around $150-200/night.</p>
          </details>
          <details className="bg-white rounded-xl p-4 shadow-sm">
            <summary className="font-semibold cursor-pointer">When is the best time to book hotels in {cityInfo.name}?</summary>
            <p className="mt-3 text-gray-600">Book 2-3 weeks in advance for the best rates. Avoid peak seasons unless you book early for better availability.</p>
          </details>
        </div>
      </section>
    </div>
  );
}
