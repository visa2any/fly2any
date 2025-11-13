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
        // Only sticky on desktop, not on mobile
        sticky && 'md:sticky md:top-20',
        className
      )}
      style={{
        zIndex: zIndex.TRUST_BAR,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(12px) saturate(180%)', // Firefox, Safari, modern browsers
        WebkitBackdropFilter: 'blur(12px) saturate(180%)', // Older WebKit
      }}
    >
      {/* Single-line container with horizontal scroll - GUARANTEED no wrapping */}
      <div
        className="flex items-center justify-start gap-2 sm:gap-3 md:gap-5 h-8 sm:h-9 md:h-11 px-2 sm:px-2.5 md:px-4 overflow-x-auto scrollbar-hide"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {trustItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-0.5 sm:gap-1 text-gray-700 flex-shrink-0"
            >
              <Icon
                className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4', item.color)}
                strokeWidth={2.5}
              />
              <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold whitespace-nowrap leading-none tracking-tight">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
