'use client';

import { useEffect, useState } from 'react';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

export function CombinedUrgencyBanner() {
  const hasMounted = useHasMounted();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const worldCupStart = new Date('2026-06-11T00:00:00').getTime();
      const now = new Date().getTime();
      const difference = worldCupStart - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        setDaysLeft(days);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-600 via-blue-600 to-red-600 text-white py-2 px-4 shadow-xl relative overflow-x-auto">
      {/* Animated background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
           style={{
             backgroundSize: '200% 100%',
             animation: 'shimmer 3s ease-in-out infinite'
           }} />

      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 md:gap-4 relative z-10 text-xs md:text-sm whitespace-nowrap">
        {/* NEW: Groups Set Badge */}
        <div className="bg-yellow-400 text-black px-2 py-0.5 rounded-full font-black text-[10px] md:text-xs animate-pulse flex-shrink-0">
          ⚽ GROUPS SET!
        </div>

        <span className="text-white/40 hidden md:inline">•</span>

        {/* Countdown */}
        <span className="font-bold hidden md:inline" suppressHydrationWarning>
          {hasMounted ? `${daysLeft} Days to Kickoff` : 'World Cup 2026'}
        </span>

        <span className="text-white/40 hidden md:inline">•</span>

        {/* Opening Match */}
        <span className="font-bold text-yellow-300 flex items-center gap-1">
          <span className="hidden md:inline">🇲🇽 vs 🇿🇦</span>
          <span>Opening: June 11</span>
        </span>

        <span className="text-white/40">•</span>

        {/* USA Match */}
        <span className="font-bold flex items-center gap-1">
          🇺🇸 vs 🇵🇾 <span className="hidden sm:inline">- June 12</span>
        </span>

        <span className="text-white/40 hidden md:inline">•</span>

        {/* CTA */}
        <div className="bg-yellow-400 text-black px-3 py-1 rounded-full font-black shadow-lg hover:scale-105 transition-transform cursor-pointer hover:bg-yellow-300 flex-shrink-0 text-[10px] md:text-xs">
          Book Now →
        </div>
      </div>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
