'use client';

import { useEffect, useState } from 'react';
import { ClockIcon, FireIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

interface UrgencyBannerProps {
  type?: 'countdown' | 'scarcity' | 'social-proof' | 'price-increase';
  message?: string;
  className?: string;
}

export function UrgencyBanner({ type = 'countdown', message, className = '' }: UrgencyBannerProps) {
  const hasMounted = useHasMounted();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  const [viewersCount] = useState(() => Math.floor(Math.random() * 150) + 50);

  useEffect(() => {
    if (type !== 'countdown') return;

    const calculateTimeLeft = () => {
      const worldCupStart = new Date('2026-06-11T00:00:00').getTime();
      const now = new Date().getTime();
      const difference = worldCupStart - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [type]);

  const banners = {
    countdown: (
      <div className={`bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-3 px-6 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <ClockIcon className="w-6 h-6 animate-pulse" />
          <span className="font-bold text-lg" suppressHydrationWarning>
            {hasMounted ? `Only ${timeLeft.days} days until kickoff!` : 'World Cup 2026 Coming Soon!'}
          </span>
          <span className="text-sm opacity-90" suppressHydrationWarning>
            {hasMounted
              ? `Book now - Prices increase ${Math.floor(timeLeft.days / 30)} month${Math.floor(timeLeft.days / 30) !== 1 ? 's' : ''} before the event`
              : 'Book now for the best prices'}
          </span>
        </div>
      </div>
    ),
    scarcity: (
      <div className={`bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-6 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <FireIcon className="w-6 h-6 animate-bounce" />
          <span className="font-bold text-lg">
            {message || '87% of hotels near this stadium are sold out'}
          </span>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            Limited Availability
          </span>
        </div>
      </div>
    ),
    'social-proof': (
      <div className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <UsersIcon className="w-6 h-6" />
          <span className="font-bold text-lg">
            {viewersCount} people are viewing this page right now
          </span>
          <span className="text-sm opacity-90">
            • 12,847 bookings this week
          </span>
        </div>
      </div>
    ),
    'price-increase': (
      <div className={`bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-black py-3 px-6 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <FireIcon className="w-6 h-6 text-red-600 animate-pulse" />
          <span className="font-bold text-lg">
            Lock in 2025 prices! Packages increase 15% on January 1st, 2026
          </span>
          <span className="text-sm font-semibold bg-black/20 px-3 py-1 rounded-full">
            Save up to $1,250
          </span>
        </div>
      </div>
    ),
  };

  return banners[type];
}
