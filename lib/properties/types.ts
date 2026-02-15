// ============================================================================
// List Your Property - Type Definitions
// Maps to Prisma schema models + extends existing Hotel interface
// ============================================================================

// ------------------------------------------------------------------
// Property Owner / Host types
// ------------------------------------------------------------------

export type BusinessType = 'individual' | 'company' | 'property_manager';
export type OwnerStatus = 'active' | 'suspended' | 'pending_review';

export interface PropertyOwner {
  id: string;
  userId: string;
  businessName?: string;
  businessType: BusinessType;
  bio?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  profileImageUrl?: string;
  identityVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  payoutMethod?: 'stripe' | 'paypal' | 'bank_transfer';
  currency: string;
  commissionRate: number;
  responseRate: number;
  avgResponseTime: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  superHost: boolean;
  status: OwnerStatus;
  acceptedTermsAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------
// Property types
// ------------------------------------------------------------------

export type PropertyType =
  | 'hotel'
  | 'apartment'
  | 'villa'
  | 'resort'
  | 'hostel'
  | 'guesthouse'
  | 'bed_and_breakfast'
  | 'lodge'
  | 'motel'
  | 'boutique_hotel'
  | 'vacation_rental';

export type PropertyStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'rejected'
  | 'archived';

export type CancellationPolicyType =
  | 'flexible'
  | 'moderate'
  | 'strict'
  | 'super_strict';

export type PetPolicy = 'not_allowed' | 'allowed' | 'allowed_with_fee';
export type SmokingPolicy = 'not_allowed' | 'designated_areas' | 'allowed';

export interface CancellationDetails {
  freeCancelDays: number;
  penaltyPercent: number;
  description?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  propertyType: PropertyType;
  starRating?: number;
  // Location
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  countryCode?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
  // Contact
  phone?: string;
  email?: string;
  website?: string;
  // Features
  amenities: string[];
  highlights: string[];
  languages: string[];
  accessibilityFeatures: string[];
  // Policies
  checkInTime?: string;
  checkOutTime?: string;
  checkInInstructions?: string;
  cancellationPolicy: CancellationPolicyType;
  cancellationDetails?: CancellationDetails;
  houseRules: string[];
  petPolicy?: PetPolicy;
  smokingPolicy?: SmokingPolicy;
  childPolicy?: string;
  minAge?: number;
  // Pricing
  basePricePerNight?: number;
  currency: string;
  cleaningFee?: number;
  serviceFee?: number;
  securityDeposit?: number;
  taxRate?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  instantBooking: boolean;
  minStay: number;
  maxStay?: number;
  // Capacity
  maxGuests: number;
  totalRooms: number;
  totalBathrooms: number;
  totalBedrooms: number;
  totalBeds: number;
  // Sustainability
  sustainabilityScore?: number;
  ecoFeatures: string[];
  ecoCertifications: string[];
  // Status
  status: PropertyStatus;
  rejectionReason?: string;
  publishedAt?: string;
  featuredUntil?: string;
  verified: boolean;
  verifiedAt?: string;
  // AI
  aiDescription?: string;
  aiTranslations?: Record<string, string>;
  aiSuggestedPrice?: number;
  aiQualityScore?: number;
  // Stats
  viewCount: number;
  bookingCount: number;
  reviewCount: number;
  avgRating: number;
  // Meta
  coverImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, populated by API)
  owner?: PropertyOwner;
  rooms?: PropertyRoom[];
  images?: PropertyImage[];
  availability?: PropertyAvailability[];
}

// ------------------------------------------------------------------
// Room types
// ------------------------------------------------------------------

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'penthouse' | 'studio' | 'dormitory';
export type BedType = 'king' | 'queen' | 'double' | 'twin' | 'single' | 'bunk' | 'sofa_bed';
export type ViewType = 'ocean' | 'city' | 'garden' | 'mountain' | 'pool' | 'courtyard';
export type BathroomType = 'private' | 'shared' | 'ensuite';

