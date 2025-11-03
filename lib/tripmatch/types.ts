/**
 * TripMatch TypeScript Types
 * Comprehensive type definitions for the social travel system
 */

// =====================================================
// TRIP GROUPS
// =====================================================

export type TripCategory =
  | 'vacation'
  | 'party'
  | 'spring_break'
  | 'girls_trip'
  | 'bachelor'
  | 'bachelorette'
  | 'family'
  | 'backpacker'
  | 'adventure'
  | 'cultural'
  | 'wellness';

export type TripVisibility = 'public' | 'private';

export type TripStatus =
  | 'draft'
  | 'published'
  | 'booking_open'
  | 'booking_closed'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export interface TripGroup {
  id: string;
  title: string;
  description?: string;
  destination: string;
  destinationCode?: string;
  destinationCountry?: string;
  startDate: string;
  endDate: string;
  category: TripCategory;
  visibility: TripVisibility;
  creatorId: string;
  minMembers: number;
  maxMembers: number;
  currentMembers: number;
  estimatedPricePerPerson?: number;
  totalBookingValue: number;
  status: TripStatus;
  featured: boolean;
  trending: boolean;
  coverImageUrl?: string;
  images?: string[];
  tags?: string[];
  rules?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  completedAt?: string;
}

// =====================================================
// TRIP COMPONENTS
// =====================================================

export type ComponentType =
  | 'flight'
  | 'hotel'
  | 'car'
  | 'tour'
  | 'activity'
  | 'insurance'
  | 'transfer';

