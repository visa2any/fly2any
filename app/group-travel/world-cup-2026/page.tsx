"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Trophy, Plane, Building2, Ticket, ArrowRight, MapPin, Calendar, Star, Share2 } from "lucide-react";

const HOST_CITIES = [
  { city: "New York/NJ", stadium: "MetLife Stadium", matches: 8 },
  { city: "Los Angeles", stadium: "SoFi Stadium", matches: 8 },
  { city: "Dallas", stadium: "AT&T Stadium", matches: 8 },
  { city: "Miami", stadium: "Hard Rock Stadium", matches: 7 },
  { city: "Atlanta", stadium: "Mercedes-Benz Stadium", matches: 6 },
  { city: "Houston", stadium: "NRG Stadium", matches: 5 },
];

const GROUP_PACKAGES = [
  { name: "Fan Pack", people: "4-8", nights: 5, price: 1999, includes: ["Flights", "Hotel", "2 Match Tickets", "Fan Zone Access"] },
  { name: "Squad Pack", people: "8-16", nights: 7, price: 2999, includes: ["Flights", "Hotel", "3 Match Tickets", "VIP Transport", "Group Dinner"] },
  { name: "Ultimate Pack", people: "16+", nights: 10, price: 4999, includes: ["Flights", "Luxury Hotel", "5 Match Tickets", "Private Driver", "VIP Experience"] },
];

export default function WC2026GroupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 via-emerald-700 to-teal-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-sm mb-6 text-white/70">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/group-travel" className="hover:text-white">Group Travel</Link>
            <span className="mx-2">/</span>
            <span className="text-white">World Cup 2026</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold">World Cup 2026 Group Trip</h1>
          </motion.div>
          <p className="text-xl text-white/80 max-w-2xl mb-6">
            Experience the biggest World Cup ever with your crew. USA, Mexico & Canada.
            Coordinated flights, shared hotels, match tickets—all in one booking.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
              <Calendar className="w-5 h-5" /> June 11 - July 19, 2026
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
              <MapPin className="w-5 h-5" /> 16 Host Cities
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2">
              <Users className="w-5 h-5" /> Group Discounts 10+
            </div>
          </div>

          <Link
            href="/agent/quotes/workspace?type=group&event=world-cup-2026"
            className="inline-flex items-center gap-3 bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="w-6 h-6" /> Plan Group Trip <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Group Packages */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Group Packages</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {GROUP_PACKAGES.map((pkg) => (
            <motion.div key={pkg.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                <p className="text-emerald-100">{pkg.people} people • {pkg.nights} nights</p>
              </div>
              <div className="p-5">
                <ul className="space-y-2 mb-4">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-sm text-gray-500">From</span>
                    <p className="text-2xl font-bold text-gray-900">${pkg.price}</p>
                    <span className="text-xs text-gray-500">/person</span>
                  </div>
                  <Link
                    href={`/agent/quotes/workspace?type=group&event=world-cup-2026&package=${pkg.name.toLowerCase().replace(/ /g, '-')}`}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700"
                  >
                    Customize
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Host Cities */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top US Host Cities</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {HOST_CITIES.map((city) => (
              <div key={city.city} className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900">{city.city}</h3>
                <p className="text-sm text-gray-600">{city.stadium}</p>
                <p className="text-xs text-emerald-600 mt-1">{city.matches} matches</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How Group Booking Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Users, title: "Create Group", desc: "Set group size & preferences" },
            { icon: Share2, title: "Invite Friends", desc: "Share link with your crew" },
            { icon: Ticket, title: "Everyone Books", desc: "Individual payments accepted" },
            { icon: Trophy, title: "Meet at Match", desc: "Same flights, hotel & seats" },
          ].map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <step.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold mb-4">Assemble Your World Cup Squad</h2>
          <p className="text-emerald-100 mb-6">Create your group trip and invite friends to join.</p>
          <Link
            href="/agent/quotes/workspace?type=group&event=world-cup-2026"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-100"
          >
            <Users className="w-5 h-5" /> Start Group Trip <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Related */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/world-cup-2026" className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-900">World Cup 2026 Hub</span>
              <p className="text-sm text-gray-500">Full event info, schedule & packages</p>
            </Link>
            <Link href="/group-travel" className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-900">Other Group Trips</span>
              <p className="text-sm text-gray-500">Bachelor parties, reunions & more</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
