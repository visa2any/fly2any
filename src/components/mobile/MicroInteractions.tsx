'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { haptic as hapticSystem } from '@/lib/mobile/haptic-feedback';

// Spring physics configuration
const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

const bouncySpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
  mass: 1.2,
};

// Touch-optimized button with micro-interactions
export const TouchButton = React.forwardRef<
  HTMLButtonElement,
  {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    haptic?: boolean;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, variant = 'primary', size = 'md', haptic = true, disabled, loading, className, ...restProps }, ref) => {
  // Separate HTML button props from potential conflicting props
  const { onAnimationStart, onAnimationEnd, onTransitionEnd, ...htmlProps } = restProps as any;
  const controls = useAnimation();
  const scale = useMotionValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg',
    secondary: 'bg-white border-2 border-gray-200 text-gray-800 shadow-sm',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  };

  const handleTouchStart = () => {
    if (disabled || loading) return;
    setIsPressed(true);
    if (haptic) hapticSystem.light();
    controls.start({ scale: 0.95, transition: { duration: 0.1 } });
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    controls.start({ scale: 1, transition: springConfig });
  };

  const handleClick = () => {
    if (disabled || loading) return;
    if (haptic) hapticSystem.success();
    
    // Success animation
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.3, times: [0, 0.5, 1] }
    });
    
    onClick?.();
  };

  return (
    <motion.button
      ref={ref}
      className={`
        relative overflow-hidden rounded-xl font-medium transition-all duration-200
        ${variants[variant]} ${sizes[size]} ${className || ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        ${isPressed ? 'shadow-inner' : ''}
        touch-manipulation select-none
      `}
      animate={controls}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      {...htmlProps}
    >
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ scale: 0, opacity: 0.3 }}
        animate={isPressed ? { scale: 1, opacity: 0 } : { scale: 0, opacity: 0.3 }}
        transition={{ duration: 0.4 }}
        style={{
          background: variant === 'primary' 
            ? 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, transparent 70%)',
          transformOrigin: 'center',
        }}
      />

      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </div>
    </motion.button>
  );
});

TouchButton.displayName = 'TouchButton';

// Enhanced form input with micro-interactions
export const TouchInput = React.forwardRef<
  HTMLInputElement,
  {
    label?: string;
    error?: string;
    success?: boolean;
    icon?: React.ReactNode;
    onFocus?: () => void;
    onBlur?: () => void;
    haptic?: boolean;
    suggestions?: string[];
  } & React.InputHTMLAttributes<HTMLInputElement>
>(({ label, error, success, icon, onFocus, onBlur, haptic = true, suggestions = [], className, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const controls = useAnimation();

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (haptic) hapticSystem.light();
    controls.start({
      scale: 1.02,
      borderWidth: 2,
      transition: springConfig
    });
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    controls.start({
      scale: 1,
      borderWidth: 1,
      transition: springConfig
    });
    onBlur?.(e);
  };

  const borderColor = error 
    ? 'border-red-300 focus:border-red-500' 
    : success 
    ? 'border-green-300 focus:border-green-500'
    : 'border-gray-200 focus:border-blue-500';

  return (
    <div className="space-y-2">
      {label && (
        <motion.label
          className={`block text-sm font-medium transition-colors duration-200 ${
            isFocused || hasValue ? 'text-blue-600' : 'text-gray-700'
          }`}
          animate={{ scale: isFocused ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <motion.input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${borderColor} ${icon ? 'pl-10' : ''} ${className || ''}
            focus:outline-none focus:ring-4 focus:ring-blue-100
            placeholder:text-gray-400 min-h-[48px]
          `}
          animate={controls}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...(props as any)}
        />

        {/* Success checkmark */}
        {success && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
          >
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        )}

        {/* Focus indicator */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          }}
        />
      </div>

      {error && (
        <motion.p
          className="text-red-600 text-sm flex items-center gap-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
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

TouchInput.displayName = 'TouchInput';

// Swipeable card with gesture recognition
export const SwipeableCard: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  haptic?: boolean;
  className?: string;
}> = ({ children, onSwipeLeft, onSwipeRight, haptic = true, className }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-10, 10]);
  const opacity = useTransform(x, [-100, -50, 0, 50, 100], [0.5, 0.8, 1, 0.8, 0.5]);
  
  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    
    if (info.offset.x > threshold) {
      if (haptic) hapticSystem.medium();
      onSwipeRight?.();
    } else if (info.offset.x < -threshold) {
      if (haptic) hapticSystem.medium();
      onSwipeLeft?.();
    }
  };

  return (
    <motion.div
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100 cursor-grab active:cursor-grabbing
        ${className || ''}
      `}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      
      {/* Swipe indicators */}
      <motion.div
        className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full"
        style={{ opacity: useTransform(x, [20, 100], [0, 1]) }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      
      <motion.div
        className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full"
        style={{ opacity: useTransform(x, [-100, -20], [1, 0]) }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

// Loading state with micro-animations
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
}> = ({ size = 'md', color = 'text-blue-600', message }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <motion.div
          className={`${sizes[size]} border-2 border-gray-200 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`absolute inset-0 ${sizes[size]} border-2 border-transparent border-t-current rounded-full ${color}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {message && (
        <motion.p
          className="text-sm text-gray-600 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

// Success animation component
export const SuccessAnimation: React.FC<{
  show: boolean;
  onComplete?: () => void;
  message?: string;
}> = ({ show, onComplete, message }) => {
  useEffect(() => {
    if (show) {
      hapticSystem.success();
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={bouncySpring}
      >
        <motion.div
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...bouncySpring, delay: 0.2 }}
        >
          <motion.svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>
        
        <motion.h3
          className="text-lg font-semibold text-gray-900 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Sucesso!
        </motion.h3>
        
        {message && (
          <motion.p
            className="text-gray-600"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};