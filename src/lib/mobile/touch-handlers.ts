'use client';

import { useRef, useEffect } from 'react';

export interface GestureOptions {
  threshold?: number;
  velocity?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  preventDefault?: boolean;
}

export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

export interface PinchEvent {
  scale: number;
  center: { x: number; y: number };
  velocity: number;
}

export interface LongPressEvent {
  duration: number;
  point: { x: number; y: number };
}

export class TouchGestureHandler {
  private element: HTMLElement;
  private startTime = 0;
  private startPoint = { x: 0, y: 0 };
  private currentPoint = { x: 0, y: 0 };
  private isTracking = false;
  private longPressTimer?: NodeJS.Timeout;
  private initialPinchDistance = 0;
  private lastPinchScale = 1;

  // Callbacks
  private onSwipe?: (event: SwipeEvent) => void;
  private onPinch?: (event: PinchEvent) => void;
  private onLongPress?: (event: LongPressEvent) => void;
  private onTap?: (point: { x: number; y: number }) => void;
  private onDoubleTap?: (point: { x: number; y: number }) => void;

  private lastTapTime = 0;
  private tapCount = 0;

  constructor(element: HTMLElement, options: GestureOptions = {}) {
    this.element = element;
    this.bindEvents();
  }

  private bindEvents() {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });

    // Mouse events for desktop testing
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Prevent context menu on long press
    this.element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.startSingleTouch(e.touches[0]);
    } else if (e.touches.length === 2) {
      this.startPinch(e.touches);
    }
  }

  private handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 1 && this.isTracking) {
      this.updateSingleTouch(e.touches[0]);
    } else if (e.touches.length === 2) {
      this.updatePinch(e.touches);
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    if (e.changedTouches.length === 1 && this.isTracking) {
      this.endSingleTouch(e.changedTouches[0]);
    }
    this.clearLongPressTimer();
  }

  private handleTouchCancel(e: TouchEvent) {
    this.resetTracking();
    this.clearLongPressTimer();
  }

  private handleMouseDown(e: MouseEvent) {
    if (e.button === 0) { // Left click only
      this.startSingleTouch(e);
    }
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.isTracking) {
      this.updateSingleTouch(e);
    }
  }

  private handleMouseUp(e: MouseEvent) {
    if (this.isTracking) {
      this.endSingleTouch(e);
    }
  }

  private startSingleTouch(point: Touch | MouseEvent) {
    this.startTime = Date.now();
    this.startPoint = { x: point.clientX, y: point.clientY };
    this.currentPoint = { ...this.startPoint };
    this.isTracking = true;

    // Start long press timer
    this.longPressTimer = setTimeout(() => {
      if (this.isTracking && this.getDistance(this.startPoint, this.currentPoint) < 10) {
        this.onLongPress?.({
          duration: Date.now() - this.startTime,
          point: this.currentPoint,
        });
      }
    }, 500);
  }

  private updateSingleTouch(point: Touch | MouseEvent) {
    if (!this.isTracking) return;

    this.currentPoint = { x: point.clientX, y: point.clientY };

    // Cancel long press if moved too much
    const distance = this.getDistance(this.startPoint, this.currentPoint);
    if (distance > 10) {
      this.clearLongPressTimer();
    }
  }

  private endSingleTouch(point: Touch | MouseEvent) {
    if (!this.isTracking) return;

    const endTime = Date.now();
    const duration = endTime - this.startTime;
    const endPoint = { x: point.clientX, y: point.clientY };
    const distance = this.getDistance(this.startPoint, endPoint);
    const velocity = distance / duration;

    this.resetTracking();

    // Detect swipe
    if (distance > 50 && velocity > 0.1) {
      const direction = this.getSwipeDirection(this.startPoint, endPoint);
      this.onSwipe?.({
        direction,
        distance,
        velocity,
        duration,
        startPoint: this.startPoint,
        endPoint,
      });
    } 
    // Detect tap/double tap
    else if (distance < 10 && duration < 300) {
      this.handleTap(endPoint);
    }
  }

  private startPinch(touches: TouchList) {
    if (touches.length !== 2) return;

    const distance = this.getTouchDistance(touches[0], touches[1]);
    this.initialPinchDistance = distance;
    this.lastPinchScale = 1;
  }

  private updatePinch(touches: TouchList) {
    if (touches.length !== 2 || this.initialPinchDistance === 0) return;

    const currentDistance = this.getTouchDistance(touches[0], touches[1]);
    const scale = currentDistance / this.initialPinchDistance;
    const center = this.getTouchCenter(touches[0], touches[1]);
    const velocity = Math.abs(scale - this.lastPinchScale);

    this.lastPinchScale = scale;

    this.onPinch?.({
      scale,
      center,
      velocity,
    });
  }

  private handleTap(point: { x: number; y: number }) {
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTapTime;

    if (timeSinceLastTap < 300) {
      this.tapCount++;
      if (this.tapCount === 2) {
        this.onDoubleTap?.(point);
        this.tapCount = 0;
      }
    } else {
      this.tapCount = 1;
      setTimeout(() => {
        if (this.tapCount === 1) {
          this.onTap?.(point);
        }
        this.tapCount = 0;
      }, 300);
    }

    this.lastTapTime = now;
  }

  private getDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    return this.getDistance(
      { x: touch1.clientX, y: touch1.clientY },
      { x: touch2.clientX, y: touch2.clientY }
    );
  }

  private getTouchCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }

  private getSwipeDirection(start: { x: number; y: number }, end: { x: number; y: number }): SwipeEvent['direction'] {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }

  private resetTracking() {
    this.isTracking = false;
    this.initialPinchDistance = 0;
    this.lastPinchScale = 1;
  }

  private clearLongPressTimer() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  // Public API
  public onSwipeGesture(callback: (event: SwipeEvent) => void) {
    this.onSwipe = callback;
    return this;
  }

  public onPinchGesture(callback: (event: PinchEvent) => void) {
    this.onPinch = callback;
    return this;
  }

  public onLongPressGesture(callback: (event: LongPressEvent) => void) {
    this.onLongPress = callback;
    return this;
  }

  public onTapGesture(callback: (point: { x: number; y: number }) => void) {
    this.onTap = callback;
    return this;
  }

  public onDoubleTapGesture(callback: (point: { x: number; y: number }) => void) {
    this.onDoubleTap = callback;
    return this;
  }

  public destroy() {
    // Remove all event listeners
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    
    this.clearLongPressTimer();
  }
}

