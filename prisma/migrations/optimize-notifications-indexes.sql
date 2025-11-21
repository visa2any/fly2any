-- Performance optimization for notifications table
-- Adds composite indexes for common query patterns

-- Index for user-specific queries (most common pattern)
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx"
ON "notifications"("userId", "createdAt" DESC);

-- Index for filtered queries (type + priority filters)
CREATE INDEX IF NOT EXISTS "notifications_userId_type_priority_idx"
ON "notifications"("userId", "type", "priority");

-- Index for date range queries
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_read_idx"
ON "notifications"("userId", "createdAt" DESC, "read");

-- Analyze table to update query planner statistics
ANALYZE "notifications";
