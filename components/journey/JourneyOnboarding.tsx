'use client';

/**
 * Journey Onboarding
 * First-time user experience (max 15 seconds)
 * Fly2Any Travel Operating System
 */

import React, { useState, useEffect } from 'react';
import { X, Plane, Building2, Sparkles, Calendar, ChevronRight } from 'lucide-react';

interface JourneyOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STORAGE_KEY = 'fly2any_journey_onboarding_seen';

export function JourneyOnboarding({ onComplete, onSkip }: JourneyOnboardingProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    onComplete();
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Header visual */}
        <div className="relative h-40 bg-gradient-to-br from-[#D63A35] to-[#B12F2B] overflow-hidden">
          {/* Animated elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Timeline preview animation */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce" style={{ animationDelay: '0ms' }}>
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce" style={{ animationDelay: '150ms' }}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce" style={{ animationDelay: '300ms' }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce" style={{ animationDelay: '450ms' }}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Your entire trip, intelligently designed
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Journey brings everything together in one beautiful timeline
          </p>

          {/* Features */}
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <Plane className="w-4 h-4 text-[#D63A35]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Flights + Hotels in one timeline</p>
                <p className="text-sm text-gray-500">See your entire trip day by day</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">AI suggests experiences per day</p>
                <p className="text-sm text-gray-500">Restaurants, attractions, and activities</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">See total price instantly</p>
                <p className="text-sm text-gray-500">No surprises, complete transparency</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleComplete}
              className="w-full h-12 bg-gradient-to-r from-[#D63A35] to-[#C7342F] hover:from-[#C7342F] hover:to-[#B12F2B] text-white font-semibold rounded-xl shadow-lg shadow-red-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#D63A35] focus:ring-[#D63A35]"
                />
                <span className="text-sm text-gray-500">Don't show again</span>
              </label>

              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage onboarding state
 */
export function useJourneyOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}

export default JourneyOnboarding;
