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
    text: 'Free Cancel 24h',
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
        'border-b border-neutral-200/60',
        // Level-6: Compact spacing, no unnecessary gaps
        // Sticky only on mobile, static on desktop to avoid dropdown overlap
        sticky && 'sticky top-0 md:static md:top-auto',
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
        className="flex items-center justify-start md:justify-center gap-4 md:gap-8 min-h-[44px] py-2.5 px-4 md:px-6 overflow-x-auto scrollbar-hide"
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
              className="flex items-center gap-2 text-neutral-800 flex-shrink-0"
            >
              <Icon
                className={cn('w-[18px] h-[18px] md:w-5 md:h-5', item.color)}
                strokeWidth={2}
              />
              {/* Level-6: 12px mobile, 13px desktop - Apple standard */}
              <span className="text-xs md:text-[13px] font-semibold whitespace-nowrap leading-none tracking-[0.01em]">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
