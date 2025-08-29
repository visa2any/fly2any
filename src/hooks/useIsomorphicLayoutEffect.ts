import React, { useEffect } from 'react';

// Import useLayoutEffect conditionally for React 19 compatibility
let useLayoutEffect: typeof useEffect;
try {
  useLayoutEffect = require('react').useLayoutEffect || useEffect;
} catch {
  useLayoutEffect = useEffect;
}

// Use useLayoutEffect on the client and useEffect on the server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;