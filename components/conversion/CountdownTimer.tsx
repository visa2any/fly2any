'use client';

import { useState, useEffect } from 'react';

interface Props {
  endTime: Date | string | number;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ endTime, size = 'md' }: Props) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fix hydration error: Only calculate time on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Skip on server-side

    const target = new Date(endTime);
    const calculateTimeLeft = () => {
      const difference = target.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, mounted]);

  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const padSize = {
    sm: 'px-2 py-1',
    md: 'px-3 py-2',
    lg: 'px-4 py-3',
  };

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className={`${padSize[size]} bg-gray-900 text-white font-bold rounded-lg font-mono ${sizes[size]} min-w-[3rem] text-center`}>
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs text-gray-600 mt-1 uppercase">{label}</div>
    </div>
  );

  // Show skeleton during SSR to prevent hydration errors
  if (!mounted) {
    return (
      <div className="flex gap-2 items-center justify-center animate-pulse">
        <div className="flex flex-col items-center">
          <div className={`${padSize[size]} bg-gray-200 rounded-lg ${sizes[size]} min-w-[3rem] h-10`}></div>
          <div className="text-xs text-gray-400 mt-1 uppercase">Hours</div>
        </div>
        <div className={`${sizes[size]} font-bold text-gray-400`}>:</div>
        <div className="flex flex-col items-center">
          <div className={`${padSize[size]} bg-gray-200 rounded-lg ${sizes[size]} min-w-[3rem] h-10`}></div>
          <div className="text-xs text-gray-400 mt-1 uppercase">Min</div>
        </div>
        <div className={`${sizes[size]} font-bold text-gray-400`}>:</div>
        <div className="flex flex-col items-center">
          <div className={`${padSize[size]} bg-gray-200 rounded-lg ${sizes[size]} min-w-[3rem] h-10`}></div>
          <div className="text-xs text-gray-400 mt-1 uppercase">Sec</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center justify-center">
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <div className={`${sizes[size]} font-bold text-gray-400`}>:</div>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <div className={`${sizes[size]} font-bold text-gray-400`}>:</div>
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
