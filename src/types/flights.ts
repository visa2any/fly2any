/**
 * TypeScript interfaces for Amadeus Flight API
 */

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface AmadeusConfig {
  environment: 'test' | 'production';
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  tokenUrl: string;
}

export interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// =============================================================================
// SEARCH PARAMETERS
// =============================================================================

export interface FlightSearchParams {
  // Required parameters
  originLocationCode: string;        // IATA airport code (e.g., "LAX")
  destinationLocationCode: string;   // IATA airport code (e.g., "NYC")
  departureDate: string;             // ISO date format (YYYY-MM-DD)
  adults: number;                    // Number of adult passengers (1-9)
  
  // Optional parameters
  returnDate?: string;               // For round-trip flights
  children?: number;                 // Number of children (2-11 years old)
  infants?: number;                  // Number of infants (under 2 years old)
  travelClass?: TravelClass;         // Travel class
  oneWay?: boolean;                  // Is one-way trip
  nonStop?: boolean;                 // Direct flights only
  maxPrice?: number;                 // Maximum price cap
  max?: number;                      // Max number of offers (default 250)
  currencyCode?: string;             // Currency (e.g., "BRL", "USD")
}

export type TravelClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

// =============================================================================
// FLIGHT OFFER TYPES
// =============================================================================

export interface FlightOffersResponse {
  meta?: ResponseMeta;
  data?: FlightOffer[];
  dictionaries?: Dictionaries;
}

export interface ResponseMeta {
  count: number;
  links?: {
    self?: string;
    first?: string;
    last?: string;
    previous?: string;
    next?: string;
  };
}

export interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  carrierCode: string;
  number: string;
  aircraft: Aircraft;
  operating?: Operating;
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface FlightEndpoint {
  iataCode: string;
  terminal?: string;
  at: string; // ISO datetime
}

export interface Aircraft {
  code: string;
}

export interface Operating {
  carrierCode: string;
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees?: Fee[];
  grandTotal: string;
}

export interface Fee {
  amount: string;
  type: string;
}

export interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: TravelerType;
  price: Price;
  fareDetailsBySegment: FareDetailsBySegment[];
}

export type TravelerType = 'ADULT' | 'CHILD' | 'INFANT';

export interface FareDetailsBySegment {
  segmentId: string;
  cabin: CabinClass;
  fareBasis: string;
  brandedFare?: string;
  class: string;
  includedCheckedBags: BaggageInfo;
}

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface BaggageInfo {
  quantity: number;
  weight?: number;
  weightUnit?: string;
}

export interface Dictionaries {
  locations?: Record<string, Location>;
  aircraft?: Record<string, string>;
  currencies?: Record<string, string>;
  carriers?: Record<string, string>;
}

export interface Location {
  cityCode: string;
  countryCode: string;
  timeZone: string;
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

export interface FlightSearchFormData {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  origin: AirportSelection;
  destination: AirportSelection;
  departureDate: Date;
  returnDate?: Date;
  passengers: PassengerCounts;
  travelClass: TravelClass;
  preferences: SearchPreferences;
}

export interface AirportSelection {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchPreferences {
  nonStop: boolean;
  maxPrice?: number;
  preferredAirlines: string[];
  departureTimePreference?: TimePreference;
  arrivalTimePreference?: TimePreference;
}

export interface TimePreference {
  early: boolean;    // 06:00 - 12:00
  afternoon: boolean; // 12:00 - 18:00
  evening: boolean;   // 18:00 - 24:00
  night: boolean;     // 00:00 - 06:00
}

// =============================================================================
// PROCESSED FLIGHT DATA (FOR UI)
// =============================================================================

export interface ProcessedFlightOffer {
  id: string;
  totalPrice: string;
  currency: string;
  
  // Outbound journey
  outbound: ProcessedJourney;
  
  // Return journey (for round-trip)
  inbound?: ProcessedJourney;
  
  // Additional info
  numberOfBookableSeats: number;
  validatingAirlines: string[];
  lastTicketingDate: string;
  instantTicketingRequired: boolean;
  
