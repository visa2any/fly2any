/**
 * Journey System Type Definitions
 * Fly2Any Travel Operating System - Level 6 Ultra-Premium
 */

import { FlightOffer, FlightSegment as FlightSeg } from '@/lib/flights/types';
import { Hotel, HotelRate } from '@/lib/hotels/types';

// ============================================================================
// CORE JOURNEY TYPES
// ============================================================================

export type JourneyStatus =
  | 'draft'      // Initial state, being configured
  | 'building'   // AI is generating the journey
  | 'ready'      // Journey built, ready for review
  | 'booked'     // All components booked
  | 'completed'  // Trip completed
  | 'cancelled'; // Cancelled by user

export type JourneyPace = 'relaxed' | 'balanced' | 'intensive';

export type InterestType =
  | 'food'
  | 'culture'
  | 'nature'
  | 'shopping'
  | 'nightlife'
  | 'adventure'
  | 'wellness'
  | 'family'
  | 'business';

export type ExperienceType =
  | 'restaurant'
  | 'attraction'
  | 'tour'
  | 'activity'
  | 'show'
  | 'transport'
  | 'shopping'
  | 'wellness';

export type ExperienceStatus = 'suggested' | 'added' | 'booked' | 'dismissed';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

// ============================================================================
// JOURNEY PREFERENCES
// ============================================================================

export interface JourneyPreferences {
  pace: JourneyPace;
  budget?: {
    min: number;
    max: number;
    currency: string;
    perPerson: boolean;
  };
  interests: InterestType[];
  accessibility?: {
    wheelchairAccessible?: boolean;
    limitedMobility?: boolean;
    hearingAssistance?: boolean;
  };
}

// ============================================================================
// TRAVELER TYPES
// ============================================================================

export interface JourneyTraveler {
  type: 'adult' | 'child' | 'infant';
  age?: number; // Required for children
}

export interface JourneyTravelers {
  adults: number;
  children: number;
  childAges: number[];
  infants: number;
  rooms: number;
}

// ============================================================================
// EXPERIENCE TYPES
// ============================================================================

export interface JourneyExperience {
  id: string;
  type: ExperienceType;
  name: string;
  description?: string;
  duration: number; // minutes
  timeSlot: TimeSlot;
  scheduledTime?: string; // HH:MM
  location: {
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
    distanceFromHotel?: number; // km
  };
  price: {
    amount: number;
    currency: string;
    isEstimate: boolean;
  };
  images?: string[];
  rating?: number;
  reviewCount?: number;
  source: 'ai' | 'manual' | 'api';
  aiConfidence?: number; // 0-100
  status: ExperienceStatus;
  bookingUrl?: string;
  tags?: string[];
}

// ============================================================================
// SEGMENT TYPES (Flight, Transfer, etc.)
// ============================================================================

export interface JourneyFlightSegment {
  type: 'flight';
  id: string;
  flightOffer: FlightOffer;
  direction: 'outbound' | 'return';
  status: 'pending' | 'booked';
}

export interface JourneyTransferSegment {
  type: 'transfer';
  id: string;
  transferType: 'airport' | 'hotel' | 'activity';
  from: string;
  to: string;
  duration: number; // minutes
  price?: {
    amount: number;
    currency: string;
  };
  status: 'suggested' | 'added' | 'booked';
}

export type JourneySegment = JourneyFlightSegment | JourneyTransferSegment;

// ============================================================================
// UNIFIED FLIGHT & HOTEL TYPES (for Journey API)
// ============================================================================

export interface JourneyFlight {
  id: string;
  type: 'outbound' | 'return';
  airline: {
    code: string;
    name: string;
    logo?: string;
  };
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
  };
  arrival: {
    airport: string;
    time: string;
  };
  duration: number; // minutes
  stops: number;
  cabinClass: string;
  price: {
    amount: number;
    currency: string;
    perPerson?: number;
  };
  status: 'pending' | 'selected' | 'booked';
  baggageIncluded?: boolean;
  aircraft?: string;
}

export interface JourneyHotel {
  id: string;
  name: string;
  address: string;
  stars: number;
  rating: number;
  reviewCount: number;
  thumbnail?: string;
  images: string[];
  amenities: string[];
  checkIn: string;
  checkOut: string;
  roomType: string;
  price: {
    amount: number;
    currency: string;
    perNight?: number;
  };
  status: 'pending' | 'selected' | 'booked';
  refundable: boolean;
  breakfastIncluded: boolean;
}

