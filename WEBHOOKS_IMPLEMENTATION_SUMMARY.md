# Duffel Webhooks Implementation - Complete Summary

## Overview

A comprehensive, production-ready webhook system for real-time order updates from Duffel API. This implementation includes security, monitoring, retry logic, and a full admin dashboard.

## Files Created

### 1. Webhook Event Handlers
**File:** `lib/webhooks/event-handlers.ts`

Core event processing logic for all Duffel webhook events:

- **orderCreatedHandler()** - Processes new order creation
- **orderCreationFailedHandler()** - Handles order creation failures
- **paymentSucceededHandler()** - Confirms successful payments
- **paymentFailedHandler()** - Handles payment failures
- **scheduleChangeHandler()** - Processes airline-initiated schedule changes
- **cancellationHandler()** - Handles order cancellations and refunds

**Features:**
- Updates booking status in database
- Links Duffel orders to internal bookings
- Triggers customer and admin notifications
- Comprehensive error handling

### 2. Notification Service
**File:** `lib/notifications/notification-service.ts`

Email notification service for all booking events:

**Customer Emails:**
- Order created confirmation
- Order creation failure
- Payment success with booking details
- Payment failure with retry instructions
- Schedule change alerts (urgent)
- Cancellation confirmation with refund details

**Admin Alerts:**
- Payment notifications
- Order failures
- Schedule changes (high priority)
- Cancellation notifications

**Features:**
- Beautiful HTML email templates
- Plain text fallbacks
- Resend integration
- Graceful fallback when email not configured

### 3. Webhook API Endpoint
**File:** `app/api/webhooks/duffel/route.ts`

Main webhook receiver with production-ready features:

**Security:**
- HMAC SHA256 signature verification
- Rate limiting (100 req/min per IP)
- Idempotency (prevents duplicate processing)
- IP-based request throttling

**Processing:**
- Asynchronous event handling
- Immediate 200 OK response to Duffel
- Background processing
- Comprehensive error logging

**Endpoints:**
- POST /api/webhooks/duffel - Receive webhooks
- GET /api/webhooks/duffel - Health check
- OPTIONS /api/webhooks/duffel - CORS preflight

### 4. Admin Webhooks API
**File:** `app/api/admin/webhooks/route.ts`

Admin API for webhook management:

**Features:**
- List webhook events with filtering
- Pagination support
- Event statistics
- Manual retry for failed events
- Event details retrieval

**Endpoints:**
- GET /api/admin/webhooks - List events
- POST /api/admin/webhooks - Retry failed events

### 5. Admin Dashboard UI
**File:** `app/admin/webhooks/page.tsx`

Beautiful admin interface for webhook monitoring:

**Features:**
- Real-time event monitoring
- Statistics dashboard:
  - Total events
  - Success/failure counts
  - Processing status
  - Success rate percentage
  - Last 24 hours activity
- Event filtering by status
- Search by ID, type, or error
- Event details modal with full JSON payload
- Manual retry for failed events
- Live status indicators

**Design:**
- Modern gradient UI
- Responsive design
- Interactive event viewer
- Real-time statistics

### 6. Database Migration
**File:** `lib/db/migrations/002_webhook_events.sql`

PostgreSQL schema for webhook event storage:

```sql
CREATE TABLE webhook_events (
  id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  received_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- Event type lookup
- Status filtering
- Date range queries
- Failed event retry queries

### 7. Migration Script
**File:** `scripts/run-webhook-migration.ts`

Automated migration runner:
```bash
npx tsx scripts/run-webhook-migration.ts
```

### 8. Documentation
**File:** `DUFFEL_WEBHOOKS_SETUP.md`

Comprehensive setup guide with:
- Quick start instructions
- Environment variable configuration
- Duffel dashboard setup
- Testing procedures
- Troubleshooting guide
- Production deployment checklist
- Monitoring recommendations

## Setup Instructions

### 1. Run Database Migration

```bash
npx tsx scripts/run-webhook-migration.ts
```

Or manually execute the SQL file.

### 2. Configure Environment Variables

Add to `.env.local`:

```env
# Duffel Webhook Secret
DUFFEL_WEBHOOK_SECRET=your_webhook_secret_here

# Admin Email
ADMIN_EMAIL=admin@fly2any.com

# Email Service (Optional - gracefully falls back)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=bookings@fly2any.com
```

### 3. Configure Duffel Webhook

1. Go to Duffel Dashboard
2. Add webhook: `https://your-domain.com/api/webhooks/duffel`
3. Enable events:
   - order.created
   - order.creation_failed
   - payment.succeeded
   - payment.failed
   - order.airline_initiated_change_detected
   - order_cancellation.confirmed

### 4. Test Webhook

```bash
# Health check
curl https://your-domain.com/api/webhooks/duffel

# Expected: {"status":"healthy",...}
```

## Architecture

```
Duffel → Webhook Endpoint → Signature Verification
                            ↓
                      Rate Limiting
                            ↓
                      Idempotency Check
                            ↓
                      Database Logging
                            ↓
                      Return 200 OK
                            ↓
                      Async Processing
                            ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
  Update Booking                      Send Notifications
        ↓                                      ↓
  Update Status                         Customer Email
                                               ↓
                                         Admin Alert
```

