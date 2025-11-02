'use client';

import { useState } from 'react';
import { Moon, MapPin, Check, Info, X, Plane } from 'lucide-react';
import { LayoverInfo } from '@/lib/utils/layoverDetector';

interface OvernightLayoverBadgeProps {
  layover: LayoverInfo;
  variant?: 'compact' | 'full';
}

/**
 * 🌙 OVERNIGHT LAYOVER BADGE
 *
 * Highlights extended/overnight layovers as "FREE STOPOVER VACATION" opportunities
 * Turns a negative (long layover) into a positive (explore a city for free!)
 */
export default function OvernightLayoverBadge({
  layover,
  variant = 'compact',
}: OvernightLayoverBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Color scheme based on layover type
  const badgeColors = {
    overnight: 'from-purple-500 to-indigo-600',
    extended: 'from-blue-500 to-cyan-600',
    short: 'from-gray-400 to-gray-500',
  };

  const badgeColor = badgeColors[layover.type];

  // Compact badge (for flight cards)
  if (variant === 'compact') {
    return (
      <div className="relative group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${badgeColor} text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105`}
        >
          <Moon className="w-4 h-4" />
          <span>{layover.durationFormatted} in {layover.airportCode}</span>
          <Info className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* Tooltip with details */}
        {showDetails && (
          <div className="absolute z-50 top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-fadeIn">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${badgeColor}`}>
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    Free Stopover in {layover.city}!
                  </h4>
                  <p className="text-xs text-gray-500">
                    {layover.durationFormatted} layover
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Savings */}
            <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-5 h-5" />
                <div>
                  <div className="font-bold">~{layover.perks.estimatedSavings}% cheaper</div>
                  <div className="text-xs">vs direct flights</div>
                </div>
              </div>
            </div>

            {/* Visa Info */}
            {layover.perks.needsVisa ? (
              <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-200 text-xs text-yellow-800">
                ⚠️ Visa may be required to leave airport
              </div>
            ) : (
              <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200 text-xs text-blue-800">
                ✓ Visa-free transit
                {layover.perks.visaFreeHours && (
                  <span> (up to {layover.perks.visaFreeHours}h)</span>
                )}
              </div>
            )}

            {/* City Highlights */}
            {layover.perks.cityHighlights.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Must-see attractions:
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {layover.perks.cityHighlights.slice(0, 3).map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Airport Hotel */}
            {layover.perks.airportHotelAvailable && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Check className="w-3 h-3 text-green-600" />
                Airport hotel available
              </div>
            )}

            {/* CTA */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 text-center">
                Turn your layover into an adventure!
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full display (for detailed flight view)
  return (
    <div className={`rounded-xl bg-gradient-to-r ${badgeColor} p-6 text-white shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-full">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Free Stopover Vacation!</h3>
            <p className="text-white/90 text-sm">
              Explore {layover.city} during your {layover.durationFormatted} layover
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">~{layover.perks.estimatedSavings}%</div>
          <div className="text-xs text-white/80">cheaper</div>
        </div>
      </div>

      {/* Perks Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-white/70 text-xs mb-1">Duration</div>
          <div className="font-bold">{layover.durationFormatted}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-white/70 text-xs mb-1">Visa</div>
          <div className="font-bold">
            {layover.perks.needsVisa ? 'May be required' : 'Not required'}
          </div>
        </div>
      </div>

      {/* City Highlights */}
      {layover.perks.cityHighlights.length > 0 && (
        <div className="bg-white/10 rounded-lg p-4">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            What to explore:
          </div>
          <ul className="space-y-1.5">
            {layover.perks.cityHighlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-white/90">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Airport Hotel */}
      {layover.perks.airportHotelAvailable && (
        <div className="mt-3 flex items-center gap-2 text-sm text-white/90">
          <Plane className="w-4 h-4" />
          <span>Airport hotel available for rest</span>
        </div>
      )}
    </div>
  );
}
