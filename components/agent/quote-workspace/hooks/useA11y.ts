"use client";

import { useEffect, useRef, useCallback } from 'react';
import { announce, createFocusTrap, prefersReducedMotion, getAnimationDuration } from '../accessibility';

/**
 * Hook for screen reader announcements
 */
export function useAnnounce() {
  return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, []);
}

/**
 * Hook for focus trap in modals/dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      trapRef.current = createFocusTrap(containerRef.current);
      trapRef.current.activate();
    }

    return () => {
      trapRef.current?.deactivate();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for reduced motion preference
 */
export function useReducedMotion() {
  const prefersReduced = prefersReducedMotion();

  return {
    prefersReducedMotion: prefersReduced,
    getAnimationDuration: (baseMs: number) => getAnimationDuration(baseMs),
    animationProps: prefersReduced
      ? { initial: false, animate: false, exit: false }
      : {},
  };
}

/**
 * Hook for keyboard navigation in lists
 */
export function useKeyboardNavigation<T>(
  items: T[],
  onSelect: (item: T, index: number) => void,
  options: { wrap?: boolean; orientation?: 'vertical' | 'horizontal' } = {}
) {
  const { wrap = true, orientation = 'vertical' } = options;
  const activeIndexRef = useRef(0);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

    let newIndex = activeIndexRef.current;

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        newIndex = wrap
          ? (activeIndexRef.current + 1) % items.length
          : Math.min(activeIndexRef.current + 1, items.length - 1);
        break;
      case prevKey:
        e.preventDefault();
        newIndex = wrap
          ? (activeIndexRef.current - 1 + items.length) % items.length
          : Math.max(activeIndexRef.current - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[activeIndexRef.current], activeIndexRef.current);
        return;
      default:
        return;
    }

    activeIndexRef.current = newIndex;
  }, [items, onSelect, wrap, orientation]);

  return {
    activeIndex: activeIndexRef.current,
    handleKeyDown,
    setActiveIndex: (index: number) => { activeIndexRef.current = index; },
  };
}

/**
 * Hook for keyboard-accessible drag and drop
 */
export function useKeyboardDnd(
  items: { id: string }[],
  onReorder: (activeId: string, overId: string) => void
) {
  const announce = useAnnounce();
  const grabbedItemRef = useRef<string | null>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, itemId: string) => {
    const currentIndex = items.findIndex(i => i.id === itemId);
    if (currentIndex === -1) return;

    // Grab/drop with Space or Enter
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();

      if (grabbedItemRef.current === null) {
        // Grab
        grabbedItemRef.current = itemId;
        announce(`Grabbed item ${currentIndex + 1} of ${items.length}. Use arrow keys to move.`, 'assertive');
      } else {
        // Drop
        grabbedItemRef.current = null;
        announce(`Dropped item at position ${currentIndex + 1}`, 'assertive');
      }
      return;
    }

    // Cancel with Escape
    if (e.key === 'Escape' && grabbedItemRef.current !== null) {
      e.preventDefault();
      grabbedItemRef.current = null;
      announce('Reorder cancelled', 'assertive');
      return;
    }

    // Move with arrows (only when grabbed)
    if (grabbedItemRef.current !== null) {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (currentIndex > 0) {
          const targetId = items[currentIndex - 1].id;
          onReorder(grabbedItemRef.current, targetId);
          announce(`Moved to position ${currentIndex} of ${items.length}`, 'polite');
        }
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          const targetId = items[currentIndex + 1].id;
          onReorder(grabbedItemRef.current, targetId);
          announce(`Moved to position ${currentIndex + 2} of ${items.length}`, 'polite');
        }
      }
    }
  }, [items, onReorder, announce]);

  return {
    isGrabbed: (itemId: string) => grabbedItemRef.current === itemId,
    handleKeyDown,
    getInstructions: () => 'Press Space to grab. Arrow keys to move. Space to drop. Escape to cancel.',
  };
}
