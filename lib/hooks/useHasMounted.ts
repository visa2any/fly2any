import { useEffect, useState } from 'react';

/**
 * Hook to detect if component has mounted (client-side only)
 * Prevents hydration errors by ensuring client-only rendering
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
