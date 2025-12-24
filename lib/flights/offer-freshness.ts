/**
 * Offer Freshness Service — Fly2Any
 *
 * Manages flight offer lifecycle to prevent OFFER_EXPIRED errors.
 * Duffel offers expire after 30 minutes from creation.
 */

// Offer validity duration (Duffel = 30 min, we use 25 min for safety buffer)
export const OFFER_VALIDITY_MS = 25 * 60 * 1000; // 25 minutes
export const OFFER_WARNING_MS = 20 * 60 * 1000;  // Warn at 20 min
export const OFFER_REFRESH_MS = 22 * 60 * 1000;  // Auto-refresh at 22 min

interface OfferTimestamp {
  offerId: string;
  createdAt: number;
  searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
  };
}

// In-memory cache of offer timestamps
const offerCache = new Map<string, OfferTimestamp>();

/**
 * Register an offer with its creation timestamp
 */
export function registerOffer(
  offerId: string,
  searchParams: OfferTimestamp['searchParams'],
  createdAt?: number
): void {
  offerCache.set(offerId, {
    offerId,
    createdAt: createdAt || Date.now(),
    searchParams,
  });

  // Auto-cleanup old entries (1 hour)
  cleanupOldOffers();
}

/**
 * Get offer freshness status
 * Also accepts optional flightOffer object to extract created_at directly
 */
export function getOfferStatus(offerId: string, flightOffer?: any): {
  isValid: boolean;
  isWarning: boolean;
  remainingMs: number;
  remainingSeconds: number;
  remainingMinutes: number;
  expiresAt: number;
  shouldRefresh: boolean;
  searchParams?: OfferTimestamp['searchParams'];
} {
  const offer = offerCache.get(offerId);

  // Try to extract created_at from offer object if provided (Duffel includes this)
  let createdAt: number | null = null;
  if (flightOffer?.created_at) {
    createdAt = new Date(flightOffer.created_at).getTime();
  } else if (flightOffer?.createdAt) {
    createdAt = new Date(flightOffer.createdAt).getTime();
  } else if (offer) {
    createdAt = offer.createdAt;
  }

  if (!createdAt) {
    // Unknown offer without timestamp - assume it was just created
    return {
      isValid: true,
      isWarning: false,
      remainingMs: OFFER_VALIDITY_MS,
      remainingSeconds: Math.floor(OFFER_VALIDITY_MS / 1000),
      remainingMinutes: Math.floor(OFFER_VALIDITY_MS / 60000),
      expiresAt: Date.now() + OFFER_VALIDITY_MS,
      shouldRefresh: false,
    };
  }

  const ageMs = Date.now() - createdAt;
  const remainingMs = Math.max(0, OFFER_VALIDITY_MS - ageMs);

  return {
    isValid: remainingMs > 0,
    isWarning: ageMs >= OFFER_WARNING_MS,
    remainingMs,
    remainingSeconds: Math.floor(remainingMs / 1000),
    remainingMinutes: Math.floor(remainingMs / 60000),
    expiresAt: createdAt + OFFER_VALIDITY_MS,
    shouldRefresh: ageMs >= OFFER_REFRESH_MS,
    searchParams: offer?.searchParams,
  };
}

/**
 * Check if offer is expired
 */
export function isOfferExpired(offerId: string): boolean {
  const status = getOfferStatus(offerId);
  return !status.isValid;
}

/**
 * Check if offer needs refresh
 */
export function shouldRefreshOffer(offerId: string): boolean {
  const status = getOfferStatus(offerId);
  return status.shouldRefresh;
}

/**
 * Remove offer from cache (when used or expired)
 */
export function removeOffer(offerId: string): void {
  offerCache.delete(offerId);
}

/**
 * Clean up expired offers from cache
 */
function cleanupOldOffers(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  for (const [id, offer] of offerCache.entries()) {
    if (offer.createdAt < oneHourAgo) {
      offerCache.delete(id);
    }
  }
}

/**
 * Parse offer creation time from Duffel offer (if available)
 */
export function parseOfferCreatedAt(offer: any): number {
  // Duffel includes created_at in offer response
  if (offer.created_at) {
    return new Date(offer.created_at).getTime();
  }
  // Fallback to current time
  return Date.now();
}

/**
 * Build search URL for re-search
 */
export function buildSearchUrl(searchParams: OfferTimestamp['searchParams']): string {
  const params = new URLSearchParams({
    from: searchParams.origin,
    to: searchParams.destination,
    departure: searchParams.departureDate,
    adults: searchParams.passengers.toString(),
  });

  if (searchParams.returnDate) {
    params.set('return', searchParams.returnDate);
  }

  return `/flights/results?${params.toString()}`;
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(remainingMs: number): string {
  if (remainingMs <= 0) return 'Expired';

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
