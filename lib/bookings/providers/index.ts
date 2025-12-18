/**
 * Booking Providers Index
 * Plug-and-play provider exports
 */

// Types
export * from './types';

// Adapters
export { duffelAdapter, DuffelAdapter } from './duffel-adapter';
// export { amadeusAdapter, AmadeusAdapter } from './amadeus-adapter'; // Future
// export { sabreAdapter, SabreAdapter } from './sabre-adapter';       // Future

// Provider registry
import { duffelAdapter } from './duffel-adapter';
import type { BookingProvider } from './types';

export const providers: Record<string, BookingProvider> = {
  duffel: duffelAdapter,
  // amadeus: amadeusAdapter, // Future
};

/**
 * Get provider adapter by code
 */
export function getProvider(code: string): BookingProvider | null {
  return providers[code.toLowerCase()] || null;
}

/**
 * List available providers
 */
export function listProviders(): string[] {
  return Object.keys(providers);
}
