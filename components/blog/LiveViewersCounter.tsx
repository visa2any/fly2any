'use client';

import { useState, useEffect } from 'react';

interface LiveViewersCounterProps {
  dealId?: string;
  baseCount?: number; // Random range around this
}

export default function LiveViewersCounter({
  dealId,
  baseCount
}: LiveViewersCounterProps) {
  // Determine base count based on dealId or use provided baseCount
  const getBaseCount = () => {
    if (baseCount) return baseCount;

    // Generate consistent base count for same dealId
    if (dealId) {
      const hash = dealId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const isFlashDeal = hash % 3 === 0;
      return isFlashDeal ? 150 + (hash % 150) : 30 + (hash % 20);
    }

    // Random base for no dealId
    return Math.random() > 0.3 ? 25 + Math.floor(Math.random() * 25) : 100 + Math.floor(Math.random() * 200);
  };

  const [viewerCount, setViewerCount] = useState(getBaseCount());
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const base = getBaseCount();

    const updateCount = () => {
      // Fluctuate ±5 from base
      const fluctuation = Math.floor(Math.random() * 11) - 5;
      const newCount = Math.max(1, base + fluctuation);

      setIsAnimating(true);
      setViewerCount(newCount);

      // Remove animation class after animation completes
      setTimeout(() => setIsAnimating(false), 300);
    };

    // Update every 2-5 seconds
    const getRandomInterval = () => 2000 + Math.random() * 3000;

    let timeoutId: NodeJS.Timeout;
    const scheduleNextUpdate = () => {
      timeoutId = setTimeout(() => {
        updateCount();
        scheduleNextUpdate();
      }, getRandomInterval());
    };

    scheduleNextUpdate();

    return () => clearTimeout(timeoutId);
  }, [dealId, baseCount]);

  const isHotDeal = viewerCount > 80;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <span className={`text-lg ${isHotDeal ? 'animate-flame-pulse' : ''}`}>
        {isHotDeal ? '🔥' : '👁️'}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-bold text-lg tabular-nums ${isAnimating ? 'animate-count-up' : ''}`}
          key={viewerCount}
        >
          {viewerCount}
        </span>
        <span className="text-sm opacity-90">
          {viewerCount === 1 ? 'person viewing' : 'people viewing'} right now
        </span>
      </div>
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
    </div>
  );
}
