/**
 * Saved Searches & Price Alerts
 *
 * Allows users to:
 * - Save search parameters + filters
 * - Set price drop alerts
 * - Access search history
 * - Share saved searches
 */

'use client';

import { FlightFilters } from '@/components/flights/FlightFilters';

export interface SavedSearch {
  id: string;
  name: string; // "NYC to Paris - Direct, Business"
  route: {
    from: string;
    to: string;
    departure: string;
    return?: string;
    adults: number;
    children: number;
    infants: number;
    class: 'economy' | 'premium' | 'business' | 'first';
  };
  filters: FlightFilters;
  createdAt: number;
  lastChecked?: number;
  priceAlert?: {
    enabled: boolean;
    targetPrice: number; // Alert when price drops below this
    currentPrice: number;
    lastNotified?: number;
  };
}

const STORAGE_KEY = 'fly2any_saved_searches';
const MAX_SAVED_SEARCHES = 20;

/**
 * Get all saved searches from localStorage
 */
export function getSavedSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const searches: SavedSearch[] = JSON.parse(stored);

    // Sort by most recently created
    return searches.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error loading saved searches:', error);
    return [];
  }
}

/**
 * Save a new search
 */
export function saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt'>): SavedSearch {
  const newSearch: SavedSearch = {
    ...search,
    id: `search_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    createdAt: Date.now()
  };

  try {
    const existing = getSavedSearches();

    // Check for duplicate
    const duplicate = existing.find(
      s =>
        s.route.from === newSearch.route.from &&
        s.route.to === newSearch.route.to &&
        s.route.departure === newSearch.route.departure
    );

    if (duplicate) {
      // Update existing search instead
      return updateSearch(duplicate.id, newSearch);
    }

    // Add new search
    const updated = [newSearch, ...existing].slice(0, MAX_SAVED_SEARCHES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    console.log('✅ Saved search:', newSearch.name);
    return newSearch;
  } catch (error) {
    console.error('Error saving search:', error);
    throw error;
  }
}

/**
 * Update an existing search
 */
export function updateSearch(id: string, updates: Partial<SavedSearch>): SavedSearch {
  try {
    const searches = getSavedSearches();
    const index = searches.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error('Search not found');
    }

    const updated = {
      ...searches[index],
      ...updates,
      id: searches[index].id, // Preserve original ID
      createdAt: searches[index].createdAt // Preserve creation time
    };

    searches[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));

    console.log('✅ Updated search:', updated.name);
    return updated;
  } catch (error) {
    console.error('Error updating search:', error);
    throw error;
  }
}

/**
 * Delete a saved search
 */
export function deleteSearch(id: string): void {
  try {
    const searches = getSavedSearches();
    const filtered = searches.filter(s => s.id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('✅ Deleted search:', id);
  } catch (error) {
    console.error('Error deleting search:', error);
    throw error;
  }
}

/**
 * Get a single saved search by ID
 */
export function getSavedSearch(id: string): SavedSearch | null {
  const searches = getSavedSearches();
  return searches.find(s => s.id === id) || null;
}

/**
 * Generate a descriptive name for a search based on filters
 */
export function generateSearchName(
  route: SavedSearch['route'],
  filters: FlightFilters
): string {
  const parts: string[] = [`${route.from} to ${route.to}`];

  // Add key filter highlights
  if (filters.stops.includes('direct')) {
    parts.push('Direct');
  }

  if (filters.cabinClass.length === 1) {
    const cabin = filters.cabinClass[0];
    if (cabin === 'BUSINESS') parts.push('Business');
    else if (cabin === 'FIRST') parts.push('First Class');
    else if (cabin === 'PREMIUM_ECONOMY') parts.push('Premium');
  }

  if (filters.baggageIncluded) {
    parts.push('Bags included');
  }

  if (filters.refundableOnly) {
    parts.push('Refundable');
  }

  if (filters.airlines.length === 1) {
    parts.push(filters.airlines[0]);
  }

  // Join with dashes
  return parts.join(' - ');
}

/**
 * Set price alert for a search
 */
export function setPriceAlert(
  searchId: string,
  targetPrice: number,
  currentPrice: number
): SavedSearch {
  return updateSearch(searchId, {
    priceAlert: {
      enabled: true,
      targetPrice,
      currentPrice,
      lastNotified: undefined
    }
  });
}

/**
 * Update current price for a search (used by background check)
 */
export function updateSearchPrice(searchId: string, newPrice: number): SavedSearch {
  const search = getSavedSearch(searchId);

  if (!search) {
    throw new Error('Search not found');
  }

  return updateSearch(searchId, {
    lastChecked: Date.now(),
    priceAlert: search.priceAlert ? {
      ...search.priceAlert,
      currentPrice: newPrice
    } : undefined
  });
}

/**
 * Check if price alert should trigger
 */
export function shouldNotifyPriceAlert(search: SavedSearch): boolean {
  if (!search.priceAlert?.enabled) return false;

  const { targetPrice, currentPrice, lastNotified } = search.priceAlert;

  // Price dropped below target
  if (currentPrice >= targetPrice) return false;

  // Don't notify more than once per day
  if (lastNotified && Date.now() - lastNotified < 24 * 60 * 60 * 1000) {
    return false;
  }

  return true;
}

/**
 * Mark price alert as notified
 */
export function markAlertNotified(searchId: string): SavedSearch {
  const search = getSavedSearch(searchId);

  if (!search || !search.priceAlert) {
    throw new Error('Search or alert not found');
  }

  return updateSearch(searchId, {
    priceAlert: {
      ...search.priceAlert,
      lastNotified: Date.now()
    }
  });
}

/**
 * Get searches with active price alerts
 */
export function getSearchesWithAlerts(): SavedSearch[] {
  const searches = getSavedSearches();
  return searches.filter(s => s.priceAlert?.enabled);
}

/**
 * Disable price alert for a search
 */
export function disablePriceAlert(searchId: string): SavedSearch {
  const search = getSavedSearch(searchId);

  if (!search) {
    throw new Error('Search not found');
  }

  return updateSearch(searchId, {
    priceAlert: search.priceAlert ? {
      ...search.priceAlert,
      enabled: false
    } : undefined
  });
}

/**
 * Clear all saved searches (for user privacy/reset)
 */
export function clearAllSavedSearches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Cleared all saved searches');
  } catch (error) {
    console.error('Error clearing saved searches:', error);
    throw error;
  }
}

/**
 * Export saved searches as JSON (for backup/portability)
 */
export function exportSavedSearches(): string {
  const searches = getSavedSearches();
  return JSON.stringify(searches, null, 2);
}

/**
 * Import saved searches from JSON
 */
export function importSavedSearches(json: string): void {
  try {
    const searches: SavedSearch[] = JSON.parse(json);

    // Validate structure
    if (!Array.isArray(searches)) {
      throw new Error('Invalid format: expected array');
    }

    for (const search of searches) {
      if (!search.id || !search.name || !search.route || !search.filters) {
        throw new Error('Invalid search structure');
      }
    }

    // Merge with existing (keeping most recent)
    const existing = getSavedSearches();
    const merged = [...searches, ...existing]
      .reduce((acc, search) => {
        const existing = acc.find(s => s.id === search.id);
        if (!existing) {
          acc.push(search);
        }
        return acc;
      }, [] as SavedSearch[])
      .slice(0, MAX_SAVED_SEARCHES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    console.log('✅ Imported saved searches:', searches.length);
  } catch (error) {
    console.error('Error importing saved searches:', error);
    throw error;
  }
}

/**
 * Get recently viewed searches (last 7 days)
 */
export function getRecentSearches(): SavedSearch[] {
  const searches = getSavedSearches();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return searches.filter(s => s.createdAt > sevenDaysAgo);
}

/**
 * Get search statistics
 */
export interface SearchStats {
  totalSearches: number;
  searchesWithAlerts: number;
  mostSearchedRoutes: Array<{ route: string; count: number }>;
  avgPriceByRoute: Array<{ route: string; avgPrice: number }>;
}

export function getSearchStats(): SearchStats {
  const searches = getSavedSearches();

  // Count by route
  const routeCounts = searches.reduce((acc, search) => {
    const route = `${search.route.from}-${search.route.to}`;
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Average price by route
  const routePrices = searches.reduce((acc, search) => {
    const route = `${search.route.from}-${search.route.to}`;
    if (!acc[route]) acc[route] = [];
    if (search.priceAlert) {
      acc[route].push(search.priceAlert.currentPrice);
    }
    return acc;
  }, {} as Record<string, number[]>);

  return {
    totalSearches: searches.length,
    searchesWithAlerts: searches.filter(s => s.priceAlert?.enabled).length,
    mostSearchedRoutes: Object.entries(routeCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    avgPriceByRoute: Object.entries(routePrices)
      .map(([route, prices]) => ({
        route,
        avgPrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 5)
  };
}
