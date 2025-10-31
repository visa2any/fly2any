# API Environment Setup - Test vs Production

## 🔍 Current Status: Test Mode with REAL Flight Data

Your application is currently displaying **REAL FLIGHT DATA** from the TEST/SANDBOX environment. This is the recommended setup for development.

### Important: Test Mode Shows REAL Data!

**Your `.env.local` file is configured for TEST/SANDBOX mode:**

```env
# Line 7: TEST ENVIRONMENT (real flight data, simulated bookings)
AMADEUS_ENVIRONMENT=test

# Line 12: TEST TOKEN (real flight offers, simulated payments)
DUFFEL_ACCESS_TOKEN=duffel_test_YOUR_TOKEN_HERE
```

### Test Environment Characteristics:

✅ **What Test Mode Provides:**
- **REAL flight data** - Actual prices and availability
- **REAL airline inventory** - Current market rates
- Simulated booking process (no actual tickets issued)
- Simulated payment processing (no charges)
- Free API calls (within rate limits)
- Perfect for development and testing
- Safe to test full booking flow

❌ **What Test Mode Doesn't Provide:**
- Actual ticket issuance
- Real payment processing
- Confirmed airline PNRs
- Customer support for bookings
- Ability to actually fly (no real tickets)

---

## 🚀 How to Switch to PRODUCTION (Real Data)

### Option 1: Use Amadeus Self-Service Production API

Amadeus offers production access through their self-service portal:

**Steps:**
1. **Apply for Production Access**
   - Go to: https://developers.amadeus.com/pricing
   - Sign in to your Amadeus account
   - Navigate to "My Apps" → Select your app
   - Click "Move to Production" or "Request Production Keys"

2. **Get Production Credentials**
   - Once approved, you'll receive:
     - `AMADEUS_API_KEY` (production)
     - `AMADEUS_API_SECRET` (production)

3. **Update `.env.local`**
   ```env
   # Amadeus API (PRODUCTION Environment)
   AMADEUS_API_KEY=YOUR_PRODUCTION_KEY_HERE
   AMADEUS_API_SECRET=YOUR_PRODUCTION_SECRET_HERE
   AMADEUS_ENVIRONMENT=production  # ⬅️ CHANGE THIS
   ```

**Amadeus Production Pricing:**
- **Flight Search API:** $2.50 per 1000 requests
- **Flight Offers Price:** $3.50 per 1000 requests
- **Flight Create Orders:** $20.00 per 1000 bookings

---

### Option 2: Use Duffel Production API

Duffel provides production access immediately:

**Steps:**
1. **Upgrade to Production**
   - Go to: https://app.duffel.com/
   - Navigate to Settings → API Keys
   - Create a new "Live" API key (starts with `duffel_live_`)

2. **Update `.env.local`**
   ```env
   # Duffel API (PRODUCTION)
   DUFFEL_ACCESS_TOKEN=duffel_live_YOUR_LIVE_TOKEN_HERE
   ```

**Duffel Production Pricing:**
- **Per Order:** $3.00 flat fee
- **Commission:** 1% of order value
- **Ancillaries:** $2.00 per ancillary service
- **Example:** $500 flight booking = $3 + $5 (1%) = $8 total cost

---

## 📊 Production vs Test Comparison

| Feature | Test Environment | Production Environment |
|---------|------------------|------------------------|
| **Data Source** | Real airline systems | Real airline systems |
| **Prices** | Real live market prices | Real live market prices |
| **Availability** | Real-time inventory | Real-time inventory |
| **Bookings** | Simulated (no tickets) | Real confirmed bookings |
| **Payments** | Simulated (no charges) | Real payments processed |
| **Tickets Issued** | ❌ No | ✅ Yes |
| **PNRs** | Test PNRs (invalid) | Real airline PNRs |
| **Cost** | Free (within limits) | Pay per transaction |
| **Use Case** | Development/Testing | Live production use |

---

## 🛠️ Current Configuration

