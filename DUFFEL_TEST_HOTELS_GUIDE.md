# 🏨 Duffel Test Hotels Integration Guide

## Why Use Duffel Test Hotels?

Duffel Test Hotels provide **production-grade testing scenarios** that go beyond basic mock data. They allow you to test edge cases and real-world scenarios that are critical for a robust booking system.

---

## 🆚 Comparison: Mock Data vs Duffel Test Hotels

| Feature | Mock Data (`USE_MOCK_HOTELS=true`) | Duffel Test Hotels |
|---------|-------------------------------------|-------------------|
| **Cost** | Free | Free (in test mode) |
| **Setup** | Instant | Requires Duffel API key |
| **Scenarios** | Basic happy path only | 15+ edge case scenarios |
| **Real API Behavior** | ❌ Simulated locally | ✅ Real API responses |
| **Rate Expiration** | ❌ Not testable | ✅ Testable |
| **Booking Failures** | ❌ Manual simulation | ✅ Automated scenarios |
| **Payment Testing** | Limited | Full Stripe integration |
| **Availability Changes** | ❌ Not testable | ✅ Testable |
| **Cancellation Policies** | Static | Dynamic |
| **Production Readiness** | Basic validation | Comprehensive validation |

**Recommendation**: Use both!
- **Development**: Mock data (fast, offline)
- **Pre-production Testing**: Duffel Test Hotels (realistic scenarios)
- **Production**: Real Duffel API

---

## 🚀 Quick Start: Integrate Duffel Test Hotels

### Step 1: Get Duffel API Key (Test Mode)

1. Sign up at https://duffel.com
2. Navigate to **Dashboard → API Keys**
3. Copy your **Test Mode** API key (starts with `duffel_test_`)

### Step 2: Configure Environment

```bash
# .env.local

# Switch from mock to Duffel test mode
USE_MOCK_HOTELS=false

# Add your test API key
DUFFEL_API_TOKEN=duffel_test_your_key_here

# Stripe test keys (for payment testing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Step 3: Search for Test Hotels

Our existing search API already supports Duffel! You just need to search at the **special test coordinates**.

#### Option A: Using the UI

1. Navigate to http://localhost:3000/hotels
2. **Search Form**:
   - **Destination**: "Test Island" or any city (doesn't matter for test hotels)
   - **Manually modify URL** after search to use test coordinates:
   ```
   /hotels/results?lat=-24.38&lng=-128.32&checkIn=2025-11-20&checkOut=2025-11-22&adults=2&children=0&rooms=1
   ```

#### Option B: Using API Directly

```bash
# Test hotel search via API
curl -X GET "http://localhost:3000/api/hotels/search?lat=-24.38&lng=-128.32&checkIn=2025-11-20&checkOut=2025-11-22&adults=2&limit=50" \
  -H "Content-Type: application/json"
```

#### Option C: Code Integration (Recommended)

Add a **Test Mode Toggle** to your search UI:

```tsx
// components/home/HotelSearchBar.tsx or similar

const [testMode, setTestMode] = useState(false);

// In search handler:
const handleSearch = () => {
  const searchParams = testMode
    ? {
        // Test coordinates for Duffel Test Hotels
        lat: -24.38,
        lng: -128.32,
        checkIn,
        checkOut,
        adults,
        children,
        rooms,
      }
    : {
        // Normal search
        query: destination,
        checkIn,
        checkOut,
        adults,
        children,
        rooms,
      };

  router.push(`/hotels/results?${new URLSearchParams(searchParams)}`);
};

