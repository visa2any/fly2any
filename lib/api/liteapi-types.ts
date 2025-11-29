/**
 * Extended Type Definitions for LiteAPI Integration
 * Guest Management, Loyalty, Vouchers, Analytics
 */

// ============================================
// GUEST MANAGEMENT TYPES
// ============================================

export interface Guest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  preferences?: {
    roomType?: string;
    bedType?: string;
    floor?: string;
    smoking?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuestParams {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface GuestBooking {
  bookingId: string;
  hotelId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  currency: string;
  createdAt: string;
}

// ============================================
// LOYALTY PROGRAM TYPES
// ============================================

export interface LoyaltyConfig {
  programName: string;
  pointsPerDollar: number;
  dollarsPerPoint: number;
  tiers: Array<{
    name: string;
    minPoints: number;
    benefits: string[];
    multiplier: number;
  }>;
  redemptionOptions: Array<{
    type: 'discount' | 'upgrade' | 'freeNight';
    pointsCost: number;
    value: number;
    description: string;
  }>;
}

export interface GuestLoyaltyPoints {
  guestId: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: string;
  tierBenefits: string[];
  pointsToNextTier: number;
  pointsExpiringSoon?: {
    points: number;
    expiryDate: string;
  };
}

export interface RedeemPointsParams {
  guestId: string;
  points: number;
  redemptionType: 'discount' | 'upgrade' | 'freeNight';
  bookingId?: string;
}

export interface PointsTransaction {
  id: string;
  guestId: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  description: string;
  bookingId?: string;
  createdAt: string;
}

// ============================================
// VOUCHER SYSTEM TYPES
// ============================================

export interface Voucher {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'freeNight';
  value: number;
  currency?: string;
  minSpend?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  status: 'active' | 'inactive' | 'expired';
  applicableHotels?: string[]; // Hotel IDs
  applicableCategories?: string[];
  createdAt: string;
  createdBy: string;
}

export interface CreateVoucherParams {
  code: string;
  type: 'percentage' | 'fixed' | 'freeNight';
  value: number;
  currency?: string;
  minSpend?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  applicableHotels?: string[];
}

export interface ValidateVoucherParams {
  code: string;
  totalAmount: number;
  currency: string;
  hotelId?: string;
  guestId?: string;
}

export interface VoucherValidationResult {
  valid: boolean;
  voucher?: Voucher;
  discountAmount?: number;
  finalAmount?: number;
  error?: string;
  reason?: string;
}

export interface VoucherRedemption {
  id: string;
  voucherId: string;
  voucherCode: string;
  guestId: string;
  bookingId: string;
  discountAmount: number;
  currency: string;
  redeemedAt: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface WeeklyAnalytics {
  weekStartDate: string;
  weekEndDate: string;
  metrics: {
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    cancellationRate: number;
    repeatCustomerRate: number;
    newCustomers: number;
  };
  topHotels: Array<{
    hotelId: string;
    hotelName: string;
    bookings: number;
    revenue: number;
  }>;
  topDestinations: Array<{
    city: string;
    country: string;
    bookings: number;
  }>;
}

export interface HotelRankings {
  period: string;
  rankings: Array<{
    rank: number;
    hotelId: string;
    hotelName: string;
    city: string;
    bookings: number;
    revenue: number;
    averageRating: number;
    changeFromLastPeriod: number;
  }>;
}

export interface MarketData {
  marketId: string;
  marketName: string;
  metrics: {
    totalHotels: number;
    averagePrice: number;
    occupancyRate: number;
    competitorCount: number;
  };
  trends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
}
