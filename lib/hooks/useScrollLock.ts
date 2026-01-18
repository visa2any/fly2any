/**
 * Centralized Scroll Lock Manager - BULLETPROOF VERSION
 *
 * Uses data attribute counting instead of JS variable to survive HMR/navigation.
 * Directly checks DOM state for maximum reliability.
 */

import { useCallback, useEffect, useId } from 'react';

// Utility to get/set lock count from DOM (survives JS reloads)
const getLockCount = (): number => {
  if (typeof document === 'undefined') return 0;
  return parseInt(document.body.dataset.scrollLockCount || '0', 10);
};

const setLockCount = (count: number): void => {
  if (typeof document === 'undefined') return;
  document.body.dataset.scrollLockCount = String(Math.max(0, count));
};

const applyScrollLock = (): void => {
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  // body.style.touchAction = 'none'; // REMOVED: Blocks all touch events, breaking scroll after unlock if not careful
  body.style.height = '100%';
};

const removeScrollLock = (): void => {
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = '';
  body.style.overflow = '';
  body.style.touchAction = '';
  body.style.height = '';
};

export function useScrollLock() {
  // Unique ID per hook instance to track this component's lock
  const lockId = useId();

  const lockScroll = useCallback(() => {
    if (typeof document === 'undefined') return;

    // Check if this component already has a lock
    const lockedBy = document.body.dataset.scrollLockedBy || '';
    if (lockedBy.includes(lockId)) return; // Already locked by this component

    // Add this component's ID to lock list
    const newLockedBy = lockedBy ? `${lockedBy},${lockId}` : lockId;
    document.body.dataset.scrollLockedBy = newLockedBy;

    // Increment count and apply lock
    const count = getLockCount() + 1;
    setLockCount(count);

    if (count === 1) {
      applyScrollLock();
    }
  }, [lockId]);

  const unlockScroll = useCallback(() => {
    if (typeof document === 'undefined') return;

    // Check if this component has a lock
    const lockedBy = document.body.dataset.scrollLockedBy || '';
    if (!lockedBy.includes(lockId)) return; // This component didn't lock

    // Remove this component's ID from lock list
    const newLockedBy = lockedBy
      .split(',')
      .filter((id) => id !== lockId)
      .join(',');
    document.body.dataset.scrollLockedBy = newLockedBy || '';

    // Decrement count
    const count = Math.max(0, getLockCount() - 1);
    setLockCount(count);

    // Remove lock only when count reaches 0
    if (count === 0) {
      removeScrollLock();
    }
  }, [lockId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Force cleanup for this component
      if (typeof document === 'undefined') return;
      const lockedBy = document.body.dataset.scrollLockedBy || '';
      if (lockedBy.includes(lockId)) {
        const newLockedBy = lockedBy
          .split(',')
          .filter((id) => id !== lockId)
          .join(',');
        document.body.dataset.scrollLockedBy = newLockedBy || '';
        const count = Math.max(0, getLockCount() - 1);
        setLockCount(count);
        if (count === 0) removeScrollLock();
      }
    };
  }, [lockId]);

  return { lockScroll, unlockScroll };
}
