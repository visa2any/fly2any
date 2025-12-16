'use client';

/**
 * Journey Page - AI-Powered Trip Builder
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Sparkles,
  Plane,
  Building2,
  Map,
  Calendar,
  Users,
  Shield,
  Zap,
  Star,
  ChevronRight,
  Globe,
  Heart,
  Award,
} from 'lucide-react';

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

  // Handle checkout navigation
  const handleCheckout = useCallback(() => {
    if (!journey) return;
    sessionStorage.setItem('journey_checkout', JSON.stringify(journey));
    router.push('/journey/checkout');
  }, [journey, router]);

  // Experience Picker state
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);
  const [pickerDayIndex, setPickerDayIndex] = useState(0);
  const [pickerTimeSlot, setPickerTimeSlot] = useState<TimeSlot>('morning');

  // Flight Selector state
  const [showFlightSelector, setShowFlightSelector] = useState(false);
  const [flightSearchParams, setFlightSearchParams] = useState<JourneyFlightSearchParams | null>(null);

  // Hotel Selector state
  const [showHotelSelector, setShowHotelSelector] = useState(false);
  const [hotelSearchParams, setHotelSearchParams] = useState<JourneyHotelSearchParams | null>(null);

  // Mobile pricing modal state
  const [showMobilePricing, setShowMobilePricing] = useState(false);

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

  // Handle add experience
  const handleAddExperience = useCallback(
    (dayIndex: number, timeSlot: string) => {
      if (!journey) return;
      setPickerDayIndex(dayIndex);
      setPickerTimeSlot(timeSlot as TimeSlot);
      setShowExperiencePicker(true);
    },
    [journey]
  );

  const handleExperienceSelected = useCallback(
    (experience: JourneyExperience) => {
      addExperience(pickerDayIndex, experience);
      setShowExperiencePicker(false);
    },
    [addExperience, pickerDayIndex]
  );

  const handleAcceptSuggestion = useCallback(
    (dayIndex: number, experienceId: string) => {
      if (!journey) return;
      const day = journey.days[dayIndex];
      const experience = day.experiences.find((e) => e.id === experienceId);
      if (experience) {
        updateExperience(dayIndex, { ...experience, status: 'added' });
      }
    },
    [journey, updateExperience]
  );

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

  const handleFlightSelected = useCallback(
    (outbound: JourneyFlight, inbound?: JourneyFlight) => {
      if (!journey) return;
      const updatedDays = [...journey.days];
      if (updatedDays[0]) {
        updatedDays[0] = {
          ...updatedDays[0],
          segments: updatedDays[0].segments.map(seg =>
            seg.type === 'outbound-flight'
              ? { ...seg, type: 'outbound-flight' as const, flight: outbound }
              : seg
          ),
        };
      }
      if (inbound && updatedDays.length > 1) {
        const lastDayIndex = updatedDays.length - 1;
        updatedDays[lastDayIndex] = {
          ...updatedDays[lastDayIndex],
          segments: updatedDays[lastDayIndex].segments.map(seg =>
            seg.type === 'return-flight'
              ? { ...seg, type: 'return-flight' as const, flight: inbound }
              : seg
          ),
        };
      }
      setJourney({ ...journey, days: updatedDays });
      setShowFlightSelector(false);
    },
    [journey, setJourney]
  );

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

  const handleHotelSelected = useCallback(
    (hotel: JourneyHotel) => {
      if (!journey) return;
      const updatedDays = journey.days.map((day, index) => {
        const isLastDay = index === journey.days.length - 1;
        if (!isLastDay || journey.days.length === 1) {
          const hotelSegment = day.segments.find(s => s.type === 'hotel');
          if (hotelSegment) {
            return {
              ...day,
              segments: day.segments.map(seg =>
                seg.type === 'hotel' ? { ...seg, hotel } : seg
              ),
            };
          }
        }
        return day;
      });
      setJourney({ ...journey, days: updatedDays });
      setShowHotelSelector(false);
    },
    [journey, setJourney]
  );

  useEffect(() => {
    if (journey) {
      const newPricing = PricingAggregator.calculate(journey);
      if (JSON.stringify(newPricing) !== JSON.stringify(journey.pricing)) {
        setJourney({ ...journey, pricing: newPricing });
      }
    }
  }, [journey?.days]);

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

      {/* Journey Sub-header - Shows in timeline view */}
      {view === 'timeline' && journey && (
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('search')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">New Journey</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D63A35] to-[#E8C52A] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Journey Builder</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">
                  {journey.origin.code} → {journey.destination.code}
                </span>
                <span className="px-2.5 py-1 bg-[#D63A35]/10 rounded-lg font-medium text-[#D63A35]">
                  {journey.duration} days
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full">
        {view === 'search' ? (
          <>
            {/* Hero Section - Level 6 Apple-Class */}
            <section className="relative overflow-hidden w-full bg-[#0a0a0a]">
              {/* Subtle Radial Gradient - Single Tone */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/50 via-gray-900/80 to-[#0a0a0a]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#D63A35]/8 rounded-full blur-[200px]" />

              <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
                {/* Badge - Minimal */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-[#E8C52A]" />
                    <span className="text-xs font-medium text-gray-300 tracking-wide">
                      AI-Powered
                    </span>
                  </div>
                </div>

                {/* Headline - Apple-like Restraint */}
                <div className="text-center max-w-4xl mx-auto mb-10">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.15] tracking-tight mb-5">
                    Build your perfect journey
                  </h1>
                  <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                    Flights, hotels, and experiences — intelligently coordinated into one seamless trip.
                  </p>
                </div>

                {/* Search Form Card - Refined */}
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-xl shadow-black/10 p-5 sm:p-6 lg:p-8">
                    <JourneySearchForm onSubmit={handleBuildJourney} isLoading={isBuilding} />
                  </div>
                </div>

                {/* Trust Indicators - Subtle */}
                <div className="flex flex-wrap justify-center gap-8 mt-10">
                  {[
                    { icon: Shield, text: 'Best Price' },
                    { icon: Zap, text: 'Instant Booking' },
                    { icon: Heart, text: '24/7 Support' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-1.5 text-gray-500">
                      <item.icon className="w-3.5 h-3.5" />
                      <span className="text-xs tracking-wide">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Loading State */}
            {isBuilding && (
              <section className="py-16 bg-white">
                <div className="max-w-md mx-auto px-4 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                    <div
                      className="absolute inset-0 rounded-full border-4 border-[#D63A35] border-t-transparent animate-spin"
                      style={{ animationDuration: '1s' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-[#D63A35]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Building Your Journey
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {buildProgress < 20 && 'Creating itinerary structure...'}
                    {buildProgress >= 20 && buildProgress < 60 && 'Finding perfect experiences...'}
                    {buildProgress >= 60 && buildProgress < 80 && 'Calculating best prices...'}
                    {buildProgress >= 80 && 'Finalizing your journey...'}
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D63A35] to-[#E8C52A] transition-all duration-300 ease-out"
                      style={{ width: `${buildProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-3">{buildProgress}% complete</p>
                </div>
              </section>
            )}

            {/* Features Section */}
            {!isBuilding && (
              <section className="py-16 lg:py-24 bg-white w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                      Everything in One Place
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      No more juggling between tabs. Your entire trip, perfectly coordinated.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {[
                      {
                        icon: Plane,
                        title: 'Smart Flights',
                        description: 'Best routes and prices from 500+ airlines worldwide.',
                        color: 'from-blue-500 to-blue-600',
                      },
                      {
                        icon: Building2,
                        title: 'Perfect Hotels',
                        description: 'Handpicked accommodations matching your style and budget.',
                        color: 'from-purple-500 to-purple-600',
                      },
                      {
                        icon: Map,
                        title: 'Curated Experiences',
                        description: 'AI-suggested activities tailored to your interests.',
                        color: 'from-[#D63A35] to-[#E8C52A]',
                      },
                    ].map((feature) => (
                      <div
                        key={feature.title}
                        className="group p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* How It Works */}
            {!isBuilding && (
              <section className="py-16 lg:py-24 bg-gray-50 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      How It Works
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { step: '1', title: 'Enter Details', desc: 'Where & when you want to travel' },
                      { step: '2', title: 'AI Builds', desc: 'We create your perfect itinerary' },
                      { step: '3', title: 'Customize', desc: 'Pick flights, hotels & activities' },
                      { step: '4', title: 'Book & Go', desc: 'One checkout for everything' },
                    ].map((item, i) => (
                      <div key={item.step} className="relative">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto rounded-full bg-[#D63A35] text-white font-bold text-lg flex items-center justify-center mb-4">
                            {item.step}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        {i < 3 && (
                          <ChevronRight className="hidden md:block absolute top-6 -right-3 w-6 h-6 text-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        ) : (
          /* Timeline View */
          journey && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
            </div>
          )
        )}
      </main>

      {/* Mobile Pricing Footer */}
      {journey && view === 'timeline' && (
        <MobilePricingFooter
          pricing={journey.pricing}
          onExpand={() => setShowMobilePricing(true)}
          onCheckout={handleCheckout}
          isCheckoutDisabled={
            journey.pricing.flights.subtotal === 0 &&
            journey.pricing.hotels.subtotal === 0
          }
        />
      )}

      {/* Footer */}
      <footer className={`py-8 border-t border-gray-200 bg-white ${journey && view === 'timeline' ? 'pb-32 lg:pb-8' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D63A35]" />
              <span className="text-sm text-gray-500">
                Powered by Fly2Any Journey System
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Secure
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                Trusted
              </span>
            </div>
          </div>
        </div>
      </footer>
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
