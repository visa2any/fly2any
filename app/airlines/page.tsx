'use client';

import { motion } from 'framer-motion';
import { Plane, Star, Search, ChevronRight, Shield, Wifi, Coffee, Briefcase, Crown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const TOP_AIRLINES = [
  { name: 'Emirates', code: 'EK', rating: 4.8, logo: '/airlines/emirates.png', alliance: 'None', country: 'UAE' },
  { name: 'Singapore Airlines', code: 'SQ', rating: 4.9, logo: '/airlines/singapore.png', alliance: 'Star Alliance', country: 'Singapore' },
  { name: 'Qatar Airways', code: 'QR', rating: 4.7, logo: '/airlines/qatar.png', alliance: 'Oneworld', country: 'Qatar' },
  { name: 'Delta Air Lines', code: 'DL', rating: 4.3, logo: '/airlines/delta.png', alliance: 'SkyTeam', country: 'USA' },
  { name: 'United Airlines', code: 'UA', rating: 4.2, logo: '/airlines/united.png', alliance: 'Star Alliance', country: 'USA' },
  { name: 'American Airlines', code: 'AA', rating: 4.1, logo: '/airlines/american.png', alliance: 'Oneworld', country: 'USA' },
  { name: 'British Airways', code: 'BA', rating: 4.4, logo: '/airlines/british.png', alliance: 'Oneworld', country: 'UK' },
  { name: 'Lufthansa', code: 'LH', rating: 4.3, logo: '/airlines/lufthansa.png', alliance: 'Star Alliance', country: 'Germany' },
  { name: 'Air France', code: 'AF', rating: 4.2, logo: '/airlines/airfrance.png', alliance: 'SkyTeam', country: 'France' },
];

const ALLIANCES = [
  { name: 'Star Alliance', members: 26, color: 'bg-yellow-500' },
  { name: 'Oneworld', members: 13, color: 'bg-red-500' },
  { name: 'SkyTeam', members: 19, color: 'bg-blue-500' },
];

const FEATURES = [
  { icon: Wifi, title: 'In-Flight WiFi', desc: 'Stay connected at 35,000ft' },
  { icon: Coffee, title: 'Premium Meals', desc: 'Gourmet dining experience' },
  { icon: Briefcase, title: 'Extra Baggage', desc: 'More luggage allowance' },
  { icon: Crown, title: 'Lounge Access', desc: 'Relax before your flight' },
];

export default function AirlinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-200/50 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
              <Plane className="w-4 h-4" /> Airlines Directory
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Compare <span className="text-indigo-600">Airlines</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Find the best airlines for your journey. Compare ratings, amenities, and prices.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search airlines..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Alliances */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4">
          {ALLIANCES.map((a, i) => (
            <motion.div key={a.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100 text-center">
              <div className={`w-10 h-10 rounded-full ${a.color} mx-auto mb-3 flex items-center justify-center`}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">{a.name}</h3>
              <p className="text-sm text-gray-500">{a.members} members</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Airlines */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Top Rated Airlines</h2>
          <p className="text-gray-500 mb-8">Based on customer reviews and ratings</p>
          <div className="grid gap-4">
            {TOP_AIRLINES.map((a, i) => (
              <motion.div key={a.code} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group p-4 md:p-5 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Plane className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{a.name}</h3>
                      <p className="text-sm text-gray-500">{a.country} • {a.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hidden md:block">{a.alliance}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-gray-900">{a.rating}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">Premium Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Find Your Perfect Flight</h2>
            <p className="text-white/80 mb-8">Compare prices across all major airlines.</p>
            <Link href="/flights" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-indigo-600 font-semibold hover:bg-gray-100 transition-colors">
              <Plane className="w-5 h-5" /> Search Flights
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
