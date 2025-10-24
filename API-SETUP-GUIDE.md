# API Setup Guide - ULCC Pricing Solution

This guide will walk you through setting up the APIs needed to fix the $60 vs $270 pricing gap with ULCC carriers (Frontier, Spirit, Allegiant).

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Sign Up for Duffel API

Duffel provides instant access to 300+ airlines including Frontier and Spirit.

1. Visit https://app.duffel.com/join
2. Create an account (takes < 1 minute)
3. Go to your dashboard
4. Click "API Keys" or "Settings"
5. Copy your **Access Token**
6. Add to `.env.local`:
   ```env
   DUFFEL_ACCESS_TOKEN=your_token_here
   ```
7. Restart your dev server

**Cost:** Zero upfront. Pay-as-you-go:
- $3.00 per order
- 1% of total order value
- $2.00 per paid ancillary
- 1500:1 search-to-book ratio free (then $0.005/search)

**What you'll get:**
- Access to 300+ airlines including Frontier (via GDS)
- Better coverage than Amadeus alone
- Same $270 Frontier prices (GDS limitation)

---

## 🎯 Ultimate Solution: Frontier NDC API

To get the $60 unbundled fares, you need direct NDC access to Frontier.

### Step 2: Apply for Frontier NDC API

1. **Visit Frontier Developer Portal:**
   https://developer.flyfrontier.com/

2. **Review API Documentation:**
   https://developer.flyfrontier.com/api-documentation

3. **Register for NDC Access:**
   https://developer.flyfrontier.com/ndc-registration

4. **Complete Certification Process:**
   https://developer.flyfrontier.com/certification

5. **Wait for Approval:**
   - Expected timeline: 1-2 weeks
   - Frontier will review your application
   - You'll receive API credentials via email

6. **Add Credentials to `.env.local`:**
   ```env
   FRONTIER_NDC_API_KEY=your_key_here
   FRONTIER_NDC_API_SECRET=your_secret_here
   FRONTIER_NDC_ENVIRONMENT=test  # or 'production'
   ```

**What you'll need to provide:**
- Company information
- Business registration details
- Expected booking volume
- Integration timeline
- Technical contact information

**Expected Pricing:**
- Unknown (likely partnership/volume-based)
- Contact Frontier directly for commercial terms

**What you'll get:**
- Direct access to $60 unbundled "Basic Fare"
- All fare families (Basic → Standard → Flexible → Works)
- Ancillary pricing (bags, seats, etc.)
- Real-time availability and pricing

---

## 🚀 Implementation Status

### ✅ Completed

1. **Duffel API Client** (`lib/api/duffel.ts`)
   - Searches 300+ airlines
   - Converts Duffel format to our standard format
   - Handles errors gracefully

2. **Multi-Source Search** (`app/api/flights/search/route.ts`)
   - Queries Amadeus + Duffel in parallel
   - Merges results
   - Deduplicates flights
   - Keeps cheapest price for each unique flight

3. **Price Comparison Logic**
   - Automatically selects cheapest option
   - Logs price differences
   - Displays source (Amadeus vs Duffel)

### ⏳ Pending

4. **Frontier NDC Integration** (AFTER approval)
   - Create `lib/api/frontier-ndc.ts`
   - Add to multi-source search
   - Map Frontier NDC format to standard format
   - Enable unbundled $60 fares

5. **Spirit Airlines NDC** (Long-term)
   - No direct developer portal found
   - Available through Duffel (GDS only)
   - May need to contact Spirit directly

6. **Allegiant Airlines** (Long-term)
   - No public API program
   - Would need direct partnership

---

## 📊 Expected Results

### Before (Amadeus Only)

| Route | Current Price | Priceline Price | Gap |
|-------|---------------|-----------------|-----|
| JFK → MIA | $270 | $60 | $210 |
| **Status:** Not competitive | | | **4.5x more** |

### After Phase 1 (Amadeus + Duffel)

| Route | Amadeus | Duffel | Best Price | Improvement |
|-------|---------|--------|------------|-------------|
| JFK → MIA | $270 | $270 | $270 | None (both use GDS) |
| LAX → NYC | $189 | $185 | $185 | **-$4** |
| SFO → MIA | $245 | $242 | $242 | **-$3** |

**Benefit:** Better coverage, slight price improvements for non-ULCC carriers.

### After Phase 2 (Amadeus + Duffel + Frontier NDC)

| Route | Amadeus | Duffel | Frontier NDC | Best Price | Improvement |
|-------|---------|--------|--------------|------------|-------------|
| JFK → MIA | $270 | $270 | **$60** | **$60** | **-$210 (-78%)** |
| **Status:** PRICE COMPETITIVE WITH PRICELINE | | | | |

**Benefit:** Show BOTH $60 basic and $270 bundled options. Let users choose.

---

## 🧪 Testing

