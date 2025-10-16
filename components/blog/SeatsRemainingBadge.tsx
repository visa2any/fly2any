'use client';

import { useMemo } from 'react';

interface SeatsRemainingBadgeProps {
  seatsLeft: number;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export default function SeatsRemainingBadge({
  seatsLeft,
  urgencyLevel
}: SeatsRemainingBadgeProps) {
  // Auto-calculate urgency level if not provided
  const level = urgencyLevel || (() => {
    if (seatsLeft < 5) return 'critical';
    if (seatsLeft <= 10) return 'high';
    if (seatsLeft <= 20) return 'medium';
    return 'low';
  })();

  const config = useMemo(() => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          icon: '⚠️',
          message: `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left!`,
          pulse: true,
          progressColor: 'bg-red-300',
        };
      case 'high':
        return {
          bg: 'bg-orange-500',
          text: 'text-white',
          icon: '🔥',
          message: `${seatsLeft} seats remaining`,
          pulse: false,
          progressColor: 'bg-orange-300',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-400',
          text: 'text-gray-900',
          icon: '⏰',
          message: `${seatsLeft} seats available`,
          pulse: false,
          progressColor: 'bg-yellow-200',
        };
      case 'low':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: '✅',
          message: `${seatsLeft}+ seats available`,
          pulse: false,
          progressColor: 'bg-green-300',
        };
    }
  }, [level, seatsLeft]);

  // Calculate progress percentage (inverse - higher seats = more full bar for visual appeal)
  const progressPercentage = Math.min(100, (seatsLeft / 50) * 100);

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${config.bg} ${config.text} ${config.pulse ? 'animate-pulse-glow' : ''} shadow-md font-semibold`}>
        <span className="text-xl">{config.icon}</span>
        <span className="text-sm md:text-base">{config.message}</span>
      </div>

      {/* Progress bar showing capacity */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${config.progressColor} transition-all duration-500 ease-out`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {level === 'critical' && (
        <p className="text-xs text-red-600 font-medium animate-pulse">
          Book now - these seats are going fast!
        </p>
      )}
    </div>
  );
}
