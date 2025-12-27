# E2E Growth Automation - Production Readiness Checklist

## Build Status: PASSED

The n8n growth automation system has been audited and is ready for production deployment.

---

## 1. Environment Variables Required

Add these to your `.env.local` (or Vercel environment variables):

### n8n Integration (Required)
```env
# n8n Webhook Secret - Generate with: openssl rand -base64 32
N8N_WEBHOOK_SECRET="your-secure-random-string"

# n8n Webhook Base URL (your n8n instance)
N8N_WEBHOOK_URL="https://your-n8n.railway.app/webhook"

# Distribution webhook for deal automation
N8N_DISTRIBUTION_WEBHOOK_URL="https://your-n8n.railway.app/webhook/deal-distribute"
```

### Mailgun (Already configured - verify these exist)
```env
MAILGUN_API_KEY="your-mailgun-api-key"
MAILGUN_DOMAIN="mg.fly2any.com"
EMAIL_FROM="Fly2Any <support@fly2any.com>"
```

---

## 2. n8n Instance Setup

### Deploy n8n (Railway recommended)
1. Go to https://railway.app/template/n8n
2. Deploy the n8n template
3. Note your webhook URL (e.g., `https://fly2any-n8n.railway.app`)

### Add n8n Environment Variables
In your n8n instance settings:
```env
FLY2ANY_API_URL=https://www.fly2any.com
FLY2ANY_CRON_SECRET=your-cron-secret
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.fly2any.com
OPENAI_API_KEY=sk-xxx  # For content generation
```

---

## 3. Import Workflows

Import these JSON files into your n8n instance:

| File | Purpose | Schedule |
|------|---------|----------|
| `cart-abandonment-recovery.json` | 2-email recovery sequence | Webhook triggered |
| `post-booking-upsell.json` | Flight→Hotel / Hotel→Transfer upsells | Webhook triggered |
| `deal-distribution.json` | Social + email deal distribution | Every 2 hours |
| `weekly-digest.json` | Personalized weekly deals digest | Sunday 9 AM ET |

### Import Steps:
1. Open n8n dashboard
2. Click "Add workflow" → "Import from file"
3. Select each JSON file
4. Configure credentials (see step 4)
5. Activate workflow

---

## 4. Configure n8n Credentials

Create these credentials in n8n:

### HTTP Header Auth (for Fly2Any API)
- Name: `Fly2Any API`
- Header Name: `Authorization`
- Header Value: `Bearer your-cron-secret`

### HTTP Basic Auth (for Mailgun)
- Name: `Mailgun`
- Username: `api`
- Password: `your-mailgun-api-key`

### Twitter OAuth 2.0 (optional - for social posting)
- Follow n8n's Twitter credential setup

### OpenAI (optional - for content generation)
- API Key from https://platform.openai.com

---

## 5. Mailgun Email Templates

Create these templates in Mailgun:

| Template Name | Purpose |
|--------------|---------|
| `cart-recovery-1` | Soft cart recovery (1hr) |
| `cart-recovery-2` | Urgent cart recovery (24hr) |
| `upsell-flight-to-hotel` | Post-flight hotel upsell |
| `upsell-hotel-to-transfer` | Post-hotel transfer/activities upsell |
| `weekly-digest` | Weekly personalized deals |

Template variables are documented in `N8N_SETUP_GUIDE.md`.

---

## 6. Integration Points (Already Configured)

These integrations are now active in the Fly2Any codebase:

### Flight Booking → n8n Upsell
- **File:** `app/api/booking-flow/confirm-booking/route.ts`
- **Trigger:** After successful flight booking
- **Webhook:** `POST /webhook/booking-confirmed`
- **Payload:** `{ bookingId, type: 'flight', email, destination, checkIn, ... }`

### Hotel Booking → n8n Upsell
- **File:** `app/api/hotels/booking/create/route.ts`
- **Trigger:** After successful hotel booking (step 8)
- **Webhook:** `POST /webhook/booking-confirmed`
- **Payload:** `{ bookingId, type: 'hotel', email, destination, checkIn, checkOut, ... }`

### Cart Abandonment (Frontend)
- **File:** `hooks/useCartAbandonment.ts`
- **Trigger:** Page unload during checkout
- **Webhook:** `POST /webhook/cart-abandoned`

### n8n Incoming Webhook
- **File:** `app/api/webhooks/n8n/route.ts`
- **Handles:** 12+ event types for analytics and automation

---

## 7. Testing

### Test Cart Abandonment
```bash
curl -X POST https://www.fly2any.com/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-n8n-webhook-secret" \
  -d '{
    "type": "cart_abandoned",
    "data": { "email": "test@example.com" },
    "metadata": { "firstName": "Test", "cartValue": 299 }
  }'
```

### Test Booking Upsell (in n8n)
```bash
curl -X POST https://your-n8n.railway.app/webhook/booking-confirmed \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-n8n-webhook-secret" \
  -d '{
    "bookingId": "FLY-TEST123",
    "type": "flight",
    "email": "test@example.com",
    "firstName": "John",
    "destination": "Miami"
  }'
```

---

## 8. Monitoring

### n8n Execution History
- Check workflow executions in n8n dashboard
- Set up error notifications to Telegram/email

### Fly2Any Logs
- Check `/api/webhooks/n8n` logs for incoming events
- Monitor Sentry for any automation errors

### Mailgun Analytics
- Track open rates in Mailgun dashboard
- Monitor bounce rates and spam complaints

---

## 9. Rate Limits

Built-in safeguards:

| Channel | Limit | Enforced In |
|---------|-------|-------------|
| Email (per user) | 1/day | n8n workflow |
| Twitter posts | 4/day | deal-distribution workflow |
| Instagram posts | 1/day | deal-distribution workflow |
| Weekly digest | 1/week | weekly-digest workflow |

---

## 10. Revenue Metrics to Track

| Metric | Target | Dashboard |
|--------|--------|-----------|
| Cart recovery rate | 15-25% | n8n + Mailgun |
| Upsell conversion | 10-15% | Fly2Any admin |
| Digest open rate | 25%+ | Mailgun |
| Social engagement | Track CTR | Platform analytics |

---

## Deployment Checklist

- [ ] Add `N8N_WEBHOOK_SECRET` to Vercel env vars
- [ ] Add `N8N_WEBHOOK_URL` to Vercel env vars
- [ ] Deploy n8n instance on Railway
- [ ] Import 4 workflow JSON files
- [ ] Configure n8n credentials (Mailgun, Fly2Any API)
- [ ] Create Mailgun email templates
- [ ] Test cart abandonment webhook
- [ ] Test booking confirmation webhook
- [ ] Activate all n8n workflows
- [ ] Monitor first executions

---

## Support

- **n8n Issues:** Check workflow execution history
- **Fly2Any API Issues:** Check `/api/webhooks/n8n` logs
- **Email Issues:** Check Mailgun dashboard

Last audited: 2025-12-27
