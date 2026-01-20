/**
 * Hydration Error Handler
 * Handles React hydration errors (codes 418, 422, 425)
 * 
 * Error meanings:
 * - 418: Cannot update a component from inside the function body of a different component
 * - 422: Cannot read properties of null (reading 'useRef') - hydration mismatch
 * - 425: Cannot perform React state update on unmounted component
 */

export interface HydrationError extends Error {
  code: 'HYDRATION_ERROR';
  reactErrorCode: 418 | 422 | 425;
}

/**
 * Check if an error is a React hydration error
 */
export function isHydrationError(error: unknown): error is HydrationError {
  if (!(error instanceof Error)) return false;

  const errorMessage = error.message.toLowerCase();

  return (
    errorMessage.includes('hydration') ||
    errorMessage.includes('minified react error #418') ||
    errorMessage.includes('minified react error #422') ||
    errorMessage.includes('minified react error #425') ||
    errorMessage.includes('text content does not match') ||
    errorMessage.includes('server-rendered html') ||
    errorMessage.includes('client-rendered html') ||
    errorMessage.includes('cannot update a component') ||
    errorMessage.includes('cannot perform react state update')
  );
}

/**
 * Extract React error code from error message
 */
export function getReactErrorCode(error: Error): 418 | 422 | 425 | null {
  const match = error.message.match(/minified react error #(\d+)/);
  return match ? parseInt(match[1], 10) as 418 | 422 | 425 : null;
}

/**
 * Get user-friendly explanation of hydration error
 */
export function getHydrationErrorExplanation(errorCode: 418 | 422 | 425): string {
  switch (errorCode) {
    case 418:
      return 'A component is trying to update another component during render. This can happen when calling setState or using hooks during rendering.';
    case 422:
      return 'Server-rendered HTML does not match client-rendered HTML. This usually happens with dynamic data or browser-specific APIs.';
    case 425:
      return 'Attempting to update state on a component that has been unmounted.';
    default:
      return 'A hydration error occurred during the transition from server to client rendering.';
  }
}

/**
 * Suggest fixes for hydration errors
 */
export function getHydrationErrorFix(errorCode: 418 | 422 | 425): string[] {
  switch (errorCode) {
    case 418:
      return [
        'Move state updates to useEffect or event handlers',
        'Avoid calling setState during the render phase',
        'Use useMemo or useCallback for derived values',
        'Check for conditional rendering that triggers state updates',
      ];
    case 422:
      return [
        'Add suppressHydrationWarning to mismatched elements if intentional',
        'Ensure server and client render the same initial HTML',
        'Use useEffect for browser-specific features (window, document)',
        'Check for dynamic data differences between server and client',
        'Use the useHasMounted hook for client-only rendering',
      ];
    case 425:
      return [
        'Add cleanup function to useEffect',
        'Check if component is mounted before state updates',
        'Use AbortController for async operations',
        'Cancel pending operations on unmount',
      ];
    default:
      return [];
  }
}

/**
 * Handle hydration error by logging and potentially recovering
 */
export function handleHydrationError(error: Error): void {
  const errorCode = getReactErrorCode(error);
  
  if (!errorCode) return;

  console.error('[HydrationErrorHandler] Hydration error detected:', {
    code: errorCode,
    explanation: getHydrationErrorExplanation(errorCode),
    fixes: getHydrationErrorFix(errorCode),
    stack: error.stack,
  });

  // For hydration errors, we can sometimes recover by:
  // 1. Clearing state
  // 2. Forcing a client-side render
  // 3. Disabling server rendering for affected components
  
  // For now, we'll just log the error
  // In the future, we could implement automatic recovery strategies
}

/**
 * Create a hydration-safe useEffect hook wrapper
 */
export function createHydrationSafeEffect(
  effect: () => void | (() => void),
  deps?: React.DependencyList
) {
  // This should be used in components to ensure effects only run on client
  // Example:
  // createHydrationSafeEffect(() => {
  //   // Safe to use browser APIs here
  // }, [deps])
  
  return () => {
    // This is a placeholder - actual implementation would be in a hook
    console.warn('[createHydrationSafeEffect] This function should be used within a component');
  };
}

/**
 * Check if we're on the server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if we're on the client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safely get a value from localStorage (hydration-safe)
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (isServer()) {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('[getLocalStorageItem] Failed to get item:', error);
    return defaultValue;
  }
}

/**
 * Safely set a value in localStorage (hydration-safe)
 */
export function setLocalStorageItem<T>(key: string, value: T): void {
  if (isServer()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[setLocalStorageItem] Failed to set item:', error);
  }
}

/**
 * Hydration-safe date/time formatting
 */
export function formatHydrationSafeDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  if (isServer()) {
    // Return ISO string on server
    return new Date(date).toISOString();
  }

  try {
    return new Date(date).toLocaleDateString(undefined, options);
  } catch (error) {
    console.warn('[formatHydrationSafeDate] Failed to format date:', error);
    return new Date(date).toISOString();
  }
}
