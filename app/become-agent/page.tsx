'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Briefcase,
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
  ChevronDown,
  Star,
  Plane,
  Hotel,
  Calculator,
  FileText,
  Palette,
  Headphones,
  Lock,
  BadgeCheck,
  Building2,
  Layers,
  Target,
  Award,
} from 'lucide-react';

// Agent Types with specific benefits
const AGENT_TYPES = [
  {
    id: 'independent',
    title: 'Independent Agents',
    subtitle: 'Solo Travel Advisors',
    icon: Briefcase,
    emoji: '💼',
    color: 'from-blue-500 to-cyan-500',
    benefits: [
      'Net pricing on all products',
      'Professional quote builder',
      'Client management CRM',
      'Branded proposals',
    ],
    stats: { avgMargin: '18-25%', topEarner: '$15K/mo' },
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80',
  },
  {
    id: 'agencies',
    title: 'Travel Agencies',
    subtitle: 'Multi-Agent Operations',
    icon: Building2,
    emoji: '🏢',
    color: 'from-emerald-500 to-teal-500',
    benefits: [
      'Sub-agent management',
      'Team performance dashboard',
      'Centralized billing',
      'Volume-based discounts',
    ],
    stats: { avgMargin: '20-30%', topEarner: '$85K/mo' },
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
  },
  {
    id: 'corporate',
    title: 'Corporate Travel',
    subtitle: 'Business Travel Managers',
    icon: Target,
    emoji: '🎯',
    color: 'from-purple-500 to-pink-500',
    benefits: [
      'Corporate rate access',
      'Policy compliance tools',
      'Expense reporting API',
      'Dedicated account manager',
    ],
    stats: { avgMargin: '12-18%', topEarner: '$120K/mo' },
    image: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=600&q=80',
  },
  {
    id: 'tour',
    title: 'Tour Operators',
    subtitle: 'Package Builders',
    icon: Layers,
    emoji: '🗺️',
    color: 'from-orange-500 to-red-500',
    benefits: [
      'Multi-component packaging',
      'Dynamic pricing engine',
      'White-label checkout',
      'Supplier direct rates',
    ],
    stats: { avgMargin: '25-40%', topEarner: '$200K/mo' },
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
  },
];

// Platform Features
const FEATURES = [
  { icon: DollarSign, title: 'Net Pricing', desc: 'Wholesale rates on flights, hotels & more' },
  { icon: Calculator, title: 'Set Your Markup', desc: 'You decide your profit margin' },
  { icon: FileText, title: 'Quote Builder', desc: 'Professional proposals in minutes' },
  { icon: Users, title: 'Client CRM', desc: 'Manage clients & bookings in one place' },
  { icon: Palette, title: 'White Label', desc: 'Your branding, your business' },
  { icon: Shield, title: 'IATA/CLIA Support', desc: 'Works with your credentials' },
];

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Jennifer Williams',
    role: 'Independent Travel Advisor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    content: 'Finally, a platform that treats agents like professionals. Net pricing means I control my margins.',
    earnings: '$8,500/month',
    clients: '45 active',
  },
  {
    name: 'Atlantic Travel Group',
    role: 'Travel Agency',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
    content: 'We moved our entire team to Fly2Any. The B2B tools are exceptional and support is world-class.',
    earnings: '$67,000/month',
    clients: '12 agents',
  },
  {
    name: 'Marcus Chen',
    role: 'Corporate Travel Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    content: 'The reporting and policy tools make corporate travel management actually manageable.',
    earnings: '$120,000/month',
    clients: '500+ employees',
  },
];

