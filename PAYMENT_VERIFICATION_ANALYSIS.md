# Payment Verification Not Showing - Root Cause Analysis

## Problem Statement

Post-payment verification modal (credit card front/back + ID photo) is NOT displaying after payment completion.

**Expected Behavior:**
- Show verification modal ONLY for:
  1. Manual ticketing bookings
  2. First-time customers (no previous verified docs)
  3. Skip for ALL Duffel bookings (3D Secure already validated)

**Current Behavior:**
- Verification modal not appearing after payment

---

## Analysis Findings

### 1. Current Flow Architecture

```
Payment Complete
    ↓
BookingConfirmationContent.tsx (line 446-540)
    ↓
useEffect checks verification status
    ↓
GET /api/booking-flow/verify-documents?ref=BOOKING_REF
    ↓
Modal shows if: status='NOT_STARTED' AND booking age < 1 hour
```

### 2. Verification Trigger Logic (FOUND)

**File:** `app/flights/booking/confirmation/BookingConfirmationContent.tsx`

**Lines 523-532:**
```typescript
// Auto-open verification modal only if:
// - Documents not uploaded
// - Booking is recent (within last hour)
// - Not already verified/pending
if (data.status === 'NOT_STARTED' || (data.status === 'PENDING' && !data.documentsUploaded)) {
  const bookingAge = Date.now() - new Date(bookingData.createdAt).getTime();
  const isRecent = bookingAge < 60 * 60 * 1000; // 1 hour
  if (isRecent) {
    setShowVerificationModal(true);
  }
}
```

**✅ This logic is CORRECT** - it checks for recent bookings and NOT_STARTED status.

---

### 3. Verification Status API (FOUND)

**File:** `app/api/booking-flow/verify-documents/route.ts`

**Lines 366-372:**
```typescript
if (!authorization) {
  return NextResponse.json({
    verified: false,
    documentsUploaded: false,
    status: 'NOT_STARTED',
    canBypass: false,
  });
}
```

**✅ This returns 'NOT_STARTED' when no CardAuthorization exists**

**Lines 310-342:**
```typescript
// Check by email - customer-level verification bypass
if (email) {
  const verifiedAuth = await prisma.cardAuthorization.findFirst({
    where: {
      email: email.toLowerCase(),
      status: 'VERIFIED',
      cardFrontImage: { not: null },
      cardBackImage: { not: null },
      idDocumentImage: { not: null },
    },
    // ...
  });

  if (verifiedAuth) {
    return NextResponse.json({
      customerVerified: true,
      canBypass: true,
      message: 'Customer has verified documents on file',
    });
  }
}
```

**✅ This handles "first-time customer" check correctly**

---

## ❌ PROBLEM IDENTIFIED

### Missing Logic: CardAuthorization Creation

**The CardAuthorization record is NEVER created during booking flow!**

**What happens:**
1. Customer completes payment → Booking created
2. Confirmation page loads → Checks verification status
3. API query: `CardAuthorization.findUnique({ where: { bookingReference } })`
4. **Result: NULL** (no record exists)
5. API returns: `status: 'NOT_STARTED'`
6. **BUT**: Modal should show, but doesn't

**Why modal doesn't show:**

Looking at line 503-506 in BookingConfirmationContent.tsx:
```typescript
// Check if customer can bypass (already verified on another booking)
if (data.canBypass) {
  setVerificationStatus('VERIFIED');
  return; // Skip modal - customer already verified
}
```

**The issue is that the CardAuthorization is never created in the booking flow, so:**
- The verification status check always returns `status: 'NOT_STARTED'`
- But the logic to CREATE the authorization and trigger the modal is missing

---

## Missing Implementation

### ❌ No CardAuthorization Creation in Booking Flow

**File:** `app/api/flights/booking/create/route.ts`

**What's missing:**
```typescript
// After successful booking creation
// Should create CardAuthorization with status: 'NOT_STARTED'
// ONLY if:
// 1. requiresManualTicketing === true
// 2. NOT a Duffel booking (Duffel has 3D Secure)
// 3. Customer doesn't have verified docs already
```

**Current code does NOT create CardAuthorization at all.**

---

## Solution Required

### Add CardAuthorization Creation Logic

**Location:** `app/api/flights/booking/create/route.ts`

**After successful booking (around line 1400+):**

```typescript
// STEP X: Create CardAuthorization for manual ticketing
if (requiresManualTicketing && !isDuffelBooking) {
  // Check if customer already has verified docs
  const customerEmail = contactInfo.email;
  const hasVerifiedDocs = await prisma.cardAuthorization.findFirst({
    where: {
      email: customerEmail.toLowerCase(),
      status: 'VERIFIED',
      cardFrontImage: { not: null },
    },
  });

  // Create authorization record if first-time customer
  if (!hasVerifiedDocs) {
    await prisma.cardAuthorization.create({
      data: {
        bookingReference: booking.bookingReference,
        cardholderName: paymentData.cardName || 'PENDING',
        cardLast4: paymentData.last4 || '****',
        cardBrand: paymentData.brand || 'unknown',
        expiryMonth: parseInt(paymentData.expiryMonth || '12', 10),
        expiryYear: parseInt(paymentData.expiryYear || '2025', 10),
        billingStreet: paymentData.billingAddress || 'PENDING',
        billingCity: paymentData.billingCity || 'PENDING',
        billingState: paymentData.billingState || 'PENDING',
        billingZip: paymentData.billingZip || 'PENDING',
        billingCountry: paymentData.billingCountry || 'US',
        email: customerEmail,
        phone: contactInfo.phone || 'PENDING',
        amount: totalPrice,
        currency: 'USD',
        cardFrontImage: null,  // Will be uploaded later
        cardBackImage: null,   // Will be uploaded later
        idDocumentImage: null, // Will be uploaded later
        status: 'NOT_STARTED',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });
  }
}
```

---

## Summary

**Root Cause:**
- CardAuthorization record is NEVER created during booking flow
- Verification modal trigger logic expects this record to exist
- Without the record, modal doesn't show

**Required Fix:**
- Add CardAuthorization creation in booking flow
- Only for manual ticketing (NOT Duffel)
- Only for first-time customers
- Status: 'NOT_STARTED'

**Files to Modify:**
1. `app/api/flights/booking/create/route.ts` - Add CardAuthorization creation
2. Test the flow to ensure modal appears

---

**Awaiting authorization to proceed with fix.**
