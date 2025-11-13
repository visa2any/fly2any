'use client';

import { Shield, Headphones, Lock, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/design-system';

interface TrustItem {
  icon: typeof Shield;
  text: string;
  color: string;
}

interface CompactTrustBarProps {
  sticky?: boolean;
  className?: string;
}

const trustItems: TrustItem[] = [
  {
    icon: Shield,
    text: 'Best Price Guarantee',
    color: 'text-green-600'
  },
  {
    icon: Headphones,
    text: '24/7 Support',
    color: 'text-blue-600'
  },
  {
    icon: Lock,
    text: 'Secure Booking',
    color: 'text-purple-600'
  },
  {
    icon: Gift,
    text: 'Free Cancellation',
    color: 'text-orange-600'
  },
];

export function CompactTrustBar({
  sticky = true,
  className
}: CompactTrustBarProps) {
  return (
    <div
      className={cn(
        'left-0 right-0 bg-white/98 backdrop-blur-xl',
        'border-b border-gray-200',
        sticky && 'sticky top-16 md:top-20',
        className
      )}
      style={{
        zIndex: zIndex.TRUST_BAR,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 h-9 sm:h-10 md:h-12 px-2.5 sm:px-3 md:px-4 overflow-x-auto scrollbar-hide">
        {trustItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-1 sm:gap-1.5 text-gray-700 flex-shrink-0"
            >
              <Icon
                className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', item.color)}
                strokeWidth={2.5}
              />
              <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap leading-tight">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
