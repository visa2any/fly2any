'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  Check,
  TrendingUp,
  Users,
  X,
  AlertCircle,
  Briefcase,
  Luggage,
  Armchair,
  Crown,
  Sparkles,
  RefreshCw,
  BadgeDollarSign,
  Plane,
  Coffee,
  Wine,
  Clock,
  Shield,
  Utensils,
  Wifi,
  ChefHat
} from 'lucide-react';
import { colors, spacing, typography, dimensions } from '@/lib/design-system';

/**
 * Get the appropriate icon for a feature based on its text content
 * Icons sized at w-3.5 h-3.5 for better visibility
 */
function getFeatureIcon(feature: string): ReactNode {
  const featureLower = feature.toLowerCase();

  // Baggage related
  if (featureLower.includes('carry-on') || featureLower.includes('cabin')) {
    return <Briefcase className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />;
  }
  if (featureLower.includes('checked') || featureLower.includes('bag')) {
    return <Luggage className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />;
  }

  // Seat related
  if (featureLower.includes('business class') || featureLower.includes('business seat')) {
    return <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />;
  }
  if (featureLower.includes('first class') || featureLower.includes('suite')) {
    return <Sparkles className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />;
  }
  if (featureLower.includes('premium economy') || featureLower.includes('extra legroom')) {
    return <Armchair className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />;
  }
  if (featureLower.includes('economy seat') || featureLower.includes('seat')) {
    return <Armchair className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />;
  }

  // Flexibility related
  if (featureLower.includes('refund') || featureLower.includes('cancel')) {
    return <BadgeDollarSign className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />;
  }
  if (featureLower.includes('change') || featureLower.includes('flexible')) {
    return <RefreshCw className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />;
  }

  // Priority/Premium benefits
  if (featureLower.includes('priority')) {
    return <Plane className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />;
  }
  if (featureLower.includes('lounge')) {
    return <Coffee className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />;
  }

  // Food & Drinks
  if (featureLower.includes('meal') || featureLower.includes('food') || featureLower.includes('gourmet')) {
    return <Utensils className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />;
  }
  if (featureLower.includes('champagne') || featureLower.includes('drink') || featureLower.includes('premium')) {
    return <Wine className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />;
  }

  // Other
  if (featureLower.includes('wifi')) {
    return <Wifi className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />;
  }

  // Default check icon
  return <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />;
}

interface FareOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  restrictions?: string[];
  recommended?: boolean;
  popularityPercent?: number;
  originalOffer?: any; // For Duffel fare variants - contains the full offer for booking
}

interface FareSelectorProps {
  fares: FareOption[];
  selectedFareId?: string;
  onSelect: (fareId: string) => void;
  mlRecommendation?: string;
  tripType?: 'business' | 'leisure' | 'family' | 'budget';
}

/**
 * Get cabin class priority for sorting (lower = higher priority)
 * Order: Economy → Premium Economy → Business → First Class
 */
function getCabinPriority(fareName: string): number {
  const nameLower = fareName.toLowerCase();
  if (nameLower.includes('first')) return 4;
  if (nameLower.includes('business')) return 3;
  if (nameLower.includes('premium economy') || nameLower.includes('premium eco')) return 2;
  return 1; // Economy
}

/**
 * Sort fares by cabin hierarchy then by price within each cabin
 */
function sortFaresByHierarchy(fares: FareOption[]): FareOption[] {
  return [...fares].sort((a, b) => {
    const priorityA = getCabinPriority(a.name);
    const priorityB = getCabinPriority(b.name);

    // First sort by cabin class priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same cabin, sort by price
    return a.price - b.price;
  });
}

