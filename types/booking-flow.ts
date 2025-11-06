/**
 * E2E Conversational Commerce - Booking Flow Types
 *
 * Supports complete booking journey within chat interface:
 * Discovery → Selection → Customization → Review → Payment → Confirmation
 */

// ============================================================================
// BOOKING FLOW STAGES
// ============================================================================

export type BookingFlowStage =
  | 'discovery'          // Initial search and conversation
  | 'flight_selection'   // Choosing flight
  | 'fare_selection'     // Choosing fare class
  | 'seat_selection'     // Choosing seats
  | 'baggage_selection'  // Adding baggage
  | 'extras_selection'   // Other add-ons (meals, insurance, etc.)
  | 'review'             // Review booking summary
  | 'payment'            // Payment processing
  | 'confirmation';      // Booking confirmed

export interface BookingFlowProgress {
  currentStage: BookingFlowStage;
  completedStages: BookingFlowStage[];
  totalStages: number;
  currentStepNumber: number;
}

// ============================================================================
// RICH MESSAGE TYPES
// ============================================================================

export type RichMessageType =
  | 'text'                    // Regular text message
  | 'flight_options'          // Flight cards with selection
  | 'fare_selector'           // Fare comparison widget
  | 'seat_map'                // Interactive seat selection
  | 'baggage_upsell'          // Baggage add-on widget
  | 'booking_summary'         // Review booking details
  | 'payment_form'            // Stripe payment integration
  | 'confirmation'            // Booking confirmation
  | 'progress_indicator'      // Show booking progress
  | 'quick_actions';          // Action buttons

// ============================================================================
// BOOKING STATE
// ============================================================================

export interface BookingState {
  // Booking Session
  id: string;                      // Unique booking session ID
  createdAt: Date;                 // Session creation timestamp
  updatedAt: Date;                 // Last modification timestamp

  // Flight Selection
  searchParams?: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    class: 'economy' | 'premium_economy' | 'business' | 'first';
  };

  selectedFlight?: {
    id: string;
    offerId: string;
    airline: string;
    flightNumber: string;
    price: number;
    currency: string;
  };

  // Fare Selection
  selectedFare?: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };

  // Seat Selection
  selectedSeats?: Array<{
    passengerId: string;
    seatNumber: string;
    price: number;
  }>;

  // Baggage
  selectedBaggage?: Array<{
    passengerId: string;
    quantity: number;
    price: number;
  }>;

  // Extras
  selectedExtras?: {
    meals?: boolean;
    insurance?: boolean;
    priorityBoarding?: boolean;
    lounge?: boolean;
  };

  // Pricing
  pricing: {
    baseFare: number;
    taxes: number;
    seatFees: number;
    baggageFees: number;
    extrasFees: number;
    total: number;
    currency: string;
  };

  // Payment
  paymentIntentId?: string;

  // Confirmation
  bookingReference?: string;
  confirmationEmail?: string;
}

// ============================================================================
// WIDGET DATA INTERFACES
// ============================================================================

export interface FlightOption {
  id: string;
  offerId: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  departure: {
    airport: string;
    airportCode: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    airportCode: string;
    time: string;
    terminal?: string;
  };
  duration: string;
  stops: number;
  stopDetails?: string;
  price: number;
  currency: string;
  cabinClass: string;
  availableSeats: number;
  dealScore?: number;
  co2Emissions?: number;
}

export interface FareOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  restrictions?: string[];
  recommended?: boolean;
  popularityPercent?: number;
}

export interface SeatOption {
  number: string;
  type: 'window' | 'middle' | 'aisle';
  class: 'economy' | 'premium_economy' | 'business' | 'first';
  available: boolean;
  price: number;
  features?: string[]; // e.g., 'extra legroom', 'near exit'
  row: number;
  column: string;
}

export interface BaggageOption {
  id: string;
  quantity: number;
  weight: string;
  price: number;
  currency: string;
  description: string;
}

// ============================================================================
// RICH MESSAGE DATA
// ============================================================================

export interface RichMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  type: RichMessageType;
  content: string;
  timestamp: Date;

  // Consultant info
  consultant?: {
    id: string;
    name: string;
    team: string;
  };

  // Rich widget data
  data?: {
    // Flight selection
    flights?: FlightOption[];
    selectedFlightId?: string;

    // Fare selection
    fares?: FareOption[];
    selectedFareId?: string;

    // Seat selection
    seats?: SeatOption[];
    selectedSeats?: string[];

    // Baggage
    baggageOptions?: BaggageOption[];
    selectedBaggage?: number;

    // Booking summary
    bookingSummary?: BookingState;

    // Progress
    progress?: BookingFlowProgress;

    // Quick actions
    quickActions?: Array<{
      label: string;
      action: string;
      icon?: string;
    }>;
  };

  // Message metadata
  metadata?: {
    canEdit?: boolean;
    canCancel?: boolean;
    requiresAction?: boolean;
    actionType?: 'select' | 'confirm' | 'input' | 'payment';
  };
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

export interface BookingFlowActions {
  // Flight selection
  onFlightSelect: (flightId: string) => void;
  onViewMoreFlights: () => void;

  // Fare selection
  onFareSelect: (fareId: string) => void;

  // Seat selection
  onSeatSelect: (seatNumber: string, passengerId: string) => void;
  onSkipSeats: () => void;

  // Baggage
  onBaggageSelect: (quantity: number) => void;

  // Flow control
  onContinue: () => void;
  onGoBack: () => void;
  onSaveForLater: () => void;
  onCancel: () => void;

  // Payment
  onPaymentSubmit: (paymentData: any) => void;

  // Escape hatches
  onOpenFullView: () => void;
  onRequestCall: () => void;
  onRequestEmail: () => void;
}

// ============================================================================
// BOOKING FLOW CONFIGURATION
// ============================================================================

export const BOOKING_FLOW_STAGES_CONFIG: Record<BookingFlowStage, {
  stepNumber: number;
  label: string;
  icon: string;
  skippable: boolean;
}> = {
  discovery: {
    stepNumber: 1,
    label: 'Search',
    icon: '🔍',
    skippable: false,
  },
  flight_selection: {
    stepNumber: 2,
    label: 'Choose Flight',
    icon: '✈️',
    skippable: false,
  },
  fare_selection: {
    stepNumber: 3,
    label: 'Select Fare',
    icon: '💺',
    skippable: false,
  },
  seat_selection: {
    stepNumber: 4,
    label: 'Pick Seats',
    icon: '🪑',
    skippable: true,
  },
  baggage_selection: {
    stepNumber: 5,
    label: 'Add Baggage',
    icon: '🧳',
    skippable: true,
  },
  extras_selection: {
    stepNumber: 6,
    label: 'Extras',
    icon: '➕',
    skippable: true,
  },
  review: {
    stepNumber: 7,
    label: 'Review',
    icon: '📋',
    skippable: false,
  },
  payment: {
    stepNumber: 8,
    label: 'Payment',
    icon: '💳',
    skippable: false,
  },
  confirmation: {
    stepNumber: 9,
    label: 'Confirmed',
    icon: '✅',
    skippable: false,
  },
};

export const TOTAL_BOOKING_STAGES = Object.keys(BOOKING_FLOW_STAGES_CONFIG).length;
