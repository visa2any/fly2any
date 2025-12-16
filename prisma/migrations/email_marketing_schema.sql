-- Email Marketing System Schema
-- Run: npx prisma db execute --file prisma/migrations/email_marketing_schema.sql

-- Email Log - Track all sent emails
CREATE TABLE IF NOT EXISTS "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "recipientEmail" TEXT NOT NULL,
    "userId" TEXT,
    "emailType" TEXT NOT NULL, -- transactional, marketing, alert, recovery
    "template" TEXT NOT NULL,
    "event" TEXT, -- trigger event
    "subject" TEXT,
    "status" TEXT DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, complained, failed
    "sentAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "opens" INTEGER DEFAULT 0,
    "clicks" INTEGER DEFAULT 0,
    "bounceType" TEXT,
    "bounceReason" TEXT,
    "failureReason" TEXT,
    "aiDecision" TEXT,
    "clientInfo" TEXT,
    "geolocation" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "EmailLog_recipientEmail_idx" ON "EmailLog"("recipientEmail");
CREATE INDEX IF NOT EXISTS "EmailLog_userId_idx" ON "EmailLog"("userId");
CREATE INDEX IF NOT EXISTS "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");
CREATE INDEX IF NOT EXISTS "EmailLog_emailType_idx" ON "EmailLog"("emailType");

-- Email Decision Log - AI decisions
CREATE TABLE IF NOT EXISTS "EmailDecisionLog" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "decision" TEXT NOT NULL, -- send, delay, skip
    "reason" TEXT NOT NULL,
    "confidence" DECIMAL(3,2),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "EmailDecisionLog_email_idx" ON "EmailDecisionLog"("email");
CREATE INDEX IF NOT EXISTS "EmailDecisionLog_createdAt_idx" ON "EmailDecisionLog"("createdAt");

-- Scheduled Emails
CREATE TABLE IF NOT EXISTS "ScheduledEmail" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" TEXT DEFAULT 'pending', -- pending, sent, cancelled
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ScheduledEmail_scheduledFor_idx" ON "ScheduledEmail"("scheduledFor");
CREATE INDEX IF NOT EXISTS "ScheduledEmail_status_idx" ON "ScheduledEmail"("status");

-- Campaign Log - Track campaign flows
CREATE TABLE IF NOT EXISTS "CampaignLog" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "event" TEXT NOT NULL, -- started, email_sent, completed, converted
    "step" INTEGER,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "CampaignLog_campaignId_idx" ON "CampaignLog"("campaignId");
CREATE INDEX IF NOT EXISTS "CampaignLog_userId_idx" ON "CampaignLog"("userId");

-- Email Suppression List
CREATE TABLE IF NOT EXISTS "EmailSuppression" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "reason" TEXT NOT NULL, -- hard_bounce, complaint, unsubscribed
    "details" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmailSuppression_email_key" ON "EmailSuppression"("email");

-- Update Subscriber table if needed
ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "bounceCount" INTEGER DEFAULT 0;
ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "lastBounceAt" TIMESTAMP(3);
ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "complainedAt" TIMESTAMP(3);
ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "unsubscribedAt" TIMESTAMP(3);
