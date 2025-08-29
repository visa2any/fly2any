/**
 * Mobile Touch Handlers
 * Optimized touch event handling for mobile devices
 */

interface TouchHandlerConfig {
  preventScroll?: boolean;
  threshold?: number;
  passive?: boolean;
}

interface SwipeDirection {
  direction: 'up' | 'down' | 'left' | 'right';
  distance: number;
  velocity: number;
  duration: number;
}

interface TouchEventData {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  startTime: number;
  element: Element;
}

class TouchHandlerManager {
  private touchData: Map<number, TouchEventData> = new Map();
  private config: TouchHandlerConfig = {
    preventScroll: false,
    threshold: 10,
    passive: true,
  };

  constructor(config?: Partial<TouchHandlerConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Initialize touch handlers
  public init(): void {
    if (typeof window === 'undefined') return;

    // Add global touch event listeners
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: this.config.passive,
    });
    
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: this.config.passive,
    });
    
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: this.config.passive,
    });

    // Add touch-friendly styles
    this.addTouchStyles();
  }

  // Handle touch start
  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    if (!touch) return;

    const touchData: TouchEventData = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      startTime: Date.now(),
      element: event.target as Element,
    };

    this.touchData.set(touch.identifier, touchData);
  }

  // Handle touch move
  private handleTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    if (!touch) return;

    const touchData = this.touchData.get(touch.identifier);
    if (!touchData) return;

    touchData.currentX = touch.clientX;
    touchData.currentY = touch.clientY;
    touchData.deltaX = touchData.currentX - touchData.startX;
    touchData.deltaY = touchData.currentY - touchData.startY;

    // Prevent scroll if needed
    if (this.config.preventScroll && 
        (Math.abs(touchData.deltaX) > this.config.threshold! || 
         Math.abs(touchData.deltaY) > this.config.threshold!)) {
      event.preventDefault();
    }
  }

  // Handle touch end
  private handleTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    if (!touch) return;

    const touchData = this.touchData.get(touch.identifier);
    if (!touchData) return;

    const duration = Date.now() - touchData.startTime;
    const distance = Math.sqrt(
      touchData.deltaX * touchData.deltaX + touchData.deltaY * touchData.deltaY
    );

    // Detect swipe if movement is above threshold
    if (distance > this.config.threshold!) {
      const velocity = distance / duration;
      const swipeData = this.detectSwipeDirection(touchData, velocity, duration);
      
      // Dispatch custom swipe event
      this.dispatchSwipeEvent(touchData.element, swipeData);
    }

    // Clean up touch data
    this.touchData.delete(touch.identifier);
  }

  // Detect swipe direction
  private detectSwipeDirection(
    touchData: TouchEventData, 
    velocity: number, 
    duration: number
  ): SwipeDirection {
    const { deltaX, deltaY } = touchData;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let direction: 'up' | 'down' | 'left' | 'right';

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    return {
      direction,
      distance,
      velocity,
      duration,
    };
  }

  // Dispatch custom swipe event
  private dispatchSwipeEvent(element: Element, swipeData: SwipeDirection): void {
    const event = new CustomEvent('swipe', {
      detail: swipeData,
      bubbles: true,
      cancelable: true,
    });

    element.dispatchEvent(event);

    // Also dispatch direction-specific event
    const directionEvent = new CustomEvent(`swipe${swipeData.direction}`, {
      detail: swipeData,
      bubbles: true,
      cancelable: true,
    });

    element.dispatchEvent(directionEvent);
  }

  // Add touch-friendly CSS styles
  private addTouchStyles(): void {
    if (typeof document === 'undefined') return;

    const styleId = 'mobile-touch-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Touch-friendly styles */
      * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      input, textarea, [contenteditable] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      
      /* Improve touch targets */
      button, a, [role="button"] {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Remove iOS tap highlight */
      * {
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Optimize scrolling */
      * {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Prevent zoom on input focus */
      input[type="text"],
      input[type="email"],
      input[type="tel"],
      input[type="search"],
      textarea,
      select {
        font-size: 16px;
      }
    `;

    document.head.appendChild(style);
  }

  // Cleanup method
  public destroy(): void {
    if (typeof document === 'undefined') return;

    document.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this));

    // Remove styles
    const styleElement = document.getElementById('mobile-touch-styles');
    if (styleElement) {
      styleElement.remove();
    }

    this.touchData.clear();
  }
}

// Global touch handler instance
let globalTouchHandler: TouchHandlerManager | null = null;

// Initialize touch handlers
export function initTouchHandlers(config?: Partial<TouchHandlerConfig>): TouchHandlerManager {
  if (globalTouchHandler) {
    return globalTouchHandler;
  }

  globalTouchHandler = new TouchHandlerManager(config);
  globalTouchHandler.init();
  
  return globalTouchHandler;
}

// Optimize touch events for better performance
export function optimizeTouchEvents(): void {
  if (typeof window === 'undefined') return;

  // Add passive event listeners where possible
  const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
  
  passiveEvents.forEach(eventName => {
    document.addEventListener(eventName, () => {}, { passive: true });
  });

  // Optimize click events for touch devices
  let touchStartTime = 0;
  
  document.addEventListener('touchstart', () => {
    touchStartTime = Date.now();
  }, { passive: true });
  
  document.addEventListener('touchend', (event) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Convert long touches to right-click events
    if (touchDuration > 500) {
      const rightClickEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: event.changedTouches[0].clientX,
        clientY: event.changedTouches[0].clientY,
      });
      
      event.target?.dispatchEvent(rightClickEvent);
    }
  }, { passive: true });
}

// Utility functions for touch detection
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
}

// Touch handler hooks
export function useTouchHandler(
  element: RefObject<Element> | Element | null,
  handlers: {
    onSwipe?: (direction: SwipeDirection) => void;
    onSwipeUp?: (data: SwipeDirection) => void;
    onSwipeDown?: (data: SwipeDirection) => void;
    onSwipeLeft?: (data: SwipeDirection) => void;
    onSwipeRight?: (data: SwipeDirection) => void;
  }
) {
  useEffect(() => {
    const targetElement = element && 'current' in element ? element.current : element;
    if (!targetElement) return;

    const handleSwipe = (event: CustomEvent<SwipeDirection>) => {
      handlers.onSwipe?.(event.detail);
    };

    const handleSwipeUp = (event: CustomEvent<SwipeDirection>) => {
      handlers.onSwipeUp?.(event.detail);
    };

    const handleSwipeDown = (event: CustomEvent<SwipeDirection>) => {
      handlers.onSwipeDown?.(event.detail);
    };

    const handleSwipeLeft = (event: CustomEvent<SwipeDirection>) => {
      handlers.onSwipeLeft?.(event.detail);
    };

    const handleSwipeRight = (event: CustomEvent<SwipeDirection>) => {
      handlers.onSwipeRight?.(event.detail);
    };

    // Add event listeners
    targetElement.addEventListener('swipe', handleSwipe as EventListener);
    targetElement.addEventListener('swipeup', handleSwipeUp as EventListener);
    targetElement.addEventListener('swipedown', handleSwipeDown as EventListener);
    targetElement.addEventListener('swipeleft', handleSwipeLeft as EventListener);
    targetElement.addEventListener('swiperight', handleSwipeRight as EventListener);

    // Cleanup
    return () => {
      targetElement.removeEventListener('swipe', handleSwipe as EventListener);
      targetElement.removeEventListener('swipeup', handleSwipeUp as EventListener);
      targetElement.removeEventListener('swipedown', handleSwipeDown as EventListener);
      targetElement.removeEventListener('swipeleft', handleSwipeLeft as EventListener);
      targetElement.removeEventListener('swiperight', handleSwipeRight as EventListener);
    };
  }, [element, handlers]);
}

// Export touch handlers collection
export const touchHandlers = {
  init: initTouchHandlers,
  optimize: optimizeTouchEvents,
  isTouchDevice,
  isIOS,
  isAndroid,
  useTouchHandler,
};

// Add missing imports for React hooks
import { useEffect } from 'react';

// RefObject type for React 19
type RefObject<T> = React.RefObject<T>;