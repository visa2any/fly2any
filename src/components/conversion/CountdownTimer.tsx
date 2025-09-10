'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';

interface CountdownTimerProps {
  endTime?: Date;
  theme?: 'urgent' | 'premium' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showProgressBar?: boolean;
  onExpire?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime = new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: 24 hours from now
  theme = 'urgent',
  size = 'md',
  showProgressBar = true,
  onExpire,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [totalDuration] = useState(endTime.getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = endTime.getTime() - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'urgent':
        return 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white border-red-400 shadow-red-500/25';
      case 'premium':
        return 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border-purple-400 shadow-purple-500/25';
      case 'minimal':
        return 'bg-gray-100 text-gray-800 border-gray-300 shadow-gray-500/10';
      default:
        return 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white border-red-400 shadow-red-500/25';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm p-3';
      case 'md':
        return 'text-base p-4';
      case 'lg':
        return 'text-lg p-6';
      default:
        return 'text-base p-4';
    }
  };

  const getProgressPercentage = () => {
    const elapsed = totalDuration - (endTime.getTime() - Date.now());
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  if (isExpired) {
    return (
      <div className={`rounded-lg border-2 ${getThemeClasses()} ${getSizeClasses()} ${className} text-center opacity-75`}>
        <div className="flex items-center justify-center gap-2 font-bold text-lg">
          <Clock className="w-5 h-5" />
          <span>🔥 OFERTA EXPIROU! 🔥</span>
        </div>
        <p className="mt-2 text-sm opacity-90">Novas ofertas disponíveis em breve...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 shadow-lg ${getThemeClasses()} ${getSizeClasses()} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Flame className={`animate-pulse ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
        <span className="font-bold uppercase tracking-wide">
          ⏰ OFERTA TERMINA EM:
        </span>
        <Flame className={`animate-pulse ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
      </div>

      {/* Timer Display */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <div className={`font-bold ${size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl'} tabular-nums`}>
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <div className={`text-xs opacity-90 uppercase ${size === 'lg' ? 'text-sm' : ''}`}>Dias</div>
        </div>
        <div className="text-center">
          <div className={`font-bold ${size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl'} tabular-nums`}>
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className={`text-xs opacity-90 uppercase ${size === 'lg' ? 'text-sm' : ''}`}>Horas</div>
        </div>
        <div className="text-center">
          <div className={`font-bold ${size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl'} tabular-nums`}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className={`text-xs opacity-90 uppercase ${size === 'lg' ? 'text-sm' : ''}`}>Min</div>
        </div>
        <div className="text-center">
          <div className={`font-bold ${size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl'} tabular-nums animate-pulse`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className={`text-xs opacity-90 uppercase ${size === 'lg' ? 'text-sm' : ''}`}>Seg</div>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgressBar && (
        <div className="mt-3">
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="text-center text-xs mt-1 opacity-90">
            {Math.round(100 - getProgressPercentage())}% da oferta restante
          </div>
        </div>
      )}

      {/* Urgency Message */}
      <div className="text-center mt-3 text-sm font-semibold">
        ⚡ ÚLTIMAS HORAS! ⚡
        <br />
        <span className="text-xs opacity-90">Não perca essa oportunidade única!</span>
      </div>
    </div>
  );
};