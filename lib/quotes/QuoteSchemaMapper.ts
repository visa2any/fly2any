// QuoteSchemaMapper
// Transforms workspace state to API-compatible format
// Ensures all required fields are present and formatted correctly
// Single Source of Truth for data transformation between Workspace ↔ API ↔ Database

import type {
  QuoteWorkspaceState,
  QuoteItem,
} from "@/components/agent/quote-workspace/types/quote-workspace.types";

// ============================================================================
// API SCHEMA TYPES
// ============================================================================

export interface ApiFlightItem {
  type: "flight";
  price: number;
  priceType: "total" | "per_person" | "per_night" | "per_unit";
  priceAppliesTo: number;
  currency: string;
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
  cabinClass: string;
  passengers: number;
  date: string;
  createdAt: string;
}

export interface ApiHotelItem {
  type: "hotel";
  price: number;
  priceType: "total" | "per_person" | "per_night" | "per_unit";
  priceAppliesTo: number;
  nights: number;
  currency: string;
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  stars: number;
  amenities: string[];
  guests: number;
  image?: string;
  createdAt: string;
}

export interface ApiActivityItem {
  type: "activity";
  price: number;
  priceType: "total" | "per_person" | "per_night" | "per_unit";
  priceAppliesTo: number;
  currency: string;
  name: string;
  location: string;
  description: string;
  duration: string;
  time?: string;
  participants: number;
  includes: string[];
  image?: string;
  date: string;
  createdAt: string;
}

export interface ApiTransferItem {
  type: "transfer";
  price: number;
  priceType: "total" | "per_person" | "per_night" | "per_unit";
  priceAppliesTo: number;
  currency: string;
  provider: string;
  vehicleType: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  passengers: number;
  meetAndGreet: boolean;
  date: string;
  createdAt: string;
}

export interface ApiCarItem {
  type: "car";
  price: number;
  priceType: "total" | "per_person" | "per_night" | "per_unit";
  priceAppliesTo: number;
  currency: string;
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
  createdAt: string;
}

export interface ApiCustomItem {
  type: "custom";
  price: number;
  priceType: "total" | "per_person" | "per_night" | "per_unit";
  priceAppliesTo: number;
  currency: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  date?: string;
  createdAt: string;
}

export interface CreateQuoteApiInput {
  clientId: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  infants: number;
  flights: ApiFlightItem[];
  hotels: ApiHotelItem[];
  activities: ApiActivityItem[];
  transfers: ApiTransferItem[];
  carRentals: ApiCarItem[];
  customItems: ApiCustomItem[];
  agentMarkupPercent: number;
  discount: number;
  taxes: number;
  fees: number;
  showCommissionToClient?: boolean;
  commissionLabel?: string;
  expiresInDays?: number;
  inclusions?: string[];
  exclusions?: string[];
  importantInfo?: string;
  customNotes?: string;
  agentNotes?: string;
}

// ============================================================================
// TRANSFORMER FUNCTIONS
// ============================================================================

/**
 * Transform QuoteWorkspaceState to API-compatible format
 * This is the Single Source of Truth for save transformations
 */
