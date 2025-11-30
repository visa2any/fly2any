// Hotel Components - Central Exports
// All hotel-related components for the FLY2ANY platform

// Core Components
export { HotelCard } from './HotelCard';
export { HotelCardSkeleton } from './HotelCardSkeleton';
export { default as HotelFilters } from './HotelFilters';
export type { HotelFiltersType } from './HotelFilters';
export { default as HotelResults } from './HotelResults';
export { HotelReviews } from './HotelReviews';

// Trust & Urgency Signals
export { HotelTrustBadges, TrustStrip } from './HotelTrustBadges';
export { HotelUrgencySignals } from './HotelUrgencySignals';

// Booking Flow Components
export { default as PromoCodeInput } from './PromoCodeInput';

// AI & Search Features
export { SmartSearchInput } from './SmartSearchInput';
export { SmartFilters } from './SmartFilters';

// Weather Integration
export { WeatherBadge, WeatherBadgeInline } from './WeatherBadge';

// Compare & Calendar
export { HotelCompare, CompareBar } from './HotelCompare';
export { PriceCalendar } from './PriceCalendar';

// Add-ons / Upsell
export { AddOnsSelector, AddOnsSelectorCompact } from './AddOnsSelector';
