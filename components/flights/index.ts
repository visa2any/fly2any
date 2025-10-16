/**
 * Flight Components - Centralized Exports
 *
 * Main Components:
 * - FlightCardCompact: Ultra-optimized card (60% smaller, 150% more visible)
 * - FlightCardEnhanced: Feature-rich card with all conversion elements
 * - FlightCard: Original card with traditional layout
 * - FlightResults: Results list container
 */

// Optimized Cards (Recommended)
export { FlightCardCompact } from './FlightCardCompact';
export type { FlightCardCompactProps } from './FlightCardCompact';

// Enhanced Cards
export { FlightCardEnhanced } from './FlightCardEnhanced';
export type { EnhancedFlightCardProps } from './FlightCardEnhanced';

// Original Card
export { FlightCard } from './FlightCard';
export type { FlightCardProps, FlightSegment, FlightItinerary, FlightPrice, ValidatingAirline, BadgeType } from './FlightCard';

// Results Container
export { default as FlightResults } from './FlightResults';

// Supporting Components
export { default as FlightFilters } from './FlightFilters';
export { default as SortBar } from './SortBar';
export { default as SearchSummaryBar } from './SearchSummaryBar';
export { default as PriceInsights } from './PriceInsights';
export { default as FlightComparison } from './FlightComparison';
export { default as FlexibleDates } from './FlexibleDates';
export { default as SmartWait } from './SmartWait';
export { default as ScrollToTop } from './ScrollToTop';
export { default as ScrollProgress, ScrollProgress as ScrollProgressComponent } from './ScrollProgress';
export { default as VirtualFlightList, VirtualFlightList as VirtualFlightListComponent } from './VirtualFlightList';
export { default as PriceAlerts } from './PriceAlerts';
export { default as FlightInspiration } from './FlightInspiration';
export { default as CheapestDates } from './CheapestDates';

// Conversion Optimization Components
export { default as BrandedFares } from './BrandedFares';
export { default as SeatMapViewer } from './SeatMapViewer';
export { default as CrossSellWidget } from './CrossSellWidget';
export { default as UrgencyIndicators } from './UrgencyIndicators';
export { default as SocialProof } from './SocialProof';
export { default as PriceAnchoringBadge } from './PriceAnchoringBadge';
export { default as CO2Badge } from './CO2Badge';

// Alternative Airports Widget
export { default as AlternativeAirports } from './AlternativeAirports';
export { default as AlternativeAirportsDemo } from './AlternativeAirportsDemo';

// Alternative Airports Types and Utilities
export type {
  Airport,
  AlternativeAirport,
  TransportOption,
  AirportGroup
} from '@/lib/airports/alternatives';

export {
  getAlternativeAirports,
  hasAlternatives,
  getAirportGroup,
  getCheapestTransport,
  getFastestTransport,
  calculateTotalCost
} from '@/lib/airports/alternatives';

// Skeletons
export { default as FlightCardSkeleton } from './FlightCardSkeleton';
export { default as ResultsSkeleton } from './ResultsSkeleton';
