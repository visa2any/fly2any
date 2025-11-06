# 🧪 Production Deployment Test Plan
**Preview Deployment**: DQ65LxYk2 (commit 9b6ad78)
**Current Production**: Df73GmSgp (commit 4e4d04c)
**Target**: Promote preview to production
**Date**: November 6, 2025
**Status**: READY FOR TESTING ⚠️

---

## 📊 Executive Summary

**Major Changes in Preview**:
- ✅ Phase 5 E2E booking flow complete (9 stages)
- ✅ Payment processing with Stripe integration
- ✅ Booking confirmation with Duffel API
- ✅ Prisma AIConversation type error fixes
- ✅ Environment validation system
- ✅ AI conversation enhancements
- ✅ Consultant avatar system

**Total Files Changed**: 304 files, +97,176 lines, -2,283 lines

---

## 1. 🎯 CRITICAL PATH TESTING (MUST PASS)

### 1.1 Homepage & Initial Load
**Test ID**: CP-001
**Priority**: P0 (Blocker)

| Test Case | Steps | Pass Criteria | Notes |
|-----------|-------|---------------|-------|
| **Homepage Loads** | 1. Navigate to https://fly2any.com<br>2. Wait for page load complete | - Page loads in < 3s<br>- No console errors<br>- All hero sections visible<br>- Images load properly | Check Network tab |
| **Above-fold Content** | 1. Open homepage<br>2. Don't scroll | - Hero search form visible<br>- Navigation menu present<br>- AI assistant bubble visible | Lighthouse score > 90 |
| **Static Assets** | 1. Inspect Network tab<br>2. Check all resources | - All CSS loads (200 status)<br>- All JS loads (200 status)<br>- No 404 errors | Log any CDN issues |

**Pass/Fail**: ⬜ PASS ⬜ FAIL
**Tested By**: _____________ **Date**: _______
**Notes**: ________________________________________________

---

### 1.2 AI Assistant - Chat Interface
**Test ID**: CP-002
**Priority**: P0 (Blocker)

| Test Case | Steps | Pass Criteria | Notes |
|-----------|-------|---------------|-------|
| **AI Bubble Opens** | 1. Click AI assistant bubble (bottom right)<br>2. Verify modal opens | - Modal opens smoothly<br>- No JavaScript errors<br>- Greeting message appears | Check Console |
| **Session Creation** | 1. Open AI assistant<br>2. Check Network tab for /api/ai/session | - API returns 200<br>- sessionId created<br>- No authentication errors | Session stored in localStorage |
| **Send Message** | 1. Type "Hello"<br>2. Press Enter | - Message sends immediately<br>- Typing indicator shows<br>- Response within 3s | Response should be conversational |
| **Consultant Avatar** | 1. Check AI response<br>2. Verify consultant info | - Avatar image loads<br>- Consultant name visible<br>- Team badge shows | E.g., "Sarah - Flight Expert" |
| **Message History** | 1. Send 3 messages<br>2. Scroll up in chat | - All messages persist<br>- Order is correct<br>- Timestamps visible | Check scroll behavior |

**Pass/Fail**: ⬜ PASS ⬜ FAIL
**Tested By**: _____________ **Date**: _______
**Notes**: ________________________________________________

---

### 1.3 Flight Search - Real API
**Test ID**: CP-003
**Priority**: P0 (Blocker)

| Test Case | Steps | Pass Criteria | Notes |
|-----------|-------|---------------|-------|
| **Basic Search** | 1. In AI chat: "Find flights from JFK to LAX on Dec 15"<br>2. Wait for response | - API call to /api/flights/search<br>- Returns results in < 5s<br>- At least 3 flight options<br>- Prices are realistic | Check for mock vs real data |
| **Flight Cards Display** | 1. After search completes<br>2. Inspect flight cards | - Airline logos load<br>- Departure/arrival times correct<br>- Price displays properly<br>- "Select" button works | Amadeus or Duffel data |
| **Search Parameters** | 1. Check Network tab<br>2. Inspect API request payload | - Origin: JFK<br>- Destination: LAX<br>- Date: 2024-12-15<br>- Adults: 1 (default) | Validate date format |
| **Error Handling** | 1. Search impossible route<br>2. E.g., "JFK to INVALID"| - Graceful error message<br>- No stack traces visible<br>- Suggests alternatives | Should not crash |
| **Cache Behavior** | 1. Search JFK→LAX<br>2. Search same route again | - Second search is instant<br>- Header shows X-Cache-Status: HIT<br>- Same results returned | Redis/Upstash cache |

