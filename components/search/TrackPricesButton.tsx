'use client';

import { useState } from 'react';

interface Props {
  onClick: () => void;
  text?: string;
}

export function TrackPricesButton({ onClick, text = 'Track Prices' }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full md:w-auto group"
    >
      {/* Main button */}
      <div className="relative bg-white border-2 border-primary-300 text-primary-600 px-6 py-4 rounded-2xl font-bold text-base shadow-lg transform transition-all duration-300 hover:border-primary-500 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2">

        {/* Bell icon with animation */}
        <div className={`transform transition-all duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
          <svg className={`w-5 h-5 ${isHovered ? 'animate-wiggle' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>

        <span className="whitespace-nowrap">{text}</span>

        {/* Notification badge */}
        <div className={`absolute -top-1 -right-1 bg-secondary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full transform transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          Free
        </div>

        {/* Hover gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-50' : ''}`}></div>
      </div>
    </button>
  );
}