Once you have Duffel API token, test the integration:

```bash
# 1. Add Duffel token to .env.local
DUFFEL_ACCESS_TOKEN=your_actual_token

# 2. Restart dev server
npm run dev

# 3. Test search (JFK → MIA, same route as Priceline comparison)
curl -X POST http://localhost:3000/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "MIA",
    "departureDate": "2025-11-05",
    "returnDate": "2025-11-12",
    "adults": 1,
    "travelClass": "economy"
  }'

# 4. Check console logs for:
#   - "Amadeus: X flights, Duffel: Y flights"
#   - "💰 Found cheaper price: Duffel $XXX < Amadeus $XXX"
#   - Total flights after dedup
```

### Expected Console Output

```
🛫 Searching 1 airport combination(s)...
  Searching: JFK → MIA
🔍 Searching Duffel API: { origin: 'JFK', destination: 'MIA', ... }
    Amadeus: 47 flights, Duffel: 52 flights
Total flights before dedup: 99
  💰 Found cheaper price: Duffel $185 < Amadeus $189
  💰 Found cheaper price: Duffel $242 < Amadeus $245
Total flights after dedup: 68
✅ Returning 68 flights
```

---

## 💡 Troubleshooting

### Duffel Returns 0 Flights

**Cause:** Invalid access token or API connection issue

**Solution:**
1. Verify token in `.env.local` is correct
2. Check Duffel dashboard for API key status
3. Ensure no typos or extra spaces in token
4. Restart dev server after adding token

### "DUFFEL_ACCESS_TOKEN not set" Warning

**Cause:** Environment variable not loaded

**Solution:**
1. Ensure token is in `.env.local` (NOT `.env`)
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Check console for "✅ Duffel API initialized"

### Duffel Returns Same Prices as Amadeus

**Expected Behavior:** Duffel accesses Frontier via GDS (Travelport), so you'll see the same $270 bundled fares. This is normal until you get Frontier NDC access.

### Frontier Still Shows $270 After Duffel Integration

**Root Cause:** Both Amadeus and Duffel use GDS, which only has bundled fares.

**Solution:** Apply for Frontier NDC API (Step 2 above). Only NDC will give you $60 basic fares.

---

## 📞 Support Contacts

### Duffel Support
- **Email:** help@duffel.com
- **Docs:** https://duffel.com/docs
- **Status:** https://status.duffel.com

### Frontier Airlines Developer Support
- **Portal:** https://developer.flyfrontier.com/
- **Registration:** https://developer.flyfrontier.com/ndc-registration
- **Contact:** Available on registration page

---

## 🎯 Next Steps

1. ✅ **NOW:** Sign up for Duffel API (5 minutes)
2. ✅ **NOW:** Add Duffel token to `.env.local`
3. ✅ **NOW:** Test JFK → MIA search
4. ✅ **NOW:** Apply for Frontier NDC API
5. ⏳ **WAIT:** Frontier NDC approval (1-2 weeks)
6. ⏳ **AFTER APPROVAL:** Implement Frontier NDC integration
7. ⏳ **AFTER APPROVAL:** Test $60 basic fare pricing
8. ⏳ **DEPLOY:** Push to production with competitive ULCC pricing

---

## 💰 Cost Analysis

### Current Cost (Amadeus Only)
- $0/month (test tier)
- No bookings enabled yet

### After Duffel Integration (Estimated)
- **Per 100 bookings:**
  - Orders: $3 × 100 = $300
  - Managed content: 1% × $200 × 100 = $200
  - Ancillaries: $2 × 50 = $100
  - **Total: ~$600/100 bookings = $6/booking**

- **Per 1,000 bookings:**
  - ~$6,000 + Frontier NDC fees (TBD)

### Revenue Impact
- Average commission: $15/booking
- **Need 40% of new bookings** to cover Duffel costs
- If competitive pricing drives >40% lift, ROI is positive

### Break-Even Analysis
- Current: $0 cost, 0 bookings
- After Duffel: $6/booking cost
- If we capture 10% more bookings: +$1.50 net profit/booking
- If we capture 50% more bookings: +$9 net profit/booking

**Conclusion:** Worth it if we can prove conversion lift from competitive pricing.

---

## 📝 Summary

**Problem:** Our site shows $270, Priceline shows $60 (4.5x difference)

**Cause:** Amadeus GDS doesn't have ULCC unbundled fares

**Solution:**
1. **Immediate (5 min):** Add Duffel API for better coverage
2. **Short-term (1-2 weeks):** Apply for Frontier NDC
3. **After approval:** Implement Frontier NDC for $60 fares

**Expected Outcome:** Price-competitive with Priceline, Kayak, Google Flights

**Cost:** ~$6/booking (justified by conversion lift)

**Action Required:** Sign up for Duffel NOW, apply for Frontier NDC NOW