**Pass/Fail**: ⬜ PASS ⬜ FAIL
**Tested By**: _____________ **Date**: _______
**Notes**: ________________________________________________

---

### 1.4 Booking Flow - 9 Stages (CRITICAL)
**Test ID**: CP-004
**Priority**: P0 (Blocker)

#### Stage 1: Discovery ✈️
| Test Case | Steps | Pass Criteria |
|-----------|-------|---------------|
| **Search Initiation** | 1. User asks for flights<br>2. AI confirms search | - Search params extracted correctly<br>- Confirmation message sent |

#### Stage 2: Flight Selection 🎫
| Test Case | Steps | Pass Criteria |
|-----------|-------|---------------|
| **Select Flight** | 1. Click "Select Flight" on a card<br>2. Verify selection | - Flight highlighted<br>- Booking state updates<br>- Progress indicator: 2/9 |

#### Stage 3: Fare Selection 💺
| Test Case | Steps | Pass Criteria |
|-----------|-------|---------------|
| **Fare Options** | 1. View fare options (Economy/Business)<br>2. Select Economy | - Fare comparison widget loads<br>- Price differences clear<br>- Selection persists |

#### Stage 4: Seat Selection 🪑
| Test Case | Steps | Pass Criteria |
|-----------|-------|---------------|
| **Seat Map** | 1. View seat map<br>2. Select seat 12A | - Seat map renders correctly<br>- Selected seat highlights<br>- Price updates if premium seat |
| **Skip Seats** | 1. Click "Skip" button | - Proceeds to next stage<br>- No seat fees added<br>- Can skip successfully |

#### Stage 5: Baggage Selection 🧳
| Test Case | Steps | Pass Criteria |
|-----------|-------|---------------|
| **Add Baggage** | 1. Select "1 checked bag"<br>2. Verify pricing | - Baggage fee added to total<br>- Summary updates<br>- Can change quantity |

#### Stage 6: Extras Selection ➕
| Test Case | Steps | Pass Criteria |
|-----------|-------|---------------|
| **Skip Extras** | 1. Click "Continue" without extras | - Proceeds successfully<br>- Optional extras clear<br>- No extra charges |

#### Stage 7: Review Booking 📋
| Test Case | Steps | Pass Criteria |
|-----------|-------|---------------|
| **Booking Summary** | 1. Review all details<br>2. Check pricing breakdown | - Flight details accurate<br>- Passenger count correct<br>- Total price matches sum of:<br>  * Base fare<br>  * Taxes<br>  * Seat fees<br>  * Baggage fees |
| **Passenger Details** | 1. Fill passenger form<br>2. Enter: John Doe, john@test.com | - Form validation works<br>- Required fields enforced<br>- Email format validated |

#### Stage 8: Payment Processing 💳
**CRITICAL - Must Use Stripe Test Mode**

| Test Case | Steps | Pass Criteria |
|-----------|-------|---------------|
| **Payment Form Loads** | 1. Proceed to payment<br>2. Verify Stripe Elements load | - Card input field appears<br>- Stripe.js loads from CDN<br>- Test mode indicator visible |
| **Environment Check** | 1. Open DevTools<br>2. Check Stripe public key | - Key starts with `pk_test_`<br>- NOT `pk_live_`<br>- Log warning if live key detected |
| **Test Card - Success** | 1. Enter card: 4242 4242 4242 4242<br>2. Expiry: 12/34, CVC: 123<br>3. Submit payment | - API call to /api/booking-flow/create-payment-intent<br>- Returns 201 status<br>- paymentIntentId received<br>- clientSecret present |
| **Payment Confirmation** | 1. After payment submission<br>2. Wait for confirmation | - API call to /api/booking-flow/confirm-booking<br>- Returns 201 status<br>- Booking reference generated (e.g., FLY2A-ABC123) |
| **Test Card - Decline** | 1. Use card: 4000 0000 0000 0002<br>2. Submit payment | - Payment declined gracefully<br>- Error message clear<br>- User can retry<br>- No booking created |
| **3D Secure Test** | 1. Use card: 4000 0027 6000 3184<br>2. Complete 3DS challenge | - 3DS modal appears<br>- Can authenticate<br>- Payment succeeds after auth |

