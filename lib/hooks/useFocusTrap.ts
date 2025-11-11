'use client';

import { useEffect, useRef } from 'react';

/**
 * useFocusTrap Hook
 *
 * Traps focus within a container element (e.g., modal, dialog, dropdown)
 * Ensures keyboard navigation stays within the component
 * Restores focus to the previously focused element when unmounted
 *
 * WCAG 2.1 Level A Compliance: 2.4.3 Focus Order, 2.1.2 No Keyboard Trap
 *
 * @param isActive - Whether the focus trap should be active
 * @param onEscape - Optional callback when Escape key is pressed
 * @returns ref to attach to the container element
 */

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
  restoreFocus?: boolean;
  initialFocus?: HTMLElement | null;
}

export function useFocusTrap({
  isActive,
  onEscape,
  restoreFocus = true,
  initialFocus = null,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
      return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null // Filter out hidden elements
      );
    };

    // Set initial focus
    const setInitialFocus = () => {
      const focusableElements = getFocusableElements();

      if (initialFocus && focusableElements.includes(initialFocus)) {
        initialFocus.focus();
      } else if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    };

    // Delay to ensure DOM is ready
    setTimeout(setInitialFocus, 50);

    // Handle Tab key navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab: Move focus backwards
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: Move focus forwards
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isActive, onEscape, restoreFocus, initialFocus]);

  return containerRef;
}

/**
 * Example usage:
 *
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const trapRef = useFocusTrap({
 *     isActive: isOpen,
 *     onEscape: onClose,
 *     restoreFocus: true
 *   });
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div ref={trapRef} role="dialog" aria-modal="true">
 *       <button onClick={onClose}>Close</button>
 *       <input type="text" placeholder="First focusable element" />
 *       <button>Submit</button>
 *     </div>
 *   );
 * }
 * ```
 */