  // Original raw data
  rawOffer: FlightOffer;
}

export interface ProcessedJourney {
  departure: ProcessedFlightEndpoint;
  arrival: ProcessedFlightEndpoint;
  duration: string;
  durationMinutes: number;
  stops: number;
  segments: ProcessedSegment[];
  layovers?: Layover[];
}

export interface ProcessedFlightEndpoint {
  iataCode: string;
  airportName?: string;
  cityName?: string;
  countryName?: string;
  terminal?: string;
  dateTime: string;
  date: string;
  time: string;
  timeZone?: string;
}

export interface ProcessedSegment {
  id: string;
  departure: ProcessedFlightEndpoint;
  arrival: ProcessedFlightEndpoint;
  duration: string;
  durationMinutes: number;
  airline: AirlineInfo;
  flightNumber: string;
  aircraft: AircraftInfo;
  cabin: CabinClass;
}

export interface Layover {
  airport: string;
  duration: string;
  durationMinutes: number;
}

export interface AirlineInfo {
  code: string;
  name?: string;
  logo?: string;
}

export interface AircraftInfo {
  code: string;
  name?: string;
}

// =============================================================================
// FILTER AND SORT TYPES
// =============================================================================

export interface FlightFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  airlines?: string[];
  stops?: ('direct' | '1-stop' | '2-plus-stops')[];
  departureTime?: TimePreference;
  arrivalTime?: TimePreference;
  duration?: {
    max: number; // in minutes
  };
  airports?: {
    departure?: string[];
    arrival?: string[];
  };
}

export interface FlightSortOptions {
  sortBy: 'price' | 'duration' | 'departure' | 'arrival' | 'stops';
  sortOrder: 'asc' | 'desc';
}

// =============================================================================
// BOOKING TYPES
// =============================================================================

export interface FlightBookingRequest {
  flightOffer: FlightOffer;
  travelers: TravelerInfo[];
  contacts: ContactInfo;
  ticketingAgreement: TicketingAgreement;
}

export interface TravelerInfo {
  id: string;
  dateOfBirth: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender: 'MALE' | 'FEMALE';
  contact?: {
    emailAddress?: string;
    phones?: Phone[];
  };
  documents?: Document[];
}

export interface Phone {
  deviceType: 'MOBILE' | 'LANDLINE';
  countryCallingCode: string;
  number: string;
}

export interface Document {
  documentType: 'PASSPORT' | 'IDENTITY_CARD';
  number: string;
  expiryDate: string;
  issuanceCountry: string;
  nationality: string;
  holder: boolean;
}

export interface ContactInfo {
  emailAddress: string;
  phones: Phone[];
}

export interface TicketingAgreement {
  option: 'DELAY_TO_CANCEL' | 'CONFIRM';
  delay?: string;
}

export interface FlightBookingResponse {
  data?: FlightOrder;
  warnings?: Warning[];
}

export interface FlightOrder {
  type: string;
  id: string;
  queuingOfficeId: string;
  associatedRecords: AssociatedRecord[];
  flightOffers: FlightOffer[];
  travelers: TravelerInfo[];
  contacts: ContactInfo[];
}

export interface AssociatedRecord {
  reference: string;
  creationDate: string;
  originSystemCode: string;
  flightOfferId: string;
}

export interface Warning {
  code: number;
  title: string;
  detail: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface AmadeusError {
  code: number;
  title: string;
  detail: string;
  status: number;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

export interface AmadeusErrorResponse {
  errors: AmadeusError[];
}

// =============================================================================
// AIRPORT SEARCH TYPES
// =============================================================================

export interface AirportSearchResponse {
  meta: ResponseMeta;
  data: Airport[];
}

export interface Airport {
  type: string;
  subType: 'AIRPORT' | 'CITY';
  name: string;
  detailedName: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  timeZoneOffset: string;
  iataCode: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    cityName: string;
    cityCode: string;
    countryName: string;
    countryCode: string;
    stateCode?: string;
    regionCode: string;
  };
  analytics: {
    travelers: {
      score: number;
    };
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface FlightSearchResponse {
  success: boolean;
  data?: ProcessedFlightOffer[];
  meta?: {
    total: number;
    searchId: string;
    currency: string;
    filters?: FlightFilters;
  };
  error?: string;
}

export interface FlightDetailsResponse {
  success: boolean;
  data?: ProcessedFlightOffer;
  error?: string;
}

export interface PricingConfirmationResponse {
  success: boolean;
  data?: FlightOffer;
  error?: string;
}

// Component Props Types
export interface FlightSearchFormProps {
  onSearch: (params: FlightSearchFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export interface FlightResultsListProps {
  offers: ProcessedFlightOffer[];
  onOfferSelect: (offer: ProcessedFlightOffer) => void;
  filters?: FlightFilters;
  onFiltersChange?: (filters: FlightFilters) => void;
  sortOptions?: FlightSortOptions;
  onSortChange?: (sort: FlightSortOptions) => void;
  isLoading?: boolean;
  className?: string;
}

export interface FlightDetailsProps {
  offer: ProcessedFlightOffer;
  onBook: (offer: ProcessedFlightOffer) => void;
  onBack: () => void;
  isLoading?: boolean;
  className?: string;
}