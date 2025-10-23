'use client';

import { useState, useEffect } from 'react';

interface FOMOCountdownProps {
  expiryMinutes?: number; // How many minutes until price expires
  className?: string;
}

export default function FOMOCountdown({
  expiryMinutes = 45,
  className = ''
}: FOMOCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
  }>({ minutes: expiryMinutes, seconds: 0 });

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          setIsVisible(false);
          return prev;
        }

        if (prev.seconds === 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }

        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const formatTime = () => {
    const mins = timeLeft.minutes.toString().padStart(2, '0');
    const secs = timeLeft.seconds.toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const isUrgent = timeLeft.minutes < 10;

  return (
    <div className={`px-2 py-1.5 bg-gradient-to-r ${
      isUrgent
        ? 'from-red-50 to-orange-50 border-red-200'
        : 'from-orange-50 to-yellow-50 border-orange-200'
    } border rounded-lg transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-semibold ${
          isUrgent ? 'text-red-700' : 'text-orange-700'
        }`}>
          {isUrgent ? '⚡' : '⏰'} Price expires in
        </span>
        <span className={`text-[11px] font-bold tabular-nums ${
          isUrgent ? 'text-red-700 animate-pulse' : 'text-orange-700'
        }`}>
          {formatTime()}
        </span>
      </div>
    </div>
  );
}
