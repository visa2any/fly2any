'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isExpired: boolean;
  isUrgent: boolean; // < 1 hour
  isCritical: boolean; // < 15 minutes
}

export function CountdownTimer({
  expiresAt,
  onExpire,
  className = '',
  showIcon = true,
  compact = false
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isExpired: false,
    isUrgent: false,
    isCritical: false,
  });
  const [mounted, setMounted] = useState(false);

  // Calculate time remaining
  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;

    if (diff <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isExpired: true,
        isUrgent: false,
        isCritical: false,
      };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const totalMinutes = Math.floor(diff / (1000 * 60));

    return {
      hours,
      minutes,
      seconds,
      total: diff,
      isExpired: false,
      isUrgent: totalMinutes < 60, // Less than 1 hour
      isCritical: totalMinutes < 15, // Less than 15 minutes
    };
  };

  // Mount check for hydration
  useEffect(() => {
    setMounted(true);
    setTimeRemaining(calculateTimeRemaining());
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Call onExpire callback when timer expires
      if (remaining.isExpired && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted, expiresAt, onExpire]);

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {showIcon && <Clock className="w-4 h-4 text-gray-400" />}
        <span className="text-sm font-bold text-gray-400">Loading...</span>
      </div>
    );
  }

  // Expired state
  if (timeRemaining.isExpired) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {showIcon && <Clock className="w-4 h-4 text-red-600" />}
        <span className="text-sm font-bold text-red-600">EXPIRED</span>
      </div>
    );
  }

  // Format display based on time remaining
  const getTimeDisplay = () => {
    const { hours, minutes, seconds } = timeRemaining;

    if (compact) {
      // Compact format: "2h 45m" or "45m 23s" or "23s"
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    } else {
      // Full format: "02:45:23" or "45:23" or "0:23"
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Determine color based on urgency
  const getColorClasses = () => {
    if (timeRemaining.isCritical) {
      return 'text-red-600 animate-pulse';
    }
    if (timeRemaining.isUrgent) {
      return 'text-orange-600';
    }
    return 'text-blue-600';
  };

  const getIconColorClasses = () => {
    if (timeRemaining.isCritical) {
      return 'text-red-600 animate-pulse';
    }
    if (timeRemaining.isUrgent) {
      return 'text-orange-600';
    }
    return 'text-blue-600';
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {showIcon && (
        <Clock
          className={`w-4 h-4 ${getIconColorClasses()}`}
          style={{
            animation: timeRemaining.isCritical ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }}
        />
      )}
      <span className={`text-sm font-bold tabular-nums ${getColorClasses()}`}>
        {getTimeDisplay()}
      </span>
    </div>
  );
}
