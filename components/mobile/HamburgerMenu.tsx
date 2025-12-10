'use client';

import { motion } from 'framer-motion';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Hamburger Menu Button
 *
 * Animated hamburger icon that transforms to X when open.
 * WCAG compliant with 48px touch target.
 *
 * Features:
 * - Show only on mobile (<lg breakpoint)
 * - Smooth animation between hamburger and X states
 * - Accessible with proper aria labels
 * - WCAG 2.1 Level AAA compliant (48x48px minimum)
 * - Active state with scale animation for tactile feedback
 */
export function HamburgerMenu({ isOpen, onClick, className = '' }: HamburgerMenuProps) {
  return (
    <button
      onClick={onClick}
      className={`lg:hidden flex items-center justify-center min-w-[48px] min-h-[48px] rounded-xl border-2 border-transparent hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 touch-manipulation ${className}`}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-drawer"
    >
      <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
        <motion.span
          className="block w-5 h-0.5 bg-neutral-700 rounded-full"
          animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
        <motion.span
          className="block w-5 h-0.5 bg-neutral-700 rounded-full"
          animate={{ opacity: isOpen ? 0 : 1, x: isOpen ? -10 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
        <motion.span
          className="block w-5 h-0.5 bg-neutral-700 rounded-full"
          animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
      </div>
    </button>
  );
}
