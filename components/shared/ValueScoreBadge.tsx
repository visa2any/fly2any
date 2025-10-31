'use client';

/**
 * ValueScoreBadge - Unified ML/AI Value Score Badge
 * Used across all service types (flights, hotels, cars, tours)
 * Shows intelligent scoring based on price, quality, demand, and availability
 */

interface ValueScoreBadgeProps {
  score: number; // 0-100 scale
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ValueScoreBadge({
  score,
  size = 'md',
  showLabel = true,
  className = ''
}: ValueScoreBadgeProps) {
  // Determine value level and styling - SOFTER COLORS for eye comfort
  const getValueLevel = (score: number) => {
    if (score >= 85) return {
      label: 'Excellent Value',
      emoji: '💎',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-400'
    };
    if (score >= 70) return {
      label: 'Great Value',
      emoji: '🌟',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      dotColor: 'bg-blue-400'
    };
    if (score >= 50) return {
      label: 'Good Value',
      emoji: '👍',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-400'
    };
    return {
      label: 'Fair Value',
      emoji: '✓',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-600',
      dotColor: 'bg-gray-400'
    };
  };

  const valueLevel = getValueLevel(score);

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };

  return (
    <div
      className={`
        inline-flex items-center
        ${sizeClasses[size]}
        ${valueLevel.bgColor}
        ${valueLevel.borderColor}
        ${valueLevel.textColor}
        border-2 rounded-md font-semibold
        ${className}
      `}
    >
      {/* Animated pulse dot */}
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${valueLevel.dotColor} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${valueLevel.dotColor}`}></span>
      </span>

      {/* Emoji */}
      <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}>
        {valueLevel.emoji}
      </span>

      {/* Label */}
      {showLabel && <span>{valueLevel.label}</span>}

      {/* Score */}
      <span className="font-bold">{score}</span>
    </div>
  );
}

/**
 * Calculate value score based on multiple factors
 * This is a simplified version - production would use actual ML model
 */
export function calculateValueScore(params: {
  price: number;
  marketAvgPrice: number;
  rating?: number; // 0-5 scale
  reviewCount?: number;
  demandLevel?: number; // 0-100 scale
  availabilityLevel?: number; // 0-100 scale
}): number {
  const {
    price,
    marketAvgPrice,
    rating = 4,
    reviewCount = 100,
    demandLevel = 50,
    availabilityLevel = 70
  } = params;

  // Price factor (40% weight) - Lower price relative to market = higher score
  const priceRatio = price / marketAvgPrice;
  const priceFactor = Math.max(0, Math.min(100, (2 - priceRatio) * 50));

  // Quality factor (30% weight) - Based on ratings
  const qualityFactor = (rating / 5) * 100;

  // Demand factor (15% weight) - Higher demand = better deal
  const demandFactor = demandLevel;

  // Availability factor (15% weight) - Lower availability = more valuable
  const availabilityFactor = 100 - availabilityLevel;

  // Weighted average
  const score = (
    priceFactor * 0.40 +
    qualityFactor * 0.30 +
    demandFactor * 0.15 +
    availabilityFactor * 0.15
  );

  return Math.round(Math.max(0, Math.min(100, score)));
}
