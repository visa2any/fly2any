/**
 * Hotel Booking Type Definitions
 *
 * Comprehensive TypeScript types for hotel search, booking, and management.
 * Compatible with Duffel Stays API.
 */

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface HotelLocation {
  lat: number;
  lng: number;
}

export interface HotelLocationQuery {
  query: string;
}

export interface HotelGuests {
  adults: number;
  children?: number[]; // Ages of children
}

export interface HotelSearchParams {
  location: HotelLocation | HotelLocationQuery;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: HotelGuests;
  rooms?: number; // Number of rooms (default: 1)
  radius?: number; // Search radius in km (default: 5, max: 50)
  limit?: number; // Max results (default: 20, max: 100)

  // Filters
  minRating?: number; // 1-5 stars
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
  currency?: string; // USD, EUR, GBP, etc.
  amenities?: HotelAmenity[];
  propertyTypes?: HotelPropertyType[];
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'distance' | 'popularity';
}

export type HotelAmenity =
  | 'wifi'
  | 'pool'
  | 'parking'
  | 'gym'
  | 'spa'
  | 'restaurant'
  | 'bar'
  | 'room_service'
  | 'pet_friendly'
  | 'air_conditioning'
  | 'breakfast'
  | 'kitchen'
  | 'laundry'
  | 'airport_shuttle'
  | 'business_center'
  | 'meeting_rooms';

export type HotelPropertyType =
  | 'hotel'
  | 'apartment'
  | 'hostel'
  | 'resort'
  | 'villa'
  | 'guesthouse'
  | 'motel'
  | 'lodge'
  | 'bed_and_breakfast';

// ============================================================================
// HOTEL & ACCOMMODATION TYPES
// ============================================================================

export interface Hotel {
  id: string;
  name: string;
  description?: string;

  // Location
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  location: {
    lat: number;
    lng: number;
  };

  // Property details
  starRating?: number; // 1-5
  propertyType: HotelPropertyType;
  chainCode?: string;
  chainName?: string;

  // Media
  images: HotelImage[];

  // Amenities & features
  amenities: string[];
  facilities: string[];

  // Reviews & ratings
  reviewRating?: number; // Guest review score (0-10)
  reviewCount?: number;

  // Contact
  phone?: string;
  email?: string;
  website?: string;

  // Check-in/out times
  checkInTime?: string; // HH:MM format
  checkOutTime?: string; // HH:MM format

  // Distance (if location-based search)
  distanceKm?: number;

  // Price (for search results)
  lowestPrice?: number; // Total price for entire stay
  lowestPricePerNight?: number; // Per-night price

  // Available rates
  rates: HotelRate[];

  // Metadata
  source: 'Duffel Stays' | 'Amadeus' | 'LiteAPI';
  lastUpdated?: string;
}

export interface HotelImage {
  url: string;
  caption?: string;
  type?: 'exterior' | 'interior' | 'room' | 'amenity' | 'food' | 'pool' | 'lobby';
  width?: number;
  height?: number;
}

// ============================================================================
// ROOM & RATE TYPES
// ============================================================================

export interface HotelRate {
  id: string;
  hotelId: string;

  // Room details
  roomType: string;
  roomDescription?: string;
  bedType?: string;
  bedCount?: number;
  maxOccupancy: number;

  // Pricing
  price: {
    amount: string;
    currency: string;
    base?: string; // Base price before taxes
    taxes?: string;
  };
  totalPrice: {
    amount: string;
    currency: string;
  };

  // Cancellation policy
  cancellationPolicy: CancellationPolicy;

  // Payment terms
  paymentType: 'prepaid' | 'pay_at_hotel';
  refundable: boolean;

  // Inclusions
  mealsIncluded?: MealPlan;
  amenities: string[];

  // Availability
  available: boolean;
  roomsLeft?: number; // Urgency indicator

  // Metadata
  rateType?: 'standard' | 'promotional' | 'package' | 'member';
  validUntil?: string; // ISO timestamp
}

export type MealPlan =
  | 'none'
  | 'breakfast'
  | 'half_board' // Breakfast + dinner
  | 'full_board' // Breakfast + lunch + dinner
  | 'all_inclusive';

export interface CancellationPolicy {
  type: 'free_cancellation' | 'partial_refund' | 'non_refundable';
  description: string;
  deadlineDate?: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:MM
  penaltyAmount?: string;
  penaltyCurrency?: string;
  refundPercentage?: number; // 0-100
}

// ============================================================================
// BOOKING TYPES
// ============================================================================

export interface HotelBookingGuest {
  title?: 'mr' | 'ms' | 'mrs' | 'miss' | 'dr';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string; // YYYY-MM-DD (required for children)
  type: 'adult' | 'child';
}

export interface HotelBookingRequest {
  quoteId: string;
  guests: HotelBookingGuest[];
  primaryGuest: HotelBookingGuest;

  // Payment
  payment: {
    method: 'card' | 'balance';
    amount: string;
    currency: string;
    cardDetails?: {
      number: string;
      expiryMonth: string;
      expiryYear: string;
      cvc: string;
      holderName: string;
    };
  };

