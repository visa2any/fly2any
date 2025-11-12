-- Fix migration to create all missing tables from Phase 7, 8, and 9
-- This migration uses CREATE TABLE IF NOT EXISTS to safely create only missing tables

-- ==========================================
-- Phase 7: Missing Tables
-- ==========================================

-- CreateTable (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS "recent_searches" (
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
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recent_searches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_activities" (
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

CREATE TABLE IF NOT EXISTS "ai_conversations" (
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

CREATE TABLE IF NOT EXISTS "ai_messages" (
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

CREATE TABLE IF NOT EXISTS "user_sessions" (
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

CREATE TABLE IF NOT EXISTS "login_history" (
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

CREATE TABLE IF NOT EXISTS "price_history" (
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

CREATE TABLE IF NOT EXISTS "price_monitor_logs" (
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

CREATE TABLE IF NOT EXISTS "notifications" (
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

-- ==========================================
-- Phase 8: Missing Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS "analytics_events" (
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

CREATE TABLE IF NOT EXISTS "metric_snapshots" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "dimensions" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granularity" TEXT NOT NULL,

    CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "price_predictions" (
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

CREATE TABLE IF NOT EXISTS "ml_models" (
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

CREATE TABLE IF NOT EXISTS "feature_flags" (
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

CREATE TABLE IF NOT EXISTS "experiment_participations" (
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

CREATE TABLE IF NOT EXISTS "error_logs" (
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

CREATE TABLE IF NOT EXISTS "conversion_funnels" (
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

CREATE TABLE IF NOT EXISTS "user_cohorts" (
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

-- ==========================================
-- Phase 9: Missing Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS "deals" (
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

CREATE TABLE IF NOT EXISTS "destinations" (
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

CREATE TABLE IF NOT EXISTS "health_checks" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "search_suggestions" (
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

-- ==========================================
-- Create Indexes (IF NOT EXISTS for existing)
-- ==========================================

-- Phase 7 Indexes
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "recent_searches_userId_viewedAt_idx" ON "recent_searches"("userId", "viewedAt");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "user_activities_userId_createdAt_idx" ON "user_activities"("userId", "createdAt");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "user_activities_eventType_createdAt_idx" ON "user_activities"("eventType", "createdAt");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "ai_conversations_sessionId_key" ON "ai_conversations"("sessionId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ai_conversations_userId_idx" ON "ai_conversations"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ai_conversations_sessionId_idx" ON "ai_conversations"("sessionId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ai_conversations_status_idx" ON "ai_conversations"("status");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ai_conversations_createdAt_idx" ON "ai_conversations"("createdAt");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ai_messages_conversationId_idx" ON "ai_messages"("conversationId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ai_messages_conversationId_timestamp_idx" ON "ai_messages"("conversationId", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "user_sessions_token_key" ON "user_sessions"("token");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "user_sessions_userId_idx" ON "user_sessions"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "user_sessions_userId_lastActive_idx" ON "user_sessions"("userId", "lastActive");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "login_history_userId_timestamp_idx" ON "login_history"("userId", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "price_history_origin_destination_departDate_idx" ON "price_history"("origin", "destination", "departDate");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "price_history_timestamp_idx" ON "price_history"("timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "price_monitor_logs_executionTime_idx" ON "price_monitor_logs"("executionTime");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "notifications_userId_read_idx" ON "notifications"("userId", "read");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "notifications_createdAt_idx" ON "notifications"("createdAt");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Phase 8 Indexes
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "analytics_events_eventType_timestamp_idx" ON "analytics_events"("eventType", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "analytics_events_userId_timestamp_idx" ON "analytics_events"("userId", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "analytics_events_sessionId_timestamp_idx" ON "analytics_events"("sessionId", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "metric_snapshots_metricName_granularity_timestamp_key" ON "metric_snapshots"("metricName", "granularity", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "metric_snapshots_metricName_timestamp_idx" ON "metric_snapshots"("metricName", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "metric_snapshots_timestamp_granularity_idx" ON "metric_snapshots"("timestamp", "granularity");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "price_predictions_origin_destination_departDate_idx" ON "price_predictions"("origin", "destination", "departDate");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "price_predictions_createdAt_idx" ON "price_predictions"("createdAt");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "ml_models_name_key" ON "ml_models"("name");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ml_models_name_version_idx" ON "ml_models"("name", "version");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ml_models_active_idx" ON "ml_models"("active");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "feature_flags_key_key" ON "feature_flags"("key");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "feature_flags_key_idx" ON "feature_flags"("key");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "feature_flags_enabled_idx" ON "feature_flags"("enabled");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "feature_flags_isExperiment_experimentStatus_idx" ON "feature_flags"("isExperiment", "experimentStatus");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "experiment_participations_flagId_userId_key" ON "experiment_participations"("flagId", "userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "experiment_participations_flagId_sessionId_key" ON "experiment_participations"("flagId", "sessionId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "experiment_participations_flagId_variant_idx" ON "experiment_participations"("flagId", "variant");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "experiment_participations_flagId_converted_idx" ON "experiment_participations"("flagId", "converted");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "error_logs_severity_resolved_timestamp_idx" ON "error_logs"("severity", "resolved", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "error_logs_fingerprint_timestamp_idx" ON "error_logs"("fingerprint", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "error_logs_userId_idx" ON "error_logs"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "error_logs_timestamp_idx" ON "error_logs"("timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "conversion_funnels_sessionId_stage_idx" ON "conversion_funnels"("sessionId", "stage");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "conversion_funnels_stage_action_timestamp_idx" ON "conversion_funnels"("stage", "action", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "conversion_funnels_timestamp_idx" ON "conversion_funnels"("timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "user_cohorts_userId_key" ON "user_cohorts"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "user_cohorts_cohortDate_idx" ON "user_cohorts"("cohortDate");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "user_cohorts_cohortWeek_idx" ON "user_cohorts"("cohortWeek");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "user_cohorts_cohortMonth_idx" ON "user_cohorts"("cohortMonth");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Phase 9 Indexes
DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "deals_slug_key" ON "deals"("slug");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "deals_slug_idx" ON "deals"("slug");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "deals_active_featured_idx" ON "deals"("active", "featured");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "deals_expiresAt_idx" ON "deals"("expiresAt");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "deals_category_idx" ON "deals"("category");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "destinations_slug_key" ON "destinations"("slug");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "destinations_airportCode_key" ON "destinations"("airportCode");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "destinations_slug_idx" ON "destinations"("slug");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "destinations_airportCode_idx" ON "destinations"("airportCode");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "destinations_published_featured_idx" ON "destinations"("published", "featured");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "destinations_trending_idx" ON "destinations"("trending");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "health_checks_service_timestamp_idx" ON "health_checks"("service", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "health_checks_status_timestamp_idx" ON "health_checks"("status", "timestamp");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "search_suggestions_query_key" ON "search_suggestions"("query");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "search_suggestions_query_idx" ON "search_suggestions"("query");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "search_suggestions_type_popularity_idx" ON "search_suggestions"("type", "popularity");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- ==========================================
-- Add Foreign Keys (IF NOT EXISTS for existing)
-- ==========================================

-- Phase 7 Foreign Keys
DO $$ BEGIN
    ALTER TABLE "recent_searches" ADD CONSTRAINT "recent_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Phase 8 Foreign Keys
DO $$ BEGIN
    ALTER TABLE "experiment_participations" ADD CONSTRAINT "experiment_participations_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