## Security Features

1. **Signature Verification**
   - HMAC SHA256
   - Timing-safe comparison
   - Prevents unauthorized webhooks

2. **Rate Limiting**
   - 100 requests/minute per IP
   - Prevents abuse and DoS

3. **Idempotency**
   - Events processed only once
   - Prevents duplicate actions

4. **Error Handling**
   - All errors logged to database
   - Failed events can be retried
   - No silent failures

## Event Processing Flow

1. **Receive Event**
   - Verify signature
   - Check rate limit
   - Validate payload

2. **Log Event**
   - Store in database
   - Status: received

3. **Return 200 OK**
   - Acknowledge receipt immediately
   - Prevents Duffel retry

4. **Process Asynchronously**
   - Update booking
   - Send notifications
   - Handle errors gracefully

5. **Update Status**
   - Mark as processed or failed
   - Log processing time
   - Track retry count

## Admin Dashboard Features

### Statistics
- Total events received
- Processing success rate
- Failed events count
- Events by type (last 24h)
- Performance metrics

### Event Management
- Filter by status
- Search by ID/type/error
- View full event details
- Manual retry for failures
- Real-time updates

### Monitoring
- Live processing status
- Error messages
- Retry counts
- Processing timestamps

## Supported Events

### 1. order.created
Updates booking with Duffel order details

### 2. order.creation_failed
Marks booking as failed, notifies customer

### 3. payment.succeeded
Confirms booking, sends confirmation email

### 4. payment.failed
Notifies customer to retry payment

### 5. order.airline_initiated_change_detected
High-priority alert for schedule changes

### 6. order_cancellation.confirmed
Processes refund, sends confirmation

## Email Notifications

### Customer Emails
- Modern HTML templates
- Flight details
- Booking references
- Action items
- Support contact

### Admin Alerts
- Critical event notifications
- Priority levels (low/normal/high)
- Full event details
- Actionable information

## Testing

### Local Testing
```bash
# Start dev server
npm run dev

# Use ngrok for webhooks
ngrok http 3000

# Configure ngrok URL in Duffel
```

### Test Events
Use Duffel's webhook tester or curl:

```bash
curl -X POST https://your-domain.com/api/webhooks/duffel \
  -H "Content-Type: application/json" \
  -H "X-Duffel-Signature: signature" \
  -d '{"id":"test_123","type":"order.created",...}'
```

## Monitoring Queries

```sql
-- Events in last 24 hours
SELECT event_type, COUNT(*)
FROM webhook_events
WHERE received_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type;

-- Failed events
SELECT *
FROM webhook_events
WHERE status = 'failed'
ORDER BY received_at DESC;

-- Success rate
SELECT
  COUNT(*) FILTER (WHERE status = 'processed') * 100.0 / COUNT(*) as success_rate
FROM webhook_events;
```

## Production Checklist

- [ ] Database migration completed
- [ ] Environment variables set
- [ ] Webhook registered in Duffel
- [ ] Signature verification working
- [ ] Email service configured
- [ ] Admin dashboard accessible
- [ ] Test webhook received
- [ ] Error monitoring setup

## Troubleshooting

### Webhooks not received
- Check webhook URL in Duffel
- Verify SSL certificate
- Check firewall settings
- Test health endpoint

### Signature verification fails
- Verify DUFFEL_WEBHOOK_SECRET
- Check for body modification
- Use raw body for verification

### Events not processing
- Check database connection
- Verify webhook_events table exists
- Check application logs
- Review error messages in admin dashboard

### Emails not sending
- Verify RESEND_API_KEY
- Check FROM_EMAIL is verified
- Review Resend dashboard
- System works without email (logs to console)

## Performance Considerations

- Events processed asynchronously
- Fast 200 OK response to Duffel
- Database indexes for fast queries
- Consider message queue for high volume
- Archive old events (>90 days)

## Future Enhancements

1. **Message Queue Integration**
   - Redis + Bull for async processing
   - Better handling of high volumes
   - Automatic retry with backoff

2. **Advanced Monitoring**
   - Sentry error tracking
   - DataDog performance monitoring
   - Custom alerting rules

3. **Event Replay**
   - Replay events for testing
   - Bulk event reprocessing
   - Event history analysis

4. **Webhook Simulator**
   - Test event generation
   - Payload validation
   - Integration testing

## Support Resources

- **Documentation:** See DUFFEL_WEBHOOKS_SETUP.md
- **Duffel Docs:** https://duffel.com/docs/api/webhooks
- **Admin Dashboard:** /admin/webhooks
- **Health Check:** /api/webhooks/duffel

---

## Summary

This is a complete, production-ready webhook implementation with:

✅ Security (signature verification, rate limiting)
✅ Reliability (idempotency, error handling, retry logic)
✅ Monitoring (admin dashboard, statistics, logging)
✅ Notifications (customer emails, admin alerts)
✅ Documentation (setup guide, troubleshooting)

The system is ready to handle real-time order updates from Duffel API in a secure, scalable, and maintainable way.
