'use client';

/**
 * Fallback Date Notice Component
 * Informs users when alternative dates were used due to no results on original dates
 */

import React from 'react';

interface FallbackDateNoticeProps {
  originalDeparture: string;
  originalReturn?: string;
  actualDeparture: string;
  actualReturn?: string;
  flightsFound: number;
}

const FallbackDateNotice: React.FC<FallbackDateNoticeProps> = ({ originalDeparture,
  originalReturn,
  actualDeparture,
  actualReturn,
  flightsFound
 }: FallbackDateNoticeProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-blue-400 text-sm">📅</span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-white">Alternative Dates Found</h3>
            <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
              {flightsFound} flight{flightsFound !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="text-xs text-white/70 mb-3">
            <p className="mb-1">
              <span className="text-white/50">Requested:</span>{' '}
              <span className="line-through text-white/60">
                {formatDate(originalDeparture)}
                {originalReturn && ` - ${formatDate(originalReturn)}`}
              </span>
            </p>
            <p>
              <span className="text-white/50">Showing flights for:</span>{' '}
              <span className="text-white font-medium">
                {formatDate(actualDeparture)}
                {actualReturn && ` - ${formatDate(actualReturn)}`}
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-cyan-400">💡</span>
            <span className="text-white/70">
              No flights were available for your original dates. These nearby dates have availability.
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full hover:bg-blue-500/30 transition-colors whitespace-nowrap"
        >
          Search Again
        </button>
      </div>
    </div>
  );
};

export default FallbackDateNotice;