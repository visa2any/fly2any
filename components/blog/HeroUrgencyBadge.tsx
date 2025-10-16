'use client';

import { useEffect, useState } from 'react';
import { Flame, AlertTriangle, TrendingDown, Eye, Users } from 'lucide-react';

type UrgencyType = 'viewing' | 'seats' | 'price_drop' | 'trending' | 'limited';

interface HeroUrgencyBadgeProps {
  type: UrgencyType;
  count?: number;
  text?: string;
  className?: string;
  animated?: boolean;
}

export function HeroUrgencyBadge({
  type,
  count,
  text,
  className = '',
  animated = true,
}: HeroUrgencyBadgeProps) {
  const [displayCount, setDisplayCount] = useState(count || 0);

  // Simulate live viewing count changes
  useEffect(() => {
    if (type === 'viewing' && animated) {
      const interval = setInterval(() => {
        setDisplayCount(prev => {
          const change = Math.floor(Math.random() * 10) - 4;
          const newCount = Math.max(50, Math.min(500, prev + change));
          return newCount;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [type, animated]);

  const badgeConfig = {
    viewing: {
      icon: <Eye className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      text: `${displayCount} people viewing this deal right now`,
      pulse: true,
    },
    seats: {
      icon: <AlertTriangle className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-red-500 to-orange-500',
      text: `Only ${count || 3} seats left at this price`,
      pulse: true,
    },
    price_drop: {
      icon: <TrendingDown className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      text: text || `Price dropped $${count || 50} in last hour`,
      pulse: false,
    },
    trending: {
      icon: <Flame className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
      text: 'Trending destination',
      pulse: true,
    },
    limited: {
      icon: <Users className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      text: `${count || 24} deals available`,
      pulse: false,
    },
  };

  const config = badgeConfig[type];

  return (
    <div
      className={`
        inline-flex items-center gap-2
        ${config.bgColor}
        text-white
        px-4 py-2 rounded-full
        font-semibold text-sm
        shadow-lg
        ${config.pulse ? 'animate-pulse-subtle' : ''}
        ${className}
      `}
      style={{
        animation: animated ? 'slideIn 0.5s ease-out, ' + (config.pulse ? 'pulseGlow 2s ease-in-out infinite' : '') : 'none'
      }}
    >
      <span className="flex-shrink-0">{config.icon}</span>
      <span className="whitespace-nowrap">{config.text}</span>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
          }
        }
      `}</style>
    </div>
  );
}
