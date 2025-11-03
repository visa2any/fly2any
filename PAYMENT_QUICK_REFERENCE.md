# Payment Integration - Quick Reference Card

**⚡ 5-Minute Setup | 🔒 PCI-Compliant | 💰 Production-Ready**

---

## 🚀 Quick Start

### 1. Get Stripe Keys (2 min)
```bash
# Sign up: https://dashboard.stripe.com/register
# Get keys: https://dashboard.stripe.com/test/apikeys

# Copy both keys:
Publishable: pk_test_51...
Secret:      sk_test_51...
```

### 2. Set Environment Variables (1 min)
```bash
# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
EOF
```

### 3. Test Payment (2 min)
```bash
npm run dev

# Navigate to: http://localhost:3000
# Search flight → Book → Use test card: 4242 4242 4242 4242
# Expiry: 12/25, CVV: 123, ZIP: 12345
```

---

## 📋 API Endpoints

### Create Payment Intent
```bash
POST /api/payments/create-intent
Content-Type: application/json

{
  "amount": 599.99,
  "currency": "USD",
  "bookingReference": "FLY2A-ABC123",
  "customerEmail": "john@example.com",
  "customerName": "John Doe",
  "description": "Flight booking"
}

# Response:
{
  "success": true,
  "paymentIntent": {
    "clientSecret": "pi_xxx_secret_yyy",
    "paymentIntentId": "pi_xxx"
  }
}
```

### Confirm Payment
```bash
POST /api/payments/confirm
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx",
  "bookingReference": "FLY2A-ABC123"
}

# Response:
{
  "success": true,
  "payment": {
    "status": "succeeded",
    "amount": 599.99,
    "cardLast4": "4242",
    "cardBrand": "visa"
  },
  "booking": {
    "status": "confirmed"
  }
}
```

### Create Booking
```bash
POST /api/bookings
Content-Type: application/json

{
  "contactInfo": {
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "flight": { ... },
  "passengers": [ ... ],
  "payment": {
    "method": "credit_card",
    "status": "pending",
    "amount": 599.99,
    "currency": "USD"
  }
}
```

---

## 💳 Test Cards

| Scenario | Card Number | Result |
|----------|-------------|--------|
| **Success** | 4242 4242 4242 4242 | ✅ Payment succeeds |
| **3D Secure** | 4000 0025 0000 3155 | 🔐 Requires authentication |
| **Decline** | 4000 0000 0000 0002 | ❌ Card declined |
| **Insufficient** | 4000 0000 0000 9995 | ❌ Insufficient funds |

**All test cards:** Expiry: 12/25, CVV: 123, ZIP: Any

---

## 🎨 Frontend Usage

### Basic Payment Form
```typescript
import { StripePaymentForm } from '@/components/booking/StripePaymentForm';

function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent
    fetch('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        amount: 599.99,
        currency: 'USD',
        bookingReference: 'FLY2A-ABC123',
        customerEmail: 'john@example.com',
        customerName: 'John Doe'
      })
    })
    .then(r => r.json())
    .then(data => setClientSecret(data.paymentIntent.clientSecret));
  }, []);

  return (
    <StripePaymentForm
      clientSecret={clientSecret}
      amount={599.99}
      currency="USD"
      bookingReference="FLY2A-ABC123"
      onSuccess={(paymentIntentId) => {
        // Payment succeeded
        router.push('/confirmation');
      }}
      onError={(error) => {
        // Payment failed
        console.error(error);
      }}
    />
  );
}
```

---

## 🔐 Security Checklist

### ✅ Must-Have (Production)
- [ ] HTTPS enabled
- [ ] API keys in environment variables
- [ ] Webhook signature verification
- [ ] Input validation
- [ ] Error handling (no sensitive data exposed)

### 🎯 Recommended
- [ ] Rate limiting (5 requests/min)
- [ ] Fraud detection (Stripe Radar)
- [ ] Monitoring (Sentry)
- [ ] 3D Secure enabled

### ❌ Never Do
- [ ] Store card numbers
- [ ] Store CVV codes
- [ ] Expose secret keys to client
- [ ] Disable webhook signature verification
- [ ] Trust client-side data

---

## 🐛 Troubleshooting

### "STRIPE_SECRET_KEY not set"
```bash
# Add to .env.local
STRIPE_SECRET_KEY=sk_test_51...

# Restart server
npm run dev
```

### Stripe Elements not loading
```bash
# Check key name (must have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51...

# NOT: STRIPE_PUBLIC_KEY (won't work in client)
```

### Payment succeeds but booking not updated
```bash
# Check webhook configuration
1. Webhook registered in Stripe Dashboard
2. STRIPE_WEBHOOK_SECRET set correctly
3. Webhook endpoint accessible: POST /api/payments/webhook

# Test webhook locally:
stripe listen --forward-to localhost:3000/api/payments/webhook
stripe trigger payment_intent.succeeded
```

### 3D Secure redirect loop
```typescript
// Use absolute URL, not relative
return_url: `${window.location.origin}/payments/confirm/${ref}`
// NOT: return_url: `/payments/confirm/${ref}`
```

---

## 📊 Database Queries

### Get recent bookings
```sql
SELECT
  booking_reference,
  status,
  contact_info->>'email' as email,
  payment->>'status' as payment_status,
  total_amount,
  currency,
  created_at
FROM bookings
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 50;
```

