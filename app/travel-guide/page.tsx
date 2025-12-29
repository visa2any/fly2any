'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Globe, Shield, Plane, Building2,
  Wallet, Sun, Train, Heart, ChevronRight, Sparkles,
  BookOpen, ExternalLink, AlertTriangle
} from 'lucide-react';
import TravelTipCard from '@/components/guide/TravelTipCard';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { RelatedCTA } from '@/components/seo/RelatedLinks';

// Enhanced travel data with more destinations
const travelTips = [
  {
    id: '1',
    destination: 'Paris',
    category: 'visa' as const,
    title: 'Visa Requirements for France',
    description: 'US citizens can visit France visa-free for up to 90 days within a 180-day period for tourism.',
    icon: '🛂',
    urgency: 'high' as const,
    details: [
      'Passport must be valid for at least 3 months beyond your planned departure',
      'Proof of sufficient funds may be requested',
      'Return ticket or proof of onward travel required',
      'Travel insurance recommended (min 30,000 EUR coverage)',
    ],
  },
  {
    id: '2',
    destination: 'Paris',
    category: 'currency' as const,
    title: 'Currency & Money Matters',
    description: 'France uses the Euro (EUR). Credit cards widely accepted, but cash useful for small purchases.',
    icon: '💶',
    urgency: 'medium' as const,
    details: [
      'ATMs available throughout the city',
      'Notify your bank before traveling',
      'Tipping: 5-10% in restaurants (service usually included)',
      'Many places accept contactless payments',
    ],
  },
  {
    id: '3',
    destination: 'Paris',
    category: 'weather' as const,
    title: 'Best Time to Visit Paris',
    description: 'Spring (April-June) and Fall (September-October) offer pleasant weather and fewer crowds.',
    icon: '🌤️',
    urgency: 'low' as const,
    details: [
      'Summer (July-Aug): Warm but crowded, many locals on vacation',
      'Winter (Dec-Feb): Cold but magical, especially during Christmas',
      'Pack layers - weather can be unpredictable',
      'Rain is common year-round, bring an umbrella',
    ],
  },
  {
    id: '4',
    destination: 'Paris',
    category: 'safety' as const,
    title: 'Safety Tips for Paris',
    description: 'Paris is generally safe, but be aware of pickpockets in tourist areas and public transport.',
    icon: '🛡️',
    urgency: 'high' as const,
    details: [
      'Keep valuables in inside pockets or money belt',
      'Be extra cautious near major attractions and metro stations',
      'Avoid showing expensive jewelry or electronics',
      'Emergency number: 112 (police: 17, ambulance: 15)',
    ],
  },
  {
    id: '5',
    destination: 'Paris',
    category: 'culture' as const,
    title: 'Cultural Etiquette',
    description: 'Parisians appreciate when visitors make an effort to speak French and observe local customs.',
    icon: '🗼',
    urgency: 'medium' as const,
    details: [
      'Always greet with "Bonjour" before asking questions',
      'Dress code: Generally more formal than casual',
      'Learn basic French phrases - locals appreciate the effort',
      'Avoid eating on the metro or speaking loudly in public',
    ],
  },
  {
    id: '6',
    destination: 'Paris',
    category: 'transport' as const,
    title: 'Getting Around Paris',
    description: 'The Paris Metro is efficient and affordable. Consider getting a Paris Visite travel pass.',
    icon: '🚇',
    urgency: 'medium' as const,
    details: [
      'Metro runs 5:30am-1:15am (2:15am Fri-Sat)',
      'Single ticket: ~2 EUR, Day pass: ~8 EUR',
      'Paris Visite pass includes metro, buses, and some discounts',
      'Many attractions walkable - comfortable shoes essential',
    ],
  },
  {
    id: '7',
    destination: 'Tokyo',
    category: 'visa' as const,
    title: 'Japan Visa Information',
    description: 'Most visitors can enter Japan visa-free for tourism for up to 90 days.',
    icon: '🛂',
    urgency: 'high' as const,
    details: [
      'Valid passport required (at least 6 months)',
      'Return ticket or proof of onward travel',
      'Sufficient funds for your stay',
      'Visit Japan Web for digital customs declaration',
    ],
  },
  {
    id: '8',
    destination: 'Tokyo',
    category: 'currency' as const,
    title: 'Japanese Yen & Payments',
    description: 'Japan uses Yen (JPY). Cash is still king - many places do not accept cards.',
    icon: '💴',
    urgency: 'high' as const,
    details: [
      'Withdraw cash at 7-Eleven ATMs (most accept foreign cards)',
      'IC cards (Suica/Pasmo) useful for transport and convenience stores',
      'Credit cards accepted at major hotels and department stores',
      'No tipping culture in Japan',
    ],
  },
  {
    id: '9',
    destination: 'Tokyo',
    category: 'culture' as const,
    title: 'Japanese Cultural Etiquette',
    description: 'Respect is central to Japanese culture. Learn basic etiquette to avoid social faux pas.',
    icon: '🏯',
    urgency: 'high' as const,
    details: [
      'Bow when greeting (slight bow is fine)',
      'Remove shoes when entering homes and some restaurants',
      'Do not tip - it can be seen as insulting',
      'Speak quietly on public transport',
      'Do not eat while walking',
    ],
  },
  {
    id: '10',
    destination: 'Dubai',
    category: 'culture' as const,
    title: 'Dubai Cultural Guidelines',
    description: 'Dubai is modern but conservative. Dress modestly and respect local customs.',
    icon: '🕌',
    urgency: 'high' as const,
    details: [
      'Dress code: Cover shoulders and knees in public',
      'Public displays of affection should be minimal',
      'Alcohol only in licensed venues (hotels, restaurants)',
      'Photography: Ask permission before photographing locals',
    ],
  },
  {
    id: '11',
    destination: 'London',
    category: 'transport' as const,
    title: 'Getting Around London',
    description: 'The Tube is the fastest way around. Get an Oyster card or use contactless payment.',
    icon: '🚇',
    urgency: 'medium' as const,
    details: [
      'Oyster card or contactless is cheaper than single tickets',
      'Tube runs 5am-midnight (24hr on weekends)',
      'Boris bikes available for short trips',
      'Black cabs expensive but reliable',
    ],
  },
  {
    id: '12',
    destination: 'New York',
    category: 'safety' as const,
    title: 'NYC Safety Tips',
    description: 'New York is generally safe but stay aware in crowded areas and late at night.',
    icon: '🗽',
    urgency: 'medium' as const,
    details: [
      'Avoid Times Square scams and costumed characters demanding money',
      'Keep valuables hidden on subway',
      'Use official yellow cabs or rideshare apps',
      'Emergency: 911',
    ],
  },
];

