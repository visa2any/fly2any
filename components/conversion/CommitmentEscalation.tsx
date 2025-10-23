'use client';

import { useState } from 'react';
import { Heart, BarChart3, CreditCard } from 'lucide-react';

interface CommitmentEscalationProps {
  flightId: string;
  onSave?: () => void;
  onCompare?: () => void;
  onBook?: () => void;
  className?: string;
}

type CommitmentLevel = 'none' | 'saved' | 'comparing' | 'booking';

export default function CommitmentEscalation({
  flightId,
  onSave,
  onCompare,
  onBook,
  className = ''
}: CommitmentEscalationProps) {
  const [level, setLevel] = useState<CommitmentLevel>('none');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setLevel('saved');
    onSave?.();
  };

  const handleCompare = () => {
    setLevel('comparing');
    onCompare?.();
  };

  const handleBook = () => {
    setLevel('booking');
    onBook?.();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Step 1: Save to Favorites (Low commitment) */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          isSaved
            ? 'bg-pink-50 border-pink-300 text-pink-700'
            : 'bg-white border-gray-300 text-gray-700 hover:border-pink-300 hover:text-pink-700'
        }`}
        aria-label="Save to favorites"
      >
        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-pink-700' : ''}`} />
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>

      {/* Step 2: Compare (Medium commitment) - Shows after save */}
      {level !== 'none' && (
        <button
          onClick={handleCompare}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            level === 'comparing'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-700'
          }`}
          aria-label="Compare flights"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Compare</span>
        </button>
      )}

      {/* Step 3: Book Now (High commitment) - Always visible but emphasized after compare */}
      <button
        onClick={handleBook}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          level === 'comparing' || level === 'booking'
            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md scale-105'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
        aria-label="Book this flight"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>Book Now</span>
        {(level === 'comparing' || level === 'booking') && (
          <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
            Best Deal
          </span>
        )}
      </button>
    </div>
  );
}
