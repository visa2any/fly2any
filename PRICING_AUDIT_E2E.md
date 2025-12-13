# 🔍 PRICING AUDIT - COMPLETE E2E ANALYSIS

**Status:** CRITICAL ISSUES FOUND
**Date:** 2025-12-13
**Affected:** Duffel Fare Variants Price Calculation

---

## 📊 ISSUE SUMMARY

User reported: **FareSelector showing $152.96 when it should be $130.96 (taxes counted twice)**

### Root Cause Analysis
The issue occurs in a 3-stage flow:
1. **Flight Search API** - Creates `fareVariants` but does NOT apply markup
2. **Markup Application** - Applied to main flight object ONLY, not to individual fareVariants
3. **Checkout Price Calculation** - Attempts to extract taxes/fees twice, creating double-counting

---

## 🔴 CRITICAL ISSUES FOUND

### Issue #1: Markup Not Applied to Fare Variants
**Severity:** CRITICAL
**Location:** `/app/api/flights/search/route.ts` lines 930-1050 (groupDuffelFareVariants)
**Impact:** Duffel fare variants don't include markup

**Flow:**
```
groupDuffelFareVariants() creates fareVariants array
  ↓
fareVariants stored in flight object
  ↓
applyFlightMarkup() applies markup to flight.price ONLY
  ↓
fareVariants[].price NEVER updated with markup
  ↓
User selects fare → gets UNMARKUPPED price
```

**Example:**
- API returns: Economy Basic = $108.97 (net price)
- Markup applied to flight: $108.97 + $22 markup = $130.96
- But fareVariants[0].price still = $108.97 ❌

### Issue #2: Double Tax Counting in getPriceBreakdown()
**Severity:** CRITICAL
**Location:** `/app/flights/booking-optimized/page.tsx` lines 828-874
**Impact:** When fare selected, taxes are extracted AND added again

**Flow:**
```
selectedFare.price = $152.96 (total from API, includes taxes)
↓
getPriceBreakdown() receives selectedFare
↓
Extracts base from selectedFare.priceDetails.base = $130.96
↓
Calculates taxes as: total - base = $152.96 - $130.96 = $22 ✓ Correct
↓
But then StickySummary receives:
  - farePrice: $130.96 (base)
  - taxesAndFees: $22
  - TOTAL = $130.96 + $22 = $152.96
↓
User sees double taxation in some displays
```

### Issue #3: FareVariants Missing Proper Price Breakdown
**Severity:** HIGH
**Location:** `/app/flights/booking-optimized/page.tsx` lines 189-193
**Impact:** Fallback breaks price calculation

**Current Code:**
```typescript
priceDetails: variant.priceDetails || { // Fallback if no breakdown
  total: variant.price,
  base: undefined,
  fees: undefined,
},
```

**Problem:** When `variant.priceDetails` is missing:
- Sets `base: undefined`
- In `getPriceBreakdown()`, undefined base causes calculation fallback
- Can result in `basePrice === totalPrice` with `taxesAndFees === 0`
- Loses tax information

---

## 🔧 DATA FLOW - CURRENT (BROKEN)

```
Duffel API Response
├─ Offer #1: Economy Basic
│  ├─ total_amount: 108.97
│  ├─ base_amount: 90.80
│  └─ tax_amount: 18.17
└─ Offer #2: Economy Standard
   ├─ total_amount: 248.96
   ├─ base_amount: 210.80
   └─ tax_amount: 38.16

↓ convertDuffelOffer()
Flight Object
├─ price.total: 108.97
├─ price.base: 90.80
├─ price.fees: [{ amount: 18.17, type: "TAXES_AND_FEES" }]
└─ fareVariants: [
    { id: "v1", price: 108.97, priceDetails: {...} },
    { id: "v2", price: 248.96, priceDetails: {...} }
  ]

↓ applyFlightMarkup($108.97)
Marked-up Flight
├─ price.total: 130.96 ✓ Updated with markup
├─ price.base: 112.80 ✓ Updated
├─ _netPrice: 108.97 ✓ Stored
└─ fareVariants: [
    { id: "v1", price: 108.97 ❌ NOT UPDATED },
    { id: "v2", price: 248.96 ❌ NOT UPDATED }
  ]

↓ Returned to frontend
User selects fareVariants[0]
├─ Gets price: 108.97 ❌ NET price (no markup!)
└─ Missing markup: -$22

User selects fareVariants[1]
├─ Gets price: 248.96 ❌ NET price
└─ Missing markup: -$22
```

---

## ✅ CORRECT FLOW - SOLUTION

The flow should be:

```
1. API Response
   ├─ Create flight with price breakdown
   └─ Create fareVariants with COMPLETE price breakdown

2. Markup Application
   ├─ Apply to flight.price
   ├─ Apply to each fareVariants[].price ← MISSING!
   └─ Update base, total, fees for all

3. Grouping
   ├─ Group variant offers by flight signature
   └─ Store with proper price breakdown

4. Frontend Selection
   ├─ User selects fareVariants[i]
   ├─ Gets complete breakdown (marked-up)
   └─ StickySummary receives correct prices

5. Checkout
   ├─ farePrice (base with markup): $130.96
   ├─ taxesAndFees (extracted): $22
   ├─ addOns: $X
   └─ TOTAL: $130.96 + $22 + $X
```

