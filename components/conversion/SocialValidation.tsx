'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface SocialValidationProps {
  travelerCount?: number;
  popularityScore?: number;
  className?: string;
  variant?: 'tooltip' | 'badge' | 'inline';
}

export default function SocialValidation({
  travelerCount,
  popularityScore,
  className = '',
  variant = 'tooltip'
}: SocialValidationProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [randomTravelerCount, setRandomTravelerCount] = useState(1500);
  const [randomPopularity, setRandomPopularity] = useState(85);

  // Generate random values on client-side only to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setRandomTravelerCount(Math.floor(Math.random() * 2000) + 500); // 500-2500
    setRandomPopularity(Math.floor(Math.random() * 30) + 70); // 70-100
  }, []);

  // Use provided values or fallback to random (after mount)
  const finalTravelerCount = travelerCount ?? randomTravelerCount;
  const finalPopularityScore = popularityScore ?? randomPopularity;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 ${className}`}>
        <Users className="w-3 h-3" />
        <span className="text-[10px] font-medium" suppressHydrationWarning>
          {formatNumber(finalTravelerCount)} travelers chose this
        </span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-gray-600 ${className}`}>
        <Users className="w-3.5 h-3.5 text-blue-600" />
        <span suppressHydrationWarning>
          <span className="font-semibold text-gray-900">{formatNumber(finalTravelerCount)}</span>
          {' '}travelers chose this flight
        </span>
      </div>
    );
  }

  // Tooltip variant (default)
  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Trigger */}
      <div className="inline-flex items-center gap-1 cursor-help">
        <Users className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-[10px] text-blue-600 font-medium underline decoration-dotted">
          Popular choice
        </span>
      </div>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-fadeIn">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap" suppressHydrationWarning>
            <div className="font-semibold mb-1">
              Based on {formatNumber(finalTravelerCount)} travelers
            </div>
            <div className="text-gray-300 text-[10px]">
              {finalPopularityScore}% chose this flight over alternatives
            </div>

            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-2px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 150ms ease-out;
        }
      `}</style>
    </div>
  );
}
