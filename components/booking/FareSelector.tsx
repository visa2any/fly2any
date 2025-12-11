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
    return <Briefcase className="w-3.5 h-3.5 text-info-500 flex-shrink-0" />;
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
    return <RefreshCw className="w-3.5 h-3.5 text-info-500 flex-shrink-0" />;
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
  positives?: string[]; // Positive policies like "Free changes", "Fully refundable"
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
        <div className="bg-info-50 border border-info-200 rounded-lg p-2 sm:p-2.5 flex items-center gap-2">
          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-info-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              This is the available fare for your flight
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
              ✈️ Some airlines offer a single fare type • All features included below
            </p>
          </div>
        </div>
      )}

      {/* ML Recommendation Banner - only show when multiple fares available */}
      {!isSingleFare && recommendedFare && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-2 sm:p-2.5 flex items-center gap-2">
          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              Recommended: <span className="text-primary-600">{recommendedFare.name}</span>
            </p>
            {recommendedFare.popularityPercent && (
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {recommendedFare.popularityPercent}% choose {recommendedFare.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Fare Cards Grid - Apple-class Ultra-Premium styling */}
      <div
        className={`grid gap-2 sm:gap-3 ${
          isSingleFare
            ? 'grid-cols-1 max-w-md mx-auto'
            : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        }`}
        role="radiogroup"
        aria-label="Select fare option"
      >
        {sortedFares.map((fare) => {
          const isSelected = selected === fare.id;
          const isRecommended = fare.recommended;

          // Detect cabin class for premium styling
          const isPremiumCabin = fare.name.toLowerCase().includes('business') ||
                                  fare.name.toLowerCase().includes('first') ||
                                  fare.name.toLowerCase().includes('premium economy');

          return (
            <button
              key={fare.id}
              onClick={() => handleSelect(fare.id)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${fare.name} fare, ${fare.currency} ${typeof fare.price === 'number' ? fare.price.toFixed(2) : fare.price}`}
              className={`
                relative p-2.5 sm:p-3.5 pt-5 sm:pt-6 rounded-xl sm:rounded-2xl text-left transition-all duration-300 active:scale-[0.98] flex flex-col
                ${isSelected
                  ? 'ring-2 ring-primary-500 shadow-lg'
                  : 'hover:shadow-md'
                }
                ${isRecommended ? 'ring-2 ring-secondary-400' : ''}
              `}
              style={{
                background: isSelected
                  ? 'linear-gradient(180deg, #FFFFFF 0%, #FEF6F5 100%)'
                  : isPremiumCabin
                    ? 'linear-gradient(180deg, #FFFBF5 0%, #FFF8F0 100%)'
                    : 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)',
                boxShadow: isSelected
                  ? '0 8px 24px -8px rgba(239,65,54,0.25), 0 4px 12px -4px rgba(0,0,0,0.1)'
                  : '0 4px 16px -6px rgba(0,0,0,0.1), 0 2px 6px -2px rgba(0,0,0,0.05)',
              }}
            >
              {/* Recommended Badge - Apple-class styling */}
              {isRecommended && (
                <div
                  className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 text-white text-[9px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full shadow-md whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #F9C900 0%, #E5B800 100%)',
                    boxShadow: '0 4px 12px -3px rgba(249,201,0,0.5)',
                  }}
                >
                  ⭐ BEST VALUE
                </div>
              )}

              {/* Premium Cabin Badge */}
              {isPremiumCabin && !isRecommended && (
                <div
                  className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 text-white text-[9px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full shadow-md whitespace-nowrap"
                  style={{
                    background: fare.name.includes('First')
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                      : fare.name.includes('Business')
                        ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                        : 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                    boxShadow: '0 4px 12px -3px rgba(0,0,0,0.25)',
                  }}
                >
                  {fare.name.includes('First') ? '👑 LUXURY' : fare.name.includes('Business') ? '✨ PREMIUM' : '🎯 UPGRADE'}
                </div>
              )}

              {/* Selected Checkmark */}
              {isSelected && (
                <div
                  className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #EF4136 0%, #DC3A30 100%)',
                    boxShadow: '0 4px 8px -2px rgba(239,65,54,0.4)',
                  }}
                >
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                </div>
              )}

              {/* Fare Name & Price - Fixed height for alignment */}
              <div className="mb-2 sm:mb-3 min-h-[52px] sm:min-h-[60px]">
                <h3
                  className="text-[11px] sm:text-sm font-bold text-[#1d1d1f] mb-1 leading-tight line-clamp-2"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  {fare.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-lg sm:text-2xl font-bold tracking-tight"
                    style={{
                      color: '#1d1d1f',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    ${typeof fare.price === 'number' ? fare.price.toLocaleString() : fare.price}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-[#86868b] font-medium">total</span>
                </div>
              </div>

              {/* Features List - Flex-grow for consistent card height */}
              <ul className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3 flex-grow">
                {fare.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#424245] leading-tight">
                    <span className="flex-shrink-0 mt-0.5">{getFeatureIcon(feature)}</span>
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Policies Section - Full display with Apple-class styling */}
              <div className="pt-2 sm:pt-2.5 mt-2 sm:mt-2.5 border-t border-neutral-100 space-y-1 sm:space-y-1.5">
                {/* Positive policies (green) - show ALL */}
                {fare.positives && fare.positives.map((positive, idx) => (
                  <div key={`pos-${idx}`} className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                    <div className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-green-500" />
                    </div>
                    <span className="text-green-600 font-semibold">{positive}</span>
                  </div>
                ))}

                {/* Restrictions (red) - show ALL */}
                {fare.restrictions && fare.restrictions.map((restriction, idx) => (
                  <div key={`neg-${idx}`} className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                    <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <X className="w-2.5 h-2.5 text-red-400" />
                    </div>
                    <span className="text-red-500 font-medium">{restriction}</span>
                  </div>
                ))}

                {/* Fallback when no policies */}
                {(!fare.positives || fare.positives.length === 0) && (!fare.restrictions || fare.restrictions.length === 0) && (
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                    <div className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-green-500" />
                    </div>
                    <span className="text-green-600 font-semibold">Standard flexibility</span>
                  </div>
                )}
              </div>

              {/* Popularity indicator for non-recommended fares */}
              {fare.popularityPercent && !isRecommended && (
                <div className="mt-2 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-[#86868b]">
                    <Users className="w-3 h-3" />
                    <span>{fare.popularityPercent}% choose this fare</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Trust Signal - Apple-class styling */}
      <div className="mt-4 pt-3 border-t border-neutral-100">
        <p
          className="text-[11px] sm:text-xs text-[#86868b] text-center font-medium"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          💡 All fares include 24-hour free cancellation • Prices locked for 10 minutes
        </p>
        <p className="text-[10px] sm:text-[11px] text-[#86868b]/70 text-center mt-1">
          Prices shown are total per person including all taxes and fees
        </p>
      </div>
    </div>
  );
}
