'use client';

import { useState, useEffect } from 'react';
import { Check, TrendingUp, Users } from 'lucide-react';
import { colors, spacing, typography, dimensions } from '@/lib/design-system';

interface FareOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  restrictions?: string[];
  recommended?: boolean;
  popularityPercent?: number;
}

interface FareSelectorProps {
  fares: FareOption[];
  selectedFareId?: string;
  onSelect: (fareId: string) => void;
  mlRecommendation?: string;
  tripType?: 'business' | 'leisure' | 'family' | 'budget';
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

  // Find ML recommended fare
  const recommendedFare = fares.find(f => f.recommended) || fares[1]; // Default to standard (index 1)

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

      {/* Fare Cards Grid - adjust columns based on fare count */}
      <div
        className={`grid gap-2 ${
          isSingleFare
            ? 'grid-cols-1 max-w-md'
            : fares.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : fares.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}
        role="radiogroup"
        aria-label="Select fare option"
      >
        {fares.map((fare) => {
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
                relative p-3 rounded-lg border-2 text-left transition-all duration-300 transform hover:-translate-y-1
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                }
                ${isRecommended ? 'ring-2 ring-primary-200 ring-offset-2' : ''}
              `}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <span>⭐</span> RECOMMENDED
                </div>
              )}

              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Fare Name & Price */}
              <div className="mb-2 mt-1.5">
                <h3 className="text-sm font-bold text-gray-900 mb-0.5">{fare.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {fare.currency} {typeof fare.price === 'number' ? fare.price.toFixed(2) : fare.price}
                  </span>
                  {fare.popularityPercent && fare.popularityPercent > 50 && (
                    <span className="text-xs text-primary-600 font-medium">POPULAR</span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-1 mb-1.5">
                {fare.features.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <Check className="w-3.5 h-3.5 text-success-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Restrictions (if any) */}
              {fare.restrictions && fare.restrictions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">{fare.restrictions[0]}</p>
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
