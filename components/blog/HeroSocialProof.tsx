'use client';

import { useEffect, useState } from 'react';

interface RecentBooking {
  name: string;
  destination: string;
  timeAgo: string;
  location: string;
}

interface HeroSocialProofProps {
  recentBookings: RecentBooking[];
  className?: string;
}

export function HeroSocialProof({ recentBookings, className = '' }: HeroSocialProofProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentBookings.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [recentBookings.length]);

  if (recentBookings.length === 0) return null;

  const current = recentBookings[currentIndex];

  return (
    <div className={className}>
      <div className="
        bg-white/10 backdrop-blur-md
        border border-white/20
        rounded-2xl
        px-6 py-4
        text-white
        shadow-lg
        inline-flex items-center gap-3
        animate-fade-in
      ">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {current.name.charAt(0)}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold">
            {current.name} booked a trip to <span className="text-blue-300">{current.destination}</span>
          </p>
          <p className="text-xs text-white/70">
            {current.location} • {current.timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
