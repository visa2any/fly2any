# Duffel Webhooks - Quick Reference Card

## 🚀 Quick Setup (5 minutes)

### 1. Run Migration
```bash
npx tsx scripts/run-webhook-migration.ts
```

### 2. Add Webhook Secret
Get from Duffel Dashboard → Add to `.env.local`:
```env
DUFFEL_WEBHOOK_SECRET=your_secret_here
```

### 3. Register Webhook in Duffel
- URL: `https://your-domain.com/api/webhooks/duffel`
- Events: All order and payment events

### 4. Access Admin Dashboard
```
https://your-domain.com/admin/webhooks
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/api/webhooks/duffel/route.ts` | Main webhook endpoint |
| `lib/webhooks/event-handlers.ts` | Event processing logic |
| `lib/notifications/notification-service.ts` | Email notifications |
| `app/admin/webhooks/page.tsx` | Admin dashboard |
| `lib/db/migrations/002_webhook_events.sql` | Database schema |

## 🎯 Supported Events

| Event | Action |
|-------|--------|
| `order.created` | Update booking with Duffel ID |
| `order.creation_failed` | Notify failure |
| `payment.succeeded` | Confirm booking |
| `payment.failed` | Request retry |
| `order.airline_initiated_change_detected` | Alert schedule change |
| `order_cancellation.confirmed` | Process refund |

## 🔐 Security Features

- ✅ HMAC SHA256 signature verification
- ✅ Rate limiting (100 req/min per IP)
- ✅ Idempotency (prevents duplicates)
- ✅ Async processing (fast 200 OK)

## 📧 Email Notifications

### Customer Emails
- Order created
- Payment success/failure
- Schedule changes
- Cancellation confirmation

### Admin Alerts
- All critical events
- High-priority schedule changes
- Payment notifications

## 🎛️ Admin Dashboard

**URL:** `/admin/webhooks`

**Features:**
- Real-time event monitoring
- Filter by status
- Search events
- View full payloads
- Retry failed events
- Statistics dashboard

## 🧪 Testing

### Health Check
```bash
curl https://your-domain.com/api/webhooks/duffel
```

### Local Testing
```bash
npm run dev
ngrok http 3000
# Use ngrok URL in Duffel
```

## 📊 Database Schema

```sql
webhook_events
├── id (PRIMARY KEY)
├── event_type
├── event_data (JSONB)
├── status (received/processing/processed/failed)
├── error_message
├── retry_count
├── received_at
└── processed_at
```

## 🔍 Useful Queries

### Failed Events
```sql
SELECT * FROM webhook_events
WHERE status = 'failed'
ORDER BY received_at DESC;
```

### Success Rate
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'processed') * 100.0 / COUNT(*)
FROM webhook_events;
```

### Events Last 24h
```sql
SELECT event_type, COUNT(*)
FROM webhook_events
WHERE received_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type;
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No webhooks received | Check URL in Duffel, verify SSL |
| Signature fails | Verify DUFFEL_WEBHOOK_SECRET |
| Events not processing | Check database connection |
| Emails not sending | System works without email (logs to console) |

## 📝 Environment Variables

```env
# Required
DUFFEL_WEBHOOK_SECRET=xxx

# Optional (graceful fallback)
RESEND_API_KEY=xxx
FROM_EMAIL=bookings@fly2any.com
ADMIN_EMAIL=admin@fly2any.com
```

## 🎉 Key Features

1. **Production Ready** - Security, monitoring, error handling
2. **Admin Dashboard** - Beautiful UI for monitoring
3. **Email Notifications** - Customer + admin alerts
4. **Retry Logic** - Manual retry for failed events
5. **Full Logging** - All events logged to database
6. **Idempotent** - Processes each event only once
7. **Fast Response** - Async processing, immediate 200 OK

## 📞 Support

- **Setup Guide:** `DUFFEL_WEBHOOKS_SETUP.md`
- **Full Summary:** `WEBHOOKS_IMPLEMENTATION_SUMMARY.md`
- **Admin Dashboard:** `/admin/webhooks`
- **Health Check:** `/api/webhooks/duffel`

---

**Status:** ✅ Production Ready

**Security:** ✅ Signature verification, rate limiting, idempotency

**Monitoring:** ✅ Admin dashboard with full statistics

**Documentation:** ✅ Complete setup and troubleshooting guides
