// Quote Workspace - Level 6 Ultra-Premium Quote Builder
// Export all components for clean imports

export { QuoteWorkspaceProvider, useQuoteWorkspace, useQuoteItems, useQuotePricing, useQuoteUI, useQuoteClient } from "./QuoteWorkspaceProvider";
export { default as QuoteWorkspaceLayout } from "./QuoteWorkspaceLayout";
export { default as QuoteHeader } from "./QuoteHeader";
export { default as QuoteFooter } from "./QuoteFooter";

// Discovery Zone
export { default as DiscoveryZone } from "./discovery/DiscoveryZone";
export { default as FlightSearchPanel } from "./discovery/FlightSearchPanel";
export { default as HotelSearchPanel } from "./discovery/HotelSearchPanel";

// Itinerary Zone
export { default as ItineraryZone } from "./itinerary/ItineraryZone";
export { default as ItineraryTimeline } from "./itinerary/ItineraryTimeline";
export { default as ItineraryCard } from "./itinerary/ItineraryCard";
export { default as SortableItineraryCard } from "./itinerary/SortableItineraryCard";
export { default as DayMarker } from "./itinerary/DayMarker";
export { default as EmptyItinerary } from "./itinerary/EmptyItinerary";

// Pricing Zone
export { default as PricingZone } from "./pricing/PricingZone";

// Overlays
export { default as ClientSelectModal } from "./overlays/ClientSelectModal";
export { default as QuotePreviewOverlay } from "./overlays/QuotePreviewOverlay";
export { default as SendQuoteModal } from "./overlays/SendQuoteModal";

// Types
export * from "./types/quote-workspace.types";
