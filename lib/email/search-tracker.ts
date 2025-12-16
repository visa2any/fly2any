/**
 * Search Tracking for Email Campaigns
 *
 * Tracks flight searches for abandoned search recovery emails.
 * Call from client-side after user searches and doesn't book.
 */

import { triggerEmailEvent } from './event-triggers';
import { autoStartCampaign } from './campaign-flows';

interface SearchData {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass?: string;
  lowestPrice?: number;
  currency?: string;
}

// In-memory cache of recent searches (for deduplication)
const recentSearches = new Map<string, number>();

/**
 * Track a flight search for email campaigns
 * Called when user performs a search but doesn't proceed to booking
 */
export async function trackFlightSearch(
  email: string,
  userId: string | undefined,
  data: SearchData
): Promise<void> {
  if (!email) return;

  // Deduplicate: don't track same search within 30 minutes
  const searchKey = `${email}:${data.origin}:${data.destination}:${data.departureDate}`;
  const lastSearch = recentSearches.get(searchKey);
  if (lastSearch && Date.now() - lastSearch < 30 * 60 * 1000) {
    return;
  }
  recentSearches.set(searchKey, Date.now());

  // Clean old entries (keep map small)
  if (recentSearches.size > 1000) {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [key, time] of recentSearches) {
      if (time < cutoff) recentSearches.delete(key);
    }
  }

  const searchUrl = `https://www.fly2any.com/flights?from=${data.origin}&to=${data.destination}&date=${data.departureDate}${data.returnDate ? `&return=${data.returnDate}` : ''}`;

  // Trigger search event for potential abandoned search emails
  await triggerEmailEvent('flight_search', email, {
    origin: data.origin,
    destination: data.destination,
    departureDate: data.departureDate,
    returnDate: data.returnDate,
    passengers: data.adults,
    cabinClass: data.cabinClass || 'economy',
    lowestPrice: data.lowestPrice,
    currency: data.currency || 'USD',
    resume_search_url: searchUrl,
  }, userId);

  // Auto-start abandoned search recovery campaign
  if (userId) {
    await autoStartCampaign('flight_search', userId, email, {
      origin: data.origin,
      destination: data.destination,
      departureDate: data.departureDate,
      lowestPrice: data.lowestPrice,
      resume_search_url: searchUrl,
    });
  }
}

/**
 * Track booking started (for cart abandonment)
 * Called when user starts checkout but doesn't complete
 */
export async function trackBookingStarted(
  email: string,
  userId: string | undefined,
  data: {
    origin: string;
    destination: string;
    departureDate: string;
    price: number;
    currency: string;
    offerId?: string;
  }
): Promise<void> {
  if (!email) return;

  const bookingUrl = `https://www.fly2any.com/booking?offer=${data.offerId || ''}`;

  await triggerEmailEvent('booking_started', email, {
    origin: data.origin,
    destination: data.destination,
    departureDate: data.departureDate,
    price: data.price,
    currency: data.currency,
    booking_url: bookingUrl,
  }, userId);

  // Auto-start booking recovery campaign
  if (userId) {
    await autoStartCampaign('booking_started', userId, email, {
      origin: data.origin,
      destination: data.destination,
      price: data.price,
      booking_url: bookingUrl,
    });
  }
}
