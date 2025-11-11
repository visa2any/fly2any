# Price Monitoring System - Complete Guide

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [How It Works](#how-it-works)
4. [Setup & Configuration](#setup--configuration)
5. [API Endpoints](#api-endpoints)
6. [Components](#components)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Monitoring & Observability](#monitoring--observability)
10. [Troubleshooting](#troubleshooting)
11. [Performance Tuning](#performance-tuning)

---

## Overview

The Automated Price Monitoring System is a background job service that continuously monitors flight prices and automatically notifies users when prices drop to their target levels.

### Key Features

- **Automated Monitoring**: Runs every 6 hours via Vercel Cron
- **Smart Notifications**: Email alerts when target price is reached
- **Price History**: Tracks price changes for trend analysis
- **Admin Dashboard**: Full control and monitoring interface
- **Rate Limiting**: Respects API quotas with batching
- **Error Handling**: Graceful failure recovery and retry logic
- **Performance Optimized**: Caching and concurrent processing

### Benefits

- **User Value**: Saves users money by catching price drops
- **Automation**: No manual intervention required
- **Scalability**: Handles thousands of alerts efficiently
- **Reliability**: Built-in error handling and monitoring
- **Insights**: Price trend analysis for better decisions

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     PRICE MONITORING SYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │ Vercel Cron  │────────>│ Cron Handler │                  │
│  │ (6h schedule)│         │  /api/cron   │                  │
│  └──────────────┘         └──────┬───────┘                  │
│                                   │                           │
│                                   v                           │
│                          ┌────────────────┐                  │
│                          │ Price Monitor  │                  │
│                          │    Service     │                  │
│                          └────────┬───────┘                  │
│                                   │                           │
│                    ┌──────────────┼──────────────┐           │
│                    v              v              v            │
│            ┌──────────┐   ┌──────────┐   ┌──────────┐       │
│            │  Check   │   │  Price   │   │  Email   │       │
│            │  Alerts  │   │ History  │   │ Service  │       │
│            └──────────┘   └──────────┘   └──────────┘       │
│                    │              │              │            │
│                    v              v              v            │
│            ┌─────────────────────────────────────────┐       │
│            │         PostgreSQL Database              │       │
│            │  - PriceAlert                            │       │
│            │  - PriceHistory                          │       │
│            │  - PriceMonitorLog                       │       │
│            └─────────────────────────────────────────┘       │
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │    Admin     │────────>│  Admin API   │                  │
│  │  Dashboard   │         │  Endpoints   │                  │
│  └──────────────┘         └──────────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Cron Trigger**: Vercel Cron calls `/api/cron/price-monitor` every 6 hours
2. **Alert Retrieval**: System fetches all active, untriggered alerts
3. **Price Checking**: Each alert is checked against current flight prices
4. **Price Recording**: All price checks are logged to price history
5. **Trigger Detection**: System compares current vs target price
6. **Notification**: Email sent if price reaches target
7. **Database Update**: Alert status and execution logs saved
8. **Admin Reporting**: Dashboard displays statistics and logs

---

## How It Works

### Price Monitoring Cycle

#### 1. Cron Job Execution

Every 6 hours, Vercel Cron triggers the monitoring endpoint:

```
GET /api/cron/price-monitor
Authorization: Bearer {CRON_SECRET}
```

#### 2. Alert Processing

The system processes alerts in batches:

```typescript
// Pseudo-code
const activeAlerts = await getActiveAlerts();
const batches = splitIntoBatches(activeAlerts, 5); // Max 5 concurrent

for (const batch of batches) {
  await Promise.allSettled(
    batch.map(alert => checkAlert(alert))
  );
  await delay(1000); // Rate limiting
}
```

#### 3. Price Checking

For each alert, the system:

1. Checks cache for recent price (< 1 hour old)
2. If no cache, queries flight API (Duffel/Amadeus)
3. Records price in history table
4. Compares with target price

#### 4. Alert Triggering

When price reaches target:

```typescript
if (currentPrice <= targetPrice) {
  // Update alert
  await updateAlert({
    triggered: true,
    triggeredAt: now,
    currentPrice: currentPrice
  });

  // Send notification
  await sendPriceAlertEmail(user, alert, currentPrice);
}
```

#### 5. Logging & Reporting

All executions are logged:

```typescript
await logExecution({
  alertsChecked: 50,
  alertsTriggered: 3,
  alertsFailed: 1,
  duration: 12000,
  triggeredBy: 'cron'
});
```

---

## Setup & Configuration

### Prerequisites

1. **Database**: PostgreSQL with Prisma
2. **Email Service**: Resend API configured
3. **Environment Variables**: See below
4. **Vercel Account**: For cron jobs (or alternative cron service)

### Environment Variables

Add to `.env`:

```bash
# Required for cron authentication
CRON_SECRET=your_secure_random_secret_here

# Email service (for notifications)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=bookings@fly2any.com

# Database (already configured)
POSTGRES_URL=your_postgres_url_here

# Optional: Flight APIs (when integrated)
AMADEUS_API_KEY=your_amadeus_key
DUFFEL_API_TOKEN=your_duffel_token
```

Generate CRON_SECRET:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Database Migrations

Run Prisma migrations to add new tables:

```bash
# Generate migration
npx prisma migrate dev --name add_price_monitoring

# Apply to production
npx prisma migrate deploy
```

### Vercel Cron Setup

The cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/price-monitor",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Schedule Explanation**: `0 */6 * * *`
- Runs at minute 0
- Every 6 hours
- Every day
- Every month
- Every day of week

**Alternative schedules**:
- Every 4 hours: `0 */4 * * *`
- Every 12 hours: `0 */12 * * *`
- Daily at 9am: `0 9 * * *`

### Alternative: External Cron Service

If not using Vercel Cron, use [cron-job.org](https://cron-job.org) or similar:

1. Create account at cron-job.org
2. Add new cron job:
   - URL: `https://your-domain.com/api/cron/price-monitor`
   - Schedule: Every 6 hours
   - Method: GET
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

---

## API Endpoints

### Cron Job Endpoint

**GET /api/cron/price-monitor**

Automated monitoring endpoint called by cron service.

**Authentication**: Bearer token (CRON_SECRET)

**Request**:
```bash
curl -X GET https://fly2any.com/api/cron/price-monitor \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Response**:
```json
{
  "success": true,
  "message": "Price monitoring completed",
  "summary": {
    "alertsChecked": 50,
    "alertsTriggered": 3,
    "alertsFailed": 1,
    "duration": 12000,
    "executionTime": "2025-11-10T14:30:00.000Z"
  },
  "errors": [
    {
      "alertId": "clx123abc",
      "error": "API rate limit exceeded"
    }
  ]
}
```

### Admin API Endpoints

#### Manual Trigger

**POST /api/admin/price-monitor/run**

Manually trigger price monitoring.

**Authentication**: Session-based (admin only)

**Request**:
```bash
curl -X POST https://fly2any.com/api/admin/price-monitor/run \
  -H "Cookie: next-auth.session-token=..."
```

**Response**:
```json
{
  "success": true,
  "message": "Price monitoring completed successfully",
  "summary": {
    "totalChecked": 50,
    "totalTriggered": 3,
    "totalFailed": 1,
    "duration": 12000,
    "executionTime": "2025-11-10T14:30:00.000Z",
    "triggeredBy": "admin@example.com"
  },
  "errors": []
}
```

#### Get Status

**GET /api/admin/price-monitor/status**

Get current monitoring system status.

**Authentication**: Session-based

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "statistics": {
    "totalActiveAlerts": 150,
    "lastRun": "2025-11-10T14:30:00.000Z",
    "nextScheduledRun": "2025-11-10T20:30:00.000Z",
    "successRate": 98.5,
    "recentErrors": 2
  },
  "lastExecution": {
    "alertsChecked": 50,
    "alertsTriggered": 3,
    "alertsFailed": 1,
    "duration": 12000
  },
  "health": {
    "status": "healthy",
    "message": "System is operating normally",
    "checks": {
      "successRate": {
        "value": 98.5,
        "threshold": 80,
        "passing": true
      },
      "recentErrors": {
        "value": 2,
        "threshold": 10,
        "passing": true
      }
    }
  }
}
```

#### Get Logs

**GET /api/admin/price-monitor/logs**

Get execution history logs.

**Query Parameters**:
- `limit`: Number of logs to return (default: 20, max: 100)
- `offset`: Number of logs to skip (default: 0)

**Request**:
```bash
curl -X GET "https://fly2any.com/api/admin/price-monitor/logs?limit=10&offset=0"
```

**Response**:
```json
{
  "success": true,
  "logs": [
    {
      "id": "clx456def",
      "executionTime": "2025-11-10T14:30:00.000Z",
      "alertsChecked": 50,
      "alertsTriggered": 3,
      "alertsFailed": 1,
      "duration": 12000,
      "triggeredBy": "cron",
      "hasErrors": true,
      "errors": [...]
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "currentPage": 1,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Components

### PriceMonitorControl

Admin control panel component for managing the monitoring system.

**Location**: `components/admin/PriceMonitorControl.tsx`

**Features**:
- System status overview
- Manual trigger button
- Execution history
- Real-time statistics
- Error reporting

**Usage**:
```tsx
import { PriceMonitorControl } from '@/components/admin/PriceMonitorControl';

export default function AdminPage() {
  return (
    <div>
      <PriceMonitorControl />
    </div>
  );
}
```

### PriceMonitorStats

Compact dashboard widget showing key metrics.

**Location**: `components/admin/PriceMonitorStats.tsx`

**Features**:
- Active alerts count
- Success rate
- Last execution stats
- Health status indicator
- Auto-refresh every 5 minutes

**Usage**:
```tsx
import { PriceMonitorStats } from '@/components/admin/PriceMonitorStats';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <PriceMonitorStats />
      {/* Other widgets */}
    </div>
  );
}
```

---

## Testing

### Running Tests Locally

**Test Script**: `scripts/test-price-monitor.ts`

```bash
# Run with tsx
npx tsx scripts/test-price-monitor.ts
```

The test script performs comprehensive testing:

1. **Setup Mock Data**: Creates test user and alerts
2. **Test Price Check**: Validates price fetching logic
3. **Test Single Alert**: Checks individual alert processing
4. **Test Monitor All**: Runs full monitoring cycle
5. **Test Price History**: Validates history tracking
6. **Test Statistics**: Checks stats calculation
7. **Test Execution Logs**: Validates log retrieval
8. **Test History Summary**: Checks summary generation

**Expected Output**:
```
============================================================
PRICE MONITORING SYSTEM - TEST SUITE
============================================================

Setting Up Mock Data
--------------------
✓ Test user created
✓ Created 5 mock price alerts

Test 1: Price Check for Route
------------------------------
Checking price for JFK → LAX...
✓ Price check successful: $345.50

Test 2: Check Single Alert
---------------------------
Checking alert: JFK → LAX...
  Current Price: $350.00
  Target Price: $300.00
✓ Alert checked. Current price: $345.50 (target not reached)

... (more tests)

============================================================
TEST SUMMARY
============================================================
Total Tests: 7
Passed: 7
Failed: 0
Duration: 3547ms

✓ All tests passed!
```

### Manual Testing

#### 1. Test Cron Endpoint

```bash
# Set your CRON_SECRET
export CRON_SECRET="your_secret_here"

# Call the endpoint
curl -X GET http://localhost:3000/api/cron/price-monitor \
  -H "Authorization: Bearer $CRON_SECRET"
```

#### 2. Test Admin Endpoints

```bash
# Get status (requires authentication)
curl -X GET http://localhost:3000/api/admin/price-monitor/status \
  -H "Cookie: next-auth.session-token=your_session_token"

# Manual trigger
curl -X POST http://localhost:3000/api/admin/price-monitor/run \
  -H "Cookie: next-auth.session-token=your_session_token"

# Get logs
curl -X GET "http://localhost:3000/api/admin/price-monitor/logs?limit=5"
```

#### 3. Test with Mock Data

Create test alerts in database:

```sql
-- Create test user (if not exists)
INSERT INTO users (id, email, name)
VALUES ('test-user-id', 'test@example.com', 'Test User');

-- Create test alerts
INSERT INTO price_alerts (
  id, user_id, origin, destination,
  depart_date, current_price, target_price,
  currency, active, triggered
) VALUES
  ('alert-1', 'test-user-id', 'JFK', 'LAX', '2025-12-15', 350, 300, 'USD', true, false),
  ('alert-2', 'test-user-id', 'LAX', 'SFO', '2025-12-20', 150, 120, 'USD', true, false);
```

Then trigger monitoring and verify results.

---

## Deployment

### Vercel Deployment

1. **Push to Repository**:
```bash
git add .
git commit -m "Add price monitoring system"
git push origin main
```

2. **Vercel Auto-Deploy**:
   - Vercel automatically deploys from main branch
   - Cron jobs are automatically configured from `vercel.json`

3. **Verify Cron Setup**:
   - Go to Vercel Dashboard → Your Project → Settings → Crons
   - Verify `/api/cron/price-monitor` is listed with schedule `0 */6 * * *`

4. **Set Environment Variables**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `CRON_SECRET` (production)
   - Ensure `RESEND_API_KEY` is set
   - Verify `POSTGRES_URL` is configured

5. **Test in Production**:
```bash
curl -X GET https://your-domain.vercel.app/api/cron/price-monitor \
  -H "Authorization: Bearer YOUR_PRODUCTION_CRON_SECRET"
```

### Database Migrations

Run migrations in production:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Or in Vercel dashboard
# Go to Settings → Environment Variables → Add migration script
```

### Monitoring First Run

After deployment:

1. Wait for first cron execution (within 6 hours)
2. Check Vercel logs: Dashboard → Deployments → Functions → Logs
3. Verify in admin dashboard: `/admin/price-monitor`
4. Check execution logs in database

---

## Monitoring & Observability

### Metrics to Track

#### System Health Metrics

- **Success Rate**: Percentage of successful alert checks (target: >95%)
- **Average Duration**: Time to complete monitoring cycle (target: <30s)
- **API Error Rate**: Failed API calls (target: <5%)
- **Email Delivery Rate**: Successful notifications (target: >99%)

#### Business Metrics

- **Active Alerts**: Total number of monitored alerts
- **Alerts Triggered**: Number of price targets reached
- **User Engagement**: Users with active alerts
- **Price Drop Detection**: Average time to detect and notify

### Logging

All executions are logged to `price_monitor_logs` table:

```sql
SELECT
  execution_time,
  alerts_checked,
  alerts_triggered,
  alerts_failed,
  duration,
  triggered_by
FROM price_monitor_logs
ORDER BY execution_time DESC
LIMIT 10;
```

### Alerts & Notifications

Set up alerts for:

1. **High Failure Rate** (>10% failed checks)
2. **Long Execution Time** (>60 seconds)
3. **No Recent Execution** (>8 hours since last run)
4. **Consistent API Errors** (>20 errors in 24 hours)

### Sentry Integration

The system logs errors to Sentry (if configured):

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await monitorAllActiveAlerts();
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'price-monitor' },
    extra: { alertsChecked, duration }
  });
}
```

---

## Troubleshooting

### Common Issues

#### Issue: Cron Not Running

**Symptoms**: No executions in logs, alerts not updating

**Solutions**:
1. Verify `vercel.json` is committed and deployed
2. Check Vercel Dashboard → Crons shows the job
3. Verify `CRON_SECRET` matches in code and Vercel
4. Check Vercel function logs for errors

#### Issue: All Checks Failing

**Symptoms**: High failure rate, alerts not triggering

**Solutions**:
1. Check API credentials (Amadeus/Duffel)
2. Verify API rate limits not exceeded
3. Check network connectivity
4. Review error logs for specific failures

#### Issue: Emails Not Sending

**Symptoms**: Alerts trigger but users don't receive emails

**Solutions**:
1. Verify `RESEND_API_KEY` is configured
2. Check Resend dashboard for delivery status
3. Verify email templates render correctly
4. Check user preferences allow price alert emails

#### Issue: Slow Execution

**Symptoms**: Monitoring takes >1 minute to complete

**Solutions**:
1. Reduce batch size (currently 5 concurrent)
2. Increase cache TTL for price checks
3. Optimize database queries (add indexes)
4. Consider splitting into multiple cron jobs

### Debug Mode

Enable debug logging:

```typescript
// In price-monitor.ts
const DEBUG = process.env.DEBUG_PRICE_MONITOR === 'true';

if (DEBUG) {
  console.log('[DEBUG] Alert:', alert);
  console.log('[DEBUG] Price:', currentPrice);
}
```

### Manual Recovery

If monitoring fails, manually trigger:

```bash
# Via API
curl -X POST https://your-domain.com/api/admin/price-monitor/run \
  -H "Cookie: your-session-cookie"

# Or via admin dashboard
# Navigate to /admin/price-monitor and click "Run Now"
```

---

## Performance Tuning

### Optimization Strategies

#### 1. Caching

Current cache: 1 hour TTL

Adjust in `price-monitor.ts`:

```typescript
const PRICE_CACHE_TTL = 3600000; // 1 hour

// For more aggressive caching:
const PRICE_CACHE_TTL = 7200000; // 2 hours
```

#### 2. Batch Size

Current: 5 concurrent checks

Adjust based on API limits:

```typescript
const MAX_CONCURRENT_CHECKS = 5;

// For faster processing (if API allows):
const MAX_CONCURRENT_CHECKS = 10;

// For strict rate limits:
const MAX_CONCURRENT_CHECKS = 3;
```

#### 3. Database Indexes

Ensure indexes are created:

```sql
-- Index on active alerts (most queried)
CREATE INDEX idx_price_alerts_active
ON price_alerts(active, triggered, last_checked);

-- Index on price history for quick lookups
CREATE INDEX idx_price_history_route
ON price_history(origin, destination, depart_date, timestamp);

-- Index on logs for dashboard queries
CREATE INDEX idx_monitor_logs_time
ON price_monitor_logs(execution_time DESC);
```

#### 4. Query Optimization

Use selective fields:

```typescript
// Instead of fetching everything:
const alerts = await prisma.priceAlert.findMany({
  where: { active: true, triggered: false },
  select: {
    id: true,
    origin: true,
    destination: true,
    departDate: true,
    targetPrice: true,
    user: {
      select: {
        email: true,
        preferences: {
          select: { priceAlertEmails: true }
        }
      }
    }
  }
});
```

#### 5. Background Processing

For very large alert volumes, consider:

1. **Queue System**: Use Redis + Bull/BullMQ
2. **Worker Processes**: Separate monitoring workers
3. **Sharding**: Split alerts across multiple cron jobs
4. **Priority Queues**: Process high-value routes first

### Scaling Recommendations

| Alert Volume | Configuration | Expected Duration |
|--------------|---------------|-------------------|
| < 100 alerts | Default (5 concurrent) | < 30 seconds |
| 100-500 alerts | 10 concurrent, 2hr cache | < 2 minutes |
| 500-1000 alerts | 10 concurrent, queue system | < 5 minutes |
| 1000+ alerts | Multiple workers, Redis cache | < 10 minutes |

---

## Next Steps

### Phase 1: Current (MVP)
- ✅ Basic monitoring system
- ✅ Mock price data
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ Cron scheduling

### Phase 2: Real API Integration
- [ ] Integrate Duffel API for real prices
- [ ] Integrate Amadeus API as fallback
- [ ] Add API error handling
- [ ] Implement rate limiting
- [ ] Cache optimization

### Phase 3: Advanced Features
- [ ] Price prediction ML model
- [ ] Smart notification timing
- [ ] Multi-currency support
- [ ] SMS notifications (optional)
- [ ] User-configurable schedules

### Phase 4: Analytics
- [ ] Price trend charts
- [ ] Savings calculator
- [ ] Route popularity insights
- [ ] Best time to book recommendations

---

## Support

For issues or questions:

1. Check this documentation first
2. Review error logs in admin dashboard
3. Check Vercel function logs
4. Test with manual trigger
5. Contact development team

---

## Changelog

### v1.0.0 (2025-11-10)
- Initial release
- Automated monitoring every 6 hours
- Email notifications
- Admin dashboard
- Price history tracking
- Execution logging
- Test suite

---

*Last Updated: November 10, 2025*
