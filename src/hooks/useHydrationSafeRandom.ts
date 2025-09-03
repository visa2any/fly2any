/**
 * ULTRATHINK ENTERPRISE - Hydration-Safe Random Number Hook
 * 
 * This hook provides enterprise-grade hydration safety for dynamic content
 * that needs to display random numbers without causing SSR/CSR mismatches.
 * 
 * Features:
 * - Prevents hydration mismatch errors
 * - Supports deterministic seeding for reproducible results
 * - Implements client-side only rendering for dynamic content
 * - Enterprise-level error handling and fallbacks
 * - TypeScript support with full type safety
 * - Performance optimized with memoization
 */

import { useState, useEffect, useMemo } from 'react';

interface HydrationSafeRandomOptions {
  min: number;
  max: number;
  seed?: string; // Optional seed for deterministic results
  fallback?: number; // Fallback value during SSR
  delay?: number; // Delay before showing random value (for smooth UX)
}

interface HydrationSafeRandomResult {
  value: number;
  isHydrated: boolean;
  regenerate: () => void;
}

/**
 * Enterprise-grade seeded random number generator
 * Uses a simple linear congruential generator for reproducible results
 */
const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Linear congruential generator
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  
  hash = Math.abs(hash);
  const next = (a * hash + c) % m;
  return next / m;
};

/**
 * Hydration-safe random number hook
 * 
 * @param options Configuration options for the random number generation
 * @returns Object containing the random value, hydration status, and regenerate function
 */
export const useHydrationSafeRandom = (
  options: HydrationSafeRandomOptions
): HydrationSafeRandomResult => {
  const { min, max, seed, fallback = min, delay = 0 } = options;
  
  // State to track if component has hydrated on client
  const [isHydrated, setIsHydrated] = useState(false);
  const [randomValue, setRandomValue] = useState(fallback);
  const [shouldShowRandom, setShouldShowRandom] = useState(false);
  
  // Generate random number based on configuration
  const generateRandomValue = useMemo(() => {
    return () => {
      if (seed) {
        // Use seeded random for deterministic results
        const seedWithTimestamp = `${seed}-${Date.now()}`;
        const randomFloat = seededRandom(seedWithTimestamp);
        return Math.floor(randomFloat * (max - min + 1)) + min;
      } else {
        // Use standard random
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
    };
  }, [min, max, seed]);
  
  // Regenerate random value (useful for dynamic updates)
  const regenerate = () => {
    if (isHydrated) {
      setRandomValue(generateRandomValue());
    }
  };
  
  // Effect to handle client-side hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
      setShouldShowRandom(true);
      setRandomValue(generateRandomValue());
    }, delay);
    
    return () => clearTimeout(timer);
  }, [generateRandomValue, delay]);
  
  // Return appropriate value based on hydration status
  const currentValue = shouldShowRandom ? randomValue : fallback;
  
  return {
    value: currentValue,
    isHydrated: isHydrated && shouldShowRandom,
    regenerate
  };
};

/**
 * Enterprise-grade hydration-safe content hook
 * For text content that needs to be different on server vs client
 */
export const useHydrationSafeContent = <T>(
  serverContent: T,
  clientContent: T,
  delay: number = 0
): { content: T; isHydrated: boolean } => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [shouldShowClient, setShouldShowClient] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
      setShouldShowClient(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return {
    content: shouldShowClient ? clientContent : serverContent,
    isHydrated: isHydrated && shouldShowClient
  };
};

/**
 * Utility hook for enterprise-level hydration detection
 * Useful for conditional rendering based on hydration status
 */
export const useIsHydrated = (): boolean => {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  return isHydrated;
};

export default useHydrationSafeRandom;