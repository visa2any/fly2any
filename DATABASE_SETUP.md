# Database Setup Guide - Fly2Any Travel Platform

## Table of Contents
1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Connection Setup](#connection-setup)
4. [Schema Installation](#schema-installation)
5. [Migrations](#migrations)
6. [Constraints Reference](#constraints-reference)
7. [Audit Log System](#audit-log-system)
8. [Soft Delete Support](#soft-delete-support)
9. [Backup & Restore](#backup--restore)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)

---

## Overview

Fly2Any uses **Neon PostgreSQL** as its serverless database provider. Neon provides:
- Serverless PostgreSQL with auto-scaling
- Instant database branching
- Edge-compatible connections
- Built-in connection pooling
- Point-in-time recovery

**Key Features:**
- Full SQL support with PostgreSQL 15+
- JSONB for flexible document storage
- Advanced indexing for performance
- Comprehensive audit logging
- Soft delete support for data retention
- Automatic timestamp management

---

## Database Architecture

### Core Tables
- **users** - User accounts and authentication
- **bookings** - Main booking records (flights, hotels, etc.)
- **flight_bookings** - Detailed flight booking information
- **hotel_bookings** - Detailed hotel booking information
- **passengers** - Normalized passenger data
- **flight_segments** - Individual flight legs
- **seat_selections** - Seat assignments per passenger per segment

### Supporting Tables
- **booking_audit_log** - Complete audit trail of booking changes
- **webhook_events** - Duffel API webhook event storage
- **flight_search_logs** - Search analytics for price calendar
- **route_statistics** - Route popularity and cache priorities
- **support_tickets** - Customer support system
- **price_alerts** - User price monitoring
- **reviews** - Booking reviews and ratings

### Data Model
```
users (1) ──< (N) bookings
                    │
                    ├──< flight_bookings (1:1)
                    ├──< hotel_bookings (1:1)
                    ├──< passengers (1:N)
                    │       └──< seat_selections (1:N)
                    ├──< flight_segments (1:N)
                    │       └──< seat_selections (N:1)
                    └──< booking_audit_log (1:N)
```

---

## Connection Setup

### Step 1: Create Neon Database

1. Sign up at [Neon Console](https://console.neon.tech)
2. Create a new project (name: `fly2any-production`)
3. Select region closest to your users (e.g., `us-east-2`)
4. Note your connection string from the dashboard

### Step 2: Get Connection String

From Neon Dashboard:
1. Navigate to **Dashboard** > **Connection Details**
2. Select **"Pooled connection"** (recommended for serverless)
3. Copy the connection string format:

```
postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require
```

**Example:**
```
postgresql://myuser:AbC123xYz@ep-cool-cloud-123456.us-east-2.aws.neon.tech/fly2any?sslmode=require
```

### Step 3: Configure Environment Variables

Edit `.env.local` (development) or set in production environment:

```bash
# Development (.env.local)
DATABASE_URL=postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require
POSTGRES_URL=postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require
```

**Production (Vercel/deployment platform):**
```bash
vercel env add DATABASE_URL
vercel env add POSTGRES_URL
```

### Connection Validation

The application automatically validates database connections:
- Checks for placeholder URLs
- Warns if using localhost
- Falls back to demo data if not configured
- See: `lib/db/connection.ts` for validation logic

---

## Schema Installation

### Method 1: Automatic (Recommended)

The schema is automatically created when you first deploy:

```bash
npm run build
```

This triggers the schema initialization in `lib/db/init.ts`.

### Method 2: Manual (Direct SQL)

```bash
# Install PostgreSQL client
npm install -g psql

# Connect to database
psql "postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require"

# Run schema
\i lib/db/schema.sql
```

### Method 3: Via Neon Console

1. Open [Neon Console](https://console.neon.tech)
2. Navigate to **SQL Editor**
3. Copy contents of `lib/db/schema.sql`
4. Execute the SQL

### Verify Installation

```sql
-- Check tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return ~20 tables including:
-- bookings, users, passengers, flight_segments, seat_selections, etc.
```

---

## Migrations

### Migration Files

Located in `lib/db/migrations/`:

| File | Purpose | Status |
|------|---------|--------|
| `001_flight_search_analytics.sql` | Search tracking & price calendar | ✅ Applied |
| `002_webhook_events.sql` | Duffel webhook logging | ✅ Applied |
| `003_add_database_constraints.sql` | Data validation rules | 🆕 New |
| `004_audit_log.sql` | Booking change audit trail | 🆕 New |
| `005_soft_delete.sql` | Soft delete support | 🆕 New |

### Running Migrations

#### Option 1: Via Neon Console (Recommended)

```bash
# 1. Open Neon SQL Editor
# 2. Copy migration file contents
# 3. Execute each migration in order
```

#### Option 2: Via psql

```bash
# Connect to database
psql "postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require"

# Run migrations in order
\i lib/db/migrations/003_add_database_constraints.sql
\i lib/db/migrations/004_audit_log.sql
\i lib/db/migrations/005_soft_delete.sql
```

#### Option 3: Via Node Script

```typescript
// scripts/run-migrations.ts
import { sql } from './lib/db/connection';
import { readFileSync } from 'fs';

async function runMigration(filename: string) {
  const content = readFileSync(`lib/db/migrations/${filename}`, 'utf-8');
  await sql.unsafe(content);
  console.log(`✅ Applied: ${filename}`);
}

// Run in order
await runMigration('003_add_database_constraints.sql');
await runMigration('004_audit_log.sql');
await runMigration('005_soft_delete.sql');
```

### Migration Status Tracking

```sql
-- Create migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Record applied migrations
INSERT INTO schema_migrations (migration_name) VALUES
  ('001_flight_search_analytics'),
  ('002_webhook_events'),
  ('003_add_database_constraints'),
  ('004_audit_log'),
  ('005_soft_delete');

-- Check migration status
SELECT * FROM schema_migrations ORDER BY id;
```

---

## Constraints Reference

### Email Validation

**Tables:** `bookings`, `users`, `passengers`, `email_notifications`

**Pattern:** `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$`

**Examples:**
- ✅ Valid: `user@example.com`, `john.doe+test@company.co.uk`
- ❌ Invalid: `user@`, `@example.com`, `user@domain`

**Test:**
```sql
-- This will fail with constraint violation
INSERT INTO bookings (id, booking_reference, guest_email, status, contact_info)
VALUES ('test123', 'TEST-123', 'invalid-email', 'pending', '{}');
```

### Unique Seat Assignments

**Table:** `seat_selections`

**Constraint:** `unique_seat_per_segment`

**Rule:** One passenger per seat per flight segment

**Example:**
```sql
-- This will fail if seat 12A is already assigned
INSERT INTO seat_selections (booking_id, passenger_id, flight_segment_id, seat_number, seat_class)
VALUES ('booking-123', 'passenger-456', 'segment-789', '12A', 'economy');
```

### Valid Date of Birth

**Table:** `passengers`

**Rules:**
- DOB must not be in the future
- DOB must be after 1900-01-01
- Passport expiry must be in the future

**Example:**
```sql
-- This will fail (future DOB)
INSERT INTO passengers (booking_id, passenger_type, title, first_name, last_name, date_of_birth, nationality)
VALUES ('booking-123', 'adult', 'Mr', 'John', 'Doe', '2030-01-01', 'US');
```

### Passenger Count Validation

**Table:** `flight_bookings`

**Rules:**
- Adults: 1-9 (at least 1 required)
- Children: 0-9
- Infants: 0 to number of adults

**Example:**
```sql
-- This will fail (0 adults)
INSERT INTO flight_bookings (booking_id, origin_airport, destination_airport, departure_date, adults, flight_offer)
VALUES ('booking-123', 'JFK', 'LAX', '2025-06-01', 0, '{}');

-- This will fail (10 infants, only 2 adults)
INSERT INTO flight_bookings (booking_id, origin_airport, destination_airport, departure_date, adults, infants, flight_offer)
VALUES ('booking-123', 'JFK', 'LAX', '2025-06-01', 2, 10, '{}');
```

### Date Logic Validation

**Tables:** `bookings`, `flight_bookings`, `hotel_bookings`

**Rules:**
- Travel end date ≥ start date
- Return date > departure date
- Checkout date > checkin date

---

## Audit Log System

### Overview

Every change to bookings is automatically logged for:
- Compliance (financial regulations, GDPR)
- Debugging (troubleshoot booking issues)
- Customer support (track booking history)
- Analytics (understand booking lifecycle)

### Automatic Logging

Triggered automatically on:
- `INSERT` - New booking created
- `UPDATE` - Booking modified
- `STATUS_CHANGE` - Status field changed
- `PAYMENT_UPDATE` - Payment status changed
- `CANCELLATION` - Booking cancelled
- `SOFT_DELETE` - Booking soft deleted
- `RESTORE` - Soft deleted booking restored

### Query Audit History

```sql
-- Get all changes for a booking
SELECT * FROM get_booking_audit_history('booking_1234567890_abc123');

-- View recent changes (last 24 hours)
SELECT * FROM v_recent_booking_changes LIMIT 20;

-- Get user activity
SELECT * FROM get_user_audit_activity('user:550e8400-e29b-41d4-a716-446655440000');

-- Get audit statistics (last 30 days)
SELECT * FROM get_audit_statistics();

-- Track booking lifecycle
SELECT
  booking_id,
  created_at,
  confirmed_at,
  paid_at,
  cancelled_at,
  total_changes
FROM v_booking_lifecycle
WHERE booking_id = 'booking_1234567890_abc123';
```

### Audit Log Fields

```typescript
interface BookingAuditLog {
  id: string;                    // UUID
  booking_id: string;            // Reference to booking
  action: string;                // Type of change
  changed_fields: object;        // {"field": {"old": "val1", "new": "val2"}}
  old_data: object;              // Full snapshot before change
  new_data: object;              // Full snapshot after change
  changed_by: string;            // Who made the change
  change_reason: string;         // Why the change was made
  ip_address: string;            // IP address
  user_agent: string;            // Browser info
  created_at: Date;              // When it happened
}
```

### Manual Audit Logging

```typescript
// In application code
import { sql } from '@/lib/db/connection';

await sql`
  INSERT INTO booking_audit_log (
    booking_id, action, changed_fields, changed_by, change_reason
  ) VALUES (
    ${bookingId},
    'MANUAL_ADJUSTMENT',
    ${JSON.stringify({price: {old: 500, new: 450}})},
    ${'admin:' + adminEmail},
    ${'Customer service price adjustment'}
  )
`;
```

---

## Soft Delete Support

### Overview

Soft delete preserves booking history instead of permanently removing data:
- Maintains referential integrity
- Enables "undo" functionality
- Supports compliance (data retention policies)
- Allows recovery of accidentally deleted bookings

### Soft Delete a Booking

```sql
-- Soft delete
SELECT * FROM soft_delete_booking(
  'booking_1234567890_abc123',           -- booking_id
  'Customer requested data removal',      -- deletion_reason
  'admin:john@example.com'               -- deleted_by
);

-- Result: {success: true, message: 'Booking soft deleted successfully', deleted_booking_id: '...'}
```

### Restore a Booking

```sql
-- Restore soft-deleted booking
SELECT * FROM restore_booking(
  'booking_1234567890_abc123',           -- booking_id
  'admin:john@example.com'               -- restored_by
);
```

### Query Active vs Deleted Bookings

```sql
-- Method 1: Use view (recommended)
SELECT * FROM v_active_bookings
WHERE guest_email = 'user@example.com';

-- Method 2: Add WHERE clause
SELECT * FROM bookings
WHERE guest_email = 'user@example.com'
  AND deleted_at IS NULL;

-- View deleted bookings
SELECT * FROM v_deleted_bookings
ORDER BY deleted_at DESC;

-- Get deletion statistics
SELECT * FROM get_soft_delete_statistics();
```

### Application Code Integration

```typescript
// TypeScript/API code
import { sql } from '@/lib/db/connection';

// Query active bookings only
const bookings = await sql`
  SELECT * FROM bookings
  WHERE user_id = ${userId}
    AND deleted_at IS NULL
  ORDER BY created_at DESC
`;

// Soft delete via function
const result = await sql`
  SELECT * FROM soft_delete_booking(
    ${bookingId},
    ${'Customer request'},
    ${'user:' + userId}
  )
`;
```

### Permanent Deletion (CAUTION!)

```sql
-- Step 1: Soft delete first
SELECT * FROM soft_delete_booking('booking_123', 'GDPR compliance', 'admin:legal@company.com');

-- Step 2: Wait 30 days (automated safeguard)

-- Step 3: View eligible bookings
SELECT * FROM v_bookings_eligible_for_permanent_deletion;

-- Step 4: Permanently delete (requires confirmation code = last 5 chars of booking reference)
SELECT * FROM permanently_delete_booking('booking_123', 'ABC123');
```

### Bulk Cleanup

```sql
-- Dry run first (safe)
SELECT * FROM bulk_soft_delete_old_cancelled_bookings(365, TRUE);
-- Returns: {affected_count: 42, sample_booking_ids: ['booking1', 'booking2', ...]}

-- Actually perform bulk soft delete
SELECT * FROM bulk_soft_delete_old_cancelled_bookings(365, FALSE);
```

---

## Backup & Restore

### Neon Automatic Backups

Neon provides automatic point-in-time recovery:
1. Navigate to **Dashboard** > **Backups**
2. Backups are retained for 7 days (free tier) or 30 days (pro tier)
3. Restore to any point within retention window

### Manual Backup (pg_dump)

```bash
# Full database backup
pg_dump "postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require" \
  > fly2any-backup-$(date +%Y%m%d).sql

# Compressed backup
pg_dump "postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require" \
  | gzip > fly2any-backup-$(date +%Y%m%d).sql.gz

# Backup specific tables
pg_dump --table=bookings --table=passengers \
  "postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require" \
  > bookings-backup.sql
```

### Restore from Backup

```bash
# Restore full database
psql "postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require" \
  < fly2any-backup-20251110.sql

# Restore from compressed backup
gunzip -c fly2any-backup-20251110.sql.gz | \
  psql "postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require"
```

### Database Branching (Neon Feature)

```bash
# Create a branch for testing migrations
# Via Neon Console: Dashboard > Branches > Create Branch

# Or via Neon CLI
neon branches create --name staging-migration-test --parent main

# Get branch connection string
neon connection-string staging-migration-test

# Test migrations on branch
psql "[branch-connection-string]" < lib/db/migrations/003_add_database_constraints.sql

# Merge to main if successful (via Console)
```

### Backup Schedule (Recommended)

```bash
# Add to cron or CI/CD
# Daily at 2 AM UTC
0 2 * * * /usr/local/bin/pg_dump "postgresql://..." | gzip > /backups/fly2any-$(date +\%Y\%m\%d).sql.gz

# Weekly full backup (Sunday 3 AM)
0 3 * * 0 /scripts/weekly-backup.sh

# Monthly archive (1st of month 4 AM)
0 4 1 * * /scripts/monthly-backup.sh
```

---

## Performance Optimization

### Index Usage

The schema includes 30+ indexes for optimal performance:

```sql
-- View all indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Query Performance Analysis

```sql
-- Enable query timing
\timing on

-- Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM bookings
WHERE guest_email = 'user@example.com'
  AND deleted_at IS NULL
  AND status = 'confirmed';

-- Should show: Index Scan using idx_bookings_email_not_deleted
```

### Slow Query Identification

```sql
-- Find slow queries (requires pg_stat_statements extension)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

### VACUUM and ANALYZE

```sql
-- Regular maintenance (Neon handles this automatically)
VACUUM ANALYZE bookings;
VACUUM ANALYZE passengers;

-- Full vacuum (rarely needed)
VACUUM FULL bookings;
```

### Connection Pooling

Neon provides automatic connection pooling:
- Use "Pooled connection" string from dashboard
- Default pool size: 100 connections
- Automatic connection recycling
- No additional configuration needed

### JSONB Optimization

```sql
-- Use JSONB operators for queries
SELECT * FROM bookings
WHERE contact_info->>'email' = 'user@example.com';

-- Create GIN index for JSONB search
CREATE INDEX idx_bookings_contact_info ON bookings USING gin(contact_info);

-- Query with JSONB containment
SELECT * FROM bookings
WHERE contact_info @> '{"email": "user@example.com"}';
```

---

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to database

```bash
# Test connection
psql "postgresql://[username]:[password]@[endpoint].neon.tech/[database]?sslmode=require"

# Common issues:
# 1. Wrong credentials → Check Neon dashboard
# 2. Missing ?sslmode=require → Add to connection string
# 3. IP not allowed → Check Neon IP allowlist settings
# 4. Database doesn't exist → Create via Console
```

**Problem:** Application shows "Database not configured"

```typescript
// Check validation in lib/db/connection.ts
console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
console.log('Is configured:', !process.env.POSTGRES_URL?.includes('placeholder'));
```

### Migration Errors

**Problem:** Migration fails with "constraint already exists"

```sql
-- Migrations use DO $$ blocks with IF NOT EXISTS checks
-- Safe to re-run without issues
-- Example:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_email') THEN
    ALTER TABLE bookings ADD CONSTRAINT valid_email CHECK (...);
  END IF;
END $$;
```

**Problem:** Constraint violation after migration

```sql
-- Find invalid data
SELECT * FROM bookings WHERE guest_email IS NOT NULL AND guest_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';

-- Fix invalid data before adding constraint
UPDATE bookings SET guest_email = NULL WHERE guest_email = 'invalid-email';
```

### Performance Issues

**Problem:** Queries are slow

```sql
-- 1. Check for missing indexes
SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public' ORDER BY seq_scan DESC;

-- 2. Analyze query plan
EXPLAIN ANALYZE [your slow query];

-- 3. Update table statistics
ANALYZE bookings;

-- 4. Check table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Audit Log Issues

**Problem:** Audit log not capturing changes

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_log_booking_changes';

-- Manually test trigger
UPDATE bookings SET status = 'confirmed' WHERE id = 'test-booking-123';
SELECT * FROM booking_audit_log WHERE booking_id = 'test-booking-123' ORDER BY created_at DESC LIMIT 1;
```

### Soft Delete Issues

**Problem:** Deleted bookings still appearing

```sql
-- Always filter deleted_at in queries
SELECT * FROM bookings WHERE deleted_at IS NULL;

-- Or use view
SELECT * FROM v_active_bookings;

-- Check if booking is actually deleted
SELECT id, booking_reference, deleted_at, deletion_reason FROM bookings WHERE id = 'booking-123';
```

---

## Additional Resources

### Documentation
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)

### Support
- **Neon Support:** [support@neon.tech](mailto:support@neon.tech)
- **Community:** [Neon Discord](https://discord.gg/neon)
- **Status:** [status.neon.tech](https://status.neon.tech)

### Monitoring
- **Neon Metrics:** Dashboard > Metrics (CPU, RAM, storage, connections)
- **Query Performance:** Dashboard > Queries
- **Branch History:** Dashboard > Branches

---

## Quick Reference Commands

```bash
# Connect to database
psql "postgresql://[user]:[pass]@[endpoint].neon.tech/[db]?sslmode=require"

# List tables
\dt

# Describe table
\d bookings

# Run SQL file
\i lib/db/schema.sql

# Export query results
\o output.csv
SELECT * FROM bookings;
\o

# Quit psql
\q
```

---

**Last Updated:** 2025-11-10
**Version:** 1.0.0
**Maintainer:** Database Architect Team