export function FareSelector({
  fares,
  selectedFareId,
  onSelect,
  mlRecommendation,
  tripType = 'leisure',
}: FareSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedFareId || fares[0]?.id || '');

  useEffect(() => {
    if (selectedFareId) {
      setSelected(selectedFareId);
    }
  }, [selectedFareId]);

  const handleSelect = (fareId: string) => {
    setSelected(fareId);
    onSelect(fareId);
  };

  // Sort fares by cabin hierarchy: Economy → Premium Economy → Business → First
  const sortedFares = sortFaresByHierarchy(fares);

  // Find ML recommended fare
  const recommendedFare = sortedFares.find(f => f.recommended) || sortedFares[1]; // Default to standard (index 1)

  // Handle empty fares array
  if (!fares || fares.length === 0) {
    return (
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 text-center">
        <p className="text-sm font-semibold text-warning-900 mb-1">No Fare Options Available</p>
        <p className="text-xs text-warning-700">
          We're unable to load fare options for this flight. Please proceed with the standard fare, or try searching again.
        </p>
      </div>
    );
  }

  // Handle single fare option - show informative message
  const isSingleFare = fares.length === 1;

  return (
    <div className="space-y-2">
      {/* Single Fare Info Banner */}
      {isSingleFare && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              This is the available fare for your flight
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              ✈️ Some airlines offer a single fare type • All features included below
            </p>
          </div>
        </div>
      )}

      {/* ML Recommendation Banner - only show when multiple fares available */}
      {!isSingleFare && recommendedFare && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-2.5 flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Based on your trip, we recommend: <span className="text-primary-600">{recommendedFare.name}</span>
            </p>
            {recommendedFare.popularityPercent && (
              <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {recommendedFare.popularityPercent}% of travelers on this route choose {recommendedFare.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Fare Cards Grid - sorted by cabin hierarchy */}
      <div
        className={`grid gap-2.5 ${
          isSingleFare
            ? 'grid-cols-1 max-w-sm'
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        }`}
        role="radiogroup"
        aria-label="Select fare option"
      >
        {sortedFares.map((fare) => {
          const isSelected = selected === fare.id;
          const isRecommended = fare.recommended;

          return (
            <button
              key={fare.id}
              onClick={() => handleSelect(fare.id)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${fare.name} fare, ${fare.currency} ${typeof fare.price === 'number' ? fare.price.toFixed(2) : fare.price}`}
              className={`
                relative p-2.5 rounded-lg border-2 text-left transition-all duration-200 transform hover:-translate-y-0.5
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                }
                ${isRecommended ? 'ring-2 ring-primary-200 ring-offset-1' : ''}
              `}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                  <span>⭐</span> BEST
                </div>
              )}

              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Fare Name & Price */}
              <div className="mb-2 mt-1">
                <h3 className="text-sm font-bold text-gray-900 mb-0.5 truncate">{fare.name}</h3>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold text-gray-900">
                    {fare.currency} {typeof fare.price === 'number' ? fare.price.toFixed(0) : fare.price}
                  </span>
                  {fare.popularityPercent && fare.popularityPercent > 50 && (
                    <span className="text-[10px] text-primary-600 font-medium">★</span>
                  )}
                </div>
              </div>

              {/* Features List - improved readability with dynamic icons */}
              <ul className="space-y-1 mb-1.5">
                {fare.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                    {getFeatureIcon(feature)}
                    <span className="truncate">{feature}</span>
                  </li>
                ))}
                {fare.features.length > 3 && (
                  <li className="text-[10px] text-gray-400 pl-5">+{fare.features.length - 3} more</li>
                )}
              </ul>

              {/* Restrictions (if any) - clear policy display */}
              {fare.restrictions && fare.restrictions.length > 0 && (
                <div className="pt-1.5 mt-1.5 border-t border-gray-100">
                  <div className="space-y-0.5">
                    {fare.restrictions.slice(0, 2).map((restriction, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[10px]">
                        <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span className="text-red-500 font-medium">{restriction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show positive flexibility for fares without restrictions */}
              {(!fare.restrictions || fare.restrictions.length === 0) && (
                <div className="pt-1.5 mt-1.5 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-[10px]">
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="text-green-600 font-medium">Flexible booking</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Trust Signal */}
      <p className="text-xs text-gray-500 text-center mt-2">
        💡 All fares include 24-hour free cancellation • Prices locked for 10 minutes
      </p>
    </div>
  );
}
