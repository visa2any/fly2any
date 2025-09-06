'use client';

/**
 * ENTERPRISE REACT HOOK SAFETY LAYER
 * Provides safe wrappers for all React hooks to prevent context nullification errors
 */

import React from 'react';

// Safely destructure React hooks for React 19 compatibility
const { useState, useEffect, useCallback, useMemo, useRef, useContext } = React;
import { useReactRuntime, useSafeHook } from './enterprise-react-runtime';

// ENTERPRISE: Safe useState wrapper
// Create a reusable no-op setter to avoid inline function serialization issues
const noOpSetter = () => { /* no-op setter for SSG fallback */ };

export function useSafeState<T>(initialState: T | (() => T), hookName?: string): [T, (value: T | ((prev: T) => T)) => void] {
  const runtimeContext = useReactRuntime();
  
  return useSafeHook(
    () => useState(initialState),
    [initialState as T, noOpSetter], // fallback state with reusable no-op
    hookName || 'useState'
  );
}

// ENTERPRISE: Safe useEffect wrapper
export function useSafeEffect(effect: () => void | (() => void), deps?: any[], hookName?: string): void {
  const runtimeContext = useReactRuntime();
  
  useSafeHook(
    () => {
      useEffect(() => {
        try {
          if (runtimeContext.state.hasValidContext || runtimeContext.isServerSide) {
            return effect();
          }
        } catch (error) {
          console.error(`🔥 SafeEffect error in ${hookName}:`, error);
        }
      }, deps);
      return undefined;
    },
    undefined,
    hookName || 'useEffect'
  );
}

// ENTERPRISE: Safe useCallback wrapper
export function useSafeCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[],
  hookName?: string
): T {
  const runtimeContext = useReactRuntime();
  
  return useSafeHook(
    () => useCallback(callback, deps),
    callback, // fallback to original callback
    hookName || 'useCallback'
  );
}

// ENTERPRISE: Safe useMemo wrapper
export function useSafeMemo<T>(
  factory: () => T,
  deps: any[],
  hookName?: string
): T {
  const runtimeContext = useReactRuntime();
  
  return useSafeHook(
    () => useMemo(factory, deps),
    factory(), // fallback to direct factory call
    hookName || 'useMemo'
  );
}

// ENTERPRISE: Safe useRef wrapper
export function useSafeRef<T>(initialValue: T, hookName?: string): React.MutableRefObject<T> {
  const runtimeContext = useReactRuntime();
  
  return useSafeHook(
    () => useRef(initialValue),
    { current: initialValue }, // fallback ref object
    hookName || 'useRef'
  );
}

// ENTERPRISE: Safe Navigation Hook (replaces usePathname)
export function useSafePathname(): string {
  const runtimeContext = useReactRuntime();
  const [pathname, setPathname] = useSafeState('/', 'SafePathname');

  useSafeEffect(() => {
    if (!runtimeContext.isServerSide) {
      try {
        // Try to get pathname from window location
        setPathname(window.location.pathname);
        
        // Try to import and use Next.js usePathname if available
        import('next/navigation').then(({ usePathname }) => {
          try {
            // This will only work if React context is properly set up
            const nextPathname = usePathname();
            setPathname(nextPathname);
          } catch (navError) {
            console.warn('🔥 Next.js usePathname failed, using window.location.pathname:', navError);
            setPathname(window.location.pathname);
          }
        }).catch(() => {
          // Fallback to window.location.pathname
          setPathname(window.location.pathname);
        });
      } catch (error) {
        console.error('🔥 SafePathname initialization failed:', error);
        setPathname('/');
      }
    }
  }, [runtimeContext.isServerSide, runtimeContext.state.hasValidContext], 'SafePathname effect');

  return pathname;
}

