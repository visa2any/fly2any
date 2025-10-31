# Duffel Webhooks Implementation Guide

Complete webhook system for real-time order updates from Duffel API.

## 🚀 Quick Start

### 1. Database Setup

Run the migration to create the webhook_events table:

```bash
# Run migration
npx tsx scripts/run-webhook-migration.ts
```

Or manually execute the SQL:

```sql
-- See: lib/db/migrations/002_webhook_events.sql
```

### 2. Environment Variables

Add to your `.env.local`:

```env
# Duffel Webhook Secret (get from Duffel dashboard)
DUFFEL_WEBHOOK_SECRET=your_webhook_secret_here

# Admin email for alerts
ADMIN_EMAIL=admin@fly2any.com

# Email service (for notifications)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=bookings@fly2any.com
```

### 3. Configure Duffel Webhook

1. Go to [Duffel Dashboard](https://app.duffel.com/webhooks)
2. Create a new webhook endpoint
3. Set URL: `https://your-domain.com/api/webhooks/duffel`
4. Copy the webhook secret to `DUFFEL_WEBHOOK_SECRET`
5. Enable these events:
   - `order.created`
   - `order.creation_failed`
   - `payment.succeeded`
   - `payment.failed`
   - `order.airline_initiated_change_detected`
   - `order_cancellation.confirmed`

### 4. Test Webhook

Test the endpoint is working:

```bash
curl https://your-domain.com/api/webhooks/duffel
```

Expected response:
```json
{
  "status": "healthy",
  "service": "duffel-webhooks",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "database": "connected"
}
```

## 📁 File Structure

```
fly2any-fresh/
├── app/
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── duffel/
│   │   │       └── route.ts              # Webhook endpoint handler
│   │   └── admin/
│   │       └── webhooks/
│   │           └── route.ts              # Admin API for webhooks
│   └── admin/
│       └── webhooks/
│           └── page.tsx                  # Admin dashboard UI
├── lib/
│   ├── webhooks/
│   │   └── event-handlers.ts            # Event processing logic
│   ├── notifications/
│   │   └── notification-service.ts      # Email notifications
│   └── db/
│       └── migrations/
│           └── 002_webhook_events.sql   # Database schema
└── scripts/
    └── run-webhook-migration.ts         # Migration runner
```

## 🔐 Security Features

### 1. Signature Verification

All webhooks are verified using HMAC SHA256:

```typescript
// Automatic verification in route.ts
const signature = req.headers.get('x-duffel-signature');
const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
```

### 2. Rate Limiting

- 100 requests per minute per IP
- Prevents abuse and DoS attacks

### 3. Idempotency

- Events are deduplicated by ID
- Prevents duplicate processing

### 4. Error Handling

- All errors are logged to database
- Failed events can be retried from admin panel

## 📊 Supported Events

### 1. Order Created (`order.created`)

**Triggered:** When an order is successfully created in Duffel
**Handler:** `orderCreatedHandler`
**Actions:**
- Updates booking with Duffel order ID
- Stores Duffel booking reference
- Sends confirmation email to customer

**Example Event:**
```json
{
  "id": "eve_00009hthhsUZ8W4LxQgkjo",
  "type": "order.created",
  "data": {
    "object": {
      "id": "ord_00009hthhsUZ8W4LxQgkjo",
      "booking_reference": "ABC123",
      "total_amount": "123.45",
      "total_currency": "USD"
    }
  }
}
```

### 2. Order Creation Failed (`order.creation_failed`)

**Triggered:** When order creation fails
**Handler:** `orderCreationFailedHandler`
**Actions:**
- Marks booking as cancelled
- Records error message
- Notifies customer and admin

### 3. Payment Succeeded (`payment.succeeded`)

**Triggered:** When payment is processed successfully
**Handler:** `paymentSucceededHandler`
**Actions:**
- Updates booking status to confirmed
- Updates payment status to paid
- Sends booking confirmation email
- Notifies admin of successful payment

**Example Event:**
```json
{
  "id": "eve_00009hthhsUZ8W4LxQgkjo",
  "type": "payment.succeeded",
  "data": {
    "object": {
      "id": "pay_00009hthhsUZ8W4LxQgkjo",
      "order_id": "ord_00009hthhsUZ8W4LxQgkjo",
      "amount": "123.45",
      "currency": "USD"
    }
  }
}
```

### 4. Payment Failed (`payment.failed`)

**Triggered:** When payment processing fails
**Handler:** `paymentFailedHandler`
**Actions:**
- Updates payment status to failed
- Records failure reason
- Sends payment failure email to customer
- Notifies admin

### 5. Schedule Change (`order.airline_initiated_change_detected`)

**Triggered:** When airline changes flight schedule
**Handler:** `scheduleChangeHandler`
**Actions:**
- Records schedule change in booking notes
- Sends urgent notification to customer
- Sends high-priority alert to admin
- Provides change details and new schedule

**Example Event:**
```json
{
  "id": "eve_00009hthhsUZ8W4LxQgkjo",
  "type": "order.airline_initiated_change_detected",
  "data": {
    "object": {
      "order_id": "ord_00009hthhsUZ8W4LxQgkjo",
      "change_type": "schedule_change",
      "description": "Flight departure time changed",
      "new_slices": [...]
    }
  }
}
```

### 6. Cancellation Confirmed (`order_cancellation.confirmed`)

**Triggered:** When order cancellation is confirmed
**Handler:** `cancellationHandler`
**Actions:**
- Updates booking status to cancelled
- Records refund details
- Sends cancellation confirmation email
- Notifies admin of refund

**Example Event:**
```json
{
  "id": "eve_00009hthhsUZ8W4LxQgkjo",
  "type": "order_cancellation.confirmed",
  "data": {
    "object": {
      "id": "orc_00009hthhsUZ8W4LxQgkjo",
      "order_id": "ord_00009hthhsUZ8W4LxQgkjo",
      "refund_amount": "100.00",
      "refund_currency": "USD"
    }
  }
}
```

## 📧 Email Notifications

The notification service sends emails for all major events:

### Customer Emails

1. **Order Created** - Confirms order creation
2. **Order Failed** - Notifies of creation failure
3. **Payment Success** - Confirms booking with e-ticket info
4. **Payment Failed** - Requests payment retry
5. **Schedule Change** - Urgent notification of flight changes
6. **Cancellation Confirmed** - Refund details

### Admin Alerts

All major events trigger admin notifications:
- Payment successes/failures
- Order creation failures
- Schedule changes (HIGH PRIORITY)
- Cancellations and refunds

## 🎛️ Admin Dashboard

Access: `https://your-domain.com/admin/webhooks`

### Features

1. **Event Monitoring**
   - View all webhook events
   - Filter by status (received, processing, processed, failed)
   - Search by event ID, type, or error message

2. **Statistics**
   - Total events received
   - Success/failure rates
   - Events by type (last 24 hours)
   - Processing metrics

3. **Event Details**
   - Full event payload
   - Processing status
   - Error messages
   - Retry count

4. **Manual Retry**
   - Retry failed events
   - View retry history
   - Monitor retry status

### Screenshots

**Dashboard Overview:**
- Real-time stats
- Recent events
- Status breakdown

**Event Details Modal:**
- Full JSON payload
- Processing timestamps
- Error details (if failed)

## 🔄 Event Processing Flow

```
1. Duffel sends webhook → POST /api/webhooks/duffel
                          ↓
2. Verify signature      (HMAC SHA256)
                          ↓
3. Check rate limit      (100/min per IP)
                          ↓
4. Check idempotency     (Skip if processed)
                          ↓
5. Log to database       (webhook_events table)
                          ↓
6. Return 200 OK         (Acknowledge receipt)
                          ↓
7. Process async         (Update booking, send emails)
                          ↓
8. Update status         (processed/failed)
```

## 🗄️ Database Schema

```sql
CREATE TABLE webhook_events (
  id VARCHAR(255) PRIMARY KEY,           -- Duffel event ID
  event_type VARCHAR(100) NOT NULL,      -- order.created, payment.succeeded, etc.
  event_data JSONB NOT NULL,             -- Full event payload
  status VARCHAR(20) NOT NULL,           -- received, processing, processed, failed
  error_message TEXT,                    -- Error if processing failed
  retry_count INTEGER DEFAULT 0,         -- Number of retry attempts
  received_at TIMESTAMP NOT NULL,        -- When event occurred
  processed_at TIMESTAMP,                -- When successfully processed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_received_at ON webhook_events(received_at DESC);
CREATE INDEX idx_webhook_events_failed ON webhook_events(status, retry_count)
  WHERE status = 'failed';
```

## 🧪 Testing

### Local Testing with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. Expose local server: `ngrok http 3000`
4. Use ngrok URL in Duffel webhook settings
5. Test with Duffel's webhook tester

### Test Events

Use Duffel's webhook tester to send test events:

```bash
# Test order.created
curl -X POST https://your-domain.com/api/webhooks/duffel \
  -H "Content-Type: application/json" \
  -H "X-Duffel-Signature: your_signature" \
  -d '{"id":"test_123","type":"order.created","data":{...}}'
```

## 🐛 Troubleshooting

### Issue: Webhook not receiving events

**Check:**
1. Webhook URL is correct in Duffel dashboard
2. Server is accessible (not localhost)
3. SSL certificate is valid
4. Firewall allows incoming webhooks

### Issue: Signature verification fails

**Check:**
1. `DUFFEL_WEBHOOK_SECRET` is set correctly
2. Secret matches Duffel dashboard
3. Request body hasn't been modified
4. Using raw body for verification

### Issue: Events not processing

**Check:**
1. Database connection is working
2. `webhook_events` table exists
3. Booking exists in database
4. Event handler isn't throwing errors

**View logs:**
```bash
# Check application logs
tail -f logs/app.log

# Check webhook event errors
SELECT * FROM webhook_events WHERE status = 'failed';
```

### Issue: Emails not sending

**Check:**
1. `RESEND_API_KEY` is set
2. `FROM_EMAIL` is verified in Resend
3. Email service is working
4. Check Resend dashboard for delivery logs

## 📈 Monitoring

### Key Metrics to Track

1. **Event Processing Rate**
   - Events per minute
   - Average processing time

2. **Success Rate**
   - Processed vs failed events
   - Retry success rate

3. **Event Types Distribution**
   - Most common events
   - Event frequency by type

4. **Error Rate**
   - Failed events percentage
   - Common error types

### Database Queries

```sql
-- Events in last 24 hours
SELECT
  event_type,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (processed_at - received_at))) as avg_processing_seconds
FROM webhook_events
WHERE received_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type;

-- Failed events needing retry
SELECT *
FROM webhook_events
WHERE status = 'failed'
  AND retry_count < 3
ORDER BY received_at DESC;

-- Success rate by event type
SELECT
  event_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'processed') as successful,
  ROUND(COUNT(*) FILTER (WHERE status = 'processed')::numeric / COUNT(*) * 100, 2) as success_rate_pct
FROM webhook_events
GROUP BY event_type;
```

## 🚀 Production Deployment

### Checklist

- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] Webhook URL registered in Duffel
- [ ] Signature verification enabled
- [ ] Rate limiting configured
- [ ] Email service configured
- [ ] Admin access secured
- [ ] Monitoring setup
- [ ] Error alerting configured

### Scaling Considerations

1. **Use Message Queue**
   - Consider Redis + Bull for high-volume events
   - Process events asynchronously
   - Enable retry with backoff

2. **Database Performance**
   - Partition webhook_events table by date
   - Archive old events (>90 days)
   - Add composite indexes for common queries

3. **Caching**
   - Cache booking lookups with Redis
   - Reduce database load

4. **Monitoring**
   - Set up Sentry for error tracking
   - Use DataDog/New Relic for performance
   - Alert on failed events

## 🆘 Support

### Resources

- [Duffel Webhooks Documentation](https://duffel.com/docs/api/webhooks)
- [Duffel API Reference](https://duffel.com/docs/api)
- [Resend Email API](https://resend.com/docs)

### Contact

- Email: support@fly2any.com
- Dashboard: https://your-domain.com/admin/webhooks

---

## 🎉 You're All Set!

Your Duffel webhook system is now ready to receive and process real-time order updates. Monitor the admin dashboard to ensure everything is working smoothly.

**Next Steps:**
1. Create a test booking
2. Watch webhooks arrive in admin dashboard
3. Verify emails are sent correctly
4. Set up production monitoring