  // Special requests
  specialRequests?: string;
  arrivalTime?: string; // Estimated arrival time

  // Marketing preferences
  newsletterOptIn?: boolean;
}

export interface HotelBooking {
  id: string;
  reference: string; // Confirmation number
  status: HotelBookingStatus;

  // Hotel & room details
  hotel: Hotel;
  rate: HotelRate;

  // Stay details
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  rooms: number;

  // Guest information
  guests: HotelBookingGuest[];
  primaryGuest: HotelBookingGuest;

  // Pricing
  pricing: {
    baseAmount: string;
    taxesAmount: string;
    totalAmount: string;
    currency: string;
    commissionAmount?: string; // Our revenue
    commissionPercentage?: number;
  };

  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paidAmount?: string;

  // Cancellation
  cancellationPolicy: CancellationPolicy;
  cancelledAt?: string;
  cancellationReason?: string;
  refundAmount?: string;

  // Special requests
  specialRequests?: string;
  arrivalTime?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;

  // Flight bundle (optional)
  flightBookingId?: string; // Link to flight booking for packages
  bundleDiscount?: string;

  // Metadata
  source: 'Duffel Stays';
  liveMode: boolean;
  userId?: string;
}

export type HotelBookingStatus =
  | 'pending' // Awaiting confirmation
  | 'confirmed' // Booking confirmed
  | 'cancelled' // Cancelled by user or hotel
  | 'completed' // Guest checked out
  | 'no_show'; // Guest didn't arrive

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

// ============================================================================
// QUOTE TYPES
// ============================================================================

export interface HotelQuote {
  id: string;
  rateId: string;

  // Pricing (locked in for limited time)
  price: {
    amount: string;
    currency: string;
    base?: string;
    taxes?: string;
  };

  // Expiry
  expiresAt: string; // ISO timestamp

  // Guest details
  guests: HotelBookingGuest[];

  // Terms
  cancellationPolicy: CancellationPolicy;
  termsAndConditions: string;

  // Metadata
  createdAt: string;
}

// ============================================================================
// SEARCH SUGGESTION TYPES
// ============================================================================