// Add toggle in UI (development only):
{process.env.NODE_ENV === 'development' && (
  <label className="flex items-center gap-2 text-sm text-gray-600">
    <input
      type="checkbox"
      checked={testMode}
      onChange={(e) => setTestMode(e.target.checked)}
    />
    🧪 Use Test Hotels (Duffel)
  </label>
)}
```

---

## 🧪 Available Test Scenarios

### 1. **Successful Bookings**

| Hotel/Room Name | Scenario | Use Case |
|----------------|----------|----------|
| Duffel Test Hotel - Successful Booking with Balance | Payment succeeds using balance | Test balance payment flow |
| Duffel Test Hotel - Successful Booking with Card | Payment succeeds using card | Test card payment flow |
| Duffel Test Hotel - Successful Booking with Loyalty | Accepts loyalty programme numbers | Test loyalty integration |

**Test**: Complete a booking, verify confirmation email, check database entry.

---

### 2. **Rate Expiration**

| Hotel/Room Name | Scenario | Use Case |
|----------------|----------|----------|
| Duffel Test Hotel - Rate Expires | Rate expires during booking | Test expired rate handling |
| Duffel Test Hotel - Rate Unavailable | Rate becomes unavailable | Test sold-out scenarios |

**Test**:
1. Create a quote
2. Wait for expiration
3. Attempt to book
4. Verify error handling and user messaging

---

### 3. **Payment Failures**

| Hotel/Room Name | Scenario | Use Case |
|----------------|----------|----------|
| Duffel Test Hotel - Payment Declined | Card payment fails | Test payment failure UX |
| Duffel Test Hotel - Insufficient Funds | Payment rejected (no funds) | Test error messaging |

**Test Cards** (from Duffel documentation):
```
✅ Success: 4242 4242 4242 4242 (USA)
✅ Success: 4000 0082 6000 0000 (Great Britain)
✅ Success + 3D Secure: 4000 0000 0000 3220 (USA)
❌ Fail (Insufficient): 4000 0000 0000 9995 (USA)
```

**Test**: Use failure cards, verify:
- Error message displayed to user
- Payment not created in database
- Booking not confirmed
- Proper logging of failed attempt

---

### 4. **Cancellation & Refunds**

| Hotel/Room Name | Scenario | Use Case |
|----------------|----------|----------|
| Duffel Test Hotel - Free Cancellation | Full refund available | Test cancellation flow |
| Duffel Test Hotel - Non-Refundable | No refund policy | Test non-refundable handling |
| Duffel Test Hotel - Partial Refund | 50% refund within 7 days | Test partial refund logic |

**Test**:
1. Complete booking
2. Navigate to `/account/bookings/[id]`
3. Click "Cancel Booking"
4. Verify refund amount matches policy
5. Check Stripe refund created
6. Confirm cancellation email sent

---

### 5. **Availability Changes**

| Hotel/Room Name | Scenario | Use Case |
|----------------|----------|----------|
| Duffel Test Hotel - Availability Changes | Room becomes unavailable | Test race condition handling |

**Test**: Simulate concurrent bookings, verify only one succeeds.

---

### 6. **Special Requirements**

| Hotel/Room Name | Scenario | Use Case |
|----------------|----------|----------|
| Duffel Test Hotel - Requires Guest Details | Mandatory guest info | Test form validation |
| Duffel Test Hotel - Requires Phone Number | Phone verification | Test phone input |
| Duffel Test Hotel - Child Age Required | Children booking | Test age validation |

**Test**:
- Submit without required fields → See validation errors
- Complete with all fields → Booking succeeds

---

## 📋 Comprehensive Testing Workflow

### Phase 1: Search & Discovery (10 min)

```bash
# 1. Start server with Duffel test mode
USE_MOCK_HOTELS=false DUFFEL_API_TOKEN=duffel_test_... npm run dev

# 2. Search for test hotels
# URL: /hotels/results?lat=-24.38&lng=-128.32&checkIn=2025-11-20&checkOut=2025-11-22&adults=2

# 3. Verify API response
# Check network tab: Should show Duffel API calls, not mock data
# Look for: 🔍 Searching hotels with Duffel Stays API...

# 4. Confirm test hotels appear
# Expected: Hotels with names like "Duffel Test Hotel - ..."
```

**Checklist**:
- [ ] Test hotels returned (15-20 results)
- [ ] Hotel names include "Duffel Test Hotel"
- [ ] Rates display correctly
- [ ] Images load (or placeholder)
- [ ] Amenities listed
- [ ] Cancellation policies visible

---

### Phase 2: Rate Expiration (15 min)

```bash
# Scenario: Test rate expiration handling

# 1. Search for test hotels (use coordinates above)
# 2. Select "Duffel Test Hotel - Rate Expires"
# 3. Create a quote (POST /api/hotels/quote)
# 4. Wait 5-10 minutes (or as specified by Duffel)
# 5. Attempt to book with expired quote ID
# 6. Verify error: "Quote expired"
```

**Expected Behavior**:
```javascript
// API Response
{
  "error": "Quote expired",
  "code": "QUOTE_EXPIRED",
  "message": "The quote has expired. Please create a new quote."
}
```

**UI Behavior**:
- ✅ Error toast displayed: "Quote expired. Please search again."
- ✅ User redirected back to search or hotel detail page
- ✅ No booking created in database
- ✅ No charge to payment method

---

### Phase 3: Payment Failures (10 min)

```bash
# Scenario: Test declined payment

