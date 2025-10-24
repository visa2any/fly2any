'use client';

import { useState } from 'react';

interface BaggageTooltipProps {
  type: 'personal' | 'carry-on' | 'checked';
  children: React.ReactNode;
  weight?: string; // e.g., "22 lbs (10 kg)"
  airline?: string; // For airline-specific rules
  fareClass?: string; // For fare class warnings
}

export default function BaggageTooltip({
  type,
  children,
  weight,
  airline,
  fareClass
}: BaggageTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Budget airlines that charge for carry-ons
  const budgetAirlines = ['F9', 'NK', 'G4', 'WN']; // Frontier, Spirit, Allegiant, Southwest
  const isBudgetCarrier = airline && budgetAirlines.includes(airline);

  // Basic Economy restrictions
  const isBasicEconomy = fareClass?.includes('BASIC') || fareClass?.includes('LIGHT') || fareClass?.includes('SAVER');

  const getTooltipContent = () => {
    switch (type) {
      case 'personal':
        return {
          icon: '👜',
          title: 'Personal Item',
          subtitle: 'Always Free - Fits Under Seat',
          dimensions: '18×14×8 in (45×35×20 cm)',
          weight: 'No weight limit',
          examples: 'Purse, laptop bag, small backpack, briefcase',
          restriction: 'Must fit under the seat in front of you',
          tip: '💡 This is separate from your carry-on allowance',
          warning: null,
        };

      case 'carry-on':
        return {
          icon: '🧳',
          title: 'Carry-On Bag',
          subtitle: 'Overhead Bin Storage',
          dimensions: '22×14×9 in (56×36×23 cm)',
          weight: weight || '22 lbs (10 kg) typical',
          examples: 'Rolling suitcase, large backpack, duffel bag',
          restriction: 'Must fit in overhead bin',
          tip: isBudgetCarrier
            ? null
            : isBasicEconomy
            ? null
            : '💡 Includes wheels, handles, and pockets',
          warning: isBudgetCarrier
            ? '⚠️ This airline charges for carry-on bags ($35-$60)'
            : isBasicEconomy
            ? '⚠️ May not be included with Basic Economy fares'
            : '⚠️ May be gate-checked if overhead bins are full',
        };

      case 'checked':
        return {
          icon: '🧳',
          title: 'Checked Baggage',
          subtitle: 'Standard Allowance',
          dimensions: '62 linear inches (158 cm)',
          dimensionsDetail: 'Length + Width + Height combined',
          weight: weight || '50 lbs (23 kg) standard',
          examples: 'Large suitcase (typical: 27×21×14 in)',
          restriction: 'Additional fees for overweight bags',
          tip: '💡 Premium cabins often allow 70 lbs (32 kg)',
          warning: '⚠️ Fees apply if over 50 lbs or 62 linear inches',
        };

      default:
        return null;
    }
  };

  const content = getTooltipContent();
  if (!content) return <>{children}</>;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none"
          style={{
            animation: 'fadeInTooltip 200ms ease-out',
          }}
        >
          {/* Tooltip content - WHITE BACKGROUND matching flight cards - ULTRA COMPACT */}
          <div
            className="bg-white rounded-lg border-2 border-blue-200 shadow-lg p-2.5"
            style={{
              width: '250px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Header - Blue accent like flight cards - COMPACT */}
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-blue-100">
              <span className="text-lg leading-none">{content.icon}</span>
              <div className="flex-1">
                <div className="text-[11px] font-bold leading-none text-gray-900">{content.title}</div>
                <div className="text-[9px] text-blue-600 font-medium mt-0.5 leading-none">{content.subtitle}</div>
              </div>
            </div>

            {/* Dimensions & Weight - COMPACT INLINE */}
            <div className="mb-1.5 bg-blue-50 rounded p-1.5 border border-blue-100">
              <div className="text-[8px] text-blue-700 font-semibold uppercase tracking-wide mb-0.5">Dimensions</div>
              <div className="text-[10px] font-bold text-gray-900 leading-tight">{content.dimensions}</div>
              {content.dimensionsDetail && (
                <div className="text-[8px] text-gray-600 leading-tight">{content.dimensionsDetail}</div>
              )}
            </div>

            <div className="mb-1.5 bg-green-50 rounded p-1.5 border border-green-100">
              <div className="text-[8px] text-green-700 font-semibold uppercase tracking-wide mb-0.5">Weight</div>
              <div className="text-[10px] font-bold text-gray-900 leading-tight">{content.weight}</div>
            </div>

            {/* Examples - COMPACT */}
            <div className="mb-1.5">
              <div className="text-[8px] text-gray-500 uppercase tracking-wide mb-0.5 font-semibold">Examples</div>
              <div className="text-[9px] text-gray-700 leading-tight">{content.examples}</div>
            </div>

            {/* Tip - COMPACT */}
            {content.tip && (
              <div className="mb-1 bg-amber-50 rounded px-1.5 py-1 border border-amber-200">
                <div className="text-[9px] text-amber-800 leading-tight font-medium">{content.tip}</div>
              </div>
            )}

            {/* Warning - COMPACT */}
            {content.warning && (
              <div className="bg-orange-50 rounded px-1.5 py-1 border border-orange-200">
                <div className="text-[9px] text-orange-800 leading-tight font-medium">{content.warning}</div>
              </div>
            )}
          </div>

          {/* Tooltip arrow - WHITE to match */}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #93c5fd', // blue-200
              filter: 'drop-shadow(0 2px 1px rgba(0, 0, 0, 0.05))'
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInTooltip {
          from {
            opacity: 0;
            transform: translate(-50%, 4px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
