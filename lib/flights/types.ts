/**
 * Flight Search Type Definitions
 * Comprehensive TypeScript interfaces for flight-related data structures
 */

/**
 * Basic airport location information
 */
export interface AirportLocation {
  /** IATA airport code (e.g., 'JFK', 'LAX') */
  iataCode: string;
  /** ISO 8601 datetime string */
  at: string;
  /** Terminal number/letter (optional) */
  terminal?: string;
}

/**
 * Flight segment representing a single leg of a journey
 */
export interface FlightSegment {
  /** Departure airport and time */
  departure: AirportLocation;
  /** Arrival airport and time */
  arrival: AirportLocation;
  /** IATA carrier code (e.g., 'AA', 'DL') */
  carrierCode: string;
  /** Flight number (e.g., '123') */
  number: string;
  /** Aircraft type code (optional) */
  aircraft?: {
    code: string;
  };
  /** Operating carrier if different from marketing carrier */
  operating?: {
    carrierCode: string;
  };
  /** Segment duration in ISO 8601 format (e.g., 'PT2H30M') */
  duration?: string;
  /** Number of stops (0 for direct) */
  numberOfStops?: number;
  /** Blacklisted in EU (optional) */
  blacklistedInEU?: boolean;
}

/**
 * Flight itinerary containing one or more segments
 */
export interface FlightItinerary {
  /** Total duration in ISO 8601 format (e.g., 'PT8H30M') */
  duration: string;
  /** Array of flight segments */
  segments: FlightSegment[];
}

/**
 * Fare details for a specific segment
 */
export interface FareDetailsBySegment {
  /** Segment ID reference */
  segmentId?: string;
  /** Cabin class (ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST) */
  cabin: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  /** Fare basis code */
  fareBasis?: string;
  /** Branded fare name (optional) */
  brandedFare?: string;
  /** Booking class/code */
  class?: string;
  /** Indicates if segment is included in pricing */
  includedCheckedBags?: {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
  };
}

/**
 * Pricing details for a specific traveler
 */
export interface TravelerPricing {
  /** Traveler ID reference */
  travelerId: string;
  /** Traveler type (ADULT, CHILD, INFANT, etc.) */
  fareOption: string;
  /** Traveler type */
  travelerType: 'ADULT' | 'CHILD' | 'HELD_INFANT' | 'SEATED_INFANT' | 'SENIOR';
  /** Price breakdown */
  price: {
    /** Total price for this traveler */
    total: string;
    /** Base fare */
    base: string;
    /** Currency code */
    currency: string;
    /** Taxes and fees */
    fees?: Array<{
      amount: string;
      type: string;
    }>;
  };
  /** Fare details for each segment */
  fareDetailsBySegment: FareDetailsBySegment[];
}

/**
 * Price information for the entire flight offer
 * Supports both string and number formats for API/UI compatibility
 */
export interface FlightPrice {
  /** ISO currency code (e.g., 'USD', 'EUR') */
  currency: string;
  /** Total price including all taxes and fees (supports both string and number) */
  total: string | number;
  /** Base fare before taxes (supports both string and number) */
  base?: string | number;
  /** Additional fees breakdown (optional) */
  fees?: Array<{
    amount: string | number;
    type: string;
  }>;
  /** Grand total (same as total, for compatibility) */
  grandTotal?: string | number;
  /** Indicates if additional baggage is included */
  additionalServices?: Array<{
    amount: string;
    type: string;
  }>;
}

/**
 * Complete flight offer structure from Amadeus API
 * Enhanced with UI-specific properties for scoring and badging
 */
export interface FlightOffer {
  /** Unique identifier for this offer */
  id: string;
  /** Type of offer (usually 'flight-offer') */
  type?: string;
  /** Source of the offer */
  source?: string;
  /** Indicates if offer can be booked instantly */
  instantTicketingRequired?: boolean;
  /** Indicates if pricing is approximate */
  nonHomogeneous?: boolean;
  /** Indicates one-way combinability */
  oneWay?: boolean;
  /** Last date to issue ticket */
  lastTicketingDate?: string;
  /** Last date/time to issue ticket */
  lastTicketingDateTime?: string;
  /** Number of seats available for booking */
  numberOfBookableSeats?: number;
  /** Flight itineraries (outbound and optional return) */
  itineraries: FlightItinerary[];
  /** Price information */
  price: FlightPrice;
  /** Pricing breakdown by traveler */
  travelerPricings?: TravelerPricing[];
  /** Validating airline codes */
  validatingAirlineCodes?: string[];
  /** Price variations by traveler ID */
  pricingOptions?: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  /** UI enhancement: Badges for highlighting features (Best Value, Fastest, etc.) */
  badges?: Array<{
    type: string;
    text: string;
    color: string;
    icon?: string;
  }>;
  /** UI enhancement: FlightIQ score or multi-dimensional scoring */
  score?: number | {
    best: number;
    cheapest: number;
    fastest: number;
    overall: number;
  };
}

