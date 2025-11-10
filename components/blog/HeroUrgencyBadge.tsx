'use client';

import { Eye, AlertCircle, TrendingDown } from 'lucide-react';

interface HeroUrgencyBadgeProps {
  type: 'viewing' | 'seats' | 'price_drop';
  count: number;
}

export function HeroUrgencyBadge({ type, count }: HeroUrgencyBadgeProps) {
  const config = {
    viewing: {
      icon: Eye,
      label: `${count} people viewing now`,
      color: 'bg-blue-500/90',
    },
    seats: {
      icon: AlertCircle,
      label: `Only ${count} seats left`,
      color: 'bg-red-500/90',
    },
    price_drop: {
      icon: TrendingDown,
      label: `${count}% price drop`,
      color: 'bg-green-500/90',
    },
  };

  const { icon: Icon, label, color } = config[type];

  return (
    <div className={`
      ${color}
      backdrop-blur-md
      border border-white/20
      rounded-full
      px-4 py-2
      text-white text-sm font-semibold
      flex items-center gap-2
      shadow-lg
      animate-pulse
    `}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
}
