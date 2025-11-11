# Database Migration Guide - Phase 7

Complete guide for applying Phase 7 database migrations to production.

## Migration Overview

**Migration ID:** `20251110190400_add_phase7_features`
**Date:** November 10, 2025
**File Size:** 14KB (432 lines)
**Tables Created:** 19
**Indexes Created:** 26
**Foreign Keys:** 11

---

## Tables Created

### 1. Authentication & User Management (NextAuth)
```sql
users                 - Core user accounts
accounts              - OAuth provider accounts
sessions              - User sessions
verification_tokens   - Email verification tokens
user_preferences      - User travel preferences
```

### 2. Travel Features
```sql
saved_searches        - Saved flight searches
price_alerts          - Price drop monitoring
recent_searches       - User search history
price_history         - Historical pricing data
price_monitor_logs    - Monitoring job logs
```

### 3. Phase 7 - User Engagement
```sql
wishlist_items        - Saved flights/hotels
notifications         - In-app notifications
push_subscriptions    - Web push endpoints
user_activities       - User activity tracking
user_sessions         - Session management
login_history         - Login audit trail
```

### 4. AI Consultant System
```sql
ai_conversations      - AI chat sessions
ai_messages           - Chat message history
```

---

## Database Schema Details

### Key Features

**Optimized Indexes:**
- 26 indexes for query performance
- Composite indexes for common queries
- Unique constraints for data integrity

**Data Types:**
- JSONB for flexible metadata storage
- Timestamps with timezone support
- Arrays for multi-select preferences
- Double precision for pricing accuracy

**Relationships:**
- CASCADE delete for data cleanup
- Foreign key constraints for integrity
- One-to-one: user_preferences
- One-to-many: all user-related tables

---

## Prerequisites

Before running the migration:

1. PostgreSQL database (version 12+)
2. Database connection string with write access
3. Prisma CLI installed: `npm install -g prisma`
4. Backup of existing database (if any)

---

## Migration Commands

### Option 1: From Local Environment (Recommended)

```bash
# 1. Set database URL
export POSTGRES_URL="postgresql://user:password@host:port/database?sslmode=require"

# 2. Verify connection
npx prisma db pull

# 3. Apply migration
npx prisma migrate deploy

# 4. Generate Prisma Client
npx prisma generate

# 5. Verify migration status
npx prisma migrate status
```

Expected output:
```
✓ Database schema is up to date
✓ The following migration have been applied:
  20251110190400_add_phase7_features
```

### Option 2: From Vercel (Post-Deployment)

**Method A: Via Vercel CLI**
```bash
# 1. Link to project
vercel link

# 2. Pull environment variables
vercel env pull .env.local

# 3. Run migration
npx prisma migrate deploy

# 4. Push to trigger rebuild
git commit --allow-empty -m "trigger: rebuild after migration"
git push
```

**Method B: Via Build Command**
Update `vercel.json`:
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

### Option 3: From CI/CD Pipeline

Add to your GitHub Actions workflow:
```yaml
- name: Run Database Migrations
  env:
    POSTGRES_URL: ${{ secrets.POSTGRES_URL }}
  run: |
    npx prisma migrate deploy
    npx prisma generate
```

---

## Database Providers

### Neon PostgreSQL (Recommended for Vercel)

**Why Neon:**
- Serverless PostgreSQL
- Auto-scaling
- Instant database branching
- Free tier: 3GB storage

**Setup:**
1. Go to https://neon.tech
2. Create project: `fly2any-production`
3. Copy connection string
4. Add to Vercel: `POSTGRES_URL`

**Connection String Format:**
```
postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Supabase PostgreSQL

**Why Supabase:**
- Built-in auth (can replace NextAuth)
- Real-time subscriptions
- Storage included
- Free tier: 500MB storage

**Setup:**
1. Go to https://supabase.com
2. Create project: `fly2any`
3. Navigate to Settings → Database
4. Copy connection string (Pooler mode recommended)
5. Add to Vercel: `POSTGRES_URL`

### Railway PostgreSQL

**Why Railway:**
- Simple setup
- CLI integration
- Built-in metrics
- Free tier: $5 credit/month

**Setup:**
1. Go to https://railway.app
2. Create PostgreSQL database
3. Copy connection URL
4. Add to Vercel: `POSTGRES_URL`

### Self-Hosted PostgreSQL

**Connection String:**
```
postgresql://username:password@your-host:5432/fly2any?sslmode=require
```

**Required Configuration:**
- SSL enabled (required by Prisma)
- Max connections: 100+
- Timezone: UTC
- Version: PostgreSQL 12+

---

## Verifying Migration Success

### 1. Check Migration Status
```bash
npx prisma migrate status
```

Expected output:
```
✓ Database schema is up to date
✓ The following migrations have been applied:
  20251110190400_add_phase7_features
```

### 2. Verify Tables Created
```sql
-- Connect to your database and run:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- accounts
- ai_conversations
- ai_messages
- login_history
- notifications
- price_alerts
- price_history
- price_monitor_logs
- push_subscriptions
- recent_searches
- saved_searches
- sessions
- user_activities
- user_preferences
- user_sessions
- users
- verification_tokens
- wishlist_items

