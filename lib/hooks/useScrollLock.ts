/**
 * Centralized Scroll Lock Manager
 * Prevents conflicts when multiple modals/sheets try to lock scroll
 * 
 * CRITICAL: Tracks lock count to ensure scroll only unlocks when ALL locks released
 */

let lockCount = 0;

export function useScrollLock() {
  const lockScroll = () => {
    lockCount++;

    // Only apply styles on first lock
    if (lockCount === 1) {
      const html = document.documentElement;
      const body = document.body;

      // Save original overflow to restore later
      body.dataset.originalOverflow = body.style.overflow || '';
      html.dataset.originalOverflow = html.style.overflow || '';

      // Lock scroll (Chrome + Firefox + iOS compatible)
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none';
      body.style.height = '100%';
    }
  };

  const unlockScroll = () => {
    lockCount = Math.max(0, lockCount - 1);

    // Only unlock when ALL locks released
    if (lockCount === 0) {
      const html = document.documentElement;
      const body = document.body;

      // Restore original values
      html.style.overflow = html.dataset.originalOverflow || '';
      body.style.overflow = body.dataset.originalOverflow || '';
      body.style.touchAction = '';
      body.style.height = '';

      // Cleanup data attributes
      delete body.dataset.originalOverflow;
      delete html.dataset.originalOverflow;
    }
  };

  return { lockScroll, unlockScroll };
}
