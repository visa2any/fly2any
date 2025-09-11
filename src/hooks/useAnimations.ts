'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimationUtils, springConfigs } from '@/lib/mobile/animation-utils';

// Dynamic framer-motion imports to prevent webpack build errors
let useAnimation: any;
let useInView: any;

// Load framer-motion hooks dynamically
const loadFramerMotionHooks = async () => {
  if (!useAnimation) {
    const framerMotion = await import('framer-motion');
    useAnimation = framerMotion.useAnimation;
    useInView = framerMotion.useInView;
  }
  return { useAnimation, useInView };
};

// Hook for scroll-triggered animations
export function useScrollAnimation(threshold: number = 0.3) {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    loadFramerMotionHooks().then(() => {
      if (useInView && useAnimation) {
        const inView = useInView(ref, { 
          once: true, 
          margin: `${-((1 - threshold) * 100)}%` 
        });
        const animationControls = useAnimation();
        setIsInView(inView);
        setControls(animationControls);
      }
    });
  }, [threshold]);

  useEffect(() => {
    if (isInView && controls) {
      controls.start('animate');
    }
  }, [isInView, controls]);

  return { ref, controls: controls || { start: () => {} }, isInView };
}

// Hook for staggered list animations
export function useStaggeredAnimation(itemCount: number, delay: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    loadFramerMotionHooks().then(() => {
      if (useAnimation) {
        setControls(useAnimation());
      }
    });
  }, []);

  const startAnimation = () => {
    setIsVisible(true);
    if (controls) {
      controls.start('animate');
    }
  };

  // Fix: AnimationUtils is a type-only import, use direct animation config
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: delay || 0.1,
        delayChildren: 0.1
      }
    }
  };

  return {
    controls: controls || { start: () => {} },
    containerVariants,
    startAnimation,
    isVisible,
  };
}

// Hook for touch animations
export function useTouchAnimation() {
  const [isPressed, setIsPressed] = useState(false);
  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    loadFramerMotionHooks().then(() => {
      if (useAnimation) {
        setControls(useAnimation());
      }
    });
  }, []);

  const handleTouchStart = () => {
    setIsPressed(true);
    controls.start('pressed');
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    controls.start('released');
  };

  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleTouchStart,
    onMouseUp: handleTouchEnd,
    onMouseLeave: handleTouchEnd,
  };

  return {
    controls,
    isPressed,
    touchHandlers,
  };
}

// Hook for loading animations
export function useLoadingAnimation(isLoading: boolean) {
  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    loadFramerMotionHooks().then(() => {
      if (useAnimation) {
        setControls(useAnimation());
      }
    });
  }, []);

  useEffect(() => {
    if (controls) {
      if (isLoading) {
        controls.start('animate');
      } else {
        controls.stop();
      }
    }
  }, [isLoading, controls]);

  return controls || { start: () => {}, stop: () => {} };
}

// Hook for success/error animations
export function useStatusAnimation() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    loadFramerMotionHooks().then(() => {
      if (useAnimation) {
        setControls(useAnimation());
      }
    });
  }, []);

  const showSuccess = () => {
    setStatus('success');
    if (controls) {
      controls.start('animate');
    }
  };

  const showError = () => {
    setStatus('error');
    if (controls) {
      controls.start('animate');
    }
  };

  const showLoading = () => {
    setStatus('loading');
    if (controls) {
      controls.start('animate');
    }
  };

  const reset = () => {
    setStatus('idle');
    if (controls) {
      controls.stop();
    }
  };

  return {
    status,
    controls: controls || { start: () => {}, stop: () => {} },
    showSuccess,
    showError,
    showLoading,
    reset,
  };
}

// Hook for parallax effects
export function useParallaxAnimation(speed: number = 0.5) {
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        setScrollY(scrollProgress * 100 * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, scrollY };
}

// Hook for magnetic hover effect
export function useMagneticHover(strength: number = 0.2) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setMousePosition({
          x: (e.clientX - centerX) * strength,
          y: (e.clientY - centerY) * strength,
        });
      }
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [strength]);

  return { ref, mousePosition };
}

// Hook for typewriter effect
export function useTypewriterAnimation(text: string, speed: number = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isComplete };
}

// Hook for page transitions
export function usePageTransition() {
  const [isExiting, setIsExiting] = useState(false);
  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    loadFramerMotionHooks().then(() => {
      if (useAnimation) {
        setControls(useAnimation());
      }
    });
  }, []);

  const exitPage = async (callback?: () => void) => {
    setIsExiting(true);
    if (controls) {
      await controls.start('exit');
    }
    callback?.();
  };

  const enterPage = async (): Promise<void> => {
    setIsExiting(false);
    if (controls) {
      await controls.start('animate');
    }
  };

  return {
    controls: controls || { start: () => Promise.resolve() },
    isExiting,
    exitPage,
    enterPage,
  };
}

// Hook for gesture-based animations
export function useGestureAnimation() {
  const [gesture, setGesture] = useState<'idle' | 'swipe-left' | 'swipe-right' | 'pinch'>('idle');
  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    loadFramerMotionHooks().then(() => {
      if (useAnimation) {
        setControls(useAnimation());
      }
    });
  }, []);

  const handleSwipeLeft = () => {
    setGesture('swipe-left');
    if (controls) {
      controls.start({
        x: -100,
        opacity: 0.5,
        transition: { duration: 0.3 },
      });
    }
  };

  const handleSwipeRight = () => {
    setGesture('swipe-right');
    if (controls) {
      controls.start({
        x: 100,
        opacity: 0.5,
        transition: { duration: 0.3 },
      });
    }
  };

  const handlePinch = (scale: number) => {
    setGesture('pinch');
    if (controls) {
      controls.start({
        scale,
        transition: { duration: 0.1 },
      });
    }
  };

  const resetGesture = () => {
    setGesture('idle');
    if (controls) {
      controls.start({
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { type: "spring", damping: 15, stiffness: 300 },
      });
    }
  };

  return {
    gesture,
    controls: controls || { start: () => {} },
    handleSwipeLeft,
    handleSwipeRight,
    handlePinch,
    resetGesture,
  };
}

// Hook for performance-optimized animations
export function useOptimizedAnimations() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    // Check for low performance devices
    if (typeof window !== 'undefined' && 'navigator' in window) {
      const connection = (navigator as any).connection;
      if (connection) {
        const isSlowConnection = connection.effectiveType === '2g' || connection.effectiveType === '3g';
        const isLowEndDevice = navigator.hardwareConcurrency <= 2;
        setIsLowPerformance(isSlowConnection || isLowEndDevice);
      }
    }
  }, []);

  const shouldAnimate = !prefersReducedMotion && !isLowPerformance;

  const getOptimizedConfig = (config: any) => {
    if (!shouldAnimate) {
      return { ...config, duration: 0 };
    }
    return config;
  };

  return {
    shouldAnimate,
    prefersReducedMotion,
    isLowPerformance,
    getOptimizedConfig,
  };
}

export default {
  useScrollAnimation,
  useStaggeredAnimation,
  useTouchAnimation,
  useLoadingAnimation,
  useStatusAnimation,
  useParallaxAnimation,
  useMagneticHover,
  useTypewriterAnimation,
  usePageTransition,
  useGestureAnimation,
  useOptimizedAnimations,
};