'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';

interface SocialValidationProps {
  travelerCount?: number;
  popularityScore?: number;
  className?: string;
  variant?: 'tooltip' | 'badge' | 'inline';
}

export default function SocialValidation({
  travelerCount = Math.floor(Math.random() * 2000) + 500, // Random between 500-2500
  popularityScore = Math.floor(Math.random() * 30) + 70, // Random between 70-100
  className = '',
  variant = 'tooltip'
}: SocialValidationProps) {
  const [isHovered, setIsHovered] = useState(false);

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
        <span className="text-[10px] font-medium">
          {formatNumber(travelerCount)} travelers chose this
        </span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-gray-600 ${className}`}>
        <Users className="w-3.5 h-3.5 text-blue-600" />
        <span>
          <span className="font-semibold text-gray-900">{formatNumber(travelerCount)}</span>
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
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <div className="font-semibold mb-1">
              Based on {formatNumber(travelerCount)} travelers
            </div>
            <div className="text-gray-300 text-[10px]">
              {popularityScore}% chose this flight over alternatives
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
