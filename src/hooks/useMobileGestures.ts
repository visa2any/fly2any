'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useMobileUtils } from './useMobileDetection';

// Gesture types
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export type PinchDirection = 'in' | 'out';

// Gesture event interfaces
export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface PinchEvent {
  direction: PinchDirection;
  scale: number;
  distance: number;
  centerX: number;
  centerY: number;
}

export interface PanEvent {
  deltaX: number;
  deltaY: number;
  distance: number;
  velocity: number;
  isActive: boolean;
}

export interface TapEvent {
  x: number;
  y: number;
  tapCount: number;
  isLongTap: boolean;
  duration: number;
}

// Gesture configuration
export interface GestureConfig {
  swipe?: {
    enabled: boolean;
    threshold: number; // Minimum distance for swipe
    velocityThreshold: number; // Minimum velocity
    maxTimeThreshold: number; // Maximum time for swipe
  };
  pinch?: {
    enabled: boolean;
    threshold: number; // Minimum scale change
  };
  pan?: {
    enabled: boolean;
    threshold: number; // Minimum distance to start pan
  };
  tap?: {
    enabled: boolean;
    doubleTapDelay: number; // Maximum time between taps for double tap
    longTapDelay: number; // Minimum time for long tap
  };
  haptic?: {
    enabled: boolean;
    intensity: number; // Vibration intensity (1-100)
  };
}

// Gesture callbacks
export interface GestureCallbacks {
  onSwipe?: (event: SwipeEvent) => void;
  onPinch?: (event: PinchEvent) => void;
  onPan?: (event: PanEvent) => void;
  onPanStart?: (event: PanEvent) => void;
  onPanEnd?: (event: PanEvent) => void;
  onTap?: (event: TapEvent) => void;
  onDoubleTap?: (event: TapEvent) => void;
  onLongTap?: (event: TapEvent) => void;
}

// Default configuration
const DEFAULT_CONFIG: GestureConfig = {
  swipe: {
    enabled: true,
    threshold: 50,
    velocityThreshold: 0.3,
    maxTimeThreshold: 300
  },
  pinch: {
    enabled: true,
    threshold: 0.1
  },
  pan: {
    enabled: true,
    threshold: 10
  },
  tap: {
    enabled: true,
    doubleTapDelay: 300,
    longTapDelay: 500
  },
  haptic: {
    enabled: true,
    intensity: 10
  }
};

