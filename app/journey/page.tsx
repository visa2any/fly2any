'use client';

/**
 * Journey Page - AI-Powered Trip Builder
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 * SAME PATTERN AS FLIGHTS/HOTELS PAGE
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Sparkles,
  Plane,
  Building2,
  Map,
  Clock,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Star,
  Heart,
  Globe,
  Palmtree,
  Mountain,
  Compass,
  Shield,
  Award,
  ChevronRight,
} from 'lucide-react';

// Layout - SAME AS FLIGHTS PAGE
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import { useLanguage } from '@/lib/i18n/client';

// Journey Components
import {
  JourneyTimeline,
  JourneyPricingSummary,
  JourneyOnboarding,
  useJourneyOnboarding,
  ExperiencePicker,
  FlightSelector,
  HotelSelector,
  MobilePricingFooter,
} from '@/components/journey';

// Journey System
import {
  JourneyProvider,
  useJourney,
  JourneyBuilder,
  PricingAggregator,
  AIExperienceEngine,
  JourneySearchParams,
  Journey,
  JourneyExperience,
  JourneyFlight,
  JourneyHotel,
  TimeSlot,
  JourneyFlightSearchParams,
  JourneyHotelSearchParams,
} from '@/lib/journey';

// ============================================================================
// JOURNEY PREVIEW SHOWCASE
// ============================================================================

function JourneyPreviewShowcase() {
  const previewDays = [
    { day: 1, items: ['✈️ Flight to Paris', '🏨 Hotel Check-in', '🍷 Welcome Dinner'] },
    { day: 2, items: ['🗼 Eiffel Tower', '🥐 Café Lunch', '🎨 Louvre Museum'] },
    { day: 3, items: ['🏰 Versailles', '🛍️ Shopping', '✈️ Return Flight'] },
  ];

  return (
    <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-2xl p-4 sm:p-6 border border-neutral-200/60 overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-500/5 to-amber-500/5 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Sample Journey</h3>
              <p className="text-xs text-neutral-500">Paris Weekend</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">AI Generated</span>
        </div>

        <div className="space-y-2">
          {previewDays.map((day) => (
            <div key={day.day} className="flex gap-3 p-3 bg-white rounded-xl border border-neutral-100">
              <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {day.day}
              </div>
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                {day.items.map((item, i) => (
                  <span key={i} className="px-2 py-1 bg-neutral-50 rounded text-xs text-neutral-700">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1"><Plane className="w-3 h-3" /> 2 Flights</span>
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> 2 Nights</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> 5 Exp</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-400">Est. Total</p>
            <p className="text-base font-bold text-neutral-900">$1,249</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WHY JOURNEY SECTION
// ============================================================================

function WhyJourneySection() {
  const features = [
    { icon: Sparkles, title: 'AI-Powered', desc: 'Smart suggestions', color: 'from-primary-500 to-amber-500' },
    { icon: Globe, title: 'All-In-One', desc: 'Flights + Hotels + Exp', color: 'from-blue-500 to-cyan-500' },
    { icon: DollarSign, title: 'Save 30%', desc: 'Bundle pricing', color: 'from-green-500 to-emerald-500' },
    { icon: Clock, title: '15 Minutes', desc: 'Build full trip', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="bg-white py-6 md:py-10">
      <MaxWidthContainer>
        <h2 className="text-lg md:text-2xl font-bold text-neutral-900 mb-4 md:mb-6 px-3 md:px-0">Why Journey Builder?</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-3 md:px-0">
          {features.map((f) => (
            <div key={f.title} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm">{f.title}</h3>
              <p className="text-xs text-neutral-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </div>
  );
}

// ============================================================================
// JOURNEY TEMPLATES SECTION
// ============================================================================

function JourneyTemplatesSection() {
  const templates = [
    { icon: Palmtree, title: 'Beach Getaway', dur: '5-7 days', price: '$899', color: 'from-cyan-500 to-blue-500', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
    { icon: Building2, title: 'City Explorer', dur: '3-5 days', price: '$599', color: 'from-purple-500 to-indigo-500', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80' },
    { icon: Heart, title: 'Romantic', dur: '4-5 days', price: '$799', color: 'from-pink-500 to-rose-500', img: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=400&q=80' },
    { icon: Mountain, title: 'Adventure', dur: '7-10 days', price: '$1,199', color: 'from-green-500 to-emerald-500', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80' },
  ];

  return (
    <div className="bg-neutral-50 py-6 md:py-10">
      <MaxWidthContainer>
        <h2 className="text-lg md:text-2xl font-bold text-neutral-900 mb-4 md:mb-6 px-3 md:px-0">Popular Templates</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-3 md:px-0">
          {templates.map((t) => (
            <div key={t.title} className="group bg-white rounded-xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-all cursor-pointer">
              <div className="relative h-24 md:h-32 overflow-hidden">
                <Image src={t.img} alt={t.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className={`absolute top-2 left-2 w-8 h-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                  <t.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-neutral-900 text-sm">{t.title}</h3>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-neutral-500">{t.dur}</span>
                  <span className="font-semibold text-primary-600">From {t.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </div>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

function HowItWorksSection() {
  const steps = [
    { n: '1', title: 'Enter', desc: 'Where & when', icon: Compass },
    { n: '2', title: 'AI Builds', desc: 'Smart itinerary', icon: Sparkles },
    { n: '3', title: 'Customize', desc: 'Add experiences', icon: Map },
    { n: '4', title: 'Book', desc: 'One checkout', icon: CheckCircle2 },
  ];

  return (
    <div className="bg-white py-6 md:py-10">
      <MaxWidthContainer>
        <h2 className="text-lg md:text-2xl font-bold text-neutral-900 mb-4 md:mb-6 px-3 md:px-0">How It Works</h2>
        <div className="grid grid-cols-4 gap-2 md:gap-6 px-3 md:px-0">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-xl bg-primary-500 text-white flex items-center justify-center mb-2 shadow-lg shadow-primary-500/20">
                <s.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-xs md:text-sm">{s.title}</h3>
              <p className="text-[10px] md:text-xs text-neutral-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </div>
  );
}

// ============================================================================
// STATS SECTION
// ============================================================================

function JourneyStatsSection() {
  const stats = [
    { v: '500K+', l: 'Journeys', icon: Globe },
    { v: '4.9★', l: 'Rating', icon: Star },
    { v: '$340', l: 'Avg Save', icon: DollarSign },
    { v: '15min', l: 'Build Time', icon: Clock },
  ];

  return (
    <div className="bg-neutral-900 py-8 md:py-12">
      <MaxWidthContainer>
        <div className="grid grid-cols-4 gap-4 px-3 md:px-0">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-white/10 flex items-center justify-center mb-2">
                <s.icon className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-xl md:text-3xl font-bold text-white">{s.v}</p>
              <p className="text-[10px] md:text-xs text-neutral-400">{s.l}</p>
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </div>
  );
}

// ============================================================================
// WHAT'S INCLUDED
// ============================================================================

function WhatsIncludedSection() {
  const items = [
    { icon: Plane, text: '500+ Airlines', ok: true },
    { icon: Building2, text: '2M+ Hotels', ok: true },
    { icon: Sparkles, text: 'Experiences', ok: true },
    { icon: Shield, text: 'Insurance', ok: true },
    { icon: Map, text: 'Car Rentals', ok: false },
    { icon: Award, text: 'Lounges', ok: false },
  ];

  return (
    <div className="bg-white py-6 md:py-10">
      <MaxWidthContainer>
        <h2 className="text-lg md:text-2xl font-bold text-neutral-900 mb-4 px-3 md:px-0">What's Included</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-3 md:px-0 max-w-2xl">
          {items.map((i) => (
            <div key={i.text} className={`flex items-center gap-2 p-3 rounded-lg border ${i.ok ? 'bg-white border-neutral-100' : 'bg-neutral-50 border-neutral-100'}`}>
              <div className={`w-8 h-8 rounded flex items-center justify-center ${i.ok ? 'bg-primary-50 text-primary-600' : 'bg-neutral-100 text-neutral-400'}`}>
                <i.icon className="w-4 h-4" />
              </div>
              <span className={`text-sm ${i.ok ? 'text-neutral-900' : 'text-neutral-400'}`}>{i.text}</span>
              {i.ok && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
              {!i.ok && <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">Soon</span>}
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </div>
  );
}

// ============================================================================
// MAIN PAGE WRAPPER
// ============================================================================

export default function JourneyPage() {
  return (
    <JourneyProvider>
      <JourneyPageContent />
    </JourneyProvider>
  );
}

// ============================================================================
// PAGE CONTENT
// ============================================================================

function JourneyPageContent() {
  const router = useRouter();
  const { language: lang } = useLanguage();
  const [animationKey, setAnimationKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  const {
    journey,
    isBuilding,
    buildProgress,
    selectedDayIndex,
    setJourney,
    setBuilding,
    setBuildProgress,
    setSelectedDay,
    addExperience,
    removeExperience,
    updateExperience,
  } = useJourney();

  const { showOnboarding, completeOnboarding } = useJourneyOnboarding();
  const [view, setView] = useState<'search' | 'timeline'>('search');

  // Modals
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);
  const [pickerDayIndex, setPickerDayIndex] = useState(0);
  const [pickerTimeSlot, setPickerTimeSlot] = useState<TimeSlot>('morning');
  const [showFlightSelector, setShowFlightSelector] = useState(false);
  const [flightSearchParams, setFlightSearchParams] = useState<JourneyFlightSearchParams | null>(null);
  const [showHotelSelector, setShowHotelSelector] = useState(false);
  const [hotelSearchParams, setHotelSearchParams] = useState<JourneyHotelSearchParams | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const interval = setInterval(() => setAnimationKey(p => p + 1), 12000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleCheckout = useCallback(() => {
    if (!journey) return;
    sessionStorage.setItem('journey_checkout', JSON.stringify(journey));
    router.push('/journey/checkout');
  }, [journey, router]);

  const handleAddExperience = useCallback((dayIndex: number, timeSlot: string) => {
    if (!journey) return;
    setPickerDayIndex(dayIndex);
    setPickerTimeSlot(timeSlot as TimeSlot);
    setShowExperiencePicker(true);
  }, [journey]);

  const handleExperienceSelected = useCallback((experience: JourneyExperience) => {
    addExperience(pickerDayIndex, experience);
    setShowExperiencePicker(false);
  }, [addExperience, pickerDayIndex]);

  const handleAcceptSuggestion = useCallback((dayIndex: number, experienceId: string) => {
    if (!journey) return;
    const exp = journey.days[dayIndex].experiences.find((e) => e.id === experienceId);
    if (exp) updateExperience(dayIndex, { ...exp, status: 'added' });
  }, [journey, updateExperience]);

  const handleSelectFlight = useCallback(() => {
    if (!journey) return;
    setFlightSearchParams({
      origin: journey.origin.code, destination: journey.destination.code,
      departureDate: journey.departureDate, returnDate: journey.returnDate,
      travelers: journey.travelers, cabinClass: 'economy', maxResults: 20,
    });
    setShowFlightSelector(true);
  }, [journey]);

  const handleFlightSelected = useCallback((outbound: JourneyFlight, inbound?: JourneyFlight) => {
    if (!journey) return;
    const days = [...journey.days];
    if (days[0]) days[0] = { ...days[0], segments: days[0].segments.map(s => s.type === 'outbound-flight' ? { ...s, flight: outbound } : s) };
    if (inbound && days.length > 1) {
      const last = days.length - 1;
      days[last] = { ...days[last], segments: days[last].segments.map(s => s.type === 'return-flight' ? { ...s, flight: inbound } : s) };
    }
    setJourney({ ...journey, days });
    setShowFlightSelector(false);
  }, [journey, setJourney]);

  const handleSelectHotel = useCallback(() => {
    if (!journey) return;
    setHotelSearchParams({
      destination: journey.destination.city, checkIn: journey.departureDate, checkOut: journey.returnDate,
      guests: { adults: journey.travelers.adults, children: journey.travelers.children },
      rooms: 1, currency: 'USD', maxResults: 20,
    });
    setShowHotelSelector(true);
  }, [journey]);

  const handleHotelSelected = useCallback((hotel: JourneyHotel) => {
    if (!journey) return;
    const days = journey.days.map((d, i) => {
      if (i < journey.days.length - 1 || journey.days.length === 1) {
        const seg = d.segments.find(s => s.type === 'hotel');
        if (seg) return { ...d, segments: d.segments.map(s => s.type === 'hotel' ? { ...s, hotel } : s) };
      }
      return d;
    });
    setJourney({ ...journey, days });
    setShowHotelSelector(false);
  }, [journey, setJourney]);

  useEffect(() => {
    if (journey) {
      const p = PricingAggregator.calculate(journey);
      if (JSON.stringify(p) !== JSON.stringify(journey.pricing)) setJourney({ ...journey, pricing: p });
    }
  }, [journey?.days]);

  // Title text
  const title = 'Build My Journey';
  const subtitle = 'AI-powered trip planning made simple';

  // ============================================================================
  // RENDER
  // ============================================================================

  if (view === 'timeline' && journey) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Modals */}
        <ExperiencePicker isOpen={showExperiencePicker} onClose={() => setShowExperiencePicker(false)} onSelect={handleExperienceSelected} destinationCode={journey.destination.code} timeSlot={pickerTimeSlot} interests={journey.preferences.interests} />
        {flightSearchParams && <FlightSelector isOpen={showFlightSelector} onClose={() => setShowFlightSelector(false)} onSelect={handleFlightSelected} searchParams={flightSearchParams} isRoundTrip={!!journey.returnDate} />}
        {hotelSearchParams && <HotelSelector isOpen={showHotelSelector} onClose={() => setShowHotelSelector(false)} onSelect={handleHotelSelected} searchParams={hotelSearchParams} />}

        {/* Sub-header */}
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-lg border-b border-neutral-200">
          <MaxWidthContainer>
            <div className="flex items-center justify-between h-14 px-3 md:px-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setView('search')} className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span className="text-sm font-medium hidden sm:inline">New</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-neutral-900 text-sm">Journey Builder</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500">{journey.origin.code} → {journey.destination.code}</span>
                <span className="px-2 py-1 bg-primary-50 rounded-lg font-medium text-primary-600 text-xs">{journey.duration}d</span>
              </div>
            </div>
          </MaxWidthContainer>
        </div>

        {/* Timeline */}
        <div className="py-4 md:py-6">
          <MaxWidthContainer>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-3 md:px-0">
              <div className="lg:col-span-2">
                <JourneyTimeline journey={journey} selectedDayIndex={selectedDayIndex} onSelectDay={setSelectedDay} onAddExperience={handleAddExperience} onRemoveExperience={removeExperience} onAcceptSuggestion={handleAcceptSuggestion} onSelectFlight={handleSelectFlight} onSelectHotel={handleSelectHotel} />
              </div>
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <JourneyPricingSummary pricing={journey.pricing} travelers={journey.travelers} onCheckout={handleCheckout} isCheckoutDisabled={journey.pricing.flights.subtotal === 0 && journey.pricing.hotels.subtotal === 0} />
                </div>
              </div>
            </div>
          </MaxWidthContainer>
        </div>

        {/* Mobile Footer */}
        <MobilePricingFooter pricing={journey.pricing} onExpand={() => {}} onCheckout={handleCheckout} isCheckoutDisabled={journey.pricing.flights.subtotal === 0 && journey.pricing.hotels.subtotal === 0} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {showOnboarding && <JourneyOnboarding onComplete={completeOnboarding} onSkip={completeOnboarding} />}

      {/* ============ HERO SECTION - SAME AS FLIGHTS PAGE ============ */}
      <div className="relative bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 border-b border-neutral-200/60 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #E74035 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <MaxWidthContainer className="relative" noPadding={true}>
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 animate-fadeIn">
              <h1 key={`title-${animationKey}`} className="hero-title text-[13px] sm:text-lg md:text-3xl lg:text-[36px] font-extrabold tracking-[0.01em] leading-tight whitespace-nowrap">
                {mounted ? title.split('').map((char, index) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${index * 0.038}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{title}</span>}
              </h1>
              <span className="hidden md:inline-block text-primary-400 text-xl lg:text-2xl font-bold mx-2">•</span>
              <p key={`subtitle-${animationKey}`} className="hero-subtitle text-neutral-600 mb-0 font-medium text-[11px] sm:text-sm md:text-base lg:text-lg leading-tight whitespace-nowrap" style={{ letterSpacing: '0.01em' }}>
                {mounted ? subtitle.split('').map((char, index) => (
                  <span key={index} className="letter-elastic" style={{ animationDelay: `${2.0 + (index * 0.028)}s`, display: 'inline-block', minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )) : <span style={{ opacity: 0 }}>{subtitle}</span>}
              </p>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <style jsx>{`
        .floating-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.12; animation: float 20s ease-in-out infinite; z-index: 0; }
        .floating-orb-1 { width: 200px; height: 200px; background: linear-gradient(135deg, #E74035, #F7C928); top: -80px; left: 5%; animation-delay: 0s; animation-duration: 25s; }
        .floating-orb-2 { width: 180px; height: 180px; background: linear-gradient(135deg, #D63B34, #E74035); top: -60px; right: 10%; animation-delay: 5s; animation-duration: 30s; }
        .floating-orb-3 { width: 150px; height: 150px; background: linear-gradient(135deg, #F7C928, #E74035); bottom: -50px; left: 50%; animation-delay: 10s; animation-duration: 28s; }
        @media (min-width: 768px) {
          .floating-orb-1 { width: 300px; height: 300px; top: -150px; left: 10%; }
          .floating-orb-2 { width: 250px; height: 250px; top: -100px; right: 15%; }
          .floating-orb-3 { width: 200px; height: 200px; bottom: -100px; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -8px) scale(1.02); }
          50% { transform: translate(-8px, 5px) scale(0.98); }
          75% { transform: translate(6px, -6px) scale(1.01); }
        }
        .hero-title { color: #E74035; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(231, 64, 53, 0.12); position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; isolation: isolate; font-weight: 800; }
        .letter-elastic { opacity: 0; animation: elasticLetterEntrance 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; transform-origin: center center; position: relative; z-index: 1; backface-visibility: hidden; }
        @keyframes elasticLetterEntrance { 0% { opacity: 0; transform: translateY(-5px) scale(0.9) translateZ(0); } 100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); } }
        .hero-subtitle { position: relative; z-index: 10; transform: translateZ(0); backface-visibility: hidden; isolation: isolate; color: #525252; font-weight: 500; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
      `}</style>

      {/* ============ SEARCH BAR - JOURNEY MODE (NO TABS, REDIRECTS TO BUILDER) ============ */}
      <div className="border-b border-neutral-100">
        <MobileHomeSearchWrapper lang={lang} defaultService="flights" hideTabs journeyMode />
      </div>

      {/* ============ TRUST BAR - SAME AS FLIGHTS PAGE ============ */}
      <CompactTrustBar sticky />

      {/* ============ JOURNEY-SPECIFIC SECTIONS ============ */}

      {/* Journey Preview */}
      <div className="mt-4 md:mt-8">
        <MaxWidthContainer>
          <div className="px-3 md:px-0">
            <JourneyPreviewShowcase />
          </div>
        </MaxWidthContainer>
      </div>

      {/* Recently Viewed */}
      <div className="mt-4 md:mt-8">
        <RecentlyViewedSection lang={lang} />
      </div>

      {/* Why Journey */}
      <WhyJourneySection />

      {/* Templates */}
      <JourneyTemplatesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Stats */}
      <JourneyStatsSection />

      {/* What's Included */}
      <WhatsIncludedSection />
    </div>
  );
}
