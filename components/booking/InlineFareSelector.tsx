'use client';

import { useState } from 'react';
import { Check, TrendingUp, Sparkles } from 'lucide-react';
import { FareOption } from '@/types/booking-flow';

interface InlineFareSelectorProps {
  fares: FareOption[];
  selectedFareId?: string;
  onSelect: (fareId: string) => void;
  compact?: boolean;
}

/**
 * Inline Fare Selector - Optimized for Chat Interface
 *
 * Shows Basic/Standard/Premium fares in a visual comparison
 * Designed to fit inline in chat messages
 */
export function InlineFareSelector({
  fares,
  selectedFareId,
  onSelect,
  compact = false,
}: InlineFareSelectorProps) {
  const [selected, setSelected] = useState(selectedFareId || fares[0]?.id);

  const handleSelect = (fareId: string) => {
    setSelected(fareId);
    onSelect(fareId);
  };

  // Find recommended fare
  const recommendedFare = fares.find(f => f.recommended);

  if (fares.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-600">No fare options available</p>
      </div>
    );
  }

  if (compact) {
    // Compact vertical layout for mobile/narrow chat
    return (
      <div className="space-y-2 max-w-xs">
        {fares.map((fare) => {
          const isSelected = selected === fare.id;
          const isRecommended = fare.id === recommendedFare?.id;

          return (
            <button
              key={fare.id}
              onClick={() => handleSelect(fare.id)}
              className={`
                w-full p-2.5 rounded-lg border-2 text-left transition-all
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-primary-300'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900">{fare.name}</span>
                  {isRecommended && (
                    <Sparkles className="w-3 h-3 text-primary-600" />
                  )}
                </div>
                <span className="text-sm font-bold text-primary-600">
                  ${fare.price}
                </span>
              </div>
              <div className="text-[10px] text-gray-600 space-y-0.5">
                {fare.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Check className="w-2.5 h-2.5 text-green-600 flex-shrink-0" />
                    <span className="line-clamp-1">{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Standard horizontal layout for larger screens
  return (
    <div className="space-y-2">
      {/* Recommendation Banner */}
      {recommendedFare && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-2 flex items-center gap-2">
          <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <p className="text-[10px] font-semibold text-gray-900">
            We recommend <span className="text-primary-600">{recommendedFare.name}</span>
            {recommendedFare.popularityPercent && (
              <span className="text-gray-600 ml-1">
                ({recommendedFare.popularityPercent}% choose this)
              </span>
            )}
          </p>
        </div>
      )}

      {/* Fare Options Grid */}
      <div className="grid grid-cols-3 gap-2">
        {fares.map((fare) => {
          const isSelected = selected === fare.id;
          const isRecommended = fare.id === recommendedFare?.id;

          return (
            <button
              key={fare.id}
              onClick={() => handleSelect(fare.id)}
              className={`
                relative p-2.5 rounded-lg border-2 text-left transition-all hover:shadow-md
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-sm scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-primary-300'
                }
                ${isRecommended ? 'ring-2 ring-primary-200' : ''}
              `}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Sparkles className="w-2 h-2" />
                  <span>Best</span>
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Fare Header */}
              <div className="mb-2">
                <h4 className="text-xs font-bold text-gray-900 mb-0.5">{fare.name}</h4>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold text-primary-600">${fare.price}</span>
                  <span className="text-[9px] text-gray-500">{fare.currency}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1">
                {fare.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <Check className="w-2.5 h-2.5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-[9px] text-gray-700 line-clamp-1">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Restrictions (if any) */}
              {fare.restrictions && fare.restrictions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-[8px] text-gray-500 line-clamp-1">
                    {fare.restrictions[0]}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Note */}
      <p className="text-[9px] text-gray-500 text-center px-2">
        All fares include taxes and fees. You can change your fare class before payment.
      </p>
    </div>
  );
}

/**
 * Fare Comparison Table - Alternative layout
 */
export function FareComparisonTable({
  fares,
  onSelect,
}: {
  fares: FareOption[];
  onSelect: (fareId: string) => void;
}) {
  const [selected, setSelected] = useState(fares[0]?.id);

  const handleSelect = (fareId: string) => {
    setSelected(fareId);
    onSelect(fareId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-2 text-gray-600 font-semibold text-[10px]">Feature</th>
            {fares.map(fare => (
              <th key={fare.id} className="p-2 text-center">
                <div className="font-bold text-gray-900">{fare.name}</div>
                <div className="text-sm font-bold text-primary-600">${fare.price}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Features comparison would go here */}
          <tr>
            <td colSpan={fares.length + 1} className="p-2">
              <div className="flex gap-2">
                {fares.map(fare => (
                  <button
                    key={fare.id}
                    onClick={() => handleSelect(fare.id)}
                    className={`
                      flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all
                      ${selected === fare.id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    Select {fare.name}
                  </button>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
