/**
 * Subscription Tracker - Prevents annoying popups for already-subscribed users
 * Stores subscription status in localStorage for persistent tracking
 */

const STORAGE_KEY = 'fly2any_subscribed';
const DISMISSED_KEY = 'fly2any_popups_dismissed';

export interface SubscriptionStatus {
  subscribed: boolean;
  email?: string;
  source?: string;
  subscribedAt?: string;
}

/**
 * Check if user has already subscribed to any lead capture
 */
export function isUserSubscribed(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const status = localStorage.getItem(STORAGE_KEY);
    return status === 'true' || (status && JSON.parse(status)?.subscribed);
  } catch {
    return false;
  }
}

/**
 * Mark user as subscribed (call after successful email capture)
 */
export function markAsSubscribed(email?: string, source?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const data: SubscriptionStatus = {
      subscribed: true,
      email,
      source,
      subscribedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Fallback to simple flag
    localStorage.setItem(STORAGE_KEY, 'true');
  }
}

/**
 * Check if a specific popup type was dismissed
 */
export function isPopupDismissed(popupId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) return false;
    const data = JSON.parse(dismissed);
    return data[popupId] === true;
  } catch {
    return false;
  }
}

/**
 * Mark a popup as dismissed (user clicked X)
 */
export function markPopupDismissed(popupId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = localStorage.getItem(DISMISSED_KEY);
    const data = existing ? JSON.parse(existing) : {};
    data[popupId] = true;
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(data));
  } catch {
    // Silent fail
  }
}

/**
 * Check if any marketing popup should be shown
 * Returns false if user is subscribed OR has dismissed all popups
 */
export function shouldShowMarketingPopup(popupId?: string): boolean {
  // Never show if subscribed
  if (isUserSubscribed()) return false;

  // Check specific popup dismissal
  if (popupId && isPopupDismissed(popupId)) return false;

  return true;
}

/**
 * Reset subscription status (for testing)
 */
export function resetSubscriptionStatus(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DISMISSED_KEY);
}