#### Stage 9: Confirmation ✅
| Test Case | Steps | Pass Criteria |
|-----------|-------|---------------|
| **Booking Confirmed** | 1. View confirmation screen | - Booking reference displayed<br>- PNR shown<br>- Success message clear<br>- Download/email options available |
| **Booking Details** | 1. Check confirmation details | - Flight details match original<br>- Passenger name correct<br>- Total amount charged correct |

**Overall Booking Flow Pass/Fail**: ⬜ PASS ⬜ FAIL
**Tested By**: _____________ **Date**: _______
**Notes**: ________________________________________________

---

### 1.5 Error Boundaries
**Test ID**: CP-005
**Priority**: P1 (High)

| Test Case | Steps | Pass Criteria | Notes |
|-----------|-------|---------------|-------|
| **Global Error Boundary** | 1. Open /test-error (if exists)<br>2. Trigger intentional error | - Error boundary catches error<br>- User-friendly message shows<br>- No stack trace in production<br>- "Refresh" and "Go Home" buttons work | Check GlobalErrorBoundary.tsx |
| **API Error Handling** | 1. Disconnect internet<br>2. Try flight search | - Shows "Connection lost" message<br>- Retry button available<br>- No app crash | Network errors handled |
| **Invalid API Response** | 1. Corrupt API response (if testable)<br>2. Check behavior | - Fallback UI shows<br>- Error logged to console<br>- App remains functional | Graceful degradation |

**Pass/Fail**: ⬜ PASS ⬜ FAIL
**Tested By**: _____________ **Date**: _______

---

### 1.6 Mobile Responsive Design
**Test ID**: CP-006
**Priority**: P1 (High)

| Test Case | Device/Viewport | Pass Criteria |
|-----------|-----------------|---------------|
| **iPhone 13 Pro** | 390x844px | - All content fits screen<br>- No horizontal scroll<br>- Touch targets > 44px<br>- AI chat modal full-screen |
| **iPhone SE** | 375x667px | - Smaller screen works<br>- Buttons accessible<br>- Font size readable |
| **Samsung Galaxy S21** | 360x800px | - Android rendering correct<br>- Material design works |
| **iPad Air** | 820x1180px | - Tablet layout optimized<br>- Two-column layout where appropriate |
| **Landscape Mode** | Rotate device | - Layout adapts correctly<br>- No UI breaks<br>- Keyboard doesn't obscure inputs |

**Testing Tools**:
- Chrome DevTools Device Toolbar
- Real device testing (preferred)
- BrowserStack (if available)

**Pass/Fail**: ⬜ PASS ⬜ FAIL
**Tested By**: _____________ **Date**: _______

---

## 2. 🔌 API HEALTH CHECKS

### 2.1 Booking Flow APIs
**Test ID**: API-001
**Priority**: P0 (Blocker)

| Endpoint | Method | Test Payload | Expected Response | Status |
|----------|--------|--------------|-------------------|--------|
| `/api/booking-flow/create-payment-intent` | POST | ```json<br>{<br>  "bookingState": {<br>    "id": "test-123",<br>    "pricing": {<br>      "total": 299.99,<br>      "currency": "USD"<br>    },<br>    "selectedFlight": {<br>      "id": "flight-1",<br>      "airline": "AA",<br>      "flightNumber": "100"<br>    }<br>  },<br>  "passengers": [{<br>    "firstName": "John",<br>    "lastName": "Doe",<br>    "email": "test@test.com"<br>  }]<br>}<br>``` | Status: 201<br>paymentIntentId: "pi_..."<br>clientSecret: "pi_..._secret_..."<br>mock: false | ⬜ |
| `/api/booking-flow/confirm-booking` | POST | ```json<br>{<br>  "paymentIntentId": "pi_test_123",<br>  "bookingState": {...},<br>  "passengers": [...]<br>}<br>``` | Status: 201<br>success: true<br>bookingReference: "FLY2A-..."<br>pnr: "ABC123" | ⬜ |

### 2.2 AI & Search APIs
**Test ID**: API-002
**Priority**: P0 (Blocker)

