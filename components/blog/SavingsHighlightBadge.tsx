'use client';

interface SavingsHighlightBadgeProps {
  originalPrice: number;
  discountedPrice: number;
  emphasize?: boolean; // Extra animations
}

export default function SavingsHighlightBadge({
  originalPrice,
  discountedPrice,
  emphasize = false
}: SavingsHighlightBadgeProps) {
  const savingsAmount = originalPrice - discountedPrice;
  const savingsPercentage = Math.round((savingsAmount / originalPrice) * 100);
  const isAmazingDeal = savingsPercentage >= 50;

  return (
    <div className="space-y-3">
      {/* Main savings display */}
      <div className={`relative bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl px-6 py-4 shadow-xl ${emphasize ? 'animate-pulse-glow' : ''}`}>
        {/* Shimmer effect */}
        {emphasize && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
        )}

        <div className="relative z-10">
          {/* Savings amount */}
          <div className="text-center mb-2">
            <div className="text-sm font-semibold uppercase tracking-wide mb-1 opacity-90">
              You Save
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl md:text-5xl font-bold">
                ${savingsAmount}
              </span>
              <div className={`bg-white text-green-600 rounded-full px-4 py-2 font-bold text-xl ${emphasize ? 'animate-bounce-gentle' : ''}`}>
                {savingsPercentage}%
              </div>
            </div>
          </div>

          {/* Price comparison */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-green-400/30">
            <div className="text-center">
              <div className="text-xs opacity-75 mb-1">Was</div>
              <div className="text-lg line-through opacity-90">
                ${originalPrice}
              </div>
            </div>
            <div className="text-2xl">→</div>
            <div className="text-center">
              <div className="text-xs opacity-75 mb-1">Now</div>
              <div className="text-2xl md:text-3xl font-bold">
                ${discountedPrice}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amazing deal badge */}
      {isAmazingDeal && (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-center shadow-lg animate-gradient-shift">
          <div className="flex items-center justify-center gap-2 font-bold">
            <span className="text-xl animate-wiggle">🎉</span>
            <span className="text-lg uppercase tracking-wide">AMAZING DEAL</span>
            <span className="text-xl animate-wiggle">🎉</span>
          </div>
        </div>
      )}

      {/* Additional savings info */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">Total Savings:</span>
          <span className="text-green-600 font-bold text-lg">${savingsAmount}</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          That's {savingsPercentage}% off the regular price - don't miss out!
        </p>
      </div>
    </div>
  );
}
