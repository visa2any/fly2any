'use client';

import Link from 'next/link';
import { trackWorldCupCTA } from '@/lib/analytics/google-analytics';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface EnhancedCTAProps {
  href: string;
  type: 'flight' | 'hotel' | 'package' | 'tickets';
  location: string;
  itemName?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  showSavings?: boolean;
  savingsAmount?: string;
  urgency?: string;
}

export function EnhancedCTA({
  href,
  type,
  location,
  itemName,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  showSavings = false,
  savingsAmount,
  urgency,
}: EnhancedCTAProps) {
  const handleClick = () => {
    trackWorldCupCTA(type, location, itemName);
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50',
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <Link
        href={href}
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          font-bold rounded-lg
          transform hover:scale-105
          transition-all duration-300
          flex items-center justify-center gap-2
          ${className}
        `}
      >
        {showSavings && (
          <SparklesIcon className="w-5 h-5" />
        )}
        {children}
      </Link>

      {/* Value Proposition Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {showSavings && savingsAmount && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
            Save {savingsAmount}
          </span>
        )}
        {urgency && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold animate-pulse">
            {urgency}
          </span>
        )}
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
          ✓ Free Cancellation
        </span>
      </div>
    </div>
  );
}