// Touch point interface
interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export const useMobileGestures = (
  elementRef: React.RefObject<HTMLElement>,
  callbacks: GestureCallbacks = {},
  config: Partial<GestureConfig> = {}
) => {
  const { isMobileDevice, isTouchDevice } = useMobileUtils();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State for tracking gestures
  const [touches, setTouches] = useState<Map<number, TouchPoint>>(new Map());
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [gestureType, setGestureType] = useState<string>('');
  
  // Refs for tracking gesture state
  const startTouchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const lastTapTimeRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  const longTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const panStartRef = useRef<boolean>(false);
  const initialPinchDistanceRef = useRef<number>(0);

  // Haptic feedback utility
  const triggerHaptic = useCallback((intensity: number = mergedConfig.haptic?.intensity || 10) => {
    if (!mergedConfig.haptic?.enabled || !('vibrate' in navigator)) return;
    
    navigator.vibrate(intensity);
  }, [mergedConfig.haptic]);

  // Calculate distance between two points
  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  // Calculate velocity
  const getVelocity = useCallback((start: TouchPoint, end: TouchPoint): number => {
    const distance = getDistance(start, end);
    const time = end.timestamp - start.timestamp;
    return time > 0 ? distance / time : 0;
  }, [getDistance]);

  // Get swipe direction
  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint): SwipeDirection => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // Convert touch to TouchPoint
  const touchToPoint = useCallback((touch: Touch): TouchPoint => ({
    id: touch.identifier,
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  }), []);

  // Handle touch start
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!isTouchDevice) return;

    const newTouches = new Map<number, TouchPoint>();
    
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const point = touchToPoint(touch);
      newTouches.set(touch.identifier, point);
    }

    setTouches(newTouches);
    startTouchesRef.current = new Map(newTouches);
    setIsGestureActive(true);

    // Handle tap detection
    if (mergedConfig.tap?.enabled && event.touches.length === 1) {
      const now = Date.now();
      const touch = touchToPoint(event.touches[0]);
      
      // Clear previous long tap timeout
      if (longTapTimeoutRef.current) {
        clearTimeout(longTapTimeoutRef.current);
      }

      // Set up long tap detection
      longTapTimeoutRef.current = setTimeout(() => {
        if (callbacks.onLongTap) {
          const tapEvent: TapEvent = {
            x: touch.x,
            y: touch.y,
            tapCount: 1,
            isLongTap: true,
            duration: mergedConfig.tap!.longTapDelay
          };
          callbacks.onLongTap(tapEvent);
          triggerHaptic(20);
        }
      }, mergedConfig.tap.longTapDelay);

      // Double tap detection
      if (now - lastTapTimeRef.current <= mergedConfig.tap.doubleTapDelay) {
        tapCountRef.current++;
      } else {
        tapCountRef.current = 1;
      }
      
      lastTapTimeRef.current = now;
    }

    // Handle pinch start
    if (mergedConfig.pinch?.enabled && event.touches.length === 2) {
      const [touch1, touch2] = Array.from(newTouches.values());
      initialPinchDistanceRef.current = getDistance(touch1, touch2);
      setGestureType('pinch');
    }

  }, [isTouchDevice, mergedConfig, callbacks, touchToPoint, getDistance, triggerHaptic]);

  // Handle touch move
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isTouchDevice || !isGestureActive) return;

    const currentTouches = new Map<number, TouchPoint>();
    
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const point = touchToPoint(touch);
      currentTouches.set(touch.identifier, point);
    }

    setTouches(currentTouches);

    // Handle pinch gesture
    if (mergedConfig.pinch?.enabled && event.touches.length === 2 && gestureType === 'pinch') {
      const touchArray = Array.from(currentTouches.values());
      if (touchArray.length === 2) {
        const [touch1, touch2] = touchArray;
        const currentDistance = getDistance(touch1, touch2);
        const scale = currentDistance / initialPinchDistanceRef.current;
        
        if (Math.abs(scale - 1) >= mergedConfig.pinch.threshold) {
          const centerX = (touch1.x + touch2.x) / 2;
          const centerY = (touch1.y + touch2.y) / 2;
          
          if (callbacks.onPinch) {
            const pinchEvent: PinchEvent = {
              direction: scale > 1 ? 'out' : 'in',
              scale,
              distance: currentDistance,
              centerX,
              centerY
            };
            callbacks.onPinch(pinchEvent);
          }
        }
      }
    }

    // Handle pan gesture
    if (mergedConfig.pan?.enabled && event.touches.length === 1) {
      const currentTouch = Array.from(currentTouches.values())[0];
      const startTouch = Array.from(startTouchesRef.current.values())[0];
      
      if (currentTouch && startTouch) {
        const deltaX = currentTouch.x - startTouch.x;
        const deltaY = currentTouch.y - startTouch.y;
        const distance = getDistance(startTouch, currentTouch);
        
        if (distance >= mergedConfig.pan.threshold) {
          const velocity = getVelocity(startTouch, currentTouch);
          
          const panEvent: PanEvent = {
            deltaX,
            deltaY,
            distance,
            velocity,
            isActive: true
          };

          // Pan start
          if (!panStartRef.current) {
            panStartRef.current = true;
            setGestureType('pan');
            if (callbacks.onPanStart) {
              callbacks.onPanStart(panEvent);
            }
          }

          // Pan move
          if (callbacks.onPan) {
            callbacks.onPan(panEvent);
          }
        }
      }
    }

    // Prevent default scrolling if actively panning
    if (gestureType === 'pan' || gestureType === 'pinch') {
      event.preventDefault();
    }
  }, [
    isTouchDevice,
    isGestureActive,
    gestureType,
    mergedConfig,
    callbacks,
    touchToPoint,
    getDistance,
    getVelocity
  ]);

  // Handle touch end
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!isTouchDevice) return;

    // Clear long tap timeout
    if (longTapTimeoutRef.current) {
      clearTimeout(longTapTimeoutRef.current);
      longTapTimeoutRef.current = null;
    }

    const endTouches = new Map<number, TouchPoint>();
    
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const point = touchToPoint(touch);
      endTouches.set(touch.identifier, point);
    }

    // Handle swipe detection
    if (mergedConfig.swipe?.enabled && gestureType !== 'pan' && startTouchesRef.current.size === 1) {
      const startTouch = Array.from(startTouchesRef.current.values())[0];
      const endTime = Date.now();
      
      // Find the corresponding end touch (use the last known position if touch ended)
      let endTouch: TouchPoint;
      if (endTouches.size > 0) {
        endTouch = Array.from(endTouches.values())[0];
      } else {
        // Touch ended, use the last known position
        endTouch = Array.from(touches.values())[0] || startTouch;
        endTouch.timestamp = endTime;
      }

      if (startTouch && endTouch) {
        const distance = getDistance(startTouch, endTouch);
        const velocity = getVelocity(startTouch, endTouch);
        const duration = endTime - startTouch.timestamp;

        if (
          distance >= mergedConfig.swipe.threshold &&
          velocity >= mergedConfig.swipe.velocityThreshold &&
          duration <= mergedConfig.swipe.maxTimeThreshold
        ) {
          const direction = getSwipeDirection(startTouch, endTouch);
          
          if (callbacks.onSwipe) {
            const swipeEvent: SwipeEvent = {
              direction,
              distance,
              velocity,
              duration,
              startX: startTouch.x,
              startY: startTouch.y,
              endX: endTouch.x,
              endY: endTouch.y
            };
            callbacks.onSwipe(swipeEvent);
            triggerHaptic(15);
          }
        }
      }
    }

    // Handle tap detection
    if (mergedConfig.tap?.enabled && event.touches.length === 0 && gestureType !== 'pan' && gestureType !== 'pinch') {
      const startTouch = Array.from(startTouchesRef.current.values())[0];
      const endTime = Date.now();
      
      if (startTouch && (endTime - startTouch.timestamp) < mergedConfig.tap.longTapDelay) {
        const tapEvent: TapEvent = {
          x: startTouch.x,
          y: startTouch.y,
          tapCount: tapCountRef.current,
          isLongTap: false,
          duration: endTime - startTouch.timestamp
        };

        if (tapCountRef.current === 1) {
          // Single tap
          setTimeout(() => {
            if (tapCountRef.current === 1 && callbacks.onTap) {
              callbacks.onTap(tapEvent);
              triggerHaptic(5);
            }
          }, mergedConfig.tap.doubleTapDelay);
        } else if (tapCountRef.current === 2 && callbacks.onDoubleTap) {
          // Double tap
          callbacks.onDoubleTap(tapEvent);
          triggerHaptic(10);
          tapCountRef.current = 0;
        }
      }
    }

    // Handle pan end
    if (gestureType === 'pan' && callbacks.onPanEnd) {
      const startTouch = Array.from(startTouchesRef.current.values())[0];
      const lastTouch = Array.from(touches.values())[0];
      
      if (startTouch && lastTouch) {
        const panEvent: PanEvent = {
          deltaX: lastTouch.x - startTouch.x,
          deltaY: lastTouch.y - startTouch.y,
          distance: getDistance(startTouch, lastTouch),
          velocity: getVelocity(startTouch, lastTouch),
          isActive: false
        };
        callbacks.onPanEnd(panEvent);
      }
    }

    // Reset state if no touches remain
    if (event.touches.length === 0) {
      setIsGestureActive(false);
      setGestureType('');
      panStartRef.current = false;
      startTouchesRef.current.clear();
      setTouches(new Map());
    } else {
      setTouches(endTouches);
    }
  }, [
    isTouchDevice,
    gestureType,
    touches,
    mergedConfig,
    callbacks,
    touchToPoint,
    getDistance,
    getVelocity,
    getSwipeDirection,
    triggerHaptic
  ]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isTouchDevice) return;

    // Add event listeners with passive: false for pan/pinch gestures
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      
      // Clean up timeouts
      if (longTapTimeoutRef.current) {
        clearTimeout(longTapTimeoutRef.current);
      }
    };
  }, [
    elementRef,
    isTouchDevice,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  ]);

  // Return gesture state and utilities
  return {
    isGestureActive,
    gestureType,
    touchCount: touches.size,
    triggerHaptic,
    
    // Configuration helpers
    enableGesture: (gesture: keyof GestureConfig, enabled: boolean) => {
      if (mergedConfig[gesture]) {
        mergedConfig[gesture]!.enabled = enabled;
      }
    },
    
    // State helpers
    isSwipeActive: gestureType === 'swipe',
    isPinchActive: gestureType === 'pinch',
    isPanActive: gestureType === 'pan',
    isTapActive: gestureType === 'tap'
  };
};

export default useMobileGestures;