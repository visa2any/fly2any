'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plane, Star, Shield, MapPin, Globe, Heart, Mountain,
  ChevronDown, ArrowRight, CheckCircle2, Headphones, Compass,
  Sparkles, Users, Wallet, Camera, Coffee, Sun, Zap, Send,
  Quote, TrendingUp, Award
} from 'lucide-react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';

const soloData = {
  categories: [
    { name: 'Safest Destinations', icon: Shield, color: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', destinations: ['Iceland', 'Japan', 'New Zealand', 'Portugal', 'Singapore'], desc: 'Travel with peace of mind' },
    { name: 'Budget-Friendly', icon: Wallet, color: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50', textColor: 'text-amber-700', destinations: ['Thailand', 'Vietnam', 'Portugal', 'Mexico', 'Colombia'], desc: 'Amazing trips, any budget' },
    { name: 'Adventure Travel', icon: Mountain, color: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50', textColor: 'text-blue-700', destinations: ['New Zealand', 'Costa Rica', 'Norway', 'Peru', 'Iceland'], desc: 'Thrill-seeking experiences' },
    { name: 'Self-Discovery', icon: Heart, color: 'from-rose-500 to-pink-600', bgLight: 'bg-rose-50', textColor: 'text-rose-700', destinations: ['Bali', 'India', 'Japan', 'Peru', 'Greece'], desc: 'Find yourself abroad' },
  ],
  topDestinations: [
    { name: 'Japan', code: 'TYO', emoji: '🗾', why: 'Ultra-safe, incredible culture, easy to navigate solo', bestFor: 'First-time solo travelers', rating: 4.9, image: 'from-red-400 to-rose-600' },
    { name: 'Portugal', code: 'LIS', emoji: '🇵🇹', why: 'Affordable, friendly locals, great food scene', bestFor: 'Budget solo travel', rating: 4.8, image: 'from-green-400 to-emerald-600' },
    { name: 'Iceland', code: 'KEF', emoji: '🇮🇸', why: 'Safest country, dramatic landscapes, adventure', bestFor: 'Solo adventure seekers', rating: 4.9, image: 'from-cyan-400 to-blue-600' },
    { name: 'Thailand', code: 'BKK', emoji: '🇹🇭', why: 'Backpacker paradise, affordable, amazing food', bestFor: 'Budget travelers', rating: 4.7, image: 'from-amber-400 to-orange-600' },
    { name: 'New Zealand', code: 'AKL', emoji: '🇳🇿', why: 'Safe, adventure activities, stunning nature', bestFor: 'Adventure solo travel', rating: 4.9, image: 'from-emerald-400 to-teal-600' },
    { name: 'Bali', code: 'DPS', emoji: '🌴', why: 'Spiritual retreats, wellness, affordable luxury', bestFor: 'Self-discovery journeys', rating: 4.8, image: 'from-purple-400 to-violet-600' },
  ],
  tips: [
    { icon: Users, title: 'Share Your Itinerary', desc: 'Always let someone know where you\'re going and check in regularly.' },
    { icon: Coffee, title: 'Stay in Social Hostels', desc: 'Great way to meet other travelers and find trip companions.' },
    { icon: Globe, title: 'Learn Basic Phrases', desc: 'Even a few local words can open doors and build connections.' },
    { icon: Shield, title: 'Trust Your Instincts', desc: 'If something feels off, remove yourself from the situation.' },
    { icon: MapPin, title: 'Book First Night Ahead', desc: 'Arrive with accommodation sorted to reduce stress.' },
    { icon: Camera, title: 'Join Walking Tours', desc: 'Free or paid tours are perfect for meeting fellow travelers.' },
  ],
  faqs: [
    { q: 'Is solo travel safe?', a: 'Yes! With proper planning and awareness, solo travel is very safe. Millions of people travel alone each year. Choose safe destinations, stay aware of your surroundings, and trust your instincts.' },
    { q: 'What are the best countries for first-time solo travelers?', a: 'Japan, Portugal, Iceland, and New Zealand are perfect for first-timers. They offer safety, easy navigation, English speakers, and welcoming cultures.' },
    { q: 'Is solo travel more expensive?', a: 'It can be, as you can\'t split accommodation. However, hostels, home-stays, and choosing budget destinations can make solo travel very affordable.' },
    { q: 'How do I meet people while traveling solo?', a: 'Stay in social hostels, join walking tours, use apps like Meetup or Couchsurfing, take group activities, and eat at communal tables.' },
    { q: 'Is solo travel good for introverts?', a: 'Absolutely! Solo travel lets you control your social energy. You can be alone when needed and social when you want. It\'s incredibly liberating for introverts.' },
  ],
  stats: [
    { value: '50+', label: 'Destinations', icon: Globe },
    { value: '4.9', label: 'Safety Rating', icon: Shield },
    { value: '100K+', label: 'Solo Travelers', icon: Users },
    { value: '24/7', label: 'Support', icon: Headphones },
  ],
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="border-b border-gray-100 last:border-0"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <motion.button
        onClick={() => setOpen(!open)}
        className={`w-full py-5 flex items-center justify-between text-left transition-colors ${open ? 'bg-violet-50' : 'hover:bg-gray-50'} px-5 -mx-5 rounded-xl`}
        whileTap={{ scale: 0.995 }}
      >
        <span className="font-semibold text-gray-900 pr-4">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${open ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-600 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SoloTravelPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Level-6 Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Compass className="w-4 h-4 text-violet-300" />
              <span className="text-sm font-medium text-white/90">Solo Travel Guide 2025</span>
              <span className="px-2 py-0.5 bg-violet-500 text-white text-xs font-bold rounded-full">NEW</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Solo Travel <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Adventures</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Discover the world on your own terms. Safe destinations, expert tips, and unforgettable solo journeys await you.
            </p>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {soloData.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4"
                >
                  <stat.icon className="w-5 h-5 text-violet-300 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-6 md:p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <EnhancedSearchBar compact={false} />
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/80 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { icon: CheckCircle2, text: 'Best Price Guarantee', color: 'text-emerald-400' },
              { icon: Shield, text: 'Safe Travel Tips', color: 'text-blue-400' },
              { icon: Headphones, text: '24/7 Support', color: 'text-amber-400' },
            ].map((badge, i) => (
              <span key={i} className="flex items-center gap-2">
                <badge.icon className={`w-5 h-5 ${badge.color}`} />
                {badge.text}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories - Interactive */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Solo Travel by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Find your perfect solo adventure based on what matters most to you</p>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {soloData.categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={i}
                  onClick={() => setActiveCategory(i)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeCategory === i
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : `${cat.bgLight} ${cat.textColor} hover:shadow-md`
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{cat.name}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Active Category Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-br ${soloData.categories[activeCategory].color} rounded-3xl p-8 md:p-10`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {(() => { const Icon = soloData.categories[activeCategory].icon; return <Icon className="w-10 h-10 text-white/90" />; })()}
                    <div>
                      <h3 className="text-2xl font-bold text-white">{soloData.categories[activeCategory].name}</h3>
                      <p className="text-white/80">{soloData.categories[activeCategory].desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {soloData.categories[activeCategory].destinations.map((dest, j) => (
                      <motion.div
                        key={dest}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: j * 0.05 }}
                        className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-white text-center font-medium hover:bg-white/30 transition-colors cursor-pointer"
                      >
                        {dest}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-16 md:py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="flex items-center gap-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-3 bg-violet-100 rounded-xl">
              <MapPin className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Solo Travel Destinations</h2>
              <p className="text-gray-500">Handpicked destinations perfect for traveling alone</p>
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {soloData.topDestinations.map((dest, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Link
                  href={`/journey/flights?destination=${dest.code}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:border-violet-200 transition-all duration-300"
                >
                  {/* Card Header with Gradient */}
                  <div className={`h-24 bg-gradient-to-br ${dest.image} relative`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-4 left-5 flex items-center gap-3">
                      <span className="text-4xl">{dest.emoji}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                        <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{dest.code}</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                      <span className="text-xs font-bold text-white">{dest.rating}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <p className="text-gray-600 text-sm mb-3">{dest.why}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                        {dest.bestFor}
                      </span>
                      <span className="flex items-center gap-1 text-violet-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        Search <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solo Travel Tips */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-700">Expert Tips</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Essential Solo Travel Tips</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Proven advice from experienced solo travelers to make your journey safe and unforgettable</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {soloData.tips.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -4 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{tip.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{tip.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Newsletter - Premium */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Join 50,000+ Solo Travelers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get Solo Travel Deals & Tips</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">Exclusive flight deals, safety tips, and destination guides delivered to your inbox weekly.</p>

            <form
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              onSubmit={(e) => { e.preventDefault(); alert('Welcome to the solo travel community!'); setEmail(''); }}
            >
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all"
                />
              </div>
              <motion.button
                type="submit"
                className="px-8 py-4 bg-white text-violet-700 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-5 h-5" />
                Subscribe
              </motion.button>
            </form>
            <p className="text-white/60 text-xs mt-4">Weekly tips. Unsubscribe anytime. No spam.</p>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Solo Travel FAQ</h2>
            <p className="text-gray-600">Answers to the most common questions about traveling alone</p>
          </motion.div>

          <div className="bg-gray-50 rounded-3xl p-6 md:p-8">
            {soloData.faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            className="prose prose-gray max-w-none"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Solo Travel Destinations 2025</h2>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <p className="text-gray-600 leading-relaxed mb-4">
                Planning a solo trip? Fly2Any helps you find the best destinations for traveling alone. Whether you're seeking safe solo travel destinations, budget-friendly adventures, or transformative self-discovery journeys, our guide covers it all.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Top solo travel destinations include <strong>Japan</strong> (ultra-safe, rich culture), <strong>Portugal</strong> (affordable, friendly), <strong>Iceland</strong> (safest country, adventure), and <strong>Bali</strong> (spiritual, wellness). Each offers unique experiences for solo travelers.
              </p>
              <p className="text-gray-500 text-sm">
                Popular searches: solo travel destinations, best places to travel alone, safe solo travel, solo female travel destinations, budget solo travel, solo adventure travel, solo travel tips.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-16 h-16 text-violet-300 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready for Your Solo Adventure?</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Compare flights from 500+ airlines and start your solo journey today.
            </p>
            <Link
              href="/journey/flights"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-violet-700 font-bold rounded-2xl hover:bg-gray-100 transition-all text-lg shadow-2xl shadow-black/20 hover:shadow-xl"
            >
              <Plane className="w-6 h-6" />
              Search Flights
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
