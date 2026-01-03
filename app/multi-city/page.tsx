"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Plane, ArrowRight, Plus, Route, Clock, DollarSign, Globe, Sparkles } from "lucide-react";

const POPULAR_ROUTES = [
  { name: "European Classics", cities: ["London", "Paris", "Rome", "Barcelona"], days: 14, price: 2499 },
  { name: "Southeast Asia", cities: ["Bangkok", "Singapore", "Bali", "Ho Chi Minh"], days: 18, price: 1899 },
  { name: "US Coast to Coast", cities: ["NYC", "Chicago", "Las Vegas", "LA", "San Francisco"], days: 12, price: 1299 },
  { name: "Japan Discovery", cities: ["Tokyo", "Kyoto", "Osaka", "Hiroshima"], days: 10, price: 2199 },
];

const BENEFITS = [
  { icon: Route, title: "Optimized Routes", desc: "We find the most efficient path between cities" },
  { icon: DollarSign, title: "Save 20-40%", desc: "Multi-city often beats separate round trips" },
  { icon: Clock, title: "Less Backtracking", desc: "Linear routes = more time exploring" },
  { icon: Globe, title: "Open-Jaw Flights", desc: "Fly into one city, out from another" },
];

export default function MultiCityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6"
          >
            <Route className="w-5 h-5" />
            <span className="font-semibold">Multi-Destination Trip Planner</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Visit Multiple Cities<br />One Epic Trip
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Plan multi-city adventures with optimized routes and prices.
            Europe, Asia, USA—we'll build the perfect itinerary.
          </p>

          <Link
            href="/agent/quotes/workspace?type=multi-city"
            className="inline-flex items-center gap-3 bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            <Sparkles className="w-6 h-6" />
            Build My Route
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: 1, title: "Add Cities", desc: "Enter all destinations you want to visit" },
            { step: 2, title: "Set Dates", desc: "Choose how long in each city" },
            { step: 3, title: "We Optimize", desc: "AI finds best route & prices" },
            { step: 4, title: "Book & Go", desc: "Flights + hotels in one checkout" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-700 font-bold text-xl">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Multi-City Routes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {POPULAR_ROUTES.map((route) => (
              <motion.div
                key={route.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">{route.name}</h3>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {route.cities.map((city, i) => (
                    <span key={city} className="flex items-center gap-1">
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium">{city}</span>
                      {i < route.cities.length - 1 && <Plane className="w-4 h-4 text-gray-400" />}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">{route.days} days • {route.cities.length} cities</div>
                  <div>
                    <span className="text-sm text-gray-500">From </span>
                    <span className="text-xl font-bold text-gray-900">${route.price}</span>
                  </div>
                </div>
                <Link
                  href={`/agent/quotes/workspace?preset=multi-city&route=${route.name.toLowerCase().replace(/ /g, '-')}`}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Customize This Route <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Book Multi-City With Us</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <b.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
              <p className="text-sm text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Route?</h2>
          <p className="text-indigo-100 mb-8">Add your cities and we'll create the perfect multi-destination trip.</p>
          <Link
            href="/agent/quotes/workspace?type=multi-city"
            className="inline-flex items-center gap-3 bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-6 h-6" />
            Start Adding Cities
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Internal Links */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Planning Tools</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/plan-my-trip" className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-900">Plan My Trip</span>
              <p className="text-sm text-gray-500">Get personalized help planning</p>
            </Link>
            <Link href="/group-travel" className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-900">Group Travel</span>
              <p className="text-sm text-gray-500">Coordinate trips with friends</p>
            </Link>
            <Link href="/journeys" className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-900">Journey Themes</span>
              <p className="text-sm text-gray-500">Pre-built travel packages</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
