/**
 * Mobile Animation Utilities
 * Optimized animations for mobile devices with performance considerations
 */

import { Variants, Transition } from 'framer-motion';

// Spring configurations optimized for mobile
export const springConfigs = {
  gentle: {
    type: 'spring',
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  wobbly: {
    type: 'spring',
    damping: 10,
    stiffness: 100,
    mass: 1,
  },
  stiff: {
    type: 'spring',
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  slow: {
    type: 'spring',
    damping: 40,
    stiffness: 60,
    mass: 1,
  },
  molasses: {
    type: 'spring',
    damping: 40,
    stiffness: 30,
    mass: 1,
  }
} as const;

// Fade in up animation
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...springConfigs.gentle,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      ...springConfigs.gentle,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: {
      duration: 0.2,
    },
  },
};

// Slide in from right
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      ...springConfigs.gentle,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: {
      duration: 0.2,
    },
  },
};

// Bounce in animation
export const bounceIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      ...springConfigs.wobbly,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

// Stagger container for list animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Stagger item for use with stagger container
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...springConfigs.gentle,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// Scale in animation
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      ...springConfigs.gentle,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

// Rotate in animation
export const rotateIn: Variants = {
  initial: {
    opacity: 0,
    rotate: -10,
  },
  animate: {
    opacity: 1,
    rotate: 0,
    transition: {
      ...springConfigs.gentle,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    rotate: 10,
    transition: {
      duration: 0.2,
    },
  },
};

// Animation utilities interface
export interface AnimationUtils {
  fadeInUp: Variants;
  slideInLeft: Variants;
  slideInRight: Variants;
  bounceIn: Variants;
  scaleIn: Variants;
  rotateIn: Variants;
  staggerContainer: Variants;
  staggerItem: Variants;
}

// Export all animations as a collection
export const AnimationUtils: AnimationUtils = {
  fadeInUp,
  slideInLeft,
  slideInRight,
  bounceIn,
  scaleIn,
  rotateIn,
  staggerContainer,
  staggerItem,
};

// Mobile-specific animation configurations
export const mobileAnimations = {
  // Reduced motion for battery optimization
  reduced: {
    transition: { duration: 0.1 },
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Page transitions optimized for mobile
  pageTransition: {
    initial: { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: {
        type: 'tween',
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  },
  
  // Modal animations for mobile
  modalMobile: {
    initial: { opacity: 0, y: '100%' },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
      },
    },
    exit: { 
      opacity: 0, 
      y: '100%',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
  },
};

// Performance utilities
export const useReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get animation based on device performance
export const getOptimizedAnimation = (
  standardAnimation: Variants,
  reducedAnimation?: Variants
): Variants => {
  const shouldUseReduced = useReducedMotion();
  
  if (shouldUseReduced && reducedAnimation) {
    return reducedAnimation;
  }
  
  if (shouldUseReduced) {
    return mobileAnimations.reduced;
  }
  
  return standardAnimation;
};