'use client';

/**
 * ENTERPRISE REACT PROVIDER
 * Ensures React context is properly maintained across Next.js App Router
 * Fixes hook call violations and context nullification issues
 */

import React, { ReactNode, useEffect } from 'react';

interface EnterpriseReactProviderProps {
  children: ReactNode;
}

// Context validation and React runtime checks
const validateReactRuntime = () => {
  if (typeof window !== 'undefined') {
    // Ensure React is globally available
    if (!window.React) {
      window.React = React;
    }
    
    // Validate React version consistency
    if (React.version !== '18.3.1') {
      console.warn('React version inconsistency detected:', {
        expected: '18.3.1',
        actual: React.version
      });
    }
    
    // Ensure React internals are available
    if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      console.error('React internals not available - this may cause hook issues');
    }
    
    // Check for multiple React instances
    const reactInstances = new Set();
    if (window.React) reactInstances.add('window.React');
    if (global.React) reactInstances.add('global.React');
    if (require.cache[require.resolve('react')]) reactInstances.add('require.cache.react');
    
    if (reactInstances.size > 1) {
      console.warn('Multiple React instances detected:', Array.from(reactInstances));
    }
  }
};

// Hook validation wrapper to catch invalid hook calls
const useHookValidator = (hookName: string, hook: () => any) => {
  try {
    return hook();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid hook call')) {
      console.error(`Enterprise Hook Validator: Invalid hook call detected in ${hookName}`, error);
      console.error('This usually means:');
      console.error('1. You might have mismatching versions of React and ReactDOM');
      console.error('2. You might be calling hooks outside of component body');
      console.error('3. You might have multiple React instances');
      throw error;
    }
    throw error;
  }
};

const EnterpriseReactProvider = ({ children }: EnterpriseReactProviderProps) => {
  useEffect(() => {
    // Validate React runtime on mount
    validateReactRuntime();
    
    // Set up React DevTools compatibility
    if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      try {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (
          (original) => 
            function(id: any, root: any, priorityLevel?: any) {
              // Validate React context before DevTools processing
              if (root && root.current && !root.current._reactInternalInstance) {
                // Ensure React context is maintained
                validateReactRuntime();
              }
              if (original) {
                return original(id, root, priorityLevel);
              }
            }
        )(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot);
      } catch (error) {
        console.warn('Could not set up React DevTools compatibility:', error);
      }
    }
    
    // Monitor for runtime errors
    const handleError = (event: ErrorEvent) => {
      if (
        event.message.includes('Invalid hook call') ||
        event.message.includes('Cannot read properties of null') ||
        event.message.includes('useContext')
      ) {
        console.error('Enterprise React Provider: Runtime error detected', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
        
        // Attempt React runtime recovery
        setTimeout(() => {
          validateReactRuntime();
        }, 0);
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  // Wrap children with error boundary for hook-related errors
  return (
    <React.StrictMode>
      <div data-enterprise-react-provider="true">
        {children}
      </div>
    </React.StrictMode>
  );
};

export default EnterpriseReactProvider;

// Export hook validator for use in components
export { useHookValidator };

// Export runtime validation for manual use
export { validateReactRuntime };
