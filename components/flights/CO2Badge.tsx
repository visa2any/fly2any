'use client';

import { Leaf } from 'lucide-react';

interface CO2BadgeProps {
  emissions: number; // kg of CO2
  averageEmissions?: number;
  compact?: boolean;
}

export default function CO2Badge({ emissions, averageEmissions, compact = false }: CO2BadgeProps) {
  const avg = averageEmissions || emissions * 1.15;
  const percentDiff = Math.round(((avg - emissions) / avg) * 100);
  const isLowerThanAverage = emissions < avg;

  let badgeColor = 'bg-gray-100 text-gray-600';
  let label = 'Standard emissions';

  if (percentDiff >= 20) {
    badgeColor = 'bg-green-100 text-green-700 border-green-300';
    label = `${percentDiff}% less CO₂`;
  } else if (percentDiff >= 10) {
    badgeColor = 'bg-green-50 text-green-600 border-green-200';
    label = `${percentDiff}% less CO₂`;
  } else if (percentDiff < 0 && Math.abs(percentDiff) >= 10) {
    badgeColor = 'bg-orange-50 text-orange-600 border-orange-200';
    label = 'Higher emissions';
  }

  if (compact) {
    let compactColor = 'text-gray-600';
    if (percentDiff >= 10) {
      compactColor = 'text-green-600';
    } else if (percentDiff < 0 && Math.abs(percentDiff) >= 10) {
      compactColor = 'text-orange-600';
    }

    return (
      <span className={`inline-flex items-center gap-1 text-xs ${compactColor}`}>
        <Leaf className="h-3 w-3" />
        <span className="font-medium">{label}</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
      <Leaf className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className="text-xs opacity-75">({emissions.toFixed(0)}kg)</span>
    </div>
  );
}