# 1. Select "Duffel Test Hotel - Payment Declined"
# 2. Fill guest details
# 3. Enter FAILING test card: 4000 0000 0000 9995
# 4. Submit booking
# 5. Verify payment failure handled gracefully
```

**Expected Behavior**:
```javascript
// Stripe Error
{
  "error": "Payment failed",
  "code": "PAYMENT_DECLINED",
  "message": "Your card was declined. Please try another payment method."
}
```

**UI Behavior**:
- ✅ Error message displayed above payment form
- ✅ Form remains editable (user can try different card)
- ✅ No booking created (verify in database)
- ✅ User can retry or cancel

---

### Phase 4: Successful Booking with Card (15 min)

```bash
# Scenario: Complete end-to-end booking

# 1. Select "Duffel Test Hotel - Successful Booking with Card"
# 2. Fill all required details:
#    - Guest: John Doe, test@example.com, +1234567890
#    - Payment: 4242 4242 4242 4242, 12/25, 123
# 3. Submit booking
# 4. Verify success
```

**Database Verification**:
```sql
-- Check booking created
SELECT * FROM "HotelBooking"
WHERE "confirmationNumber" LIKE 'FLY2ANY-%'
ORDER BY "createdAt" DESC LIMIT 1;

-- Verify payment status
SELECT "paymentStatus", "paymentIntentId", "paidAt"
FROM "HotelBooking"
WHERE id = 'booking_id_from_above';
```

**Email Verification**:
- [ ] Confirmation email sent to test@example.com
- [ ] Email contains confirmation number
- [ ] Hotel details correct
- [ ] Total price matches booking

**Stripe Verification**:
```bash
# Check Stripe dashboard (test mode)
# Should see Payment Intent with status "succeeded"
# Metadata should include: bookingId, hotelName, etc.
```

---

### Phase 5: Cancellation & Refund (10 min)

```bash
# Scenario: Cancel booking with full refund

# 1. Use booking from Phase 4
# 2. Navigate to /account/bookings/[id]
# 3. Click "Cancel Booking" button
# 4. Confirm cancellation
# 5. Verify refund processed
```

**Expected Behavior**:
```javascript
// Cancellation API Response
{
  "success": true,
  "message": "Booking cancelled successfully",
  "booking": {
    "id": "...",
    "status": "cancelled"
  },
  "refund": {
    "status": "succeeded",
    "amount": 425.00,
    "currency": "USD"
  }
}
```

**Stripe Verification**:
- [ ] Refund appears in Stripe dashboard
- [ ] Refund status: "succeeded"
- [ ] Amount matches booking total
- [ ] Metadata includes cancellation reason

**Database Verification**:
```sql
-- Check booking status updated
SELECT "status", "updatedAt"
FROM "HotelBooking"
WHERE id = 'booking_id';
-- Expected: status = 'cancelled'
```

---

### Phase 6: 3D Secure Authentication (15 min)

```bash
# Scenario: Test 3D Secure 2 flow

# 1. Select any test hotel
# 2. Fill guest details
# 3. Enter 3DS test card: 4000 0000 0000 3220
# 4. Submit booking
# 5. Complete 3DS challenge (Stripe test modal)
# 6. Verify booking succeeds after authentication
```

**Expected Flow**:
1. Payment form submitted
2. Stripe 3DS modal appears (test authentication)
3. User clicks "Complete Authentication" in modal
4. Modal closes
5. Payment succeeds
6. Booking confirmed

**UI Behavior**:
- ✅ 3DS modal renders correctly
- ✅ Loading state shown during authentication
- ✅ Success confirmation after authentication
- ✅ Booking created with authenticated payment

---

## 🔧 Implementation: Add Test Mode Toggle

### Update Search Component

```tsx
// components/home/HotelSearchBar.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical } from 'lucide-react'; // Test tube icon

