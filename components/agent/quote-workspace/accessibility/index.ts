/**
 * Accessibility Utilities for Quote Workspace
 * WCAG 2.2 AA Compliant
 */

// Live region announcements
let announcer: HTMLDivElement | null = null;

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return;

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
    document.body.appendChild(announcer);
  }

  announcer.setAttribute('aria-live', priority);
  announcer.textContent = '';
  requestAnimationFrame(() => {
    if (announcer) announcer.textContent = message;
  });
}

// Focus trap for modals
export function createFocusTrap(containerRef: HTMLElement | null) {
  if (!containerRef) return { activate: () => {}, deactivate: () => {} };

  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const getFocusableElements = () => {
    return Array.from(containerRef.querySelectorAll<HTMLElement>(focusableSelectors))
      .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  let previousActiveElement: Element | null = null;

  return {
    activate: () => {
      previousActiveElement = document.activeElement;
      containerRef.addEventListener('keydown', handleKeyDown);
      const focusable = getFocusableElements();
      if (focusable.length > 0) focusable[0].focus();
    },
    deactivate: () => {
      containerRef.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    }
  };
}

// Keyboard navigation for drag-and-drop
export const KEYBOARD_DND_KEYS = {
  MOVE_UP: ['ArrowUp', 'k'],
  MOVE_DOWN: ['ArrowDown', 'j'],
  GRAB: [' ', 'Enter'],
  DROP: [' ', 'Enter'],
  CANCEL: ['Escape'],
};

export function getKeyboardDndInstructions() {
  return 'Press Space or Enter to grab item. Use arrow keys to reorder. Press Space or Enter to drop, or Escape to cancel.';
}

// ARIA labels for common actions
export const ARIA_LABELS = {
  // Quote actions
  removeItem: (itemName: string) => `Remove ${itemName} from quote`,
  editItem: (itemName: string) => `Edit ${itemName} details`,
  expandItem: (itemName: string, isExpanded: boolean) =>
    isExpanded ? `Collapse ${itemName} details` : `Expand ${itemName} details`,
  dragItem: (itemName: string) => `Drag to reorder ${itemName}. ${getKeyboardDndInstructions()}`,

  // Navigation
  closeModal: 'Close dialog',
  openMenu: 'Open actions menu',
  nextPage: 'Go to next page',
  prevPage: 'Go to previous page',

  // Search
  searchFlights: 'Search for flights',
  searchHotels: 'Search for hotels',
  searchActivities: 'Search for activities',
  clearSearch: 'Clear search results',

  // Quote management
  saveQuote: 'Save quote draft',
  sendQuote: 'Send quote to client',
  previewQuote: 'Preview client view',
  approveQuote: 'Approve this quote',
  askQuestions: 'Ask agent questions about this quote',
};

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  timeline: 'Travel itinerary timeline, organized by day',
  dayGroup: (dayNum: number, date: string) => `Day ${dayNum}, ${date}`,
  priceTotal: 'Total trip price',
  itemList: 'List of booked items for this day',
};

// Reduced motion check
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Animation duration based on user preference
export function getAnimationDuration(baseMs: number): number {
  return prefersReducedMotion() ? 0 : baseMs;
}

// Skip link for keyboard users
export function SkipLink({ targetId, children = 'Skip to main content' }: { targetId: string; children?: string }) {
  return `<a href="#${targetId}" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-primary-500">${children}</a>`;
}
