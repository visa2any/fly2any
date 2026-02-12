'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Building2, Home, Hotel, Sparkles, TrendingUp, Globe2, Shield,
  ChevronRight, DollarSign, Users, BarChart3, Zap, Star, Clock,
  Languages, Leaf, Brain, Camera, CalendarCheck, ArrowRight,
  CheckCircle2, MapPin, Wifi, Car, UtensilsCrossed, Waves,
  HeartHandshake, Smartphone, Award
} from 'lucide-react';

// ------------------------------------------------------------------
// HERO BACKGROUND PHOTOS (high-quality property/hosting imagery)
// ------------------------------------------------------------------
const HERO_PHOTOS = [
  { name: 'Luxury Villa Pool', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80&auto=format' },
  { name: 'Boutique Hotel Lobby', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80&auto=format' },
  { name: 'Mountain Lodge', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80&auto=format' },
  { name: 'Ocean View Suite', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=80&auto=format' },
];

// ------------------------------------------------------------------
// PROPERTY TYPES for the selector section
// ------------------------------------------------------------------
const PROPERTY_TYPES = [
  { type: 'hotel', label: 'Hotel', icon: Hotel, color: 'from-blue-500 to-indigo-600', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70&auto=format' },
  { type: 'apartment', label: 'Apartment', icon: Building2, color: 'from-violet-500 to-purple-600', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=70&auto=format' },
  { type: 'villa', label: 'Villa', icon: Home, color: 'from-emerald-500 to-teal-600', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=70&auto=format' },
  { type: 'resort', label: 'Resort', icon: Waves, color: 'from-cyan-500 to-blue-600', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=70&auto=format' },
  { type: 'boutique_hotel', label: 'Boutique Hotel', icon: Sparkles, color: 'from-rose-500 to-pink-600', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=70&auto=format' },
  { type: 'bed_and_breakfast', label: 'B&B', icon: UtensilsCrossed, color: 'from-amber-500 to-orange-600', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=70&auto=format' },
];

// ------------------------------------------------------------------
// STATS
// ------------------------------------------------------------------
const STATS = [
  { value: '180+', label: 'Countries Covered', icon: Globe2 },
  { value: '500K+', label: 'Travelers Monthly', icon: Users },
  { value: '$2.4B', label: 'Bookings Processed', icon: DollarSign },
  { value: '4.8★', label: 'Average Rating', icon: Star },
];

// ------------------------------------------------------------------
// DIFFERENTIATOR FEATURES
// ------------------------------------------------------------------
const FEATURES = [
  {
    icon: Zap,
    title: 'List in Under 5 Minutes',
    description: 'Our AI-powered wizard guides you through listing creation in just 5 steps — the fastest in the industry.',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Brain,
    title: 'AI-Powered Optimization',
    description: 'AI writes compelling descriptions, suggests competitive pricing, and auto-translates your listing into 10+ languages.',
    gradient: 'from-violet-400 to-purple-600',
  },
  {
    icon: Camera,
    title: 'Smart Photo Analysis',
    description: 'Upload photos and our AI auto-tags room types, detects amenities, and scores image quality to maximize bookings.',
    gradient: 'from-cyan-400 to-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Dynamic ML Pricing',
    description: 'Machine learning analyzes market demand, seasonality, and competitor rates to suggest optimal pricing automatically.',
    gradient: 'from-emerald-400 to-green-600',
  },
  {
    icon: Globe2,
    title: 'Instant Global Reach',
    description: 'One listing distributes across multiple booking channels — reaching travelers from 180+ countries instantly.',
    gradient: 'from-blue-400 to-indigo-600',
  },
  {
    icon: CalendarCheck,
    title: 'Unified Calendar Sync',
    description: 'Sync availability across all platforms with iCal integration — prevent double bookings from day one.',
    gradient: 'from-rose-400 to-pink-600',
  },
  {
    icon: Languages,
    title: 'Auto Multi-Language',
    description: 'AI automatically translates your listing into 10+ languages, reaching guests who book in their native language.',
    gradient: 'from-amber-400 to-orange-600',
  },
  {
    icon: Leaf,
    title: 'Sustainability Scoring',
    description: 'Showcase your eco-initiatives with a detailed sustainability score — attract the growing eco-conscious traveler market.',
    gradient: 'from-lime-400 to-emerald-600',
  },
];

// ------------------------------------------------------------------
// HOW IT WORKS STEPS
// ------------------------------------------------------------------
const STEPS = [
  { number: '01', title: 'Create Your Profile', description: 'Sign up and tell us about yourself. Individual host or property manager — we support both.', icon: Users },
  { number: '02', title: 'Add Your Property', description: 'Our 5-step AI wizard helps you create a stunning listing with professional descriptions and optimal pricing.', icon: Home },
  { number: '03', title: 'Upload & Optimize', description: 'Upload photos — AI auto-tags amenities, scores quality, and suggests improvements for maximum appeal.', icon: Camera },
  { number: '04', title: 'Go Live & Earn', description: 'Publish instantly. Your property reaches travelers worldwide. Manage everything from your host dashboard.', icon: TrendingUp },
];

// ------------------------------------------------------------------
// EARNING CALCULATOR DATA
// ------------------------------------------------------------------
const EARNING_DATA: Record<string, { avg: number; peak: number; occupancy: number }> = {
  'New York': { avg: 250, peak: 400, occupancy: 85 },
  'London': { avg: 200, peak: 350, occupancy: 80 },
  'Paris': { avg: 180, peak: 320, occupancy: 82 },
  'Dubai': { avg: 300, peak: 500, occupancy: 88 },
  'Tokyo': { avg: 170, peak: 280, occupancy: 78 },
  'Miami': { avg: 220, peak: 380, occupancy: 83 },
  'Barcelona': { avg: 160, peak: 280, occupancy: 79 },
  'Bali': { avg: 120, peak: 250, occupancy: 75 },
};

// ------------------------------------------------------------------
// TESTIMONIALS
// ------------------------------------------------------------------
const TESTIMONIALS = [
  { name: 'Sarah M.', location: 'Miami, FL', role: 'Villa Owner', quote: 'I listed my property in under 10 minutes. The AI pricing suggestion was spot-on — my bookings tripled in the first month!', rating: 5, avatar: '👩‍💼' },
  { name: 'Marco R.', location: 'Rome, Italy', role: 'Boutique Hotel', quote: 'The automatic translation feature is incredible. I now receive bookings from guests in Japan, Brazil, and Germany — markets I never reached before.', rating: 5, avatar: '👨‍💼' },
  { name: 'Priya K.', location: 'Goa, India', role: 'Beach Resort', quote: 'The sustainability scoring helped me attract eco-conscious travelers. My occupancy rate went from 60% to 89%.', rating: 5, avatar: '👩‍🔬' },
];

export default function ListYourPropertyPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedCity, setSelectedCity] = useState('New York');
  const [rooms, setRooms] = useState(1);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const earningRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Earning calculator
  const cityData = EARNING_DATA[selectedCity] || EARNING_DATA['New York'];
  const monthlyEstimate = Math.round(cityData.avg * rooms * 30 * (cityData.occupancy / 100));
  const yearlyEstimate = monthlyEstimate * 12;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* =====================================================
          SECTION 1: IMMERSIVE HERO — Level-6 Ultra-Premium
          ===================================================== */}
      <section className="relative overflow-hidden -mt-14 sm:-mt-16 lg:-mt-[72px] min-h-[100svh] md:min-h-screen">
        {/* Rotating Background Images */}
        {HERO_PHOTOS.map((photo, index) => (
          <div
            key={`hero-${index}`}
            className="absolute inset-0"
            style={{
              animation: `heroPropertyFade ${6 * HERO_PHOTOS.length}s infinite`,
              animationDelay: `${index * 6}s`,
              opacity: 0,
            }}
          >
            <Image
              src={photo.image}
              alt={photo.name}
              fill
              className="object-cover scale-105"
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              quality={index === 0 ? 95 : 85}
              sizes="100vw"
            />
          </div>
        ))}

        <style jsx>{`
          @keyframes heroPropertyFade {
            0% { opacity: 1; }
            ${(100 / HERO_PHOTOS.length).toFixed(2)}% { opacity: 1; }
            ${(100 / HERO_PHOTOS.length + 0.01).toFixed(2)}% { opacity: 0; }
            100% { opacity: 0; }
          }
        `}</style>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] md:min-h-screen px-4">
          <MaxWidthContainer>
            <div className="text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white/90">AI-Powered Property Listing Platform</span>
              </div>

              {/* Main Title */}
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tight"
                style={{ textShadow: '0 6px 60px rgba(0,0,0,0.9)' }}
              >
                Turn Your Property
                <br />
                Into a{' '}
                <span className="inline-block bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                  Revenue Machine
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className="text-lg md:text-xl lg:text-2xl text-white/85 font-medium mb-10 max-w-3xl mx-auto leading-relaxed"
                style={{ textShadow: '0 4px 40px rgba(0,0,0,0.8)' }}
              >
                List in under 5 minutes. AI-optimized descriptions. Smart pricing.
                <br className="hidden md:block" />
                Reach 500,000+ travelers in 180+ countries — instantly.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link
                  href="/list-your-property/create"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 active:scale-100"
                >
                  <span>List Your Property Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => earningRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 text-white/90 font-semibold text-lg px-8 py-5 rounded-2xl border border-white/20 backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>See Your Earnings</span>
                </button>
              </div>

              {/* Trust Stats Row */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                {STATS.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5">
                    <stat.icon className="w-5 h-5 text-yellow-400" />
                    <div className="text-left">
                      <div className="text-white font-black text-lg leading-tight">{stat.value}</div>
                      <div className="text-white/60 text-xs font-medium">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MaxWidthContainer>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/50 text-xs font-medium">Scroll to explore</span>
            <ChevronRight className="w-5 h-5 text-white/50 rotate-90" />
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2: PROPERTY TYPE SELECTOR — Interactive Cards
          ===================================================== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d18] to-[#0a0a0f]">
        <MaxWidthContainer>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-5 py-2 mb-6">
              <Building2 className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-violet-300">Any Property Type</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              What Type of Property Do You Have?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              From cozy apartments to luxury resorts — we support every property type with specialized listing tools.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {PROPERTY_TYPES.map((pt) => (
              <Link
                key={pt.type}
                href={`/list-your-property/create?type=${pt.type}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/25 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
              >
                {/* Background Image */}
                <div className="relative h-36 md:h-44 overflow-hidden">
                  <Image
                    src={pt.image}
                    alt={pt.label}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${pt.color} opacity-60 group-hover:opacity-40 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${pt.color} flex items-center justify-center shadow-lg`}>
                      <pt.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base md:text-lg leading-tight">{pt.label}</h3>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* =====================================================
          SECTION 3: WHY FLY2ANY — 8 Differentiators
          ===================================================== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]">
        <MaxWidthContainer>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 mb-6">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">Industry-First Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Why Hosts Choose{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Fly2Any</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              We&apos;re not another listing platform. We&apos;re the first AI-native hosting engine built to maximize your revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-500 hover:bg-white/[0.06]"
              >
                {/* Decorative gradient blob */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* =====================================================
          SECTION 4: HOW IT WORKS — 4-Step Process
          ===================================================== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#0d0d18] via-[#0a0a0f] to-[#0d0d18]">
        <MaxWidthContainer>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Go Live in{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">4 Simple Steps</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              From sign-up to first booking — the fastest path to earning from your property.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {STEPS.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(50%+48px)] w-[calc(100%-48px)] h-px bg-gradient-to-r from-white/20 to-transparent z-0" />
                )}

                <div className="relative z-10 flex flex-col items-center text-center p-6">
                  {/* Step number */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center group-hover:border-blue-500/40 group-hover:bg-blue-500/10 transition-all duration-500">
                      <step.icon className="w-10 h-10 text-white/80 group-hover:text-blue-400 transition-colors duration-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-black text-xs shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* =====================================================
          SECTION 5: EARNING CALCULATOR — Interactive
          ===================================================== */}
      <section ref={earningRef} className="relative py-20 md:py-28 bg-gradient-to-b from-[#0d0d18] to-[#0a0a0f]">
        <MaxWidthContainer>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 mb-6">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">Earning Calculator</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                See How Much You Could{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Earn</span>
              </h2>
              <p className="text-white/50 text-lg">Based on average rates and occupancy in your area</p>
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 p-8 md:p-12">
                {/* City Selector */}
                <div className="mb-10">
                  <label className="text-white/60 text-sm font-medium mb-3 block">Select your city</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(EARNING_DATA).map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                          selectedCity === city
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {city}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room Counter */}
                <div className="mb-10">
                  <label className="text-white/60 text-sm font-medium mb-3 block">Number of rooms</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-4xl font-black text-white w-16 text-center">{rooms}</span>
                    <button
                      onClick={() => setRooms(Math.min(50, rooms + 1))}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-white/40 text-sm ml-2">{rooms === 1 ? 'room' : 'rooms'} available</span>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
                    <div className="text-white/50 text-sm font-medium mb-1">Avg. Nightly Rate</div>
                    <div className="text-3xl font-black text-white">${cityData.avg}</div>
                    <div className="text-emerald-400 text-xs font-semibold mt-1">per room/night</div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 p-6 text-center">
                    <div className="text-emerald-300 text-sm font-medium mb-1">Monthly Estimate</div>
                    <div className="text-4xl font-black text-white">${monthlyEstimate.toLocaleString()}</div>
                    <div className="text-emerald-400 text-xs font-semibold mt-1">{cityData.occupancy}% avg occupancy</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
                    <div className="text-white/50 text-sm font-medium mb-1">Yearly Potential</div>
                    <div className="text-3xl font-black text-emerald-400">${yearlyEstimate.toLocaleString()}</div>
                    <div className="text-white/40 text-xs font-semibold mt-1">projected annual</div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                  <Link
                    href="/list-your-property/create"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold px-10 py-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
                  >
                    Start Earning Now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthContainer>
      </section>

      {/* =====================================================
          SECTION 6: TESTIMONIALS — Auto-Rotating Cards
          ===================================================== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]">
        <MaxWidthContainer>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2 mb-6">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">Host Success Stories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Trusted by Hosts{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Worldwide</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-6 transition-all duration-500 ${
                    idx === currentTestimonial
                      ? 'border-amber-500/40 bg-amber-500/10 scale-105 shadow-2xl shadow-amber-500/10'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{t.name}</div>
                      <div className="text-white/40 text-xs">{t.role} • {t.location}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array(t.rating).fill(0).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </MaxWidthContainer>
      </section>

      {/* =====================================================
          SECTION 7: COMPARISON TABLE — vs Competitors
          ===================================================== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#0d0d18] to-[#0a0a0f]">
        <MaxWidthContainer>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              How We{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Compare</span>
            </h2>
            <p className="text-white/50 text-lg">See why Fly2Any is the smartest choice for property hosts</p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium p-4 border-b border-white/10">Feature</th>
                  <th className="text-center p-4 border-b border-white/10">
                    <span className="text-white font-black bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent text-lg">Fly2Any</span>
                  </th>
                  <th className="text-center text-white/40 text-sm font-medium p-4 border-b border-white/10">Airbnb</th>
                  <th className="text-center text-white/40 text-sm font-medium p-4 border-b border-white/10 hidden md:table-cell">Booking</th>
                  <th className="text-center text-white/40 text-sm font-medium p-4 border-b border-white/10 hidden md:table-cell">VRBO</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI Listing Optimization', true, false, false, false],
                  ['Setup Time', '< 5 min', '15-30 min', '20-40 min', '20+ min'],
                  ['Smart Photo Analysis', true, false, false, false],
                  ['ML Dynamic Pricing', true, 'Basic', 'Manual', 'Basic'],
                  ['Auto Multi-Language', true, false, false, false],
                  ['Calendar Sync', true, 'Partial', 'Partial', 'Partial'],
                  ['Sustainability Score', true, 'Badge only', false, false],
                  ['Revenue Projections', true, false, false, false],
                  ['Commission Rate', '15%', '3-15%', '15-25%', '5-8%'],
                ].map(([feature, fly2any, airbnb, booking, vrbo], idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="text-white/70 text-sm p-4 font-medium">{feature as string}</td>
                    <td className="text-center p-4">
                      {fly2any === true ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <span className="text-emerald-400 font-bold text-sm">{fly2any as string}</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {airbnb === true ? (
                        <CheckCircle2 className="w-5 h-5 text-white/30 mx-auto" />
                      ) : airbnb === false ? (
                        <span className="text-white/20 text-lg">—</span>
                      ) : (
                        <span className="text-white/40 text-sm">{airbnb as string}</span>
                      )}
                    </td>
                    <td className="text-center p-4 hidden md:table-cell">
                      {booking === true ? (
                        <CheckCircle2 className="w-5 h-5 text-white/30 mx-auto" />
                      ) : booking === false ? (
                        <span className="text-white/20 text-lg">—</span>
                      ) : (
                        <span className="text-white/40 text-sm">{booking as string}</span>
                      )}
                    </td>
                    <td className="text-center p-4 hidden md:table-cell">
                      {vrbo === true ? (
                        <CheckCircle2 className="w-5 h-5 text-white/30 mx-auto" />
                      ) : vrbo === false ? (
                        <span className="text-white/20 text-lg">—</span>
                      ) : (
                        <span className="text-white/40 text-sm">{vrbo as string}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MaxWidthContainer>
      </section>

      {/* =====================================================
          SECTION 8: HOST DASHBOARD PREVIEW
          ===================================================== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]">
        <MaxWidthContainer>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-5 py-2 mb-6">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-300">Host Dashboard</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Everything at Your{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Fingertips</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Manage bookings, track revenue, and optimize pricing — all from one powerful dashboard.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Real-time Bookings', icon: CalendarCheck, desc: 'See bookings as they happen', color: 'from-blue-500 to-indigo-500' },
              { label: 'Revenue Analytics', icon: BarChart3, desc: 'Track earnings & trends', color: 'from-emerald-500 to-green-500' },
              { label: 'Smart Pricing', icon: TrendingUp, desc: 'AI-optimized rates', color: 'from-violet-500 to-purple-500' },
              { label: 'Guest Messages', icon: Smartphone, desc: 'Communicate instantly', color: 'from-rose-500 to-pink-500' },
              { label: 'Calendar Sync', icon: CalendarCheck, desc: 'Prevent double bookings', color: 'from-amber-500 to-orange-500' },
              { label: 'Performance Reports', icon: BarChart3, desc: 'Weekly insights & tips', color: 'from-cyan-500 to-blue-500' },
              { label: 'Multi-Property', icon: Building2, desc: 'Manage all properties', color: 'from-teal-500 to-emerald-500' },
              { label: 'Mobile App', icon: Smartphone, desc: 'Manage on the go', color: 'from-pink-500 to-rose-500' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{item.label}</h3>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </MaxWidthContainer>
      </section>

      {/* =====================================================
          SECTION 9: FINAL CTA — Full-Width Gradient
          ===================================================== */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-orange-500/20" />
        <div className="absolute inset-0 bg-[#0a0a0f]/90" />

        <MaxWidthContainer>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Ready to Start{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent">Earning?</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl mb-10 leading-relaxed">
              Join thousands of hosts worldwide. List your property for free
              <br className="hidden md:block" />
              and start welcoming guests from 180+ countries.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/list-your-property/create"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold text-lg px-12 py-5 rounded-2xl shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105"
              >
                <span>List Your Property Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Row */}
            <div className="flex items-center justify-center gap-6 text-white/40 text-sm">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Free to List</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-400" /> Under 5 Minutes</span>
              <span className="flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-violet-400" /> 180+ Countries</span>
            </div>
          </div>
        </MaxWidthContainer>
      </section>
    </div>
  );
}