export interface PropertyRoom {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  roomType: RoomType;
  bedType?: BedType;
  bedCount: number;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  roomSize?: number;
  floorLevel?: number;
  viewType?: ViewType;
  amenities: string[];
  bathroomType?: BathroomType;
  basePricePerNight: number;
  currency: string;
  quantity: number;
  isActive: boolean;
  sortOrder: number;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomData {
  id: string;
  name: string;
  roomType: RoomType;
  bedType: BedType;
  bedCount: number;
  maxOccupancy: number;
  quantity: number;
  basePricePerNight: number;
  amenities: string[];
  enSuite?: boolean; // Deprecated in favor of bathroomType
  bathroomType: 'private' | 'ensuite' | 'shared' | 'none';
}

// ------------------------------------------------------------------
// Image types
// ------------------------------------------------------------------

export type ImageCategory =
  | 'general'
  | 'exterior'
  | 'lobby'
  | 'room'
  | 'bathroom'
  | 'amenity'
  | 'food'
  | 'pool'
  | 'view'
  | 'surrounding';

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  category: ImageCategory;
  aiTags: string[];
  aiScore?: number;
  width?: number;
  height?: number;
  sizeBytes?: number;
  mimeType?: string;
  isPrimary: boolean;
  sortOrder: number;
  uploadedAt: string;
}

// ------------------------------------------------------------------
// Availability types
// ------------------------------------------------------------------

export type AvailabilitySource = 'manual' | 'ical_sync' | 'api_sync';

