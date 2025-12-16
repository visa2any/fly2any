'use client';

/**
 * Journey Page - Main Entry Point
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
        // Step 1: Build journey structure (20%)
        await simulateProgress(setBuildProgress, 0, 20, 300);
        const newJourney = JourneyBuilder.build(params);

        // Step 2: Generate AI suggestions (60%)
        await simulateProgress(setBuildProgress, 20, 60, 500);
        const journeyWithSuggestions = await generateSuggestions(newJourney, params);

        // Step 3: Calculate pricing (80%)
        await simulateProgress(setBuildProgress, 60, 80, 300);
        const pricing = PricingAggregator.calculate(journeyWithSuggestions);
        journeyWithSuggestions.pricing = pricing;

        // Step 4: Finalize (100%)
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

  // Handle add experience - opens picker modal
  const handleAddExperience = useCallback(
    (dayIndex: number, timeSlot: string) => {
      if (!journey) return;
      setPickerDayIndex(dayIndex);
      setPickerTimeSlot(timeSlot as TimeSlot);
      setShowExperiencePicker(true);
    },
    [journey]
  );

  // Handle experience selected from picker
  const handleExperienceSelected = useCallback(
    (experience: JourneyExperience) => {
      addExperience(pickerDayIndex, experience);
      setShowExperiencePicker(false);
    },
    [addExperience, pickerDayIndex]
  );

  // Handle accept suggestion
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

  // Handle select flight - opens flight selector
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

  // Handle flight selected
  const handleFlightSelected = useCallback(
    (outbound: JourneyFlight, inbound?: JourneyFlight) => {
      if (!journey) return;

      // Update outbound flight on first day
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

      // Update return flight on last day
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

  // Handle select hotel - opens hotel selector
  const handleSelectHotel = useCallback(() => {
    if (!journey) return;

    setHotelSearchParams({
      destination: journey.destination.city,
      checkIn: journey.departureDate,
      checkOut: journey.returnDate,
      guests: {
        adults: journey.travelers.adults,
        children: journey.travelers.children,
      },
      rooms: 1,
      currency: 'USD',
      maxResults: 20,
    });
    setShowHotelSelector(true);
  }, [journey]);

  // Handle hotel selected
  const handleHotelSelected = useCallback(
    (hotel: JourneyHotel) => {
      if (!journey) return;

      // Update hotel on all middle days (not first or last day if they have flights)
      const updatedDays = journey.days.map((day, index) => {
        const isFirstDay = index === 0;
        const isLastDay = index === journey.days.length - 1;

        // For multi-day journeys, add hotel to all days except last departure day
        if (!isLastDay || journey.days.length === 1) {
          const hotelSegment = day.segments.find(s => s.type === 'hotel');
          if (hotelSegment) {
            return {
              ...day,
              segments: day.segments.map(seg =>
                seg.type === 'hotel'
                  ? { ...seg, hotel }
                  : seg
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

  // Recalculate pricing when journey changes
  useEffect(() => {
    if (journey) {
      const newPricing = PricingAggregator.calculate(journey);
      if (JSON.stringify(newPricing) !== JSON.stringify(journey.pricing)) {
        setJourney({ ...journey, pricing: newPricing });
      }
    }
  }, [journey?.days]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding */}
      {showOnboarding && (
        <JourneyOnboarding
          onComplete={completeOnboarding}
          onSkip={completeOnboarding}
        />
      )}

      {/* Experience Picker Modal */}
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

      {/* Flight Selector Modal */}
      {flightSearchParams && (
        <FlightSelector
          isOpen={showFlightSelector}
          onClose={() => setShowFlightSelector(false)}
          onSelect={handleFlightSelected}
          searchParams={flightSearchParams}
          isRoundTrip={!!journey?.returnDate}
        />
      )}

      {/* Hotel Selector Modal */}
      {hotelSearchParams && (
        <HotelSelector
          isOpen={showHotelSelector}
          onClose={() => setShowHotelSelector(false)}
          onSelect={handleHotelSelected}
          searchParams={hotelSearchParams}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {view === 'timeline' && (
                <button
                  onClick={() => setView('search')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <Link href="/" className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#D63A35]" />
                <span className="font-bold text-xl text-gray-900">Journey</span>
              </Link>
            </div>

            {journey && view === 'timeline' && (
              <div className="text-sm text-gray-500">
                {journey.origin.code} → {journey.destination.code} •{' '}
                {journey.duration} days
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'search' ? (
          // Search View
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Build Your Journey
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Your entire trip, intelligently designed
              </p>
            </div>

            {/* Search Form */}
            <JourneySearchForm
              onSubmit={handleBuildJourney}
              isLoading={isBuilding}
            />

            {/* Loading State */}
            {isBuilding && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-[#D63A35] border-t-transparent animate-spin"
                    style={{ animationDuration: '1s' }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Building your journey...
                </h3>
                <p className="text-gray-500 mb-4">
                  {buildProgress < 20 && 'Creating your itinerary...'}
                  {buildProgress >= 20 && buildProgress < 60 && 'Finding perfect experiences...'}
                  {buildProgress >= 60 && buildProgress < 80 && 'Calculating best prices...'}
                  {buildProgress >= 80 && 'Finalizing your journey...'}
                </p>
                <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#D63A35] to-[#E8C52A] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${buildProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">{buildProgress}%</p>
              </div>
            )}
          </div>
        ) : (
          // Timeline View
          journey && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Timeline (2/3 width) */}
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

              {/* Pricing Sidebar (1/3 width - desktop only) */}
              <div className="hidden lg:block lg:col-span-1">
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
      <footer className={`mt-16 py-8 border-t border-gray-200 bg-white ${journey && view === 'timeline' ? 'pb-32 lg:pb-8' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by Fly2Any Journey System • AI-assisted travel planning
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
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

    return {
      ...day,
      experiences: suggestions.experiences,
    };
  });

  return {
    ...journey,
    days: updatedDays,
  };
}