export interface TripComponent {
  id: string;
  tripId: string;
  type: ComponentType;
  provider?: string;
  providerId?: string;
  providerData?: Record<string, any>;
  basePricePerPerson: number;
  totalPrice: number;
  currency: string;
  title: string;
  description?: string;
  startDatetime?: string;
  endDatetime?: string;
  durationMinutes?: number;
  location?: string;
  locationLat?: number;
  locationLng?: number;
  isOptional: boolean;
  isRequired: boolean;
  customizationOptions?: Record<string, any>;
  displayOrder: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// GROUP MEMBERS
// =====================================================

export type MemberRole = 'creator' | 'admin' | 'member';

export type MemberStatus =
  | 'invited'
  | 'viewing'
  | 'customizing'
  | 'confirmed'
  | 'paid'
  | 'declined'
  | 'removed';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface GroupMember {
  id: string;
  tripId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  invitedBy?: string;
  inviteCode?: string;
  invitationMessage?: string;
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  customizations?: Record<string, any>;
  totalPrice?: number;
  creditsApplied: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  paidAt?: string;
  joinedAt: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// CREDITS SYSTEM
// =====================================================

export type CreditTransactionType =
  | 'earned_trip_creation'
  | 'earned_member_join'
  | 'earned_referral'
  | 'earned_completion_bonus'
  | 'earned_review_bonus'
  | 'earned_achievement'
  | 'spent_booking'
  | 'spent_upgrade'
  | 'bonus'
  | 'refund';

export type CreditSource =
  | 'trip_creation'
  | 'member_join'
  | 'trip_completion'
  | 'high_rating'
  | 'booking'
  | 'admin'
  | 'promotional'
  | 'referral';

export interface UserCredits {
  id: string;
  userId: string;
  balance: number; // In cents
  lifetimeEarned: number;
  lifetimeSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // Positive = earned, Negative = spent
  type: CreditTransactionType;
  source: CreditSource;
  tripId?: string;
  bookingId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// =====================================================
// BOOKINGS
// =====================================================

export type BookingType = 'flight' | 'hotel' | 'car' | 'tour' | 'insurance';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface PaymentSplit {
  userId: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
}

export interface GroupBooking {
  id: string;
  tripId: string;
  componentId?: string;
  bookingType: BookingType;
  provider: string;
  providerBookingId?: string;
  providerConfirmationCode?: string;
  totalPrice: number;
  pricePerPerson: number;
  currency: string;
  paymentSplits: PaymentSplit[];
  bookingStatus: BookingStatus;
  paymentStatus: string; // 'pending', 'partial', 'complete', 'refunded'
  bookingData?: Record<string, any>;
  confirmationDocuments?: Record<string, any>;
  bookedAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// SOCIAL FEATURES
// =====================================================

export type PostType = 'update' | 'photo' | 'memory' | 'announcement';
export type PostVisibility = 'group' | 'public';

export interface TripPost {
  id: string;
  tripId: string;
  userId: string;
  content?: string;
  mediaUrls?: string[];
  mediaType?: 'photo' | 'video' | 'mixed';
  location?: string;
  locationLat?: number;
  locationLng?: number;
  reactionsCount: number;
  commentsCount: number;
  visibility: PostVisibility;
  postType: PostType;
  createdAt: string;
  updatedAt: string;
}

export type ReactionType = 'like' | 'love' | 'wow' | 'haha' | 'fire';

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// MESSAGING
// =====================================================

export type MessageType = 'text' | 'image' | 'system';

export interface TripMessage {
  id: string;
  tripId: string;
  userId: string;
  message: string;
  messageType: MessageType;
  attachments?: string[];
  isSystemMessage: boolean;
  systemEvent?: string;
  readBy?: string[];
  createdAt: string;
}

// =====================================================
// USER PROFILES
// =====================================================

export type TravelStyle = 'adventurer' | 'luxury' | 'budget' | 'cultural' | 'party' | 'wellness';

export interface TripMatchUserProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  travelStyle?: TravelStyle[];
  interests?: string[];
  languagesSpoken?: string[];
  ageRange?: string;
  gender?: string;
  locationCity?: string;
  locationCountry?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  safetyScore: number;
  verificationLevel: number;
  tripsCreated: number;
  tripsJoined: number;
  tripsCompleted: number;
  totalCompanionsMet: number;
  avgRating: number;
  totalReviews: number;
  personalityVector?: number[];
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// REVIEWS
// =====================================================

export interface TripReview {
  id: string;
  tripId: string;
  reviewerId: string;
  reviewedUserId: string;
  overallRating: number;
  communicationRating?: number;
  reliabilityRating?: number;
  friendlinessRating?: number;
  reviewText?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// CREDIT REWARD CALCULATIONS
// =====================================================

export interface CreditRewardConfig {
  // Base rewards per member
  perMemberBonus: number; // e.g., 50 credits = $5

  // First-time user bonus
  firstTimerBonus: number; // e.g., 25 credits = $2.50

  // Group size multipliers
  multipliers: {
    small: { minMembers: number; multiplier: number }; // 4+ = 1.0x
    medium: { minMembers: number; multiplier: number }; // 8+ = 1.5x
    large: { minMembers: number; multiplier: number }; // 12+ = 2.0x
  };

  // Completion bonuses
  tripCompletedBonus: number; // e.g., 100 credits
  fiveStarReviewBonus: number; // e.g., 50 credits
  repeatGroupBonus: number; // e.g., 75 credits

  // Achievement bonuses
  firstTripBonus: number; // e.g., 100 credits
  powerCreatorBonus: { tripsRequired: number; reward: number }; // 10 trips = 500 credits
  ambassadorBonus: { tripsRequired: number; reward: number }; // 50 trips = 1000 credits

  // Credit spending rules
  creditValue: number; // 1 credit = $0.10
  maxDiscountPercent: number; // 50% of booking
  minRedemption: number; // Minimum credits to use
}

export interface CreditCalculation {
  baseCredits: number;
  multiplier: number;
  bonusCredits: number;
  totalCredits: number;
  dollarValue: number;
  breakdown: {
    memberCount: number;
    perMemberReward: number;
    firstTimerCount: number;
    firstTimerReward: number;
    groupSizeBonus: number;
    completionBonus: number;
  };
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateTripRequest {
  title: string;
  description?: string;
  destination: string;
  destinationCode?: string;
  startDate: string;
  endDate: string;
  category: TripCategory;
  visibility: TripVisibility;
  maxMembers: number;
  minMembers?: number;
  coverImageUrl?: string;
  tags?: string[];
  rules?: string;
}

export interface AddComponentRequest {
  tripId: string;
  type: ComponentType;
  provider?: string;
  providerId?: string;
  providerData?: Record<string, any>;
  basePricePerPerson: number;
  title: string;
  description?: string;
  startDatetime?: string;
  endDatetime?: string;
  location?: string;
  isOptional?: boolean;
  customizationOptions?: Record<string, any>;
  imageUrl?: string;
}

export interface InviteMemberRequest {
  tripId: string;
  email?: string;
  userId?: string;
  message?: string;
}

export interface ApplyCreditsRequest {
  memberId: string;
  creditsToApply: number;
}

export interface BookTripRequest {
  tripId: string;
  userId: string;
  customizations?: Record<string, any>;
  creditsToApply?: number;
}

// =====================================================
// HELPER TYPES
// =====================================================

export interface TripSummary extends TripGroup {
  creator?: Partial<TripMatchUserProfile>;
  members?: GroupMember[];
  components?: TripComponent[];
  creditsEarnable?: number; // Credits creator can earn
}

export interface MemberWithProfile extends GroupMember {
  profile?: TripMatchUserProfile;
}

export interface TripWithDetails extends TripGroup {
  creator: TripMatchUserProfile;
  members: MemberWithProfile[];
  components: TripComponent[];
  posts: TripPost[];
  messages: TripMessage[];
}