| Endpoint | Method | Test Payload | Expected Response | Status |
|----------|--------|--------------|-------------------|--------|
| `/api/ai/session` | POST | ```json<br>{<br>  "action": "create"<br>}<br>``` | Status: 200<br>sessionId: "session_..."<br>isAuthenticated: false<br>conversationCount: 0 | ⬜ |
| `/api/ai/session` | GET | Query: `?ip=current` | Status: 200<br>session object returned | ⬜ |
| `/api/flights/search` | POST | ```json<br>{<br>  "origin": "JFK",<br>  "destination": "LAX",<br>  "departureDate": "2024-12-15",<br>  "adults": 1<br>}<br>``` | Status: 200<br>flights: Array (length > 0)<br>metadata.total > 0<br>Response time < 5s | ⬜ |

### 2.3 Database Connectivity
**Test ID**: API-003
**Priority**: P0 (Blocker)

| Test Case | Method | Expected Result | Status |
|-----------|--------|-----------------|--------|
| **Database Connection** | Check logs on startup | "✅ Database connected successfully" | ⬜ |
| **Prisma Client** | Any DB query | No connection errors | ⬜ |
| **Migration Status** | `npx prisma db pull` (read-only) | Schema up-to-date | ⬜ |

---

## 3. 🔐 ENVIRONMENT VALIDATION

### 3.1 Required Environment Variables
**Test ID**: ENV-001
**Priority**: P0 (Blocker)

| Variable | Required | Expected Format | Check Method | Status |
|----------|----------|-----------------|--------------|--------|
| `STRIPE_SECRET_KEY` | Yes | `sk_test_...` | Environment validation on startup | ⬜ |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Yes | `pk_test_...` | Browser DevTools → Console | ⬜ |
| `DUFFEL_ACCESS_TOKEN` | Yes | `duffel_test_...` | Check API responses | ⬜ |
| `DATABASE_URL` | Yes | `postgresql://...` | Database connection test | ⬜ |
| `AMADEUS_API_KEY` | Yes | Any non-empty string | Flight search works | ⬜ |
| `AMADEUS_API_SECRET` | Yes | Any non-empty string | Flight search works | ⬜ |

### 3.2 Test Mode Verification
**Test ID**: ENV-002
**Priority**: P0 (Blocker)

| Service | Expected Mode | Verification Method | Status |
|---------|---------------|---------------------|--------|
| **Stripe** | Test Mode | 1. Check keys start with `_test_`<br>2. Stripe Dashboard shows "Test Mode"<br>3. Test cards work (4242...) | ⬜ |
| **Duffel** | Sandbox Mode | 1. Token starts with `duffel_test_`<br>2. API responses include test data<br>3. No real bookings created | ⬜ |
| **Amadeus** | Test Environment | `AMADEUS_ENVIRONMENT=test` in env vars | ⬜ |

### 3.3 Optional Services Status
**Test ID**: ENV-003
**Priority**: P2 (Nice to have)

| Service | Status | Impact if Missing |
|---------|--------|-------------------|
| **Sentry** (Error Monitoring) | ⬜ Available ⬜ Missing | Errors not tracked remotely |
| **Upstash Redis** (Caching) | ⬜ Available ⬜ Missing | Slower API responses, higher costs |
| **Email Service** (Gmail/SendGrid) | ⬜ Available ⬜ Missing | Booking confirmations won't send |

---

## 4. ⚡ PERFORMANCE CHECKS

### 4.1 Page Load Performance
**Test ID**: PERF-001
**Priority**: P1 (High)

| Metric | Target | Measurement Tool | Result |
|--------|--------|------------------|--------|
| **First Contentful Paint (FCP)** | < 1.8s | Lighthouse / WebPageTest | ⬜ _____s |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse / WebPageTest | ⬜ _____s |
| **Time to Interactive (TTI)** | < 3.8s | Lighthouse | ⬜ _____s |
| **Total Page Size** | < 3MB | Network tab | ⬜ _____MB |
| **JavaScript Bundle** | < 500KB (gzipped) | Network tab | ⬜ _____KB |

**Pass Criteria**: All metrics within target ranges OR < 10% regression from production

**Pass/Fail**: ⬜ PASS ⬜ FAIL

---

### 4.2 API Response Times
**Test ID**: PERF-002
**Priority**: P1 (High)

| API Endpoint | Target | Measured | Status |
|--------------|--------|----------|--------|
| `/api/flights/search` | < 5s | ⬜ _____s | ⬜ |
| `/api/booking-flow/create-payment-intent` | < 2s | ⬜ _____s | ⬜ |
| `/api/booking-flow/confirm-booking` | < 3s | ⬜ _____s | ⬜ |
| `/api/ai/session` | < 500ms | ⬜ _____ms | ⬜ |

