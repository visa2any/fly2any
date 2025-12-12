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

// Level-6: Official Fly2Any colors
const trustItems: TrustItem[] = [
  {
    icon: Shield,
    text: 'Best Price Guarantee',
    color: 'text-success-600'
  },
  {
    icon: Headphones,
    text: '24/7 Support',
    color: 'text-primary-500'
  },
  {
    icon: Lock,
    text: 'Secure Booking',
    color: 'text-info-600'
  },
  {
    icon: Gift,
    text: 'Free Cancellation',
    color: 'text-secondary-600'
  },
];

export function CompactTrustBar({
  sticky = true,
  className
}: CompactTrustBarProps) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden bg-white/98 backdrop-blur-xl',
        'border-b border-neutral-200/80',
        // Only sticky on desktop
        sticky && 'md:sticky md:top-20',
        className
      )}
      style={{
        zIndex: zIndex.TRUST_BAR,
        // Level-6 multi-layer shadow
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
    >
      {/* Level-6: 44px minimum height, 8pt grid spacing */}
      <div
        className="flex items-center justify-start md:justify-center gap-3 md:gap-6 min-h-[44px] px-4 md:px-6 overflow-x-auto scrollbar-hide"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {trustItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 md:gap-2 text-neutral-700 flex-shrink-0"
            >
              <Icon
                className={cn('w-4 h-4 md:w-[18px] md:h-[18px]', item.color)}
                strokeWidth={2.25}
              />
              {/* Level-6: 12px caption, positive tracking */}
              <span className="text-[11px] md:text-xs font-semibold whitespace-nowrap leading-none tracking-[0.005em]">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
