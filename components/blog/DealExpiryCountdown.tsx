'use client';

import { useState, useEffect } from 'react';

interface DealExpiryCountdownProps {
  expiryDate: Date | string;
  showProgressBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
}

export default function DealExpiryCountdown({
  expiryDate,
  showProgressBar = true,
  size = 'md'
}: DealExpiryCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateTimeRemaining = (): TimeRemaining | null => {
      const now = new Date().getTime();
      const expiry = typeof expiryDate === 'string' ? new Date(expiryDate).getTime() : expiryDate.getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const totalHours = Math.floor(diff / (1000 * 60 * 60));

      return { days, hours, minutes, seconds, totalHours };
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate, mounted]);

  if (!mounted || !timeRemaining) {
    return (
      <div className="animate-pulse bg-gray-200 h-16 rounded-lg" />
    );
  }

  // Determine urgency level
  const getUrgencyLevel = () => {
    if (timeRemaining.totalHours > 24) return 'calm';
    if (timeRemaining.totalHours > 12) return 'warning';
    if (timeRemaining.totalHours > 6) return 'urgent';
    return 'critical';
  };

  const urgencyLevel = getUrgencyLevel();

  const config = {
    calm: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      text: 'text-white',
      progressColor: 'bg-blue-400',
      pulse: false,
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
      text: 'text-gray-900',
      progressColor: 'bg-yellow-300',
      pulse: false,
    },
    urgent: {
      bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
      text: 'text-white',
      progressColor: 'bg-orange-400',
      pulse: false,
    },
    critical: {
      bg: 'bg-gradient-to-r from-red-600 to-red-700',
      text: 'text-white',
      progressColor: 'bg-red-400',
      pulse: true,
    },
  }[urgencyLevel];

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-lg px-4 py-3',
    lg: 'text-2xl px-6 py-4',
  }[size];

  // Calculate progress (0-100, where 100 is expired)
  const totalDuration = 48 * 60 * 60; // Assume 48 hours total
  const elapsed = totalDuration - (timeRemaining.totalHours * 60 * 60 + timeRemaining.minutes * 60 + timeRemaining.seconds);
  const progressPercentage = Math.min(100, (elapsed / totalDuration) * 100);

  // Format display
  const isExpired = timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0;

  const formatTime = () => {
    if (isExpired) return 'EXPIRED';

    // Mobile: Simplified format
    if (size === 'sm') {
      if (timeRemaining.days > 0) return `${timeRemaining.days}d ${timeRemaining.hours}h`;
      if (timeRemaining.hours > 0) return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
      return `${timeRemaining.minutes}m left`;
    }

    // Desktop: Full format
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
    }
    return `${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  };

  return (
    <div className="space-y-2">
      <div className={`${config.bg} ${config.text} ${sizeClasses} rounded-lg shadow-lg ${config.pulse ? 'animate-pulse-glow' : ''} font-bold text-center`}>
        <div className="flex items-center justify-center gap-2">
          {urgencyLevel === 'critical' && <span className="text-2xl">⚡</span>}

          <div>
            {timeRemaining.totalHours < 1 && !isExpired && (
              <div className="text-sm font-semibold uppercase tracking-wide mb-1 animate-pulse">
                ENDS SOON!
              </div>
            )}
            <div className="tabular-nums tracking-wider">
              {formatTime()}
            </div>
          </div>

          {urgencyLevel === 'critical' && <span className="text-2xl">⚡</span>}
        </div>

        {isExpired && (
          <div className="text-sm mt-1 opacity-90">
            This deal has ended
          </div>
        )}
      </div>

      {/* Progress bar */}
      {showProgressBar && !isExpired && (
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${config.progressColor} transition-all duration-1000 ease-linear`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Time Running Out</span>
            <span>{Math.round(100 - progressPercentage)}% left</span>
          </div>
        </div>
      )}
    </div>
  );
}
