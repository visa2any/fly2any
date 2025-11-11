# Phase 8 & 9 Migration Deployment Guide

## 🚀 Quick Start - Apply Migration to Production

The migration files are ready and committed. Follow these steps to apply them to your production database:

### Option 1: Using Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI if you haven't
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link to your project (if not already linked)
vercel link

# 4. Pull production environment variables
vercel env pull .env.production

# 5. Apply the migration to production database
npx prisma migrate deploy
```

### Option 2: Direct Database Connection

If you have direct access to your Neon database URL:

```bash
# Set the production database URL
export POSTGRES_URL="postgresql://user:pass@your-db.neon.tech/dbname?sslmode=require"

# Apply the migration
npx prisma migrate deploy
```

### Option 3: Via Neon Dashboard SQL Editor

1. Go to [Neon Dashboard](https://console.neon.tech)
2. Select your project and database
3. Open the SQL Editor
4. Copy the contents of `prisma/migrations/20251111113117_add_phase8_and_phase9_features/migration.sql`
5. Paste and execute

## ✅ Verify Migration Success

After applying the migration, verify it worked:

```bash
# Check migration status
npx prisma migrate status

# Should show:
# ✓ 20251110190400_add_phase7_features
# ✓ 20251111113117_add_phase8_and_phase9_features
```

Or query the database directly:

```sql
-- Check if new tables exist
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'analytics_events', 'metric_snapshots', 'price_predictions',
  'ml_models', 'feature_flags', 'experiment_participations',
  'performance_metrics', 'error_logs', 'conversion_funnels',
  'user_cohorts', 'admin_users', 'audit_logs', 'deals',
  'destinations', 'email_templates', 'health_checks', 'search_suggestions'
);
-- Should return: 17
```

## 📊 What This Migration Adds

### Phase 8 Tables (10 new)
- **analytics_events** - Raw event tracking
- **metric_snapshots** - Pre-aggregated dashboard metrics
- **price_predictions** - ML price forecasting
- **ml_models** - Model versioning
- **feature_flags** - A/B testing framework
- **experiment_participations** - User experiment tracking
- **performance_metrics** - Web Vitals monitoring
- **error_logs** - Error tracking with fingerprinting
- **conversion_funnels** - Funnel analysis
- **user_cohorts** - Retention tracking

### Phase 9 Tables (7 new)
- **admin_users** - RBAC system
- **audit_logs** - Admin action trail
- **deals** - Travel deals CMS
- **destinations** - Destination content
- **email_templates** - Email template system
- **health_checks** - System monitoring
- **search_suggestions** - Autocomplete cache

## 🔧 Post-Migration Setup

### 1. Create Your First Admin User

```typescript
// Run this in Prisma Studio or via script
import { prisma } from '@/lib/prisma'

// First, find your user ID
const user = await prisma.user.findUnique({
  where: { email: 'your-email@example.com' }
})

// Then create admin user
await prisma.adminUser.create({
  data: {
    userId: user.id,
    role: 'super_admin',
    permissions: null // null = all permissions
  }
})
```

Or via Prisma Studio:
```bash
npx prisma studio
# Navigate to AdminUser table
# Click "Add record"
# Fill in userId and role='super_admin'
```

### 2. Initialize Feature Flags (Optional)

```typescript
await prisma.featureFlag.createMany({
  data: [
    {
      key: 'ml_price_prediction',
      name: 'ML Price Prediction',
      enabled: false,
      rolloutPercentage: 0,
      variants: [{ id: 'control', weight: 100 }]
    },
    {
      key: 'new_search_ui',
      name: 'New Search UI',
      enabled: false,
      rolloutPercentage: 0,
      variants: [
        { id: 'control', weight: 50 },
        { id: 'variant_a', weight: 50 }
      ],
      isExperiment: true,
      experimentStatus: 'draft'
    }
  ]
})
```

### 3. Test Analytics Pipeline

```bash
# Test event tracking
curl -X POST https://your-domain.vercel.app/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "eventType": "page_view",
    "eventData": {
      "url": "/",
      "referrer": null
    }
  }'