export interface JourneyDaySegment {
  id: string;
  type: 'outbound-flight' | 'return-flight' | 'hotel' | 'transfer';
  flight?: JourneyFlight;
  hotel?: JourneyHotel;
  transfer?: {
    from: string;
    to: string;
    duration: number;
  };
}

// ============================================================================
// ACCOMMODATION TYPES
// ============================================================================

export interface JourneyAccommodation {
  id: string;
  hotel: Hotel;
  rate?: HotelRate;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  rooms: number;
  status: 'pending' | 'booked';
  totalPrice?: {
    amount: number;
    currency: string;
  };
}

// ============================================================================
// DAY TYPES
// ============================================================================

export interface JourneyDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Mon, Tue, etc.
  isArrivalDay: boolean;
  isDepartureDay: boolean;
  segments: JourneyDaySegment[];
  experiences: JourneyExperience[];
  accommodation?: JourneyAccommodation;
  weather?: {
    condition: string;
    tempHigh: number;
    tempLow: number;
    icon: string;
  };
  notes?: string;
  warnings?: JourneyWarning[];
}

// ============================================================================
// WARNING TYPES
// ============================================================================

export type WarningType = 'fatigue' | 'conflict' | 'timing' | 'budget' | 'connection';

export interface JourneyWarning {
  id: string;
  type: WarningType;
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  dayNumber?: number;
  experienceId?: string;
  suggestion?: string;
}

// ============================================================================
// PRICING TYPES
// ============================================================================

export interface JourneyPricingItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
}

export interface JourneyPricing {
  flights: {
    items: JourneyPricingItem[];
    subtotal: number;
  };
  hotels: {
    items: JourneyPricingItem[];
    subtotal: number;
  };
  experiences: {
    items: JourneyPricingItem[];
    subtotal: number;
    isEstimate: boolean;
  };
  transfers?: {
    items: JourneyPricingItem[];
    subtotal: number;
  };
  total: number;
  currency: string;
  perPerson?: number;
  savings?: {
    amount: number;
    percentage: number;
    vsSepatate: number; // Price if booked separately
  };
}

// ============================================================================
// MAIN JOURNEY TYPE
// ============================================================================

export interface Journey {
  id: string;
  userId?: string;
  status: JourneyStatus;

  // Trip details
  origin: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  departureDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  duration: number; // days

  // Travelers
  travelers: JourneyTravelers;

  // Preferences
  preferences: JourneyPreferences;

  // Core data
  days: JourneyDay[];

  // Pricing
  pricing: JourneyPricing;

  // Warnings
  warnings: JourneyWarning[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  buildStartedAt?: string;
  buildCompletedAt?: string;
}

// ============================================================================
// SEARCH PARAMS
// ============================================================================

export interface JourneySearchParams {
  origin: string; // Airport code(s)
  destination: string; // Airport code(s)
  departureDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  travelers: JourneyTravelers;
  preferences?: Partial<JourneyPreferences>;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface JourneyValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: JourneyWarning[];
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface JourneyState {
  journey: Journey | null;
  isBuilding: boolean;
  buildProgress: number; // 0-100
  selectedDayIndex: number;
  error: string | null;
}

export type JourneyAction =
  | { type: 'SET_JOURNEY'; payload: Journey }
  | { type: 'SET_BUILDING'; payload: boolean }
  | { type: 'SET_BUILD_PROGRESS'; payload: number }
  | { type: 'SET_SELECTED_DAY'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_DAY'; payload: { dayIndex: number; day: JourneyDay } }
  | { type: 'ADD_EXPERIENCE'; payload: { dayIndex: number; experience: JourneyExperience } }
  | { type: 'REMOVE_EXPERIENCE'; payload: { dayIndex: number; experienceId: string } }
  | { type: 'UPDATE_EXPERIENCE'; payload: { dayIndex: number; experience: JourneyExperience } }
  | { type: 'SET_FLIGHT'; payload: { direction: 'outbound' | 'return'; flight: FlightOffer } }
  | { type: 'SET_HOTEL'; payload: JourneyAccommodation }
  | { type: 'RESET_JOURNEY' };

// ============================================================================
// AI TYPES
// ============================================================================

export interface AIExperienceSuggestion {
  experiences: JourneyExperience[];
  reasoning?: string;
  confidence: number;
}

export interface AIDayOptimization {
  optimizedExperiences: JourneyExperience[];
  changes: Array<{
    type: 'reorder' | 'replace' | 'remove' | 'add';
    description: string;
  }>;
  timeSaved?: number; // minutes
  distanceSaved?: number; // km
}
