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
 * WCAG compliant with min 44px touch target.
 *
 * Features:
 * - Show only on mobile (<md breakpoint)
 * - Smooth animation between hamburger and X states
 * - Accessible with proper aria labels
 * - WCAG 2.1 Level AA compliant (44x44px minimum)
 */
export function HamburgerMenu({ isOpen, onClick, className = '' }: HamburgerMenuProps) {
  return (
    <button
      onClick={onClick}
      className={`md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-drawer"
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        {/* Top line */}
        <motion.span
          className="block w-6 h-0.5 bg-gray-700 rounded-full"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 8 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
        />

        {/* Middle line */}
        <motion.span
          className="block w-6 h-0.5 bg-gray-700 rounded-full my-1.5"
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -10 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
        />

        {/* Bottom line */}
        <motion.span
          className="block w-6 h-0.5 bg-gray-700 rounded-full"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -8 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
        />
      </div>
    </button>
  );
}
