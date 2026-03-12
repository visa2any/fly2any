"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Compass, Star, MapPin, Clock, Users, ArrowRight, Sparkles, Camera, Mountain, Utensils } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const CITY_DATA: Record<string, { name: string; state?: string; country: string; highlights: string[] }> = {
  "new-york": { name: "New York", state: "NY", country: "USA", highlights: ["Statue of Liberty", "Broadway Shows", "Central Park Tours", "Brooklyn Bridge Walk"] },
  "los-angeles": { name: "Los Angeles", state: "CA", country: "USA", highlights: ["Hollywood Tours", "Universal Studios", "Santa Monica", "Getty Museum"] },
  "miami": { name: "Miami", state: "FL", country: "USA", highlights: ["Everglades Tours", "Art Deco Tours", "Key West Day Trip", "Water Sports"] },
  "las-vegas": { name: "Las Vegas", state: "NV", country: "USA", highlights: ["Grand Canyon Tours", "Helicopter Rides", "Hoover Dam", "Shows"] },
  "chicago": { name: "Chicago", state: "IL", country: "USA", highlights: ["Architecture Boat Tour", "Food Tours", "Millennium Park", "Lake Michigan Cruise"] },
  "san-francisco": { name: "San Francisco", state: "CA", country: "USA", highlights: ["Alcatraz Island", "Wine Country", "Golden Gate Walk", "Fisherman's Wharf"] },
  "orlando": { name: "Orlando", state: "FL", country: "USA", highlights: ["Theme Parks", "Kennedy Space Center", "Airboat Tours", "Disney"] },
  "paris": { name: "Paris", country: "France", highlights: ["Eiffel Tower", "Louvre Museum", "Versailles", "Seine River Cruise"] },
  "rome": { name: "Rome", country: "Italy", highlights: ["Colosseum", "Vatican Tour", "Sistine Chapel", "Roman Forum"] },
  "london": { name: "London", country: "UK", highlights: ["Tower of London", "Buckingham Palace", "Stonehenge", "Thames Cruise"] },
  "barcelona": { name: "Barcelona", country: "Spain", highlights: ["Sagrada Familia", "Park Guell", "Gothic Quarter", "Montserrat"] },
  "tokyo": { name: "Tokyo", country: "Japan", highlights: ["Senso-ji Temple", "Mount Fuji Day Trip", "Shibuya Crossing", "Tsukiji Market"] },
  "cancun": { name: "Cancun", country: "Mexico", highlights: ["Chichen Itza", "Snorkeling", "Cenotes", "Isla Mujeres"] },
  "dubai": { name: "Dubai", country: "UAE", highlights: ["Desert Safari", "Burj Khalifa", "Dhow Cruise", "Abu Dhabi Day Trip"] },
};

const TOUR_CATEGORIES = [
  { id: "sightseeing", name: "Sightseeing", icon: Camera },
  { id: "adventure", name: "Adventure", icon: Mountain },
  { id: "food", name: "Food & Drink", icon: Utensils },
  { id: "culture", name: "Culture & History", icon: Sparkles },
];

function TourCard({ tour }: { tour: { name: string; duration: string; price: number; rating: number; reviews: number; category: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="aspect-[16/10] bg-gradient-to-br from-orange-100 to-red-100 relative">
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-700">
          {tour.category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{tour.name}</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}</span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{tour.rating} ({tour.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">${tour.price}</span>
            <span className="text-xs text-gray-500 ml-1">per person</span>
          </div>
          <span className="text-xs text-green-600 font-medium">Free cancellation</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ToursInCityPage() {
  const params = useParams()!;
  const citySlug = (params?.city as string) || '';
  const city = CITY_DATA[citySlug] || { name: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), country: "", highlights: [] };
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const sampleTours = city.highlights.map((highlight, i) => ({
    name: `${highlight} ${i % 2 === 0 ? 'Guided Tour' : 'Experience'}`,
    duration: `${2 + (i % 4)}h`,
    price: 35 + (i * 15),
    rating: 4.5 + (i % 3) * 0.2,
    reviews: 120 + (i * 45),
    category: TOUR_CATEGORIES[i % TOUR_CATEGORIES.length].name,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#E74035] to-[#D63930] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/tours" className="hover:text-white">Tours</Link>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Tours in {city.name}</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Discover the best guided tours, day trips, and experiences in {city.name}. Book with instant confirmation and free cancellation.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {TOUR_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id ? 'bg-[#E74035] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Tours Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Popular Tours in {city.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleTours.map((tour, i) => (
            <TourCard key={i} tour={tour} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={`/tours/results?destination=${citySlug}`}
            className="inline-flex items-center gap-2 bg-[#E74035] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#D63930] transition-colors"
          >
            Search All Tours in {city.name}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
