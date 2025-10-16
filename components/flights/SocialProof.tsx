'use client';

import { Star, Shield, Award, CheckCircle } from 'lucide-react';

interface SocialProofProps {
  airline: string;
  rating?: number;
  reviewCount?: number;
  onTimePerformance?: number;
  isVerified?: boolean;
}

export default function SocialProof({
  airline,
  rating = 4.2,
  reviewCount = 1523,
  onTimePerformance = 87,
  isVerified = true,
}: SocialProofProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {/* Rating */}
      {rating && (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-700">{rating.toFixed(1)}</span>
          <span className="text-gray-500">({reviewCount.toLocaleString()} reviews)</span>
        </div>
      )}

      {/* On-time performance */}
      {onTimePerformance && onTimePerformance >= 80 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          <span className="text-green-700 font-semibold">{onTimePerformance}% on-time</span>
        </div>
      )}

      {/* Verified airline */}
      {isVerified && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
          <Shield className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-blue-700 font-semibold">Verified</span>
        </div>
      )}

      {/* Trust badge */}
      <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-full">
        <Award className="h-3.5 w-3.5 text-purple-600" />
        <span className="text-purple-700 font-semibold">Trusted Partner</span>
      </div>
    </div>
  );
}