/**
 * Search parameters for flight queries
 */
export interface FlightSearchParams {
  /** Origin airport IATA code */
  originLocationCode: string;
  /** Destination airport IATA code */
  destinationLocationCode: string;
  /** Departure date (YYYY-MM-DD) */
  departureDate: string;
  /** Return date (YYYY-MM-DD) - optional for one-way */
  returnDate?: string;
  /** Number of adult travelers (12+ years) */
  adults: number;
  /** Number of children (2-11 years) */
  children?: number;
  /** Number of infants (under 2 years) */
  infants?: number;
  /** Travel class preference */
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  /** Cabin class (alternative to travelClass) */
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  /** Currency code for pricing */
  currencyCode?: string;
  /** Maximum number of results */
  maxResults?: number;
  /** Maximum price filter */
  maxPrice?: number;
  /** Non-stop flights only */
  nonStop?: boolean;
  /** Maximum number of connections/stops */
  max?: number;
  /** Include carriers (airline codes) */
  includedAirlineCodes?: string[];
  /** Exclude carriers (airline codes) */
  excludedAirlineCodes?: string[];
}

/**
 * Filters for refining flight search results
 */
export interface FlightFilters {
  /** Price range */
  priceRange?: {
    min: number;
    max: number;
  };
  /** Number of stops */
  stops?: {
    /** Direct flights only */
    direct?: boolean;
    /** One stop maximum */
    oneStop?: boolean;
    /** Two+ stops */
    multipleStops?: boolean;
  };
  /** Airline filters */
  airlines?: string[];
  /** Departure time range (24-hour format) */
  departureTime?: {
    /** Earliest departure hour (0-23) */
    earliest?: number;
    /** Latest departure hour (0-23) */
    latest?: number;
  };
  /** Arrival time range (24-hour format) */
  arrivalTime?: {
    /** Earliest arrival hour (0-23) */
    earliest?: number;
    /** Latest arrival hour (0-23) */
    latest?: number;
  };
  /** Duration filter (in minutes) */
  duration?: {
    max?: number;
  };
  /** Cabin class filter */
  cabinClass?: Array<'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'>;
  /** Aircraft type filters */
  aircraftTypes?: string[];
  /** Alliance filters */
  alliances?: Array<'STAR_ALLIANCE' | 'ONEWORLD' | 'SKYTEAM'>;
}

/**
 * Metadata about the search results
 */
export interface SearchMetadata {
  /** Total number of results found */
  count: number;
  /** Timestamp of the search */
  timestamp: string;
  /** Search parameters used */
  searchParams: FlightSearchParams;
  /** Applied filters */
  filters?: FlightFilters;
  /** Currency used for pricing */
  currency: string;
  /** Indicates if results are cached */
  cached?: boolean;
  /** Cache expiration time */
  cacheExpiresAt?: string;
}

/**
 * API response structure for flight offers
 */
export interface FlightOffersResponse {
  /** Array of flight offers */
  data: FlightOffer[];
  /** Metadata about the search */
  meta?: {
    count: number;
    links?: {
      self: string;
    };
  };
  /** Dictionaries for reference data */
  dictionaries?: {
    /** Airport codes to names */
    locations?: Record<string, {
      cityCode: string;
      countryCode: string;
    }>;
    /** Aircraft codes to types */
    aircraft?: Record<string, string>;
    /** Carrier codes to names */
    carriers?: Record<string, string>;
    /** Currency codes */
    currencies?: Record<string, string>;
  };
  /** Warnings or notices */
  warnings?: Array<{
    status: number;
    code: number;
    title: string;
    detail?: string;
  }>;
  /** Errors if any */
  errors?: Array<{
    status: number;
    code: number;
    title: string;
    detail?: string;
    source?: {
      parameter?: string;
      pointer?: string;
      example?: string;
    };
  }>;
}

/**
 * Scored flight with AI-generated ranking
 * Extends FlightOffer with scoring and badge information
 */
export interface ScoredFlight extends Omit<FlightOffer, 'badges' | 'score'> {
  /** Composite scores across different criteria */
  score: {
    /** Best overall value score (0-100) */
    best: number;
    /** Price-focused score (0-100) */
    cheapest: number;
    /** Duration-focused score (0-100) */
    fastest: number;
    /** Balanced overall score (0-100) */
    overall: number;
  };
  /** Persuasive badges for UI display */
  badges: string[];
  /** Additional metadata for analysis */
  metadata: {
    /** Total flight duration in minutes */
    totalDuration: number;
    /** Price per hour of flight */
    pricePerHour: number;
    /** Total number of stops */
    stopCount: number;
    /** Departure time convenience score (0-100) */
    departureTimeScore: number;
  };
}