```

### 4. Verify Admin API Access

```bash
# Test admin endpoint (requires authentication)
curl https://your-domain.vercel.app/api/admin/users \
  -H "Cookie: your-session-cookie"
```

## 🔍 Troubleshooting

### Migration Status Shows "Pending"

If `prisma migrate status` shows the migration as pending:

```bash
# Force resolve the migration
npx prisma migrate resolve --applied 20251111113117_add_phase8_and_phase9_features
```

### Database Connection Errors

```bash
# Verify your database URL is correct
npx prisma db pull --schema=prisma/schema.prisma

# If it works, your connection is good
# Then try migration again
npx prisma migrate deploy
```

### Tables Already Exist Error

If you get "table already exists" errors:

```bash
# Mark migration as applied without running it
npx prisma migrate resolve --applied 20251111113117_add_phase8_and_phase9_features
```

### Permission Denied Errors

Ensure your database user has sufficient permissions:

```sql
-- Check permissions
SELECT * FROM information_schema.role_table_grants
WHERE grantee = 'your_db_user';

-- Grant permissions if needed (as superuser)
GRANT CREATE ON SCHEMA public TO your_db_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_db_user;
```

## 🔄 Rollback Instructions

If you need to rollback this migration:

**⚠️ WARNING: This will delete all data in Phase 8 & 9 tables!**

```bash
# Option 1: Via SQL (run in Neon Dashboard SQL Editor)
# See prisma/migrations/20251111113117_add_phase8_and_phase9_features/README.md
# for complete rollback SQL

# Option 2: Via Prisma (not recommended for production)
npx prisma migrate resolve --rolled-back 20251111113117_add_phase8_and_phase9_features
# Then manually drop the tables
```

## 📈 Monitoring Post-Migration

After migration, monitor these metrics:

1. **Database Performance**
   - Query response times
   - Connection pool usage
   - Table sizes growing as expected

2. **Application Health**
   - No increase in errors
   - API endpoints responding normally
   - Analytics events being recorded

3. **New Features**
   - Admin dashboard accessible
   - Feature flags working
   - ML predictions generating

## 🎯 Next Steps

Once migration is complete:

1. **Phase 8 Activation**
   - [ ] Enable analytics event tracking
   - [ ] Configure ML price prediction model
   - [ ] Set up first A/B experiment
   - [ ] Monitor performance metrics dashboard

2. **Phase 9 Setup**
   - [ ] Create admin users with appropriate roles
   - [ ] Populate deals CMS with travel deals
   - [ ] Add destination content
   - [ ] Create email templates
   - [ ] Set up health monitoring alerts

3. **Testing**
   - [ ] Test admin dashboard access
   - [ ] Verify RBAC permissions
   - [ ] Test analytics pipeline end-to-end
   - [ ] Validate ML predictions accuracy
   - [ ] Check A/B test assignments

4. **Documentation**
   - [ ] Update API documentation
   - [ ] Create admin user guide
   - [ ] Document CMS workflows
   - [ ] Write analytics dashboard guide

## 📞 Support

If you encounter issues:

1. Check migration README: `prisma/migrations/20251111113117_add_phase8_and_phase9_features/README.md`
2. Verify environment variables are set correctly
3. Check Vercel deployment logs
4. Review Neon database logs
5. Test database connectivity

## 🎉 Success Criteria

Migration is complete when:
- [x] Migration files committed to repository
- [ ] Migration applied to production database
- [ ] All 17 new tables created successfully
- [ ] Prisma migrate status shows "up to date"
- [ ] At least one admin user created
- [ ] Analytics endpoint accepting events
- [ ] No errors in production logs
- [ ] Application functioning normally

---

**Migration Created:** November 11, 2025
**Status:** Ready for production deployment
**Estimated Time:** 5-10 minutes
**Downtime Required:** None (additive migration)
**Breaking Changes:** None
