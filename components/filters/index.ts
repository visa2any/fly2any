/**
 * Advanced Filter Components
 *
 * Mobile-first filter system with URL persistence and advanced features
 */

export { default as StickyFilterBar } from './StickyFilterBar';
export { default as MobileFilterSheet } from './MobileFilterSheet';
export { default as SaveSearchButton } from './SaveSearchButton';

// Re-export filter utilities
export {
  filtersToURL,
  filtersFromURL,
  mergeWithDefaults,
  hasActiveFilters,
  countActiveFilters,
  getFilterSummary,
  type URLFilterState,
  type FilterSummary
} from '@/lib/filters/filterState';

export {
  saveSearch,
  getSavedSearches,
  getSavedSearch,
  updateSearch,
  deleteSearch,
  setPriceAlert,
  disablePriceAlert,
  generateSearchName,
  getSearchesWithAlerts,
  type SavedSearch
} from '@/lib/filters/savedSearches';
