'use client';

/**
 * Deal Score Badge Component
 *
 * Displays a flight's deal score with:
 * - Circular progress indicator
 * - Color-coded tiers (excellent/great/good/fair)
 * - Animated score reveal
 * - Detailed tooltip breakdown
 *
 * @module components/flights/DealScoreBadge
 */

import React, { useState, useEffect } from 'react';
import { DealScoreBreakdown } from '@/lib/flights/dealScore';

interface DealScoreBadgeProps {
  /** Complete deal score breakdown */
  score: DealScoreBreakdown;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show full label or just score */
  showLabel?: boolean;
  /** Enable animations */
  animate?: boolean;
  /** Custom className for container */
  className?: string;
}

/**
 * Get color scheme based on score tier
 */
function getTierColors(tier: DealScoreBreakdown['tier']) {
  switch (tier) {
    case 'excellent':
      return {
        bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
        border: 'border-amber-400',
        text: 'text-amber-900',
        progress: 'stroke-amber-500',
        progressBg: 'stroke-amber-200',
        badge: 'bg-amber-100',
        icon: '🏆',
      };
    case 'great':
      return {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-500',
        text: 'text-green-900',
        progress: 'stroke-green-500',
        progressBg: 'stroke-green-200',
        badge: 'bg-green-100',
        icon: '✨',
      };
    case 'good':
      return {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-blue-400',
        text: 'text-blue-900',
        progress: 'stroke-blue-500',
        progressBg: 'stroke-blue-200',
        badge: 'bg-blue-100',
        icon: '👍',
      };
    case 'fair':
      return {
        bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
        border: 'border-gray-400',
        text: 'text-gray-900',
        progress: 'stroke-gray-500',
        progressBg: 'stroke-gray-200',
        badge: 'bg-gray-100',
        icon: '💼',
      };
  }
}

/**
 * Get size-specific dimensions
 */
function getSizeDimensions(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        container: 'w-16 h-16',
        svg: 64,
        radius: 28,
        strokeWidth: 4,
        fontSize: 'text-lg',
        labelSize: 'text-xs',
      };
    case 'md':
      return {
        container: 'w-20 h-20',
        svg: 80,
        radius: 35,
        strokeWidth: 5,
        fontSize: 'text-2xl',
        labelSize: 'text-sm',
      };
    case 'lg':
      return {
        container: 'w-28 h-28',
        svg: 112,
        radius: 50,
        strokeWidth: 6,
        fontSize: 'text-3xl',
        labelSize: 'text-base',
      };
  }
}

/**
 * Circular progress ring component
 */
