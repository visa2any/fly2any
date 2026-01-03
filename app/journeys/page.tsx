"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Users, Mountain, Briefcase, Palmtree, Compass, ArrowRight, Sparkles, Star, PartyPopper, Cake, Home } from "lucide-react";

const JOURNEY_THEMES = [
  {
    id: "romantic-getaways",
    name: "Romantic Getaways",
    icon: Heart,
    description: "Intimate escapes for couples",
    color: "from-rose-500 to-pink-600",
    destinations: ["Paris", "Santorini", "Maldives", "Venice"],
    priceFrom: 1299,
  },
  {
    id: "family-vacations",
    name: "Family Vacations",
    icon: Users,
    description: "Fun adventures for all ages",
    color: "from-blue-500 to-cyan-600",
    destinations: ["Orlando", "San Diego", "Hawaii", "Cancun"],
    priceFrom: 899,
  },
  {
    id: "adventure-travel",
    name: "Adventure Travel",
    icon: Mountain,
    description: "Thrilling experiences worldwide",
    color: "from-emerald-500 to-teal-600",
    destinations: ["Costa Rica", "New Zealand", "Iceland", "Peru"],
    priceFrom: 1499,
  },
  {
    id: "business-trips",
    name: "Business Travel",
    icon: Briefcase,
    description: "Efficient corporate journeys",
    color: "from-slate-600 to-gray-700",
    destinations: ["New York", "Chicago", "San Francisco", "Seattle"],
    priceFrom: 599,
  },
  {
    id: "beach-holidays",
    name: "Beach Holidays",
    icon: Palmtree,
    description: "Sun, sand, and relaxation",
    color: "from-amber-500 to-orange-600",
    destinations: ["Miami", "Bahamas", "Phuket", "Bali"],
    priceFrom: 799,
  },
  {
    id: "cultural-exploration",
    name: "Cultural Exploration",
    icon: Compass,
    description: "History and heritage journeys",
    color: "from-purple-500 to-indigo-600",
    destinations: ["Rome", "Tokyo", "Cairo", "Barcelona"],
    priceFrom: 1199,
  },
  {
    id: "celebrations",
    name: "Celebration Trips",
    icon: Cake,
    description: "Mark life's milestones in style",
    color: "from-fuchsia-500 to-purple-600",
    destinations: ["Napa Valley", "Amalfi", "Maui", "Swiss Alps"],
    priceFrom: 1899,
  },
  {
    id: "bachelor-bachelorette",
    name: "Bachelor & Bachelorette",
    icon: PartyPopper,
    description: "Ultimate pre-wedding parties",
    color: "from-pink-500 to-rose-600",
    destinations: ["Las Vegas", "Miami", "Cancun", "Nashville"],
    priceFrom: 899,
  },
  {
    id: "family-reunion",
    name: "Family Reunions",
    icon: Home,
    description: "Bring everyone together",
    color: "from-sky-500 to-blue-600",
    destinations: ["Orlando", "Lake Tahoe", "Outer Banks", "Colorado"],
    priceFrom: 1799,
  },
];

function JourneyCard({ journey }: { journey: typeof JOURNEY_THEMES[0] }) {
  const Icon = journey.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden group"
    >
      <div className={`bg-gradient-to-br ${journey.color} p-6 text-white`}>
        <Icon className="w-10 h-10 mb-4" />
        <h3 className="text-2xl font-bold mb-2">{journey.name}</h3>
        <p className="text-white/80">{journey.description}</p>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Popular Destinations</p>
          <div className="flex flex-wrap gap-2">
            {journey.destinations.map(dest => (
              <span key={dest} className="text-sm bg-gray-100 px-3 py-1 rounded-full">{dest}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-sm text-gray-500">Packages from</span>
            <p className="text-2xl font-bold text-gray-900">${journey.priceFrom}</p>
          </div>
          <Link
            href={`/journeys/${journey.id}`}
            className={`inline-flex items-center gap-2 bg-gradient-to-r ${journey.color} text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity`}
          >
            Explore <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function JourneysPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI-Curated Travel Experiences</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Perfect Journey<br />Awaits
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Discover curated travel packages designed for every type of traveler.
            From romantic escapes to family adventures, find your perfect trip.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span>4.9/5 Customer Rating</span>
            </div>
            <div>•</div>
            <div>50,000+ Happy Travelers</div>
            <div>•</div>
            <div>Best Price Guarantee</div>
          </div>
        </div>
      </section>

      {/* Journey Themes */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Journey Type</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a travel style that matches your dream vacation. Each journey is carefully
            crafted with flights, hotels, and activities included.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {JOURNEY_THEMES.map(journey => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      {/* CTA: Build Custom Trip */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-xl text-white/80 mb-8">
            Work with our travel experts to build a completely custom itinerary tailored to your preferences.
          </p>
          <Link
            href="/agent/quotes/workspace"
            className="inline-flex items-center gap-3 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            <Sparkles className="w-6 h-6" />
            Build Custom Trip
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Destinations", value: "500+" },
            { label: "Happy Travelers", value: "50K+" },
            { label: "Expert Guides", value: "200+" },
            { label: "Best Price Match", value: "100%" },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
