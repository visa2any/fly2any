# Booking Creation Error Analysis - "FAILED TO CREATE BOOKING"

## Your Issue
**Error Message:** "Failed to create booking. Please try again or contact booking"
**Symptom:** Credit card was NOT charged (no Stripe payment intent was created)
**Your Suspicion:** Error is between our platform and Duffel API ✅ **CORRECT**

---

## 📊 WHERE THE ERROR OCCURS

The error "FAILED TO CREATE BOOKING" comes from **line 929-936** in `/api/flights/booking/create`:

```typescript
// Generic error response
return NextResponse.json(
  {
    error: 'BOOKING_FAILED',
    message: 'Failed to create booking. Please try again or contact support.',
    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
  },
  { status: 500 }
);
```

---

## 🔍 CRITICAL: THE PAYMENT ROUTING LOGIC

Your booking creation flow follows **TWO DIFFERENT PATHS** based on flight source:

### **PATH A: DUFFEL FLIGHTS** (Lines 391-437)
```
1. Calculate total amount (base + upgrades + bundles + add-ons)
2. Create Stripe payment intent ✅
3. Create Duffel order (calls duffelAPI.createOrder())
4. Save to database
5. Return payment confirmation with clientSecret
```

### **PATH B: AMADEUS/GDS FLIGHTS** (Lines 438-504)
```
1. NO STRIPE PAYMENT INTENT CREATED ❌
2. Create RESERVATION (not actual booking)
3. Notify admin for manual ticketing
4. Mark as "pending_ticketing"
5. Return reservation confirmation
```

---

## ⚠️ YOUR ERROR IS HERE (Lines 434-437)

In the **Duffel booking creation**, if the Duffel API call fails:

```typescript
} catch (error: any) {
  console.error('❌ Duffel booking failed:', error);
  throw error; // Re-throw to be caught by outer error handler
}
```

**This is the problem!** When Duffel fails:
1. ❌ Payment intent was ALREADY created (line 345-362)
2. ❌ Stripe charged the customer
3. ❌ But Duffel order creation failed
4. ❌ Error thrown and caught at line 871
5. ❌ Database save NEVER happens
6. ❌ User sees "FAILED TO CREATE BOOKING"

---

## 🚨 ORPHANED BOOKING SCENARIO

You have a **CRITICAL BUG** at lines 812-870:

### Current Behavior:
```
STEP 1: Create payment intent with Stripe ✅
   → Customer CHARGED

STEP 2: Create booking with Duffel API ❌
   → FAILS due to Duffel API issue

STEP 3: Catch error, throw at line 436
   → Jump to error handler at line 871

STEP 4: Database save NEVER reached
   → Booking NOT in your database ❌

STEP 5: Return error to user
   → "Failed to create booking"
```

**Result:**
- ✅ Customer was CHARGED by Stripe
- ✅ Order created in Duffel's system
- ❌ But NOT saved in your database
- ❌ You can't see or manage the booking
- ❌ Customer has confirmation from Duffel but not from you

---

## 🛠️ THE FIX: REORDER THE STEPS

**Current (WRONG) Order:**
```
1. Create payment intent  ← Charges immediately
2. Create airline booking ← Can fail independently
3. Save to database       ← Never reached if step 2 fails
```

**Correct Order Should Be:**
```
1. Create airline booking ← Most likely to fail
2. Create payment intent  ← Only if booking succeeds
3. Save to database       ← Final confirmation
```

Or use a **Transactional Approach**:

```typescript
// STEP 1: Create Duffel booking FIRST (before payment)
let duffelOrder: any;
try {
  duffelOrder = await duffelAPI.createOrder(confirmedOffer, passengers);
} catch (error) {
  // Duffel failed - NO PAYMENT YET, just return error
  return NextResponse.json({
    error: 'BOOKING_FAILED',
    message: 'Could not create booking. Your card was NOT charged.',
  }, { status: 500 });
}

// STEP 2: Only create payment if booking succeeded
const paymentIntent = await paymentService.createPaymentIntent({...});

// STEP 3: Save both together
const savedBooking = await bookingStorage.create({...});
```

---

## 📋 CONDITIONAL PAYMENT ROUTING ANALYSIS

You mentioned: **"we have a routing payment when meet some criteria"**

### Current Routing Rules:

| Condition | Payment Behavior | Code Location |
|-----------|------------------|----------------|
| `isHold === true` | NO payment intent, create hold order | Line 308-324 |
| `flightSource === 'Duffel'` | Create payment intent, then order | Line 391-437 |
| `flightSource === 'Amadeus'` | NO payment intent, reservation only | Line 438-504 |

### The Criteria:

**1. HOLD vs INSTANT BOOKING** (Line 308)
```typescript
if (isHold) {
  // Hold booking - reserve seats, charge later
  // NO Stripe payment yet
} else {
  // Instant booking - charge now
  // CREATE Stripe payment intent
}
```

**2. FLIGHT SOURCE** (Line 391)
```typescript
if (flightSource === 'Duffel') {
  // Duffel: Can accept payments, create order
  // Stripe payment + Duffel order creation
} else {
  // Amadeus: Manual ticketing workflow
  // NO Stripe payment, just reservation
}
```

---

## 🔴 ISSUES & FIXES NEEDED