**Measurement**: Network tab → Timing → Total time

---

### 4.3 Console Errors Check
**Test ID**: PERF-003
**Priority**: P1 (High)

| Check | Pass Criteria | Status |
|-------|---------------|--------|
| **JavaScript Errors** | Zero errors in Console | ⬜ |
| **Network Errors** | No failed requests (except intentional 404s) | ⬜ |
| **React Warnings** | No React warnings in dev mode | ⬜ |
| **Memory Leaks** | No increasing memory usage after 5 min browsing | ⬜ |

**How to Check Memory Leaks**:
1. Open Chrome DevTools → Performance Monitor
2. Browse site for 5 minutes (open AI chat, search flights, etc.)
3. Memory should stabilize, not continuously grow

---

## 5. 🔄 ROLLBACK PLAN

### 5.1 Pre-Deployment Backup
**Test ID**: ROLLBACK-001

| Item | Action | Status |
|------|--------|--------|
| **Note Current Deployment** | Record deployment ID: `Df73GmSgp` | ⬜ |
| **Database Backup** | If applicable, backup current DB state | ⬜ |
| **Environment Variables** | Document current env vars | ⬜ |

### 5.2 Rollback Procedure

**If Critical Issues Found Within First 30 Minutes:**

1. **Immediate Actions** (< 5 minutes):
   ```bash
   # Via Vercel Dashboard:
   # 1. Go to Deployments
   # 2. Find deployment Df73GmSgp
   # 3. Click "..." menu → "Promote to Production"

   # Via Vercel CLI:
   vercel rollback Df73GmSgp --prod
   ```

2. **Verification** (5 minutes):
   - Check homepage loads
   - Verify AI assistant works
   - Test one simple flight search
   - Confirm no errors in console

3. **Communication**:
   - Notify team in Slack/Discord
   - Update status page (if applicable)
   - Document issues found

**Rollback Triggers** (Any of these = Immediate rollback):
- ❌ Homepage doesn't load
- ❌ 500 errors on critical APIs
- ❌ Database connection failures
- ❌ Payment processing completely broken
- ❌ Error rate > 5% of requests
- ❌ Stripe LIVE keys detected (instead of test)

**Pass/Fail**: ⬜ PASS ⬜ FAIL
**Rollback Executed**: ⬜ YES ⬜ NO

---

### 5.3 Monitoring Alerts Setup
**Test ID**: ROLLBACK-002

**Set Up These Alerts (if Sentry configured):**

| Alert Type | Threshold | Action |
|------------|-----------|--------|
| **Error Rate** | > 1% of requests | Email + Slack notification | ⬜ |
| **API Response Time** | > 5s average | Warning notification | ⬜ |
| **Failed Payments** | > 3 in 10 minutes | Immediate investigation | ⬜ |
| **Database Connection** | Connection refused | Critical alert | ⬜ |

**If Sentry NOT configured**: Set up manual monitoring:
- Browser: Keep DevTools Console open
- Server: Monitor Vercel deployment logs
- Set 30-minute timer to check metrics

---

## 6. 📊 POST-DEPLOYMENT MONITORING (First 30 Minutes)

### 6.1 Real-Time Metrics
**Test ID**: MONITOR-001

**Monitor these metrics every 5 minutes for 30 minutes:**

| Time | Error Count | Active Users | Payment Attempts | Payment Success Rate | Notes |
|------|-------------|--------------|------------------|---------------------|-------|
| T+5min | ⬜ _____ | ⬜ _____ | ⬜ _____ | ⬜ _____% | ____________ |
| T+10min | ⬜ _____ | ⬜ _____ | ⬜ _____ | ⬜ _____% | ____________ |
| T+15min | ⬜ _____ | ⬜ _____ | ⬜ _____ | ⬜ _____% | ____________ |
| T+20min | ⬜ _____ | ⬜ _____ | ⬜ _____ | ⬜ _____% | ____________ |
| T+25min | ⬜ _____ | ⬜ _____ | ⬜ _____ | ⬜ _____% | ____________ |
| T+30min | ⬜ _____ | ⬜ _____ | ⬜ _____ | ⬜ _____% | ____________ |

