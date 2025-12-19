-- ContentQueue table for social marketing automation
CREATE TABLE IF NOT EXISTS content_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  "imageUrl" TEXT,
  "imagePrompt" TEXT,
  link TEXT,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  "productType" TEXT,
  "productId" TEXT,
  "productData" JSONB,
  "scheduledAt" TIMESTAMP NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  status TEXT NOT NULL DEFAULT 'pending',
  priority INT NOT NULL DEFAULT 0,
  "retryCount" INT NOT NULL DEFAULT 0,
  "maxRetries" INT NOT NULL DEFAULT 3,
  error TEXT,
  "postedAt" TIMESTAMP,
  results JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdBy" TEXT
);

CREATE INDEX IF NOT EXISTS idx_content_queue_status_scheduled ON content_queue(status, "scheduledAt");
CREATE INDEX IF NOT EXISTS idx_content_queue_platforms ON content_queue USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_content_queue_product ON content_queue("productType", "productId");

-- SocialPostLog table for analytics
CREATE TABLE IF NOT EXISTS social_post_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "contentQueueId" TEXT REFERENCES content_queue(id),
  platform TEXT NOT NULL,
  "platformPostId" TEXT,
  "platformUrl" TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  content TEXT NOT NULL,
  "imageUrl" TEXT,
  link TEXT,
  impressions INT NOT NULL DEFAULT 0,
  engagements INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  shares INT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  error TEXT,
  metadata JSONB,
  "postedAt" TIMESTAMP,
  "lastSyncAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_post_logs_platform_id ON social_post_logs(platform, "platformPostId") WHERE "platformPostId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_post_logs_queue ON social_post_logs("contentQueueId");
CREATE INDEX IF NOT EXISTS idx_social_post_logs_platform_status ON social_post_logs(platform, status);
CREATE INDEX IF NOT EXISTS idx_social_post_logs_posted ON social_post_logs("postedAt");
