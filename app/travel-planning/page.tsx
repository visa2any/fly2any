'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plane, Calendar, DollarSign, MapPin, CheckSquare, Luggage,
  Clock, Globe, Star, Shield, ChevronDown, ArrowRight, CheckCircle2,
  Headphones, Compass, ListChecks, Wallet, Hotel, Car, Send,
  Sparkles, Target, Zap, Award, Check
} from 'lucide-react';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';

const planningData = {
  steps: [
    { step: 1, title: 'Choose Destination', icon: MapPin, color: 'from-rose-500 to-pink-600', desc: 'Research destinations based on interests, budget, and season', tips: ['Consider visa requirements', 'Check travel advisories', 'Look at weather patterns'] },
    { step: 2, title: 'Set Your Budget', icon: Wallet, color: 'from-emerald-500 to-teal-600', desc: 'Calculate total trip cost including buffer', tips: ['Use 50/30/20 rule', 'Add 15% emergency buffer', 'Track exchange rates'] },
    { step: 3, title: 'Book Flights', icon: Plane, color: 'from-sky-500 to-blue-600', desc: 'Compare prices and book at optimal time', tips: ['Book 6-8 weeks ahead', '2-4 months for international', 'Use price alerts'] },
    { step: 4, title: 'Book Accommodation', icon: Hotel, color: 'from-violet-500 to-purple-600', desc: 'Find the right stay for your style', tips: ['Compare options', 'Book refundable when possible', 'Check transport links'] },
    { step: 5, title: 'Plan Activities', icon: Compass, color: 'from-amber-500 to-orange-600', desc: 'Research and book tours and experiences', tips: ['Pre-book popular attractions', 'Leave room for spontaneity', 'Check combo deals'] },
    { step: 6, title: 'Prepare & Pack', icon: Luggage, color: 'from-indigo-500 to-blue-600', desc: 'Use checklists and pack smart', tips: ['Start list a week ahead', 'Check baggage rules', 'Pack versatile clothing'] },
  ],
  budgetGuide: [
    { category: 'Budget', daily: '$30-60', destinations: 'SE Asia, Eastern Europe, Central America', includes: 'Hostels, street food, public transport', color: 'from-emerald-500 to-teal-600', emoji: '🎒' },
    { category: 'Mid-Range', daily: '$100-200', destinations: 'Western Europe, Japan, Australia', includes: 'Hotels, restaurants, some tours', color: 'from-sky-500 to-blue-600', emoji: '🏨' },
    { category: 'Luxury', daily: '$300+', destinations: 'Anywhere', includes: 'Premium hotels, fine dining, private tours', color: 'from-amber-500 to-orange-600', emoji: '✨' },
  ],
  packingEssentials: [
    { item: 'Passport & copies', icon: '📄' },
    { item: 'Travel insurance docs', icon: '🛡️' },
    { item: 'Phone charger & adapter', icon: '🔌' },
    { item: 'Medications', icon: '💊' },
    { item: 'Comfortable shoes', icon: '👟' },
    { item: 'Weather layers', icon: '🧥' },
    { item: 'Toiletries (3-1-1)', icon: '🧴' },
    { item: 'Camera', icon: '📷' },
    { item: 'Day bag', icon: '🎒' },
    { item: 'Entertainment', icon: '🎧' },
  ],
  faqs: [
    { q: 'How far in advance should I plan a trip?', a: 'For international trips, start 3-6 months ahead. Domestic trips can be planned 1-3 months in advance. Peak seasons and popular destinations need more lead time.' },
    { q: 'How do I find cheap flights?', a: 'Use flight comparison sites like Fly2Any, set price alerts, be flexible with dates, book 6-8 weeks ahead for domestic and 2-4 months for international.' },
    { q: 'What\'s the best way to create a travel budget?', a: 'Calculate: flights + accommodation + (daily food × days) + activities + transport + 15% buffer. Research destination-specific costs.' },
    { q: 'Should I book everything in advance?', a: 'Book flights and first night accommodation. For popular destinations, pre-book key attractions. Leave some flexibility for spontaneous discoveries.' },
    { q: 'How do I avoid travel scams?', a: 'Research common scams, book through verified platforms, never show large amounts of cash, and be wary of unsolicited help.' },
  ],
  stats: [
    { value: '500+', label: 'Destinations', icon: Globe },
    { value: '6 Steps', label: 'Planning Guide', icon: ListChecks },
    { value: '4.9', label: 'User Rating', icon: Star },
    { value: '24/7', label: 'Support', icon: Headphones },
  ],
  quickLinks: [
    { href: '/journey/flights', icon: Plane, title: 'Search Flights', desc: 'Compare 500+ airlines', color: 'from-sky-500 to-blue-600' },
    { href: '/hotels', icon: Hotel, title: 'Find Hotels', desc: 'Best rates guaranteed', color: 'from-violet-500 to-purple-600' },
    { href: '/cars', icon: Car, title: 'Rent Cars', desc: 'Airport pickup', color: 'from-emerald-500 to-teal-600' },
    { href: '/travel-insurance', icon: Shield, title: 'Get Insurance', desc: 'Travel protected', color: 'from-amber-500 to-orange-600' },
  ],
};

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
        className={`w-full py-5 flex items-center justify-between text-left transition-colors ${open ? 'bg-sky-50' : 'hover:bg-gray-50'} px-5 -mx-5 rounded-xl`}
        whileTap={{ scale: 0.995 }}
      >
        <span className="font-semibold text-gray-900 pr-4">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${open ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-500'}`}
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

export default function TravelPlanningPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Level-6 Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-900 via-blue-800 to-indigo-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-600/20 via-transparent to-transparent" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ListChecks className="w-4 h-4 text-sky-300" />
              <span className="text-sm font-medium text-white/90">Complete Planning Guide</span>
              <span className="px-2 py-0.5 bg-sky-500 text-white text-xs font-bold rounded-full">2025</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Travel <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">Planning</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Plan your perfect trip step by step. From destination research to packing lists, we've got you covered.
            </p>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {planningData.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4"
                >
                  <stat.icon className="w-5 h-5 text-sky-300 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-6 md:p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <EnhancedSearchBar compact={false} />
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/80 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { icon: CheckCircle2, text: 'Best Price Guarantee', color: 'text-emerald-400' },
              { icon: Target, text: 'Expert Tips', color: 'text-sky-400' },
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

      {/* Planning Steps - Interactive Timeline */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-sky-700">Step-by-Step Guide</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How to Plan Your Trip</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Follow these 6 steps for stress-free travel planning</p>
          </motion.div>

          {/* Step Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {planningData.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    activeStep === i
                      ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === i ? 'bg-white/20' : 'bg-gray-200'}`}>
                    {step.step}
                  </span>
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline text-sm">{step.title}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Active Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-br ${planningData.steps[activeStep].color} rounded-3xl p-8 md:p-10`}
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      {(() => { const Icon = planningData.steps[activeStep].icon; return <Icon className="w-8 h-8 text-white" />; })()}
                    </div>
                    <div>
                      <span className="text-white/70 text-sm font-medium">Step {planningData.steps[activeStep].step} of 6</span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white">{planningData.steps[activeStep].title}</h3>
                    </div>
                  </div>
                  <p className="text-white/90 text-lg mb-6">{planningData.steps[activeStep].desc}</p>
                  <div className="space-y-3">
                    {planningData.steps[activeStep].tips.map((tip, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: j * 0.1 }}
                        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                      >
                        <Check className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">{tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Budget Guide */}
      <section className="py-16 md:py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="flex items-center gap-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-3 bg-sky-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Travel Budget Guide</h2>
              <p className="text-gray-500">Plan your spending for any travel style</p>
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {planningData.budgetGuide.map((budget, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                <div className={`h-3 bg-gradient-to-r ${budget.color}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{budget.emoji}</span>
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">{budget.daily}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{budget.category}</h3>
                  <p className="text-xs text-gray-500 mb-4">per day</p>
                  <p className="text-sm text-gray-600 mb-2"><strong>Best for:</strong> {budget.destinations}</p>
                  <p className="text-xs text-gray-500">{budget.includes}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Packing Checklist */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full mb-4">
              <Luggage className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-sky-700">Packing Made Easy</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Essential Packing Checklist</h2>
            <p className="text-gray-600">Never forget the essentials with our travel checklist</p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-6 md:p-8 border border-sky-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {planningData.packingEssentials.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-gray-700 font-medium">{item.item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
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
              <span className="text-sm font-medium text-white">Free Planning Resources</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get Travel Planning Templates</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">Packing checklists, budget templates, and exclusive travel deals.</p>

            <form
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              onSubmit={(e) => { e.preventDefault(); alert('Check your email for planning resources!'); setEmail(''); }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <motion.button
                type="submit"
                className="px-8 py-4 bg-white text-sky-700 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-5 h-5" />
                Get Resources
              </motion.button>
            </form>
            <p className="text-white/60 text-xs mt-4">Free templates. Weekly tips. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 md:py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Start Planning Now</h2>
            <p className="text-gray-600">Everything you need in one place</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {planningData.quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.div key={i} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className="group block bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-sky-200 transition-all duration-300 text-center"
                  >
                    <div className={`w-14 h-14 mx-auto bg-gradient-to-br ${link.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-sky-600 transition-colors">{link.title}</h3>
                    <p className="text-sm text-gray-500">{link.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Travel Planning FAQ</h2>
            <p className="text-gray-600">Answers to common trip planning questions</p>
          </motion.div>

          <div className="bg-gray-50 rounded-3xl p-6 md:p-8">
            {planningData.faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Travel Planning Guide 2025</h2>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <p className="text-gray-600 leading-relaxed mb-4">
                Planning a trip? Fly2Any's comprehensive travel planning guide walks you through every step. Whether you're a first-time traveler or seasoned explorer, our expert tips help you plan smarter.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Start with destination research, set a realistic budget, book flights 6-8 weeks ahead, secure accommodation, plan activities, and use our packing checklists.
              </p>
              <p className="text-gray-500 text-sm">
                Popular: travel planning, how to plan a trip, vacation planning, travel itinerary, trip planner, travel budget, travel checklist.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-sky-900 via-blue-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-16 h-16 text-sky-300 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Start Planning?</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Search flights, hotels, and more to begin your journey.
            </p>
            <Link
              href="/journey/flights"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-sky-700 font-bold rounded-2xl hover:bg-gray-100 transition-all text-lg shadow-2xl shadow-black/20 hover:shadow-xl"
            >
              <Plane className="w-6 h-6" />
              Start Planning
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
