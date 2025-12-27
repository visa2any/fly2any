# Fly2Any n8n Growth Automation Setup Guide

## Overview

This guide covers the setup and configuration of n8n workflows for Fly2Any's E2E growth automation system.

## Prerequisites

1. **n8n Instance** - Self-hosted (Railway/Render) or n8n Cloud
2. **Environment Variables** configured in Fly2Any
3. **API Credentials** for social platforms

---

## Environment Variables

Add these to your Fly2Any `.env`:

```env
# n8n Integration
N8N_WEBHOOK_SECRET=your-secure-random-string-here
N8N_WEBHOOK_URL=https://your-n8n-instance.railway.app/webhook
N8N_DISTRIBUTION_WEBHOOK_URL=https://your-n8n-instance.railway.app/webhook/deal-distribute

# For n8n to authenticate with Fly2Any
CRON_SECRET=your-cron-secret
```

Add these to your n8n instance:

```env
# Fly2Any API
FLY2ANY_API_URL=https://www.fly2any.com
FLY2ANY_API_KEY=your-api-key

# Mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mail.fly2any.com

# OpenAI (for content generation)
OPENAI_API_KEY=your-openai-key

# Social Media (configure in n8n credentials)
# - Twitter OAuth 2.0
# - Facebook Page Access Token
# - LinkedIn Page Access Token
```

---

## Workflow Import Instructions

### 1. Cart Abandonment Recovery

**File:** `cart-abandonment-recovery.json`

**Setup Steps:**
1. Import workflow into n8n
2. Configure Mailgun credentials (HTTP Basic Auth with `api:your-api-key`)
3. Configure Fly2Any webhook auth (HTTP Header: `Authorization: Bearer {{$env.N8N_WEBHOOK_SECRET}}`)
4. Set webhook URL in Fly2Any frontend

**Triggers:**
- Webhook: `POST /webhook/cart-abandoned`

**Expected Data:**
```json
{
  "abandonmentId": "abc123",
  "data": {
    "userId": "user-id",
    "email": "user@example.com"
  },
  "metadata": {
    "firstName": "John",
    "cartValue": 599,
    "cartItems": [...],
    "source": "flights"
  }
}
```

---

### 2. Post-Booking Upsell Sequence

**File:** `post-booking-upsell.json`

**Setup Steps:**
1. Import workflow
2. Configure Mailgun credentials
3. Configure Fly2Any API auth

**Triggers:**
- Webhook: `POST /webhook/booking-confirmed`

**Expected Data:**
```json
{
  "bookingId": "booking-123",
  "type": "flight",
  "email": "user@example.com",
  "destination": "Miami"
}
```

**Integration Point:**
Add to Stripe webhook handler in Fly2Any:
```typescript
// In /api/webhooks/stripe/route.ts
if (event.type === 'payment_intent.succeeded') {
  await fetch(process.env.N8N_WEBHOOK_URL + '/booking-confirmed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`
    },
    body: JSON.stringify({
      bookingId: booking.id,
      type: booking.type,
      email: booking.contactEmail,
      destination: booking.destination
    })
  });
}
```

---

### 3. Automated Deal Distribution

**File:** `deal-distribution.json`

**Setup Steps:**
1. Import workflow
2. Configure OpenAI credentials
3. Configure Twitter OAuth 2.0
4. Configure Mailgun credentials
5. Set schedule (default: every 2 hours)

**Features:**
- Fetches deals from `/api/flights/flash-deals-enhanced`
- Filters deals with >= 25% discount
- Generates AI social content
- Posts to Twitter (if optimal time)
- Sends email blast for deals >= 40% off

**Rate Limits Enforced:**
- Twitter: 4 posts/day max
- Email blast: 1/day max
- Posting only during optimal USA hours (8 AM, 12 PM, 5-7 PM ET)

---

### 4. Weekly Personalized Digest

**File:** `weekly-digest.json`

**Setup Steps:**
1. Import workflow
2. Configure Mailgun credentials
3. Set timezone to `America/New_York`

**Schedule:**
- Every Sunday at 9 AM ET

**Features:**
- Fetches active subscribers
- Gets top deals
- Sends personalized digest with up to 5 deals
- Includes unsubscribe link

---

## Mailgun Template Setup

Create these templates in Mailgun:

### cart-recovery-1
Subject: `Your trip is waiting - Complete your booking!`
Variables: `firstName`, `cartValue`, `recoveryUrl`

### cart-recovery-2
Subject: `Hurry! Your trip price may increase`
Variables: `firstName`, `cartValue`, `recoveryUrl`, `expiresIn`

### upsell-flight-to-hotel
Subject: `Complete your {destination} trip`
Variables: `firstName`, `destination`, `checkIn`, `hotelSearchUrl`

### upsell-hotel-to-transfer
Subject: `Enhance your {destination} stay`
Variables: `firstName`, `destination`, `transferSearchUrl`, `activitiesSearchUrl`

### weekly-digest
Subject: `This week's best deals - Up to {maxDiscount}% off`
Variables: `firstName`, `deals`, `unsubscribeUrl`

---

## Testing

### Test Cart Abandonment
```bash
curl -X POST https://your-n8n.railway.app/webhook/cart-abandoned \
  -H "Content-Type: application/json" \
  -d '{
    "abandonmentId": "test-123",
    "data": { "email": "test@example.com" },
    "metadata": { "firstName": "Test", "cartValue": 299 }
  }'
```

### Test Booking Upsell
```bash
curl -X POST https://your-n8n.railway.app/webhook/booking-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test-booking",
    "type": "flight",
    "email": "test@example.com",
    "destination": "Miami"
  }'
```

---

## Monitoring

### n8n Execution History
- Check workflow executions in n8n UI
- Monitor for failed executions
- Set up error notifications

### Fly2Any Analytics
- Track events in `/api/analytics/track`
- View email stats in admin dashboard
- Monitor conversion funnel

---

## Troubleshooting

### Webhook Not Receiving Data
1. Check webhook URL is correct
2. Verify `N8N_WEBHOOK_SECRET` matches
3. Check n8n workflow is active

### Emails Not Sending
1. Verify Mailgun credentials
2. Check Mailgun domain is verified
3. Review Mailgun logs for errors

### Social Posts Failing
1. Check API credentials are valid
2. Verify rate limits not exceeded
3. Check content length limits

---

## Revenue Impact Tracking

Monitor these metrics:

| Metric | Target | Dashboard |
|--------|--------|-----------|
| Cart recovery rate | 15-25% | `/admin/analytics` |
| Upsell conversion | 10-15% | `/admin/analytics` |
| Digest open rate | 25%+ | Mailgun analytics |
| Social engagement | Track impressions | Platform analytics |

---

## Support

- **Fly2Any Issues:** Check `/api/webhooks/n8n` logs
- **n8n Issues:** Review execution history
- **Mailgun Issues:** Check Mailgun dashboard logs