export interface HotelLocationSuggestion {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  location: {
    lat: number;
    lng: number;
  };
  type: 'city' | 'hotel' | 'landmark' | 'airport' | 'neighborhood';
  hotelCount?: number; // Number of hotels in this location
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

export interface HotelSearchFilters {
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  starRating: number[];
  propertyTypes: HotelPropertyType[];
  amenities: HotelAmenity[];
  mealPlans: MealPlan[];
  cancellationPolicies: ('free_cancellation' | 'partial_refund' | 'non_refundable')[];
  reviewRating?: number; // Minimum review score
  distance?: number; // Maximum distance in km
}

export interface HotelSearchSort {
  field: 'price' | 'rating' | 'distance' | 'popularity' | 'review_score';
  order: 'asc' | 'desc';
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface HotelSearchResponse {
  data: Hotel[];
  meta: {
    count: number;
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    filters?: HotelSearchFilters;
    sort?: HotelSearchSort;
  };
}

export interface HotelDetailsResponse {
  data: Hotel;
  meta: {
    lastUpdated: string;
  };
}

export interface HotelBookingResponse {
  data: HotelBooking;
  meta: {
    createdAt: string;
  };
}

export interface HotelQuoteResponse {
  data: HotelQuote;
  meta: {
    createdAt: string;
  };
}

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface HotelBookingRecord {
  id: string;
  reference: string;
  status: HotelBookingStatus;

  // Hotel details (denormalized for performance)
  hotel_id: string;
  hotel_name: string;
  hotel_address: string;
  hotel_city: string;
  hotel_country: string;

  // Room & rate
  rate_id: string;
  room_type: string;

  // Stay details
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  nights: number;
  rooms: number;

  // Guest information (JSON)
  guests: any; // JSON array
  primary_guest_name: string;
  primary_guest_email: string;
  primary_guest_phone: string;

  // Pricing
  base_amount: number;
  taxes_amount: number;
  total_amount: number;
  currency: string;
  commission_amount?: number;
  commission_percentage?: number;

  // Payment
  payment_status: PaymentStatus;
  payment_method: string;
  paid_amount?: number;

  // Cancellation
  cancellation_policy: any; // JSON
  cancelled_at?: string;
  cancellation_reason?: string;
  refund_amount?: number;

  // Special requests
  special_requests?: string;
  arrival_time?: string;

  // Flight bundle
  flight_booking_id?: string;
  bundle_discount?: number;

  // Metadata
  source: string;
  live_mode: boolean;
  user_id?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface HotelBookingError {
  code: string;
  message: string;
  type: 'validation' | 'availability' | 'payment' | 'system';
  details?: any;
}

export const HotelErrorCodes = {
  // Availability errors
  RATE_NOT_AVAILABLE: 'RATE_NOT_AVAILABLE',
  HOTEL_NOT_AVAILABLE: 'HOTEL_NOT_AVAILABLE',
  SOLD_OUT: 'SOLD_OUT',

  // Price errors
  PRICE_CHANGED: 'PRICE_CHANGED',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  CARD_DECLINED: 'CARD_DECLINED',

  // Cancellation errors
  NOT_CANCELLABLE: 'NOT_CANCELLABLE',
  ALREADY_CANCELLED: 'ALREADY_CANCELLED',
  CANCELLATION_DEADLINE_PASSED: 'CANCELLATION_DEADLINE_PASSED',

  // Validation errors
  INVALID_DATES: 'INVALID_DATES',
  INVALID_GUESTS: 'INVALID_GUESTS',
  INVALID_LOCATION: 'INVALID_LOCATION',

  // System errors
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

export type HotelErrorCode = typeof HotelErrorCodes[keyof typeof HotelErrorCodes];

// ============================================================================
// COMMISSION TRACKING
// ============================================================================

export interface CommissionRecord {
  id: string;
  booking_id: string;
  booking_reference: string;

  // Commission details
  commission_amount: number;
  commission_percentage: number;
  currency: string;

  // Booking details
  booking_total: number;
  check_in: string;
  check_out: string;

  // Status
  status: 'pending' | 'earned' | 'paid';
  earned_at?: string; // When guest checked in
  paid_at?: string; // When we received payment

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// LITEAPI HOTEL TYPES (Production)
// ============================================================================

export interface LiteAPIHotelRate {
  id: string;
  roomType: string;
  boardType: string;
  totalPrice: {
    amount: string;
    currency: string;
  };
  refundable: boolean;
  maxOccupancy: number;
  offerId: string;
}

export interface LiteAPIHotel {
  id: string;
  name: string;
  description?: string;
  location: {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  rating: number; // star rating (1-5)
  reviewScore: number; // guest review score (0-10)
  reviewCount: number;
  images: Array<{ url: string; alt: string }>;
  thumbnail?: string;
  amenities: string[];
  rates: LiteAPIHotelRate[];
  lowestPrice?: {
    amount: string;
    currency: string;
  };
  lowestPricePerNight?: number; // Per-night price (lowestPrice is TOTAL for entire stay)
  source: 'liteapi';
}

// ============================================================================
// LITEAPI ENHANCED TYPES
// ============================================================================

export interface LiteAPIReviewSentiment {
  overallScore: number;
  totalReviews: number;
  categories: {
    cleanliness?: { score: number; mentions: number };
    service?: { score: number; mentions: number };
    location?: { score: number; mentions: number };
    roomQuality?: { score: number; mentions: number };
    amenities?: { score: number; mentions: number };
    valueForMoney?: { score: number; mentions: number };
    foodAndBeverage?: { score: number; mentions: number };
    overallExperience?: { score: number; mentions: number };
  };
  pros?: string[];
  cons?: string[];
}

export interface LiteAPIHotelReview {
  id: string;
  hotelId: string;
  rating: number;
  title?: string;
  comment: string;
  author: {
    name?: string;
    countryCode?: string;
  };
  date: string;
  helpfulCount?: number;
}

export interface LiteAPIEnhancedHotelDetails {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  stars: number;
  rating: number;
  reviewCount: number;
  checkinCheckoutTimes?: {
    checkin: string;
    checkout: string;
  };
  hotelImportantInformation?: string[];
  hotelFacilities?: string[];
  facilities?: Array<{
    id: number;
    name: string;
    category?: string;
  }>;
}

export interface LiteAPIPlaceSearchResult {
  textForSearch: string;
  placeId: string;
  type: 'city' | 'country' | 'landmark' | 'neighborhood' | 'poi';
  countryCode: string;
  countryName: string;
  cityName?: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface LiteAPIPrebookResponse {
  prebookId: string;
  hotelId: string;
  offerId: string;
  status: 'confirmed' | 'pending' | 'failed';
  price: {
    amount: number;
    currency: string;
  };
  expiresAt: string;
  hotelConfirmationCode?: string;
}

export interface LiteAPIBookingResponse {
  bookingId: string;
  reference: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  hotelId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
  };
  price: {
    amount: number;
    currency: string;
    breakdown?: {
      baseAmount: number;
      taxesAmount: number;
      feesAmount?: number;
    };
  };
  cancellationPolicy?: {
    refundable: boolean;
    deadlines?: Array<{
      date: string;
      time: string;
      penaltyAmount: number;
    }>;
  };
  confirmationCode?: string;
  hotelConfirmationCode?: string;
  createdAt: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface HotelBookingMetrics {
  // Revenue
  totalRevenue: number;
  commissionRevenue: number;
  averageBookingValue: number;

  // Volume
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;

  // Conversion
  searchToBookingRate: number;
  quoteToBookingRate: number;

  // Performance
  averageLeadTime: number; // Days before check-in
  averageStayDuration: number; // Nights
  cancellationRate: number;

  // Popular
  topDestinations: Array<{
    city: string;
    country: string;
    bookings: number;
    revenue: number;
  }>;
  topHotels: Array<{
    hotelId: string;
    hotelName: string;
    bookings: number;
    revenue: number;
  }>;
}
