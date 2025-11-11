-- ==========================================
-- Phase 8: Analytics & Business Intelligence
-- ==========================================

-- Analytics Events - Raw event tracking
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

-- Aggregated Metrics - Pre-calculated for dashboard performance
CREATE TABLE "metric_snapshots" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "dimensions" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granularity" TEXT NOT NULL,

    CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id")
);

-- ML Price Predictions
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

-- ML Model Metadata
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

-- Feature Flags & A/B Testing
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

-- Experiment Participation Tracking
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

-- Performance Metrics (Web Vitals)
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

-- Error Tracking
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

-- Conversion Funnel Tracking
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

-- User Cohorts for Retention Analysis
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

-- ==========================================
-- Phase 9: Admin Dashboard & CMS
-- ==========================================

-- Admin User Roles
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- Audit Trail for Admin Actions
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

-- Travel Deals Content
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

-- Destinations Content
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

-- Email Templates
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

-- System Health Monitoring
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

-- Search Autocomplete Cache
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

-- ==========================================
-- Create Unique Indexes
-- ==========================================

-- Phase 8 Unique Indexes
CREATE UNIQUE INDEX "metric_snapshots_metricName_granularity_timestamp_key" ON "metric_snapshots"("metricName", "granularity", "timestamp");
CREATE UNIQUE INDEX "ml_models_name_key" ON "ml_models"("name");
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");
CREATE UNIQUE INDEX "experiment_participations_flagId_userId_key" ON "experiment_participations"("flagId", "userId");
CREATE UNIQUE INDEX "experiment_participations_flagId_sessionId_key" ON "experiment_participations"("flagId", "sessionId");
CREATE UNIQUE INDEX "user_cohorts_userId_key" ON "user_cohorts"("userId");

-- Phase 9 Unique Indexes
CREATE UNIQUE INDEX "admin_users_userId_key" ON "admin_users"("userId");
CREATE UNIQUE INDEX "deals_slug_key" ON "deals"("slug");
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");
CREATE UNIQUE INDEX "destinations_airportCode_key" ON "destinations"("airportCode");
CREATE UNIQUE INDEX "email_templates_name_key" ON "email_templates"("name");
CREATE UNIQUE INDEX "email_templates_key_key" ON "email_templates"("key");
CREATE UNIQUE INDEX "search_suggestions_query_key" ON "search_suggestions"("query");

-- ==========================================
-- Create Regular Indexes for Performance
-- ==========================================

-- Phase 8 Indexes
CREATE INDEX "analytics_events_eventType_timestamp_idx" ON "analytics_events"("eventType", "timestamp");
CREATE INDEX "analytics_events_userId_timestamp_idx" ON "analytics_events"("userId", "timestamp");
CREATE INDEX "analytics_events_sessionId_timestamp_idx" ON "analytics_events"("sessionId", "timestamp");
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

CREATE INDEX "metric_snapshots_metricName_timestamp_idx" ON "metric_snapshots"("metricName", "timestamp");
CREATE INDEX "metric_snapshots_timestamp_granularity_idx" ON "metric_snapshots"("timestamp", "granularity");

CREATE INDEX "price_predictions_origin_destination_departDate_idx" ON "price_predictions"("origin", "destination", "departDate");
CREATE INDEX "price_predictions_createdAt_idx" ON "price_predictions"("createdAt");

CREATE INDEX "ml_models_name_version_idx" ON "ml_models"("name", "version");
CREATE INDEX "ml_models_active_idx" ON "ml_models"("active");

CREATE INDEX "feature_flags_key_idx" ON "feature_flags"("key");
CREATE INDEX "feature_flags_enabled_idx" ON "feature_flags"("enabled");
CREATE INDEX "feature_flags_isExperiment_experimentStatus_idx" ON "feature_flags"("isExperiment", "experimentStatus");

CREATE INDEX "experiment_participations_flagId_variant_idx" ON "experiment_participations"("flagId", "variant");
CREATE INDEX "experiment_participations_flagId_converted_idx" ON "experiment_participations"("flagId", "converted");

CREATE INDEX "performance_metrics_metricName_timestamp_idx" ON "performance_metrics"("metricName", "timestamp");
CREATE INDEX "performance_metrics_url_metricName_idx" ON "performance_metrics"("url", "metricName");
CREATE INDEX "performance_metrics_rating_metricName_idx" ON "performance_metrics"("rating", "metricName");
CREATE INDEX "performance_metrics_timestamp_idx" ON "performance_metrics"("timestamp");

CREATE INDEX "error_logs_severity_resolved_timestamp_idx" ON "error_logs"("severity", "resolved", "timestamp");
CREATE INDEX "error_logs_fingerprint_timestamp_idx" ON "error_logs"("fingerprint", "timestamp");
CREATE INDEX "error_logs_userId_idx" ON "error_logs"("userId");
CREATE INDEX "error_logs_timestamp_idx" ON "error_logs"("timestamp");

CREATE INDEX "conversion_funnels_sessionId_stage_idx" ON "conversion_funnels"("sessionId", "stage");
CREATE INDEX "conversion_funnels_stage_action_timestamp_idx" ON "conversion_funnels"("stage", "action", "timestamp");
CREATE INDEX "conversion_funnels_timestamp_idx" ON "conversion_funnels"("timestamp");

CREATE INDEX "user_cohorts_cohortDate_idx" ON "user_cohorts"("cohortDate");
CREATE INDEX "user_cohorts_cohortWeek_idx" ON "user_cohorts"("cohortWeek");
CREATE INDEX "user_cohorts_cohortMonth_idx" ON "user_cohorts"("cohortMonth");

-- Phase 9 Indexes
CREATE INDEX "admin_users_role_idx" ON "admin_users"("role");

CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp");
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
CREATE INDEX "audit_logs_action_resource_idx" ON "audit_logs"("action", "resource");

CREATE INDEX "deals_slug_idx" ON "deals"("slug");
CREATE INDEX "deals_active_featured_idx" ON "deals"("active", "featured");
CREATE INDEX "deals_expiresAt_idx" ON "deals"("expiresAt");
CREATE INDEX "deals_category_idx" ON "deals"("category");

CREATE INDEX "destinations_slug_idx" ON "destinations"("slug");
CREATE INDEX "destinations_airportCode_idx" ON "destinations"("airportCode");
CREATE INDEX "destinations_published_featured_idx" ON "destinations"("published", "featured");
CREATE INDEX "destinations_trending_idx" ON "destinations"("trending");

CREATE INDEX "email_templates_key_idx" ON "email_templates"("key");
CREATE INDEX "email_templates_active_idx" ON "email_templates"("active");

CREATE INDEX "health_checks_service_timestamp_idx" ON "health_checks"("service", "timestamp");
CREATE INDEX "health_checks_status_timestamp_idx" ON "health_checks"("status", "timestamp");

CREATE INDEX "search_suggestions_query_idx" ON "search_suggestions"("query");
CREATE INDEX "search_suggestions_type_popularity_idx" ON "search_suggestions"("type", "popularity");

-- ==========================================
-- Add Foreign Key Constraints
-- ==========================================

-- Phase 8 Foreign Keys
ALTER TABLE "experiment_participations" ADD CONSTRAINT "experiment_participations_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Phase 9 Foreign Keys
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
