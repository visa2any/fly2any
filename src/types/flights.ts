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
  flexibleDates?: { enabled: boolean; days: number }; // Search ±X days from selected dates
  maxPrice?: number;                 // Maximum price cap
  max?: number;                      // Max number of offers (default 250)
  currencyCode?: string;             // Currency (e.g., "BRL", "USD")
  travelerCountry?: string;          // Traveler country code
}

export type TravelClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type ServiceLevelType = 'VIP' | 'PREMIUM' | 'STANDARD';

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
  enhancedWith?: string[]; // Track which enhancements have been applied
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

export interface FlightSegment {
  origin: AirportSelection | null;
  destination: AirportSelection | null;
  departureDate: Date;
}

export interface ContactInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface TravelNotes {
  specialRequests: string;
  dietaryRestrictions: string;
  mobilityAssistance: boolean;
  seatPreference: 'window' | 'aisle' | 'middle' | 'no-preference';
  additionalNotes: string;
}

export interface FlightSearchFormData {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  origin: AirportSelection | null;
  destination: AirportSelection | null;
  departureDate: Date;
  returnDate?: Date;
  segments?: FlightSegment[]; // For multi-city trips
  passengers: PassengerCounts;
  travelClass: TravelClass;
  preferences: SearchPreferences;
  contactInfo?: ContactInformation;
  travelNotes?: TravelNotes;
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

// Enhanced flexible dates configuration
export interface EnhancedFlexibleDates {
  departure: {
    enabled: boolean;
    days: number; // 1-7 days
    dayOfWeek?: {
      preferredDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
      avoidWeekends?: boolean;
    };
    timeOfDay?: {
      preferMorning?: boolean;
      preferEvening?: boolean;
      avoidRedEye?: boolean;
    };
    priorityLevel?: 'low' | 'medium' | 'high';
  };
  return?: {
    enabled: boolean;
    days: number;
    dayOfWeek?: {
      preferredDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
      avoidWeekends?: boolean;
    };
    timeOfDay?: {
      preferMorning?: boolean;
      preferEvening?: boolean;
      avoidRedEye?: boolean;
    };
    priorityLevel?: 'low' | 'medium' | 'high';
  };
  searchStrategy?: 'exhaustive' | 'optimized' | 'smart';
  maxSearches?: number; // Limit total API calls
  cacheResults?: boolean;
}

// Multi-city segment flexibility
export interface MultiCityFlexibility {
  segments: SegmentFlexibility[];
}

export interface SegmentFlexibility {
  segmentIndex: number;
  departure: {
    enabled: boolean;
    days: number;
    priorityLevel?: 'low' | 'medium' | 'high';
    dependsOnPrevious?: boolean; // Automatically adjust based on previous segment
  };
  constraints?: {
    minLayoverHours?: number;
    maxLayoverHours?: number;
    preferredLayoverAirports?: string[];
  };
}

// Legacy support
export interface LegacyFlexibleDates {
  enabled: boolean;
  days: number;
}

// Union type for backward compatibility
export type FlexibleDatesConfig = LegacyFlexibleDates | EnhancedFlexibleDates;

export interface SearchPreferences {
  nonStop: boolean;
  flexibleDates?: FlexibleDatesConfig;
  enhancedFlexibility?: EnhancedFlexibleDates;
  multiCityFlexibility?: MultiCityFlexibility;
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
  
  // 🎯 TRANSPARENCY TOTAL - CABIN CLASS & BAGGAGE
  cabinAnalysis: {
    detectedClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    confidence: number;
    definition: any; // CabinClassDefinition
    sources: string[];
  };
  baggageAnalysis: any; // BaggageAnalysisResult
  
  // Backward compatibility properties
  price?: string; // Deprecated, use totalPrice
  offer?: string; // Deprecated, use id  
  cabin?: string; // Cabin class for display
  travelerPricings?: TravelerPricing[]; // Direct access to pricing data
  
  // Enhanced properties for ultra-advanced features
  totalDuration?: string;
  enhanced?: {
    conversionScore?: number;
    choiceProbability?: number;
    priceAnalysis?: PriceAnalysis;
    recommendations?: string[];
    socialProof?: Array<{
      type: string;
      message: string;
      count: number;
    }> | string[];
    urgencyIndicators?: string[];
  };
  
  // Ultra-premium AI properties
  aiScore?: number;
  priceHistory?: {
    trend: 'increasing' | 'decreasing' | 'stable';
    prediction: 'book_now' | 'wait' | 'monitor';
  };
  carbonFootprint?: {
    kg: number;
    rating: 'A' | 'B' | 'C' | 'D' | 'E';
  };
  