// FAQ Data
const FAQ_ITEMS = [
  {
    q: 'How does net pricing work?',
    a: 'You receive our wholesale rates - the actual cost we pay suppliers. You add your own markup to create your selling price. 100% of that markup is yours.',
  },
  {
    q: 'What products can I sell?',
    a: 'Flights, hotels, tours, activities, transfers, car rentals, and travel insurance. Full access to our entire supplier network.',
  },
  {
    q: 'Do I need IATA/CLIA credentials?',
    a: 'No! Our platform allows you to book under our credentials. If you have your own, we support that too for direct supplier relationships.',
  },
  {
    q: 'Is there a monthly fee?',
    a: 'We offer free and premium tiers. Start free with essential tools. Premium ($49/mo) unlocks white-label, advanced CRM, and priority support.',
  },
  {
    q: 'How do payments work?',
    a: 'Collect payments directly from your clients via your own Stripe/PayPal. We only charge the net amount. Your margin stays in your account.',
  },
];

export default function BecomeAgentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeAgent, setActiveAgent] = useState(0);
  const [calcBookings, setCalcBookings] = useState(15);
  const [calcValue, setCalcValue] = useState(800);
  const [calcMargin, setCalcMargin] = useState(20);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGetStarted = () => {
    router.push(session ? '/agent/register' : '/auth/signin?callbackUrl=/agent/register');
  };

  // Calculator logic
  const monthlyRevenue = calcBookings * calcValue;
  const monthlyProfit = monthlyRevenue * (calcMargin / 100);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')] bg-cover bg-center opacity-10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Trusted by 1,200+ Travel Professionals</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Net Pricing.</span>
            <br />
            Your Markup.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            Professional B2B platform for travel agents. Wholesale rates, powerful tools, total control.
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
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <span>Apply for Agent Access</span>
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
              { value: 'Net', label: 'Wholesale Pricing', icon: DollarSign },
              { value: '100%', label: 'Keep Your Margin', icon: TrendingUp },
              { value: '24/7', label: 'Agent Support', icon: Headphones },
              { value: 'Free', label: 'To Get Started', icon: Sparkles },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
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

      {/* FEATURES GRID */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold mb-4">
              <Zap className="w-4 h-4" />
              PLATFORM FEATURES
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything You Need to <span className="text-emerald-400">Succeed</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all"
              >
                <feature.icon className="w-10 h-10 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENT TYPES SECTION */}
      <section className="py-24 bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold mb-4">
              <Users className="w-4 h-4" />
              AGENT TYPES
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Built For <span className="text-emerald-400">Every</span> Professional
            </h2>
          </motion.div>

          {/* Agent Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {AGENT_TYPES.map((agent, i) => (
              <motion.button
                key={agent.id}
                onClick={() => setActiveAgent(i)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
                  activeAgent === i
                    ? 'bg-gradient-to-r ' + agent.color + ' text-white shadow-xl scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
                whileHover={{ scale: activeAgent === i ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{agent.emoji}</span>
                <span className="hidden sm:inline">{agent.title}</span>
              </motion.button>
            ))}
          </div>

          {/* Agent Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAgent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              {/* Image */}
              <div className="relative h-80 md:h-[500px] rounded-3xl overflow-hidden">
                <Image
                  src={AGENT_TYPES[activeAgent].image}
                  alt={AGENT_TYPES[activeAgent].title}
                  fill
                  className="object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${AGENT_TYPES[activeAgent].color} opacity-40`} />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">{AGENT_TYPES[activeAgent].emoji}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{AGENT_TYPES[activeAgent].title}</h3>
                        <p className="text-gray-300">{AGENT_TYPES[activeAgent].subtitle}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{AGENT_TYPES[activeAgent].stats.avgMargin}</div>
                        <div className="text-xs text-gray-400">Avg. Margin</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-blue-400">{AGENT_TYPES[activeAgent].stats.topEarner}</div>
                        <div className="text-xs text-gray-400">Top Earner</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">
                  Perfect for <span className="text-emerald-400">{AGENT_TYPES[activeAgent].title}</span>
                </h3>
                <div className="space-y-4">
                  {AGENT_TYPES[activeAgent].benefits.map((benefit, i) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      <span className="text-lg">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r ${AGENT_TYPES[activeAgent].color} hover:scale-[1.02] transition-all flex items-center justify-center gap-2`}
                >
                  <span>Apply as {AGENT_TYPES[activeAgent].title.split(' ')[0]}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold mb-4">
              <Layers className="w-4 h-4" />
              HOW IT WORKS
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Simple <span className="text-purple-400">Transparent</span> Pricing
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'We Provide Net Rates', desc: 'Access wholesale pricing on flights, hotels, tours, activities, and more. No markup from us.', color: 'from-blue-500 to-cyan-500' },
              { step: '02', title: 'You Set Your Markup', desc: 'Add your own profit margin. 10%, 20%, 30% - you decide what to charge your clients.', color: 'from-emerald-500 to-teal-500' },
              { step: '03', title: 'Keep 100% Profit', desc: 'Collect payment from clients, pay us the net amount. Your margin stays in your pocket.', color: 'from-purple-500 to-pink-500' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className={`bg-gradient-to-br ${item.color} rounded-3xl p-8 h-full`}>
                  <div className="text-6xl font-black text-white/20 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/80">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EARNINGS CALCULATOR */}
      <section id="calculator" className="py-24 bg-gray-900 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold mb-4">
              <Calculator className="w-4 h-4" />
              PROFIT CALCULATOR
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              See Your <span className="text-emerald-400">Potential</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 border border-gray-700"
          >
            <div className="grid md:grid-cols-2 gap-12">
              {/* Sliders */}
              <div className="space-y-8">
                <div>
                  <label className="flex justify-between text-lg mb-3">
                    <span>Monthly Bookings</span>
                    <span className="text-blue-400 font-bold">{calcBookings} bookings</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={calcBookings}
                    onChange={(e) => setCalcBookings(Number(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-lg mb-3">
                    <span>Avg. Booking Value</span>
                    <span className="text-emerald-400 font-bold">${calcValue}</span>
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="5000"
                    step="100"
                    value={calcValue}
                    onChange={(e) => setCalcValue(Number(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-lg mb-3">
                    <span>Your Markup %</span>
                    <span className="text-purple-400 font-bold">{calcMargin}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={calcMargin}
                    onChange={(e) => setCalcMargin(Number(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Monthly Revenue</span>
                    <span suppressHydrationWarning>${monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Your Markup ({calcMargin}%)</span>
                    <span className="text-emerald-400 font-bold" suppressHydrationWarning>${monthlyProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-2xl p-8">
                <div className="text-gray-400 mb-2">Your Monthly Profit</div>
                <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent" suppressHydrationWarning>
                  ${monthlyProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-gray-400 mt-2">100% yours to keep</div>
                <div className="text-3xl font-bold text-white mt-4" suppressHydrationWarning>
                  ${(monthlyProfit * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}/year
                </div>
                <button
                  onClick={handleGetStarted}
                  className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl font-bold text-lg hover:scale-105 transition-all"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold mb-4">
              <Star className="w-4 h-4" />
              SUCCESS STORIES
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Agents <span className="text-blue-400">Trust</span> Us
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
                className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-blue-500/50 transition-all"
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
                  <div className="bg-emerald-500/10 rounded-lg px-3 py-2 text-center flex-1">
                    <div className="text-emerald-400 font-bold">{t.earnings}</div>
                    <div className="text-xs text-gray-500">Profit</div>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg px-3 py-2 text-center flex-1">
                    <div className="text-blue-400 font-bold">{t.clients}</div>
                    <div className="text-xs text-gray-500">Clients</div>
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
              Frequently Asked <span className="text-emerald-400">Questions</span>
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
      <section className="py-24 bg-gradient-to-r from-blue-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join 1,200+ travel professionals earning more with Fly2Any
            </p>
            <button
              onClick={handleGetStarted}
              className="px-12 py-6 bg-white text-gray-900 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl inline-flex items-center gap-3"
            >
              <span>Apply for Agent Access</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-white/80 mt-6 text-sm">
              Free to start • No credit card required • 24/7 support
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
