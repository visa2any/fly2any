'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface SmartKeyboardProps {
  children: React.ReactNode;
  adjustViewport?: boolean;
  resizeDelay?: number;
  className?: string;
}

export const SmartKeyboard: React.FC<SmartKeyboardProps> = ({
  children,
  adjustViewport = true,
  resizeDelay = 300,
  className = '',
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialViewportHeight = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    initialViewportHeight.current = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight.current - currentHeight;
      
      // Threshold to detect keyboard (usually > 150px on mobile)
      const keyboardThreshold = 150;
      
      if (heightDifference > keyboardThreshold) {
        setKeyboardHeight(heightDifference);
        setIsKeyboardOpen(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
      }
    };

    // Debounce resize events
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, resizeDelay);
    };

    window.addEventListener('resize', debouncedResize);
    
    // Also listen for visual viewport changes (better support)
    if ('visualViewport' in window) {
      const visualViewport = window.visualViewport!;
      
      const handleViewportChange = () => {
        const keyboardHeight = window.innerHeight - visualViewport.height;
        if (keyboardHeight > 150) {
          setKeyboardHeight(keyboardHeight);
          setIsKeyboardOpen(true);
        } else {
          setKeyboardHeight(0);
          setIsKeyboardOpen(false);
        }
      };

      visualViewport.addEventListener('resize', handleViewportChange);
      
      return () => {
        window.removeEventListener('resize', debouncedResize);
        visualViewport.removeEventListener('resize', handleViewportChange);
        clearTimeout(resizeTimeout);
      };
    }

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [resizeDelay]);

  // Auto-scroll focused input into view
  useEffect(() => {
    if (!isKeyboardOpen) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300); // Wait for keyboard animation
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [isKeyboardOpen]);

  return (
    <motion.div
      ref={containerRef}
      className={`${className} transition-all duration-300`}
      animate={{
        height: adjustViewport && isKeyboardOpen 
          ? `calc(100vh - ${keyboardHeight}px)` 
          : '100vh',
      }}
      style={{
        overflow: 'hidden',
      }}
    >
      {children}
      
      {/* Keyboard spacer */}
      {isKeyboardOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: keyboardHeight }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-transparent"
        />
      )}
    </motion.div>
  );
};

// Enhanced input component with smart keyboard handling
export const KeyboardOptimizedInput = React.forwardRef<
  HTMLInputElement,
  {
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    error?: string;
    className?: string;
    autoComplete?: string;
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    pattern?: string;
    suggestions?: string[];
  }
>(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  className = '',
  autoComplete,
  inputMode,
  pattern,
  suggestions = [],
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart input mode detection
  const getOptimalInputMode = () => {
    if (inputMode) return inputMode;
    
    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'url':
        return 'url';
      case 'number':
        return 'numeric';
      case 'search':
        return 'search';
      default:
        return 'text';
    }
  };

  // Smart autocomplete suggestions
  const getAutoComplete = () => {
    if (autoComplete) return autoComplete;
    
    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'password':
        return 'current-password';
      default:
        return 'off';
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(suggestions.length > 0);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 150);
    onBlur?.();
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes((value || '').toLowerCase())
  );

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref || inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          inputMode={getOptimalInputMode()}
          autoComplete={getAutoComplete()}
          pattern={pattern}
          className={`
            w-full px-4 py-3 border-2 rounded-xl transition-all duration-200
            ${error 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-blue-500'
            }
            focus:outline-none focus:ring-4 
            ${error ? 'focus:ring-red-100' : 'focus:ring-blue-100'}
            placeholder:text-gray-400 min-h-[48px]
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
            ${className}
          `}
          {...props}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-blue-50 focus:outline-none transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-gray-900">{suggestion}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
});

KeyboardOptimizedInput.displayName = 'KeyboardOptimizedInput';

// Hook for keyboard detection
export function useKeyboardDetection() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;
      
      if (heightDifference > 150) {
        setKeyboardHeight(heightDifference);
        setIsKeyboardOpen(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
      }
    };

    // Visual viewport API support
    if ('visualViewport' in window && window.visualViewport) {
      const visualViewport = window.visualViewport;
      
      const handleViewportChange = () => {
        const keyboardHeight = window.innerHeight - visualViewport.height;
        setKeyboardHeight(keyboardHeight);
        setIsKeyboardOpen(keyboardHeight > 150);
      };

      visualViewport.addEventListener('resize', handleViewportChange);
      return () => visualViewport.removeEventListener('resize', handleViewportChange);
    }
    
    // Fallback to window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isKeyboardOpen, keyboardHeight };
}

export default SmartKeyboard;