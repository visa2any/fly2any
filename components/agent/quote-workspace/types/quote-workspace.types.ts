// Quote Workspace Types - Level 6 Ultra-Premium Quote Builder

export type ProductType = 'flight' | 'hotel' | 'car' | 'activity' | 'transfer' | 'insurance' | 'custom';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired' | 'declined';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

// Base product interface
export interface QuoteItemBase {
  id: string;
  type: ProductType;
  price: number;
  currency: Currency;
  sortOrder: number;
  date: string; // ISO date for timeline grouping
  createdAt: string;
}

// Flight item
export interface FlightItem extends QuoteItemBase {
  type: 'flight';
  airline: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  passengers: number;
  baggage?: string;
  apiSource?: 'amadeus' | 'duffel';
  apiOfferId?: string;
}

// Hotel item
export interface HotelItem extends QuoteItemBase {
  type: 'hotel';
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  stars: number;
  amenities: string[];
  image?: string;
  guests: number;
  apiSource?: 'liteapi';
  apiOfferId?: string;
}

// Car rental item
export interface CarItem extends QuoteItemBase {
  type: 'car';
  company: string;
  carType: string;
  carClass: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  days: number;
  features: string[];
  image?: string;
}

// Activity item
export interface ActivityItem extends QuoteItemBase {
  type: 'activity';
  name: string;
  location: string;
  description: string;
  duration: string;
  time?: string;
  participants: number;
  includes: string[];
  image?: string;
  apiSource?: 'viator';
  apiOfferId?: string;
}

// Transfer item
export interface TransferItem extends QuoteItemBase {
  type: 'transfer';
  provider: string;
  vehicleType: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  passengers: number;
  meetAndGreet: boolean;
  apiSource?: 'viator';
  apiOfferId?: string;
}

// Insurance item
export interface InsuranceItem extends QuoteItemBase {
  type: 'insurance';
  provider: string;
  planName: string;
  coverage: string[];
  travelers: number;
  startDate: string;
  endDate: string;
}

// Custom item
export interface CustomItem extends QuoteItemBase {
  type: 'custom';
  name: string;
  description: string;
  category: string;
  quantity: number;
}

// Union type for all quote items
export type QuoteItem = FlightItem | HotelItem | CarItem | ActivityItem | TransferItem | InsuranceItem | CustomItem;

// Traveler breakdown
export interface Travelers {
  adults: number;
  children: number;
  infants: number;
  total: number;
}

// Pricing state
export interface QuotePricing {
  subtotal: number;
  markupPercent: number;
  markupAmount: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  perPerson: number;
  currency: Currency;
}

// Client reference
export interface QuoteClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// UI state (non-persisted)
export interface WorkspaceUI {
  activeTab: ProductType;
  searchQuery: string;
  searchLoading: boolean;
  searchResults: any[] | null;
  expandedItemId: string | null;
  previewOpen: boolean;
  clientModalOpen: boolean;
  sendModalOpen: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  sidebarExpanded: boolean;
  discoveryPanelWidth: number;
  searchFormCollapsed: boolean;
}

// Main workspace state
export interface QuoteWorkspaceState {
  // Identity
  id: string | null;
  status: QuoteStatus;

  // Trip context
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: Travelers;

  // Products
  items: QuoteItem[];

  // Pricing
  pricing: QuotePricing;

  // Client
  client: QuoteClient | null;

  // UI
  ui: WorkspaceUI;

  // History for undo/redo
  historyIndex: number;
}

// Action types
export type WorkspaceAction =
  | { type: 'SET_TRIP_NAME'; payload: string }
  | { type: 'SET_DESTINATION'; payload: string }
  | { type: 'SET_DATES'; payload: { startDate: string; endDate: string } }
  | { type: 'SET_TRAVELERS'; payload: Partial<Travelers> }
  | { type: 'ADD_ITEM'; payload: QuoteItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<QuoteItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'REORDER_ITEMS'; payload: { activeId: string; overId: string } }
  | { type: 'SET_MARKUP'; payload: number }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'SET_TAXES'; payload: number }
  | { type: 'SET_DISCOUNT'; payload: number }
  | { type: 'SET_CLIENT'; payload: QuoteClient | null }
  | { type: 'SET_STATUS'; payload: QuoteStatus }
  | { type: 'SET_UI'; payload: Partial<WorkspaceUI> }
  | { type: 'SET_ACTIVE_TAB'; payload: ProductType }
  | { type: 'SET_SEARCH_RESULTS'; payload: { loading: boolean; results: any[] | null } }
  | { type: 'EXPAND_ITEM'; payload: string | null }
  | { type: 'LOAD_QUOTE'; payload: Partial<QuoteWorkspaceState> }
  | { type: 'RESET_WORKSPACE' }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: string };

// Search params for each product type
export interface FlightSearchParams {
  // Multi-airport support
  origin: string[];           // Array of airport codes: ['JFK', 'EWR', 'LGA']
  destination: string[];      // Array of airport codes: ['CDG', 'ORY']

  // Date modes
  departureDate: string;      // Single date mode: YYYY-MM-DD
  departureDates: Date[];     // Multi-date mode: Array of specific dates (up to 7)
  useMultiDate: boolean;      // Toggle between single-date and multi-date mode
  returnDate?: string;

  // Flexible dates
  departureFlex: number;      // ±N days for departure (0-5) - only for single date mode
  tripDuration: number;       // Number of nights for round trips (1-30)

  // Passengers
  adults: number;
  children: number;
  infants: number;

  // Options
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  tripType: 'roundtrip' | 'oneway';
  directFlights: boolean;     // Non-stop flights only
}

export interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

// Product icons and colors config
export const PRODUCT_CONFIG: Record<ProductType, { label: string; gradient: string; icon: string }> = {
  flight: { label: 'Flights', gradient: 'from-blue-500 to-indigo-600', icon: 'Plane' },
  hotel: { label: 'Hotels', gradient: 'from-purple-500 to-pink-600', icon: 'Building2' },
  car: { label: 'Cars', gradient: 'from-cyan-500 to-blue-600', icon: 'Car' },
  activity: { label: 'Activities', gradient: 'from-emerald-500 to-teal-600', icon: 'Compass' },
  transfer: { label: 'Transfers', gradient: 'from-amber-500 to-orange-600', icon: 'Bus' },
  insurance: { label: 'Insurance', gradient: 'from-rose-500 to-pink-600', icon: 'Shield' },
  custom: { label: 'Custom', gradient: 'from-gray-600 to-gray-800', icon: 'Package' },
};