// React hook for gesture handling
export function useGestureHandler(
  ref: React.RefObject<HTMLElement>,
  options: GestureOptions = {}
) {
  const handlerRef = useRef<TouchGestureHandler | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    handlerRef.current = new TouchGestureHandler(ref.current, options);

    return () => {
      handlerRef.current?.destroy();
    };
  }, [ref, options]);

  return handlerRef.current;
}

// Utility functions for common gesture patterns
export const GestureUtils = {
  // Create swipe-to-delete behavior
  createSwipeToDelete: (element: HTMLElement, onDelete: () => void) => {
    const handler = new TouchGestureHandler(element);
    
    handler.onSwipeGesture((event) => {
      if (event.direction === 'left' && event.distance > 100) {
        element.style.transform = `translateX(-${event.distance}px)`;
        element.style.opacity = String(Math.max(0, 1 - event.distance / 200));
        
        if (event.distance > 150) {
          onDelete();
        }
      }
    });

    return handler;
  },

  // Create pinch-to-zoom behavior
  createPinchToZoom: (element: HTMLElement, minScale = 0.5, maxScale = 3) => {
    let currentScale = 1;
    
    const handler = new TouchGestureHandler(element);
    
    handler.onPinchGesture((event) => {
      currentScale = Math.min(maxScale, Math.max(minScale, event.scale));
      element.style.transform = `scale(${currentScale})`;
    });

    return handler;
  },

  // Create pull-to-refresh behavior
  createPullToRefresh: (element: HTMLElement, onRefresh: () => Promise<void>) => {
    const handler = new TouchGestureHandler(element);
    
    handler.onSwipeGesture((event) => {
      if (event.direction === 'down' && event.startPoint.y < 50 && event.distance > 80) {
        element.style.transform = `translateY(${Math.min(100, event.distance)}px)`;
        
        if (event.distance > 100) {
          onRefresh().finally(() => {
            element.style.transform = 'translateY(0)';
            element.style.transition = 'transform 0.3s ease-out';
          });
        }
      }
    });

    return handler;
  },
};

export default TouchGestureHandler;