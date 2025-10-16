'use client';

import { useState, useEffect } from 'react';

interface LimitedTimeOfferProps {
  offerText: string;
  expiryTime: Date | string;
  variant?: 'banner' | 'badge' | 'ribbon';
  onClickThrough?: () => void;
}

export default function LimitedTimeOffer({
  offerText,
  expiryTime,
  variant = 'banner',
  onClickThrough
}: LimitedTimeOfferProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = typeof expiryTime === 'string' ? new Date(expiryTime).getTime() : expiryTime.getTime();
      const diff = expiry - now;

      if (diff <= 0) return 'ENDED';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}D ${hours % 24}H`;
      }

      return `${hours}H ${minutes}M`;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryTime, mounted]);

  if (!mounted) {
    return <div className="animate-pulse bg-gray-200 h-12 rounded-lg" />;
  }

  const baseClasses = "cursor-pointer transition-transform hover:scale-105";
  const isEnded = timeLeft === 'ENDED';

  // Banner variant - Full-width top banner
  if (variant === 'banner') {
    return (
      <div
        onClick={onClickThrough}
        className={`${baseClasses} w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-gradient-shift`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce-gentle">⚡</span>
              <span className="font-bold text-lg md:text-xl uppercase tracking-wide">
                {offerText}
              </span>
            </div>
            {!isEnded && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-sm md:text-base animate-pulse-glow">
                ENDS IN {timeLeft}
              </div>
            )}
            {isEnded && (
              <div className="bg-gray-800 px-4 py-2 rounded-full font-bold text-sm">
                ENDED
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Badge variant - Corner badge
  if (variant === 'badge') {
    return (
      <div
        onClick={onClickThrough}
        className={`${baseClasses} inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse-glow`}
      >
        <span className="text-xl">⚡</span>
        <div className="text-left">
          <div className="font-bold text-sm uppercase tracking-wide">
            {offerText}
          </div>
          {!isEnded && (
            <div className="text-xs opacity-90">
              Ends in {timeLeft}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Ribbon variant - Diagonal corner ribbon
  if (variant === 'ribbon') {
    return (
      <div className="absolute top-0 right-0 overflow-hidden w-32 h-32 pointer-events-none">
        <div
          onClick={onClickThrough}
          className="absolute transform rotate-45 bg-gradient-to-r from-red-600 to-orange-500 text-white text-center font-bold py-2 px-8 shadow-lg cursor-pointer pointer-events-auto animate-pulse-glow"
          style={{
            top: '20px',
            right: '-35px',
            width: '150px',
          }}
        >
          <div className="text-xs uppercase tracking-wide">
            {!isEnded ? `${timeLeft} LEFT` : 'ENDED'}
          </div>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-sm">⚡</span>
            <span className="text-[10px]">{offerText.split(' ').slice(0, 2).join(' ')}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
