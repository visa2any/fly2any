# Price Monitoring System - Quick Reference

## Quick Start

### 1. Setup Environment

```bash
# Add to .env
CRON_SECRET=your_secure_random_secret_here
RESEND_API_KEY=your_resend_api_key_here
```

### 2. Run Database Migration

```bash
npx prisma migrate dev --name add_price_monitoring
```

### 3. Test the System

```bash
npx tsx scripts/test-price-monitor.ts
```

### 4. Deploy to Vercel

```bash
git add .
git commit -m "Add price monitoring system"
git push origin main
```

---

## File Structure

```
lib/services/
├── price-monitor.ts          # Core monitoring logic
└── price-history.ts           # Price tracking service

app/api/
├── cron/price-monitor/
│   └── route.ts              # Cron endpoint (6h schedule)
└── admin/price-monitor/
    ├── run/route.ts          # Manual trigger
    ├── status/route.ts       # System status
    └── logs/route.ts         # Execution logs

components/admin/
├── PriceMonitorControl.tsx   # Full admin panel
└── PriceMonitorStats.tsx     # Dashboard widget

scripts/
└── test-price-monitor.ts     # Test suite

prisma/schema.prisma          # Database models
vercel.json                   # Cron configuration
```

---

## Key Endpoints

### Cron Job
```
GET /api/cron/price-monitor
Auth: Bearer {CRON_SECRET}
Schedule: Every 6 hours
```

### Admin APIs
```
POST /api/admin/price-monitor/run      # Manual trigger
GET  /api/admin/price-monitor/status   # Get status
GET  /api/admin/price-monitor/logs     # Get logs
```

---

## Testing Commands

```bash
# Run full test suite
npx tsx scripts/test-price-monitor.ts

# Test cron endpoint locally
curl -X GET http://localhost:3000/api/cron/price-monitor \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Manual trigger (requires auth)
curl -X POST http://localhost:3000/api/admin/price-monitor/run \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## Configuration

### Cron Schedule (vercel.json)

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

### Monitoring Settings (price-monitor.ts)

```typescript
const MAX_CONCURRENT_CHECKS = 5;      // Batch size
const REQUEST_TIMEOUT = 10000;        // 10 seconds
const MAX_RETRY_ATTEMPTS = 3;         // Retry failed requests
const PRICE_CACHE_TTL = 3600000;      // 1 hour cache
```

---

## Database Models

### PriceAlert
```prisma
- id, userId, origin, destination
- departDate, returnDate
- currentPrice, targetPrice, currency
- active, triggered, lastChecked
```

### PriceHistory
```prisma
- id, origin, destination, departDate
- price, currency, provider
- timestamp
```

### PriceMonitorLog
```prisma
- id, executionTime
- alertsChecked, alertsTriggered, alertsFailed
- duration, triggeredBy, errors
```

---

## Common Tasks

### Check System Status

Visit: `/admin/price-monitor` or call:

```bash
curl -X GET /api/admin/price-monitor/status
```

### Manually Trigger Monitoring

Click "Run Now" in admin panel or:

```bash
curl -X POST /api/admin/price-monitor/run
```

### View Execution Logs

Check admin dashboard or query database:

```sql
SELECT * FROM price_monitor_logs
ORDER BY execution_time DESC
LIMIT 10;
```

### Check Active Alerts

```sql
SELECT COUNT(*) FROM price_alerts
WHERE active = true AND triggered = false;
```

---

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Success Rate | >95% | Check dashboard |
| Avg Duration | <30s | Check logs |
| API Error Rate | <5% | Check logs |
| Cache Hit Rate | >70% | N/A (future) |

---

## Troubleshooting

### Cron Not Running
1. Check `vercel.json` is deployed
2. Verify Vercel Crons dashboard
3. Check `CRON_SECRET` matches

### Alerts Not Triggering
1. Verify alerts are active in database
2. Check price is at/below target
3. Test with manual trigger
4. Review error logs

### Emails Not Sending
1. Check `RESEND_API_KEY` configured
2. Verify user email preferences enabled
3. Check Resend dashboard for delivery status

---

## Monitoring Checklist

- [ ] Cron job appears in Vercel dashboard
- [ ] First execution completed successfully
- [ ] Execution logs showing in database
- [ ] Emails sent for triggered alerts
- [ ] Admin dashboard loading correctly
- [ ] Success rate >95%
- [ ] No consistent errors in logs

---

## Next Steps

1. **Monitor First Week**: Check daily for issues
2. **Review Metrics**: Success rate, duration, errors
3. **Tune Settings**: Adjust batch size if needed
4. **Add Real APIs**: Integrate Duffel/Amadeus
5. **Scale**: Optimize for more alerts

---

## Support Queries

### Get Recent Logs
```sql
SELECT
  execution_time,
  alerts_checked,
  alerts_triggered,
  duration,
  triggered_by
FROM price_monitor_logs
ORDER BY execution_time DESC
LIMIT 20;
```

### Get Active Alert Stats
```sql
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE triggered = false) as active,
  COUNT(*) FILTER (WHERE triggered = true) as triggered
FROM price_alerts
WHERE active = true;
```

### Get Price History
```sql
SELECT
  origin,
  destination,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price,
  COUNT(*) as data_points
FROM price_history
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY origin, destination
ORDER BY data_points DESC
LIMIT 10;
```

---

## Resources

- Full Documentation: `docs/PRICE_MONITORING_GUIDE.md`
- Test Script: `scripts/test-price-monitor.ts`
- Admin Dashboard: `/admin/price-monitor`
- Vercel Crons: https://vercel.com/docs/cron-jobs

---

*Quick Reference v1.0 - Last Updated: November 10, 2025*
