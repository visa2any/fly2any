/**
 * Provider-Agnostic Booking Types
 * Plug-and-play architecture for any booking API
 */

// ==================== PROVIDER INTERFACE ====================
export interface BookingProvider {
  name: string;
  code: 'duffel' | 'amadeus' | 'sabre' | 'travelport' | string;

  // Core operations
  getOrder(orderId: string): Promise<ProviderOrder>;
  cancelOrder(orderId: string): Promise<CancellationResult>;

  // Optional operations (not all providers support)
  getCancellationQuote?(orderId: string): Promise<CancellationQuote>;
  getChangeOptions?(orderId: string): Promise<ChangeOption[]>;
  confirmChange?(changeId: string): Promise<ChangeResult>;
  addServices?(orderId: string, services: ServiceRequest[]): Promise<ServiceResult>;
  getAvailableServices?(orderId: string): Promise<AvailableService[]>;
}

// ==================== NORMALIZED DATA STRUCTURES ====================
export interface ProviderOrder {
  id: string;
  provider: string;
  bookingReference: string; // Airline PNR
  status: OrderStatus;

  // Passengers & E-Tickets
  passengers: NormalizedPassenger[];
  documents: NormalizedDocument[];

  // Flight details
  itineraries: NormalizedItinerary[];

  // Pricing
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  balanceDue: number;

  // Policies
  conditions: OrderConditions;

  // Services
  services: BookedService[];
  availableServices?: AvailableService[];

  // Timestamps
  createdAt: string;
  syncedAt: string;

  // Raw response (for debugging)
  raw: any;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ticketed'
  | 'cancelled'
  | 'completed'
  | 'expired'
  | 'unknown';

export type PaymentStatus =
  | 'awaiting_payment'
  | 'paid'
  | 'partially_paid'
  | 'refunded'
  | 'failed';

export interface NormalizedPassenger {
  id: string;
  firstName: string;
  lastName: string;
  type: 'adult' | 'child' | 'infant';
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  // E-ticket info
  ticketNumber?: string;
  ticketIssuedAt?: string;
}

export interface NormalizedDocument {
  type: 'electronic_ticket' | 'itinerary' | 'receipt' | 'invoice';
  passengerId?: string;
  uniqueIdentifier?: string; // E-ticket number
  issuedAt?: string;
  url?: string;
}

export interface NormalizedItinerary {
  id: string;
  direction: 'outbound' | 'return';
  segments: NormalizedSegment[];
  duration: string;
}

export interface NormalizedSegment {
  id: string;
  flightNumber: string;
  airline: { code: string; name: string };
  aircraft?: { code: string; name: string };
  departure: {
    airport: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    airport: string;
    terminal?: string;
    at: string;
  };
  duration: string;
  cabinClass: string;
  fareBrand?: string;
}

export interface OrderConditions {
  refundBeforeDeparture?: PolicyCondition;
  refundAfterDeparture?: PolicyCondition;
  changeBeforeDeparture?: PolicyCondition;
  changeAfterDeparture?: PolicyCondition;
}

export interface PolicyCondition {
  allowed: boolean;
  penaltyAmount?: number;
  penaltyCurrency?: string;
  deadline?: string;
}

// ==================== SERVICES ====================
export interface BookedService {
  id: string;
  type: 'baggage' | 'seat' | 'meal' | 'lounge' | 'insurance' | 'other';
  segmentId?: string;
  passengerId?: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface AvailableService {
  id: string;
  type: 'baggage' | 'seat' | 'meal' | 'lounge' | 'insurance' | 'other';
  segmentIds: string[];
  passengerIds: string[];
  maxQuantity: number;
  totalAmount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ServiceRequest {
  serviceId: string;
  quantity: number;
  passengerId?: string;
}

export interface ServiceResult {
  success: boolean;
  services: BookedService[];
  newTotalAmount: number;
  error?: string;
}

// ==================== CANCELLATION ====================
export interface CancellationQuote {
  orderId: string;
  refundAmount: number;
  penaltyAmount: number;
  currency: string;
  expiresAt?: string;
  canCancel: boolean;
  reason?: string;
}

export interface CancellationResult {
  success: boolean;
  orderId: string;
  status: 'cancelled' | 'pending_refund' | 'failed';
  refundAmount?: number;
  refundCurrency?: string;
  error?: string;
}

// ==================== CHANGES ====================
export interface ChangeOption {
  id: string;
  type: 'date_change' | 'route_change' | 'upgrade';
  newItineraries: NormalizedItinerary[];
  priceDifference: number;
  penaltyAmount: number;
  currency: string;
  expiresAt: string;
}

export interface ChangeResult {
  success: boolean;
  newOrderId?: string;
  newBookingReference?: string;
  amountCharged?: number;
  error?: string;
}

// ==================== SYNC RESULT ====================
export interface SyncResult {
  success: boolean;
  bookingId: string;
  provider: string;

  // What changed
  changes: SyncChange[];

  // Updated data
  order?: ProviderOrder;

  // Errors
  error?: string;

  // Timing
  syncedAt: string;
  duration: number;
}

export interface SyncChange {
  field: string;
  oldValue: any;
  newValue: any;
  significance: 'info' | 'warning' | 'critical';
}