const destinations = [
  { id: 'paris', name: 'Paris', icon: '🗼', image: 'from-rose-400 to-pink-600', country: 'France' },
  { id: 'tokyo', name: 'Tokyo', icon: '🗾', image: 'from-red-400 to-rose-600', country: 'Japan' },
  { id: 'dubai', name: 'Dubai', icon: '🏙️', image: 'from-amber-400 to-orange-600', country: 'UAE' },
  { id: 'london', name: 'London', icon: '🏰', image: 'from-blue-400 to-indigo-600', country: 'UK' },
  { id: 'newyork', name: 'New York', icon: '🗽', image: 'from-slate-400 to-zinc-600', country: 'USA' },
];

const categories = [
  { value: 'all', label: 'All Tips', icon: BookOpen, color: 'from-gray-500 to-gray-700' },
  { value: 'visa', label: 'Visa & Entry', icon: Globe, color: 'from-blue-500 to-blue-700' },
  { value: 'currency', label: 'Currency', icon: Wallet, color: 'from-green-500 to-emerald-700' },
  { value: 'weather', label: 'Weather', icon: Sun, color: 'from-yellow-500 to-orange-600' },
  { value: 'safety', label: 'Safety', icon: Shield, color: 'from-red-500 to-rose-700' },
  { value: 'culture', label: 'Culture', icon: Heart, color: 'from-purple-500 to-violet-700' },
  { value: 'transport', label: 'Transport', icon: Train, color: 'from-indigo-500 to-blue-700' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function TravelGuidePage() {
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredTips = useMemo(() => {
    return travelTips
      .filter(tip => selectedDestination === 'all' || tip.destination === selectedDestination)
      .filter(tip => selectedCategory === 'all' || tip.category === selectedCategory)
      .filter(tip =>
        searchQuery === '' ||
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [selectedDestination, selectedCategory, searchQuery]);

  const tipCounts = useMemo(() => {
    const counts: Record<string, number> = { all: travelTips.length };
    destinations.forEach(d => {
      counts[d.name] = travelTips.filter(t => t.destination === d.name).length;
    });
    return counts;
  }, []);

  const essentialTips = filteredTips.filter(tip => tip.urgency === 'high');
  const importantTips = filteredTips.filter(tip => tip.urgency === 'medium');
  const generalTips = filteredTips.filter(tip => !tip.urgency || tip.urgency === 'low');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Level-6 Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/30 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <MaxWidthContainer className="relative z-10 py-16 md:py-24">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium text-white/90">Your Travel Companion</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
              Travel <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Guides</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Expert tips for visa, currency, safety, and culture. Everything you need for a perfect trip.
            </p>

            {/* Premium Search Bar */}
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur-xl opacity-0 transition-opacity duration-300 ${isSearchFocused ? 'opacity-30' : ''}`} />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                  <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearchFocused ? 'text-teal-400' : 'text-white/50'}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search destinations, tips, or topics..."
                    className="w-full px-14 py-5 bg-transparent text-white placeholder-white/50 focus:outline-none text-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </MaxWidthContainer>
      </section>

      <MaxWidthContainer className="py-8 md:py-12">
        {/* Destination Cards */}
        <motion.section
          className="mb-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-teal-600" />
            Choose Your Destination
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {/* All Destinations Card */}
            <motion.button
              variants={itemVariants}
              onClick={() => setSelectedDestination('all')}
              className={`group relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300 ${
                selectedDestination === 'all'
                  ? 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-xl shadow-teal-500/25 scale-[1.02]'
                  : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-100'
              }`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`text-3xl md:text-4xl mb-2 transition-transform group-hover:scale-110 ${selectedDestination === 'all' ? 'grayscale-0' : ''}`}>
                🌍
              </div>
              <div className={`text-sm md:text-base font-bold ${selectedDestination === 'all' ? 'text-white' : 'text-gray-900'}`}>
                All
              </div>
              <div className={`text-xs ${selectedDestination === 'all' ? 'text-white/80' : 'text-gray-500'}`}>
                {tipCounts.all} tips
              </div>
            </motion.button>

            {destinations.map((dest) => (
              <motion.button
                key={dest.id}
                variants={itemVariants}
                onClick={() => setSelectedDestination(dest.name)}
                className={`group relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300 ${
                  selectedDestination === dest.name
                    ? `bg-gradient-to-br ${dest.image} shadow-xl scale-[1.02]`
                    : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-100'
                }`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl md:text-4xl mb-2 transition-transform group-hover:scale-110">
                  {dest.icon}
                </div>
                <div className={`text-sm md:text-base font-bold ${selectedDestination === dest.name ? 'text-white' : 'text-gray-900'}`}>
                  {dest.name}
                </div>
                <div className={`text-xs ${selectedDestination === dest.name ? 'text-white/80' : 'text-gray-500'}`}>
                  {tipCounts[dest.name] || 0} tips
                </div>
                {tipCounts[dest.name] > 0 && selectedDestination !== dest.name && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Category Filter Pills */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-teal-600" />
            Filter by Category
          </h2>

          <div className="flex flex-wrap gap-2 md:gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value;
              return (
                <motion.button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className="text-sm">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Results Summary */}
        {(selectedDestination !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <motion.div
            className="mb-8 flex items-center justify-between flex-wrap gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-600">
              Showing <span className="font-bold text-gray-900">{filteredTips.length}</span> tips
              {selectedDestination !== 'all' && <span> for <span className="font-semibold text-teal-600">{selectedDestination}</span></span>}
              {selectedCategory !== 'all' && <span> in <span className="font-semibold text-teal-600">{categories.find(c => c.value === selectedCategory)?.label}</span></span>}
            </p>
            <button
              onClick={() => { setSelectedDestination('all'); setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              Clear filters
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Tips Sections */}
        <AnimatePresence mode="wait">
          {filteredTips.length > 0 ? (
            <motion.div
              key="tips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Essential Tips */}
              {essentialTips.length > 0 && (
                <motion.section
                  className="mb-12"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-red-100 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">Essential Information</h2>
                      <p className="text-sm text-gray-500">Must-know tips before you travel</p>
                    </div>
                  </motion.div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {essentialTips.map((tip, i) => (
                      <motion.div key={tip.id} variants={itemVariants} custom={i}>
                        <TravelTipCard tip={tip} expanded={true} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Important Tips */}
              {importantTips.length > 0 && (
                <motion.section
                  className="mb-12"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-amber-100 rounded-xl">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">Important to Know</h2>
                      <p className="text-sm text-gray-500">Helpful tips for a better experience</p>
                    </div>
                  </motion.div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {importantTips.map((tip, i) => (
                      <motion.div key={tip.id} variants={itemVariants} custom={i}>
                        <TravelTipCard tip={tip} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* General Tips */}
              {generalTips.length > 0 && (
                <motion.section
                  className="mb-12"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-teal-100 rounded-xl">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">Good to Know</h2>
                      <p className="text-sm text-gray-500">Extra tips to enhance your trip</p>
                    </div>
                  </motion.div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {generalTips.map((tip, i) => (
                      <motion.div key={tip.id} variants={itemVariants} custom={i}>
                        <TravelTipCard tip={tip} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No tips found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Try selecting a different destination or category to discover travel tips.
              </p>
              <button
                onClick={() => { setSelectedDestination('all'); setSelectedCategory('all'); setSearchQuery(''); }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all"
              >
                Reset Filters
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Resources Section */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Travel Resources</h2>
            <p className="text-gray-600">Everything you need to plan your perfect trip</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Travel Insurance', desc: 'Protect yourself with comprehensive coverage for any unexpected events.', link: '/travel-insurance', color: 'from-blue-500 to-indigo-600' },
              { icon: Plane, title: 'Flight Deals', desc: 'Compare prices across all major airlines and find the best deals.', link: '/flights', color: 'from-teal-500 to-cyan-600' },
              { icon: Building2, title: 'Hotel Booking', desc: 'Find and book the perfect accommodation for your trip.', link: '/hotels', color: 'from-purple-500 to-violet-600' },
            ].map((resource, i) => (
              <motion.a
                key={resource.title}
                href={resource.link}
                className="group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${resource.color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${resource.color} mb-4`}>
                  <resource.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{resource.desc}</p>
                <span className="inline-flex items-center text-sm font-semibold text-teal-600 group-hover:gap-2 transition-all">
                  Learn more <ExternalLink className="w-4 h-4 ml-1" />
                </span>
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <div className="mt-12">
          <RelatedCTA
            title="Ready to Book Your Trip?"
            description="Search for the best flight deals to your dream destination."
            href="/flights"
            buttonText="Search Flights"
          />
        </div>

        {/* Disclaimer */}
        <motion.div
          className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Important Notice</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Travel information is subject to change. Always verify visa requirements, travel advisories, and local regulations with official sources before your trip. This guide provides general information only.
              </p>
            </div>
          </div>
        </motion.div>
      </MaxWidthContainer>
    </div>
  );
}