### 3. Verify Indexes Created
```sql
-- Check indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Should show 26 indexes.

### 4. Test Database Connection

**Create test file:** `test-db.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test write
    const user = await prisma.users.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    console.log('✓ User created:', user.id);

    // Test read
    const users = await prisma.users.findMany();
    console.log('✓ Users found:', users.length);

    // Cleanup
    await prisma.users.delete({ where: { id: user.id } });
    console.log('✓ Cleanup successful');

    console.log('\n✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

**Run test:**
```bash
npx tsx test-db.ts
```

---

## Post-Migration Tasks

### 1. Create Default Data (Optional)

**Seed file:** `prisma/seed.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default user preferences for new users
  // This will be handled by app logic on first login

  console.log('✓ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**
```bash
npx prisma db seed
```

### 2. Set Up Backups

**Neon (Automatic):**
- Point-in-time recovery (7 days)
- Manual snapshots via dashboard

**Supabase (Manual):**
```bash
# Backup
pg_dump $POSTGRES_URL > backup.sql

# Restore
psql $POSTGRES_URL < backup.sql
```

**Schedule Backups (cron):**
```bash
# Add to crontab: daily at 2 AM UTC
0 2 * * * pg_dump $POSTGRES_URL > /backups/fly2any-$(date +\%Y\%m\%d).sql
```

### 3. Monitor Performance

**Check query performance:**
```sql
-- Slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Check index usage:**
```sql
-- Unused indexes
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

---

## Rollback Procedures

### If Migration Fails

**Option 1: Rollback via Prisma**
```bash
# Reset database (DESTRUCTIVE - deletes all data)
npx prisma migrate reset

# Or restore from backup
psql $POSTGRES_URL < backup.sql
```

**Option 2: Manual Rollback**
```sql
-- Drop all Phase 7 tables (in order)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS login_history CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS recent_searches CASCADE;
DROP TABLE IF EXISTS price_alerts CASCADE;
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS price_monitor_logs CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

---

## Troubleshooting

### Issue: "Migration failed - relation already exists"

**Cause:** Tables already exist from previous migration attempt

**Solution:**
```bash
# Check existing tables
npx prisma db pull

# If schema matches, mark migration as applied
npx prisma migrate resolve --applied 20251110190400_add_phase7_features
```

### Issue: "SSL connection required"

**Cause:** Database requires SSL but connection string doesn't specify

**Solution:**
Add `?sslmode=require` to connection string:
```
postgresql://user:pass@host/db?sslmode=require
```

### Issue: "Permission denied"

**Cause:** Database user lacks CREATE TABLE permissions

**Solution:**
```sql
-- Grant permissions (run as superuser)
GRANT CREATE ON DATABASE fly2any TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### Issue: "Connection timeout"

**Cause:** Network/firewall blocking connection

**Solution:**
1. Check database is publicly accessible
2. Verify firewall allows connections from Vercel IPs
3. Test connection locally:
```bash
psql "$POSTGRES_URL"
```

### Issue: "Migration lock timeout"

**Cause:** Another migration process is running

**Solution:**
```sql
-- Check for locks
SELECT * FROM pg_locks WHERE locktype = 'advisory';

-- Force unlock (if safe)
SELECT pg_advisory_unlock_all();
```

---

## Database Maintenance

### Weekly Tasks
- [ ] Review slow query logs
- [ ] Check database size growth
- [ ] Verify backup completion
- [ ] Monitor connection pool usage

### Monthly Tasks
- [ ] Analyze query patterns
- [ ] Review index usage
- [ ] Optimize large tables
- [ ] Update statistics
```sql
ANALYZE VERBOSE;
```

### Quarterly Tasks
- [ ] Review schema for optimization
- [ ] Archive old data
- [ ] Performance testing
- [ ] Security audit

---

## Performance Optimization

### Connection Pooling

**Recommended:** Use Prisma's connection pooler

**Prisma connection pool config:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_URL")
  relationMode = "prisma"
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}
```

**Connection limits:**
- Development: 5 connections
- Production: 10-20 connections
- Serverless: Use connection pooler (Neon, Supabase)

### Query Optimization

**Best practices:**
1. Use indexes for frequently queried fields
2. Limit result sets with pagination
3. Use `select` to fetch only needed fields
4. Batch operations when possible

**Example optimized query:**
```typescript
// ❌ Bad: Fetches all fields
const users = await prisma.users.findMany();

// ✅ Good: Fetches only needed fields
const users = await prisma.users.findMany({
  select: { id: true, email: true, name: true },
  take: 20,
  skip: (page - 1) * 20,
});
```

---

## Security Checklist

- [ ] Database user has minimum required permissions
- [ ] Connection uses SSL (`?sslmode=require`)
- [ ] Connection string stored as secret in Vercel
- [ ] Database not publicly accessible (only from app)
- [ ] Regular backups configured
- [ ] Audit logging enabled
- [ ] Strong password policy enforced

---

## Quick Reference

### Check Migration Status
```bash
npx prisma migrate status
```

### Apply Migrations
```bash
npx prisma migrate deploy
```

### Generate Client
```bash
npx prisma generate
```

### View Schema
```bash
npx prisma studio
```

### Create Backup
```bash
pg_dump $POSTGRES_URL > backup.sql
```

### Restore Backup
```bash
psql $POSTGRES_URL < backup.sql
```

---

## Support Resources

- Prisma Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Neon Documentation: https://neon.tech/docs
- Supabase PostgreSQL: https://supabase.com/docs/guides/database
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

**Last Updated:** 2025-11-10 (Phase 7 Deployment)
**Migration File:** `prisma/migrations/20251110190400_add_phase7_features/migration.sql`
**Status:** ✅ Ready for Production
**Tables:** 19 | **Indexes:** 26 | **Foreign Keys:** 11
