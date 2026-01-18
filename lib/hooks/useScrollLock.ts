/**
 * Centralized Scroll Lock Manager
 * Prevents conflicts when multiple modals/sheets try to lock scroll
 *
 * CRITICAL: Tracks lock count to ensure scroll only unlocks when ALL locks released
 * FIX: Uses useCallback + useEffect for proper React lifecycle management
 */

import { useCallback, useEffect, useRef } from 'react';

// Track active locks globally (but reset on page load)
let globalLockCount = 0;

// Reset scroll state on initial page load (fixes stale state from navigation)
if (typeof window !== 'undefined') {
  const resetScrollState = () => {
    globalLockCount = 0;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.height = '';
    delete document.body.dataset.originalOverflow;
    delete document.documentElement.dataset.originalOverflow;
  };

  // Reset on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resetScrollState, { once: true });
  } else {
    resetScrollState();
  }
}

export function useScrollLock() {
  const isLocked = useRef(false);

  const lockScroll = useCallback(() => {
    if (isLocked.current) return; // Prevent double-locking from same component

    isLocked.current = true;
    globalLockCount++;

    // Only apply styles on first lock
    if (globalLockCount === 1) {
      const html = document.documentElement;
      const body = document.body;

      // Save original overflow
      body.dataset.originalOverflow = body.style.overflow || '';
      html.dataset.originalOverflow = html.style.overflow || '';

      // Lock scroll (Chrome + Firefox + iOS compatible)
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none';
      body.style.height = '100%';
    }
  }, []);

  const unlockScroll = useCallback(() => {
    if (!isLocked.current) return; // Only unlock if this component locked

    isLocked.current = false;
    globalLockCount = Math.max(0, globalLockCount - 1);

    // Only unlock when ALL locks released
    if (globalLockCount === 0) {
      const html = document.documentElement;
      const body = document.body;

      // Restore original values
      html.style.overflow = html.dataset.originalOverflow || '';
      body.style.overflow = body.dataset.originalOverflow || '';
      body.style.touchAction = '';
      body.style.height = '';

      // Cleanup
      delete body.dataset.originalOverflow;
      delete html.dataset.originalOverflow;
    }
  }, []);

  // Cleanup on unmount - ensures no orphan locks
  useEffect(() => {
    return () => {
      if (isLocked.current) {
        isLocked.current = false;
        globalLockCount = Math.max(0, globalLockCount - 1);

        if (globalLockCount === 0) {
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
          document.body.style.touchAction = '';
          document.body.style.height = '';
        }
      }
    };
  }, []);

  return { lockScroll, unlockScroll };
}
