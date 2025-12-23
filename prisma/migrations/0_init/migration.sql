-- CreateEnum
CREATE TYPE "AgentTier" AS ENUM ('INDEPENDENT', 'PROFESSIONAL', 'AGENCY_PARTNER', 'WHITE_LABEL');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'BANNED');

-- CreateEnum
CREATE TYPE "CommissionModel" AS ENUM ('PERCENTAGE', 'FLAT_FEE', 'HYBRID', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ClientSegment" AS ENUM ('STANDARD', 'VIP', 'HONEYMOON', 'FAMILY', 'BUSINESS', 'GROUP_ORGANIZER', 'CORPORATE', 'LUXURY');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'LOST', 'DO_NOT_CONTACT');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'MODIFIED', 'ACCEPTED', 'EXPIRED', 'DECLINED', 'CONVERTED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PARTIALLY_PAID', 'FULLY_PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'DEPOSIT_PAID', 'FULLY_PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'TRIP_IN_PROGRESS', 'IN_HOLD_PERIOD', 'AVAILABLE', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'MANAGER', 'AGENT', 'VIEWER');

-- CreateEnum
CREATE TYPE "MatchStage" AS ENUM ('GROUP_STAGE', 'ROUND_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CardAuthStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AirlineRouteType" AS ENUM ('ANY', 'AIRPORT', 'CITY', 'COUNTRY', 'REGION', 'MARKET');

-- CreateEnum
CREATE TYPE "CabinClass" AS ENUM ('FIRST', 'BUSINESS', 'PREMIUM_ECONOMY', 'ECONOMY', 'BASIC_ECONOMY');

-- CreateEnum
CREATE TYPE "AirlineExclusionType" AS ENUM ('BASIC_ECONOMY', 'LIGHT_FARE', 'GROUP_FARE', 'NET_FARE', 'CORPORATE_FARE', 'MILITARY_FARE', 'INFANT_FARE', 'WEB_FARE', 'PROMO_FARE', 'NON_REVENUE');

-- CreateEnum
CREATE TYPE "RoutingChannel" AS ENUM ('DUFFEL', 'CONSOLIDATOR');

-- CreateEnum
CREATE TYPE "AirlineType" AS ENUM ('FSC', 'LCC', 'ULCC', 'HYBRID', 'REGIONAL', 'CHARTER', 'CARGO');

-- CreateEnum
CREATE TYPE "AircraftCategory" AS ENUM ('NARROWBODY', 'WIDEBODY', 'REGIONAL_JET', 'TURBOPROP', 'BUSINESS_JET', 'FREIGHTER');

-- CreateEnum
CREATE TYPE "AirportType" AS ENUM ('LARGE', 'MEDIUM', 'SMALL', 'CARGO', 'MILITARY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "tripMatchCredits" INTEGER NOT NULL DEFAULT 0,
    "tripMatchLifetimeEarned" INTEGER NOT NULL DEFAULT 0,
    "tripMatchLifetimeSpent" INTEGER NOT NULL DEFAULT 0,
    "tripMatchPendingCredits" INTEGER NOT NULL DEFAULT 0,
    "tripMatchTier" TEXT,
    "tripMatchBonusMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "fly2anyPoints" INTEGER NOT NULL DEFAULT 0,
    "fly2anyPointsLocked" INTEGER NOT NULL DEFAULT 0,
    "fly2anyPointsLifetime" INTEGER NOT NULL DEFAULT 0,
    "fly2anyPointsRedeemed" INTEGER NOT NULL DEFAULT 0,
    "liteApiGuestId" TEXT,
    "hotelPointsBalance" INTEGER NOT NULL DEFAULT 0,
    "hotelPointsPending" INTEGER NOT NULL DEFAULT 0,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "referralLevel" INTEGER NOT NULL DEFAULT 0,
    "directReferralsCount" INTEGER NOT NULL DEFAULT 0,
    "totalNetworkSize" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredCabinClass" TEXT,
    "preferredAirlines" TEXT[],
    "homeAirport" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "priceAlertEmails" BOOLEAN NOT NULL DEFAULT true,
    "dealAlerts" BOOLEAN NOT NULL DEFAULT true,
    "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false,
    "notifications" JSONB,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "cabinClass" TEXT NOT NULL DEFAULT 'economy',
    "filters" JSONB,
    "searchCount" INTEGER NOT NULL DEFAULT 1,
    "lastSearched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "triggered" BOOLEAN NOT NULL DEFAULT false,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggeredAt" TIMESTAMP(3),
    "lastNotifiedAt" TIMESTAMP(3),
    "notificationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recent_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "airportCode" TEXT NOT NULL,
    "imageUrl" TEXT,
    "origin" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "departDate" TEXT,
    "returnDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recent_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentConsultantTeam" TEXT,
    "conversationContext" JSONB,
    "searchHistory" JSONB,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "consultantName" TEXT,
    "consultantTeam" TEXT,
    "consultantEmoji" TEXT,
    "flightResults" JSONB,
    "hotelResults" JSONB,
    "timestamp" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "location" TEXT,
    "ipAddress" TEXT,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "location" TEXT,
    "ipAddress" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_sessions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddressHash" TEXT NOT NULL,
    "ipAddressAnonymized" TEXT,
    "userAgent" TEXT,
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "conversationCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anonymizedAt" TIMESTAMP(3),

    CONSTRAINT "ai_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "provider" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_monitor_logs" (
    "id" TEXT NOT NULL,
    "executionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertsChecked" INTEGER NOT NULL,
    "alertsTriggered" INTEGER NOT NULL,
    "alertsFailed" INTEGER NOT NULL,
    "errors" JSONB,
    "duration" INTEGER NOT NULL,
    "triggeredBy" TEXT NOT NULL,

    CONSTRAINT "price_monitor_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productType" TEXT NOT NULL DEFAULT 'flight',
    "productId" TEXT,
    "flightData" JSONB,
    "hotelData" JSONB,
    "productData" JSONB,
    "notes" TEXT,
    "targetPrice" DOUBLE PRECISION,
    "notifyOnDrop" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "bookingType" TEXT,
    "bookingReference" TEXT,
    "bookingAmount" DOUBLE PRECISION,
    "liteApiTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_redemptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "voucherCode" TEXT NOT NULL,
    "voucherType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "bookingType" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "bookingAmount" DOUBLE PRECISION NOT NULL,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "liteApiVoucherId" TEXT,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voucher_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "minSpend" DOUBLE PRECISION,
    "maxDiscount" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "perUserLimit" INTEGER NOT NULL DEFAULT 1,
    "applicableProducts" TEXT[],
    "applicableHotels" TEXT[],
    "newUsersOnly" BOOLEAN NOT NULL DEFAULT false,
    "requiresAccount" BOOLEAN NOT NULL DEFAULT false,
    "requiresPWAApp" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "internalNote" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frequent_travelers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relationship" TEXT,
    "title" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT,
    "passportNumber" TEXT,
    "passportExpiry" TIMESTAMP(3),
    "passportCountry" TEXT,
    "knownTravelerNumber" TEXT,
    "redressNumber" TEXT,
    "frequentFlyerNumbers" JSONB,
    "hotelLoyaltyNumbers" JSONB,
    "email" TEXT,
    "phone" TEXT,
    "seatPreference" TEXT,
    "mealPreference" TEXT,
    "specialNeeds" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frequent_travelers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "last4" TEXT,
    "brand" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "cardholderName" TEXT,
    "billingAddress" JSONB,
    "stripePaymentMethodId" TEXT,
    "paypalAccountId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "issuingCountry" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "issuedDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "frontImageUrl" TEXT,
    "backImageUrl" TEXT,
    "visaType" TEXT,
    "destinationCountry" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_network_relationships" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "signupCompletedAt" TIMESTAMP(3),
    "firstBookingAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalPointsEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "referral_network_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_points_transactions" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bookingAmount" DECIMAL(10,2) NOT NULL,
    "productType" TEXT NOT NULL,
    "productData" JSONB,
    "earnerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "pointsRate" INTEGER NOT NULL,
    "productMultiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "pointsCalculated" INTEGER NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'locked',
    "tripStartDate" TIMESTAMP(3),
    "tripEndDate" TIMESTAMP(3),
    "tripCompletedAt" TIMESTAMP(3),
    "tripCancelled" BOOLEAN NOT NULL DEFAULT false,
    "tripCancelledAt" TIMESTAMP(3),
    "tripRefunded" BOOLEAN NOT NULL DEFAULT false,
    "pointsLockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pointsUnlockedAt" TIMESTAMP(3),
    "pointsExpireAt" TIMESTAMP(3),
    "pointsUsed" BOOLEAN NOT NULL DEFAULT false,
    "pointsUsedAt" TIMESTAMP(3),
    "pointsUsedIn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_points_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rewardPaid" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_groups" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT,
    "slug" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "destinationCode" TEXT,
    "coverImageUrl" TEXT,
    "description" TEXT NOT NULL,
    "highlights" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "minMembers" INTEGER NOT NULL DEFAULT 2,
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "currentMembers" INTEGER NOT NULL DEFAULT 1,
    "estimatedPricePerPerson" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalBookingValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "included" TEXT[],
    "bookingDeadline" TIMESTAMP(3),
    "cancellationPolicy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "tags" TEXT[],
    "category" TEXT DEFAULT 'adventure',
    "difficulty" TEXT DEFAULT 'moderate',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "tripGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentIntentId" TEXT,
    "amountPaid" DOUBLE PRECISION,
    "paidAt" TIMESTAMP(3),
    "customizations" JSONB,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tripmatch_user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "coverImageUrl" TEXT,
    "travelStyle" TEXT[],
    "interests" TEXT[],
    "languagesSpoken" TEXT[],
    "ageRange" TEXT,
    "gender" TEXT,
    "locationCity" TEXT,
    "locationCountry" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "idVerified" BOOLEAN NOT NULL DEFAULT false,
    "safetyScore" INTEGER NOT NULL DEFAULT 0,
    "verificationLevel" INTEGER NOT NULL DEFAULT 0,
    "tripsCreated" INTEGER NOT NULL DEFAULT 0,
    "tripsJoined" INTEGER NOT NULL DEFAULT 0,
    "tripsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalCompanionsMet" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "personalityVector" DOUBLE PRECISION[],
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tripmatch_user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_posts" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT,
    "mediaUrls" TEXT[],
    "mediaType" TEXT,
    "location" TEXT,
    "locationLat" DOUBLE PRECISION,
    "locationLng" DOUBLE PRECISION,
    "reactionsCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "visibility" TEXT NOT NULL DEFAULT 'group',
    "postType" TEXT NOT NULL DEFAULT 'update',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reactions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_messages" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "attachments" TEXT[],
    "isSystemMessage" BOOLEAN NOT NULL DEFAULT false,
    "systemEvent" TEXT,
    "readBy" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_reviews" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewedUserId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "communicationRating" INTEGER,
    "reliabilityRating" INTEGER,
    "friendlinessRating" INTEGER,
    "reviewText" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_connections" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traveler_matches" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "matchReasons" TEXT[],
    "action" TEXT,
    "actionTaken" BOOLEAN NOT NULL DEFAULT false,
    "matchMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traveler_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "url" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_snapshots" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "dimensions" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granularity" TEXT NOT NULL,

    CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_predictions" (
    "id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "predictedPrice" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "priceRange" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "recommendation" TEXT,
    "savingsEstimate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "metrics" JSONB NOT NULL,
    "trainedAt" TIMESTAMP(3) NOT NULL,
    "trainingData" JSONB NOT NULL,
    "features" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT false,
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 0,
    "targetSegments" JSONB,
    "variants" JSONB NOT NULL,
    "isExperiment" BOOLEAN NOT NULL DEFAULT false,
    "experimentStatus" TEXT,
    "successMetric" TEXT,
    "minimumSampleSize" INTEGER,
    "experimentResults" JSONB,
    "winningVariant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_participations" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "conversionValue" DOUBLE PRECISION,

    CONSTRAINT "experiment_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "rating" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "deviceType" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "connectionType" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "errorType" TEXT,
    "url" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "severity" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notes" TEXT,
    "fingerprint" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_funnels" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "stage" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "duration" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversion_funnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_cohorts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cohortDate" TIMESTAMP(3) NOT NULL,
    "cohortWeek" TEXT NOT NULL,
    "cohortMonth" TEXT NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL,
    "day1Retained" BOOLEAN NOT NULL DEFAULT false,
    "day7Retained" BOOLEAN NOT NULL DEFAULT false,
    "day30Retained" BOOLEAN NOT NULL DEFAULT false,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalSearches" INTEGER NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "lifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "destination" JSONB NOT NULL,
    "origin" TEXT NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "flightDetails" JSONB NOT NULL,
    "dealScore" INTEGER NOT NULL DEFAULT 50,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "category" TEXT NOT NULL DEFAULT 'featured',
    "tags" TEXT[],
    "images" JSONB NOT NULL,
    "restrictions" TEXT[],
    "seo" JSONB NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "airportCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "highlights" TEXT[],
    "travelInfo" JSONB NOT NULL,
    "priceRange" TEXT NOT NULL,
    "avgPrice" DOUBLE PRECISION,
    "travelStyles" TEXT[],
    "images" JSONB NOT NULL,
    "seo" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "searches" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preheader" TEXT,
    "body" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'default',
    "brandColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "headerImage" TEXT,
    "footerText" TEXT NOT NULL DEFAULT '© 2025 Fly2Any. All rights reserved.',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastTested" TIMESTAMP(3),
    "testRecipients" TEXT[],
    "testsSent" INTEGER NOT NULL DEFAULT 0,
    "lastTestResults" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'promotional',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "subject" TEXT NOT NULL,
    "preheader" TEXT,
    "body" TEXT NOT NULL,
    "plainText" TEXT,
    "templateId" TEXT,
    "targetAudience" TEXT NOT NULL DEFAULT 'all',
    "customFilter" JSONB,
    "excludeList" TEXT[],
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "sent" INTEGER NOT NULL DEFAULT 0,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "opened" INTEGER NOT NULL DEFAULT 0,
    "clicked" INTEGER NOT NULL DEFAULT 0,
    "bounced" INTEGER NOT NULL DEFAULT 0,
    "unsubscribed" INTEGER NOT NULL DEFAULT 0,
    "complained" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaign_sends" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "messageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_campaign_sends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_checks" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_suggestions" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_bookings" (
    "id" TEXT NOT NULL,
    "confirmationNumber" TEXT NOT NULL,
    "userId" TEXT,
    "hotelId" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "hotelAddress" TEXT,
    "hotelCity" TEXT,
    "hotelCountry" TEXT,
    "hotelPhone" TEXT,
    "hotelEmail" TEXT,
    "hotelImages" JSONB,
    "roomId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "roomDescription" TEXT,
    "bedType" TEXT,
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "roomAmenities" TEXT[],
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "pricePerNight" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxesAndFees" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "guestTitle" TEXT,
    "guestFirstName" TEXT NOT NULL,
    "guestLastName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "guestDateOfBirth" TIMESTAMP(3),
    "additionalGuests" JSONB,
    "specialRequests" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentIntentId" TEXT,
    "paymentMethodId" TEXT,
    "paymentProvider" TEXT NOT NULL DEFAULT 'stripe',
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2),
    "refundReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "cancellationPolicy" TEXT,
    "cancellable" BOOLEAN NOT NULL DEFAULT true,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "mealPlan" TEXT,
    "mealPlanIncluded" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'duffel',
    "providerBookingId" TEXT,
    "providerData" JSONB,
    "confirmationEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "confirmationSentAt" TIMESTAMP(3),
    "reminderEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "source" TEXT,
    "deviceType" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT,
    "hotelId" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "cleanliness" INTEGER,
    "comfort" INTEGER,
    "location" INTEGER,
    "facilities" INTEGER,
    "staff" INTEGER,
    "valueForMoney" INTEGER,
    "title" TEXT NOT NULL,
    "review" TEXT NOT NULL,
    "photos" TEXT[],
    "travelType" TEXT,
    "stayDate" TIMESTAMP(3) NOT NULL,
    "roomType" TEXT,
    "reviewerName" TEXT NOT NULL,
    "reviewerEmail" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" TEXT,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_price_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "roomType" TEXT,
    "guests" INTEGER NOT NULL DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "triggered" BOOLEAN NOT NULL DEFAULT false,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggeredAt" TIMESTAMP(3),
    "emailNotification" BOOLEAN NOT NULL DEFAULT true,
    "lastNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT,
    "website" TEXT,
    "taxId" TEXT,
    "description" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'starter',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "category" TEXT NOT NULL DEFAULT 'standard',
    "creatorProfile" JSONB,
    "channelVerified" BOOLEAN NOT NULL DEFAULT false,
    "channelVerifiedAt" TIMESTAMP(3),
    "channelVerifiedBy" TEXT,
    "customCommissionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "customFlightCommission" DOUBLE PRECISION,
    "customHotelCommission" DOUBLE PRECISION,
    "customPackageCommission" DOUBLE PRECISION,
    "customCarCommission" DOUBLE PRECISION,
    "customActivityCommission" DOUBLE PRECISION,
    "volumeBonusEnabled" BOOLEAN NOT NULL DEFAULT false,
    "volumeBonusThreshold" INTEGER,
    "volumeBonusRate" DOUBLE PRECISION,
    "performanceBonusEnabled" BOOLEAN NOT NULL DEFAULT false,
    "performanceBonusTarget" DOUBLE PRECISION,
    "performanceBonusRate" DOUBLE PRECISION,
    "exclusivityBonusEnabled" BOOLEAN NOT NULL DEFAULT false,
    "exclusivityBonusRate" DOUBLE PRECISION,
    "exclusivityAgreedAt" TIMESTAMP(3),
    "exclusivityEndsAt" TIMESTAMP(3),
    "hasCustomLandingPage" BOOLEAN NOT NULL DEFAULT false,
    "customLandingPageSlug" TEXT,
    "hasBrandedLinks" BOOLEAN NOT NULL DEFAULT false,
    "brandedDomain" TEXT,
    "hasApiAccess" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "apiKeyLastUsed" TIMESTAMP(3),
    "apiCallsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "apiCallsLimit" INTEGER NOT NULL DEFAULT 10000,
    "hasDedicatedAM" BOOLEAN NOT NULL DEFAULT false,
    "accountManagerId" TEXT,
    "accountManagerEmail" TEXT,
    "hasPrioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "hasEarlyDealAccess" BOOLEAN NOT NULL DEFAULT false,
    "coMarketingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "featuredOnWebsite" BOOLEAN NOT NULL DEFAULT false,
    "trustLevel" TEXT NOT NULL DEFAULT 'new',
    "successfulBookingsCount" INTEGER NOT NULL DEFAULT 0,
    "failedBookingsCount" INTEGER NOT NULL DEFAULT 0,
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "customHoldPeriod" INTEGER,
    "topPerformingContent" JSONB,
    "platformMetrics" JSONB,
    "metricsLastUpdated" TIMESTAMP(3),
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "completedTrips" INTEGER NOT NULL DEFAULT 0,
    "canceledBookings" INTEGER NOT NULL DEFAULT 0,
    "refundedBookings" INTEGER NOT NULL DEFAULT 0,
    "totalCustomerSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalYourProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCommissionsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCommissionsPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyCompletedTrips" INTEGER NOT NULL DEFAULT 0,
    "monthlyRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyCommissions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthStatsLastReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetimeEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetimePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minPayoutThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "payoutMethod" TEXT NOT NULL DEFAULT 'paypal',
    "payoutEmail" TEXT,
    "payoutDetails" JSONB,
    "referralCode" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "customLandingPage" TEXT,
    "customBranding" JSONB,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReports" BOOLEAN NOT NULL DEFAULT true,
    "monthlyStatements" BOOLEAN NOT NULL DEFAULT true,
    "adminNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "bannedAt" TIMESTAMP(3),
    "banReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_referrals" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "clickId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "referrerUrl" TEXT,
    "landingPage" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "userId" TEXT,
    "bookingId" TEXT,
    "cookieSet" BOOLEAN NOT NULL DEFAULT true,
    "cookieExpiry" TIMESTAMP(3) NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedUpAt" TIMESTAMP(3),
    "bookedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'click',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "productDetails" JSONB NOT NULL,
    "revenueModel" TEXT NOT NULL,
    "customerTotalPaid" DOUBLE PRECISION NOT NULL,
    "supplierCost" DOUBLE PRECISION NOT NULL,
    "yourGrossProfit" DOUBLE PRECISION NOT NULL,
    "affiliateTierAtBooking" TEXT NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "minPayoutApplied" BOOLEAN NOT NULL DEFAULT false,
    "maxPayoutApplied" BOOLEAN NOT NULL DEFAULT false,
    "cappedAmount" DOUBLE PRECISION,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "tripStartDate" TIMESTAMP(3) NOT NULL,
    "tripEndDate" TIMESTAMP(3) NOT NULL,
    "tripStartedAt" TIMESTAMP(3),
    "tripCompletedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "statusHistory" JSONB,
    "holdPeriodDays" INTEGER NOT NULL DEFAULT 30,
    "holdPeriodEndsAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DOUBLE PRECISION,
    "refundReason" TEXT,
    "isFraud" BOOLEAN NOT NULL DEFAULT false,
    "fraudDetectedAt" TIMESTAMP(3),
    "fraudNotes" TEXT,
    "baseCommissionRate" DOUBLE PRECISION NOT NULL,
    "baseCommissionAmount" DOUBLE PRECISION NOT NULL,
    "volumeBonusApplied" BOOLEAN NOT NULL DEFAULT false,
    "volumeBonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "performanceBonusApplied" BOOLEAN NOT NULL DEFAULT false,
    "performanceBonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exclusivityBonusApplied" BOOLEAN NOT NULL DEFAULT false,
    "exclusivityBonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCommissionAmount" DOUBLE PRECISION NOT NULL,
    "contentSource" TEXT,
    "contentUrl" TEXT,
    "contentTitle" TEXT,
    "utmCampaign" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmContent" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "payoutId" TEXT,
    "reversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedAt" TIMESTAMP(3),
    "reversalReason" TEXT,
    "reversalAmount" DOUBLE PRECISION,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "commissionCount" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL,
    "paymentEmail" TEXT,
    "bankDetails" JSONB,
    "transactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "processingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "invoiceNumber" TEXT,
    "receiptUrl" TEXT,
    "processedBy" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_activity_logs" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "performedBy" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flat_fee_campaigns" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL,
    "flatFeeAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "includesCommission" BOOLEAN NOT NULL DEFAULT true,
    "commissionRate" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "proposedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "deliveryProof" JSONB,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidBy" TEXT,
    "paymentMethod" TEXT,
    "invoiceNumber" TEXT,
    "trackingUrl" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flat_fee_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hold_period_configs" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "trustLevel" TEXT NOT NULL,
    "holdPeriodDays" INTEGER NOT NULL,
    "minSuccessfulBookings" INTEGER,
    "minTrustScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hold_period_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_lifecycle_logs" (
    "id" TEXT NOT NULL,
    "commissionId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "changedBy" TEXT,
    "automated" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "commission_lifecycle_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_agents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyName" TEXT,
    "businessName" TEXT,
    "company" TEXT,
    "iataNumber" TEXT,
    "arcNumber" TEXT,
    "licenseNumber" TEXT,
    "businessType" TEXT,
    "logo" TEXT,
    "brandColor" TEXT,
    "customDomain" TEXT,
    "emailSignature" TEXT,
    "tier" "AgentTier" NOT NULL DEFAULT 'INDEPENDENT',
    "status" "AgentStatus" NOT NULL DEFAULT 'PENDING',
    "isTestAccount" BOOLEAN NOT NULL DEFAULT false,
    "defaultCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "commissionModel" "CommissionModel" NOT NULL DEFAULT 'PERCENTAGE',
    "flightCommission" DOUBLE PRECISION,
    "hotelCommission" DOUBLE PRECISION,
    "activityCommission" DOUBLE PRECISION,
    "transferCommission" DOUBLE PRECISION,
    "insuranceCommission" DOUBLE PRECISION,
    "carRentalCommission" DOUBLE PRECISION,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "timezone" TEXT,
    "operatingHours" JSONB,
    "totalSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCommissions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quotesSent" INTEGER NOT NULL DEFAULT 0,
    "quotesAccepted" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgDealSize" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clientSatisfaction" DOUBLE PRECISION,
    "responseTime" INTEGER,
    "bookingsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "revenueThisMonth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthStatsResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasClientPortal" BOOLEAN NOT NULL DEFAULT false,
    "hasTeamManagement" BOOLEAN NOT NULL DEFAULT false,
    "hasAdvancedAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "hasWhiteLabel" BOOLEAN NOT NULL DEFAULT false,
    "hasApiAccess" BOOLEAN NOT NULL DEFAULT false,
    "hasPrioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "hasCustomBranding" BOOLEAN NOT NULL DEFAULT false,
    "hasSmsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "hasWhatsappIntegration" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "apiKeyCreatedAt" TIMESTAMP(3),
    "apiCallsLimit" INTEGER NOT NULL DEFAULT 1000,
    "apiCallsUsed" INTEGER NOT NULL DEFAULT 0,
    "maxClients" INTEGER NOT NULL DEFAULT 50,
    "maxActiveQuotes" INTEGER NOT NULL DEFAULT 100,
    "maxTeamMembers" INTEGER NOT NULL DEFAULT 1,
    "maxMonthlyBookings" INTEGER NOT NULL DEFAULT 999999,
    "minPayoutThreshold" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "payoutMethod" TEXT NOT NULL DEFAULT 'stripe',
    "payoutSchedule" TEXT NOT NULL DEFAULT 'monthly',
    "payoutEmail" TEXT,
    "stripeAccountId" TEXT,
    "bankDetails" JSONB,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availableBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetimeEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetimePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "quoteAcceptedEmail" BOOLEAN NOT NULL DEFAULT true,
    "paymentReceivedEmail" BOOLEAN NOT NULL DEFAULT true,
    "clientMessageEmail" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReports" BOOLEAN NOT NULL DEFAULT true,
    "monthlyStatements" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verificationDocuments" JSONB,
    "adminNotes" TEXT,
    "accountManager" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "bannedAt" TIMESTAMP(3),
    "banReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "travel_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_clients" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "anniversary" TIMESTAMP(3),
    "preferredLanguage" TEXT DEFAULT 'en',
    "nationality" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "cabinClass" TEXT,
    "preferredAirlines" TEXT[],
    "homeAirport" TEXT,
    "seatPreference" TEXT,
    "mealPreference" TEXT,
    "specialNeeds" TEXT,
    "dietaryRestrictions" TEXT[],
    "frequentFlyerPrograms" JSONB,
    "hotelLoyaltyPrograms" JSONB,
    "carRentalPrograms" JSONB,
    "passportNumber" TEXT,
    "passportExpiry" TIMESTAMP(3),
    "passportCountry" TEXT,
    "visas" JSONB,
    "tsaPrecheck" BOOLEAN NOT NULL DEFAULT false,
    "globalEntry" BOOLEAN NOT NULL DEFAULT false,
    "knownTravelerNumber" TEXT,
    "redressNumber" TEXT,
    "budgetRange" TEXT,
    "tripTypes" TEXT[],
    "favoriteDestinations" TEXT[],
    "travelStyle" TEXT,
    "preferredChannel" TEXT,
    "bestTimeToContact" TEXT,
    "doNotDisturb" BOOLEAN NOT NULL DEFAULT false,
    "segment" "ClientSegment" NOT NULL DEFAULT 'STANDARD',
    "tags" TEXT[],
    "vipLevel" INTEGER NOT NULL DEFAULT 0,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "source" TEXT,
    "referredBy" TEXT,
    "lifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgBookingValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastBookingDate" TIMESTAMP(3),
    "nextBookingDate" TIMESTAMP(3),
    "lastContactDate" TIMESTAMP(3),
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "communicationLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "agent_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_quotes" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "tripName" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "travelers" INTEGER NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "flights" JSONB[],
    "hotels" JSONB[],
    "activities" JSONB[],
    "transfers" JSONB[],
    "carRentals" JSONB[],
    "insurance" JSONB,
    "customItems" JSONB[],
    "flightsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hotelsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activitiesCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transfersCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carRentalsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customItemsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "agentMarkup" DOUBLE PRECISION NOT NULL,
    "agentMarkupPercent" DOUBLE PRECISION,
    "taxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "showCommissionToClient" BOOLEAN NOT NULL DEFAULT false,
    "commissionLabel" TEXT,
    "hideMarkupBreakdown" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "versionName" TEXT,
    "parentQuoteId" TEXT,
    "isAlternative" BOOLEAN NOT NULL DEFAULT false,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "clientFeedback" TEXT,
    "modificationRequests" TEXT,
    "agentNotes" TEXT,
    "notes" TEXT,
    "sharedWithClient" BOOLEAN NOT NULL DEFAULT false,
    "itineraryTemplate" TEXT,
    "itineraryContent" JSONB,
    "customNotes" TEXT,
    "inclusions" TEXT[],
    "exclusions" TEXT[],
    "importantInfo" TEXT,
    "termsAndConditions" TEXT,
    "pdfUrl" TEXT,
    "shareableLink" TEXT,
    "linkPassword" TEXT,
    "linkExpiresAt" TIMESTAMP(3),
    "emailSentCount" INTEGER NOT NULL DEFAULT 0,
    "smsSentCount" INTEGER NOT NULL DEFAULT 0,
    "convertedToBooking" BOOLEAN NOT NULL DEFAULT false,
    "bookingId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "sharedWithTeam" BOOLEAN NOT NULL DEFAULT false,
    "assignedTo" TEXT,
    "depositRequired" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DOUBLE PRECISION,
    "depositDueDate" TIMESTAMP(3),
    "finalPaymentDueDate" TIMESTAMP(3),
    "timeToView" INTEGER,
    "timeToAccept" INTEGER,
    "timeToDecline" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "agent_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_bookings" (
    "id" TEXT NOT NULL,
    "confirmationNumber" TEXT NOT NULL,
    "bookingNumber" TEXT,
    "bookingReference" TEXT,
    "agentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "quoteId" TEXT,
    "tripName" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "travelers" INTEGER NOT NULL,
    "adults" INTEGER NOT NULL,
    "children" INTEGER NOT NULL,
    "infants" INTEGER NOT NULL,
    "flights" JSONB[],
    "hotels" JSONB[],
    "activities" JSONB[],
    "transfers" JSONB[],
    "carRentals" JSONB[],
    "insurance" JSONB,
    "customItems" JSONB[],
    "subtotal" DOUBLE PRECISION NOT NULL,
    "agentMarkup" DOUBLE PRECISION NOT NULL,
    "taxes" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "depositPaidAt" TIMESTAMP(3),
    "depositDueDate" TIMESTAMP(3),
    "balanceDue" DOUBLE PRECISION NOT NULL,
    "balancePaid" BOOLEAN NOT NULL DEFAULT false,
    "balancePaidAt" TIMESTAMP(3),
    "finalPaymentDue" TIMESTAMP(3),
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentProvider" TEXT,
    "stripePaymentId" TEXT,
    "paypalTransactionId" TEXT,
    "paymentMethod" TEXT,
    "paymentMethodDetails" JSONB,
    "flightConfirmations" JSONB,
    "hotelConfirmations" JSONB,
    "activityConfirmations" JSONB,
    "transferConfirmations" JSONB,
    "carRentalConfirmations" JSONB,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "tripStarted" BOOLEAN NOT NULL DEFAULT false,
    "tripStartedAt" TIMESTAMP(3),
    "tripCompleted" BOOLEAN NOT NULL DEFAULT false,
    "tripCompletedAt" TIMESTAMP(3),
    "tripCancelled" BOOLEAN NOT NULL DEFAULT false,
    "tripCancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "invoiceUrl" TEXT,
    "itineraryUrl" TEXT,
    "voucherUrls" JSONB,
    "confirmationEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "supportTickets" JSONB,
    "issuesReported" INTEGER NOT NULL DEFAULT 0,
    "issuesResolved" INTEGER NOT NULL DEFAULT 0,
    "clientSatisfaction" DOUBLE PRECISION,
    "reviewReceived" BOOLEAN NOT NULL DEFAULT false,
    "review" TEXT,
    "reviewRating" INTEGER,
    "agentCommissionPaid" BOOLEAN NOT NULL DEFAULT false,
    "agentCommissionPaidAt" TIMESTAMP(3),
    "holdPeriodEndsAt" TIMESTAMP(3),
    "source" TEXT,
    "deviceType" TEXT,
    "ipAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "agent_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_commissions" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bookingTotal" DOUBLE PRECISION NOT NULL,
    "supplierCost" DOUBLE PRECISION NOT NULL,
    "grossProfit" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "platformFeePercent" DOUBLE PRECISION NOT NULL,
    "agentEarnings" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "bonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEarnings" DOUBLE PRECISION NOT NULL,
    "flightCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hotelCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activityCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transferCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "tripStartDate" TIMESTAMP(3) NOT NULL,
    "tripEndDate" TIMESTAMP(3) NOT NULL,
    "holdUntil" TIMESTAMP(3),
    "availableAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "payoutId" TEXT,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clawback" BOOLEAN NOT NULL DEFAULT false,
    "clawbackAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_payouts" (
    "id" TEXT NOT NULL,
    "payoutNumber" TEXT,
    "agentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "commissionCount" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL,
    "payoutEmail" TEXT,
    "stripeTransferId" TEXT,
    "paypalBatchId" TEXT,
    "bankTransferRef" TEXT,
    "checkNumber" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "processingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "invoiceNumber" TEXT,
    "receiptUrl" TEXT,
    "taxDocumentUrl" TEXT,
    "processedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_team_members" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'AGENT',
    "permissions" JSONB,
    "commissionSplit" DOUBLE PRECISION NOT NULL DEFAULT 0.70,
    "overrideRate" BOOLEAN NOT NULL DEFAULT false,
    "customRate" DOUBLE PRECISION,
    "canManageClients" BOOLEAN NOT NULL DEFAULT true,
    "canCreateQuotes" BOOLEAN NOT NULL DEFAULT true,
    "canAcceptBookings" BOOLEAN NOT NULL DEFAULT true,
    "canViewReports" BOOLEAN NOT NULL DEFAULT false,
    "canManageTeam" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "removalReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_client_notes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "quoteId" TEXT,
    "bookingId" TEXT,
    "note" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'general',
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "contactMethod" TEXT,
    "duration" INTEGER,
    "outcome" TEXT,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_client_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_client_documents" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "bookingId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "expiryDate" TIMESTAMP(3),
    "sharedWithClient" BOOLEAN NOT NULL DEFAULT false,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "agent_client_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_itinerary_templates" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "design" TEXT NOT NULL DEFAULT 'modern_minimalist',
    "brandColor" TEXT,
    "logoUrl" TEXT,
    "headerImage" TEXT,
    "sections" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_itinerary_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_suppliers" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "paymentTerms" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_products" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'other',
    "type" TEXT NOT NULL DEFAULT 'service',
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "stock" INTEGER,
    "minOrder" INTEGER DEFAULT 1,
    "maxOrder" INTEGER,
    "imageUrl" TEXT,
    "externalId" TEXT,
    "sku" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_activity_logs" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_cup_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "fifaCode" TEXT NOT NULL,
    "flagEmoji" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "accentColor" TEXT,
    "flagUrl" TEXT NOT NULL,
    "logoUrl" TEXT,
    "fifaRanking" INTEGER,
    "confederation" TEXT NOT NULL,
    "group" TEXT,
    "headCoach" TEXT,
    "captain" TEXT,
    "starPlayers" JSONB,
    "worldCupWins" INTEGER NOT NULL DEFAULT 0,
    "worldCupApps" INTEGER NOT NULL DEFAULT 0,
    "bestFinish" TEXT,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "world_cup_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_cup_stadiums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "opened" INTEGER,
    "surface" TEXT,
    "roofType" TEXT,
    "imageUrl" TEXT,
    "images" JSONB,
    "seatingChart" TEXT,
    "virtualTour" TEXT,
    "nearestAirport" TEXT,
    "airportDistance" DOUBLE PRECISION,
    "publicTransit" TEXT,
    "parkingInfo" TEXT,
    "nearbyHotels" JSONB,
    "restaurants" JSONB,
    "attractions" JSONB,
    "cityPrimaryColor" TEXT,
    "citySecondaryColor" TEXT,
    "slug" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "description" TEXT,
    "travelGuide" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "world_cup_stadiums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_cup_matches" (
    "id" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "fifaMatchId" TEXT,
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "stadiumId" TEXT NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "matchTime" TEXT NOT NULL,
    "localTime" TEXT NOT NULL,
    "stage" "MatchStage" NOT NULL,
    "groupName" TEXT,
    "roundName" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "penalties" JSONB,
    "ticketsAvailable" BOOLEAN NOT NULL DEFAULT true,
    "ticketPriceMin" DOUBLE PRECISION,
    "ticketPriceMax" DOUBLE PRECISION,
    "ticketProviders" JSONB,
    "matchPosterUrl" TEXT,
    "broadcastInfo" JSONB,
    "slug" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "preview" TEXT,
    "recap" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "world_cup_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_cup_tickets" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerTicketId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "row" TEXT,
    "seatNumber" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "seatType" TEXT,
    "faceValue" DOUBLE PRECISION,
    "wholesalePrice" DOUBLE PRECISION NOT NULL,
    "retailPrice" DOUBLE PRECISION NOT NULL,
    "markup" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "available" BOOLEAN NOT NULL DEFAULT true,
    "reserved" BOOLEAN NOT NULL DEFAULT false,
    "reservedUntil" TIMESTAMP(3),
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "features" JSONB,
    "seatView" TEXT,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "world_cup_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_cup_bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "matchId" TEXT,
    "teamId" TEXT,
    "flightBooking" JSONB,
    "hotelBooking" JSONB,
    "carRental" JSONB,
    "experiences" JSONB,
    "ticketsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "flightsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hotelsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "experiencesTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "stripePaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "confirmationNumber" TEXT NOT NULL,
    "ticketsDelivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveryMethod" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "world_cup_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_authorizations" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "cardholderName" TEXT NOT NULL,
    "cardLast4" TEXT NOT NULL,
    "cardBrand" TEXT NOT NULL,
    "expiryMonth" INTEGER NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "billingStreet" TEXT NOT NULL,
    "billingCity" TEXT NOT NULL,
    "billingState" TEXT NOT NULL,
    "billingZip" TEXT NOT NULL,
    "billingCountry" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "cardFrontImage" TEXT,
    "cardBackImage" TEXT,
    "idDocumentImage" TEXT,
    "signatureImage" TEXT,
    "signatureTyped" TEXT NOT NULL,
    "ackAuthorize" BOOLEAN NOT NULL DEFAULT false,
    "ackCardholder" BOOLEAN NOT NULL DEFAULT false,
    "ackNonRefundable" BOOLEAN NOT NULL DEFAULT false,
    "ackPassengerInfo" BOOLEAN NOT NULL DEFAULT false,
    "ackTerms" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "deviceFingerprint" TEXT,
    "status" "CardAuthStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "rejectionReason" TEXT,
    "riskScore" INTEGER,
    "riskFactors" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_contracts" (
    "id" TEXT NOT NULL,
    "airlineCode" TEXT NOT NULL,
    "airlineName" TEXT NOT NULL,
    "allianceCode" TEXT,
    "ticketStock" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tourCode" TEXT,
    "ticketDesignator" TEXT,
    "gdsAllowed" BOOLEAN NOT NULL DEFAULT true,
    "ndcAllowed" BOOLEAN NOT NULL DEFAULT true,
    "ndcDirectAllowed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airline_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_commission_routes" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "originType" "AirlineRouteType" NOT NULL DEFAULT 'ANY',
    "originCodes" TEXT[],
    "originExclusions" TEXT[],
    "destinationType" "AirlineRouteType" NOT NULL DEFAULT 'ANY',
    "destinationCodes" TEXT[],
    "destinationExclusions" TEXT[],
    "bidirectional" BOOLEAN NOT NULL DEFAULT true,
    "operatingCarrierRequired" BOOLEAN NOT NULL DEFAULT false,
    "marketingCarrierRequired" BOOLEAN NOT NULL DEFAULT false,
    "interlineAllowed" BOOLEAN NOT NULL DEFAULT true,
    "interlineCommissionReduction" DOUBLE PRECISION,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "tourCodeOverride" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airline_commission_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_commission_fare_classes" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "bookingCodes" TEXT[],
    "cabinClass" "CabinClass" NOT NULL,
    "fareFamily" TEXT,
    "defaultPct" DOUBLE PRECISION NOT NULL,
    "lowSeasonPct" DOUBLE PRECISION,
    "shoulderSeasonPct" DOUBLE PRECISION,
    "highSeasonPct" DOUBLE PRECISION,
    "peakSeasonPct" DOUBLE PRECISION,
    "lowSeasonDates" JSONB,
    "shoulderSeasonDates" JSONB,
    "highSeasonDates" JSONB,
    "peakSeasonDates" JSONB,
    "blackoutDates" JSONB,
    "infantCommission" BOOLEAN NOT NULL DEFAULT false,
    "childCommission" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airline_commission_fare_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_commission_exclusions" (
    "id" TEXT NOT NULL,
    "airlineCode" TEXT,
    "exclusionType" "AirlineExclusionType" NOT NULL,
    "description" TEXT NOT NULL,
    "fareBasisRule" TEXT,
    "fareBasisPattern" TEXT,
    "excludedBookingCodes" TEXT[],
    "excludedFareFamilies" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airline_commission_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geographic_markets" (
    "id" TEXT NOT NULL,
    "marketCode" TEXT NOT NULL,
    "marketName" TEXT NOT NULL,
    "countryCodes" TEXT[],
    "regions" TEXT[],
    "includedAirports" TEXT[],
    "excludedAirports" TEXT[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geographic_markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lcc_airlines" (
    "id" TEXT NOT NULL,
    "airlineCode" TEXT NOT NULL,
    "airlineName" TEXT NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lcc_airlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routing_decisions" (
    "id" TEXT NOT NULL,
    "searchId" TEXT,
    "offerId" TEXT NOT NULL,
    "airlineCode" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "cabinClass" "CabinClass" NOT NULL,
    "fareClass" TEXT,
    "fareBasisCode" TEXT,
    "baseFare" DOUBLE PRECISION NOT NULL,
    "totalFare" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "commissionPct" DOUBLE PRECISION,
    "commissionAmount" DOUBLE PRECISION,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "exclusionReason" TEXT,
    "routingChannel" "RoutingChannel" NOT NULL,
    "estimatedProfit" DOUBLE PRECISION NOT NULL,
    "decisionReason" TEXT NOT NULL,
    "duffelProfit" DOUBLE PRECISION,
    "consolidatorProfit" DOUBLE PRECISION,
    "bookingId" TEXT,
    "wasBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routing_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_code_usages" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "userId" TEXT,
    "bookingId" TEXT,
    "bookingType" TEXT NOT NULL,
    "discountApplied" DOUBLE PRECISION NOT NULL,
    "orderTotal" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_code_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "reactivatedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verificationToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "lastEmailSentAt" TIMESTAMP(3),
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsOpened" INTEGER NOT NULL DEFAULT 0,
    "emailsClicked" INTEGER NOT NULL DEFAULT 0,
    "dealAlerts" BOOLEAN NOT NULL DEFAULT true,
    "newRoutes" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "worldCupUpdates" BOOLEAN NOT NULL DEFAULT true,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_profiles" (
    "id" TEXT NOT NULL,
    "iataCode" TEXT NOT NULL,
    "icaoCode" TEXT,
    "callsign" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "legalName" TEXT,
    "alliance" TEXT,
    "logoUrl" TEXT,
    "logoUrlSvg" TEXT,
    "brandPrimaryColor" TEXT,
    "brandSecondaryColor" TEXT,
    "country" TEXT,
    "countryName" TEXT,
    "headquarters" TEXT,
    "foundedYear" INTEGER,
    "websiteUrl" TEXT,
    "customerServicePhone" TEXT,
    "hubAirports" TEXT[],
    "loyaltyProgramName" TEXT,
    "loyaltyTiers" JSONB,
    "fleetSize" INTEGER,
    "averageFleetAge" DOUBLE PRECISION,
    "aircraftTypes" TEXT[],
    "cabinClasses" TEXT[],
    "hasPremiumEconomy" BOOLEAN NOT NULL DEFAULT false,
    "hasLieFlat" BOOLEAN NOT NULL DEFAULT false,
    "hasWifi" BOOLEAN NOT NULL DEFAULT false,
    "wifiType" TEXT,
    "hasIFE" BOOLEAN NOT NULL DEFAULT false,
    "hasPowerOutlets" BOOLEAN NOT NULL DEFAULT false,
    "mealService" TEXT,
    "alcoholPolicy" TEXT,
    "carryOnIncluded" BOOLEAN NOT NULL DEFAULT true,
    "checkedBagIncluded" BOOLEAN NOT NULL DEFAULT false,
    "firstBagFeeUSD" DOUBLE PRECISION,
    "secondBagFeeUSD" DOUBLE PRECISION,
    "overallRating" DOUBLE PRECISION,
    "onTimeRating" DOUBLE PRECISION,
    "comfortRating" DOUBLE PRECISION,
    "serviceRating" DOUBLE PRECISION,
    "valueRating" DOUBLE PRECISION,
    "onTimePercentage" DOUBLE PRECISION,
    "cancellationRate" DOUBLE PRECISION,
    "avgDelayMinutes" DOUBLE PRECISION,
    "duffelId" TEXT,
    "amadeusId" TEXT,
    "airlineType" "AirlineType" NOT NULL DEFAULT 'FSC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "descriptionEmbedding" DOUBLE PRECISION[],
    "tags" TEXT[],
    "lastSyncedAt" TIMESTAMP(3),
    "dataSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airline_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_fleet" (
    "id" TEXT NOT NULL,
    "airlineId" TEXT NOT NULL,
    "aircraftType" TEXT NOT NULL,
    "icaoType" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "count" INTEGER NOT NULL,
    "averageAge" DOUBLE PRECISION,
    "seatConfig" JSONB,
    "totalSeats" INTEGER,
    "rangeKm" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airline_fleet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_routes" (
    "id" TEXT NOT NULL,
    "airlineId" TEXT NOT NULL,
    "originIata" TEXT NOT NULL,
    "destinationIata" TEXT NOT NULL,
    "routeType" TEXT,
    "dailyFlights" INTEGER,
    "weeklyFlights" INTEGER,
    "seasonality" TEXT,
    "avgEconomyFare" DOUBLE PRECISION,
    "avgBusinessFare" DOUBLE PRECISION,
    "priceVolatility" DOUBLE PRECISION,
    "onTimePercentage" DOUBLE PRECISION,
    "avgFlightDuration" INTEGER,
    "aircraftTypes" TEXT[],
    "competitorCount" INTEGER,
    "marketShare" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airline_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_operational_stats" (
    "id" TEXT NOT NULL,
    "airlineId" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalFlights" INTEGER,
    "onTimeFlights" INTEGER,
    "delayedFlights" INTEGER,
    "cancelledFlights" INTEGER,
    "avgDelayMinutes" DOUBLE PRECISION,
    "loadFactor" DOUBLE PRECISION,
    "complaints" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "airline_operational_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_knowledge_entries" (
    "id" TEXT NOT NULL,
    "airlineId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "source" TEXT,
    "sourceUrl" TEXT,
    "embedding" DOUBLE PRECISION[],
    "language" TEXT NOT NULL DEFAULT 'en',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airline_knowledge_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline_data_sync_logs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "airlinesUpdated" INTEGER NOT NULL DEFAULT 0,
    "airlinesCreated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "airline_data_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aircraft" (
    "id" TEXT NOT NULL,
    "iataCode" TEXT NOT NULL,
    "icaoCode" TEXT,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "family" TEXT,
    "variant" TEXT,
    "category" "AircraftCategory" NOT NULL DEFAULT 'NARROWBODY',
    "engineType" TEXT,
    "engineCount" INTEGER,
    "rangeKm" INTEGER,
    "rangeMiles" INTEGER,
    "cruiseSpeedKmh" INTEGER,
    "cruiseSpeedMph" INTEGER,
    "maxAltitudeFt" INTEGER,
    "fuelCapacityL" INTEGER,
    "maxPassengers" INTEGER,
    "typicalSeats" INTEGER,
    "cargoCapacityM3" DOUBLE PRECISION,
    "lengthM" DOUBLE PRECISION,
    "wingspanM" DOUBLE PRECISION,
    "heightM" DOUBLE PRECISION,
    "cabinWidthM" DOUBLE PRECISION,
    "hasWideBody" BOOLEAN NOT NULL DEFAULT false,
    "aisleCount" INTEGER NOT NULL DEFAULT 1,
    "seatWidthInches" DOUBLE PRECISION,
    "windowsPerRow" INTEGER,
    "firstFlight" TIMESTAMP(3),
    "inProduction" BOOLEAN NOT NULL DEFAULT true,
    "unitsBuilt" INTEGER,
    "operators" TEXT[],
    "imageUrl" TEXT,
    "schematicUrl" TEXT,
    "dataSource" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aircraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aircraft_seat_maps" (
    "id" TEXT NOT NULL,
    "aircraftId" TEXT NOT NULL,
    "airlineCode" TEXT,
    "configName" TEXT,
    "firstClassRows" INTEGER NOT NULL DEFAULT 0,
    "firstClassSeats" INTEGER NOT NULL DEFAULT 0,
    "firstClassPitch" INTEGER,
    "firstClassWidth" DOUBLE PRECISION,
    "businessRows" INTEGER NOT NULL DEFAULT 0,
    "businessSeats" INTEGER NOT NULL DEFAULT 0,
    "businessPitch" INTEGER,
    "businessWidth" DOUBLE PRECISION,
    "businessLieFlat" BOOLEAN NOT NULL DEFAULT false,
    "premiumEcoRows" INTEGER NOT NULL DEFAULT 0,
    "premiumEcoSeats" INTEGER NOT NULL DEFAULT 0,
    "premiumEcoPitch" INTEGER,
    "premiumEcoWidth" DOUBLE PRECISION,
    "economyRows" INTEGER NOT NULL DEFAULT 0,
    "economySeats" INTEGER NOT NULL DEFAULT 0,
    "economyPitch" INTEGER,
    "economyWidth" DOUBLE PRECISION,
    "totalSeats" INTEGER NOT NULL,
    "seatLayout" TEXT,
    "exitRows" INTEGER[],
    "extraLegroom" INTEGER[],
    "hasIFE" BOOLEAN NOT NULL DEFAULT false,
    "hasPower" BOOLEAN NOT NULL DEFAULT false,
    "hasWifi" BOOLEAN NOT NULL DEFAULT false,
    "seatMapJson" JSONB,
    "seatMapUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aircraft_seat_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airports" (
    "id" TEXT NOT NULL,
    "iataCode" TEXT NOT NULL,
    "icaoCode" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "city" TEXT NOT NULL,
    "cityCode" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "countryName" TEXT,
    "continent" TEXT,
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "elevation" INTEGER,
    "timezone" TEXT,
    "utcOffset" DOUBLE PRECISION,
    "airportType" "AirportType" NOT NULL DEFAULT 'LARGE',
    "isHub" BOOLEAN NOT NULL DEFAULT false,
    "isInternational" BOOLEAN NOT NULL DEFAULT true,
    "hubFor" TEXT[],
    "terminalCount" INTEGER,
    "terminals" JSONB,
    "runways" INTEGER,
    "longestRunway" INTEGER,
    "annualPassengers" INTEGER,
    "annualFlights" INTEGER,
    "hasLounge" BOOLEAN NOT NULL DEFAULT false,
    "loungeCount" INTEGER,
    "hasHotel" BOOLEAN NOT NULL DEFAULT false,
    "hasFreeWifi" BOOLEAN NOT NULL DEFAULT false,
    "hasMetro" BOOLEAN NOT NULL DEFAULT false,
    "hasTrainStation" BOOLEAN NOT NULL DEFAULT false,
    "distanceToCity" DOUBLE PRECISION,
    "avgTransferTime" INTEGER,
    "websiteUrl" TEXT,
    "phoneNumber" TEXT,
    "imageUrl" TEXT,
    "mapUrl" TEXT,
    "duffelId" TEXT,
    "amadeusId" TEXT,
    "dataSource" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fare_classes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "airlineCode" TEXT,
    "name" TEXT NOT NULL,
    "brandName" TEXT,
    "cabinClass" "CabinClass" NOT NULL,
    "tier" INTEGER,
    "bookingClasses" TEXT[],
    "isAward" BOOLEAN NOT NULL DEFAULT false,
    "isUpgrade" BOOLEAN NOT NULL DEFAULT false,
    "seatSelection" TEXT,
    "seatPitch" INTEGER,
    "seatWidth" DOUBLE PRECISION,
    "seatRecline" INTEGER,
    "legroom" TEXT,
    "carryOnIncluded" BOOLEAN NOT NULL DEFAULT true,
    "carryOnSize" TEXT,
    "checkedBags" INTEGER NOT NULL DEFAULT 0,
    "firstBagWeight" INTEGER,
    "secondBagWeight" INTEGER,
    "excessBagFee" DOUBLE PRECISION,
    "changeAllowed" BOOLEAN NOT NULL DEFAULT false,
    "changeFee" DOUBLE PRECISION,
    "changeAnytime" BOOLEAN NOT NULL DEFAULT false,
    "cancelAllowed" BOOLEAN NOT NULL DEFAULT false,
    "cancelFee" DOUBLE PRECISION,
    "refundable" BOOLEAN NOT NULL DEFAULT false,
    "refundType" TEXT,
    "noShowProtection" BOOLEAN NOT NULL DEFAULT false,
    "milesEarning" INTEGER,
    "eliteCredits" INTEGER,
    "upgradeEligible" BOOLEAN NOT NULL DEFAULT false,
    "loungAccess" BOOLEAN NOT NULL DEFAULT false,
    "priorityBoarding" BOOLEAN NOT NULL DEFAULT false,
    "prioritySecurity" BOOLEAN NOT NULL DEFAULT false,
    "priorityBaggage" BOOLEAN NOT NULL DEFAULT false,
    "mealIncluded" BOOLEAN NOT NULL DEFAULT false,
    "mealType" TEXT,
    "alcoholIncluded" BOOLEAN NOT NULL DEFAULT false,
    "entertainmentFree" BOOLEAN NOT NULL DEFAULT true,
    "wifiFree" BOOLEAN NOT NULL DEFAULT false,
    "dataSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fare_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_records" (
    "id" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "airlineCode" TEXT NOT NULL,
    "operatingCarrier" TEXT,
    "operatingFlight" TEXT,
    "originId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "originIata" TEXT NOT NULL,
    "destinationIata" TEXT NOT NULL,
    "aircraftId" TEXT,
    "aircraftIata" TEXT,
    "aircraftName" TEXT,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "departureTime" TEXT,
    "arrivalTime" TEXT,
    "departureLocal" TIMESTAMP(3),
    "arrivalLocal" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "status" TEXT,
    "actualDeparture" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "delayMinutes" INTEGER,
    "economyPrice" DOUBLE PRECISION,
    "businessPrice" DOUBLE PRECISION,
    "firstPrice" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "fareClass" TEXT,
    "fareBrand" TEXT,
    "seatsTotal" INTEGER,
    "seatsAvailable" INTEGER,
    "loadFactor" DOUBLE PRECISION,
    "offerId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'duffel',
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flight_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_statistics" (
    "id" TEXT NOT NULL,
    "originIata" TEXT NOT NULL,
    "destinationIata" TEXT NOT NULL,
    "routeKey" TEXT NOT NULL,
    "distanceKm" INTEGER,
    "distanceMiles" INTEGER,
    "flightTimeMin" INTEGER,
    "operatingAirlines" TEXT[],
    "carrierCount" INTEGER,
    "dominantCarrier" TEXT,
    "marketShare" JSONB,
    "dailyFlights" INTEGER,
    "weeklyFlights" INTEGER,
    "seasonality" TEXT,
    "peakMonths" INTEGER[],
    "avgEconomyPrice" DOUBLE PRECISION,
    "avgBusinessPrice" DOUBLE PRECISION,
    "avgFirstPrice" DOUBLE PRECISION,
    "priceVolatility" DOUBLE PRECISION,
    "cheapestMonth" INTEGER,
    "expensiveMonth" INTEGER,
    "advancePurchase" INTEGER,
    "avgDelay" DOUBLE PRECISION,
    "onTimeRate" DOUBLE PRECISION,
    "cancellationRate" DOUBLE PRECISION,
    "isCompetitive" BOOLEAN NOT NULL DEFAULT false,
    "hasBudgetOption" BOOLEAN NOT NULL DEFAULT false,
    "lastAnalyzed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_trends" (
    "id" TEXT NOT NULL,
    "originIata" TEXT NOT NULL,
    "destinationIata" TEXT NOT NULL,
    "airlineCode" TEXT,
    "searchDate" TIMESTAMP(3) NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "daysInAdvance" INTEGER NOT NULL,
    "economyMin" DOUBLE PRECISION,
    "economyAvg" DOUBLE PRECISION,
    "economyMax" DOUBLE PRECISION,
    "businessMin" DOUBLE PRECISION,
    "businessAvg" DOUBLE PRECISION,
    "businessMax" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "offersCount" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL DEFAULT 'duffel',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aviation_data_sync_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" JSONB,
    "durationMs" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aviation_data_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "userId" TEXT,
    "emailType" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "event" TEXT,
    "subject" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "opens" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "bounceType" TEXT,
    "bounceReason" TEXT,
    "failureReason" TEXT,
    "aiDecision" TEXT,
    "clientInfo" TEXT,
    "geolocation" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_decision_logs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_decision_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_logs" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "step" INTEGER,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_suppressions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_suppressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_queue" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "platforms" TEXT[],
    "imageUrl" TEXT,
    "imagePrompt" TEXT,
    "link" TEXT,
    "hashtags" TEXT[],
    "productType" TEXT,
    "productId" TEXT,
    "productData" JSONB,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "error" TEXT,
    "postedAt" TIMESTAMP(3),
    "results" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "content_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_post_logs" (
    "id" TEXT NOT NULL,
    "contentQueueId" TEXT,
    "platform" TEXT NOT NULL,
    "platformPostId" TEXT,
    "platformUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "link" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "engagements" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "error" TEXT,
    "metadata" JSONB,
    "postedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_post_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_liteApiGuestId_key" ON "users"("liteApiGuestId");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "saved_searches_userId_idx" ON "saved_searches"("userId");

-- CreateIndex
CREATE INDEX "saved_searches_userId_lastSearched_idx" ON "saved_searches"("userId", "lastSearched");

-- CreateIndex
CREATE INDEX "price_alerts_userId_active_idx" ON "price_alerts"("userId", "active");

-- CreateIndex
CREATE INDEX "price_alerts_active_idx" ON "price_alerts"("active");

-- CreateIndex
CREATE INDEX "recent_searches_userId_viewedAt_idx" ON "recent_searches"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "user_activities_userId_createdAt_idx" ON "user_activities"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_eventType_createdAt_idx" ON "user_activities"("eventType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_conversations_sessionId_key" ON "ai_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_idx" ON "ai_conversations"("userId");

-- CreateIndex
CREATE INDEX "ai_conversations_sessionId_idx" ON "ai_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "ai_conversations_status_idx" ON "ai_conversations"("status");

-- CreateIndex
CREATE INDEX "ai_conversations_createdAt_idx" ON "ai_conversations"("createdAt");

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_idx" ON "ai_messages"("conversationId");

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_timestamp_idx" ON "ai_messages"("conversationId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_userId_lastActive_idx" ON "user_sessions"("userId", "lastActive");

-- CreateIndex
CREATE INDEX "login_history_userId_timestamp_idx" ON "login_history"("userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ai_sessions_sessionId_key" ON "ai_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "ai_sessions_ipAddressHash_idx" ON "ai_sessions"("ipAddressHash");

-- CreateIndex
CREATE INDEX "ai_sessions_userId_idx" ON "ai_sessions"("userId");

-- CreateIndex
CREATE INDEX "ai_sessions_lastActivity_idx" ON "ai_sessions"("lastActivity");

-- CreateIndex
CREATE INDEX "ai_sessions_createdAt_idx" ON "ai_sessions"("createdAt");

-- CreateIndex
CREATE INDEX "price_history_origin_destination_departDate_idx" ON "price_history"("origin", "destination", "departDate");

-- CreateIndex
CREATE INDEX "price_history_timestamp_idx" ON "price_history"("timestamp");

-- CreateIndex
CREATE INDEX "price_monitor_logs_executionTime_idx" ON "price_monitor_logs"("executionTime");

-- CreateIndex
CREATE INDEX "wishlist_items_userId_idx" ON "wishlist_items"("userId");

-- CreateIndex
CREATE INDEX "wishlist_items_userId_productType_idx" ON "wishlist_items"("userId", "productType");

-- CreateIndex
CREATE INDEX "wishlist_items_userId_createdAt_idx" ON "wishlist_items"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_transactions_liteApiTransactionId_key" ON "loyalty_transactions"("liteApiTransactionId");

-- CreateIndex
CREATE INDEX "loyalty_transactions_userId_idx" ON "loyalty_transactions"("userId");

-- CreateIndex
CREATE INDEX "loyalty_transactions_userId_type_idx" ON "loyalty_transactions"("userId", "type");

-- CreateIndex
CREATE INDEX "loyalty_transactions_userId_source_idx" ON "loyalty_transactions"("userId", "source");

-- CreateIndex
CREATE INDEX "loyalty_transactions_userId_createdAt_idx" ON "loyalty_transactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "voucher_redemptions_userId_idx" ON "voucher_redemptions"("userId");

-- CreateIndex
CREATE INDEX "voucher_redemptions_voucherCode_idx" ON "voucher_redemptions"("voucherCode");

-- CreateIndex
CREATE INDEX "voucher_redemptions_bookingReference_idx" ON "voucher_redemptions"("bookingReference");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_code_idx" ON "promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_isActive_validFrom_validUntil_idx" ON "promo_codes"("isActive", "validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "frequent_travelers_userId_idx" ON "frequent_travelers"("userId");

-- CreateIndex
CREATE INDEX "frequent_travelers_userId_isDefault_idx" ON "frequent_travelers"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_stripePaymentMethodId_key" ON "payment_methods"("stripePaymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_paypalAccountId_key" ON "payment_methods"("paypalAccountId");

-- CreateIndex
CREATE INDEX "payment_methods_userId_idx" ON "payment_methods"("userId");

-- CreateIndex
CREATE INDEX "payment_methods_userId_isDefault_idx" ON "payment_methods"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "payment_methods_stripePaymentMethodId_idx" ON "payment_methods"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "travel_documents_userId_idx" ON "travel_documents"("userId");

-- CreateIndex
CREATE INDEX "travel_documents_userId_type_idx" ON "travel_documents"("userId", "type");

-- CreateIndex
CREATE INDEX "travel_documents_expirationDate_idx" ON "travel_documents"("expirationDate");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "referral_network_relationships_referrerId_level_idx" ON "referral_network_relationships"("referrerId", "level");

-- CreateIndex
CREATE INDEX "referral_network_relationships_refereeId_idx" ON "referral_network_relationships"("refereeId");

-- CreateIndex
CREATE INDEX "referral_network_relationships_status_idx" ON "referral_network_relationships"("status");

-- CreateIndex
CREATE UNIQUE INDEX "referral_network_relationships_referrerId_refereeId_key" ON "referral_network_relationships"("referrerId", "refereeId");

-- CreateIndex
CREATE INDEX "referral_points_transactions_earnerId_status_idx" ON "referral_points_transactions"("earnerId", "status");

-- CreateIndex
CREATE INDEX "referral_points_transactions_customerId_idx" ON "referral_points_transactions"("customerId");

-- CreateIndex
CREATE INDEX "referral_points_transactions_bookingId_idx" ON "referral_points_transactions"("bookingId");

-- CreateIndex
CREATE INDEX "referral_points_transactions_tripEndDate_idx" ON "referral_points_transactions"("tripEndDate");

-- CreateIndex
CREATE INDEX "referral_points_transactions_pointsUnlockedAt_idx" ON "referral_points_transactions"("pointsUnlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "referral_points_transactions_bookingId_earnerId_level_key" ON "referral_points_transactions"("bookingId", "earnerId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_code_key" ON "referrals"("code");

-- CreateIndex
CREATE INDEX "referrals_referrerId_idx" ON "referrals"("referrerId");

-- CreateIndex
CREATE INDEX "referrals_refereeId_idx" ON "referrals"("refereeId");

-- CreateIndex
CREATE INDEX "referrals_code_idx" ON "referrals"("code");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "credit_transactions_userId_createdAt_idx" ON "credit_transactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "credit_transactions_type_createdAt_idx" ON "credit_transactions"("type", "createdAt");

-- CreateIndex
CREATE INDEX "credit_transactions_status_idx" ON "credit_transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "trip_groups_slug_key" ON "trip_groups"("slug");

-- CreateIndex
CREATE INDEX "trip_groups_creatorId_idx" ON "trip_groups"("creatorId");

-- CreateIndex
CREATE INDEX "trip_groups_slug_idx" ON "trip_groups"("slug");

-- CreateIndex
CREATE INDEX "trip_groups_status_visibility_idx" ON "trip_groups"("status", "visibility");

-- CreateIndex
CREATE INDEX "trip_groups_startDate_idx" ON "trip_groups"("startDate");

-- CreateIndex
CREATE INDEX "trip_groups_destination_idx" ON "trip_groups"("destination");

-- CreateIndex
CREATE INDEX "trip_groups_featured_trending_idx" ON "trip_groups"("featured", "trending");

-- CreateIndex
CREATE INDEX "group_members_tripGroupId_status_idx" ON "group_members"("tripGroupId", "status");

-- CreateIndex
CREATE INDEX "group_members_userId_idx" ON "group_members"("userId");

-- CreateIndex
CREATE INDEX "group_members_status_idx" ON "group_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_tripGroupId_userId_key" ON "group_members"("tripGroupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tripmatch_user_profiles_userId_key" ON "tripmatch_user_profiles"("userId");

-- CreateIndex
CREATE INDEX "tripmatch_user_profiles_userId_idx" ON "tripmatch_user_profiles"("userId");

-- CreateIndex
CREATE INDEX "tripmatch_user_profiles_locationCountry_idx" ON "tripmatch_user_profiles"("locationCountry");

-- CreateIndex
CREATE INDEX "tripmatch_user_profiles_verificationLevel_idx" ON "tripmatch_user_profiles"("verificationLevel");

-- CreateIndex
CREATE INDEX "trip_posts_tripId_createdAt_idx" ON "trip_posts"("tripId", "createdAt");

-- CreateIndex
CREATE INDEX "trip_posts_userId_idx" ON "trip_posts"("userId");

-- CreateIndex
CREATE INDEX "trip_posts_visibility_idx" ON "trip_posts"("visibility");

-- CreateIndex
CREATE INDEX "post_reactions_postId_idx" ON "post_reactions"("postId");

-- CreateIndex
CREATE INDEX "post_reactions_userId_idx" ON "post_reactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_postId_userId_key" ON "post_reactions"("postId", "userId");

-- CreateIndex
CREATE INDEX "post_comments_postId_createdAt_idx" ON "post_comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "post_comments_userId_idx" ON "post_comments"("userId");

-- CreateIndex
CREATE INDEX "trip_messages_tripId_createdAt_idx" ON "trip_messages"("tripId", "createdAt");

-- CreateIndex
CREATE INDEX "trip_messages_userId_idx" ON "trip_messages"("userId");

-- CreateIndex
CREATE INDEX "trip_reviews_tripId_idx" ON "trip_reviews"("tripId");

-- CreateIndex
CREATE INDEX "trip_reviews_reviewerId_idx" ON "trip_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "trip_reviews_reviewedUserId_idx" ON "trip_reviews"("reviewedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_reviews_tripId_reviewerId_reviewedUserId_key" ON "trip_reviews"("tripId", "reviewerId", "reviewedUserId");

-- CreateIndex
CREATE INDEX "user_connections_fromUserId_status_idx" ON "user_connections"("fromUserId", "status");

-- CreateIndex
CREATE INDEX "user_connections_toUserId_status_idx" ON "user_connections"("toUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_connections_fromUserId_toUserId_key" ON "user_connections"("fromUserId", "toUserId");

-- CreateIndex
CREATE INDEX "traveler_matches_fromUserId_actionTaken_idx" ON "traveler_matches"("fromUserId", "actionTaken");

-- CreateIndex
CREATE INDEX "traveler_matches_toUserId_idx" ON "traveler_matches"("toUserId");

-- CreateIndex
CREATE INDEX "traveler_matches_matchScore_idx" ON "traveler_matches"("matchScore");

-- CreateIndex
CREATE UNIQUE INDEX "traveler_matches_fromUserId_toUserId_key" ON "traveler_matches"("fromUserId", "toUserId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_timestamp_idx" ON "analytics_events"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_userId_timestamp_idx" ON "analytics_events"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_timestamp_idx" ON "analytics_events"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "metric_snapshots_metricName_timestamp_idx" ON "metric_snapshots"("metricName", "timestamp");

-- CreateIndex
CREATE INDEX "metric_snapshots_timestamp_granularity_idx" ON "metric_snapshots"("timestamp", "granularity");

-- CreateIndex
CREATE UNIQUE INDEX "metric_snapshots_metricName_granularity_timestamp_key" ON "metric_snapshots"("metricName", "granularity", "timestamp");

-- CreateIndex
CREATE INDEX "price_predictions_origin_destination_departDate_idx" ON "price_predictions"("origin", "destination", "departDate");

-- CreateIndex
CREATE INDEX "price_predictions_createdAt_idx" ON "price_predictions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ml_models_name_key" ON "ml_models"("name");

-- CreateIndex
CREATE INDEX "ml_models_name_version_idx" ON "ml_models"("name", "version");

-- CreateIndex
CREATE INDEX "ml_models_active_idx" ON "ml_models"("active");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_key_idx" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_enabled_idx" ON "feature_flags"("enabled");

-- CreateIndex
CREATE INDEX "feature_flags_isExperiment_experimentStatus_idx" ON "feature_flags"("isExperiment", "experimentStatus");

-- CreateIndex
CREATE INDEX "experiment_participations_flagId_variant_idx" ON "experiment_participations"("flagId", "variant");

-- CreateIndex
CREATE INDEX "experiment_participations_flagId_converted_idx" ON "experiment_participations"("flagId", "converted");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_participations_flagId_userId_key" ON "experiment_participations"("flagId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_participations_flagId_sessionId_key" ON "experiment_participations"("flagId", "sessionId");

-- CreateIndex
CREATE INDEX "performance_metrics_metricName_timestamp_idx" ON "performance_metrics"("metricName", "timestamp");

-- CreateIndex
CREATE INDEX "performance_metrics_url_metricName_idx" ON "performance_metrics"("url", "metricName");

-- CreateIndex
CREATE INDEX "performance_metrics_rating_metricName_idx" ON "performance_metrics"("rating", "metricName");

-- CreateIndex
CREATE INDEX "performance_metrics_timestamp_idx" ON "performance_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "error_logs_severity_resolved_timestamp_idx" ON "error_logs"("severity", "resolved", "timestamp");

-- CreateIndex
CREATE INDEX "error_logs_fingerprint_timestamp_idx" ON "error_logs"("fingerprint", "timestamp");

-- CreateIndex
CREATE INDEX "error_logs_userId_idx" ON "error_logs"("userId");

-- CreateIndex
CREATE INDEX "error_logs_timestamp_idx" ON "error_logs"("timestamp");

-- CreateIndex
CREATE INDEX "conversion_funnels_sessionId_stage_idx" ON "conversion_funnels"("sessionId", "stage");

-- CreateIndex
CREATE INDEX "conversion_funnels_stage_action_timestamp_idx" ON "conversion_funnels"("stage", "action", "timestamp");

-- CreateIndex
CREATE INDEX "conversion_funnels_timestamp_idx" ON "conversion_funnels"("timestamp");

-- CreateIndex
CREATE INDEX "user_cohorts_cohortDate_idx" ON "user_cohorts"("cohortDate");

-- CreateIndex
CREATE INDEX "user_cohorts_cohortWeek_idx" ON "user_cohorts"("cohortWeek");

-- CreateIndex
CREATE INDEX "user_cohorts_cohortMonth_idx" ON "user_cohorts"("cohortMonth");

-- CreateIndex
CREATE UNIQUE INDEX "user_cohorts_userId_key" ON "user_cohorts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_userId_key" ON "admin_users"("userId");

-- CreateIndex
CREATE INDEX "admin_users_role_idx" ON "admin_users"("role");

-- CreateIndex
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_action_resource_idx" ON "audit_logs"("action", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "deals_slug_key" ON "deals"("slug");

-- CreateIndex
CREATE INDEX "deals_slug_idx" ON "deals"("slug");

-- CreateIndex
CREATE INDEX "deals_active_featured_idx" ON "deals"("active", "featured");

-- CreateIndex
CREATE INDEX "deals_expiresAt_idx" ON "deals"("expiresAt");

-- CreateIndex
CREATE INDEX "deals_category_idx" ON "deals"("category");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_airportCode_key" ON "destinations"("airportCode");

-- CreateIndex
CREATE INDEX "destinations_slug_idx" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX "destinations_airportCode_idx" ON "destinations"("airportCode");

-- CreateIndex
CREATE INDEX "destinations_published_featured_idx" ON "destinations"("published", "featured");

-- CreateIndex
CREATE INDEX "destinations_trending_idx" ON "destinations"("trending");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_name_key" ON "email_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_key_key" ON "email_templates"("key");

-- CreateIndex
CREATE INDEX "email_templates_key_idx" ON "email_templates"("key");

-- CreateIndex
CREATE INDEX "email_templates_active_idx" ON "email_templates"("active");

-- CreateIndex
CREATE INDEX "email_campaigns_status_idx" ON "email_campaigns"("status");

-- CreateIndex
CREATE INDEX "email_campaigns_type_idx" ON "email_campaigns"("type");

-- CreateIndex
CREATE INDEX "email_campaigns_scheduledAt_idx" ON "email_campaigns"("scheduledAt");

-- CreateIndex
CREATE INDEX "email_campaign_sends_campaignId_idx" ON "email_campaign_sends"("campaignId");

-- CreateIndex
CREATE INDEX "email_campaign_sends_email_idx" ON "email_campaign_sends"("email");

-- CreateIndex
CREATE INDEX "email_campaign_sends_status_idx" ON "email_campaign_sends"("status");

-- CreateIndex
CREATE UNIQUE INDEX "email_campaign_sends_campaignId_email_key" ON "email_campaign_sends"("campaignId", "email");

-- CreateIndex
CREATE INDEX "health_checks_service_timestamp_idx" ON "health_checks"("service", "timestamp");

-- CreateIndex
CREATE INDEX "health_checks_status_timestamp_idx" ON "health_checks"("status", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "search_suggestions_query_key" ON "search_suggestions"("query");

-- CreateIndex
CREATE INDEX "search_suggestions_query_idx" ON "search_suggestions"("query");

-- CreateIndex
CREATE INDEX "search_suggestions_type_popularity_idx" ON "search_suggestions"("type", "popularity");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_bookings_confirmationNumber_key" ON "hotel_bookings"("confirmationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_bookings_paymentIntentId_key" ON "hotel_bookings"("paymentIntentId");

-- CreateIndex
CREATE INDEX "hotel_bookings_userId_idx" ON "hotel_bookings"("userId");

-- CreateIndex
CREATE INDEX "hotel_bookings_guestEmail_idx" ON "hotel_bookings"("guestEmail");

-- CreateIndex
CREATE INDEX "hotel_bookings_confirmationNumber_idx" ON "hotel_bookings"("confirmationNumber");

-- CreateIndex
CREATE INDEX "hotel_bookings_status_idx" ON "hotel_bookings"("status");

-- CreateIndex
CREATE INDEX "hotel_bookings_checkInDate_idx" ON "hotel_bookings"("checkInDate");

-- CreateIndex
CREATE INDEX "hotel_bookings_checkOutDate_idx" ON "hotel_bookings"("checkOutDate");

-- CreateIndex
CREATE INDEX "hotel_bookings_paymentStatus_idx" ON "hotel_bookings"("paymentStatus");

-- CreateIndex
CREATE INDEX "hotel_bookings_createdAt_idx" ON "hotel_bookings"("createdAt");

-- CreateIndex
CREATE INDEX "hotel_reviews_hotelId_status_idx" ON "hotel_reviews"("hotelId", "status");

-- CreateIndex
CREATE INDEX "hotel_reviews_userId_idx" ON "hotel_reviews"("userId");

-- CreateIndex
CREATE INDEX "hotel_reviews_bookingId_idx" ON "hotel_reviews"("bookingId");

-- CreateIndex
CREATE INDEX "hotel_reviews_status_idx" ON "hotel_reviews"("status");

-- CreateIndex
CREATE INDEX "hotel_reviews_createdAt_idx" ON "hotel_reviews"("createdAt");

-- CreateIndex
CREATE INDEX "hotel_price_alerts_userId_active_idx" ON "hotel_price_alerts"("userId", "active");

-- CreateIndex
CREATE INDEX "hotel_price_alerts_hotelId_active_idx" ON "hotel_price_alerts"("hotelId", "active");

-- CreateIndex
CREATE INDEX "hotel_price_alerts_active_lastChecked_idx" ON "hotel_price_alerts"("active", "lastChecked");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_userId_key" ON "affiliates"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_customLandingPageSlug_key" ON "affiliates"("customLandingPageSlug");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_apiKey_key" ON "affiliates"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_referralCode_key" ON "affiliates"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_trackingId_key" ON "affiliates"("trackingId");

-- CreateIndex
CREATE INDEX "affiliates_tier_status_idx" ON "affiliates"("tier", "status");

-- CreateIndex
CREATE INDEX "affiliates_status_idx" ON "affiliates"("status");

-- CreateIndex
CREATE INDEX "affiliates_category_idx" ON "affiliates"("category");

-- CreateIndex
CREATE INDEX "affiliates_referralCode_idx" ON "affiliates"("referralCode");

-- CreateIndex
CREATE INDEX "affiliates_trackingId_idx" ON "affiliates"("trackingId");

-- CreateIndex
CREATE INDEX "affiliates_monthlyCompletedTrips_idx" ON "affiliates"("monthlyCompletedTrips");

-- CreateIndex
CREATE INDEX "affiliates_trustLevel_idx" ON "affiliates"("trustLevel");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_referrals_clickId_key" ON "affiliate_referrals"("clickId");

-- CreateIndex
CREATE INDEX "affiliate_referrals_affiliateId_status_idx" ON "affiliate_referrals"("affiliateId", "status");

-- CreateIndex
CREATE INDEX "affiliate_referrals_clickId_idx" ON "affiliate_referrals"("clickId");

-- CreateIndex
CREATE INDEX "affiliate_referrals_bookingId_idx" ON "affiliate_referrals"("bookingId");

-- CreateIndex
CREATE INDEX "affiliate_referrals_cookieExpiry_idx" ON "affiliate_referrals"("cookieExpiry");

-- CreateIndex
CREATE INDEX "affiliate_referrals_clickedAt_idx" ON "affiliate_referrals"("clickedAt");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_referralId_key" ON "commissions"("referralId");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_bookingId_key" ON "commissions"("bookingId");

-- CreateIndex
CREATE INDEX "commissions_affiliateId_status_idx" ON "commissions"("affiliateId", "status");

-- CreateIndex
CREATE INDEX "commissions_bookingId_idx" ON "commissions"("bookingId");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "commissions_status_holdPeriodEndsAt_idx" ON "commissions"("status", "holdPeriodEndsAt");

-- CreateIndex
CREATE INDEX "commissions_tripEndDate_idx" ON "commissions"("tripEndDate");

-- CreateIndex
CREATE INDEX "commissions_holdPeriodEndsAt_idx" ON "commissions"("holdPeriodEndsAt");

-- CreateIndex
CREATE INDEX "commissions_approvedAt_idx" ON "commissions"("approvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_invoiceNumber_key" ON "payouts"("invoiceNumber");

-- CreateIndex
CREATE INDEX "payouts_affiliateId_status_idx" ON "payouts"("affiliateId", "status");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "payouts_periodStart_periodEnd_idx" ON "payouts"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "payouts_processedAt_idx" ON "payouts"("processedAt");

-- CreateIndex
CREATE INDEX "affiliate_activity_logs_affiliateId_createdAt_idx" ON "affiliate_activity_logs"("affiliateId", "createdAt");

-- CreateIndex
CREATE INDEX "affiliate_activity_logs_activityType_idx" ON "affiliate_activity_logs"("activityType");

-- CreateIndex
CREATE UNIQUE INDEX "flat_fee_campaigns_invoiceNumber_key" ON "flat_fee_campaigns"("invoiceNumber");

-- CreateIndex
CREATE INDEX "flat_fee_campaigns_affiliateId_status_idx" ON "flat_fee_campaigns"("affiliateId", "status");

-- CreateIndex
CREATE INDEX "flat_fee_campaigns_status_idx" ON "flat_fee_campaigns"("status");

-- CreateIndex
CREATE UNIQUE INDEX "hold_period_configs_category_trustLevel_key" ON "hold_period_configs"("category", "trustLevel");

-- CreateIndex
CREATE INDEX "commission_lifecycle_logs_commissionId_idx" ON "commission_lifecycle_logs"("commissionId");

-- CreateIndex
CREATE INDEX "commission_lifecycle_logs_commissionId_changedAt_idx" ON "commission_lifecycle_logs"("commissionId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "travel_agents_userId_key" ON "travel_agents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "travel_agents_iataNumber_key" ON "travel_agents"("iataNumber");

-- CreateIndex
CREATE UNIQUE INDEX "travel_agents_customDomain_key" ON "travel_agents"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "travel_agents_apiKey_key" ON "travel_agents"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "travel_agents_stripeAccountId_key" ON "travel_agents"("stripeAccountId");

-- CreateIndex
CREATE INDEX "travel_agents_tier_status_idx" ON "travel_agents"("tier", "status");

-- CreateIndex
CREATE INDEX "travel_agents_status_idx" ON "travel_agents"("status");

-- CreateIndex
CREATE INDEX "travel_agents_userId_idx" ON "travel_agents"("userId");

-- CreateIndex
CREATE INDEX "travel_agents_bookingsThisMonth_idx" ON "travel_agents"("bookingsThisMonth");

-- CreateIndex
CREATE UNIQUE INDEX "agent_clients_userId_key" ON "agent_clients"("userId");

-- CreateIndex
CREATE INDEX "agent_clients_agentId_idx" ON "agent_clients"("agentId");

-- CreateIndex
CREATE INDEX "agent_clients_agentId_segment_idx" ON "agent_clients"("agentId", "segment");

-- CreateIndex
CREATE INDEX "agent_clients_email_idx" ON "agent_clients"("email");

-- CreateIndex
CREATE INDEX "agent_clients_status_idx" ON "agent_clients"("status");

-- CreateIndex
CREATE UNIQUE INDEX "agent_clients_agentId_email_key" ON "agent_clients"("agentId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "agent_quotes_quoteNumber_key" ON "agent_quotes"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "agent_quotes_shareableLink_key" ON "agent_quotes"("shareableLink");

-- CreateIndex
CREATE UNIQUE INDEX "agent_quotes_bookingId_key" ON "agent_quotes"("bookingId");

-- CreateIndex
CREATE INDEX "agent_quotes_agentId_status_idx" ON "agent_quotes"("agentId", "status");

-- CreateIndex
CREATE INDEX "agent_quotes_clientId_status_idx" ON "agent_quotes"("clientId", "status");

-- CreateIndex
CREATE INDEX "agent_quotes_quoteNumber_idx" ON "agent_quotes"("quoteNumber");

-- CreateIndex
CREATE INDEX "agent_quotes_status_idx" ON "agent_quotes"("status");

-- CreateIndex
CREATE INDEX "agent_quotes_expiresAt_idx" ON "agent_quotes"("expiresAt");

-- CreateIndex
CREATE INDEX "agent_quotes_createdAt_idx" ON "agent_quotes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "agent_bookings_confirmationNumber_key" ON "agent_bookings"("confirmationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "agent_bookings_quoteId_key" ON "agent_bookings"("quoteId");

-- CreateIndex
CREATE INDEX "agent_bookings_agentId_status_idx" ON "agent_bookings"("agentId", "status");

-- CreateIndex
CREATE INDEX "agent_bookings_clientId_status_idx" ON "agent_bookings"("clientId", "status");

-- CreateIndex
CREATE INDEX "agent_bookings_confirmationNumber_idx" ON "agent_bookings"("confirmationNumber");

-- CreateIndex
CREATE INDEX "agent_bookings_status_idx" ON "agent_bookings"("status");

-- CreateIndex
CREATE INDEX "agent_bookings_paymentStatus_idx" ON "agent_bookings"("paymentStatus");

-- CreateIndex
CREATE INDEX "agent_bookings_startDate_idx" ON "agent_bookings"("startDate");

-- CreateIndex
CREATE INDEX "agent_bookings_endDate_idx" ON "agent_bookings"("endDate");

-- CreateIndex
CREATE INDEX "agent_bookings_tripCompleted_idx" ON "agent_bookings"("tripCompleted");

-- CreateIndex
CREATE INDEX "agent_commissions_agentId_status_idx" ON "agent_commissions"("agentId", "status");

-- CreateIndex
CREATE INDEX "agent_commissions_bookingId_idx" ON "agent_commissions"("bookingId");

-- CreateIndex
CREATE INDEX "agent_commissions_status_idx" ON "agent_commissions"("status");

-- CreateIndex
CREATE INDEX "agent_commissions_holdUntil_idx" ON "agent_commissions"("holdUntil");

-- CreateIndex
CREATE INDEX "agent_commissions_availableAt_idx" ON "agent_commissions"("availableAt");

-- CreateIndex
CREATE UNIQUE INDEX "agent_payouts_payoutNumber_key" ON "agent_payouts"("payoutNumber");

-- CreateIndex
CREATE UNIQUE INDEX "agent_payouts_invoiceNumber_key" ON "agent_payouts"("invoiceNumber");

-- CreateIndex
CREATE INDEX "agent_payouts_agentId_status_idx" ON "agent_payouts"("agentId", "status");

-- CreateIndex
CREATE INDEX "agent_payouts_status_idx" ON "agent_payouts"("status");

-- CreateIndex
CREATE INDEX "agent_payouts_periodStart_periodEnd_idx" ON "agent_payouts"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "agent_payouts_requestedAt_idx" ON "agent_payouts"("requestedAt");

-- CreateIndex
CREATE INDEX "agent_team_members_agencyId_active_idx" ON "agent_team_members"("agencyId", "active");

-- CreateIndex
CREATE INDEX "agent_team_members_agentId_idx" ON "agent_team_members"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_team_members_agencyId_agentId_key" ON "agent_team_members"("agencyId", "agentId");

-- CreateIndex
CREATE INDEX "agent_client_notes_clientId_createdAt_idx" ON "agent_client_notes"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "agent_client_notes_agentId_idx" ON "agent_client_notes"("agentId");

-- CreateIndex
CREATE INDEX "agent_client_notes_requiresFollowUp_followUpDate_idx" ON "agent_client_notes"("requiresFollowUp", "followUpDate");

-- CreateIndex
CREATE INDEX "agent_client_documents_clientId_idx" ON "agent_client_documents"("clientId");

-- CreateIndex
CREATE INDEX "agent_client_documents_bookingId_idx" ON "agent_client_documents"("bookingId");

-- CreateIndex
CREATE INDEX "agent_client_documents_documentType_idx" ON "agent_client_documents"("documentType");

-- CreateIndex
CREATE INDEX "agent_itinerary_templates_agentId_idx" ON "agent_itinerary_templates"("agentId");

-- CreateIndex
CREATE INDEX "agent_itinerary_templates_category_idx" ON "agent_itinerary_templates"("category");

-- CreateIndex
CREATE INDEX "agent_suppliers_agentId_idx" ON "agent_suppliers"("agentId");

-- CreateIndex
CREATE INDEX "agent_products_agentId_idx" ON "agent_products"("agentId");

-- CreateIndex
CREATE INDEX "agent_products_supplierId_idx" ON "agent_products"("supplierId");

-- CreateIndex
CREATE INDEX "agent_products_isActive_idx" ON "agent_products"("isActive");

-- CreateIndex
CREATE INDEX "agent_activity_logs_agentId_createdAt_idx" ON "agent_activity_logs"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "agent_activity_logs_activityType_idx" ON "agent_activity_logs"("activityType");

-- CreateIndex
CREATE INDEX "agent_activity_logs_entityType_entityId_idx" ON "agent_activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_teams_name_key" ON "world_cup_teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_teams_fifaCode_key" ON "world_cup_teams"("fifaCode");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_teams_slug_key" ON "world_cup_teams"("slug");

-- CreateIndex
CREATE INDEX "world_cup_teams_slug_idx" ON "world_cup_teams"("slug");

-- CreateIndex
CREATE INDEX "world_cup_teams_group_idx" ON "world_cup_teams"("group");

-- CreateIndex
CREATE INDEX "world_cup_teams_confederation_idx" ON "world_cup_teams"("confederation");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_stadiums_name_key" ON "world_cup_stadiums"("name");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_stadiums_slug_key" ON "world_cup_stadiums"("slug");

-- CreateIndex
CREATE INDEX "world_cup_stadiums_slug_idx" ON "world_cup_stadiums"("slug");

-- CreateIndex
CREATE INDEX "world_cup_stadiums_city_idx" ON "world_cup_stadiums"("city");

-- CreateIndex
CREATE INDEX "world_cup_stadiums_country_idx" ON "world_cup_stadiums"("country");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_matches_matchNumber_key" ON "world_cup_matches"("matchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_matches_fifaMatchId_key" ON "world_cup_matches"("fifaMatchId");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_matches_slug_key" ON "world_cup_matches"("slug");

-- CreateIndex
CREATE INDEX "world_cup_matches_matchDate_idx" ON "world_cup_matches"("matchDate");

-- CreateIndex
CREATE INDEX "world_cup_matches_stadiumId_idx" ON "world_cup_matches"("stadiumId");

-- CreateIndex
CREATE INDEX "world_cup_matches_stage_idx" ON "world_cup_matches"("stage");

-- CreateIndex
CREATE INDEX "world_cup_matches_slug_idx" ON "world_cup_matches"("slug");

-- CreateIndex
CREATE INDEX "world_cup_tickets_matchId_available_idx" ON "world_cup_tickets"("matchId", "available");

-- CreateIndex
CREATE INDEX "world_cup_tickets_provider_idx" ON "world_cup_tickets"("provider");

-- CreateIndex
CREATE INDEX "world_cup_tickets_retailPrice_idx" ON "world_cup_tickets"("retailPrice");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_bookings_confirmationNumber_key" ON "world_cup_bookings"("confirmationNumber");

-- CreateIndex
CREATE INDEX "world_cup_bookings_userId_idx" ON "world_cup_bookings"("userId");

-- CreateIndex
CREATE INDEX "world_cup_bookings_matchId_idx" ON "world_cup_bookings"("matchId");

-- CreateIndex
CREATE INDEX "world_cup_bookings_teamId_idx" ON "world_cup_bookings"("teamId");

-- CreateIndex
CREATE INDEX "world_cup_bookings_status_idx" ON "world_cup_bookings"("status");

-- CreateIndex
CREATE INDEX "world_cup_bookings_confirmationNumber_idx" ON "world_cup_bookings"("confirmationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "card_authorizations_bookingReference_key" ON "card_authorizations"("bookingReference");

-- CreateIndex
CREATE INDEX "card_authorizations_bookingReference_idx" ON "card_authorizations"("bookingReference");

-- CreateIndex
CREATE INDEX "card_authorizations_status_idx" ON "card_authorizations"("status");

-- CreateIndex
CREATE INDEX "card_authorizations_email_idx" ON "card_authorizations"("email");

-- CreateIndex
CREATE INDEX "card_authorizations_submittedAt_idx" ON "card_authorizations"("submittedAt");

-- CreateIndex
CREATE INDEX "airline_contracts_airlineCode_idx" ON "airline_contracts"("airlineCode");

-- CreateIndex
CREATE INDEX "airline_contracts_isActive_idx" ON "airline_contracts"("isActive");

-- CreateIndex
CREATE INDEX "airline_contracts_validFrom_validTo_idx" ON "airline_contracts"("validFrom", "validTo");

-- CreateIndex
CREATE UNIQUE INDEX "airline_contracts_airlineCode_validFrom_key" ON "airline_contracts"("airlineCode", "validFrom");

-- CreateIndex
CREATE INDEX "airline_commission_routes_contractId_idx" ON "airline_commission_routes"("contractId");

-- CreateIndex
CREATE INDEX "airline_commission_routes_originCodes_idx" ON "airline_commission_routes"("originCodes");

-- CreateIndex
CREATE INDEX "airline_commission_routes_destinationCodes_idx" ON "airline_commission_routes"("destinationCodes");

-- CreateIndex
CREATE INDEX "airline_commission_fare_classes_routeId_idx" ON "airline_commission_fare_classes"("routeId");

-- CreateIndex
CREATE INDEX "airline_commission_fare_classes_cabinClass_idx" ON "airline_commission_fare_classes"("cabinClass");

-- CreateIndex
CREATE INDEX "airline_commission_exclusions_airlineCode_idx" ON "airline_commission_exclusions"("airlineCode");

-- CreateIndex
CREATE INDEX "airline_commission_exclusions_exclusionType_idx" ON "airline_commission_exclusions"("exclusionType");

-- CreateIndex
CREATE INDEX "airline_commission_exclusions_isActive_idx" ON "airline_commission_exclusions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "geographic_markets_marketCode_key" ON "geographic_markets"("marketCode");

-- CreateIndex
CREATE UNIQUE INDEX "lcc_airlines_airlineCode_key" ON "lcc_airlines"("airlineCode");

-- CreateIndex
CREATE INDEX "routing_decisions_airlineCode_idx" ON "routing_decisions"("airlineCode");

-- CreateIndex
CREATE INDEX "routing_decisions_routingChannel_idx" ON "routing_decisions"("routingChannel");

-- CreateIndex
CREATE INDEX "routing_decisions_createdAt_idx" ON "routing_decisions"("createdAt");

-- CreateIndex
CREATE INDEX "routing_decisions_searchId_idx" ON "routing_decisions"("searchId");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "system_configs_key_idx" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "promo_code_usages_promoCodeId_idx" ON "promo_code_usages"("promoCodeId");

-- CreateIndex
CREATE INDEX "promo_code_usages_userId_idx" ON "promo_code_usages"("userId");

-- CreateIndex
CREATE INDEX "promo_code_usages_usedAt_idx" ON "promo_code_usages"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers"("status");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_subscribedAt_idx" ON "newsletter_subscribers"("subscribedAt");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_source_idx" ON "newsletter_subscribers"("source");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_verificationToken_idx" ON "newsletter_subscribers"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "airline_profiles_iataCode_key" ON "airline_profiles"("iataCode");

-- CreateIndex
CREATE INDEX "airline_profiles_iataCode_idx" ON "airline_profiles"("iataCode");

-- CreateIndex
CREATE INDEX "airline_profiles_alliance_idx" ON "airline_profiles"("alliance");

-- CreateIndex
CREATE INDEX "airline_profiles_country_idx" ON "airline_profiles"("country");

-- CreateIndex
CREATE INDEX "airline_profiles_airlineType_idx" ON "airline_profiles"("airlineType");

-- CreateIndex
CREATE INDEX "airline_fleet_airlineId_idx" ON "airline_fleet"("airlineId");

-- CreateIndex
CREATE UNIQUE INDEX "airline_fleet_airlineId_aircraftType_key" ON "airline_fleet"("airlineId", "aircraftType");

-- CreateIndex
CREATE INDEX "airline_routes_airlineId_idx" ON "airline_routes"("airlineId");

-- CreateIndex
CREATE INDEX "airline_routes_originIata_idx" ON "airline_routes"("originIata");

-- CreateIndex
CREATE INDEX "airline_routes_destinationIata_idx" ON "airline_routes"("destinationIata");

-- CreateIndex
CREATE UNIQUE INDEX "airline_routes_airlineId_originIata_destinationIata_key" ON "airline_routes"("airlineId", "originIata", "destinationIata");

-- CreateIndex
CREATE INDEX "airline_operational_stats_airlineId_idx" ON "airline_operational_stats"("airlineId");

-- CreateIndex
CREATE INDEX "airline_operational_stats_periodStart_idx" ON "airline_operational_stats"("periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "airline_operational_stats_airlineId_periodType_periodStart_key" ON "airline_operational_stats"("airlineId", "periodType", "periodStart");

-- CreateIndex
CREATE INDEX "airline_knowledge_entries_airlineId_idx" ON "airline_knowledge_entries"("airlineId");

-- CreateIndex
CREATE INDEX "airline_knowledge_entries_category_idx" ON "airline_knowledge_entries"("category");

-- CreateIndex
CREATE INDEX "airline_data_sync_logs_source_idx" ON "airline_data_sync_logs"("source");

-- CreateIndex
CREATE INDEX "airline_data_sync_logs_createdAt_idx" ON "airline_data_sync_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "aircraft_iataCode_key" ON "aircraft"("iataCode");

-- CreateIndex
CREATE UNIQUE INDEX "aircraft_icaoCode_key" ON "aircraft"("icaoCode");

-- CreateIndex
CREATE INDEX "aircraft_manufacturer_idx" ON "aircraft"("manufacturer");

-- CreateIndex
CREATE INDEX "aircraft_category_idx" ON "aircraft"("category");

-- CreateIndex
CREATE INDEX "aircraft_seat_maps_aircraftId_idx" ON "aircraft_seat_maps"("aircraftId");

-- CreateIndex
CREATE INDEX "aircraft_seat_maps_airlineCode_idx" ON "aircraft_seat_maps"("airlineCode");

-- CreateIndex
CREATE UNIQUE INDEX "aircraft_seat_maps_aircraftId_airlineCode_configName_key" ON "aircraft_seat_maps"("aircraftId", "airlineCode", "configName");

-- CreateIndex
CREATE UNIQUE INDEX "airports_iataCode_key" ON "airports"("iataCode");

-- CreateIndex
CREATE UNIQUE INDEX "airports_icaoCode_key" ON "airports"("icaoCode");

-- CreateIndex
CREATE INDEX "airports_city_idx" ON "airports"("city");

-- CreateIndex
CREATE INDEX "airports_country_idx" ON "airports"("country");

-- CreateIndex
CREATE INDEX "airports_airportType_idx" ON "airports"("airportType");

-- CreateIndex
CREATE INDEX "fare_classes_airlineCode_idx" ON "fare_classes"("airlineCode");

-- CreateIndex
CREATE INDEX "fare_classes_cabinClass_idx" ON "fare_classes"("cabinClass");

-- CreateIndex
CREATE UNIQUE INDEX "fare_classes_code_airlineCode_key" ON "fare_classes"("code", "airlineCode");

-- CreateIndex
CREATE INDEX "flight_records_airlineCode_idx" ON "flight_records"("airlineCode");

-- CreateIndex
CREATE INDEX "flight_records_flightNumber_idx" ON "flight_records"("flightNumber");

-- CreateIndex
CREATE INDEX "flight_records_originIata_idx" ON "flight_records"("originIata");

-- CreateIndex
CREATE INDEX "flight_records_destinationIata_idx" ON "flight_records"("destinationIata");

-- CreateIndex
CREATE INDEX "flight_records_departureDate_idx" ON "flight_records"("departureDate");

-- CreateIndex
CREATE INDEX "flight_records_observedAt_idx" ON "flight_records"("observedAt");

-- CreateIndex
CREATE UNIQUE INDEX "route_statistics_routeKey_key" ON "route_statistics"("routeKey");

-- CreateIndex
CREATE INDEX "route_statistics_originIata_idx" ON "route_statistics"("originIata");

-- CreateIndex
CREATE INDEX "route_statistics_destinationIata_idx" ON "route_statistics"("destinationIata");

-- CreateIndex
CREATE INDEX "price_trends_originIata_destinationIata_idx" ON "price_trends"("originIata", "destinationIata");

-- CreateIndex
CREATE INDEX "price_trends_searchDate_idx" ON "price_trends"("searchDate");

-- CreateIndex
CREATE INDEX "price_trends_departureDate_idx" ON "price_trends"("departureDate");

-- CreateIndex
CREATE INDEX "price_trends_daysInAdvance_idx" ON "price_trends"("daysInAdvance");

-- CreateIndex
CREATE INDEX "aviation_data_sync_logs_entityType_idx" ON "aviation_data_sync_logs"("entityType");

-- CreateIndex
CREATE INDEX "aviation_data_sync_logs_source_idx" ON "aviation_data_sync_logs"("source");

-- CreateIndex
CREATE INDEX "aviation_data_sync_logs_createdAt_idx" ON "aviation_data_sync_logs"("createdAt");

-- CreateIndex
CREATE INDEX "email_logs_recipientEmail_idx" ON "email_logs"("recipientEmail");

-- CreateIndex
CREATE INDEX "email_logs_userId_idx" ON "email_logs"("userId");

-- CreateIndex
CREATE INDEX "email_logs_sentAt_idx" ON "email_logs"("sentAt");

-- CreateIndex
CREATE INDEX "email_logs_emailType_idx" ON "email_logs"("emailType");

-- CreateIndex
CREATE INDEX "email_decision_logs_email_idx" ON "email_decision_logs"("email");

-- CreateIndex
CREATE INDEX "email_decision_logs_createdAt_idx" ON "email_decision_logs"("createdAt");

-- CreateIndex
CREATE INDEX "scheduled_emails_scheduledFor_idx" ON "scheduled_emails"("scheduledFor");

-- CreateIndex
CREATE INDEX "scheduled_emails_status_idx" ON "scheduled_emails"("status");

-- CreateIndex
CREATE INDEX "campaign_logs_campaignId_idx" ON "campaign_logs"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_logs_userId_idx" ON "campaign_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_suppressions_email_key" ON "email_suppressions"("email");

-- CreateIndex
CREATE INDEX "content_queue_status_scheduledAt_idx" ON "content_queue"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "content_queue_platforms_idx" ON "content_queue"("platforms");

-- CreateIndex
CREATE INDEX "content_queue_productType_productId_idx" ON "content_queue"("productType", "productId");

-- CreateIndex
CREATE INDEX "social_post_logs_contentQueueId_idx" ON "social_post_logs"("contentQueueId");

-- CreateIndex
CREATE INDEX "social_post_logs_platform_status_idx" ON "social_post_logs"("platform", "status");

-- CreateIndex
CREATE INDEX "social_post_logs_postedAt_idx" ON "social_post_logs"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "social_post_logs_platform_platformPostId_key" ON "social_post_logs"("platform", "platformPostId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recent_searches" ADD CONSTRAINT "recent_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_sessions" ADD CONSTRAINT "ai_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frequent_travelers" ADD CONSTRAINT "frequent_travelers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_documents" ADD CONSTRAINT "travel_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_points_transactions" ADD CONSTRAINT "referral_points_transactions_earnerId_fkey" FOREIGN KEY ("earnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_points_transactions" ADD CONSTRAINT "referral_points_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_groups" ADD CONSTRAINT "trip_groups_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_tripGroupId_fkey" FOREIGN KEY ("tripGroupId") REFERENCES "trip_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tripmatch_user_profiles" ADD CONSTRAINT "tripmatch_user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_posts" ADD CONSTRAINT "trip_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "trip_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "trip_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_messages" ADD CONSTRAINT "trip_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_reviews" ADD CONSTRAINT "trip_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_reviews" ADD CONSTRAINT "trip_reviews_reviewedUserId_fkey" FOREIGN KEY ("reviewedUserId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveler_matches" ADD CONSTRAINT "traveler_matches_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveler_matches" ADD CONSTRAINT "traveler_matches_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "tripmatch_user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_participations" ADD CONSTRAINT "experiment_participations_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_reviews" ADD CONSTRAINT "hotel_reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "hotel_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "affiliate_referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flat_fee_campaigns" ADD CONSTRAINT "flat_fee_campaigns_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_agents" ADD CONSTRAINT "travel_agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_clients" ADD CONSTRAINT "agent_clients_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_clients" ADD CONSTRAINT "agent_clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_quotes" ADD CONSTRAINT "agent_quotes_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_quotes" ADD CONSTRAINT "agent_quotes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "agent_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_bookings" ADD CONSTRAINT "agent_bookings_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_bookings" ADD CONSTRAINT "agent_bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "agent_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_bookings" ADD CONSTRAINT "agent_bookings_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "agent_quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "agent_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "agent_payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_payouts" ADD CONSTRAINT "agent_payouts_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_team_members" ADD CONSTRAINT "agent_team_members_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_team_members" ADD CONSTRAINT "agent_team_members_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_client_notes" ADD CONSTRAINT "agent_client_notes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "agent_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_client_documents" ADD CONSTRAINT "agent_client_documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "agent_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_client_documents" ADD CONSTRAINT "agent_client_documents_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "agent_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_itinerary_templates" ADD CONSTRAINT "agent_itinerary_templates_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_suppliers" ADD CONSTRAINT "agent_suppliers_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_products" ADD CONSTRAINT "agent_products_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_products" ADD CONSTRAINT "agent_products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "agent_suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_activity_logs" ADD CONSTRAINT "agent_activity_logs_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "world_cup_matches" ADD CONSTRAINT "world_cup_matches_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "world_cup_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "world_cup_matches" ADD CONSTRAINT "world_cup_matches_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "world_cup_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "world_cup_matches" ADD CONSTRAINT "world_cup_matches_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "world_cup_stadiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "world_cup_tickets" ADD CONSTRAINT "world_cup_tickets_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "world_cup_matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "world_cup_tickets" ADD CONSTRAINT "world_cup_tickets_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "world_cup_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "world_cup_bookings" ADD CONSTRAINT "world_cup_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "world_cup_bookings" ADD CONSTRAINT "world_cup_bookings_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "world_cup_matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "world_cup_bookings" ADD CONSTRAINT "world_cup_bookings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "world_cup_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airline_commission_routes" ADD CONSTRAINT "airline_commission_routes_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "airline_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airline_commission_fare_classes" ADD CONSTRAINT "airline_commission_fare_classes_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "airline_commission_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airline_fleet" ADD CONSTRAINT "airline_fleet_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "airline_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airline_routes" ADD CONSTRAINT "airline_routes_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "airline_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airline_operational_stats" ADD CONSTRAINT "airline_operational_stats_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "airline_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airline_knowledge_entries" ADD CONSTRAINT "airline_knowledge_entries_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "airline_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aircraft_seat_maps" ADD CONSTRAINT "aircraft_seat_maps_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "aircraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_records" ADD CONSTRAINT "flight_records_originId_fkey" FOREIGN KEY ("originId") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_records" ADD CONSTRAINT "flight_records_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_records" ADD CONSTRAINT "flight_records_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "aircraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_post_logs" ADD CONSTRAINT "social_post_logs_contentQueueId_fkey" FOREIGN KEY ("contentQueueId") REFERENCES "content_queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