  // Original raw data
  rawOffer: FlightOffer;
  
  // Optional properties for comparison page
  layovers?: any[];
  segments?: any[];
}

export interface ProcessedJourney {
  departure: ProcessedFlightEndpoint;
  arrival: ProcessedFlightEndpoint;
  duration: string;
  durationMinutes: number;
  stops: number;
  segments: ProcessedSegment[];
  layovers?: Layover[];
  carrierName?: string;
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
  city?: string; // For enhanced city display
  at?: string; // Backward compatibility - same as dateTime
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
  cabin: CabinClass | string; // Allow string for flexibility
}

export interface Layover {
  airport: string;
  duration: string;
  durationMinutes: number;
  city?: string; // For enhanced city display
  terminal?: string; // For terminal information
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
  stops?: ('direct' | '1-stop' | '2-plus-stops')[] | number;
  departureTime?: TimePreference | string[];
  arrivalTime?: TimePreference;
  duration?: {
    max: number; // in minutes
  };
  airports?: {
    departure?: string[];
    arrival?: string[];
  };
  travelClass?: TravelClass;
  flexible?: {
    dates?: boolean;
    airports?: boolean;
    refundable?: boolean;
  };
  baggage?: {
    carryOn?: boolean;
    checked?: boolean;
  };
  amenities?: string[];
}

export interface FlightSortOptions {
  sortBy: 'price' | 'duration' | 'departure' | 'arrival' | 'stops' | 'aiScore';
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
  email?: string;
  emailAddress?: string;
  phone?: {
    number: string;
    countryCode: string;
  };
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
  serviceLevel?: 'VIP' | 'PREMIUM' | 'STANDARD';
  proactiveSupport?: {
    flightAlerts: boolean;
    delayNotifications: boolean;
    gateChanges: boolean;
    weatherAlerts: boolean;
    rebookingAssistance: boolean;
  };
  selfServiceOptions?: string[];
  loyaltyProgram?: {
    eligible: boolean;
    pointsEarned: number;
    currentTier: string;
    nextTierBenefits: string[];
  };
  upsellOpportunities?: any[];
  customerExperience?: {
    nextSteps: string[];
    tips: string[];
    timeline?: any;
    support: {
      available24h: boolean;
      phone: string;
      chat: boolean;
      whatsapp?: string;
    };
  };
  conversionElements?: {
    urgencyIndicators: string[];
    socialProof: string[];
    recommendations: string[];
    trustSignals?: string[];
    urgencyFactors?: string[];
    valueProposition?: string[];
    gamificationRewards: {
      points: number;
      badges: string[];
      achievements: string[];
    };
  };
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
  showInsights?: boolean;
  onAddToComparison?: (flight: ProcessedFlightOffer) => void;
  comparedFlights?: FlightComparison[];
  onRemoveFromComparison?: (flightId: string) => void;
  enableGamification?: boolean;
  enablePersonalization?: boolean;
  userPreferences?: UserPreferences;
}

export interface FlightDetailsProps {
  offer: ProcessedFlightOffer;
  onBook: (offer: ProcessedFlightOffer) => void;
  onBack: () => void;
  isLoading?: boolean;
  className?: string;
}

// =============================================================================
// 🚀 ULTRA-ADVANCED TYPES FOR 11:00 AM STATE RECOVERY
// =============================================================================

// Missing types for API endpoints
export interface OriginDestination {
  id: string;
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
}

export interface AvailabilitySearchCriteria {
  originDestinations: OriginDestination[];
  travelers: TravelerInfo[];
  sources: ('GDS' | 'NDC')[];
  searchCriteria?: {
    maxFlightOffers?: number;
    flightFilters?: {
      cabinRestrictions?: {
        cabin: CabinClass;
        coverage: 'MOST_SEGMENTS' | 'AT_LEAST_ONE_SEGMENT' | 'ALL_SEGMENTS';
        originDestinationIds: string[];
      }[];
      carrierRestrictions?: {
        blacklistedInEUByCEC?: boolean;
        excludedCarrierCodes?: string[];
        includedCarrierCodes?: string[];
      };
    };
  };
}

export interface FlightDateSearchParams extends Omit<FlightSearchParams, 'departureDate'> {
  origin: string;
  destination: string;
  departureDate?: string;
  viewBy?: 'DATE' | 'WEEK' | 'MONTH';
  departureDateTimeRange?: {
    date: string;
    dateWindow?: string;
    timeWindow?: string;
  };
}

export interface FlightDestinationSearchParams {
  origin: string;
  departureDate?: string;
  oneWay?: boolean;
  duration?: string;
  nonStop?: boolean;
  maxPrice?: number;
  viewBy?: 'DATE' | 'DESTINATION' | 'DURATION' | 'WEEK' | 'COUNTRY';
}

export interface BookingFormData {
  passengers: PassengerInfo[];
  contactInfo: ContactInfo;
  payment: {
    type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER';
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    holderName?: string;
    installments?: number;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  specialRequests?: string[];
  agreements: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
    termsAndConditions?: boolean;
    privacyPolicy?: boolean;
    marketingEmails?: boolean;
  };
}

export interface PassengerInfo {
  id: string;
  type: TravelerType;
  title?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  name?: {
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'M' | 'F';
  nationality?: string;
  document?: {
    type: 'PASSPORT' | 'IDENTITY_CARD';
    number: string;
    expiryDate: string;
    issuingCountry: string;
  };
  documents?: Document[];
  contact?: {
    email?: string;
    phone?: string;
  };
}

export interface BookingState {
  isLoading: boolean;
  paymentProcessing: boolean;
  bookingConfirmed: boolean;
  errors: BookingError[];
  warnings?: string[];
  validationState?: {
    passengers: boolean;
    contact: boolean;
    payment: boolean;
    agreements: boolean;
    overall: boolean;
  };
  currentStep: 'PASSENGER_INFO' | 'SPECIAL_REQUESTS' | 'PAYMENT' | 'CONFIRMATION' | 'passengers' | 'payment' | 'confirmation';
}

export interface BookingError {
  field: string;
  message: string;
  type: 'validation' | 'payment' | 'api' | 'general' | 'API' | 'GENERAL';
}

export interface FareRules {
  category: string;
  maxPenaltyAmount?: string;
  rules: {
    refundable: boolean;
    exchangeable: boolean;
    penalties?: string[];
    conditions?: string[];
  };
}

export interface FareRulesRequest {
  flightOfferId: string;
  segmentIds?: string[];
}

export interface FareRulesResponse {
  success?: boolean;
  data: FareRules[];
  warnings?: Warning[];
  meta?: {
    source: string;
    lastUpdated: string;
    cacheExpiry: string;
  };
}

export interface FareRulesIconsProps {
  fareRules: FareRules[];
  className?: string;
}

export interface FareRuleTooltipData {
  title: string;
  description: string;
  color: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
  icon: string;
}

export interface FareRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  fareRules: FareRules[];
  flightOffer: ProcessedFlightOffer;
}

export interface EnhancedFlightDate {
  date?: string;
  departureDate?: string;
  price: {
    total: string;
    currency: string;
  } | number;
  currency?: string;
  savings?: {
    amount: string;
    percentage: number;
  };
  priceChange?: {
    trend: 'up' | 'down' | 'stable' | 'RISING' | 'FALLING' | 'STABLE';
    percentage: number;
    prediction?: string;
    historicalLow?: boolean;
  };
  availability: 'HIGH' | 'MEDIUM' | 'LOW';
  demand?: 'HIGH' | 'MEDIUM' | 'LOW';
  demandLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  persuasionTags: string[];
  bookingUrgency?: {
    level: number;
    message: string;
  };
  weatherForecast?: {
    condition: string;
    temperature: number;
  };
  eventBasedPricing?: {
    hasEvents: boolean;
    events?: string[];
  };
  flexibilityBonus?: {
    message: string;
  };
}

export interface EnhancedFlightDestination {
  iataCode: string;
  name: string;
  origin?: string;
  destination?: string;
  price: {
    total: string;
    currency: string;
  } | number;
  currency?: string;
  departureDate: string;
  returnDate?: string;
  subType: 'AIRPORT' | 'CITY' | 'city';
  analytics: {
    travelers: {
      score: number;
    };
  };
  priceRange: {
    min: number;
    max: number;
  };
  trendingStatus: 'HOT' | 'RISING' | 'STEADY';
  persuasionTags: string[];
  imageUrl?: string;
  description?: string;
  seasonality?: 'LOW' | 'HIGH';
  savings?: {
    amount: string;
    percentage: number;
  };
  popularityScore?: number;
  socialMedia?: {
    instagramHashtags: string[];
    influencerRecommendations: number;
  };
}

export interface PriceAnalysis {
  quartileRanking: 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  historicalAverage: number;
  currentPrice: number;
  priceChange: {
    amount: number;
    percentage: number;
    trend: 'rising' | 'falling' | 'stable';
  };
  recommendations: string[];
}

export interface FlightAvailability {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  paymentCardRequired: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
  scarcityIndicators?: {
    remainingSeats: number;
    seatsLeft?: number;
    priceIncreaseRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    demandLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    urgencyMessage?: string;
    priceVolatility?: string;
    bookingVelocity?: string;
  };
  conversionBoosts?: {
    limitedTimeOffer: boolean;
    priceGuarantee: string;
    instantConfirmation: boolean;
    loyaltyPoints?: number;
    freeCancellation?: string;
  };
  competitiveAdvantage?: string[];
}

export interface Remark {
  category: string;
  text: string;
}

export interface Contact {
  addresseeName: {
    firstName: string;
    lastName: string;
  };
  companyName?: string;
  purpose: 'STANDARD' | 'UNACCOMPANIED_MINOR' | 'DISABLED_PASSENGER';
  phones: Phone[];
  emailAddress: string;
  address?: {
    lines: string[];
    postalCode: string;
    cityName: string;
    countryCode: string;
  };
}

export interface FormOfPayment {
  other: {
    method: 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'AGENCY_ACCOUNT';
    creditCard?: {
      number: string;
      holderName: string;
      vendorCode: string;
      expiryDate: string;
    };
  };
}

// Advanced Flight Comparison
export interface FlightComparison {
  id: string;
  offer: ProcessedFlightOffer;
  addedAt: Date;
  comparisonScore: number;
  highlights: string[];
}

// Price Insights with AI
export interface PriceInsights {
  lowest: number;
  highest: number;
  average: number;
  trend: 'rising' | 'falling' | 'stable' | 'increasing';
  percentage?: number;
  confidence?: number;
  historicalData?: Array<{
    date: string;
    price: number;
  }>;
  recommendations?: string[];
  recommendation: 'book_soon' | 'book_now' | 'wait' | 'monitor';
  nextUpdate?: Date;
}

// AI-Generated Flight Recommendations
export interface FlightRecommendation {
  id: string;
  type: 'BEST_VALUE' | 'FASTEST' | 'MOST_CONVENIENT' | 'PERSONALIZED';
  offer: ProcessedFlightOffer;
  reason: string;
  confidence: number;
  tags: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Advanced Gamification System
export interface GamificationState {
  points: number;
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  achievements: Achievement[];
  streaks: {
    viewing: number;
    booking: number;
    comparing: number;
  };
  badges: Badge[];
  totalRewards: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  earnedAt: Date;
}

// Booking Timeline for Enhanced UX
export interface BookingTimeline {
  events: BookingEvent[];
}

export interface BookingEvent {
  title: string;
  date: Date;
  status: 'COMPLETED' | 'PENDING' | 'UPCOMING';
  description: string;
  icon?: string;
}

// Enhanced Booking Upsells
export interface BookingUpsell {
  type: 'SEAT_SELECTION' | 'BAGGAGE' | 'INSURANCE' | 'LOUNGE' | 'MEAL' | 'WIFI';
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  savings?: string;
  cta: string;
  popular?: boolean;
  recommended?: boolean;
}

// Service Level Management
export interface ServiceLevel {
  level: 'VIP' | 'PREMIUM' | 'STANDARD';
  benefits: string[];
  priority: number;
  contactOptions: string[];
}

// Advanced User Preferences for Personalization
export interface UserPreferences {
  preferredAirlines: string[];
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
  preferDirect: boolean;
  seatPreference: 'aisle' | 'window' | 'middle' | 'no_preference';
  mealPreference: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  travelPurpose: 'business' | 'leisure' | 'family' | 'emergency';
  frequentRoutes: Array<{
    origin: string;
    destination: string;
    frequency: number;
  }>;
  loyaltyPrograms: Array<{
    airline: string;
    membershipLevel: string;
    points: number;
  }>;
}

// Additional component interfaces
export interface FlightFiltersProps {
  filters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
  className?: string;
}

export interface FlightCompareBarProps {
  compareFlights: ProcessedFlightOffer[];
  onRemoveFlight: (flightId: string) => void;
  onCompare: () => void;
  className?: string;
}

export interface FeatureItem {
  id?: string;
  icon: string;
  text: string;
  desc?: string;
}

// Payment and Booking Types
export interface PaymentInfo {
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER';
  method?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  holderName?: string;
  installments?: number;
  cardInfo?: {
    number: string;
    cvv: string;
    expiryDate: string;
    holderName: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface BookingError {
  field: string;
  message: string;
  type: 'validation' | 'payment' | 'api' | 'general' | 'API' | 'GENERAL';
}

// BookingState already defined above - removed duplicate

export interface BookingAgreements {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
  termsAndConditions?: boolean;
  privacyPolicy?: boolean;
  marketingEmails?: boolean;
}

export interface BookingData {
  passengers: PassengerInfo[];
  contactInfo: ContactInfo;
  payment: PaymentInfo;
  agreements: BookingAgreements;
  specialRequests?: string;
}

// Enhanced FareRules with all needed properties
export interface FareRules {
  fareType?: string;
  fareClass?: string;
  dataSource?: string;
  flexibility?: 'BASIC' | 'STANDARD' | 'FLEXIBLE' | 'PREMIUM';
  refundable?: boolean;
  refundFee?: {
    formatted: string;
  };
  exchangeable?: boolean;
  changeFee?: {
    formatted: string;
  };
  transferable?: boolean;
  lastUpdated?: string;
  cancellationFee?: {
    formatted: string;
  };
  baggage?: {
    carryOn: {
      included: boolean;
      weight: string;
      weightUnit: string;
      dimensions: string;
      quantity: number;
      additionalCost?: {
        formatted: string;
      };
    };
    checked: {
      included: boolean;
      quantity: number;
      weight: string;
      weightUnit: string;
      firstBagFree?: boolean;
      additionalCost?: {
        formatted: string;
      };
    };
    special?: {
      sports: boolean;
      pets: boolean;
      musical: boolean;
    };
  };
  policies?: {
    seatSelection: {
      allowed: boolean;
      cost: 'FREE' | 'PAID' | 'PREMIUM';
      advanceOnly: boolean;
    };
    mealService: {
      included: boolean;
      type: 'PREMIUM' | 'MEAL' | 'SNACK' | 'NONE';
      dietaryOptions: boolean;
    };
    entertainment: {
      wifi: 'FREE' | 'PAID';
      streaming: boolean;
      seatPower: boolean;
    };
    boarding: {
      priority: boolean;
      zones: string[];
      earlyBoarding: boolean;
      group?: number;
    };
    checkin: {
      online: boolean;
      mobile: boolean;
      kiosk: boolean;
      priority: boolean;
    };
  };
}

// FareRulesResponse already defined above - removed duplicate

export interface FareRuleTooltipData {
  title: string;
  description: string;
  status?: 'included' | 'not-included' | 'fee-applies';
  color: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
}

export interface FareRulesIconsProps {
  fareRules: FareRules[];
  onDetailsClick?: () => void;
  compact?: boolean;
  showTooltips?: boolean;
}

// Additional ProcessedFlightOffer properties
export interface ProcessedSegmentExtended extends ProcessedSegment {
  carrierName?: string;
}

export interface ProcessedFlightOfferExtended extends ProcessedFlightOffer {
  segments?: ProcessedSegmentExtended[];
}

// Additional Social Proof Types
export interface SocialProofItem {
  type: string;
  message: string;
  count: number;
  includes?: (substring: string) => boolean;
  replace?: (searchValue: string | RegExp, replaceValue: string) => string;
}

// Flight Results List Props
// FlightResultsListProps already defined above - removed duplicate

// =============================================================================
// ENHANCED FLEXIBLE DATES SEARCH METADATA
// =============================================================================

export interface FlexibleSearchMetadata {
  isFlexibleSearch: boolean;
  originalDepartureDate: string;
  originalReturnDate?: string;
  flexibleDays: number;
  searchStrategy: 'exhaustive' | 'optimized' | 'smart';
  totalSearchesExecuted: number;
  totalSearchesPlanned: number;
  optimizationsSaved: number;
  searchEfficiencyScore: number; // 0-100
  searchedDates: string[];
  bestAlternativeDates?: {
    departureDate: string;
    returnDate?: string;
    savings: number;
    priceComparisonPercent: number;
  };
  performanceMetrics: {
    totalApiCalls: number;
    averageResponseTime: number;
    cacheHitRate?: number;
    rateLimitingEncountered: boolean;
  };
}

// Enhanced search results with flexible dates context
export interface EnhancedFlightSearchResults {
  offers: ProcessedFlightOffer[];
  metadata: FlexibleSearchMetadata;
  recommendations?: FlexibilityRecommendation[];
  priceCalendar?: DailyPriceData[];
}

export interface FlexibilityRecommendation {
  type: 'date-shift' | 'time-preference' | 'alternative-airport';
  title: string;
  description: string;
  potentialSavings: number;
  confidence: 'low' | 'medium' | 'high';
  actionable: boolean;
  alternativeDates?: {
    departureDate: string;
    returnDate?: string;
  };
}

export interface DailyPriceData {
  date: string;
  price: number;
  savings?: number;
  availability: 'high' | 'medium' | 'low';
  dayOfWeek: string;
  isOriginalDate: boolean;
}