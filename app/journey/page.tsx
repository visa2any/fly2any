'use client';

/**
 * Journey Page - AI-Powered Trip Builder
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Sparkles,
  Plane,
  Building2,
  Map,
  Calendar,
  Users,
  Shield,
  Zap,
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
  TrendingUp,
  Award,
  ChevronRight,
  Play,
} from 'lucide-react';

// Layout
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';

// Journey Components
import {
  JourneySearchForm,
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
// ANIMATED TITLE COMPONENT
// ============================================================================

function AnimatedJourneyTitle() {
  return (
    <div className="text-center mb-8">
      {/* AI Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-amber-50 rounded-full border border-primary-100 mb-6">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-semibold bg-gradient-to-r from-primary-600 to-amber-600 bg-clip-text text-transparent">
          AI-Powered Trip Planning
        </span>
      </div>

      {/* Main Title with Animation */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight mb-4">
        <span className="inline-block animate-fade-in-up">Build My</span>{' '}
        <span className="inline-block animate-fade-in-up animation-delay-100 bg-gradient-to-r from-primary-600 via-primary-500 to-amber-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
          Journey
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
        Flights, hotels, and experiences — intelligently coordinated into one seamless trip
      </p>
    </div>
  );
}

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
    <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-3xl p-6 sm:p-8 border border-neutral-200/60 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/5 to-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Sample Journey</h3>
              <p className="text-sm text-neutral-500">Paris Weekend Escape</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">AI Generated</span>
          </div>
        </div>

        {/* Timeline Preview */}
        <div className="space-y-3">
          {previewDays.map((day, idx) => (
            <div
              key={day.day}
              className="flex gap-4 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow group"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Day Number */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                {day.day}
              </div>

              {/* Day Items */}
              <div className="flex-1 flex flex-wrap items-center gap-2">
                {day.items.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-neutral-50 rounded-lg text-sm text-neutral-700 border border-neutral-100"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 transition-colors flex-shrink-0 self-center" />
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-neutral-600">2 Flights</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-neutral-600">2 Nights</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-neutral-600">5 Experiences</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Est. Total</p>
            <p className="text-lg font-bold text-neutral-900">$1,249</p>
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
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Smart suggestions based on your preferences',
      color: 'from-primary-500 to-amber-500',
    },
    {
      icon: Globe,
      title: 'All-In-One',
      description: 'Flights, hotels & experiences combined',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: DollarSign,
      title: 'Save Money',
      description: 'Bundle pricing saves up to 30%',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Build complete trips in minutes',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <MaxWidthContainer>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
            Why Journey Builder?
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto">
            The smartest way to plan your entire trip
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-5 sm:p-6 bg-white rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-neutral-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </section>
  );
}

// ============================================================================
// JOURNEY TEMPLATES SECTION
// ============================================================================

function JourneyTemplatesSection() {
  const templates = [
    {
      icon: Palmtree,
      title: 'Beach Getaway',
      duration: '5-7 days',
      price: 'From $899',
      color: 'from-cyan-500 to-blue-500',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    },
    {
      icon: Building2,
      title: 'City Explorer',
      duration: '3-5 days',
      price: 'From $599',
      color: 'from-purple-500 to-indigo-500',
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80',
    },
    {
      icon: Heart,
      title: 'Romantic Escape',
      duration: '4-5 days',
      price: 'From $799',
      color: 'from-pink-500 to-rose-500',
      image: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=400&q=80',
    },
    {
      icon: Mountain,
      title: 'Adventure Trip',
      duration: '7-10 days',
      price: 'From $1,199',
      color: 'from-green-500 to-emerald-500',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-neutral-50">
      <MaxWidthContainer>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
            Popular Journey Templates
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Start with a template or build from scratch
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {templates.map((template) => (
            <div
              key={template.title}
              className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-32 sm:h-40 overflow-hidden">
                <Image
                  src={template.image}
                  alt={template.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className={`absolute top-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg`}>
                  <template.icon className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-neutral-900 mb-1">{template.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{template.duration}</span>
                  <span className="font-semibold text-primary-600">{template.price}</span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-primary-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  Start Journey
                </span>
              </div>
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

function HowItWorksSection() {
  const steps = [
    { num: '1', title: 'Enter Details', desc: 'Where & when you want to travel', icon: Compass },
    { num: '2', title: 'AI Builds', desc: 'Smart day-by-day itinerary', icon: Sparkles },
    { num: '3', title: 'Customize', desc: 'Add or swap experiences', icon: Map },
    { num: '4', title: 'Book & Go', desc: 'One checkout for everything', icon: CheckCircle2 },
  ];

  return (
    <section className="py-12 sm:py-16">
      <MaxWidthContainer>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
            How Journey Works
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, idx) => (
            <div key={step.num} className="relative text-center">
              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-300 to-primary-100" />
              )}

              {/* Step Circle */}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/25">
                <step.icon className="w-7 h-7" />
              </div>

              <h3 className="font-semibold text-neutral-900 mb-1">{step.title}</h3>
              <p className="text-sm text-neutral-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </section>
  );
}

// ============================================================================
// JOURNEY STATS SECTION
// ============================================================================

function JourneyStatsSection() {
  const stats = [
    { value: '500K+', label: 'Journeys Built', icon: Globe },
    { value: '4.9★', label: 'User Rating', icon: Star },
    { value: '$340', label: 'Avg. Savings', icon: DollarSign },
    { value: '15min', label: 'Avg. Build Time', icon: Clock },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-neutral-900 to-neutral-800">
      <MaxWidthContainer>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <stat.icon className="w-6 h-6 text-primary-400" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </section>
  );
}

// ============================================================================
// WHAT'S INCLUDED SECTION
// ============================================================================

function WhatsIncludedSection() {
  const includes = [
    { icon: Plane, text: 'Flights from 500+ airlines', available: true },
    { icon: Building2, text: 'Hotels from 2M+ properties', available: true },
    { icon: Sparkles, text: 'Curated experiences & tours', available: true },
    { icon: Shield, text: 'Travel insurance options', available: true },
    { icon: Map, text: 'Car rentals', available: false, soon: true },
    { icon: Award, text: 'Airport lounge access', available: false, soon: true },
  ];

  return (
    <section className="py-12 sm:py-16">
      <MaxWidthContainer>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
            What's Included
          </h2>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {includes.map((item) => (
            <div
              key={item.text}
              className={`flex items-center gap-4 p-4 rounded-xl border ${
                item.available
                  ? 'bg-white border-neutral-100'
                  : 'bg-neutral-50 border-neutral-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                item.available
                  ? 'bg-primary-50 text-primary-600'
                  : 'bg-neutral-100 text-neutral-400'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={item.available ? 'text-neutral-900' : 'text-neutral-500'}>
                {item.text}
              </span>
              {item.available && (
                <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
              )}
              {item.soon && (
                <span className="ml-auto text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                  Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </section>
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

  // Modals state
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);
  const [pickerDayIndex, setPickerDayIndex] = useState(0);
  const [pickerTimeSlot, setPickerTimeSlot] = useState<TimeSlot>('morning');
  const [showFlightSelector, setShowFlightSelector] = useState(false);
  const [flightSearchParams, setFlightSearchParams] = useState<JourneyFlightSearchParams | null>(null);
  const [showHotelSelector, setShowHotelSelector] = useState(false);
  const [hotelSearchParams, setHotelSearchParams] = useState<JourneyHotelSearchParams | null>(null);

  // Handle checkout navigation
  const handleCheckout = useCallback(() => {
    if (!journey) return;
    sessionStorage.setItem('journey_checkout', JSON.stringify(journey));
    router.push('/journey/checkout');
  }, [journey, router]);

  // Handle form submit - Build Journey
  const handleBuildJourney = useCallback(
    async (params: JourneySearchParams) => {
      setBuilding(true);
      setBuildProgress(0);

      try {
        await simulateProgress(setBuildProgress, 0, 20, 300);
        const newJourney = JourneyBuilder.build(params);

        await simulateProgress(setBuildProgress, 20, 60, 500);
        const journeyWithSuggestions = await generateSuggestions(newJourney, params);

        await simulateProgress(setBuildProgress, 60, 80, 300);
        const pricing = PricingAggregator.calculate(journeyWithSuggestions);
        journeyWithSuggestions.pricing = pricing;

        await simulateProgress(setBuildProgress, 80, 100, 200);

        setJourney(journeyWithSuggestions);
        setView('timeline');
      } catch (error) {
        console.error('Error building journey:', error);
      } finally {
        setBuilding(false);
      }
    },
    [setBuilding, setBuildProgress, setJourney]
  );

  // Experience handlers
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
    const day = journey.days[dayIndex];
    const experience = day.experiences.find((e) => e.id === experienceId);
    if (experience) {
      updateExperience(dayIndex, { ...experience, status: 'added' });
    }
  }, [journey, updateExperience]);

  // Flight handlers
  const handleSelectFlight = useCallback(() => {
    if (!journey) return;
    setFlightSearchParams({
      origin: journey.origin.code,
      destination: journey.destination.code,
      departureDate: journey.departureDate,
      returnDate: journey.returnDate,
      travelers: journey.travelers,
      cabinClass: 'economy',
      maxResults: 20,
    });
    setShowFlightSelector(true);
  }, [journey]);

  const handleFlightSelected = useCallback((outbound: JourneyFlight, inbound?: JourneyFlight) => {
    if (!journey) return;
    const updatedDays = [...journey.days];
    if (updatedDays[0]) {
      updatedDays[0] = {
        ...updatedDays[0],
        segments: updatedDays[0].segments.map(seg =>
          seg.type === 'outbound-flight' ? { ...seg, flight: outbound } : seg
        ),
      };
    }
    if (inbound && updatedDays.length > 1) {
      const lastIdx = updatedDays.length - 1;
      updatedDays[lastIdx] = {
        ...updatedDays[lastIdx],
        segments: updatedDays[lastIdx].segments.map(seg =>
          seg.type === 'return-flight' ? { ...seg, flight: inbound } : seg
        ),
      };
    }
    setJourney({ ...journey, days: updatedDays });
    setShowFlightSelector(false);
  }, [journey, setJourney]);

  // Hotel handlers
  const handleSelectHotel = useCallback(() => {
    if (!journey) return;
    setHotelSearchParams({
      destination: journey.destination.city,
      checkIn: journey.departureDate,
      checkOut: journey.returnDate,
      guests: { adults: journey.travelers.adults, children: journey.travelers.children },
      rooms: 1,
      currency: 'USD',
      maxResults: 20,
    });
    setShowHotelSelector(true);
  }, [journey]);

  const handleHotelSelected = useCallback((hotel: JourneyHotel) => {
    if (!journey) return;
    const updatedDays = journey.days.map((day, index) => {
      const isLastDay = index === journey.days.length - 1;
      if (!isLastDay || journey.days.length === 1) {
        const hotelSegment = day.segments.find(s => s.type === 'hotel');
        if (hotelSegment) {
          return {
            ...day,
            segments: day.segments.map(seg => seg.type === 'hotel' ? { ...seg, hotel } : seg),
          };
        }
      }
      return day;
    });
    setJourney({ ...journey, days: updatedDays });
    setShowHotelSelector(false);
  }, [journey, setJourney]);

  // Update pricing when journey changes
  useEffect(() => {
    if (journey) {
      const newPricing = PricingAggregator.calculate(journey);
      if (JSON.stringify(newPricing) !== JSON.stringify(journey.pricing)) {
        setJourney({ ...journey, pricing: newPricing });
      }
    }
  }, [journey?.days]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Onboarding */}
      {showOnboarding && (
        <JourneyOnboarding onComplete={completeOnboarding} onSkip={completeOnboarding} />
      )}

      {/* Modals */}
      {journey && (
        <ExperiencePicker
          isOpen={showExperiencePicker}
          onClose={() => setShowExperiencePicker(false)}
          onSelect={handleExperienceSelected}
          destinationCode={journey.destination.code}
          timeSlot={pickerTimeSlot}
          interests={journey.preferences.interests}
        />
      )}
      {flightSearchParams && (
        <FlightSelector
          isOpen={showFlightSelector}
          onClose={() => setShowFlightSelector(false)}
          onSelect={handleFlightSelected}
          searchParams={flightSearchParams}
          isRoundTrip={!!journey?.returnDate}
        />
      )}
      {hotelSearchParams && (
        <HotelSelector
          isOpen={showHotelSelector}
          onClose={() => setShowHotelSelector(false)}
          onSelect={handleHotelSelected}
          searchParams={hotelSearchParams}
        />
      )}

      {/* Main Content */}
      {view === 'search' ? (
        <>
          {/* Hero Section */}
          <section className="pt-8 pb-6 sm:pt-12 sm:pb-8">
            <MaxWidthContainer>
              {/* Animated Title */}
              <AnimatedJourneyTitle />

              {/* Search Form Card */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-5 sm:p-6 lg:p-8">
                  <JourneySearchForm onSubmit={handleBuildJourney} isLoading={isBuilding} />
                </div>

                {/* Trust Bar - Under Form */}
                <div className="mt-6">
                  <CompactTrustBar />
                </div>
              </div>
            </MaxWidthContainer>
          </section>

          {/* Loading State */}
          {isBuilding && (
            <section className="py-16 bg-white">
              <div className="max-w-md mx-auto px-4 text-center">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"
                    style={{ animationDuration: '1s' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Building Your Journey
                </h3>
                <p className="text-neutral-500 mb-6">
                  {buildProgress < 20 && 'Creating itinerary structure...'}
                  {buildProgress >= 20 && buildProgress < 60 && 'Finding perfect experiences...'}
                  {buildProgress >= 60 && buildProgress < 80 && 'Calculating best prices...'}
                  {buildProgress >= 80 && 'Finalizing your journey...'}
                </p>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-amber-500 transition-all duration-300 ease-out"
                    style={{ width: `${buildProgress}%` }}
                  />
                </div>
                <p className="text-sm text-neutral-400 mt-3">{buildProgress}% complete</p>
              </div>
            </section>
          )}

          {/* Journey Preview */}
          {!isBuilding && (
            <section className="py-8 sm:py-12">
              <MaxWidthContainer>
                <JourneyPreviewShowcase />
              </MaxWidthContainer>
            </section>
          )}

          {/* Page Sections */}
          {!isBuilding && (
            <>
              <WhyJourneySection />
              <JourneyTemplatesSection />
              <HowItWorksSection />
              <JourneyStatsSection />
              <WhatsIncludedSection />
            </>
          )}
        </>
      ) : (
        /* Timeline View */
        journey && (
          <>
            {/* Sub-header */}
            <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-lg border-b border-neutral-200">
              <MaxWidthContainer>
                <div className="flex items-center justify-between h-14">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setView('search')}
                      className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                      <span className="hidden sm:inline font-medium">New Journey</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-semibold text-neutral-900">Journey Builder</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-500">
                      {journey.origin.code} → {journey.destination.code}
                    </span>
                    <span className="px-2.5 py-1 bg-primary-50 rounded-lg font-medium text-primary-600">
                      {journey.duration} days
                    </span>
                  </div>
                </div>
              </MaxWidthContainer>
            </div>

            {/* Timeline Content */}
            <div className="py-6 lg:py-8">
              <MaxWidthContainer>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div className="lg:col-span-2">
                    <JourneyTimeline
                      journey={journey}
                      selectedDayIndex={selectedDayIndex}
                      onSelectDay={setSelectedDay}
                      onAddExperience={handleAddExperience}
                      onRemoveExperience={removeExperience}
                      onAcceptSuggestion={handleAcceptSuggestion}
                      onSelectFlight={handleSelectFlight}
                      onSelectHotel={handleSelectHotel}
                    />
                  </div>
                  <div className="hidden lg:block">
                    <div className="sticky top-24">
                      <JourneyPricingSummary
                        pricing={journey.pricing}
                        travelers={journey.travelers}
                        onCheckout={handleCheckout}
                        isCheckoutDisabled={
                          journey.pricing.flights.subtotal === 0 &&
                          journey.pricing.hotels.subtotal === 0
                        }
                      />
                    </div>
                  </div>
                </div>
              </MaxWidthContainer>
            </div>
          </>
        )
      )}

      {/* Mobile Pricing Footer */}
      {journey && view === 'timeline' && (
        <MobilePricingFooter
          pricing={journey.pricing}
          onExpand={() => {}}
          onCheckout={handleCheckout}
          isCheckoutDisabled={
            journey.pricing.flights.subtotal === 0 &&
            journey.pricing.hotels.subtotal === 0
          }
        />
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

async function simulateProgress(
  setProgress: (p: number) => void,
  from: number,
  to: number,
  duration: number
): Promise<void> {
  const steps = 10;
  const stepDuration = duration / steps;
  const stepSize = (to - from) / steps;
  for (let i = 0; i <= steps; i++) {
    await new Promise((resolve) => setTimeout(resolve, stepDuration));
    setProgress(Math.round(from + stepSize * i));
  }
}

async function generateSuggestions(
  journey: Journey,
  params: JourneySearchParams
): Promise<Journey> {
  const updatedDays = journey.days.map((day) => {
    const suggestions = AIExperienceEngine.getSuggestions(
      day,
      params.destination,
      journey.preferences,
      []
    );
    return { ...day, experiences: suggestions.experiences };
  });
  return { ...journey, days: updatedDays };
}