function CircularProgress({
  score,
  size,
  colors,
  animate,
}: {
  score: number;
  size: ReturnType<typeof getSizeDimensions>;
  colors: ReturnType<typeof getTierColors>;
  animate: boolean;
}) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const circumference = 2 * Math.PI * size.radius;
  const progress = (displayScore / 100) * circumference;

  useEffect(() => {
    if (animate && displayScore < score) {
      const timer = setTimeout(() => {
        setDisplayScore(prev => Math.min(prev + 2, score));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [displayScore, score, animate]);

  return (
    <svg
      className="transform -rotate-90"
      width={size.svg}
      height={size.svg}
      viewBox={`0 0 ${size.svg} ${size.svg}`}
    >
      {/* Background circle */}
      <circle
        className={colors.progressBg}
        cx={size.svg / 2}
        cy={size.svg / 2}
        r={size.radius}
        strokeWidth={size.strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <circle
        className={`${colors.progress} transition-all duration-300 ease-out`}
        cx={size.svg / 2}
        cy={size.svg / 2}
        r={size.radius}
        strokeWidth={size.strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        style={{
          transition: animate ? 'stroke-dashoffset 0.3s ease-out' : 'none',
        }}
      />
    </svg>
  );
}

/**
 * Tooltip with score breakdown
 */
function ScoreTooltip({ score }: { score: DealScoreBreakdown }) {
  const components = [
    { name: 'Price', value: score.components.price, max: 40, explanation: score.explanations.price },
    { name: 'Duration', value: score.components.duration, max: 15, explanation: score.explanations.duration },
    { name: 'Stops', value: score.components.stops, max: 15, explanation: score.explanations.stops },
    { name: 'Time of Day', value: score.components.timeOfDay, max: 10, explanation: score.explanations.timeOfDay },
    { name: 'Reliability', value: score.components.reliability, max: 10, explanation: score.explanations.reliability },
    { name: 'Comfort', value: score.components.comfort, max: 5, explanation: score.explanations.comfort },
    { name: 'Availability', value: score.components.availability, max: 5, explanation: score.explanations.availability },
  ];

  return (
    <div
      className="absolute z-maximum p-4 bg-white rounded-lg shadow-2xl border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-2 group-hover:translate-y-0 pointer-events-none top-full mt-2"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(320px, 90vw)',
        maxWidth: '90vw',
        maxHeight: 'min(600px, 90vh)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Tooltip arrow */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45" />

      <div className="relative">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
          Deal Score Breakdown
        </h4>

        <div className="space-y-2.5">
          {components.map((component) => (
            <div key={component.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 font-medium">{component.name}</span>
                <span className="text-gray-900 font-semibold">
                  {component.value}/{component.max}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(component.value / component.max) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">{component.explanation}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Total Score</span>
            <span className="text-lg font-bold text-blue-600">{score.total}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Deal Score Badge Component
 */
export function DealScoreBadge({
  score,
  size = 'md',
  showLabel = true,
  animate = true,
  className = '',
}: DealScoreBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = getTierColors(score.tier);
  const dimensions = getSizeDimensions(size);

  return (
    <div
      className={`inline-flex flex-col items-center gap-2 relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Circular badge */}
      <div className="relative">
        <div className={`relative ${dimensions.container}`}>
          {/* Circular progress */}
          <CircularProgress
            score={score.total}
            size={dimensions}
            colors={colors}
            animate={animate}
          />

          {/* Score number in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold ${colors.text} ${dimensions.fontSize}`}>
              {score.total}
            </span>
          </div>
        </div>

        {/* Icon badge */}
        {score.tier === 'excellent' && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs shadow-lg animate-bounce">
            {colors.icon}
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex flex-col items-center gap-0.5">
          <span className={`font-semibold ${colors.text} ${dimensions.labelSize} whitespace-nowrap`}>
            {score.label}
          </span>
          {size === 'lg' && (
            <span className="text-xs text-gray-500">Hover for details</span>
          )}
        </div>
      )}

      {/* Tooltip */}
      <ScoreTooltip score={score} />
    </div>
  );
}

/**
 * Compact inline badge variant (for flight cards)
 */
export function DealScoreBadgeCompact({
  score,
  className = '',
}: {
  score: DealScoreBreakdown;
  className?: string;
}) {
  const colors = getTierColors(score.tier);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${colors.bg} ${colors.border} border rounded-full group relative ${className}`}
    >
      {/* Score */}
      <span className={`text-sm font-bold ${colors.text}`}>{score.total}</span>

      {/* Label - single line */}
      <span className={`text-xs font-medium ${colors.text}`}>
        {score.tier === 'excellent' ? 'Excellent' : score.tier === 'great' ? 'Great' : score.tier === 'good' ? 'Good' : 'Fair'}
      </span>

      {/* Icon */}
      <span className="text-sm">{colors.icon}</span>

      {/* Tooltip */}
      <ScoreTooltip score={score} />
    </div>
  );
}

/**
 * Minimal badge variant (just the number with background)
 */
export function DealScoreBadgeMinimal({
  score,
  className = '',
}: {
  score: DealScoreBreakdown;
  className?: string;
}) {
  const colors = getTierColors(score.tier);

  return (
    <div
      className={`inline-flex items-center justify-center px-2.5 py-1 ${colors.badge} ${colors.border} border rounded-md group relative ${className}`}
    >
      <span className={`text-sm font-bold ${colors.text}`}>{score.total}</span>
      <ScoreTooltip score={score} />
    </div>
  );
}

/**
 * Large promotional badge variant (for highlighting best deals)
 */
export function DealScoreBadgePromo({
  score,
  className = '',
}: {
  score: DealScoreBreakdown;
  className?: string;
}) {
  const colors = getTierColors(score.tier);

  return (
    <div
      className={`inline-flex flex-col items-center gap-3 p-4 ${colors.bg} ${colors.border} border-2 rounded-xl shadow-lg group relative ${className}`}
    >
      {/* Icon */}
      <div className="text-3xl animate-pulse">{colors.icon}</div>

      {/* Score */}
      <div className="flex flex-col items-center">
        <span className={`text-4xl font-bold ${colors.text}`}>{score.total}</span>
        <span className="text-xs text-gray-600 uppercase tracking-wide">Deal Score</span>
      </div>

      {/* Label */}
      <div className={`px-4 py-1 ${colors.badge} rounded-full`}>
        <span className={`text-sm font-semibold ${colors.text}`}>
          {score.label}
        </span>
      </div>

      {/* Badge indicator */}
      {score.tier === 'excellent' && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-bounce">
          HOT
        </div>
      )}

      {/* Tooltip */}
      <ScoreTooltip score={score} />
    </div>
  );
}

export default DealScoreBadge;
