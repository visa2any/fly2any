-- ================================================
-- NOTIFICATION PERFORMANCE OPTIMIZATION
-- ================================================
-- Problem: Notification queries taking 13+ seconds
-- Solution: Add composite indexes for common query patterns
-- Expected Impact: 13s → <500ms (96% improvement)
-- ================================================

-- Index 1: User + Read status + CreatedAt (most common query)
-- Used by: GET /api/notifications with read filter
CREATE INDEX IF NOT EXISTS "idx_notifications_user_read_created"
  ON "Notification"("userId", "read", "createdAt" DESC);

-- Index 2: User + Type + CreatedAt
-- Used by: GET /api/notifications with type filter
CREATE INDEX IF NOT EXISTS "idx_notifications_user_type_created"
  ON "Notification"("userId", "type", "createdAt" DESC);

-- Index 3: User + Priority + CreatedAt
-- Used by: GET /api/notifications with priority filter
CREATE INDEX IF NOT EXISTS "idx_notifications_user_priority_created"
  ON "Notification"("userId", "priority", "createdAt" DESC);

-- Index 4: Unread count optimization
-- Used by: Notification bell badge count query
CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread"
  ON "Notification"("userId", "read") WHERE "read" = false;

-- Index 5: User + CreatedAt (default sort)
-- Used by: GET /api/notifications without filters
CREATE INDEX IF NOT EXISTS "idx_notifications_user_created"
  ON "Notification"("userId", "createdAt" DESC);

-- ================================================
-- Performance Metrics (Expected):
-- - Query time: 13s → 500ms (96% faster)
-- - Cache hit rate: 0% → 80%+ (with Redis fix)
-- - API response: 13s → 500ms (96% faster)
-- ================================================