// ENTERPRISE: Safe Router Hook (replaces useRouter)
export function useSafeRouter() {
  const runtimeContext = useReactRuntime();
  const [router, setRouter] = useSafeState<any>({}, 'SafeRouter');

  useSafeEffect(() => {
    if (!runtimeContext.isServerSide && runtimeContext.state.hasValidContext) {
      try {
        import('next/navigation').then(({ useRouter }) => {
          try {
            const nextRouter = useRouter();
            setRouter(nextRouter);
          } catch (routerError) {
            console.warn('🔥 Next.js useRouter failed, providing fallback:', routerError);
            // Provide fallback router
            setRouter({
              push: (url: string) => {
                if (typeof window !== 'undefined') {
                  window.location.href = url;
                }
              },
              back: () => {
                if (typeof window !== 'undefined') {
                  window.history.back();
                }
              },
              forward: () => {
                if (typeof window !== 'undefined') {
                  window.history.forward();
                }
              },
              refresh: () => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }
            });
          }
        }).catch(() => {
          // Provide basic fallback router
          setRouter({
            push: (url: string) => window.location.href = url,
            back: () => window.history.back(),
            forward: () => window.history.forward(),
            refresh: () => window.location.reload()
          });
        });
      } catch (error) {
        console.error('🔥 SafeRouter initialization failed:', error);
      }
    }
  }, [runtimeContext.isServerSide, runtimeContext.state.hasValidContext], 'SafeRouter effect');

  return router || {
    push: (url: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    },
    back: () => {
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    },
    forward: () => {
      if (typeof window !== 'undefined') {
        window.history.forward();
      }
    },
    refresh: () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };
}

// ENTERPRISE: Mobile detection hook with safety
export function useSafeMobileDetection(): boolean {
  const runtimeContext = useReactRuntime();
  const [isMobile, setIsMobile] = useSafeState(false, 'SafeMobileDetection');

  useSafeEffect(() => {
    if (!runtimeContext.isServerSide) {
      const checkMobile = () => {
        try {
          const userAgent = navigator.userAgent.toLowerCase();
          const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
          const isMobileAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
          const isSmallScreen = window.innerWidth < 768;
          setIsMobile(isMobileAgent || isSmallScreen);
        } catch (error) {
          console.error('🔥 Mobile detection failed:', error);
          setIsMobile(false);
        }
      };

      checkMobile();

      const handleResize = () => {
        try {
          setIsMobile(window.innerWidth < 768);
        } catch (error) {
          console.error('🔥 Resize handler failed:', error);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [runtimeContext.isServerSide], 'SafeMobileDetection effect');

  return isMobile;
}

// ENTERPRISE: Safe form handling
export function useSafeFormHandling<T>(initialState: T, onSubmit?: (data: T) => Promise<void>) {
  const [formData, setFormData] = useSafeState<T>(initialState, 'SafeFormHandling');
  const [isSubmitting, setIsSubmitting] = useSafeState(false, 'SafeFormSubmitting');
  const [submitError, setSubmitError] = useSafeState<string | null>('', 'SafeFormError');

  const handleSubmit = useSafeCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError('');

      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('🔥 Form submission failed:', error);
      setSubmitError(error instanceof Error ? error.message : 'Form submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, onSubmit], 'SafeFormSubmit');

  const updateFormData = useSafeCallback((updates: Partial<T>) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  }, [setFormData], 'SafeFormUpdate');

  return {
    formData,
    setFormData,
    updateFormData,
    handleSubmit,
    isSubmitting,
    submitError,
    clearError: () => setSubmitError('')
  };
}

// ENTERPRISE: Component safety wrapper
export function withReactSafety<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<P>
) {
  const SafeComponent = (props: P) => {
    const runtimeContext = useReactRuntime();

    // Show loading state while React context is being validated
    if (!runtimeContext.isServerSide && !runtimeContext.state.hasValidContext) {
      return (
        <div className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-600 text-3xl mb-2">⚡</div>
            <p className="text-gray-600 text-sm">Loading component safely...</p>
          </div>
        </div>
      );
    }

    try {
      return <WrappedComponent {...props} />;
    } catch (error) {
      console.error('🔥 Component render failed:', error);
      
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent;
        return <FallbackComponent {...props} />;
      }

      return (
        <div className="flex items-center justify-center min-h-[200px] bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center p-4">
            <div className="text-red-600 text-3xl mb-2">🚨</div>
            <h3 className="text-red-800 font-semibold mb-1">Component Error</h3>
            <p className="text-red-600 text-sm">Component failed to render safely</p>
          </div>
        </div>
      );
    }
  };

  SafeComponent.displayName = `withReactSafety(${WrappedComponent.displayName || WrappedComponent.name})`;
  return SafeComponent;
}

console.log('🚀 ENTERPRISE: React Hook Safety Layer loaded');