'use client';

import { useState, useEffect } from 'react';
import { Plane, Search, CheckCircle2, TrendingDown, Sparkles, Clock, Shield } from 'lucide-react';
import { MultipleFlightCardMobileSkeletons } from '@/components/skeletons/FlightCardMobileSkeleton';

interface InlineFlightLoadingProps {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  isMultiCity?: boolean;
}

interface LoadingStage {
  id: number;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'complete';
}

const searchTips = [
  {
    icon: <TrendingDown className="w-4 h-4 text-success-600" />,
    title: "Best Price Guarantee",
    description: "Searching 500+ airlines for lowest fares"
  },
  {
    icon: <Clock className="w-4 h-4 text-primary-500" />,
    title: "Real-Time Pricing",
    description: "Live updates every second for accuracy"
  },
  {
    icon: <Shield className="w-4 h-4 text-secondary-500" />,
    title: "Secure & Trusted",
    description: "Your data is always protected"
  },
  {
    icon: <Sparkles className="w-4 h-4 text-warning-500" />,
    title: "AI-Powered",
    description: "Smart ranking for best flight deals"
  }
];

export default function InlineFlightLoading({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  children,
  infants,
  cabinClass,
  isMultiCity = false
}: InlineFlightLoadingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  const stages: LoadingStage[] = [
    {
      id: 1,
      label: "Searching databases",
      icon: <Search className="w-3.5 h-3.5" />,
      status: currentStage >= 0 ? (currentStage > 0 ? 'complete' : 'active') : 'pending'
    },
    {
      id: 2,
      label: "Comparing airlines",
      icon: <Plane className="w-3.5 h-3.5" />,
      status: currentStage >= 1 ? (currentStage > 1 ? 'complete' : 'active') : 'pending'
    },
    {
      id: 3,
      label: "Analyzing prices",
      icon: <TrendingDown className="w-3.5 h-3.5" />,
      status: currentStage >= 2 ? (currentStage > 2 ? 'complete' : 'active') : 'pending'
    },
    {
      id: 4,
      label: "Ranking deals",
      icon: <Sparkles className="w-3.5 h-3.5" />,
      status: currentStage >= 3 ? (currentStage > 3 ? 'complete' : 'active') : 'pending'
    }
  ];

  // Progress through stages - loops back if search not finished
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => (prev < stages.length - 1 ? prev + 1 : 0)); // Loop back to start
    }, 1200);

    return () => clearInterval(stageInterval);
  }, []);

  // Rotate tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % searchTips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, []);

  const totalPassengers = adults + children + infants;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const cabinClassLabels: { [key: string]: string } = {
    economy: 'Economy',
    premium: 'Premium Economy',
    business: 'Business',
    first: 'First Class'
  };

  return (
    <div className="space-y-4">
      {/* Main Progress Card - Matches flight card styling */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-shadow">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 border-2 border-primary-200 rounded-full opacity-20"></div>
            <div className="absolute inset-0 border-2 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-1 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-neutral-900">Finding Best Flights</h3>
            <p className="text-xs text-neutral-600">
              {isMultiCity ? 'Multi-city' : `${origin} → ${destination}`} • {totalPassengers} pax • {cabinClassLabels[cabinClass]}
            </p>
          </div>
        </div>

        {/* Progress Stages - Grid Layout */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-500 ${
                stage.status === 'active'
                  ? 'bg-primary-50 border border-primary-300'
                  : stage.status === 'complete'
                  ? 'bg-success-50 border border-success-300'
                  : 'bg-neutral-50 border border-neutral-200'
              }`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                  stage.status === 'active'
                    ? 'bg-primary-500 text-white animate-pulse'
                    : stage.status === 'complete'
                    ? 'bg-success-500 text-white'
                    : 'bg-neutral-300 text-neutral-600'
                }`}
              >
                {stage.status === 'complete' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-3.5 h-3.5">{stage.icon}</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-xs font-medium truncate transition-colors duration-500 ${
                    stage.status === 'active'
                      ? 'text-primary-900'
                      : stage.status === 'complete'
                      ? 'text-success-900'
                      : 'text-neutral-600'
                  }`}
                >
                  {stage.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Airplane Progress Bar - Premium Animation */}
        <div className="mb-4">
          {/* Airport Markers */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-primary-500 rounded-full ring-2 ring-primary-200 animate-pulse"></div>
              <span className="text-xs font-bold text-primary-600">{origin}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-success-600">{destination}</span>
              <div className="w-2.5 h-2.5 bg-success-500 rounded-full ring-2 ring-success-200"></div>
            </div>
          </div>

          {/* Flight Path */}
          <div className="relative h-3 bg-gradient-to-r from-primary-100 via-neutral-50 to-success-100 rounded-full overflow-visible">
            {/* Vapor Trail - animated gradient */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out overflow-hidden"
              style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-200 opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
            </div>

            {/* Dotted Path Line */}
            <div className="absolute inset-0 flex items-center px-2">
              <div className="flex-1 border-t-2 border-dashed border-neutral-300/50"></div>
            </div>

            {/* Animated Airplane with CSS animation */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-10"
              style={{ left: `calc(${((currentStage + 1) / stages.length) * 100}% - 14px)` }}
            >
              {/* Engine glow */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-1 bg-gradient-to-l from-orange-400 to-transparent rounded-full opacity-70 animate-pulse"></div>

              {/* Plane shadow */}
              <div className="absolute top-3 left-1 w-5 h-1 bg-black/10 rounded-full blur-sm"></div>

              {/* Airplane Icon - rotated to align with flight path */}
              <div className="relative animate-fly-bob" style={{ transform: 'rotate(-12deg)' }}>
                <Plane
                  className="w-7 h-7 text-primary-600 drop-shadow-md"
                  fill="currentColor"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                />
              </div>
            </div>
          </div>

          {/* Progress Text */}
          <div className="text-center mt-2.5 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-ping"></span>
              {Math.round(((currentStage + 1) / stages.length) * 100)}%
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-primary-600">Searching...</span>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes fly-bob {
            0%, 100% { transform: rotate(-12deg) translateY(0); }
            50% { transform: rotate(-8deg) translateY(-2px); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-fly-bob {
            animation: fly-bob 1.5s ease-in-out infinite;
          }
          .animate-shimmer {
            animation: shimmer 2s ease-in-out infinite;
          }
        `}</style>

        {/* Rotating Tips */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-3 border border-primary-100 overflow-hidden min-h-[60px]">
          <div className="transition-all duration-500 ease-in-out">
            {searchTips.map((tip, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  index === currentTip
                    ? 'opacity-100 transform translate-y-0'
                    : 'opacity-0 transform translate-y-4 absolute'
                }`}
                style={{ display: index === currentTip ? 'flex' : 'none' }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-neutral-200">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 text-xs mb-0.5">{tip.title}</h4>
                    <p className="text-neutral-600 text-xs">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tip indicator dots */}
          <div className="flex justify-center gap-1 mt-2">
            {searchTips.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentTip ? 'w-4 bg-primary-500' : 'w-1 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton Flight Cards - Using FlightCardMobileSkeleton for consistency */}
      <MultipleFlightCardMobileSkeletons count={3} />
    </div>
  );
}
