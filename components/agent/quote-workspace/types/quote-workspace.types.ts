// Quote Workspace Types - Level 6 Ultra-Premium Quote Builder

export type ProductType = 'flight' | 'hotel' | 'car' | 'activity' | 'transfer' | 'insurance' | 'custom';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired' | 'declined';
// Expanded currency support for global markets
export type Currency =
  | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'  // Tier 1
  | 'MXN' | 'BRL' | 'ARS' | 'CLP' | 'COP'  // LATAM
  | 'JPY' | 'CNY' | 'KRW' | 'INR' | 'SGD' | 'HKD' | 'THB' | 'MYR' | 'PHP' | 'IDR' | 'VND'  // Asia
  | 'AED' | 'SAR' | 'ILS' | 'TRY' | 'ZAR' | 'EGP'  // MENA + Africa
  | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON'  // Europe
  | 'NZD' | 'RUB';  // Others

// Currency metadata for formatting
export const CURRENCY_CONFIG: Record<Currency, { symbol: string; name: string; decimals: number; locale: string }> = {
  USD: { symbol: '$', name: 'US Dollar', decimals: 2, locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', decimals: 2, locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2, locale: 'en-GB' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2, locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2, locale: 'en-AU' },
  MXN: { symbol: '$', name: 'Mexican Peso', decimals: 2, locale: 'es-MX' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimals: 2, locale: 'pt-BR' },
  ARS: { symbol: '$', name: 'Argentine Peso', decimals: 2, locale: 'es-AR' },
  CLP: { symbol: '$', name: 'Chilean Peso', decimals: 0, locale: 'es-CL' },
  COP: { symbol: '$', name: 'Colombian Peso', decimals: 0, locale: 'es-CO' },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0, locale: 'ja-JP' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimals: 2, locale: 'zh-CN' },
  KRW: { symbol: '₩', name: 'South Korean Won', decimals: 0, locale: 'ko-KR' },
  INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2, locale: 'en-IN' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimals: 2, locale: 'en-SG' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2, locale: 'zh-HK' },
  THB: { symbol: '฿', name: 'Thai Baht', decimals: 2, locale: 'th-TH' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, locale: 'ms-MY' },
  PHP: { symbol: '₱', name: 'Philippine Peso', decimals: 2, locale: 'en-PH' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, locale: 'id-ID' },
  VND: { symbol: '₫', name: 'Vietnamese Dong', decimals: 0, locale: 'vi-VN' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', decimals: 2, locale: 'ar-AE' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal', decimals: 2, locale: 'ar-SA' },
  ILS: { symbol: '₪', name: 'Israeli Shekel', decimals: 2, locale: 'he-IL' },
  TRY: { symbol: '₺', name: 'Turkish Lira', decimals: 2, locale: 'tr-TR' },
  ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2, locale: 'en-ZA' },
  EGP: { symbol: 'E£', name: 'Egyptian Pound', decimals: 2, locale: 'ar-EG' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2, locale: 'de-CH' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimals: 2, locale: 'sv-SE' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimals: 2, locale: 'nb-NO' },
  DKK: { symbol: 'kr', name: 'Danish Krone', decimals: 2, locale: 'da-DK' },
  PLN: { symbol: 'zł', name: 'Polish Zloty', decimals: 2, locale: 'pl-PL' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', decimals: 2, locale: 'cs-CZ' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', decimals: 0, locale: 'hu-HU' },
  RON: { symbol: 'lei', name: 'Romanian Leu', decimals: 2, locale: 'ro-RO' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2, locale: 'en-NZ' },
  RUB: { symbol: '₽', name: 'Russian Ruble', decimals: 2, locale: 'ru-RU' },
};

// Helper for formatting currency
export function formatCurrency(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

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
  airlineName?: string; // Full name: "Spirit Airlines"
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
  // Fare details
  fareType?: string; // "Basic Economy", "Economy", "Main Cabin", etc.
  fareBasis?: string;
  includedBags?: { quantity: number; weight?: string };
  fareRules?: {
    changeable?: boolean;
    changeFee?: string;
    refundable?: boolean;
    refundFee?: string;
  };
  // Return flight data (for roundtrip)
  returnDate?: string;
  returnFlightNumber?: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  returnDuration?: string;
  returnStops?: number;
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
  templatesPanelOpen: boolean;
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
  clientName?: string; // Quick access for personalized greeting

  // Agent (for client preview signature)
  agentName?: string;
  agentTitle?: string;
  agentPhoto?: string;
  agentEmail?: string;
  agentPhone?: string;

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
  departureFlex: number;      // ±N days for departure (0-5)
  returnFlex: number;         // ±N days for return (0-5) - independent
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
