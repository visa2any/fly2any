'use client';

import { Leaf } from 'lucide-react';

interface CO2BadgeProps {
  emissions?: number; // kg of CO2 - REAL data from Amadeus API
  averageEmissions?: number; // REAL average for this route
  compact?: boolean;
  isEstimated?: boolean; // Flag to indicate if data is estimated vs real
}

export default function CO2Badge({ emissions, averageEmissions, compact = false, isEstimated = false }: CO2BadgeProps) {
  // ONLY show badge if we have REAL emissions data
  if (!emissions) {
    return null;
  }

  // ONLY calculate comparison if we have REAL average data
  const avg = averageEmissions;
  const percentDiff = avg ? Math.round(((avg - emissions) / avg) * 100) : 0;
  const isLowerThanAverage = avg ? emissions < avg : false;

  let badgeColor = 'bg-gray-100 text-gray-600';
  let label = isEstimated ? '~' + emissions.toFixed(0) + 'kg CO₂' : emissions.toFixed(0) + 'kg CO₂';

  // ONLY show comparison if we have REAL average data
  if (avg && percentDiff >= 20) {
    badgeColor = 'bg-green-100 text-green-700 border-green-300';
    label = `${percentDiff}% less CO₂`;
  } else if (avg && percentDiff >= 10) {
    badgeColor = 'bg-green-50 text-green-600 border-green-200';
    label = `${percentDiff}% less CO₂`;
  } else if (avg && percentDiff < 0 && Math.abs(percentDiff) >= 10) {
    badgeColor = 'bg-orange-50 text-orange-600 border-orange-200';
    label = 'Higher emissions';
  }

  if (compact) {
    let compactBgColor = 'bg-gray-50/50 text-gray-600';
    if (avg && percentDiff >= 10) {
      compactBgColor = 'bg-green-50/50 text-green-600';
    } else if (avg && percentDiff < 0 && Math.abs(percentDiff) >= 10) {
      compactBgColor = 'bg-orange-50/50 text-orange-600';
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 rounded-full text-xs font-semibold border h-5 leading-none ${compactBgColor} ${
          avg && percentDiff >= 10 ? 'border-green-200' :
          avg && percentDiff < 0 && Math.abs(percentDiff) >= 10 ? 'border-orange-200' :
          'border-gray-200'
        }`}
        title={isEstimated ? 'Estimated emissions - Real data from Amadeus API when available' : 'Real emissions data from Amadeus API'}
      >
        <Leaf className="h-3 w-3" />
        <span className="leading-none">{label}</span>
        {isEstimated && <span className="text-[9px] opacity-70 leading-none">est.</span>}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}
      title={isEstimated ? 'Estimated emissions - Real data from Amadeus API when available' : 'Real emissions data from Amadeus API'}
    >
      <Leaf className="h-3.5 w-3.5" />
      <span>{label}</span>
      {isEstimated && <span className="text-[9px] opacity-70 ml-1">(est.)</span>}
    </div>
  );
}
