'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Award,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Play,
  Youtube,
  Instagram,
  Twitter,
  Newspaper,
  Building2,
  Calculator,
  ChevronDown,
  Star,
  Plane,
  Hotel,
  MapPin,
  Clock,
  CreditCard,
  Heart,
  Camera,
  Mic,
  PenTool,
  Briefcase,
} from 'lucide-react';

// Partner Types with specific benefits
const PARTNER_TYPES = [
  {
    id: 'creators',
    title: 'Content Creators',
    subtitle: 'YouTube, TikTok, Podcasts',
    icon: Youtube,
    emoji: '🎬',
    color: 'from-red-500 to-pink-600',
    benefits: [
      'Custom booking widgets for videos',
      'Exclusive creator discount codes',
      'Early access to new features',
      'Co-branded landing pages',
    ],
    stats: { avgEarning: '$2,400/mo', topEarner: '$18K/mo' },
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&q=80',
  },
  {
    id: 'influencers',
    title: 'Travel Influencers',
    subtitle: 'Instagram, Twitter/X',
    icon: Instagram,
    emoji: '📸',
    color: 'from-purple-500 to-pink-500',
    benefits: [
      'Swipe-up ready tracking links',
      'Story templates & assets',
      'Sponsored trip opportunities',
      'Affiliate badge verification',
    ],
    stats: { avgEarning: '$1,800/mo', topEarner: '$12K/mo' },
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
  },
  {
    id: 'magazines',
    title: 'Travel Magazines',
    subtitle: 'Blogs, Publications, Media',
    icon: Newspaper,
    emoji: '📰',
    color: 'from-blue-500 to-cyan-500',
    benefits: [
      'API access for price widgets',
      'White-label booking options',
      'Dedicated account manager',
      'Premium commission rates',
    ],
    stats: { avgEarning: '$5,200/mo', topEarner: '$45K/mo' },
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80',
  },
  {
    id: 'agencies',
    title: 'Travel Agencies',
    subtitle: 'Tour Operators, Agents',
    icon: Building2,
    emoji: '🏢',
    color: 'from-emerald-500 to-teal-500',
    benefits: [
      'B2B portal access',
      'Bulk booking discounts',
      'Client management tools',
      'Priority customer support',
    ],
    stats: { avgEarning: '$8,500/mo', topEarner: '$75K/mo' },
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
  },
];

// Commission Tiers
const TIERS = [
  { name: 'Starter', icon: '🌱', trips: '0-4', rate: 15, color: 'bg-gray-500' },
  { name: 'Bronze', icon: '🥉', trips: '5-14', rate: 20, color: 'bg-orange-500' },
  { name: 'Silver', icon: '🥈', trips: '15-29', rate: 25, color: 'bg-gray-400' },
  { name: 'Gold', icon: '🥇', trips: '30-49', rate: 30, color: 'bg-yellow-500' },
  { name: 'Platinum', icon: '💎', trips: '50+', rate: 35, color: 'bg-purple-500' },
];

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Travel YouTuber',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    content: 'Fly2Any transformed my travel content into a real business. The 35% commission is unmatched!',
    earnings: '$4,200/month',
    followers: '850K',
  },
  {
    name: 'Marco Rodriguez',
    role: 'Instagram Influencer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    content: 'My followers love the deals I share. The tracking is real-time and payments are always on time.',
    earnings: '$2,800/month',
    followers: '1.2M',
  },
  {
    name: 'Travel Weekly',
    role: 'Digital Magazine',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
    content: 'The API integration was seamless. Our readers book directly from our articles now.',
    earnings: '$12,500/month',
    followers: '5M readers',
  },
];

// FAQ Data
const FAQ_ITEMS = [
  {
    q: 'How much can I earn as an affiliate?',
    a: 'You earn 15-35% of our profit on every booking. Top affiliates earn $10,000+ monthly. Your rate increases as you complete more bookings.',
  },
  {
    q: 'When and how do I get paid?',
    a: 'Payouts are processed monthly via PayPal, Stripe, or bank transfer. Minimum payout is just $50 - much lower than industry standard.',
  },
  {
    q: 'What can I promote?',
    a: 'Flights, hotels, tours, activities, and transfers - our entire catalog. You get a unique tracking link that works across all products.',
  },
  {
    q: 'How long does the cookie last?',
    a: '30-day attribution window. If someone clicks your link and books within 30 days, you get the commission.',
  },
  {
    q: 'Is there a cost to join?',
    a: 'Absolutely free! No fees, no minimums, no credit card required. Sign up in 2 minutes and start earning.',
  },
];