export interface PropertyAvailability {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  available: boolean;
  customPrice?: number;
  currency: string;
  minStay?: number;
  maxStay?: number;
  notes?: string;
  source: AvailabilitySource;
  externalEventId?: string;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------
// Listing Wizard State (tracks multi-step onboarding)
// ------------------------------------------------------------------

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface ListingWizardState {
  currentStep: WizardStep;
  propertyId?: string;
  completedSteps: WizardStep[];
  // Step 1: Basics
  basics?: {
    name: string;
    propertyType: PropertyType;
    starRating?: number;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
  };
  // Step 2: Rooms & Capacity
  rooms?: Omit<PropertyRoom, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>[];
  capacity?: {
    maxGuests: number;
    totalRooms: number;
    totalBathrooms: number;
    totalBedrooms: number;
    totalBeds: number;
  };
  // Step 3: Photos
  photos?: Omit<PropertyImage, 'id' | 'propertyId' | 'uploadedAt'>[];
  // Step 4: Amenities & Policies
  amenitiesAndPolicies?: {
    amenities: string[];
    highlights: string[];
    checkInTime?: string;
    checkOutTime?: string;
    cancellationPolicy: CancellationPolicyType;
    houseRules: string[];
    petPolicy?: PetPolicy;
    smokingPolicy?: SmokingPolicy;
    ecoFeatures: string[];
  };
  // Step 5: Pricing
  pricing?: {
    basePricePerNight: number;
    currency: string;
    cleaningFee?: number;
    serviceFee?: number;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
    instantBooking: boolean;
    minStay: number;
  };
  isDraft: boolean;
  lastSavedAt?: string;
}

// ------------------------------------------------------------------
// Host Dashboard Analytics
// ------------------------------------------------------------------

export interface PropertyAnalytics {
  propertyId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  revenue: number;
  bookings: number;
  occupancyRate: number;
  averageDailyRate: number;
  viewCount: number;
  conversionRate: number;
  avgRating: number;
  reviewCount: number;
  topCountries: { country: string; bookings: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface DashboardOverview {
  totalProperties: number;
  activeProperties: number;
  totalBookingsThisMonth: number;
  totalRevenueThisMonth: number;
  occupancyRate: number;
  upcomingCheckIns: number;
  upcomingCheckOuts: number;
  pendingReviews: number;
  recentBookings: {
    id: string;
    guestName: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    amount: number;
    status: string;
  }[];
}

// ------------------------------------------------------------------
// API Request/Response types
// ------------------------------------------------------------------

export interface CreatePropertyRequest {
  name: string;
  propertyType: PropertyType;
  addressLine1: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  [key: string]: unknown;
}

export interface PropertySearchParams {
  ownerId?: string;
  status?: PropertyStatus;
  propertyType?: PropertyType;
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

// ------------------------------------------------------------------
// Amenity categories for the wizard UI
// ------------------------------------------------------------------

export const PROPERTY_AMENITY_CATEGORIES = {
  essentials: {
    label: 'Essentials',
    options: ['wifi', 'air_conditioning', 'heating', 'hot_water', 'towels', 'bed_linens', 'iron', 'hair_dryer'],
  },
  kitchen: {
    label: 'Kitchen & Dining',
    options: ['kitchen', 'refrigerator', 'microwave', 'oven', 'dishwasher', 'coffee_maker', 'breakfast_included'],
  },
  leisure: {
    label: 'Leisure & Recreation',
    options: ['pool', 'hot_tub', 'gym', 'spa', 'sauna', 'game_room', 'bbq_grill', 'garden'],
  },
  business: {
    label: 'Business & Work',
    options: ['workspace', 'business_center', 'meeting_room', 'printer', 'high_speed_internet'],
  },
  parking: {
    label: 'Parking & Transport',
    options: ['free_parking', 'paid_parking', 'ev_charging', 'airport_shuttle', 'bike_rental'],
  },
  safety: {
    label: 'Safety & Security',
    options: ['smoke_detector', 'fire_extinguisher', 'first_aid_kit', 'security_cameras', 'safe', '24h_front_desk'],
  },
  family: {
    label: 'Family Friendly',
    options: ['crib', 'high_chair', 'kids_pool', 'playground', 'babysitting'],
  },
  eco: {
    label: 'Eco & Sustainability',
    options: ['solar_panels', 'recycling', 'composting', 'organic_products', 'rainwater_harvesting', 'energy_efficient'],
  },
} as const;

export const PROPERTY_TYPES_INFO: Record<PropertyType, { label: string; icon: string; description: string }> = {
  hotel: { label: 'Hotel', icon: '🏨', description: 'Traditional hotel with rooms and services' },
  apartment: { label: 'Apartment', icon: '🏢', description: 'Self-contained apartment or flat' },
  villa: { label: 'Villa', icon: '🏡', description: 'Luxurious standalone property' },
  resort: { label: 'Resort', icon: '🏖️', description: 'Full-service resort with amenities' },
  hostel: { label: 'Hostel', icon: '🛏️', description: 'Budget-friendly shared accommodation' },
  guesthouse: { label: 'Guesthouse', icon: '🏠', description: 'Intimate home-style accommodation' },
  bed_and_breakfast: { label: 'B&B', icon: '☕', description: 'Cozy stay with breakfast included' },
  lodge: { label: 'Lodge', icon: '🌲', description: 'Nature lodge or eco-retreat' },
  motel: { label: 'Motel', icon: '🅿️', description: 'Roadside motor lodge' },
  boutique_hotel: { label: 'Boutique Hotel', icon: '✨', description: 'Unique, design-forward hotel' },
  vacation_rental: { label: 'Vacation Rental', icon: '🌴', description: 'Entire home for vacation' },
};

export const ROOM_TYPES = {
  standard: 'Standard Room',
  deluxe: 'Deluxe Room',
  suite: 'Suite',
  penthouse: 'Penthouse',
  studio: 'Studio',
  dormitory: 'Dormitory Bed'
};

export const BED_TYPES = {
  king: 'King Bed',
  queen: 'Queen Bed',
  double: 'Double Bed',
  twin: 'Twin Bed',
  single: 'Single Bed',
  bunk: 'Bunk Bed',
  sofa_bed: 'Sofa Bed'
};
