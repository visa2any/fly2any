'use client';

import { SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilterButtonProps {
  onClick: () => void;
  activeFilterCount: number;
  label?: string;
}

/**
 * FilterButton - Floating action button for mobile filter access
 *
 * Features:
 * - Fixed positioning at bottom-right
 * - Badge showing active filter count
 * - WCAG compliant touch target (44x44px minimum)
 * - Gradient design matching primary theme
 * - Animated badge for visibility
 * - Accessible labels and aria attributes
 */
export function FilterButton({
  onClick,
  activeFilterCount,
  label = 'Filters',
}: FilterButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed right-4 z-40 flex items-center gap-2 min-w-[44px] min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-full shadow-2xl hover:shadow-3xl active:scale-95 transition-all"
      style={{
        // Position above bottom nav + ScrollToTop button (56px nav + 16px gap + 44px button + 12px gap)
        bottom: 'calc(var(--bottom-nav-total, 56px) + 76px)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Open filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
    >
      {/* Icon */}
      <div className="relative">
        <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />

        {/* Badge - Active Filter Count */}
        {activeFilterCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white"
            aria-hidden="true"
          >
            {activeFilterCount}
          </motion.span>
        )}
      </div>

      {/* Label */}
      <span className="text-sm font-semibold">{label}</span>
    </motion.button>
  );
}
