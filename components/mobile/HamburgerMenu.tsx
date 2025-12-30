'use client';

import { motion } from 'framer-motion';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  /** Whether the header is in scrolled state (affects colors on dark hero) */
  scrolled?: boolean;
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
export function HamburgerMenu({ isOpen, onClick, className = '', scrolled = true }: HamburgerMenuProps) {
  // Bar color: white on dark hero (not scrolled), neutral on scrolled
  const barColor = scrolled ? 'bg-neutral-700' : 'bg-white';

  return (
    <button
      onClick={onClick}
      className={`lg:hidden flex items-center justify-center min-w-[48px] min-h-[48px] rounded-xl border-2 border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 touch-manipulation active:scale-95 ${
        scrolled
          ? 'hover:border-neutral-200 hover:bg-neutral-50'
          : 'hover:border-white/20 hover:bg-white/10'
      } ${className}`}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-drawer"
    >
      <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
        <motion.span
          className={`block w-5 h-0.5 ${barColor} rounded-full transition-colors duration-200`}
          animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
        <motion.span
          className={`block w-5 h-0.5 ${barColor} rounded-full transition-colors duration-200`}
          animate={{ opacity: isOpen ? 0 : 1, x: isOpen ? -10 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
        <motion.span
          className={`block w-5 h-0.5 ${barColor} rounded-full transition-colors duration-200`}
          animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
      </div>
    </button>
  );
}