**Data Sources**:
- Vercel Analytics Dashboard
- Stripe Dashboard → Payments
- Browser Console (sample user sessions)
- Sentry (if configured)

---

### 6.2 User Session Tracking
**Test ID**: MONITOR-002

**Track 3-5 Real User Sessions:**

| Session # | User Flow | Outcome | Issues? |
|-----------|-----------|---------|---------|
| 1 | Homepage → AI Chat → Flight Search | ⬜ Success ⬜ Failed | ⬜ None ⬜ ____________ |
| 2 | Homepage → AI Chat → Full Booking | ⬜ Success ⬜ Failed | ⬜ None ⬜ ____________ |
| 3 | Direct Search → Flight Selection | ⬜ Success ⬜ Failed | ⬜ None ⬜ ____________ |
| 4 | Mobile Device → AI Chat | ⬜ Success ⬜ Failed | ⬜ None ⬜ ____________ |
| 5 | Tablet → Complete Booking | ⬜ Success ⬜ Failed | ⬜ None ⬜ ____________ |

---

### 6.3 Database Query Performance
**Test ID**: MONITOR-003

**Check slow queries:**

```sql
-- If you have access to DB, run this query:
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Expected**: No queries > 1000ms average execution time

**Pass/Fail**: ⬜ PASS ⬜ FAIL

---

## 7. 🚨 INCIDENT RESPONSE PROCEDURE

### 7.1 Severity Levels

| Level | Definition | Response Time | Action |
|-------|------------|---------------|--------|
| **P0 - Critical** | Site down, payments failing, data loss | < 5 minutes | Immediate rollback |
| **P1 - High** | Feature broken, slow performance, errors | < 15 minutes | Investigate → Fix or rollback |
| **P2 - Medium** | UI glitch, minor bug, cosmetic issue | < 1 hour | Document, fix in next deploy |
| **P3 - Low** | Enhancement, optimization opportunity | Next sprint | Add to backlog |

### 7.2 Response Checklist

**When Issue Detected:**
- [ ] Document exact steps to reproduce
- [ ] Capture screenshots/video
- [ ] Note error messages from Console
- [ ] Check Vercel deployment logs
- [ ] Verify it's not a caching issue (hard refresh)
- [ ] Test on different browser/device
- [ ] Determine severity level (P0-P3)
- [ ] Decide: Fix forward or rollback?

**If P0 Critical:**
- [ ] Execute rollback immediately (see section 5.2)
- [ ] Notify all stakeholders
- [ ] Begin root cause analysis

---

## 8. ✅ FINAL SIGN-OFF

### 8.1 Pre-Production Checklist

- [ ] All Critical Path tests (Section 1) passed
- [ ] All API Health Checks (Section 2) passed
- [ ] Environment validation confirmed (Section 3)
- [ ] Performance metrics acceptable (Section 4)
- [ ] Rollback plan documented and tested (Section 5)
- [ ] Monitoring alerts configured (Section 6)
- [ ] Incident response team ready

### 8.2 Go/No-Go Decision

**Deployment Decision**: ⬜ GO ⬜ NO-GO

**Approved By**: _______________________
**Date**: _______________________
**Time**: _______________________

**Deployment Notes**:
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

## 9. 📋 TESTING TOOLS & RESOURCES

### Required Tools
- **Browser**: Chrome (latest) with DevTools
- **API Testing**: Postman or cURL
- **Performance**: Lighthouse (built into Chrome)
- **Mobile Testing**: Chrome DevTools Device Mode + Real devices
- **Network**: Chrome DevTools Network tab

### Test Data
**Stripe Test Cards**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)

**Test Flight Routes**:
- JFK → LAX (popular route, should have many results)
- SFO → ORD (major hubs)
- MIA → DEN (mid-tier route)
- BOS → SEA (coast-to-coast)

**Test Dates**:
- Near term: +7 to +30 days
- Mid term: +30 to +90 days
- Far term: +90 to +180 days (may have limited results)

### Useful Commands
```bash
# Check environment variables
npm run env:check

# View deployment logs
vercel logs

# Check build output
npm run build

# Run development server
npm run dev

