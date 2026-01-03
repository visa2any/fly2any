"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Compass, Star, MapPin, Clock, Users, ArrowRight, Sparkles, Camera, Mountain, Utensils } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Popular US cities
const CITY_DATA: Record<string, { name: string; state: string; highlights: string[] }> = {
  "new-york": { name: "New York", state: "NY", highlights: ["Statue of Liberty", "Broadway Shows", "Central Park Tours"] },
  "los-angeles": { name: "Los Angeles", state: "CA", highlights: ["Hollywood Tours", "Universal Studios", "Beach Activities"] },
  "miami": { name: "Miami", state: "FL", highlights: ["Everglades Tours", "Art Deco Tours", "Water Sports"] },
  "las-vegas": { name: "Las Vegas", state: "NV", highlights: ["Grand Canyon Tours", "Shows & Entertainment", "Helicopter Rides"] },
  "chicago": { name: "Chicago", state: "IL", highlights: ["Architecture Tours", "Food Tours", "Lake Michigan Cruises"] },
  "san-francisco": { name: "San Francisco", state: "CA", highlights: ["Alcatraz Tours", "Wine Country", "Golden Gate Walks"] },
  "orlando": { name: "Orlando", state: "FL", highlights: ["Theme Parks", "Kennedy Space Center", "Airboat Tours"] },
};

const ACTIVITY_CATEGORIES = [
  { id: "tours", name: "Tours & Sightseeing", icon: Camera },
  { id: "outdoor", name: "Outdoor Activities", icon: Mountain },
  { id: "food", name: "Food & Drink", icon: Utensils },
  { id: "culture", name: "Arts & Culture", icon: Sparkles },
];

function ActivityCard({ activity }: { activity: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
    >
      <div className="aspect-[16/10] bg-gradient-to-br from-emerald-100 to-teal-100 relative overflow-hidden">
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700">
          {activity.category}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          {activity.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
          {activity.name}
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {activity.duration}</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {activity.groupSize}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">From</span>
            <span className="text-2xl font-bold text-gray-900 ml-1">${activity.price}</span>
          </div>
          <Link
            href={`/activities?city=${activity.city}`}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ActivitiesInCityPage() {
  const params = useParams();
  const citySlug = params.city as string;
  const cityInfo = CITY_DATA[citySlug] || { name: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), state: "", highlights: [] };

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const mockActivities = [
      { id: 1, name: `${cityInfo.name} City Highlights Tour`, category: "Tours", duration: "3 hours", groupSize: "Small group", rating: 4.9, price: 65, city: citySlug },
      { id: 2, name: `${cityInfo.name} Food & Culture Walk`, category: "Food", duration: "4 hours", groupSize: "Max 12", rating: 4.8, price: 89, city: citySlug },
      { id: 3, name: `${cityInfo.name} Adventure Experience`, category: "Outdoor", duration: "5 hours", groupSize: "Private", rating: 4.7, price: 129, city: citySlug },
      { id: 4, name: `${cityInfo.name} Art & Museum Pass`, category: "Culture", duration: "Full day", groupSize: "Self-guided", rating: 4.6, price: 45, city: citySlug },
      { id: 5, name: `Sunset ${cityInfo.name} Cruise`, category: "Tours", duration: "2 hours", groupSize: "Max 20", rating: 4.9, price: 79, city: citySlug },
      { id: 6, name: `${cityInfo.name} Local Secrets Tour`, category: "Tours", duration: "3 hours", groupSize: "Small group", rating: 4.8, price: 55, city: citySlug },
    ];
    setActivities(mockActivities);
    setLoading(false);
  }, [citySlug, cityInfo.name]);

  const relatedCities = Object.entries(CITY_DATA).filter(([slug]) => slug !== citySlug).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-sm mb-6 text-emerald-200">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/activities" className="hover:text-white">Activities</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{cityInfo.name}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Things to Do in {cityInfo.name}{cityInfo.state ? `, ${cityInfo.state}` : ""}
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mb-6">
            Discover the best tours, activities, and experiences in {cityInfo.name}. Book with instant confirmation.
          </p>

          {cityInfo.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cityInfo.highlights.map(h => (
                <span key={h} className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-sm">{h}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              activeCategory === "all" ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Activities
          </button>
          {ACTIVITY_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeCategory === cat.id ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <cat.icon className="w-4 h-4" /> {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Activities Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Activities in {cityInfo.name}</h2>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map(activity => <ActivityCard key={activity.id} activity={activity} />)}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href={`/activities?city=${citySlug}`}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            View All {cityInfo.name} Activities <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Internal Linking */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore More Destinations</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {relatedCities.map(([slug, city]) => (
              <Link key={slug} href={`/activities/in/${slug}`} className="group p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600">{city.name}</h3>
                <p className="text-sm text-gray-500">{city.state}, USA</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-sell */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Hotels in {cityInfo.name}</h3>
            <p className="text-purple-100 mb-4">Find the perfect stay from $99/night</p>
            <Link href={`/hotels/in/${citySlug}`} className="inline-flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold">
              Browse Hotels <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Flights to {cityInfo.name}</h3>
            <p className="text-blue-100 mb-4">Compare 500+ airlines for best prices</p>
            <Link href={`/flights/to/${citySlug}`} className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold">
              Search Flights <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
