'use client';

import { useState, useEffect } from 'react';

export function StatsBar() {
  const [stats, setStats] = useState({
    searches: 1247,
    bookings: 89,
    savings: 45823,
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        searches: prev.searches + Math.floor(Math.random() * 5) + 1,
        bookings: prev.bookings + (Math.random() > 0.7 ? 1 : 0),
        savings: prev.savings + Math.floor(Math.random() * 200) + 50,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8 text-center text-white">
      <div className="group">
        <div className="text-3xl md:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform">
          {stats.searches.toLocaleString()}
        </div>
        <div className="text-sm md:text-base opacity-90">Searches Today</div>
        <div className="text-xs opacity-75 mt-1">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
      </div>

      <div className="group">
        <div className="text-3xl md:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform">
          {stats.bookings.toLocaleString()}
        </div>
        <div className="text-sm md:text-base opacity-90">Bookings Today</div>
        <div className="text-xs opacity-75 mt-1">Last 24 hours</div>
      </div>

      <div className="group">
        <div className="text-3xl md:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform">
          ${(stats.savings / 1000).toFixed(1)}K
        </div>
        <div className="text-sm md:text-base opacity-90">Saved Today</div>
        <div className="text-xs opacity-75 mt-1">By our users</div>
      </div>
    </div>
  );
}
