"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Calendar, Users, Plane, Building2, MapPin, Star, CheckCircle } from "lucide-react";

const DEST_DATA: Record<string, { name: string; highlights: string[]; bestTime: string; duration: string; from: number; image: string }> = {
  "italy": { name: "Italy", highlights: ["Rome Colosseum", "Venice Canals", "Tuscan Wine", "Amalfi Coast"], bestTime: "Apr-Jun, Sep-Oct", duration: "10-14 days", from: 2499, image: "italy" },
  "france": { name: "France", highlights: ["Eiffel Tower", "Provence Lavender", "French Riviera", "Loire Castles"], bestTime: "May-Sep", duration: "7-10 days", from: 2299, image: "france" },
  "spain": { name: "Spain", highlights: ["Sagrada Familia", "Flamenco Shows", "Tapas Tours", "Ibiza Beaches"], bestTime: "Mar-May, Sep-Nov", duration: "7-12 days", from: 1899, image: "spain" },
  "greece": { name: "Greece", highlights: ["Santorini Sunsets", "Athens Acropolis", "Island Hopping", "Mediterranean Cuisine"], bestTime: "May-Oct", duration: "8-12 days", from: 2199, image: "greece" },
  "japan": { name: "Japan", highlights: ["Tokyo Temples", "Kyoto Gardens", "Mount Fuji", "Bullet Trains"], bestTime: "Mar-May, Oct-Nov", duration: "10-14 days", from: 3299, image: "japan" },
  "mexico": { name: "Mexico", highlights: ["Mayan Ruins", "Cancun Beaches", "Mexico City", "Tulum Cenotes"], bestTime: "Dec-Apr", duration: "7-10 days", from: 1299, image: "mexico" },
  "hawaii": { name: "Hawaii", highlights: ["Maui Beaches", "Volcano Tours", "Luau Experiences", "Snorkeling"], bestTime: "Apr-Oct", duration: "7-10 days", from: 1999, image: "hawaii" },
  "caribbean": { name: "Caribbean", highlights: ["Beach Resorts", "Island Hopping", "Snorkeling", "All-Inclusive"], bestTime: "Dec-Apr", duration: "5-7 days", from: 1499, image: "caribbean" },
  "europe": { name: "Europe", highlights: ["Multi-City Tours", "Rail Passes", "Historic Sites", "Cultural Experiences"], bestTime: "May-Sep", duration: "14-21 days", from: 3499, image: "europe" },
  "asia": { name: "Asia", highlights: ["Thailand Temples", "Bali Rice Terraces", "Vietnam Food", "Singapore"], bestTime: "Nov-Mar", duration: "14-21 days", from: 2499, image: "asia" },
};

export default function PlanTripToPage() {
  const params = useParams();
  const slug = params.destination as string;
  const dest = DEST_DATA[slug] || { name: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()), highlights: [], bestTime: "Year-round", duration: "7-14 days", from: 1999, image: "default" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-sm mb-6 text-white/70">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/plan-my-trip" className="hover:text-white">Plan My Trip</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{dest.name}</span>
          </nav>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
            Plan Your Trip to {dest.name}
          </motion.h1>
          <p className="text-xl text-white/80 max-w-2xl mb-6">
            Let us create your perfect {dest.name} itinerary with flights, hotels, and experiences—all personalized for you.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Best: {dest.bestTime}
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
              <MapPin className="w-5 h-5" /> {dest.duration} recommended
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> From ${dest.from}
            </div>
          </div>

          <Link
            href={`/agent/quotes/workspace?destination=${slug}`}
            className="inline-flex items-center gap-3 bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            <Sparkles className="w-6 h-6" /> Start Planning <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{dest.name} Highlights</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {dest.highlights.map((h) => (
            <div key={h} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="font-medium text-gray-900">{h}</span>
            </div>
          ))}
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Plan For You</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Plane, title: "Flights", desc: "Best routes & prices from your city" },
              { icon: Building2, title: "Hotels", desc: "Hand-picked accommodations" },
              { icon: MapPin, title: "Activities", desc: "Must-see experiences & tours" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Plan Your {dest.name} Trip?</h2>
          <p className="text-gray-300 mb-6">Tell us your dates and preferences—we'll handle the rest.</p>
          <Link
            href={`/agent/quotes/workspace?destination=${slug}`}
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100"
          >
            <Sparkles className="w-5 h-5" /> Get My {dest.name} Itinerary <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Related */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Other Popular Destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(DEST_DATA).filter(([k]) => k !== slug).slice(0, 5).map(([key, d]) => (
            <Link key={key} href={`/plan-my-trip/to/${key}`} className="bg-white p-3 rounded-xl text-center hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-900">{d.name}</span>
              <p className="text-xs text-gray-500">From ${d.from}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
