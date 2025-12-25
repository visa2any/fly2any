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
 *
 * CRITICAL: Duffel offers expire 30 minutes after creation.
 * We use expires_at directly (more accurate than calculating from created_at).
 *
 * Priority for expiration check:
 * 1. expires_at / duffelMetadata.expires_at (direct from Duffel)
 * 2. lastTicketingDateTime (mapped from expires_at)
 * 3. created_at + 25 min validity (fallback)
 * 4. Assume valid (last resort for unknown offers)
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
  const now = Date.now();

  // PRIORITY 1: Use expires_at directly from Duffel (most accurate)
  let expiresAt: number | null = null;

  // Check direct expires_at field
  if (flightOffer?.expires_at) {
    expiresAt = new Date(flightOffer.expires_at).getTime();
  }
  // Check duffelMetadata.expires_at
  else if (flightOffer?.duffelMetadata?.expires_at) {
    expiresAt = new Date(flightOffer.duffelMetadata.expires_at).getTime();
  }
  // Check lastTicketingDateTime (we map expires_at to this field)
  else if (flightOffer?.lastTicketingDateTime) {
    expiresAt = new Date(flightOffer.lastTicketingDateTime).getTime();
  }

  // If we have expires_at, use direct comparison
  if (expiresAt) {
    const remainingMs = Math.max(0, expiresAt - now);
    const warningThresholdMs = 10 * 60 * 1000; // Warn at 10 min remaining
    const refreshThresholdMs = 8 * 60 * 1000;  // Suggest refresh at 8 min remaining

    console.log(`⏱️  Offer ${offerId} expires_at check:`);
    console.log(`   Expires: ${new Date(expiresAt).toISOString()}`);
    console.log(`   Now: ${new Date(now).toISOString()}`);
    console.log(`   Remaining: ${Math.floor(remainingMs / 60000)} min ${Math.floor((remainingMs % 60000) / 1000)} sec`);
    console.log(`   Valid: ${remainingMs > 0}`);

    return {
      isValid: remainingMs > 0,
      isWarning: remainingMs <= warningThresholdMs && remainingMs > 0,
      remainingMs,
      remainingSeconds: Math.floor(remainingMs / 1000),
      remainingMinutes: Math.floor(remainingMs / 60000),
      expiresAt,
      shouldRefresh: remainingMs <= refreshThresholdMs && remainingMs > 0,
      searchParams: offer?.searchParams,
    };
  }

  // PRIORITY 2: Fallback to created_at + validity period
  let createdAt: number | null = null;
  if (flightOffer?.created_at) {
    createdAt = new Date(flightOffer.created_at).getTime();
  } else if (flightOffer?.createdAt) {
    createdAt = new Date(flightOffer.createdAt).getTime();
  } else if (offer) {
    createdAt = offer.createdAt;
  }

  if (createdAt) {
    const ageMs = now - createdAt;
    const remainingMs = Math.max(0, OFFER_VALIDITY_MS - ageMs);

    console.log(`⏱️  Offer ${offerId} created_at fallback check:`);
    console.log(`   Created: ${new Date(createdAt).toISOString()}`);
    console.log(`   Age: ${Math.floor(ageMs / 60000)} min`);
    console.log(`   Remaining: ${Math.floor(remainingMs / 60000)} min`);
    console.log(`   Valid: ${remainingMs > 0}`);

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

  // PRIORITY 3: Unknown offer without any timestamp
  // CRITICAL: For Duffel offers, this means we lost the expiration data!
  // Log warning and assume valid (but flag for debugging)
  console.warn(`⚠️  OFFER ${offerId}: No expiration data found!`);
  console.warn(`   offer.expires_at: ${flightOffer?.expires_at}`);
  console.warn(`   offer.duffelMetadata?.expires_at: ${flightOffer?.duffelMetadata?.expires_at}`);
  console.warn(`   offer.lastTicketingDateTime: ${flightOffer?.lastTicketingDateTime}`);
  console.warn(`   offer.created_at: ${flightOffer?.created_at}`);
  console.warn(`   Assuming valid - but this may cause OFFER_EXPIRED at Duffel!`);

  return {
    isValid: true,
    isWarning: true, // Flag as warning since we don't know true status
    remainingMs: OFFER_VALIDITY_MS,
    remainingSeconds: Math.floor(OFFER_VALIDITY_MS / 1000),
    remainingMinutes: Math.floor(OFFER_VALIDITY_MS / 60000),
    expiresAt: now + OFFER_VALIDITY_MS,
    shouldRefresh: false,
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
