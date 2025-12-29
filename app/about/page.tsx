'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Globe, Users, Shield, Award, Plane, Hotel, Sparkles, Heart, Zap, Target, ChevronRight, Star, TrendingUp, Clock } from 'lucide-react';

const stats = [
  { icon: Plane, value: '500+', label: 'Airlines Compared', color: 'bg-blue-100 text-blue-600' },
  { icon: Hotel, value: '2M+', label: 'Hotel Properties', color: 'bg-purple-100 text-purple-600' },
  { icon: Globe, value: '190+', label: 'Countries Covered', color: 'bg-rose-100 text-rose-600' },
  { icon: Users, value: '10M+', label: 'Happy Travelers', color: 'bg-amber-100 text-amber-600' },
];

const values = [
  { icon: Shield, title: 'Radical Transparency', desc: 'No hidden fees, ever. The price you see is the price you pay. We believe trust is earned through honesty.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Award, title: 'Best Price Guarantee', desc: 'Our AI scans millions of options to find you the lowest fares. If you find cheaper, we\'ll match it.', color: 'bg-blue-100 text-blue-600' },
  { icon: Heart, title: 'Traveler First', desc: 'We build for you, not advertisers. Every feature is designed to make your journey smoother.', color: 'bg-rose-100 text-rose-600' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Search results in under 2 seconds. Because your time matters and adventure shouldn\'t wait.', color: 'bg-amber-100 text-amber-600' },
];

const features = [
  { icon: TrendingUp, title: 'Price Predictions', desc: 'AI tells you when to book for the best deal' },
  { icon: Clock, title: 'Real-Time Alerts', desc: 'Get notified when prices drop on your routes' },
  { icon: Star, title: 'Smart Recommendations', desc: 'Personalized suggestions based on your style' },
  { icon: Target, title: 'Flexible Search', desc: 'Search by dates, budget, or destination type' },
];

const timeline = [
  { year: '2024', title: 'Founded', desc: 'Fly2Any launches with a mission to revolutionize travel search' },
  { year: '2024', title: 'AI Integration', desc: 'Introduced machine learning for price predictions' },
  { year: '2024', title: '1M Searches', desc: 'Reached our first million flight searches' },
  { year: '2025', title: 'Global Expansion', desc: 'Now serving travelers in 190+ countries' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 md:pb-24 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> Our Story
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Making Travel
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">Effortlessly Simple</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              We&apos;re building the world&apos;s smartest travel search platform,
              powered by AI to help you find the perfect trip at the perfect price.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                Start Searching <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white border border-gray-200 font-semibold hover:bg-gray-50 transition-colors">
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 bg-white/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Our Mission</span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2 mb-6">
                Travel should be <span className="text-purple-600">accessible</span> to everyone
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Fly2Any was born from a simple frustration: finding affordable travel shouldn&apos;t be complicated.
                We saw an industry full of hidden fees, confusing comparisons, and wasted time.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                So we built something different. Using AI and machine learning, we compare prices across
                500+ airlines and 2 million hotels in real-time, ensuring you always get the best deal
                with complete transparency.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                No hidden fees. No sponsored rankings. Just honest, intelligent search that puts travelers first.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-100 via-purple-100 to-rose-100 p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {features.map((f, i) => (
                    <motion.div key={f.title} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
                      <f.icon className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-semibold text-gray-900 text-sm">{f.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What We Stand For</h2>
            <p className="text-white/80 max-w-xl mx-auto">The principles that guide everything we build</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-colors group">
                <div className={`w-12 h-12 rounded-xl ${v.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From idea to millions of searches</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-rose-500 hidden md:block" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`flex flex-col md:flex-row items-center gap-4 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : ''}`}>
                    <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                      <span className="text-sm font-bold text-purple-600">{item.year}</span>
                      <h3 className="text-lg font-semibold text-gray-900 mt-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-4 border-white shadow-lg hidden md:block" />
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 text-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Find Your Next Adventure?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">Join millions of travelers who trust Fly2Any to find the best deals.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors">
                  Search Flights <Plane className="w-5 h-5" />
                </Link>
                <Link href="/hotels" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors">
                  Find Hotels <Hotel className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
