'use client';

import { Variants, Transition } from 'framer-motion';

// Spring physics configurations
export const springConfigs = {
  gentle: {
    type: "spring" as const,
    stiffness: 120,
    damping: 20,
    mass: 1,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 20,
    mass: 0.8,
  },
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  },
  wobbly: {
    type: "spring" as const,
    stiffness: 180,
    damping: 12,
    mass: 1.2,
  },
  elastic: {
    type: "spring" as const,
    stiffness: 300,
    damping: 15,
    mass: 1,
    velocity: 2,
  },
};

// Easing functions
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  anticipate: [0.175, 0.885, 0.32, 1.275],
} as const;

// Common animation variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springConfigs.gentle,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springConfigs.gentle,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: springConfigs.gentle,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: springConfigs.gentle,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springConfigs.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
};

export const slideInFromBottom: Variants = {
  initial: {
    y: '100%',
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: springConfigs.gentle,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.3, ease: easings.easeIn },
  },
};

export const slideInFromTop: Variants = {
  initial: {
    y: '-100%',
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: springConfigs.gentle,
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: { duration: 0.3, ease: easings.easeIn },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springConfigs.gentle,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

// Touch interaction animations
export const touchPress: Variants = {
  initial: { scale: 1 },
  pressed: { 
    scale: 0.95,
    transition: { duration: 0.1 },
  },
  released: { 
    scale: 1,
    transition: springConfigs.elastic,
  },
};

export const touchRipple: Variants = {
  initial: {
    scale: 0,
    opacity: 0.3,
  },
  animate: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Loading animations
export const loadingDots: Variants = {
  initial: {
    opacity: 0.5,
    scale: 0.8,
  },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [0.8, 1, 0.8],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const loadingPulse: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Success/Error animations
export const successCheckmark: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: 0.2, duration: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.1 },
    },
  },
};

export const errorX: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.1 },
    },
  },
};

// Utility functions
export class AnimationUtils {
  // Create staggered animation for list items
  static createStaggeredList(itemCount: number, delay: number = 0.1): Variants {
    return {
      initial: {},
      animate: {
        transition: {
          staggerChildren: delay,
          delayChildren: 0.2,
        },
      },
    };
  }

  // Create morphing animation between shapes
  static createMorphAnimation(
    fromPath: string,
    toPath: string,
    duration: number = 0.5
  ): Variants {
    return {
      initial: { d: fromPath },
      animate: {
        d: toPath,
        transition: { duration, ease: "easeInOut" },
      },
    };
  }

  // Create parallax scroll effect
  static createParallaxEffect(speed: number = 0.5): Variants {
    return {
      animate: (scrollY: number) => ({
        y: scrollY * speed,
        transition: { type: "tween", ease: "linear", duration: 0 },
      }),
    };
  }

  // Create magnetic hover effect
  static createMagneticHover(strength: number = 0.2): Variants {
    return {
      hover: (mousePosition: { x: number; y: number }) => ({
        x: mousePosition.x * strength,
        y: mousePosition.y * strength,
        transition: springConfigs.elastic,
      }),
      initial: {
        x: 0,
        y: 0,
      },
    };
  }

  // Create wave animation
  static createWaveAnimation(amplitude: number = 10, frequency: number = 2): Variants {
    return {
      animate: {
        y: [0, amplitude, 0, -amplitude, 0],
        transition: {
          duration: frequency,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    };
  }

  // Create breathing animation
  static createBreathingAnimation(scale: number = 1.05): Variants {
    return {
      animate: {
        scale: [1, scale, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    };
  }

  // Create typewriter effect
  static createTypewriterAnimation(text: string, speed: number = 0.05): Variants {
    const characters = text.split('');
    
    return {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          staggerChildren: speed,
          delayChildren: 0.2,
        },
      },
    };
  }

  // Create page transition
  static createPageTransition(direction: 'left' | 'right' | 'up' | 'down' = 'right'): Variants {
    const variants = {
      left: { x: '-100%' },
      right: { x: '100%' },
      up: { y: '-100%' },
      down: { y: '100%' },
    };

    return {
      initial: variants[direction],
      animate: {
        x: 0,
        y: 0,
        transition: springConfigs.gentle,
      },
      exit: variants[direction],
    };
  }

  // Create floating animation
  static createFloatingAnimation(): Variants {
    return {
      animate: {
        y: [-5, 5, -5],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    };
  }

  // Create shake animation
  static createShakeAnimation(): Variants {
    return {
      shake: {
        x: [0, -10, 10, -10, 10, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      },
    };
  }

  // Create wobble animation
  static createWobbleAnimation(): Variants {
    return {
      wobble: {
        rotate: [0, -5, 5, -5, 5, 0],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
        },
      },
    };
  }
}

// Performance-optimized animation hook
export function useOptimizedAnimation(enabled: boolean = true) {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const shouldAnimate = enabled && !prefersReducedMotion;

  const optimizedVariants = (variants: Variants): Variants => {
    if (!shouldAnimate) {
      // Return static variants that skip animations
      return Object.keys(variants).reduce((acc, key) => {
        acc[key] = typeof variants[key] === 'object' 
          ? { ...variants[key], transition: { duration: 0 } }
          : variants[key];
        return acc;
      }, {} as Variants);
    }
    
    return variants;
  };

  return {
    shouldAnimate,
    optimizedVariants,
    springConfig: shouldAnimate ? springConfigs.gentle : { duration: 0 },
  };
}

export default AnimationUtils;