export function HotelSearchBar() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  // Test mode toggle (only in development)
  const [isTestMode, setIsTestMode] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Build search parameters
    const params = new URLSearchParams();

    if (isTestMode) {
      // Use Duffel test coordinates
      params.set('lat', '-24.38');
      params.set('lng', '-128.32');
    } else {
      // Normal search by destination
      params.set('query', destination);
    }

    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('adults', adults.toString());
    params.set('children', children.toString());
    params.set('rooms', rooms.toString());
    params.set('currency', 'USD');

    // Navigate to results
    router.push(`/hotels/results?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      {/* Existing search fields... */}

      {/* Test Mode Toggle - Only in Development */}
      {isDevelopment && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <input
            type="checkbox"
            id="test-mode"
            checked={isTestMode}
            onChange={(e) => setIsTestMode(e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
          <label htmlFor="test-mode" className="flex items-center gap-2 text-sm font-medium text-amber-900">
            <FlaskConical className="w-4 h-4" />
            Use Duffel Test Hotels (15+ test scenarios)
          </label>
        </div>
      )}

      <button type="submit" className="...">
        Search Hotels
      </button>
    </form>
  );
}
```

---

## 📊 Test Coverage Checklist

Use this checklist to ensure comprehensive testing:

### Core Booking Flow
- [ ] Search returns test hotels at coordinates (-24.38, -128.32)
- [ ] Hotel details page loads correctly
- [ ] Create quote succeeds
- [ ] Guest details form validation works
- [ ] Payment form renders Stripe elements
- [ ] Successful booking with test card (4242...)
- [ ] Confirmation page displays booking details
- [ ] Email confirmation sent
- [ ] Booking saved to database with correct status

### Edge Cases
- [ ] Expired quote shows proper error message
- [ ] Unavailable rate handled gracefully
- [ ] Payment decline shows retry option
- [ ] Insufficient funds error displayed
- [ ] 3D Secure authentication flow works
- [ ] Concurrent booking prevention
- [ ] Partial availability handling

### Cancellation & Refunds
- [ ] Free cancellation processes full refund
- [ ] Non-refundable shows no refund option
- [ ] Partial refund calculates correctly based on days
- [ ] Refund appears in Stripe dashboard
- [ ] Cancellation email sent
- [ ] Database status updated to "cancelled"

### Payment Methods
- [ ] Stripe card payment succeeds
- [ ] Balance payment works (if implemented)
- [ ] Multiple currency support (USD, EUR, GBP)
- [ ] Payment metadata includes booking details

### Data Integrity
- [ ] No orphaned bookings in database
- [ ] No duplicate payments for same booking
- [ ] Proper error logging for failures
- [ ] Analytics events tracked correctly

---

## 🚨 Common Issues & Solutions

### Issue 1: No Test Hotels Returned

**Symptoms**: Search returns empty results or "No hotels found"

**Causes**:
1. Not using test coordinates exactly (-24.38, -128.32)
2. Still using `USE_MOCK_HOTELS=true`
3. Invalid or missing `DUFFEL_API_TOKEN`
4. Using production API key instead of test key

**Solution**:
```bash
# Verify environment
echo $DUFFEL_API_TOKEN
# Should start with: duffel_test_

# Check .env.local
USE_MOCK_HOTELS=false
DUFFEL_API_TOKEN=duffel_test_your_key_here

# Restart server
npm run dev

# Test exact coordinates
curl "http://localhost:3000/api/hotels/search?lat=-24.38&lng=-128.32&checkIn=2025-11-20&checkOut=2025-11-22&adults=2"
```

---

### Issue 2: Payment Fails with Test Cards

**Symptoms**: All test cards show payment error

**Causes**:
1. Using production Stripe key
2. Missing Stripe publishable key
3. Frontend not loading Stripe.js

**Solution**:
```bash
# Verify Stripe test keys
STRIPE_SECRET_KEY=sk_test_...  # Must start with sk_test_
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Must start with pk_test_

# Check Stripe Elements loaded
# In browser console:
window.Stripe
// Should return Stripe object
```

---

### Issue 3: Quote Expiration Not Working

**Symptoms**: Expired quotes still allow booking

**Causes**:
1. Not actually waiting long enough
2. Using mock data instead of real Duffel API
3. Backend not checking quote expiration

**Solution**:
Check your booking API endpoint:

```typescript
// app/api/hotels/booking/create/route.ts

// Verify quote expiration is checked
const quote = await duffelStaysAPI.getQuote(quoteId);

if (new Date(quote.expires_at) < new Date()) {
  return NextResponse.json(
    { error: 'Quote has expired', code: 'QUOTE_EXPIRED' },
    { status: 409 }
  );
}
```

---

## 📈 Performance Testing with Test Hotels

Duffel Test Hotels can also test performance under various conditions:

### Latency Testing
```javascript
// Measure API response times
const start = performance.now();
const response = await fetch('/api/hotels/search?lat=-24.38&lng=-128.32&...');
const end = performance.now();

console.log(`Search API latency: ${end - start}ms`);
// Target: <2000ms for search
```

### Load Testing
```bash
# Use Apache Bench or similar
ab -n 100 -c 10 "http://localhost:3000/api/hotels/search?lat=-24.38&lng=-128.32&checkIn=2025-11-20&checkOut=2025-11-22&adults=2"

# Monitor:
# - Requests per second
# - Average response time
# - Error rate (should be 0%)
```

---

## 🎓 Best Practices

1. **Always Test in Test Mode First**
   - Never use production API keys for testing
   - Test cards only work in Stripe test mode

2. **Automate Test Scenarios**
   - Write Playwright/Cypress tests for each scenario
   - Run nightly regression tests

3. **Monitor Test Data**
   - Track which test scenarios pass/fail
   - Log test runs for debugging

4. **Document Edge Cases**
   - Keep notes on which test hotels test which scenarios
   - Update docs when Duffel adds new test hotels

5. **Clean Up Test Data**
   - Periodically clear test bookings from database
   - Archive test payment records

---

## 🔄 Switching Between Mock and Test Hotels

Create a unified testing interface:

```typescript
// lib/config/testing.ts

export const getHotelTestMode = () => {
  const mode = process.env.HOTEL_TEST_MODE || 'mock';

  switch (mode) {
    case 'mock':
      return {
        useMock: true,
        apiKey: null,
        coordinates: null,
      };

    case 'duffel-test':
      return {
        useMock: false,
        apiKey: process.env.DUFFEL_API_TOKEN,
        coordinates: { lat: -24.38, lng: -128.32 },
      };

    case 'production':
      return {
        useMock: false,
        apiKey: process.env.DUFFEL_API_TOKEN,
        coordinates: null, // Use real coordinates
      };

    default:
      throw new Error(`Unknown test mode: ${mode}`);
  }
};
```

**Usage**:
```bash
# .env.local

# Option 1: Mock data (fast, offline)
HOTEL_TEST_MODE=mock

# Option 2: Duffel test hotels (realistic)
HOTEL_TEST_MODE=duffel-test
DUFFEL_API_TOKEN=duffel_test_...

# Option 3: Production (real data)
HOTEL_TEST_MODE=production
DUFFEL_API_TOKEN=duffel_live_...
```

---

## ✅ Pre-Production Checklist

Before deploying to production, ensure all test scenarios pass:

- [ ] All 15+ Duffel test scenarios tested manually
- [ ] Automated E2E tests cover critical paths
- [ ] Payment flow tested with all test cards
- [ ] Cancellation & refund flow verified
- [ ] Error handling tested (expired quotes, unavailable rates)
- [ ] 3D Secure authentication works
- [ ] Email notifications sent correctly
- [ ] Database integrity maintained
- [ ] Performance benchmarks met (LCP <2.5s, API <2s)
- [ ] Accessibility audit passed
- [ ] Mobile testing completed

---

## 🎯 Next Steps

1. **Get Duffel Test API Key**: https://duffel.com/signup
2. **Add Test Mode Toggle**: Update search component
3. **Run Through All Scenarios**: Use checklist above
4. **Document Results**: Track which scenarios pass/fail
5. **Automate Tests**: Write Playwright tests for critical flows
6. **Deploy to Staging**: Test with real Duffel test data
7. **Production Release**: Switch to live API keys

---

## 📞 Support

**Duffel Documentation**: https://duffel.com/docs/api/overview
**Duffel Test Hotels**: https://duffel.com/docs/api/stays/test-hotels
**Stripe Test Cards**: https://stripe.com/docs/testing

**Questions?**
- Duffel Support: help@duffel.com
- Internal: Check `HOTEL_E2E_TESTING_GUIDE.md`

---

*Last Updated: 2025-01-15*
*Created by: Claude Code*
