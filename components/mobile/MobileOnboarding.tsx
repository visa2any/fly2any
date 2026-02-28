'use client';

/**
 * MobileOnboarding — First-launch experience for native app users
 * 
 * Shows a premium walkthrough of Fly2Any's products and features,
 * then guides users through permission setup.
 */

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Plane, Building2, Car, MapPin, Zap, Bell, Navigation, ArrowRight, X, Sparkles } from 'lucide-react';

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: <Plane className="w-12 h-12 text-white" />,
    title: 'Search 900+ Airlines',
    description: 'AI-powered flight search finds you the best deals across hundreds of airlines worldwide.',
    gradient: 'from-primary-500 to-primary-700',
  },
  {
    icon: <Building2 className="w-12 h-12 text-white" />,
    title: 'Hotels & Stays',
    description: 'Compare thousands of hotels, from budget-friendly to luxury. Best price guaranteed.',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    icon: <Car className="w-12 h-12 text-white" />,
    title: 'Cars, Tours & More',
    description: 'Rent cars, book tours, activities, transfers, and complete travel packages — all in one app.',
    gradient: 'from-emerald-500 to-emerald-700',
  },
  {
    icon: <Sparkles className="w-12 h-12 text-white" />,
    title: 'Smart Travel AI',
    description: 'Price predictions, personalized recommendations, and TripMatch AI plans your perfect trip.',
    gradient: 'from-purple-500 to-purple-700',
  },
];

export function MobileOnboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [permissionStep, setPermissionStep] = useState(false);

  useEffect(() => {
    // Only show on native platforms, and only once
    let isNative = false;
    try {
      isNative = Capacitor.isNativePlatform();
    } catch {
      // Not in Capacitor
    }
    if (!isNative) return;

    const hasSeenOnboarding = localStorage.getItem('fly2any_onboarding_complete');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setPermissionStep(true);
    }
  }, [currentSlide]);

  const handleRequestPermissions = useCallback(async () => {
    try {
      // Request push notification permission
      if (Capacitor.isPluginAvailable('PushNotifications')) {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        await PushNotifications.requestPermissions();
      }

      // Request location permission
      if (Capacitor.isPluginAvailable('Geolocation')) {
        const { Geolocation } = await import('@capacitor/geolocation');
        await Geolocation.requestPermissions();
      }
    } catch (error) {
      console.log('[Onboarding] Permission request handled:', error);
    }

    handleComplete();
  }, []);

  const handleComplete = useCallback(() => {
    localStorage.setItem('fly2any_onboarding_complete', 'true');
    setIsVisible(false);
  }, []);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  if (!isVisible) return null;

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-neutral-600 safe-area-top"
        aria-label="Skip onboarding"
      >
        <X className="w-6 h-6" />
      </button>

      {permissionStep ? (
        /* Permission Request Screen */
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-3">
            Stay in the Loop
          </h2>
          <p className="text-neutral-500 mb-8 max-w-sm">
            Get notified about price drops, flash deals, and booking updates. We&apos;ll also use your location to find the best nearby airport deals.
          </p>
          <button
            onClick={handleRequestPermissions}
            className="w-full max-w-sm mobile-btn-primary mb-4"
          >
            <Bell className="w-5 h-5" />
            Enable Notifications & Location
          </button>
          <button
            onClick={handleComplete}
            className="text-neutral-400 text-sm font-medium"
          >
            Maybe Later
          </button>
        </div>
      ) : (
        /* Product Walkthrough */
        <>
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            {/* Icon */}
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-8 shadow-xl`}>
              {slide.icon}
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-neutral-800 mb-3 text-center">
              {slide.title}
            </h2>
            <p className="text-neutral-500 text-center max-w-sm leading-relaxed">
              {slide.description}
            </p>
          </div>

          {/* Bottom Controls */}
          <div className="px-8 pb-8 safe-area-bottom">
            {/* Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'w-8 bg-primary-500'
                      : 'w-2 bg-neutral-200'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="w-full mobile-btn-primary"
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MobileOnboarding;
