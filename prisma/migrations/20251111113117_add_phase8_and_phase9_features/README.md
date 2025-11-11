# Phase 8 & Phase 9 Database Migration

**Migration ID:** `20251111113117_add_phase8_and_phase9_features`
**Created:** November 11, 2025
**Status:** Ready for deployment

## Overview

This migration adds **17 new database tables** to support:
- **Phase 8**: Analytics, Business Intelligence, ML/AI Features, A/B Testing
- **Phase 9**: Admin Dashboard, CMS, Audit System

## New Tables Summary

### Phase 8: Analytics & Business Intelligence (10 tables)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `analytics_events` | Raw event tracking | Page views, searches, clicks, conversions |
| `metric_snapshots` | Pre-aggregated metrics | Dashboard performance optimization |
| `price_predictions` | ML price forecasts | Confidence scores, recommendations |
| `ml_models` | Model versioning | Training metrics, deployment tracking |
| `feature_flags` | A/B testing framework | Rollout percentage, variant management |
| `experiment_participations` | User assignments | Conversion tracking per variant |
| `performance_metrics` | Web Vitals tracking | LCP, CLS, FCP, TTFB, INP |
| `error_logs` | Error monitoring | Fingerprinting, grouping, resolution |
| `conversion_funnels` | Funnel analytics | Stage tracking, abandonment analysis |
| `user_cohorts` | Retention analysis | Day 1/7/30 retention, LTV tracking |

### Phase 9: Admin Dashboard & CMS (7 tables)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `admin_users` | RBAC system | Roles, custom permissions |
| `audit_logs` | Action tracking | Complete admin activity trail |
| `deals` | Travel deals CMS | Pricing, featured deals, analytics |
| `destinations` | Destination content | SEO, trending, travel info |
| `email_templates` | Email system | Template versioning, variables |
| `health_checks` | System monitoring | Service status, response times |
| `search_suggestions` | Autocomplete cache | Popularity-based ranking |

## Database Impact

### Schema Changes
- **New tables**: 17
- **New indexes**: 52 (41 regular + 11 unique)
- **Foreign keys**: 2 new constraints
- **Estimated size**: ~10KB empty, scales with usage

### Performance Considerations
- All high-frequency queries have covering indexes
- JSONB columns used for flexible data structures
- Timestamps indexed for time-range queries
- Compound indexes for common filter combinations

## How to Apply This Migration

### Option 1: Automatic via Vercel Deployment (Recommended)

When you push to `main`, Vercel will automatically:
1. Detect the new migration
2. Apply it during the build process
3. Update the `_prisma_migrations` table

**No manual action needed!** ✅

### Option 2: Manual Application (Production Database)

If you need to apply manually:

```bash
# Using Vercel CLI (from project root)
vercel env pull .env.production
npx prisma migrate deploy

# Or using direct connection
POSTGRES_URL="your_production_url" npx prisma migrate deploy
```

### Option 3: Development/Testing

For local development with a test database:

```bash
# Make sure your .env.local has a valid POSTGRES_URL
npx prisma migrate dev

# Or apply without prompts
npx prisma migrate deploy
```

## Verification Steps

After migration, verify tables were created:

```sql
-- Check all new tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'analytics_events', 'metric_snapshots', 'price_predictions',
  'ml_models', 'feature_flags', 'experiment_participations',
  'performance_metrics', 'error_logs', 'conversion_funnels',
  'user_cohorts', 'admin_users', 'audit_logs', 'deals',
  'destinations', 'email_templates', 'health_checks', 'search_suggestions'
);

-- Should return 17 rows
```

## Rollback Plan

If issues occur, rollback using:

