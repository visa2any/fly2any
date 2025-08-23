'use client';

import { useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { AnimationUtils, springConfigs } from '@/lib/mobile/animation-utils';

// Hook for scroll-triggered animations
export function useScrollAnimation(threshold: number = 0.3) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: `${-((1 - threshold) * 100)}%` 
  });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('animate');
    }
  }, [isInView, controls]);

  return { ref, controls, isInView };
}

// Hook for staggered list animations
export function useStaggeredAnimation(itemCount: number, delay: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();

  const startAnimation = () => {
    setIsVisible(true);
    controls.start('animate');
  };

  const containerVariants = AnimationUtils.createStaggeredList(itemCount, delay);

  return {
    controls,
    containerVariants,
    startAnimation,
    isVisible,
  };
}

// Hook for touch animations
export function useTouchAnimation() {
  const [isPressed, setIsPressed] = useState(false);
  const controls = useAnimation();

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
  const controls = useAnimation();

  useEffect(() => {
    if (isLoading) {
      controls.start('animate');
    } else {
      controls.stop();
    }
  }, [isLoading, controls]);

  return controls;
}

// Hook for success/error animations
export function useStatusAnimation() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const controls = useAnimation();

  const showSuccess = () => {
    setStatus('success');
    controls.start('animate');
  };

  const showError = () => {
    setStatus('error');
    controls.start('animate');
  };

  const showLoading = () => {
    setStatus('loading');
    controls.start('animate');
  };

  const reset = () => {
    setStatus('idle');
    controls.stop();
  };

  return {
    status,
    controls,
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
  const controls = useAnimation();

  const exitPage = async (callback?: () => void) => {
    setIsExiting(true);
    await controls.start('exit');
    callback?.();
  };

  const enterPage = async () => {
    setIsExiting(false);
    await controls.start('animate');
  };

  return {
    controls,
    isExiting,
    exitPage,
    enterPage,
  };
}

// Hook for gesture-based animations
export function useGestureAnimation() {
  const [gesture, setGesture] = useState<'idle' | 'swipe-left' | 'swipe-right' | 'pinch'>('idle');
  const controls = useAnimation();

  const handleSwipeLeft = () => {
    setGesture('swipe-left');
    controls.start({
      x: -100,
      opacity: 0.5,
      transition: { duration: 0.3 },
    });
  };

  const handleSwipeRight = () => {
    setGesture('swipe-right');
    controls.start({
      x: 100,
      opacity: 0.5,
      transition: { duration: 0.3 },
    });
  };

  const handlePinch = (scale: number) => {
    setGesture('pinch');
    controls.start({
      scale,
      transition: { duration: 0.1 },
    });
  };

  const resetGesture = () => {
    setGesture('idle');
    controls.start({
      x: 0,
      opacity: 1,
      scale: 1,
      transition: springConfigs.elastic,
    });
  };

  return {
    gesture,
    controls,
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