# Database status
npx prisma studio
```

---

## 10. 📞 CONTACTS & ESCALATION

**Development Team**:
- Lead Developer: ___________________
- Backend Engineer: ___________________
- DevOps: ___________________

**On-Call Rotation**:
- Primary: ___________________
- Secondary: ___________________

**External Vendors**:
- Vercel Support: https://vercel.com/help
- Stripe Support: https://support.stripe.com
- Duffel Support: https://duffel.com/docs/support

---

## 📝 TESTING LOG

**Test Session Details**:
- **Tester Name**: _______________________
- **Start Time**: _______________________
- **End Time**: _______________________
- **Environment**: ⬜ Preview (DQ65LxYk2) ⬜ Production (Df73GmSgp)
- **Browser**: _______________________
- **OS**: _______________________

**Issues Found**:

| # | Severity | Description | Steps to Reproduce | Status |
|---|----------|-------------|-------------------|--------|
| 1 | ⬜ P0 ⬜ P1 ⬜ P2 ⬜ P3 | ________________ | __________________ | ⬜ Open ⬜ Fixed |
| 2 | ⬜ P0 ⬜ P1 ⬜ P2 ⬜ P3 | ________________ | __________________ | ⬜ Open ⬜ Fixed |
| 3 | ⬜ P0 ⬜ P1 ⬜ P2 ⬜ P3 | ________________ | __________________ | ⬜ Open ⬜ Fixed |
| 4 | ⬜ P0 ⬜ P1 ⬜ P2 ⬜ P3 | ________________ | __________________ | ⬜ Open ⬜ Fixed |

**Summary**:
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

**Final Recommendation**: ⬜ Deploy ⬜ Hold ⬜ Rollback

---

## 🎓 APPENDIX A: Common Issues & Fixes

### Issue: Stripe Test Mode Not Detected
**Symptoms**: Live keys in production
**Fix**: Update environment variables, redeploy
**Prevention**: Add env validation check in CI/CD

### Issue: Flight Search Returns No Results
**Symptoms**: Empty flights array
**Check**:
1. Amadeus API credentials valid
2. Date format correct (YYYY-MM-DD)
3. Airport codes valid (3-letter IATA)
4. Not searching too far in future (> 330 days)

### Issue: Payment Intent Creation Fails
**Symptoms**: 500 error on /api/booking-flow/create-payment-intent
**Check**:
1. STRIPE_SECRET_KEY set correctly
2. Amount > 0
3. Currency valid (USD, EUR, etc.)
4. Stripe account not restricted

### Issue: Database Connection Errors
**Symptoms**: Prisma client errors, connection timeouts
**Check**:
1. DATABASE_URL format correct
2. Database server accessible
3. Connection pool not exhausted
4. IP whitelist includes Vercel IPs

### Issue: AI Chat Not Loading
**Symptoms**: Modal doesn't open, console errors
**Check**:
1. JavaScript bundle loaded
2. /api/ai/session endpoint working
3. No CORS errors
4. localStorage accessible

---

## 🎓 APPENDIX B: Changes Since Last Production

**Major Features Added**:
1. ✅ Complete E2E booking flow (9 stages)
2. ✅ Stripe payment integration
3. ✅ Duffel booking confirmation
4. ✅ AI conversation persistence
5. ✅ Consultant avatar system
6. ✅ Environment validation

**Bug Fixes**:
1. ✅ Prisma AIConversation type errors
2. ✅ Payment intent error handling
3. ✅ Session management improvements

**Database Schema Changes**:
- Added `AIConversation` model
- Added `AIMessage` model
- Updated user relationships

**API Changes**:
- New: `/api/booking-flow/create-payment-intent`
- New: `/api/booking-flow/confirm-booking`
- New: `/api/ai/conversation/*`
- Enhanced: `/api/flights/search` (multi-date support)

---

## 🎓 APPENDIX C: Performance Baselines

**Current Production Metrics** (Df73GmSgp):
- Homepage LCP: ~2.1s
- Flight Search API: ~3.8s average
- JavaScript Bundle: ~420KB gzipped
- Error Rate: < 0.1%

**Target Metrics** (Preview DQ65LxYk2):
- Homepage LCP: < 2.5s (within 20% of baseline)
- Flight Search API: < 5s (accounting for new features)
- JavaScript Bundle: < 500KB (new features add ~80KB)
- Error Rate: < 0.5% (during initial rollout)

**Regression Acceptable**: Up to 15% slower due to new features
**Regression Unacceptable**: > 25% slower or error rate > 1%

---

**Document Version**: 1.0
**Last Updated**: November 6, 2025
**Next Review**: After deployment

---

**END OF TEST PLAN**
