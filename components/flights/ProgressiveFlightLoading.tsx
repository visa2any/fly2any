'use client';

import { useState, useEffect } from 'react';
import { Plane, Search, CheckCircle2, TrendingDown, Clock, Shield, Sparkles } from 'lucide-react';

interface ProgressiveFlightLoadingProps {
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
    description: "We search 500+ airlines to find you the lowest fares"
  },
  {
    icon: <Clock className="w-4 h-4 text-blue-600" />,
    title: "Real-Time Results",
    description: "Live pricing updated every second for accuracy"
  },
  {
    icon: <Shield className="w-4 h-4 text-purple-600" />,
    title: "Secure Booking",
    description: "Your payment information is always protected"
  },
  {
    icon: <Sparkles className="w-4 h-4 text-yellow-600" />,
    title: "Smart Recommendations",
    description: "AI-powered suggestions for the best flight deals"
  }
];

export default function ProgressiveFlightLoading({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  children,
  infants,
  cabinClass,
  isMultiCity = false
}: ProgressiveFlightLoadingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  const stages: LoadingStage[] = [
    {
      id: 1,
      label: "Searching flight databases",
      icon: <Search className="w-4 h-4" />,
      status: currentStage >= 0 ? (currentStage > 0 ? 'complete' : 'active') : 'pending'
    },
    {
      id: 2,
      label: "Comparing 500+ airlines",
      icon: <Plane className="w-4 h-4" />,
      status: currentStage >= 1 ? (currentStage > 1 ? 'complete' : 'active') : 'pending'
    },
    {
      id: 3,
      label: "Analyzing prices & routes",
      icon: <TrendingDown className="w-4 h-4" />,
      status: currentStage >= 2 ? (currentStage > 2 ? 'complete' : 'active') : 'pending'
    },
    {
      id: 4,
      label: "Ranking best deals",
      icon: <Sparkles className="w-4 h-4" />,
      status: currentStage >= 3 ? (currentStage > 3 ? 'complete' : 'active') : 'pending'
    }
  ];

  // Progress through stages
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1200); // Change stage every 1.2 seconds

    return () => clearInterval(stageInterval);
  }, []);

  // Rotate tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % searchTips.length);
    }, 3000); // Change tip every 3 seconds

    return () => clearInterval(tipInterval);
  }, []);

  const totalPassengers = adults + children + infants;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const cabinClassLabels: { [key: string]: string } = {
    economy: 'Economy',
    premium: 'Premium Economy',
    business: 'Business',
    first: 'First Class'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-16">
        {/* Main Loading Card - Compact */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 p-5 mb-4">
          {/* Header with animated plane - Compact */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-12 h-12 flex-shrink-0">
              {/* Animated circles */}
              <div className="absolute inset-0 border-2 border-blue-200 rounded-full opacity-20"></div>
              <div className="absolute inset-0 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">
                Finding Your Perfect Flight
              </h2>
              <p className="text-sm text-gray-600">
                {isMultiCity ? 'Multi-city routes' : `${origin} → ${destination}`}
              </p>
            </div>
          </div>

          {/* Search Summary - Compact */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4 border border-blue-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-gray-500 font-medium mb-0.5">Route</div>
                <div className="text-gray-900 font-semibold">{origin} → {destination}</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium mb-0.5">Departure</div>
                <div className="text-gray-900 font-semibold">{formatDate(departureDate)}</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium mb-0.5">Travelers</div>
                <div className="text-gray-900 font-semibold">{totalPassengers} pax</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium mb-0.5">Class</div>
                <div className="text-gray-900 font-semibold text-xs">{cabinClassLabels[cabinClass] || cabinClass}</div>
              </div>
            </div>
          </div>

          {/* Progress Stages - Compact */}
          <div className="space-y-2 mb-4">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-500 ${
                  stage.status === 'active'
                    ? 'bg-blue-50 border border-blue-300'
                    : stage.status === 'complete'
                    ? 'bg-green-50 border border-green-300'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                    stage.status === 'active'
                      ? 'bg-blue-500 text-white animate-pulse'
                      : stage.status === 'complete'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {stage.status === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4">{stage.icon}</div>
                  )}
                </div>

                <div className="flex-1">
                  <div
                    className={`text-sm font-medium transition-colors duration-500 ${
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

                {stage.status === 'active' && (
                  <div className="flex-shrink-0">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar - Compact */}
          <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>

          <div className="text-center mt-2 text-xs font-medium text-gray-600">
            {Math.round(((currentStage + 1) / stages.length) * 100)}% Complete
          </div>
        </div>

        {/* Rotating Tips Card - Compact */}
        <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-md border border-gray-200 p-4 overflow-hidden">
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
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{tip.title}</h3>
                    <p className="text-gray-600 text-xs">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tip indicator dots - Compact */}
          <div className="flex justify-center gap-1.5 mt-3">
            {searchTips.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentTip ? 'w-6 bg-blue-500' : 'w-1 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Fun fact section - Compact */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            💡 Analyzing 50M+ flight combinations to find your best deal
          </p>
        </div>
      </div>
    </div>
  );
}