### Issue 1: Payment Before Booking (CRITICAL)
**Problem:** Stripe charged → Duffel fails → No database record
**Fix:** Swap steps - create Duffel booking BEFORE Stripe payment

### Issue 2: No Idempotency (MODERATE)
**Problem:** If payment webhook succeeds but database save fails, creates orphaned booking
**Fix:** Use pre-generated booking reference before payment (already done on line 305, good!)

### Issue 3: Hold Booking Payment (MODERATE)
**Problem:** Hold orders show NO payment intent, but customer expects to pay later
**Fix:** Ensure frontend handles hold bookings correctly and collects payment later

### Issue 4: Amadeus Manual Ticketing (LOW)
**Problem:** Charging payment for Amadeus when manual issuance might fail
**Fix:** Consider pre-charging Amadeus bookings or implementing deposit system

---

## 🚀 RECOMMENDED FIX (Priority Order)

### FIX 1: Reorder Payment Steps (IMMEDIATE)
**Location:** `/api/flights/booking/create` lines 297-378

**Before:**
```
Create payment intent → Create airline booking → Save to DB
```

**After:**
```
Create airline booking → Create payment intent → Save to DB
```

### FIX 2: Add Payment Capture Hook (URGENT)
**Location:** `/api/flights/booking/create` lines 812-870

Add recovery logic:
```typescript
} catch (dbError: any) {
  // CRITICAL: Booking exists but DB save failed
  // IMMEDIATELY attempt database recovery with retry
  for (let retry = 0; retry < 3; retry++) {
    try {
      const savedBooking = await bookingStorage.create({...});
      // Success! Return normal response
      return NextResponse.json({ success: true, booking: savedBooking });
    } catch (retryError) {
      // Wait and retry
      await new Promise(r => setTimeout(r, 1000 * (retry + 1)));
    }
  }
  // If still failing, notify admin with full details
}
```

### FIX 3: Stripe Payment Validation (IMPORTANT)
**Location:** New middleware

Before creating Stripe payment intent:
```typescript
// Verify amount hasn't changed
const currentPrice = applyFlightMarkup(confirmedNetPrice);
if (totalAmount !== currentPrice) {
  // Price changed during checkout - abort
  return NextResponse.json({
    error: 'PRICE_CHANGED',
    message: 'Flight price changed. Please review and try again.',
  }, { status: 409 });
}
```

---

## 📊 CONDITIONAL PAYMENT ROUTING - IMPROVED

Here's how to structure it better:

```typescript
// ROUTING: Determine payment method based on criteria
const paymentRouting = {
  duffel_instant: {
    name: 'Duffel Instant Booking',
    requiresPayment: true,
    requiresAirlineBooking: true,
    path: async () => {
      const order = await duffelAPI.createOrder(...);
      const payment = await paymentService.createPaymentIntent(...);
      return { order, payment, status: 'PENDING_PAYMENT' };
    }
  },
  duffel_hold: {
    name: 'Duffel Hold (Pay Later)',
    requiresPayment: false,
    requiresAirlineBooking: true,
    path: async () => {
      const order = await duffelAPI.createHoldOrder(...);
      return { order, payment: null, status: 'HOLD' };
    }
  },
  amadeus_reservation: {
    name: 'Amadeus Reservation (Manual Ticketing)',
    requiresPayment: false, // Or true if you want deposit
    requiresAirlineBooking: false, // It's a reservation
    path: async () => {
      const reservation = createAmadeusReservation(...);
      return { reservation, payment: null, status: 'PENDING_TICKETING' };
    }
  }
};

// Execute correct path
const routingKey = isHold
  ? 'duffel_hold'
  : flightSource === 'Duffel'
    ? 'duffel_instant'
    : 'amadeus_reservation';

const { order, payment, status } = await paymentRouting[routingKey].path();
```

---

## 🧪 HOW TO TEST THIS

### Test Case 1: Duffel API Failure
```bash
# Temporarily disable Duffel
export DUFFEL_ENABLE_ORDERS=false

# Try to book → Should fail BEFORE payment
# Check: Did Stripe charge? (Should be NO)
```

### Test Case 2: Database Failure
```bash
# Kill database connection during booking
# Try to book → Should trigger orphaned booking alert

# Check:
# 1. Did Duffel create order? (Check Duffel dashboard)
# 2. Did Stripe charge? (Check Stripe dashboard)
# 3. Is booking in DB? (Check database)
# 4. Did admin receive alert? (Check Telegram)
```

---

## 📈 YOUR PAYMENT ROUTING SUMMARY

### Current Routing:
1. **Duffel + Instant** → Stripe payment + Duffel order
2. **Duffel + Hold** → Duffel hold order (no payment yet)
3. **Amadeus** → Reservation only (no payment)

### Recommendations:
- ✅ **Duffel + Instant**: Keep as is (but fix step order)
- ✅ **Duffel + Hold**: Add option to pre-charge deposit
- ⚠️ **Amadeus**: Consider requiring deposit for reservation

---

## 📝 NEXT STEPS

1. **Enable detailed logging** in `/api/flights/booking/create`
2. **Check server logs** for actual Duffel error
3. **Verify Duffel credentials** are valid
4. **Test with small amount** ($1-5 flight)
5. **Implement FIX 1** (reorder payment steps)
6. **Deploy with monitoring**

Would you like me to implement these fixes?