export function workspaceToApiQuote(
  workspaceState: QuoteWorkspaceState
): CreateQuoteApiInput {
  // Validate prerequisites
  if (!workspaceState.client?.id) {
    throw new Error("Cannot save quote: No client selected");
  }

  if (workspaceState.items.length === 0 && !workspaceState.tripName) {
    throw new Error("Cannot save empty quote: Add items or trip name first");
  }

  // Normalize dates to ISO format
  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString();
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  };

  const travelers = workspaceState.travelers.total;

  // Transform items with schema mapping
  return {
    clientId: workspaceState.client.id,
    tripName: workspaceState.tripName || "Untitled Trip",
    destination: workspaceState.destination || "",
    startDate: normalizeDate(workspaceState.startDate),
    endDate: normalizeDate(workspaceState.endDate),
    adults: workspaceState.travelers.adults,
    children: workspaceState.travelers.children,
    infants: workspaceState.travelers.infants,
    // Transform each item type
    flights: workspaceState.items
      .filter((i) => i.type === "flight")
      .map(flightToApiFormat),
    hotels: workspaceState.items
      .filter((i) => i.type === "hotel")
      .map(hotelToApiFormat),
    activities: workspaceState.items
      .filter((i) => i.type === "activity")
      .map(activityToApiFormat),
    transfers: workspaceState.items
      .filter((i) => i.type === "transfer")
      .map(transferToApiFormat),
    carRentals: workspaceState.items
      .filter((i) => i.type === "car")
      .map(carToApiFormat),
    customItems: workspaceState.items
      .filter((i) => i.type === "custom")
      .map(customToApiFormat),
    // Pricing from state (already computed by QuotePricingService)
    agentMarkupPercent: workspaceState.pricing.markupPercent,
    discount: workspaceState.pricing.discount,
    taxes: workspaceState.pricing.taxes,
    fees: workspaceState.pricing.fees,
  };
}

/**
 * Transform workspace flight item to API format
 * Extracts from nested 'details' object and adds required fields
 */
