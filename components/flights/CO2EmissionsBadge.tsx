'use client';

import { Leaf, TreePine, Car, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CO2EmissionsBadgeProps {
  totalKg?: number;
  perPassenger?: number;
  comparison?: string;
  carbonClass?: 'low' | 'medium' | 'high';
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

/**
 * CO2 Emissions Badge Component
 *
 * Displays carbon footprint information for flights.
 * Helps eco-conscious travelers make informed decisions.
 *
 * Features:
 * - Color-coded emissions level (green/yellow/orange)
 * - Per-passenger breakdown
 * - Comparison metrics (car km, tree absorption)
 * - Compact and detailed modes
 */
export function CO2EmissionsBadge({
  totalKg,
  perPassenger,
  comparison,
  carbonClass = 'medium',
  compact = false,
  showDetails = false,
  className,
}: CO2EmissionsBadgeProps) {
  // If no data, show placeholder
  if (!totalKg && !perPassenger) {
    return null;
  }

  // Color mapping based on carbon class
  const colorClasses = {
    low: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      icon: 'text-green-500',
      badge: 'bg-green-100 text-green-700',
    },
    medium: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-500',
      badge: 'bg-amber-100 text-amber-700',
    },
    high: {
      bg: 'bg-orange-50 border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-500',
      badge: 'bg-orange-100 text-orange-700',
    },
  };

  const colors = colorClasses[carbonClass];

  // Calculate comparison metrics
  const carKm = totalKg ? Math.round(totalKg / 0.12) : 0; // Average car: 120g CO2/km
  const treeDays = totalKg ? Math.round(totalKg / 0.06) : 0; // Tree absorbs ~22kg/year

  // Label based on carbon class
  const carbonLabels = {
    low: 'Lower emissions',
    medium: 'Average emissions',
    high: 'Higher emissions',
  };

  // Compact mode - just a small badge
  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          colors.badge,
          className
        )}
        title={`${totalKg?.toFixed(0) || perPassenger?.toFixed(0)}kg CO2 - ${carbonLabels[carbonClass]}`}
      >
        <Leaf className="w-3 h-3" />
        <span>{perPassenger?.toFixed(0) || totalKg?.toFixed(0)}kg</span>
      </div>
    );
  }

  // Standard mode
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        colors.bg,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-full', colors.badge)}>
            <Leaf className={cn('w-4 h-4', colors.icon)} />
          </div>
          <div>
            <p className={cn('text-sm font-semibold', colors.text)}>
              Carbon Footprint
            </p>
            <p className="text-xs text-gray-500">
              {carbonLabels[carbonClass]}
            </p>
          </div>
        </div>

        {/* Main metric */}
        <div className="text-right">
          <p className={cn('text-lg font-bold', colors.text)}>
            {totalKg?.toFixed(0)}
            <span className="text-xs font-normal ml-0.5">kg CO2</span>
          </p>
          {perPassenger && (
            <p className="text-xs text-gray-500">
              {perPassenger.toFixed(0)}kg per person
            </p>
          )}
        </div>
      </div>

      {/* Details section */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {/* Comparison metrics */}
          <div className="grid grid-cols-2 gap-3">
            {/* Car equivalent */}
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {carKm.toLocaleString()} km
                </p>
                <p className="text-xs text-gray-500">
                  Car equivalent
                </p>
              </div>
            </div>

            {/* Tree absorption */}
            <div className="flex items-center gap-2">
              <TreePine className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {treeDays.toLocaleString()} days
                </p>
                <p className="text-xs text-gray-500">
                  Tree absorption
                </p>
              </div>
            </div>
          </div>

          {/* Custom comparison message */}
          {comparison && (
            <p className="mt-2 text-xs text-gray-600">
              {comparison}
            </p>
          )}

          {/* Offset suggestion for high emissions */}
          {carbonClass === 'high' && (
            <div className="mt-3 flex items-start gap-2 p-2 bg-orange-100 rounded">
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                Consider offsetting your carbon footprint through certified carbon offset programs.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * CO2 Emissions Inline Display
 * Minimal inline version for flight cards
 */
export function CO2EmissionsInline({
  totalKg,
  carbonClass = 'medium',
  className,
}: {
  totalKg?: number;
  carbonClass?: 'low' | 'medium' | 'high';
  className?: string;
}) {
  if (!totalKg) return null;

  const colorClasses = {
    low: 'text-green-600',
    medium: 'text-amber-600',
    high: 'text-orange-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs',
        colorClasses[carbonClass],
        className
      )}
      title={`This flight produces approximately ${totalKg.toFixed(0)}kg of CO2`}
    >
      <Leaf className="w-3 h-3" />
      <span>{totalKg.toFixed(0)}kg CO2</span>
    </span>
  );
}

export default CO2EmissionsBadge;