### Amadeus API
```typescript
// lib/api/amadeus.ts:35-38
this.environment = process.env.AMADEUS_ENVIRONMENT || 'test';
this.baseUrl = this.environment === 'production'
  ? 'https://api.amadeus.com'              // ⬅️ Production URL
  : 'https://test.api.amadeus.com';        // ⬅️ Test URL (current)
```

**Current Status:** 🟡 **TEST MODE**
- Base URL: `https://test.api.amadeus.com`
- Returns: Simulated flight data
- Console shows: `✅ Amadeus API initialized (test environment)`

### Duffel API
```typescript
// Current token type: duffel_test_*
```

**Current Status:** 🟡 **TEST MODE**
- Returns: Simulated offer data
- Bookings: Not real

---

## 🎯 Recommended Approach

### For Development (Current - KEEP AS IS):
✅ Keep test credentials for development
✅ Perfect for:
- Building features
- Testing integrations
- Demo purposes
- Development environment

### For Production (When Ready to Launch):
1. ✅ Complete all feature development
2. ✅ Test thoroughly with test credentials
3. ✅ Apply for production API access
4. ✅ Update environment variables
5. ✅ Deploy to production
6. ✅ Monitor API costs closely

---

## 💰 Estimated Production Costs

**For 1000 flight searches with booking:**
- Amadeus Flight Search: $2.50
- Amadeus Price Check: $3.50
- Amadeus Booking (100 conversions): $2.00
- **Total Amadeus:** ~$8.00

**Or with Duffel:**
- Search: Free (included)
- Booking (100 conversions): $3 × 100 = $300
- Commission (1% of $50k): $500
- **Total Duffel:** ~$800

**Recommendation:** Use Amadeus for higher conversion rates, Duffel for ULCC coverage.

---

## 🔐 Security Note

**DO NOT commit production credentials to Git!**

Always use `.env.local` (already in `.gitignore`):
```bash
# .gitignore already includes:
.env.local
.env*.local
```

---

## 📝 Quick Switch Script

Create this script if you need to switch frequently:

```bash
# switch-to-production.sh
#!/bin/bash
echo "Switching to PRODUCTION mode..."
sed -i 's/AMADEUS_ENVIRONMENT=test/AMADEUS_ENVIRONMENT=production/' .env.local
echo "✅ Switched to production. Restart your dev server."
```

```bash
# switch-to-test.sh
#!/bin/bash
echo "Switching to TEST mode..."
sed -i 's/AMADEUS_ENVIRONMENT=production/AMADEUS_ENVIRONMENT=test/' .env.local
echo "✅ Switched to test. Restart your dev server."
```

---

## 🚨 Important Notes

1. **Test data is NOT real** - Don't trust test prices for business decisions
2. **Production requires approval** - Amadeus reviews applications
3. **Monitor costs carefully** - Production APIs charge per request
4. **Rate limits differ** - Production may have different rate limits
5. **Cache aggressively** - Your app already does this (good!)

---

## ✅ Verification

**To verify which mode you're in:**

1. Check console logs on startup:
   ```
   ✅ Amadeus API initialized (test environment)  // ⬅️ Currently here
   ✅ Amadeus API initialized (production environment)  // ⬅️ Production
   ```

2. Check the base URL being used:
   - Test: `https://test.api.amadeus.com`
   - Production: `https://api.amadeus.com`

3. Check flight data patterns:
   - Test: Consistent, repeatable results
   - Production: Dynamic, real-time results

---

## 📞 Support Contacts

**Amadeus Support:**
- Developer Portal: https://developers.amadeus.com/
- Support: https://developers.amadeus.com/support
- Pricing: https://developers.amadeus.com/pricing

**Duffel Support:**
- Dashboard: https://app.duffel.com/
- Documentation: https://duffel.com/docs
- Support: support@duffel.com

---

**Last Updated:** 2025-01-14
**Current Mode:** TEST (Development)
**Production Ready:** No (by design)
