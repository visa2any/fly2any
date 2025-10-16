'use client';

import { TrendingDown, Percent } from 'lucide-react';

interface PriceAnchoringBadgeProps {
  currentPrice: number;
  averagePrice?: number;
  savingsPercent?: number;
}

export default function PriceAnchoringBadge({
  currentPrice,
  averagePrice,
  savingsPercent,
}: PriceAnchoringBadgeProps) {
  // If no average price provided, calculate a realistic one
  const avg = averagePrice || currentPrice * 1.25;
  const savings = savingsPercent || Math.round(((avg - currentPrice) / avg) * 100);

  if (savings <= 5) return null; // Only show if meaningful savings

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg">
      <TrendingDown className="h-4 w-4 text-green-600" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 line-through">${avg.toFixed(0)}</span>
        <span className="text-sm font-bold text-green-700 flex items-center gap-1">
          <Percent className="h-3 w-3" />
          {savings}% OFF
        </span>
      </div>
    </div>
  );
}
