'use client';

import { useEffect, useState } from 'react';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

export function CombinedUrgencyBanner() {
  const hasMounted = useHasMounted();
  const [daysLeft, setDaysLeft] = useState(0);
  const [monthsUntilIncrease, setMonthsUntilIncrease] = useState(6);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const worldCupStart = new Date('2026-06-11T00:00:00').getTime();
      const now = new Date().getTime();
      const difference = worldCupStart - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        setDaysLeft(days);
        setMonthsUntilIncrease(months);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 text-white py-2 px-4 shadow-xl relative overflow-x-auto">
      {/* Animated background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
           style={{
             backgroundSize: '200% 100%',
             animation: 'shimmer 3s ease-in-out infinite'
           }} />

      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 relative z-10 text-sm whitespace-nowrap">
        <svg className="w-4 h-4 animate-pulse text-yellow-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-bold" suppressHydrationWarning>
          {hasMounted ? `${daysLeft} Days to Kickoff` : 'World Cup 2026'}
        </span>

        <span className="text-white/40">•</span>

        <svg className="w-4 h-4 text-yellow-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span className="font-bold">Lock 2025 Prices - 15% Increase Jan 1</span>

        <span className="text-white/40">•</span>

        <div className="bg-yellow-400 text-black px-4 py-1 rounded-full font-black shadow-lg hover:scale-105 transition-transform cursor-pointer hover:bg-yellow-300 flex-shrink-0">
          💰 Save $1,250
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