export default function AffiliatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activePartner, setActivePartner] = useState(0);
  const [calcBookings, setCalcBookings] = useState(20);
  const [calcValue, setCalcValue] = useState(500);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGetStarted = () => {
    router.push(session ? '/affiliate/register' : '/auth/signin?callbackUrl=/affiliate/register');
  };

  // Calculator logic
  const avgProfit = calcValue * 0.18; // ~18% avg profit margin
  const tierRate = calcBookings >= 50 ? 35 : calcBookings >= 30 ? 30 : calcBookings >= 15 ? 25 : calcBookings >= 5 ? 20 : 15;
  const monthlyEarnings = calcBookings * avgProfit * (tierRate / 100);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#E74035]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#F7C928]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80')] bg-cover bg-center opacity-10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-[#F7C928]" />
            <span className="text-sm font-medium">Join 2,500+ Travel Partners Worldwide</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            Earn Up To{' '}
            <span className="bg-gradient-to-r from-[#E74035] to-[#F7C928] bg-clip-text text-transparent">35%</span>
            <br />
            Commission
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            Turn your travel content into revenue. Join the highest-paying affiliate program in travel.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-[#E74035] to-[#F7C928] rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-[#E74035]/30 flex items-center justify-center gap-2"
            >
              <span>Start Earning Today</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              <span>Calculate Earnings</span>
            </button>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { value: '35%', label: 'Max Commission', icon: TrendingUp },
              { value: '$50', label: 'Min Payout', icon: DollarSign },
              { value: '30 Days', label: 'Cookie Window', icon: Clock },
              { value: '24/7', label: 'Support', icon: Shield },
            ].map((stat, i) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <stat.icon className="w-6 h-6 text-[#E74035] mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* PARTNER TYPES SECTION */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E74035]/10 text-[#E74035] text-sm font-bold mb-4">
              <Users className="w-4 h-4" />
              PARTNER TYPES
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Built For <span className="text-[#E74035]">Every</span> Travel Partner
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Whether you're a creator, influencer, magazine, or agency - we have the tools for you.
            </p>
          </motion.div>

          {/* Partner Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {PARTNER_TYPES.map((partner, i) => (
              <motion.button
                key={partner.id}
                onClick={() => setActivePartner(i)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
                  activePartner === i
                    ? 'bg-gradient-to-r ' + partner.color + ' text-white shadow-xl scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
                whileHover={{ scale: activePartner === i ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{partner.emoji}</span>
                <span className="hidden sm:inline">{partner.title}</span>
              </motion.button>
            ))}
          </div>

          {/* Partner Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePartner}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              {/* Image */}
              <div className="relative h-80 md:h-[500px] rounded-3xl overflow-hidden">
                <Image
                  src={PARTNER_TYPES[activePartner].image}
                  alt={PARTNER_TYPES[activePartner].title}
                  fill
                  className="object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${PARTNER_TYPES[activePartner].color} opacity-40`} />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">{PARTNER_TYPES[activePartner].emoji}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{PARTNER_TYPES[activePartner].title}</h3>
                        <p className="text-gray-300">{PARTNER_TYPES[activePartner].subtitle}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-[#F7C928]">{PARTNER_TYPES[activePartner].stats.avgEarning}</div>
                        <div className="text-xs text-gray-400">Avg. Earnings</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-[#E74035]">{PARTNER_TYPES[activePartner].stats.topEarner}</div>
                        <div className="text-xs text-gray-400">Top Earner</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">
                  Perfect for <span className="text-[#E74035]">{PARTNER_TYPES[activePartner].title}</span>
                </h3>
                <div className="space-y-4">
                  {PARTNER_TYPES[activePartner].benefits.map((benefit, i) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span className="text-lg">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r ${PARTNER_TYPES[activePartner].color} hover:scale-[1.02] transition-all flex items-center justify-center gap-2`}
                >
                  <span>Apply as {PARTNER_TYPES[activePartner].title.split(' ')[0]}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* COMMISSION TIERS */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7C928]/10 text-[#F7C928] text-sm font-bold mb-4">
              <TrendingUp className="w-4 h-4" />
              COMMISSION TIERS
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Grow Your <span className="text-[#F7C928]">Commission</span> Rate
            </h2>
            <p className="text-xl text-gray-400">Complete more bookings, unlock higher commissions</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`${tier.color} rounded-3xl p-6 text-center text-white shadow-2xl`}
              >
                <div className="text-5xl mb-3">{tier.icon}</div>
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <div className="text-sm opacity-80 mb-4">{tier.trips} trips/mo</div>
                <div className="text-4xl font-black">{tier.rate}%</div>
                <div className="text-sm opacity-80 mt-1">Commission</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EARNINGS CALCULATOR */}
      <section id="calculator" className="py-24 bg-black relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-bold mb-4">
              <Calculator className="w-4 h-4" />
              EARNINGS CALCULATOR
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              See Your <span className="text-green-400">Potential</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 border border-gray-700"
          >
            <div className="grid md:grid-cols-2 gap-12">
              {/* Sliders */}
              <div className="space-y-8">
                <div>
                  <label className="flex justify-between text-lg mb-3">
                    <span>Monthly Bookings</span>
                    <span className="text-[#E74035] font-bold">{calcBookings} bookings</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={calcBookings}
                    onChange={(e) => setCalcBookings(Number(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#E74035]"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1</span>
                    <span>100+</span>
                  </div>
                </div>

                <div>
                  <label className="flex justify-between text-lg mb-3">
                    <span>Avg. Booking Value</span>
                    <span className="text-[#F7C928] font-bold">${calcValue}</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={calcValue}
                    onChange={(e) => setCalcValue(Number(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#F7C928]"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>$100</span>
                    <span>$2,000+</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Your Tier</span>
                    <span className="text-xl font-bold">{TIERS.find(t => t.rate === tierRate)?.icon} {tierRate}% Commission</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#E74035]/20 to-[#F7C928]/20 rounded-2xl p-8">
                <div className="text-gray-400 mb-2">Your Estimated Monthly Earnings</div>
                <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-[#E74035] to-[#F7C928] bg-clip-text text-transparent">
                  ${monthlyEarnings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-gray-400 mt-2">per month</div>
                <div className="text-3xl font-bold text-white mt-4">
                  ${(monthlyEarnings * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}/year
                </div>
                <button
                  onClick={handleGetStarted}
                  className="mt-8 px-8 py-4 bg-gradient-to-r from-[#E74035] to-[#F7C928] rounded-xl font-bold text-lg hover:scale-105 transition-all"
                >
                  Start Earning Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold mb-4">
              <Star className="w-4 h-4" />
              SUCCESS STORIES
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Partners <span className="text-purple-400">Love</span> Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <Image src={t.avatar} alt={t.name} width={60} height={60} className="rounded-full" />
                  <div>
                    <div className="font-bold text-lg">{t.name}</div>
                    <div className="text-gray-400 text-sm">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">"{t.content}"</p>
                <div className="flex gap-4">
                  <div className="bg-green-500/10 rounded-lg px-3 py-2 text-center flex-1">
                    <div className="text-green-400 font-bold">{t.earnings}</div>
                    <div className="text-xs text-gray-500">Earnings</div>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg px-3 py-2 text-center flex-1">
                    <div className="text-blue-400 font-bold">{t.followers}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Frequently Asked <span className="text-[#E74035]">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5"
                    >
                      <p className="text-gray-400">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-r from-[#E74035] to-[#F7C928] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join 2,500+ travel partners already earning with Fly2Any
            </p>
            <button
              onClick={handleGetStarted}
              className="px-12 py-6 bg-white text-gray-900 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl inline-flex items-center gap-3"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-white/80 mt-6 text-sm">
              No credit card • Free forever • Start in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