### Check payment status
```sql
SELECT
  booking_reference,
  status,
  payment->'status' as payment_status,
  payment->'transactionId' as stripe_payment_id,
  total_amount
FROM bookings
WHERE booking_reference = 'FLY2A-ABC123';
```

### Revenue today
```sql
SELECT
  COUNT(*) as bookings,
  SUM(total_amount) as revenue,
  currency
FROM bookings
WHERE
  created_at >= CURRENT_DATE
  AND status = 'confirmed'
  AND payment->>'status' = 'paid'
GROUP BY currency;
```

---

## 🚨 Emergency Procedures

### Leaked API Key
```bash
1. Go to: https://dashboard.stripe.com/apikeys
2. Click "Roll key" on compromised key
3. Update .env.local with new key
4. Redeploy: git push origin main
5. Monitor Stripe logs for unauthorized usage
```

### Payment Outage
```bash
1. Check Stripe Status: https://status.stripe.com
2. Check logs: npm run dev (look for errors)
3. Test with curl:
   curl -X POST http://localhost:3000/api/payments/create-intent \
     -H "Content-Type: application/json" \
     -d '{"amount":1.00,"currency":"USD","bookingReference":"TEST","customerEmail":"test@example.com","customerName":"Test"}'
```

### Webhook Not Firing
```bash
1. Check webhook endpoint: https://dashboard.stripe.com/webhooks
2. Verify endpoint URL is correct
3. Check webhook secret matches STRIPE_WEBHOOK_SECRET
4. Test locally with Stripe CLI:
   stripe listen --forward-to localhost:3000/api/payments/webhook
```

---

## 📈 Monitoring

### Key Metrics
```typescript
// Payment success rate
const successRate = (succeededPayments / totalPayments) * 100;
// Target: >95%

// Average payment time
const avgTime = totalPaymentTime / totalPayments;
// Target: <3 seconds

// 3D Secure rate
const threeDSRate = (threeDSPayments / totalPayments) * 100;
// Expected: 10-20%

// Decline rate
const declineRate = (declinedPayments / totalPayments) * 100;
// Target: <5%
```

### Stripe Dashboard
- **Payments:** https://dashboard.stripe.com/payments
- **Logs:** https://dashboard.stripe.com/logs
- **Webhooks:** https://dashboard.stripe.com/webhooks
- **Radar:** https://dashboard.stripe.com/radar

---

## 🔗 Important Links

### Documentation
- **Main Guide:** `PAYMENT_INTEGRATION_COMPLETE_GUIDE.md`
- **Security:** `PAYMENT_SECURITY_CHECKLIST.md`
- **Booking Flow:** `BOOKING_FLOW_IMPLEMENTATION.md`

### Stripe Resources
- **Dashboard:** https://dashboard.stripe.com
- **API Docs:** https://stripe.com/docs/api
- **Testing:** https://stripe.com/docs/testing
- **Support:** https://support.stripe.com

### Internal
- Payment Service: `lib/payments/payment-service.ts`
- API Routes: `app/api/payments/`
- Components: `components/booking/StripePaymentForm.tsx`
- Database: `lib/bookings/storage.ts`

---

## ✅ Production Checklist

### Before Launch
- [ ] Switch to live Stripe keys
- [ ] Configure production webhook
- [ ] Enable Stripe Radar
- [ ] Set up email notifications
- [ ] Configure rate limiting
- [ ] Test complete flow 3x
- [ ] Monitor for 24 hours

### Day 1
- [ ] Monitor payment success rate
- [ ] Check webhook delivery
- [ ] Verify emails sending
- [ ] Watch for errors in logs
- [ ] Test refund process

### Week 1
- [ ] Review payment patterns
- [ ] Optimize decline rate
- [ ] Update fraud rules
- [ ] Gather user feedback
- [ ] Plan improvements

---

## 💡 Pro Tips

### Performance
```typescript
// Cache payment intents (15 min)
const cache = new Map();

// Lazy load Stripe SDK
const StripeForm = dynamic(() => import('./StripePaymentForm'), {
  ssr: false
});

// Use webhook for async operations
// Don't wait for confirmation in payment flow
```

### Error Handling
```typescript
// Always show generic errors to users
try {
  await stripe.confirmPayment({...});
} catch (error) {
  // Log full error
  console.error(error);

  // Show generic message
  setError('Payment failed. Please try again.');
  // NOT: setError(error.message) ❌
}
```

### Testing
```bash
# Test all scenarios
- Success: 4242 4242 4242 4242
- 3D Secure: 4000 0025 0000 3155
- Decline: 4000 0000 0000 0002
- Insufficient: 4000 0000 0000 9995
- Expired: 4000 0000 0000 0069
- Incorrect CVC: 4000 0000 0000 0127

# Test webhook delivery
stripe listen --forward-to localhost:3000/api/payments/webhook

# Trigger events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

---

## 📞 Support

**Need Help?**
- Stripe Support: support@stripe.com
- Stripe Chat: Available in dashboard
- Documentation: All files in project root

**Common Issues:**
- Keys not working: Check environment variable names
- Elements not loading: Verify public key has `NEXT_PUBLIC_` prefix
- Webhooks not firing: Check endpoint URL and secret
- Payments not confirming: Verify webhook handler

---

**Last Updated:** 2025-06-01
**Version:** 1.0.0
**Status:** ✅ Production Ready
