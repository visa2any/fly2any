/**
 * Guest Email Persistence
 * Captures and persists guest emails for remarketing
 * Level-6: Privacy-compliant, non-intrusive
 */

const GUEST_EMAIL_KEY = 'fly2any_guest_email';
const GUEST_DATA_KEY = 'fly2any_guest_data';
const EXPIRY_DAYS = 30;

interface GuestData {
  email: string;
  capturedAt: number;
  source: string;
  lastSearch?: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    passengers?: number;
  };
  lastViewedFlight?: {
    airline?: string;
    price?: number;
    route?: string;
  };
  consentGiven: boolean;
}

/**
 * Save guest email with metadata
 */
export function saveGuestEmail(
  email: string,
  source: string,
  consent: boolean = true
): void {
  if (typeof window === 'undefined' || !email) return;

  try {
    const existing = getGuestData();
    const data: GuestData = {
      ...existing,
      email,
      capturedAt: Date.now(),
      source,
      consentGiven: consent,
    };

    localStorage.setItem(GUEST_EMAIL_KEY, email);
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));

    // Set expiry cookie for server-side access
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
    document.cookie = `guest_email=${encodeURIComponent(email)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    // Send to backend for remarketing
    fetch('/api/tracking/guest-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source, consent }),
    }).catch(() => {}); // Silent fail

  } catch {
    // Storage unavailable
  }
}

/**
 * Get saved guest email
 */
export function getGuestEmail(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const email = localStorage.getItem(GUEST_EMAIL_KEY);
    const data = getGuestData();

    // Check expiry
    if (data && data.capturedAt) {
      const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() - data.capturedAt > expiryMs) {
        clearGuestEmail();
        return null;
      }
    }

    return email;
  } catch {
    return null;
  }
}

/**
 * Get full guest data
 */
export function getGuestData(): GuestData | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(GUEST_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Update guest search context
 */
export function updateGuestSearchContext(search: {
  origin?: string;
  destination?: string;
  departureDate?: string;
  passengers?: number;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const data = getGuestData();
    if (data) {
      data.lastSearch = search;
      localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
    }
  } catch {
    // Silent fail
  }
}

/**
 * Update last viewed flight
 */
export function updateGuestViewedFlight(flight: {
  airline?: string;
  price?: number;
  route?: string;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const data = getGuestData();
    if (data) {
      data.lastViewedFlight = flight;
      localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
    }
  } catch {
    // Silent fail
  }
}

/**
 * Clear guest email data
 */
export function clearGuestEmail(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GUEST_EMAIL_KEY);
    localStorage.removeItem(GUEST_DATA_KEY);
    document.cookie = 'guest_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  } catch {
    // Silent fail
  }
}

/**
 * Check if guest has given marketing consent
 */
export function hasGuestConsent(): boolean {
  const data = getGuestData();
  return data?.consentGiven ?? false;
}

/**
 * Auto-fill email inputs with guest email
 */
export function prefillGuestEmail(inputElement: HTMLInputElement): void {
  const email = getGuestEmail();
  if (email && inputElement && !inputElement.value) {
    inputElement.value = email;
    // Trigger change event for React
    const event = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(event);
  }
}