---

## 🛠️ FIXES REQUIRED

### Fix #1: Apply Markup to FareVariants
**Location:** `/app/api/flights/search/route.ts` lines 1470-1520
**Action:** After markup applied to flight, apply to fareVariants too

```typescript
// Current (BROKEN):
const markedUpFlight = {
  ...flight,
  price: { ...updated with markup },
  fareVariants: flight.fareVariants // ❌ NOT MARKED UP
};

// Fixed (CORRECT):
const markedUpFlight = {
  ...flight,
  price: { ...updated with markup },
  fareVariants: flight.fareVariants?.map(variant => {
    // Apply same markup logic to each variant
    const variantNetPrice = parseFloat(String(variant.price));
    const variantMarkup = applyFlightMarkup(variantNetPrice);
    return {
      ...variant,
      price: variantMarkup.customerPrice, // ✓ Marked-up price
      priceDetails: {
        total: variantMarkup.customerPrice,
        base: variant.priceDetails?.base
          ? parseFloat(String(variant.priceDetails.base)) + variantMarkup.markupAmount
          : 0,
        fees: variant.priceDetails?.fees // Keep original fees
      }
    };
  })
};
```

### Fix #2: Correct Price Breakdown Logic
**Location:** `/app/flights/booking-optimized/page.tsx` lines 828-874
**Action:** Ensure priceDetails is always available and accurate

```typescript
const getPriceBreakdown = () => {
  const selectedFare = fareOptions.find(f => f.id === selectedFareId);

  // CRITICAL: Ensure priceDetails exists
  if (!selectedFare?.priceDetails) {
    console.error('❌ Selected fare missing priceDetails');
    return { farePrice: 0, addOns: [], taxesAndFees: 0 };
  }

  const totalPrice = parseFloat(String(selectedFare.priceDetails.total));
  const basePrice = parseFloat(String(selectedFare.priceDetails.base)) || 0;

  // Calculate taxes from fees array OR difference
  let taxesAndFees = 0;
  if (selectedFare.priceDetails.fees && Array.isArray(selectedFare.priceDetails.fees)) {
    taxesAndFees = selectedFare.priceDetails.fees.reduce((sum, f) =>
      sum + parseFloat(String(f.amount)), 0);
  } else {
    taxesAndFees = Math.max(0, totalPrice - basePrice);
  }

  const farePrice = basePrice;
  // ... rest of logic
};
```

### Fix #3: Ensure FareVariants Have Complete Breakdown
**Location:** `/app/api/flights/search/route.ts` lines 1030-1051
**Action:** Guarantee priceDetails is complete for each variant

```typescript
return {
  id: v.id,
  name: displayName,
  price: price,
  currency: v.price?.currency || 'USD',
  priceDetails: {
    total: v.price?.total,
    base: v.price?.base,
    fees: v.price?.fees,
    grandTotal: v.price?.grandTotal,
  }, // ✓ Never fallback - must be complete
  originalOffer: v,
  features: extractFareFeatures(v, fareDetails),
  restrictions: restrictions.length > 0 ? restrictions : undefined,
  positives: positives.length > 0 ? positives : undefined,
  recommended: isRecommended,
  popularityPercent: popularity,
};
```

---

## 📈 VERIFICATION CHECKLIST

- [ ] Markup applied to ALL fareVariants
- [ ] Each variant has complete `priceDetails` (total, base, fees)
- [ ] getPriceBreakdown() never gets undefined priceDetails
- [ ] StickySummary receives: farePrice + taxesAndFees + addOns = total
- [ ] FareSelector shows marked-up prices
- [ ] Flight card shows same price as checkout
- [ ] Tax/fee calculation is consistent across all displays
- [ ] No double-counting of taxes
- [ ] Per-passenger pricing is correct for multi-passenger bookings

---

## 🧪 TEST CASES

### Test 1: Single Fare Selection
```
Search: NYC → LAX
API Returns: Basic $108.97, Standard $248.96
Expected in UI: Basic $130.96 (with $22 markup), Standard $270.96
Checkout shows: $130.96 (if Basic selected)
```

### Test 2: Price Breakdown
```
Selected fare: Economy Basic
  Display: $130.96 total

Breakdown should show:
  Base fare: $112.80 (90.80 + 22 markup)
  Taxes/fees: $18.17
  Total: $130.96
```

### Test 3: Multi-Passenger
```
2 adults:
  Per-person total: $65.48
  Total for 2: $130.96
```

---

## 📝 IMPLEMENTATION PRIORITY

1. **URGENT:** Apply markup to fareVariants (Fix #1)
2. **URGENT:** Fix price breakdown logic (Fix #2)
3. **HIGH:** Guarantee complete priceDetails (Fix #3)
4. **HIGH:** Add validation/logging for price consistency
5. **MEDIUM:** Add E2E tests for all price scenarios

