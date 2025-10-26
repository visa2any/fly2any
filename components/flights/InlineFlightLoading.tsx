'use client';

import { useState, useEffect } from 'react';
import { Plane, Search, CheckCircle2, TrendingDown, Sparkles, Clock, Shield } from 'lucide-react';

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
    icon: <TrendingDown className="w-4 h-4 text-green-600" />,
    title: "Best Price Guarantee",
    description: "Searching 500+ airlines for lowest fares"
  },
  {
    icon: <Clock className="w-4 h-4 text-blue-600" />,
    title: "Real-Time Pricing",
    description: "Live updates every second for accuracy"
  },
  {
    icon: <Shield className="w-4 h-4 text-purple-600" />,
    title: "Secure & Trusted",
    description: "Your data is always protected"
  },
  {
    icon: <Sparkles className="w-4 h-4 text-yellow-600" />,
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

  // Progress through stages
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
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
            <div className="absolute inset-0 border-2 border-blue-200 rounded-full opacity-20"></div>
            <div className="absolute inset-0 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Finding Best Flights</h3>
            <p className="text-xs text-gray-600">
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
                  ? 'bg-blue-50 border border-blue-300'
                  : stage.status === 'complete'
                  ? 'bg-green-50 border border-green-300'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                  stage.status === 'active'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : stage.status === 'complete'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
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
                      ? 'text-blue-900'
                      : stage.status === 'complete'
                      ? 'text-green-900'
                      : 'text-gray-600'
                  }`}
                >
                  {stage.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Airplane Progress Bar */}
        <div className="mb-4">
          {/* Airport Markers */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-blue-600">{origin}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-green-600">{destination}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Flight Path */}
          <div className="relative h-2 bg-gradient-to-r from-blue-100 via-gray-100 to-green-100 rounded-full overflow-visible">
            {/* Vapor Trail - fading gradient behind the plane */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/40 via-blue-400/30 to-transparent rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>

            {/* Dotted Path Line */}
            <div className="absolute inset-0 flex items-center px-1">
              <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
            </div>

            {/* Animated Airplane */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
              style={{
                left: `${((currentStage + 1) / stages.length) * 100}%`,
                transform: `translate(-50%, -50%)`
              }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 w-8 h-8 bg-blue-400 rounded-full blur-md opacity-50 animate-pulse"></div>

              {/* Airplane Icon - rotated to point right with subtle ascent */}
              <div
                className="relative transition-transform duration-1000"
                style={{
                  transform: `rotate(${90 + Math.min(((currentStage + 1) / stages.length) * 20 - 10, 5)}deg)`
                }}
              >
                <Plane className="w-6 h-6 text-blue-600 drop-shadow-lg" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Progress Text */}
          <div className="text-center mt-2 text-xs font-semibold text-gray-700">
            {Math.round(((currentStage + 1) / stages.length) * 100)}% • Flight In Progress
          </div>
        </div>

        {/* Rotating Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100 overflow-hidden min-h-[60px]">
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
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-xs mb-0.5">{tip.title}</h4>
                    <p className="text-gray-600 text-xs">{tip.description}</p>
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
                  index === currentTip ? 'w-4 bg-blue-500' : 'w-1 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton Flight Cards - For Familiarity */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-5 w-20 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-1 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-5 w-20 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
