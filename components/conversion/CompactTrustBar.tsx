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
  { icon: Shield, text: 'Best Price', color: 'text-success-600' },
  { icon: Headphones, text: '24/7 Support', color: 'text-primary-500' },
  { icon: Lock, text: 'Secure', color: 'text-info-600' },
  { icon: Gift, text: 'Free Cancel', color: 'text-secondary-600' },
];

export function CompactTrustBar({ sticky = true, className }: CompactTrustBarProps) {
  return (
    <div
      className={cn(
        'w-full bg-white/98 backdrop-blur-xl border-b border-neutral-200/60',
        sticky && 'sticky top-0 md:static md:top-auto',
        className
      )}
      style={{
        zIndex: zIndex.TRUST_BAR,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
    >
      {/* Level-6: Compact fit on mobile, centered on desktop */}
      <div className="flex items-center justify-between md:justify-center gap-2 md:gap-8 min-h-[40px] md:min-h-[44px] py-2 md:py-3 px-3 md:px-6">
        {trustItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-1 md:gap-2 text-neutral-800">
              <Icon className={cn('w-3.5 h-3.5 md:w-5 md:h-5', item.color)} strokeWidth={2} />
              <span className="text-[10px] md:text-[13px] font-semibold whitespace-nowrap leading-none">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
