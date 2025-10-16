'use client';

import { useState } from 'react';

interface Props {
  onClick: () => void;
  text?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function EnhancedSearchButton({ onClick, text = 'Search Flights', disabled = false, loading = false }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full group"
    >
      {/* Glow effect on hover */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-75 transition-all duration-500 ${isHovered ? 'animate-pulse' : ''}`}></div>

      {/* Main button */}
      <div className="relative bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 text-white px-8 py-6 rounded-2xl font-bold text-xl shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl flex items-center justify-center gap-3">

        {/* Animated icon */}
        <div className={`transform transition-all duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
          {loading ? (
            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        {/* Text with gradient shimmer */}
        <span className="relative">
          {loading ? 'Searching...' : text}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 ${isHovered ? 'animate-shimmer' : ''}`}></div>
        </span>

        {/* Arrow icon */}
        <svg className={`w-6 h-6 transform transition-all duration-500 ${isHovered ? 'translate-x-2' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>

        {/* Particles effect */}
        {isHovered && (
          <>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-75" style={{ animationDelay: '0.2s' }}></div>
          </>
        )}
      </div>

      {/* Bottom gradient reflection */}
      <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-b from-primary-400/20 to-transparent blur-xl"></div>
    </button>
  );
}
