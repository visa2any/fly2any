"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, PartyPopper, Heart, Briefcase, GraduationCap, ArrowRight, Share2, Calendar, CreditCard, MessageCircle, CheckCircle } from "lucide-react";

const GROUP_TYPES = [
  { id: "bachelor", icon: PartyPopper, name: "Bachelor/Bachelorette", desc: "Las Vegas, Miami, Cancun", color: "from-pink-500 to-rose-600" },
  { id: "family", icon: Users, name: "Family Reunion", desc: "Resorts, cruises, all-inclusive", color: "from-blue-500 to-cyan-600" },
  { id: "friends", icon: Heart, name: "Friends Getaway", desc: "Beach trips, ski trips, adventures", color: "from-amber-500 to-orange-600" },
  { id: "corporate", icon: Briefcase, name: "Corporate Retreat", desc: "Team building, offsites, conferences", color: "from-slate-600 to-gray-700" },
  { id: "graduation", icon: GraduationCap, name: "Graduation Trip", desc: "Europe, Cabo, Caribbean", color: "from-emerald-500 to-teal-600" },
];

const FEATURES = [
  { icon: Share2, title: "Shareable Trip Link", desc: "Send one link, everyone can view & book" },
  { icon: Calendar, title: "Synced Itinerary", desc: "Everyone sees the same plans" },
  { icon: CreditCard, title: "Split Payments", desc: "Each person pays their own share" },
  { icon: MessageCircle, title: "Group Chat", desc: "Coordinate in one place" },
];

const DESTINATIONS = [
  { name: "Las Vegas", type: "Bachelor/Bachelorette", from: 599 },
  { name: "Cancun", type: "Friends Getaway", from: 799 },
  { name: "Miami", type: "Bachelor Party", from: 649 },
  { name: "Orlando", type: "Family Reunion", from: 899 },
  { name: "Cabo San Lucas", type: "Graduation Trip", from: 749 },
  { name: "Nashville", type: "Bachelorette", from: 449 },
];

export default function GroupTravelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6"
          >
            <Users className="w-5 h-5" />
            <span className="font-semibold">Group Trip Planner</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Plan Group Trips<br />Without the Chaos
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Bachelor parties, family reunions, friends getaways. One shared itinerary,
            individual bookings, zero coordination headaches.
          </p>

          <Link
            href="/agent/quotes/workspace?type=group"
            className="inline-flex items-center gap-3 bg-white text-pink-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="w-6 h-6" />
            Start Group Trip
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Group Types */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What's Your Group Trip?</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {GROUP_TYPES.map((type) => (
            <Link
              key={type.id}
              href={`/agent/quotes/workspace?type=group&occasion=${type.id}`}
              className="bg-white rounded-2xl p-5 text-center hover:shadow-lg transition-shadow group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <type.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600">{type.name}</h3>
              <p className="text-xs text-gray-500">{type.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How Group Booking Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Group Destinations</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {DESTINATIONS.map((dest) => (
            <div key={dest.name} className="bg-white rounded-xl p-5 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 mb-1">{dest.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{dest.type}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">From </span>
                  <span className="text-lg font-bold text-gray-900">${dest.from}</span>
                  <span className="text-sm text-gray-500">/person</span>
                </div>
                <Link
                  href={`/agent/quotes/workspace?type=group&destination=${dest.name.toLowerCase().replace(/ /g, '-')}`}
                  className="text-pink-600 font-semibold hover:text-pink-700"
                >
                  Plan Trip →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-600 py-16 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Groups Love Fly2Any</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Group Discounts", desc: "10+ travelers get special rates" },
              { title: "Free Coordination", desc: "We handle the logistics" },
              { title: "Flexible Payments", desc: "Everyone pays separately" },
            ].map((b) => (
              <div key={b.title} className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{b.title}</h3>
                <p className="text-sm text-white/80">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <PartyPopper className="w-12 h-12 mx-auto mb-4 text-pink-400" />
          <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Group Trip?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Tell us about your group and destination. We'll create a shareable trip everyone can join.
          </p>
          <Link
            href="/agent/quotes/workspace?type=group"
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="w-6 h-6" />
            Start Group Trip
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Internal Links */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">More Planning Options</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/plan-my-trip" className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-900">Plan My Trip</span>
              <p className="text-sm text-gray-500">Get personalized trip planning</p>
            </Link>
            <Link href="/multi-city" className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-900">Multi-City Trips</span>
              <p className="text-sm text-gray-500">Visit multiple destinations</p>
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