```sql
-- Drop Phase 9 tables
DROP TABLE IF EXISTS "search_suggestions" CASCADE;
DROP TABLE IF EXISTS "health_checks" CASCADE;
DROP TABLE IF EXISTS "email_templates" CASCADE;
DROP TABLE IF EXISTS "destinations" CASCADE;
DROP TABLE IF EXISTS "deals" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "admin_users" CASCADE;

-- Drop Phase 8 tables
DROP TABLE IF EXISTS "user_cohorts" CASCADE;
DROP TABLE IF EXISTS "conversion_funnels" CASCADE;
DROP TABLE IF EXISTS "error_logs" CASCADE;
DROP TABLE IF EXISTS "performance_metrics" CASCADE;
DROP TABLE IF EXISTS "experiment_participations" CASCADE;
DROP TABLE IF EXISTS "feature_flags" CASCADE;
DROP TABLE IF EXISTS "ml_models" CASCADE;
DROP TABLE IF EXISTS "price_predictions" CASCADE;
DROP TABLE IF EXISTS "metric_snapshots" CASCADE;
DROP TABLE IF EXISTS "analytics_events" CASCADE;

-- Remove migration record
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20251111113117_add_phase8_and_phase9_features';
```

## Post-Migration Setup

### 1. Create Initial Admin User

```typescript
// Run this script or use Prisma Studio
import { prisma } from '@/lib/prisma'

await prisma.adminUser.create({
  data: {
    userId: 'your_user_id_here', // Get from users table
    role: 'super_admin',
    permissions: null // Null = all permissions
  }
})
```

### 2. Initialize Feature Flags

```typescript
await prisma.featureFlag.create({
  data: {
    key: 'ml_price_prediction',
    name: 'ML Price Prediction',
    description: 'AI-powered flight price predictions',
    enabled: false,
    rolloutPercentage: 0,
    variants: [
      { id: 'control', weight: 100 }
    ],
    isExperiment: false
  }
})
```

### 3. Verify Analytics Pipeline

```bash
# Test event tracking endpoint
curl -X POST https://your-domain.com/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "eventType": "page_view",
    "eventData": {"url": "/", "referrer": null}
  }'
```

## Dependencies

### Required Environment Variables
```env
POSTGRES_URL=postgresql://...  # Production database URL
NEXTAUTH_SECRET=...            # For admin authentication
```

### Optional but Recommended
```env
UPSTASH_REDIS_REST_URL=...     # For caching
UPSTASH_REDIS_REST_TOKEN=...   # Analytics performance
```

## Breaking Changes

**None.** This migration is **additive only**:
- ✅ No existing tables modified
- ✅ No columns removed or renamed
- ✅ No data transformations required
- ✅ Backward compatible with Phase 7 code

## Testing Checklist

Before considering migration complete:

- [ ] All 17 tables created successfully
- [ ] Indexes created (check with `\di` in psql)
- [ ] Foreign key constraints active
- [ ] Unique constraints working (try inserting duplicates)
- [ ] Admin user creation works
- [ ] Feature flag system operational
- [ ] Analytics events being recorded
- [ ] Performance metrics collecting
- [ ] Error tracking functioning

## Estimated Downtime

**Zero downtime.** Migration is non-blocking:
- New tables don't affect existing queries
- No locks on existing tables
- Takes ~2-5 seconds to execute

## Support

If migration fails:
1. Check database logs for specific errors
2. Verify POSTGRES_URL is correct
3. Ensure database user has CREATE TABLE permission
4. Check disk space on database server
5. Review migration SQL for syntax errors

## Next Steps After Migration

1. **Initialize Admin System**
   - Create first super admin user
   - Set up RBAC permissions
   - Test admin API endpoints

2. **Configure Analytics**
   - Enable event tracking in production
   - Set up metric aggregation cron jobs
   - Create admin analytics dashboard

3. **Enable Phase 8 Features**
   - Activate price prediction ML model
   - Start A/B experiments
   - Monitor performance metrics

4. **Build Phase 9 UI**
   - Admin dashboard components
   - CMS for deals and destinations
   - Analytics visualization

---

**Generated:** 2025-11-11
**Migration File:** `migration.sql` (436 lines)
**Schema Version:** Phase 8 + 9
**Prisma Version:** 6.18.0