function flightToApiFormat(item: QuoteItem): ApiFlightItem {
  const details = item.details || {};

  return {
    type: "flight",
    price: item.price,
    priceType: "total", // Default for flight bookings
    priceAppliesTo: 1, // Applies to all travelers
    currency: item.currency || "USD",
    // Extract from details or set defaults
    airline: details.airline || details.carrier || "",
    flightNumber: details.flightNumber || details.number || "",
    origin: details.origin || details.originIataCode || details.originCity?.iataCode || "",
    originCity: details.originCity?.name || details.originCity || "",
    destination: details.destination || details.destinationIataCode || details.destinationCity?.iataCode || "",
    destinationCity: details.destinationCity?.name || details.destinationCity || "",
    departureTime: details.departureTime || details.departure?.at || "",
    arrivalTime: details.arrivalTime || details.arrival?.at || "",
    duration: details.duration || details.flightDuration || "",
    stops: details.stops || 0,
    cabinClass: details.cabinClass || details.cabin || "economy",
    passengers: details.passengers || travelers || 1,
    date: item.date || details.departureTime || new Date().toISOString(),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

/**
 * Transform workspace hotel item to API format
 * Extracts from nested 'details' object and adds required fields
 */
function hotelToApiFormat(item: QuoteItem): ApiHotelItem {
  const details = item.details || {};
  
  // Calculate nights from date range
  const nights = details.nights || details.duration || 1;
  
  // Infer room type from stars
  const stars = details.starRating || details.stars || 3;
  const roomType = stars >= 5 ? "Suite" : stars >= 4 ? "Deluxe" : "Standard";

  return {
    type: "hotel",
    price: item.price,
    priceType: "per_night", // Hotel prices are per night
    priceAppliesTo: travelers || 1,
    nights,
    currency: item.currency || "USD",
    // Extract from details
    name: details.name || details.hotelName || "",
    location: details.location || details.city || "",
    checkIn: details.checkIn || item.date || "",
    checkOut: details.checkOut || "",
    roomType,
    stars,
    amenities: details.amenities || details.facilities || [],
    guests: details.guests || travelers || 1,
    image: details.image || details.photos?.[0],
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

/**
 * Transform workspace activity item to API format
 * Extracts from nested 'details' object and adds required fields
 */
function activityToApiFormat(item: QuoteItem): ApiActivityItem {
  const details = item.details || {};

  return {
    type: "activity",
    price: item.price,
    priceType: "per_person", // Activities are typically per person
    priceAppliesTo: travelers || 1,
    currency: item.currency || "USD",
    // Extract from details
    name: details.name || details.title || "",
    location: details.location || details.venue || "",
    description: details.description || details.about || "",
    duration: details.duration || "",
    time: details.time || details.startTime || "",
    participants: details.participants || travelers || 1,
    includes: details.includes || details.included || [],
    image: details.image || details.photos?.[0],
    date: item.date || new Date().toISOString(),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

/**
 * Transform workspace transfer item to API format
 * Extracts from nested 'details' object and adds required fields
 */
function transferToApiFormat(item: QuoteItem): ApiTransferItem {
  const details = item.details || {};

  return {
    type: "transfer",
    price: item.price,
    priceType: "total", // Transfers are typically total price
    priceAppliesTo: 1,
    currency: item.currency || "USD",
    // Extract from details
    provider: details.provider || details.company || "",
    vehicleType: details.vehicleType || details.vehicle || "Sedan",
    pickupLocation: details.pickupLocation || details.from || "",
    dropoffLocation: details.dropoffLocation || details.to || "",
    pickupTime: details.pickupTime || details.time || "",
    passengers: details.passengers || travelers || 1,
    meetAndGreet: details.meetAndGreet || details.meetAndWelcome || false,
    date: item.date || new Date().toISOString(),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

/**
 * Transform workspace car rental item to API format
 * Extracts from nested 'details' object and adds required fields
 */
function carToApiFormat(item: QuoteItem): ApiCarItem {
  const details = item.details || {};
  
  // Calculate days from date range
  const days = details.days || details.duration || 1;

  return {
    type: "car",
    price: item.price,
    priceType: "per_day", // Car rentals are per day
    priceAppliesTo: travelers || 1,
    currency: item.currency || "USD",
    // Extract from details
    company: details.company || details.provider || "",
    carType: details.carType || details.vehicle || "",
    carClass: details.carClass || details.category || "Economy",
    pickupLocation: details.pickupLocation || details.from || "",
    dropoffLocation: details.dropoffLocation || details.to || "",
    pickupDate: details.pickupDate || item.date || "",
    dropoffDate: details.dropoffDate || "",
    days,
    features: details.features || details.amenities || [],
    image: details.image || details.photos?.[0],
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

/**
 * Transform workspace custom item to API format
 * Extracts from nested 'details' object and adds required fields
 */
function customToApiFormat(item: QuoteItem): ApiCustomItem {
  const details = item.details || {};

  return {
    type: "custom",
    price: item.price,
    priceType: "total", // Custom items are typically total price
    priceAppliesTo: 1,
    currency: item.currency || "USD",
    // Extract from details
    name: details.name || item.title || "",
    description: details.description || item.notes || "",
    category: details.category || "Other",
    quantity: details.quantity || 1,
    date: item.date || new Date().toISOString(),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate mapped quote before API submission
 * Returns detailed error messages for validation failures
 */
export interface QuoteValidationError {
  field: string;
  message: string;
  code: string;
}

export function validateMappedQuote(quote: CreateQuoteApiInput): QuoteValidationError[] {
  const errors: QuoteValidationError[] = [];

  // Validate required fields
  if (!quote.clientId) {
    errors.push({
      field: "clientId",
      message: "Client is required",
      code: "REQUIRED_FIELD_MISSING",
    });
  }

  if (!quote.tripName) {
    errors.push({
      field: "tripName",
      message: "Trip name is required",
      code: "REQUIRED_FIELD_MISSING",
    });
  }

  // Validate dates
  if (!quote.startDate) {
    errors.push({
      field: "startDate",
      message: "Start date is required",
      code: "INVALID_DATE",
    });
  }

  if (!quote.endDate) {
    errors.push({
      field: "endDate",
      message: "End date is required",
      code: "INVALID_DATE",
    });
  }

  const start = new Date(quote.startDate);
  const end = new Date(quote.endDate);
  const now = new Date();

  if (isNaN(start.getTime())) {
    errors.push({
      field: "startDate",
      message: "Invalid start date format",
      code: "INVALID_DATE_FORMAT",
    });
  }

  if (isNaN(end.getTime())) {
    errors.push({
      field: "endDate",
      message: "Invalid end date format",
      code: "INVALID_DATE_FORMAT",
    });
  }

  if (start < now) {
    errors.push({
      field: "startDate",
      message: "Start date cannot be in the past",
      code: "DATE_IN_PAST",
    });
  }

  if (end <= start) {
    errors.push({
      field: "endDate",
      message: "End date must be after start date",
      code: "END_DATE_BEFORE_START",
    });
  }

  // Validate item arrays
  if (quote.flights.length === 0 && 
      quote.hotels.length === 0 && 
      quote.activities.length === 0 && 
      quote.transfers.length === 0 && 
      quote.carRentals.length === 0 && 
      quote.customItems.length === 0) {
    errors.push({
      field: "items",
      message: "At least one item is required",
      code: "NO_ITEMS",
    });
  }

  // Validate each item has required fields
  quote.flights.forEach((flight, index) => {
    if (!flight.flightNumber) {
      errors.push({
        field: `flights[${index}].flightNumber`,
        message: "Flight number is required",
        code: "REQUIRED_FIELD_MISSING",
      });
    }
    if (!flight.airline) {
      errors.push({
        field: `flights[${index}].airline`,
        message: "Airline is required",
        code: "REQUIRED_FIELD_MISSING",
      });
    }
  });

  quote.hotels.forEach((hotel, index) => {
    if (!hotel.name) {
      errors.push({
        field: `hotels[${index}].name`,
        message: "Hotel name is required",
        code: "REQUIRED_FIELD_MISSING",
      });
    }
    if (hotel.nights < 1) {
      errors.push({
        field: `hotels[${index}].nights`,
        message: "Hotel must have at least 1 night",
        code: "INVALID_DURATION",
      });
    }
  });

  // Validate pricing
  if (quote.agentMarkupPercent < 0 || quote.agentMarkupPercent > 100) {
    errors.push({
      field: "agentMarkupPercent",
      message: "Markup must be between 0 and 100",
      code: "INVALID_MARKUP_PERCENT",
    });
  }

  if (quote.discount < 0) {
    errors.push({
      field: "discount",
      message: "Discount cannot be negative",
      code: "INVALID_DISCOUNT",
    });
  }

  if (quote.taxes < 0) {
    errors.push({
      field: "taxes",
      message: "Taxes cannot be negative",
      code: "INVALID_TAXES",
    });
  }

  if (quote.fees < 0) {
    errors.push({
      field: "fees",
      message: "Fees cannot be negative",
      code: "INVALID_FEES",
    });
  }

  // Validate traveler count
  if (quote.adults < 1) {
    errors.push({
      field: "adults",
      message: "At least 1 adult is required",
      code: "INVALID_ADULTS",
    });
  }

  if (quote.children < 0) {
    errors.push({
      field: "children",
      message: "Children count cannot be negative",
      code: "INVALID_CHILDREN",
    });
  }

  if (quote.infants < 0) {
    errors.push({
      field: "infants",
      message: "Infants count cannot be negative",
      code: "INVALID_INFANTS",
    });
  }

  return errors;
}

/**
 * Format validation errors into user-friendly messages
 */
export function formatValidationErrors(errors: QuoteValidationError[]): string {
  if (errors.length === 0) return "";

  // Group errors by field
  const errorsByField = new Map<string, QuoteValidationError[]>();
  errors.forEach((error) => {
    const existing = errorsByField.get(error.field) || [];
    existing.push(error);
    errorsByField.set(error.field, existing);
  });

  // Build readable message
  const messages: string[] = [];

  errorsByField.forEach((fieldErrors, field) => {
    const firstError = fieldErrors[0];
    const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
    messages.push(`${fieldName}: ${firstError.message.toLowerCase()}`);
  });

  return messages.join("\n");
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  workspaceToApiQuote,
  validateMappedQuote,
  formatValidationErrors,
};
