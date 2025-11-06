# ✅ Production Deployment - Quick Test Checklist

**Preview**: DQ65LxYk2 → **Production**: Df73GmSgp
**Date**: _____________ **Tester**: _____________

---

## 🚨 PRE-FLIGHT (5 minutes)

- [ ] Verify Stripe keys: `pk_test_...` and `sk_test_...` (NOT live!)
- [ ] Verify Duffel token: `duffel_test_...`
- [ ] Database connection working
- [ ] Rollback plan documented (deployment ID: Df73GmSgp)

---

## 🎯 CRITICAL PATH (20 minutes)

### 1. Homepage (2 min)
- [ ] Homepage loads in < 3 seconds
- [ ] No console errors
- [ ] AI assistant bubble visible (bottom right)
- [ ] All images load

### 2. AI Assistant (3 min)
- [ ] Click AI bubble → Modal opens
- [ ] Send "Hello" → Response within 3s
- [ ] Consultant avatar shows (name + team)
- [ ] Session created (check Network tab for /api/ai/session)

### 3. Flight Search (5 min)
- [ ] In AI: "Find flights from JFK to LAX on Dec 15"
- [ ] Results appear in < 5s
- [ ] At least 3 flight options
- [ ] Prices look realistic ($200-$600 range)
- [ ] Airline logos load
- [ ] Cache working (search same route again = instant)

### 4. Booking Flow - 9 Stages (10 min)

#### Stage 1-2: Discovery & Flight Selection
- [ ] Select a flight → Highlights correctly
- [ ] Progress shows "2/9"

#### Stage 3: Fare Selection
- [ ] Fare options display (Economy/Business)
- [ ] Select Economy → Price updates

#### Stage 4: Seat Selection
- [ ] Seat map loads
- [ ] Select seat 12A → Highlights
- [ ] OR click "Skip" → Proceeds to next stage

#### Stage 5: Baggage
- [ ] Add 1 checked bag → Fee added to total
- [ ] OR skip

#### Stage 6: Extras
- [ ] Click "Continue" (skip extras)

#### Stage 7: Review & Passenger Details
- [ ] Booking summary shows all details
- [ ] Total = Base + Taxes + Fees
- [ ] Enter passenger:
  - First Name: Test
  - Last Name: User
  - Email: test@example.com
  - Phone: +1234567890

#### Stage 8: Payment (CRITICAL!)
- [ ] Payment form loads (Stripe Elements)
- [ ] **VERIFY TEST MODE**: Check public key starts with `pk_test_`
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Expiry: 12/34, CVC: 123
- [ ] Submit payment
- [ ] API call to `/api/booking-flow/create-payment-intent` → 201
- [ ] API call to `/api/booking-flow/confirm-booking` → 201

#### Stage 9: Confirmation
- [ ] Booking reference shown (e.g., FLY2A-ABC123)
- [ ] Success message displays
- [ ] Flight details match

---

## ⚡ PERFORMANCE (5 minutes)

- [ ] Run Lighthouse on homepage → Score > 85
- [ ] Check Network tab:
  - [ ] Page load < 3s
  - [ ] JavaScript bundle < 500KB
  - [ ] No failed requests
- [ ] Console has zero errors

---

## 📱 MOBILE (5 minutes)

- [ ] Open Chrome DevTools → Device Toolbar
- [ ] Test iPhone 13 Pro (390x844)
  - [ ] Homepage fits screen
  - [ ] AI chat goes full-screen
  - [ ] Booking flow works on mobile
  - [ ] No horizontal scroll

---

## 🔌 API HEALTH (Quick Curl Tests)

```bash
# Test 1: AI Session Creation
curl -X POST https://fly2any.com/api/ai/session \
  -H "Content-Type: application/json" \
  -d '{"action":"create"}'
# Expected: 200, sessionId returned

# Test 2: Flight Search
curl -X POST https://fly2any.com/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2024-12-15",
    "adults": 1
  }'
# Expected: 200, flights array with results
```

- [ ] Session API returns 200
- [ ] Flight search returns flights
- [ ] Response times < 5s

---

## 🔐 ENVIRONMENT VALIDATION

- [ ] Open browser console
- [ ] Check for startup logs showing:
  - ✅ Payment Processing: Enabled
  - ✅ Flight Booking: Enabled
  - ✅ Database: Connected
- [ ] **CRITICAL**: No "LIVE MODE" warnings in console

---

## 🚨 ERROR HANDLING

- [ ] Disconnect internet → Try search → Graceful error
- [ ] Invalid airport code → Error message clear
- [ ] Test declined card: `4000 0000 0000 0002` → Shows retry option

---

## 📊 POST-DEPLOYMENT (30 minutes)

**Every 10 minutes for 30 minutes after deployment:**

| Time | Errors? | Users Active? | Payments Working? | Action |
|------|---------|---------------|-------------------|--------|
| T+10 | ⬜ | ⬜ | ⬜ | ________ |
| T+20 | ⬜ | ⬜ | ⬜ | ________ |
| T+30 | ⬜ | ⬜ | ⬜ | ________ |

**Monitor**:
- Vercel Analytics Dashboard
- Stripe Dashboard → Payments
- Browser console (sample 3 real user sessions)

---

## 🔄 ROLLBACK TRIGGERS

**Execute rollback immediately if:**
- ❌ Homepage returns 500 error
- ❌ Database connection fails
- ❌ ALL flight searches fail
- ❌ Payment intent creation fails for ALL attempts
- ❌ **STRIPE LIVE KEYS DETECTED**
- ❌ Error rate > 5%

**Rollback Command**:
```bash
# Via Vercel Dashboard:
# Deployments → Df73GmSgp → ... → Promote to Production

# Via CLI:
vercel rollback Df73GmSgp --prod
```

---

## ✅ GO/NO-GO DECISION

**All critical tests passed?**

- [ ] Homepage loads ✓
- [ ] AI assistant works ✓
- [ ] Flight search returns results ✓
- [ ] Complete booking flow works ✓
- [ ] Payment processing works (TEST MODE) ✓
- [ ] Mobile responsive ✓
- [ ] Performance acceptable ✓
- [ ] No console errors ✓

**Decision**: ⬜ **GO - Deploy to Production** ⬜ **NO-GO - Hold deployment**

**Signed**: _________________ **Date**: _______ **Time**: _______

**Notes**: _____________________________________________________

---

## 🆘 EMERGENCY CONTACTS

- **DevOps**: _________________
- **Lead Dev**: _________________
- **Vercel Support**: https://vercel.com/help
- **Stripe Support**: https://support.stripe.com

---

## 📝 QUICK REFERENCE

**Test Cards**:
- ✅ Success: 4242 4242 4242 4242
- ❌ Decline: 4000 0000 0000 0002
- 🔐 3DS: 4000 0027 6000 3184

**Test Routes**:
- JFK → LAX (Dec 15)
- SFO → ORD
- MIA → DEN

**Key Metrics**:
- Page load: < 3s
- API response: < 5s
- Lighthouse: > 85
- Error rate: < 0.5%

---

**Version**: 1.0 | **For detailed test plan, see**: PRODUCTION_TEST_PLAN.md