/**
 * Simplified flight offer for UI display
 */
export interface SimplifiedFlightOffer {
  /** Unique offer ID */
  id: string;
  /** Pricing information */
  price: {
    total: number;
    currency: string;
    perPerson?: number;
  };
  /** Outbound flight details */
  outbound: {
    departure: {
      airport: string;
      time: string;
      terminal?: string;
    };
    arrival: {
      airport: string;
      time: string;
      terminal?: string;
    };
    duration: string;
    stops: number;
    segments: Array<{
      carrier: string;
      flightNumber: string;
      aircraft?: string;
      departure: {
        airport: string;
        time: string;
      };
      arrival: {
        airport: string;
        time: string;
      };
      duration: string;
    }>;
  };
  /** Return flight details (if applicable) */
  inbound?: {
    departure: {
      airport: string;
      time: string;
      terminal?: string;
    };
    arrival: {
      airport: string;
      time: string;
      terminal?: string;
    };
    duration: string;
    stops: number;
    segments: Array<{
      carrier: string;
      flightNumber: string;
      aircraft?: string;
      departure: {
        airport: string;
        time: string;
      };
      arrival: {
        airport: string;
        time: string;
      };
      duration: string;
    }>;
  };
  /** Primary validating airline */
  validatingAirline?: string;
  /** Seats available */
  numberOfBookableSeats?: number;
  /** Last ticketing date */
  lastTicketingDate?: string;
  /** Cabin class */
  class: string;
  /** Airline details */
  airline?: {
    code: string;
    name: string;
    logo?: string;
  };
}

/**
 * Sort options for flight results
 */
export type FlightSortOption = 'best' | 'cheapest' | 'fastest' | 'overall' | 'departure' | 'arrival' | 'duration';

/**
 * Layover information between segments
 */
export interface LayoverInfo {
  /** Airport code where layover occurs */
  airport: string;
  /** Duration in minutes */
  duration: number;
  /** Formatted duration string */
  durationFormatted: string;
  /** Indicates if it's a long layover (4+ hours) */
  isLong: boolean;
  /** Indicates if it's overnight */
  isOvernight: boolean;
}

/**
 * Flight statistics for a set of results
 */
export interface FlightStatistics {
  /** Price statistics */
  price: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  /** Duration statistics (in minutes) */
  duration: {
    min: number;
    max: number;
    average: number;
  };
  /** Stops statistics */
  stops: {
    min: number;
    max: number;
    directFlightsCount: number;
  };
  /** Available airlines */
  airlines: string[];
  /** Total offers */
  totalOffers: number;
}


/**
 * ============================================
 * NORMALIZATION UTILITIES
 * ============================================
 */

/**
 * Normalize price to number format
 */
export function normalizePrice(price: string | number | undefined): number {
  if (price === undefined) return 0;
  return typeof price === 'string' ? parseFloat(price) : price;
}

/**
 * Normalize price to string format
 */
export function normalizePriceString(price: string | number | undefined): string {
  if (price === undefined) return '0';
  return typeof price === 'number' ? price.toString() : price;
}

/**
 * Ensure FlightOffer has all required properties for UI components
 * Adds default values for optional properties
 */
export function normalizeFlightOffer(offer: Partial<FlightOffer>): FlightOffer {
  return {
    id: offer.id || '',
    type: offer.type,
    source: offer.source,
    instantTicketingRequired: offer.instantTicketingRequired,
    nonHomogeneous: offer.nonHomogeneous,
    oneWay: offer.oneWay,
    lastTicketingDate: offer.lastTicketingDate,
    lastTicketingDateTime: offer.lastTicketingDateTime,
    numberOfBookableSeats: offer.numberOfBookableSeats,
    itineraries: offer.itineraries?.map(itinerary => ({
      ...itinerary,
      segments: itinerary.segments.map(segment => ({
        ...segment,
        aircraft: segment.aircraft || { code: 'Unknown' },
        numberOfStops: segment.numberOfStops ?? 0,
        duration: segment.duration || itinerary.duration,
      })),
    })) || [],
    price: {
      currency: offer.price?.currency || 'USD',
      total: offer.price?.total || 0,
      base: offer.price?.base,
      grandTotal: offer.price?.grandTotal || offer.price?.total,
      fees: offer.price?.fees,
      additionalServices: offer.price?.additionalServices,
    },
    travelerPricings: offer.travelerPricings,
    validatingAirlineCodes: offer.validatingAirlineCodes,
    pricingOptions: offer.pricingOptions,
    badges: offer.badges || [],
    score: offer.score,
  };
}

