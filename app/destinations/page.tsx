'use client';

import { motion } from 'framer-motion';
import { MapPin, Plane, Star, TrendingUp, Search, ChevronRight, Sun, Palmtree, Building2, Mountain } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const FEATURED = [
  { name: 'Paris', country: 'France', code: 'CDG', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', price: 299 },
  { name: 'Tokyo', country: 'Japan', code: 'NRT', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', price: 599 },
  { name: 'New York', country: 'USA', code: 'JFK', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80', price: 199 },
  { name: 'Dubai', country: 'UAE', code: 'DXB', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', price: 449 },
  { name: 'London', country: 'UK', code: 'LHR', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80', price: 349 },
  { name: 'Bali', country: 'Indonesia', code: 'DPS', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', price: 699 },
];

const CATEGORIES = [
  { icon: Sun, title: 'Beach', desc: 'Sun, sand & relaxation', color: 'bg-amber-500' },
  { icon: Building2, title: 'City', desc: 'Urban adventures', color: 'bg-blue-500' },
  { icon: Mountain, title: 'Nature', desc: 'Mountains & wilderness', color: 'bg-green-500' },
  { icon: Palmtree, title: 'Tropical', desc: 'Island escapes', color: 'bg-teal-500' },
];

const TRENDING = [
  { name: 'Cancun', country: 'Mexico', trend: '+45%' },
  { name: 'Maldives', country: 'Maldives', trend: '+38%' },
  { name: 'Barcelona', country: 'Spain', trend: '+32%' },
  { name: 'Bangkok', country: 'Thailand', trend: '+28%' },
  { name: 'Rome', country: 'Italy', trend: '+25%' },
  { name: 'Sydney', country: 'Australia', trend: '+22%' },
];

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold mb-6">
              <MapPin className="w-4 h-4" /> Explore Destinations
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Your Next <span className="text-sky-600">Adventure</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Explore 500+ destinations worldwide with the best flight deals.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search destinations..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="group p-5 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 cursor-pointer transition-all">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">{c.title}</h3>
              <p className="text-sm text-gray-500">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Featured Destinations</h2>
          <p className="text-gray-500 mb-8">Top picks from our travel experts</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {FEATURED.map((d, i) => (
              <motion.div key={d.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer">
                <Image src={d.image} alt={d.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">{d.name}</h3>
                  <p className="text-white/70 text-sm">{d.country}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-white/60 text-xs">{d.code}</span>
                    <span className="text-white font-semibold">From ${d.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-500" /> Trending Now
          </h2>
          <p className="text-gray-500 mb-8">Most searched destinations this month</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TRENDING.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <p className="text-sm text-gray-500">{t.country}</p>
                </div>
                <span className="text-green-600 font-semibold text-sm">{t.trend}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Explore?</h2>
            <p className="text-white/80 mb-8">Find the best flight deals to your dream destination.</p>
            <Link href="/flights" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-sky-600 font-semibold hover:bg-gray-100 transition-colors">
              <Plane className="w-5 h-5" /> Search Flights
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
