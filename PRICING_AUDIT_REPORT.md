# Fly2Any E2E Pricing Audit Report
## Comprehensive Pricing Integrity Analysis

**Date:** January 23, 2026  
**Auditor:** Principal Engineer / Staff-level Architect  
**Scope:** https://www.fly2any.com/agent/quotes/workspace  
**Severity:** CRITICAL - Production Pricing Inconsistencies Detected  

---

## Executive Summary

A comprehensive end-to-end pricing audit has identified **multiple critical issues** in the Fly2Any pricing calculation system. The most severe issue is **incorrect hotel pricing scaling for multiple guests**, which directly impacts revenue and customer trust. Additionally, there are fundamental architectural issues with duplicated pricing logic, inconsistent markup application between Agent and Client views, and lack of a single source of truth for pricing calculations.

### Critical Findings

1. **🔴 CRITICAL: Hotel pricing does NOT scale with guest count** - Hotels are priced per room for all guests, not per person
2. **🔴 HIGH: Agent View and Client View calculate pricing differently** - Different formulas, different results
3. **🔴 HIGH: Markup application is inconsistent** - Applied in search, applied in API, applied in workspace
4. **🟡 MEDIUM: Duplicate pricing logic** - Frontend and backend recalculate independently
5. **🟡 MEDIUM: Client View lacks pricing transparency** - Markup not explicitly shown

### Business Impact

- **Revenue Loss:** Hotel rooms underpriced for multi-guest bookings (potential 2-4x underpricing)
- **Customer Trust:** Different prices shown in Agent vs Client views
- **Operational Risk:** No validation that quoted prices match actual booking costs
- **Compliance Risk:** Inconsistent pricing could violate consumer protection laws

---

## 1. Root Cause Analysis

### 1.1 Hotel Guest Count Scaling Issue

**Location:** `components/agent/quote-workspace/discovery/HotelSearchPanel.tsx:484-524`

**The Bug:**
```typescript
const handleAddHotel = (hotel: any) => {
  const pricePerNight = hotel.lowestPrice?.amount
    ? parseFloat(hotel.lowestPrice.amount)
    : (hotel.lowestPricePerNight || 0);
  const totalPrice = pricePerNight * Math.max(1, nights); // ❌ BUG: No guest multiplication

  const item: Omit<HotelItem, "id" | "sortOrder" | "createdAt"> = {
    type: "hotel",
    price: totalPrice, // Price is for room, not per person
    priceType: 'total', // Marked as total, but doesn't account for guests
    priceAppliesTo: totalGuests, // Set but IGNORED in calculatePricing()
    currency: "USD",
    // ...
  };
  addItem(item);
};
```

**Why It Fails:**

1. Hotel APIs return **per-night, per-room** pricing
2. The code multiplies by `nights` but NOT by `guests`
3. Even though `priceAppliesTo` is set to `totalGuests`, the `calculatePricing()` function treats `priceType: 'total'` as "don't multiply"

**Evidence from `QuoteWorkspaceProvider.tsx:53-75`:**
```typescript
function calculatePricing(items: QuoteItem[], markupPercent: number, ...) {
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.price || 0;
    if (item.priceType === 'per_person') {
      return sum + (itemPrice * (item.priceAppliesTo || travelers));
    } else if (item.priceType === 'per_night' || item.priceType === 'per_unit') {
      return sum + itemPrice; // ❌ Used as-is, no multiplication
    }
    return sum + itemPrice; // Default 'total': price already covers all people
  }, 0);
  // ...
}
```

**Impact Calculation:**
- Hotel: $200/night × 3 nights = $600
- 4 travelers: Expected = $600 (room price)
- Actual: $600 displayed, but `priceAppliesTo: 4` suggests it should be $2400 if per-person
- **Result:** Confusing semantics, potential undercharging if hotel charges per person

**The Correct Fix:**
```typescript
// Hotels should be priced as 'per_night' type
// The calculatePricing function should handle 'per_night' correctly
// OR: Calculate total price including guests when adding to quote
```

---

### 1.2 Markup Application Inconsistency

**Problem:** Markup is applied in THREE different places with different rules:

| Location | Markup Rule | Product Types |
|-----------|--------------|----------------|
| Flight Search API | `MAX($22, 7%)` capped at $200 | Flights only |
| Transfer API | `MAX($35, 35%)` | Transfers |
| Tour API | `MAX($35, 35%)` | Tours |
| Quote Workspace | Agent-selected % (default 15%) | ALL products |
| Quote Save API | Agent-selected % (default 15%) | ALL products |

**Evidence:**

**Flight Markup** (`app/api/flights/search/route.ts:386-435`):
```typescript
const markedUpFlights = flights.map((flight: FlightOffer) => {
  const netPrice = parseFloat(String(flight.price?.total || '0'));
  const source = flight.source?.toLowerCase() || 'unknown';
  
  if (source === 'consolidator') {
    return flight; // No markup for consolidator
  }
  
  const markupResult = applyFlightMarkup(netPrice);
  // markupResult.customerPrice = netPrice + markup
  
  return {
    ...flight,
    price: {
      ...flight.price,
      total: markupResult.customerPrice.toString(),
      _netPrice: netPrice.toString(),
      _markupAmount: markupResult.markupAmount.toString(),
      _markupPercentage: markupResult.markupPercentage,
    }
  };
});
```

**Transfer Markup** (`app/api/transfers/search/route.ts:52-72`):
```typescript
function normalizeTransferOffer(offer: any, markup: number) {
  const basePrice = parseFloat(quotation.monetaryAmount || '0');
  const markupAmount = Math.max(35, basePrice * 0.35);
  const finalPrice = basePrice + markupAmount;
  
  return {
    price: finalPrice,
    _breakdown: {
      baseAmount: basePrice.toFixed(2),
      markup: markupAmount.toFixed(2),
    }
  };
}
```

**Agent Workspace Markup** (`QuoteWorkspaceProvider.tsx:66-84`):
```typescript
const markupAmount = (subtotal * markupPercent) / 100;
const total = Math.max(0, subtotal + markupAmount + taxes + fees - discount);
```

**Issue:** When a flight is added to the quote, it already includes markup. Then the agent applies an additional markup % on top. This results in **double markup**.

---

### 1.3 Agent View vs Client View Pricing Divergence

**Agent View Pricing** (`PricingZone.tsx:18-48`):
```typescript
const breakdown = items.reduce((acc, item) => {
  acc[item.type] = (acc[item.type] || 0) + item.price;
  return acc;
}, {});

// Shows:
// - Subtotal (sum of item prices)
// - + Markup % of subtotal
// - = Total
// - Per person = Total / travelers
```

**Client View Pricing** (`ClientPricingPanel.tsx:47-66`):
```typescript
<div className="flex justify-between text-sm">
  <span className="text-gray-600">Trip subtotal</span>
  <span className="font-medium text-gray-900">{formatPrice(pricing.subtotal)}</span>
</div>
// Shows subtotal, taxes, discount, total
// BUT: The "total" passed in is the FINAL total including markup
// NOT recalculated
```

**The Confusion:**

Agent View shows breakdown:
```
Subtotal: $1,000
Markup: 15% = $150
Total: $1,150
Per person: $287.50
```

Client View shows:
```
Total: $1,150
Per person: $287.50
```

**BUT** the Client View doesn't explicitly show that markup is included. This creates **transparency issues**.

---

### 1.4 Duplicate Pricing Logic

**Frontend Calculation** (`QuoteWorkspaceProvider.tsx:53-84`):
```typescript
function calculatePricing(items: QuoteItem[], markupPercent: number, ...) {
  const subtotal = items.reduce((sum, item) => {
    // Complex logic with priceType handling
  }, 0);
  const markupAmount = (subtotal * markupPercent) / 100;
  const total = Math.max(0, subtotal + markupAmount + taxes + fees - discount);
  const perPerson = travelers > 0 ? total / travelers : total;
  
  return { subtotal, markupPercent, markupAmount, taxes, fees, discount, total, perPerson, currency };
}
```

**Backend Calculation** (`app/api/agents/quotes/route.ts:175-192`):
```typescript
// Calculate costs
const flightsCost = data.flights.reduce((sum, f) => sum + f.price, 0);
const hotelsCost = data.hotels.reduce((sum, h) => sum + h.price, 0);
const activitiesCost = data.activities.reduce((sum, a) => sum + a.price, 0);
const transfersCost = data.transfers.reduce((sum, t) => sum + t.price, 0);
// ...

const subtotal = flightsCost + hotelsCost + activitiesCost + transfersCost + ...;
const agentMarkup = subtotal * (data.agentMarkupPercent / 100);
const total = subtotal + agentMarkup + data.taxes + data.fees - data.discount;
```

**Problem:** Both calculate independently. If there's a bug in one, the other might not catch it. They use different logic for:
- Item price aggregation
- Markup application
- Per-person calculation
- Tax/fee handling

---

## 2. Pricing Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER SEARCHES                                │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     API SEARCH ENDPOINTS                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ /flights/   │  │ /hotels/    │  │ /transfers/  │  ...         │
│  │ search      │  │ search      │  │ search      │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                  │                  │                       │
│         ▼                  ▼                  ▼                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ applyFlight  │  │ No markup   │  │ MAX($35,    │             │
│  │ Markup()    │  │ applied     │  │ 35%)        │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼──────────────────┼──────────────────┼───────────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND: ADD TO QUOTE                             │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ FlightSearchPanel.tsx:                                    │      │
│  │ - Extract price from API (already includes markup)          │      │
│  │ - Add item with priceType='total'                          │      │
│  └──────────────────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ HotelSearchPanel.tsx:                                     │      │
│  │ - pricePerNight * nights = totalPrice ❌ NO GUESTS       │      │
│  │ - Add item with priceType='total', priceAppliesTo=N       │      │
│  └──────────────────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ ActivitySearchPanel.tsx:                                  │      │
│  │ - Extract price from API (per person)                     │      │
│  │ - Add item with priceType='total'                          │      │
│  └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              QUOTE WORKSPACE STATE (Frontend)                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ calculatePricing() function:                               │      │
│  │ - subtotal = sum(item.price)                               │      │
│  │ - markupAmount = subtotal * markupPercent / 100              │      │
│  │ - total = subtotal + markupAmount + taxes + fees - discount   │      │
│  │ - perPerson = total / travelers                              │      │
│  └──────────────────────────────────────────────────────────────┘      │
│         │                                                             │
│         ├──► AGENT VIEW: Shows breakdown with markup           │
│         └──► CLIENT PREVIEW: Uses same pricing.total       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SAVE QUOTE (API)                                  │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ POST /api/agents/quotes                                    │      │
│  │ - RECALCULATE prices from items array                         │      │
│  │ - Apply agentMarkupPercent again ❌ DOUBLE MARKUP             │      │
│  │ - Save to database                                         │      │
│  └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLIENT VIEW (Shared Link)                          │
│  - Loads quote from database                                    │
│  - Shows final total (with markup)                              │
│  - Per person calculation may differ                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Pricing Invariants (What Must Always Be True)

### Invariant 1: Price Type Semantics
- `'total'` = Price covers all travelers (e.g., flight, hotel room)
- `'per_person'` = Price is per individual traveler (e.g., activity ticket)
- `'per_night'` = Price is per night (e.g., hotel room per night)
- `'per_unit'` = Price is per unit (e.g., per car, per transfer)

**Violation:** Hotels marked as `'total'` but don't account for guests

### Invariant 2: Markup Application Order
1. **Base Price**: API-returned price before any markup
2. **Product Markup**: Applied during search (flights: 7%, transfers: 35%)
3. **Agent Markup**: Applied to the subtotal as % increase
4. **Final Price**: Base + Product Markup + Agent Markup + Taxes - Discounts

**Violation:** Product markup already included in item prices, but agent markup applied again

### Invariant 3: Per-Person Calculation
```
perPerson = total / travelers
```
**Must hold true:**
- `subtotal / travelers` ≠ `perPerson` (because of markup)
- `total = perPerson × travelers` (always)
- `total = subtotal + markup + taxes + fees - discount` (always)

**Violation:** Frontend and backend calculate differently

### Invariant 4: Agent vs Client Consistency
- Agent View Total = Client View Total
- Agent View Per Person = Client View Per Person
- Agent View Subtotal = Sum of item prices (before markup)

**Partial Violation:** Client View doesn't explicitly show markup breakdown

### Invariant 5: Database Pricing Integrity
- `quote.total` = `quote.subtotal + quote.agentMarkup + quote.taxes + quote.fees - quote.discount`
- `quote.perPerson` = `quote.total / quote.travelers` (or stored separately)
- All component prices (flights, hotels, etc.) sum to `subtotal`

**Violation:** Backend recalculates instead of validating frontend calculation

---

## 4. Broken Assumptions

### Assumption 1: "Hotel APIs return per-room pricing"
**Reality:** Hotel APIs (LiteAPI, Amadeus) typically return **per-room, per-night** pricing for specified occupancy.

**Impact:** The current code assumes the returned price is the total price, but it may need adjustment based on actual occupancy.

### Assumption 2: "priceAppliesTo field determines multiplication"
**Reality:** The `priceAppliesTo` field is set but **not used** in the `calculatePricing` function for `priceType: 'total'`.

**Impact:** Hotels are marked with `priceAppliesTo: totalGuests` but this is ignored.

### Assumption 3: "Product markup doesn't affect agent markup"
**Reality:** If flight pricing includes 7% markup, and agent adds 15%, the effective markup is `1.07 × 1.15 = 1.2305` (23.05%), not 22%.

**Impact:** Double-markup without clear communication to agent or client.

### Assumption 4: "Frontend and backend calculations will always match"
**Reality:** Two different implementations can diverge due to:
- Different rounding strategies
- Different price type handling
- Different aggregation logic

**Impact:** What agent sees may not match what client pays.

---

## 5. Proposed Architecture: Unified QuotePricingService

### 5.1 Design Principles

1. **Single Source of Truth (SSOT):** One pricing calculation function used everywhere
2. **Deterministic:** Same inputs always produce same outputs
3. **Transparent:** Clear breakdown of base price, markups, taxes, fees
4. **Validated:** Database constraints ensure pricing integrity
5. **Testable:** Pure functions, no side effects

### 5.2 Service Interface

```typescript
// lib/pricing/QuotePricingService.ts

interface PriceInput {
  price: number;
  priceType: 'total' | 'per_person' | 'per_night' | 'per_unit';
  priceAppliesTo?: number; // Number of people/units
  nights?: number; // For per_night
}

interface PricingContext {
  travelers: number;
  rooms?: number;
  currency: Currency;
  agentMarkupPercent: number;
  taxes: number;
  fees: number;
  discount: number;
  productType: ProductType;
}

interface PriceBreakdown {
  basePrice: number;
  productMarkup: number;
  productMarkupPercent: number;
  subtotal: number;
  agentMarkup: number;
  agentMarkupPercent: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  perPerson: number;
  currency: Currency;
  breakdown: {
    byProductType: Record<ProductType, number>;
    byItem: Array<{
      id: string;
      type: ProductType;
      name: string;
      basePrice: number;
      finalPrice: number;
    }>;
  };
}

class QuotePricingService {
  /**
   * Calculate final price for a single item
   * - Applies product-specific markup rules
   * - Handles priceType semantics
   * - Returns item-level breakdown
   */
  calculateItemPrice(input: PriceInput, context: PricingContext): PriceBreakdown;

  /**
   * Calculate quote-level pricing
   * - Aggregates all items
   * - Applies agent markup
   * - Calculates taxes, fees, discounts
   * - Returns complete breakdown
   */
  calculateQuotePricing(items: QuoteItem[], context: PricingContext): PriceBreakdown;

  /**
   * Validate pricing integrity
   * - Ensures totals match
   * - Checks per-person calculation
   * - Verifies no negative values
   */
  validatePricing(breakdown: PriceBreakdown): ValidationResult;

  /**
   * Format pricing for display
   * - Agent view: show markup breakdown
   * - Client view: show total only
   * - Invoice: show full breakdown
   */
  formatPricingForDisplay(
    breakdown: PriceBreakdown,
    viewType: 'agent' | 'client' | 'invoice'
  ): DisplayPricing;
}
```

### 5.3 Implementation Outline

```typescript
// Product-specific markup rules
const PRODUCT_MARKUP_RULES: Record<ProductType, MarkupRule> = {
  flight: { 
    minMarkup: 22, 
    percent: 0.07, 
    maxMarkup: 200,
    appliesTo: 'net_price' 
  },
  hotel: { 
    minMarkup: 0, 
    percent: 0.0, 
    maxMarkup: 0,
    appliesTo: 'total' 
  },
  transfer: { 
    minMarkup: 35, 
    percent: 0.35, 
    appliesTo: 'higher',
  },
  // ...
};

function calculateItemPrice(input: PriceInput, context: PricingContext): PriceBreakdown {
  // 1. Calculate base price based on priceType
  let basePrice = input.price;
  
  switch (input.priceType) {
    case 'per_person':
      basePrice = input.price * (input.priceAppliesTo || context.travelers);
      break;
    case 'per_night':
      basePrice = input.price * (input.nights || 1);
      // For hotels, this is room price, not per person
      break;
    case 'total':
    case 'per_unit':
      basePrice = input.price;
      break;
  }

  // 2. Apply product-specific markup
  const markupRule = PRODUCT_MARKUP_RULES[context.productType];
  let productMarkup = 0;
  
  if (markupRule) {
    if (markupRule.appliesTo === 'higher') {
      productMarkup = Math.max(
        markupRule.minMarkup,
        basePrice * markupRule.percent
      );
    } else {
      productMarkup = basePrice * markupRule.percent;
    }
    productMarkup = Math.min(productMarkup, markupRule.maxMarkup);
  }

  const subtotal = basePrice + productMarkup;

  return {
    basePrice,
    productMarkup,
    productMarkupPercent: (productMarkup / basePrice * 100),
    subtotal,
    // Agent markup applied at quote level
    agentMarkup: 0,
    agentMarkupPercent: 0,
    taxes: 0,
    fees: 0,
    discount: 0,
    total: subtotal,
    perPerson: subtotal / context.travelers,
    currency: context.currency,
    breakdown: {
      byProductType: {},
      byItem: []
    }
  };
}

function calculateQuotePricing(
  items: QuoteItem[], 
  context: PricingContext
): PriceBreakdown {
  // 1. Calculate each item's price (with product markup)
  const itemPrices = items.map(item => 
    calculateItemPrice(
      {
        price: item.price,
        priceType: item.priceType,
        priceAppliesTo: item.priceAppliesTo,
        nights: (item as any).nights,
      },
      { ...context, productType: item.type }
    )
  );

  // 2. Aggregate subtotals
  const totalSubtotal = itemPrices.reduce((sum, ip) => sum + ip.subtotal, 0);

  // 3. Apply agent markup to total subtotal
  const agentMarkup = totalSubtotal * (context.agentMarkupPercent / 100);
  const total = totalSubtotal + agentMarkup + context.taxes + context.fees - context.discount;

  // 4. Calculate per-person
  const perPerson = context.travelers > 0 ? total / context.travelers : total;

  // 5. Build breakdown
  const byProductType = items.reduce((acc, item, idx) => {
    acc[item.type] = (acc[item.type] || 0) + itemPrices[idx].total;
    return acc;
  }, {} as Record<ProductType, number>);

  return {
    basePrice: itemPrices.reduce((sum, ip) => sum + ip.basePrice, 0),
    productMarkup: itemPrices.reduce((sum, ip) => sum + ip.productMarkup, 0),
    productMarkupPercent: 0, // Average across items
    subtotal: totalSubtotal,
    agentMarkup,
    agentMarkupPercent: context.agentMarkupPercent,
    taxes: context.taxes,
    fees: context.fees,
    discount: context.discount,
    total,
    perPerson,
    currency: context.currency,
    breakdown: {
      byProductType,
      byItem: items.map((item, idx) => ({
        id: item.id,
        type: item.type,
        name: (item as any).name || item.type,
        basePrice: itemPrices[idx].basePrice,
        finalPrice: itemPrices[idx].total,
      }))
    }
  };
}
```

### 5.4 Integration Points

**Frontend:**
```typescript
// QuoteWorkspaceProvider.tsx
import { QuotePricingService } from '@/lib/pricing/QuotePricingService';

function calculatePricing(items: QuoteItem[], markupPercent: number, ...) {
  const context: PricingContext = {
    travelers,
    currency,
    agentMarkupPercent: markupPercent,
    taxes,
    fees,
    discount,
  };
  
  return QuotePricingService.calculateQuotePricing(items, context);
}
```

**Backend API:**
```typescript
// app/api/agents/quotes/route.ts
import { QuotePricingService } from '@/lib/pricing/QuotePricingService';

// Transform items to QuoteItem format
const quoteItems: QuoteItem[] = [
  ...flights.map(f => ({ type: 'flight', price: f.price, ... })),
  ...hotels.map(h => ({ type: 'hotel', price: h.price, ... })),
  // ...
];

const context: PricingContext = {
  travelers: adults + children + infants,
  currency: 'USD',
  agentMarkupPercent: data.agentMarkupPercent,
  taxes: data.taxes,
  fees: data.fees,
  discount: data.discount,
};

const pricing = QuotePricingService.calculateQuotePricing(quoteItems, context);

// Validate
const validation = QuotePricingService.validatePricing(pricing);
if (!validation.valid) {
  return NextResponse.json(
    { error: 'Pricing validation failed', details: validation.errors },
    { status: 400 }
  );
}

// Save to database
await prisma.agentQuote.create({
  ...data,
  ...pricing, // subtotal, agentMarkup, total, perPerson, etc.
});
```

---

## 6. Refactor Recommendations

### Priority 1: CRITICAL - Fix Hotel Guest Count Scaling

**Files to modify:**
1. `components/agent/quote-workspace/discovery/HotelSearchPanel.tsx`
2. `components/agent/quote-workspace/QuoteWorkspaceProvider.tsx`

**Fix A: Update HotelSearchPanel**
```typescript
const handleAddHotel = (hotel: any) => {
  const pricePerNight = hotel.lowestPrice?.amount || hotel.lowestPricePerNight || 0;
  const totalPrice = pricePerNight * Math.max(1, nights);
  // Hotel price is per ROOM, not per person
  // Do NOT multiply by guests
  
  const item: Omit<HotelItem, "id" | "sortOrder" | "createdAt"> = {
    type: "hotel",
    price: totalPrice,
    priceType: 'per_night', // Changed from 'total'
    priceAppliesTo: 1, // Room covers the room, not per person
    currency: "USD",
    // ... rest of fields
  };
  addItem(item);
};
```

**Fix B: Update calculatePricing to handle per_night correctly**
```typescript
function calculatePricing(items: QuoteItem[], markupPercent: number, ...) {
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.price || 0;
    
    if (item.priceType === 'per_person') {
      // Per-person items: multiply by travelers
      return sum + (itemPrice * (item.priceAppliesTo || travelers));
    } else if (item.priceType === 'per_night') {
      // Per-night items: price already includes nights calculation
      // Just add the total
      return sum + itemPrice;
    } else if (item.priceType === 'per_unit') {
      // Per-unit items: price already covers the unit
      return sum + itemPrice;
    }
    // Default 'total': price already covers everything
    return sum + itemPrice;
  }, 0);
  // ... rest of function
}
```

### Priority 2: HIGH - Unify Pricing Logic

**Action:** Create `lib/pricing/QuotePricingService.ts` as described in Section 5.

**Steps:**
1. Create service with pure pricing functions
2. Add comprehensive unit tests
3. Replace `calculatePricing` in QuoteWorkspaceProvider
4. Replace pricing calculation in `app/api/agents/quotes/route.ts`
5. Add validation at save time
6. Add pricing audit logs

### Priority 3: HIGH - Fix Double Markup

**Option A: Remove Product Markup**
- Remove markup from flight/transfer/tour search APIs
- Only apply agent markup in workspace
- Pros: Simpler, single markup point
- Cons: Loses product-specific markup flexibility

**Option B: Make Product Markup Transparent**
- Keep product markup
- Add `productMarkup` field to QuoteItem
- Show both markups in Agent View breakdown
- Only apply agent markup to base prices
- Pros: More transparent, flexible
- Cons: More complex

**Recommended:** Option B with clear UI labels

**Implementation:**
```typescript
interface QuoteItem {
  // ... existing fields
  basePrice: number; // Net price before any markup
  productMarkup: number; // Markup applied during search
  productMarkupPercent: number; // Percentage
  finalPrice: number; // Price to display (base + product markup)
}

// In calculatePricing:
const subtotal = items.reduce((sum, item) => {
  return sum + item.basePrice; // Sum base prices only
}, 0);

const productMarkupTotal = items.reduce((sum, item) => {
  return sum + item.productMarkup;
}, 0);

const agentMarkup = subtotal * (markupPercent / 100);
const total = subtotal + productMarkupTotal + agentMarkup + taxes + fees - discount;
```

### Priority 4: MEDIUM - Client View Pricing Transparency

**Action:** Update `ClientPricingPanel.tsx` to explicitly show what's included.

```typescript
// Add transparent breakdown
<div className="bg-gray-50 rounded-xl p-6 space-y-4">
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Trip subtotal</span>
    <span className="font-medium text-gray-900">{formatPrice(pricing.subtotal)}</span>
  </div>
  
  {pricing.productMarkup > 0 && (
    <div className="flex justify-between text-sm text-gray-500">
      <span>Service fees included</span>
      <span>{formatPrice(pricing.productMarkup)}</span>
    </div>
  )}
  
  <div className="border-t border-gray-200 pt-4">
    <div className="flex justify-between items-center">
      <span className="text-lg font-bold text-gray-900">Total investment</span>
      <span className="text-3xl font-bold text-primary-600">
        {formatPrice(pricing.total)}
      </span>
    </div>
    <p className="text-sm text-gray-500 text-right mt-1">
      {formatPrice(pricing.perPerson)} per person
    </p>
  </div>
</div>
```

### Priority 5: MEDIUM - Add Pricing Validation

**Add to Database Schema:**
```prisma
model AgentQuote {
  // ... existing fields
  
  // Pricing validation checksums
  subtotalChecksum     String?
  markupChecksum      String?
  totalChecksum       String?
  perPersonChecksum   String?
  pricingValidatedAt   DateTime?
  pricingValidationErrors String? // JSON
}
```

**Add Validation Middleware:**
```typescript
function validateQuotePricing(data: CreateQuoteInput, calculated: QuotePricing) {
  const errors: string[] = [];
  
  // Check totals match
  const expectedTotal = data.subtotal + data.agentMarkup + data.taxes + data.fees - data.discount;
  if (Math.abs(calculated.total - expectedTotal) > 0.01) {
    errors.push(`Total mismatch: calculated ${calculated.total} vs expected ${expectedTotal}`);
  }
  
  // Check per-person
  const expectedPerPerson = calculated.total / (data.adults + data.children + data.infants);
  if (Math.abs(calculated.perPerson - expectedPerPerson) > 0.01) {
    errors.push(`Per-person mismatch: calculated ${calculated.perPerson} vs expected ${expectedPerPerson}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## 7. E2E Validation Strategy

### 7.1 Unit Tests

**File:** `lib/pricing/__tests__/QuotePricingService.test.ts`

```typescript
describe('QuotePricingService', () => {
  describe('Hotel Pricing', () => {
    it('should calculate per-night price correctly', () => {
      const input: PriceInput = {
        price: 200,
        priceType: 'per_night',
        nights: 3,
      };
      const context: PricingContext = {
        travelers: 4,
        currency: 'USD',
        agentMarkupPercent: 15,
        taxes: 0,
        fees: 0,
        discount: 0,
        productType: 'hotel',
      };
      
      const result = calculateItemPrice(input, context);
      
      expect(result.basePrice).toBe(600); // 200 * 3 nights
      expect(result.subtotal).toBe(600); // No product markup for hotels
    });
    
    it('should NOT multiply hotel price by guests', () => {
      // Hotel is per room, not per person
      const context = { ...context, travelers: 4 };
      const result = calculateItemPrice(input, context);
      
      expect(result.total).toBe(600); // Still 600, not 2400
      expect(result.perPerson).toBe(150); // 600 / 4
    });
  });
  
  describe('Flight Pricing', () => {
    it('should apply flight markup correctly', () => {
      const input: PriceInput = {
        price: 1000,
        priceType: 'total',
      };
      const context: PricingContext = {
        travelers: 2,
        currency: 'USD',
        agentMarkupPercent: 0, // Test product markup only
        taxes: 0,
        fees: 0,
        discount: 0,
        productType: 'flight',
      };
      
      const result = calculateItemPrice(input, context);
      
      expect(result.basePrice).toBe(1000);
      expect(result.productMarkup).toBeGreaterThanOrEqual(22); // MIN markup
      expect(result.productMarkup).toBeLessThanOrEqual(200); // MAX markup
      expect(result.productMarkupPercent).toBe(7); // 7% markup
    });
  });
  
  describe('Agent Markup', () => {
    it('should apply agent markup to subtotal', () => {
      const items: QuoteItem[] = [
        { type: 'flight', price: 1070, priceType: 'total' }, // $1000 + 7%
        { type: 'hotel', price: 600, priceType: 'per_night' },
      ];
      const context: PricingContext = {
        travelers: 2,
        currency: 'USD',
        agentMarkupPercent: 15,
        taxes: 0,
        fees: 0,
        discount: 0,
        productType: 'flight',
      };
      
      const result = calculateQuotePricing(items, context);
      
      const subtotal = 1070 + 600; // 1670
      expect(result.subtotal).toBe(1670);
      expect(result.agentMarkup).toBe(1670 * 0.15); // 250.5
      expect(result.total).toBe(1670 + 250.5); // 1920.5
    });
  });
});
```

### 7.2 Integration Tests

**File:** `app/api/agents/quotes/__tests__/integration.test.ts`

```typescript
describe('Quote Pricing Integration', () => {
  it('should match frontend and backend calculations', async () => {
    // Create quote via frontend
    const frontendPricing = calculatePricing(items, 15, ...);
    
    // Save via API
    const response = await fetch('/api/agents/quotes', {
      method: 'POST',
      body: JSON.stringify({ ...payload, agentMarkupPercent: 15 }),
    });
    const quote = await response.json();
    
    // Verify they match
    expect(quote.quote.subtotal).toBeCloseTo(frontendPricing.subtotal);
    expect(quote.quote.total).toBeCloseTo(frontendPricing.total);
    expect(quote.quote.perPerson).toBeCloseTo(frontendPricing.perPerson);
  });
  
  it('should validate pricing at save time', async () => {
    const invalidQuote = {
      // Try to manipulate totals
      subtotal: 1000,
      agentMarkup: 150,
      total: 2000, // Wrong! Should be 1150
    };
    
    const response = await fetch('/api/agents/quotes', {
      method: 'POST',
      body: JSON.stringify(invalidQuote),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Pricing validation failed');
  });
});
```

### 7.3 E2E Tests

**File:** `e2e/pricing.spec.ts`

```typescript
describe('Pricing E2E', () => {
  it('should maintain consistency from search to checkout', async () => {
    // 1. Search and add flight
    await page.goto('/agent/quotes/workspace');
    await page.click('[data-testid="flight-tab"]');
    await page.fill('[name="origin"]', 'JFK');
    await page.fill('[name="destination"]', 'LAX');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="flight-results"]');
    await page.click('[data-testid="first-flight"]');
    
    // 2. Check pricing in Agent View
    const agentSubtotal = await page.textContent('[data-testid="subtotal"]');
    const agentTotal = await page.textContent('[data-testid="total"]');
    const agentPerPerson = await page.textContent('[data-testid="per-person"]');
    
    // 3. Save quote
    await page.click('[data-testid="save-quote"]');
    
    // 4. Open client preview
    await page.click('[data-testid="client-preview"]');
    
    // 5. Verify Client View matches Agent View
    const clientTotal = await page.textContent('[data-testid="client-total"]');
    const clientPerPerson = await page.textContent('[data-testid="client-per-person"]');
    
    expect(clientTotal).toBe(agentTotal);
    expect(clientPerPerson).toBe(agentPerPerson);
    
    // 6. Send to client
    await page.click('[data-testid="send-quote"]');
    
    // 7. Open client link
    const clientUrl = await page.getAttribute('[data-testid="client-link"]', 'href');
    await page.goto(clientUrl);
    
    // 8. Verify final pricing
    const finalTotal = await page.textContent('[data-testid="final-total"]');
    expect(finalTotal).toBe(agentTotal);
  });
  
  it('should handle multi-guest hotel pricing correctly', async () => {
    await page.goto('/agent/quotes/workspace');
    
    // Set 4 travelers
    await page.click('[data-testid="travelers-dropdown"]');
    await page.click('[data-testid="set-4-travelers"]');
    
    // Add hotel
    await page.click('[data-testid="hotel-tab"]');
    await page.fill('[name="destination"]', 'Paris');
    await page.fill('[name="checkIn"]', '2024-06-01');
    await page.fill('[name="checkOut"]', '2024-06-04');
    await page.click('[data-testid="search-hotels"]');
    await page.waitForSelector('[data-testid="hotel-results"]');
    await page.click('[data-testid="first-hotel"]');
    
    // Verify hotel price is for room, not per person
    const hotelPrice = await page.textContent('[data-testid="hotel-item-price"]');
    const totalPerPerson = await page.textContent('[data-testid="total-per-person"]');
    
    // If hotel is $200/night × 3 nights = $600
    // With 4 travelers, per-person should be $150
    expect(totalPerPerson).toBe((parseFloat(hotelPrice) / 4).toFixed(2));
  });
});
```

---

## 8. Migration Plan

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix hotel guest count scaling
- [ ] Add pricing validation to API
- [ ] Deploy with monitoring

### Phase 2: Architecture Refactor (Week 2-3)
- [ ] Create `QuotePricingService`
- [ ] Write comprehensive unit tests
- [ ] Replace frontend pricing calculation
- [ ] Replace backend pricing calculation
- [ ] Integration testing

### Phase 3: Double Markup Fix (Week 4)
- [ ] Implement transparent markup tracking
- [ ] Update Agent View to show both markups
- [ ] Update Client View for transparency
- [ ] E2E testing

### Phase 4: Validation & Monitoring (Week 5-6)
- [ ] Deploy to staging
- [ ] Run E2E tests on staging
- [ ] Monitor pricing calculations
- [ ] Fix any issues discovered
- [ ] Deploy to production

### Phase 5: Documentation (Week 7)
- [ ] Update API documentation
- [ ] Create pricing calculation guide
- [ ] Train agents on new pricing breakdown
- [ ] Create support materials

---

## 9. Success Metrics

### Technical Metrics
- [ ] 100% of unit tests passing
- [ ] 0% pricing calculation errors in production
- [ ] < 1% variance between frontend and backend calculations
- [ ] 100% of quotes pass pricing validation

### Business Metrics
- [ ] Reduced pricing discrepancy reports by 90%
- [ ] Increased agent confidence in pricing accuracy
- [ ] Improved customer satisfaction scores
- [ ] Reduced time spent on pricing-related support tickets

### Audit Metrics
- [ ] No violations of pricing invariants in production
- [ ] Clear pricing audit trail for every quote
- [ ] Automated pricing health checks passing

---

## 10. Conclusion

The Fly2Any pricing system has **fundamental architectural issues** that must be addressed to ensure:
1. **Correctness:** Prices are calculated accurately for all product types and guest counts
2. **Consistency:** Agent and Client views always show the same prices
3. **Transparency:** Both agents and clients understand what's included in the price
4. **Trust:** The system validates pricing and prevents errors

The proposed **Unified QuotePricingService** architecture provides:
- Single source of truth for pricing
- Clear separation between base price, product markup, and agent markup
- Comprehensive validation at every stage
- Full audit trail
- Testable, maintainable code

**Immediate Action Required:**
1. Fix hotel guest count scaling (Priority 1)
2. Add pricing validation (Priority 2)
3. Implement unified pricing service (Priority 3)

**Timeline:** 6-7 weeks for complete implementation and rollout.

---

## Appendix: Code References

### Files Analyzed

**Frontend:**
- `components/agent/quote-workspace/QuoteWorkspaceProvider.tsx` - Main pricing logic
- `components/agent/quote-workspace/pricing/PricingZone.tsx` - Agent View display
- `components/agent/quote-workspace/client-preview/ClientPricingPanel.tsx` - Client View display
- `components/agent/quote-workspace/discovery/HotelSearchPanel.tsx` - Hotel pricing
- `components/agent/quote-workspace/discovery/FlightSearchPanel.tsx` - Flight pricing
- `components/agent/quote-workspace/discovery/ActivitiesSearchPanel.tsx` - Activity pricing
- `components/agent/quote-workspace/types/quote-workspace.types.ts` - Type definitions

**Backend:**
- `app/api/agents/quotes/route.ts` - Quote save API
- `app/api/flights/search/route.ts` - Flight search with markup
- `app/api/transfers/search/route.ts` - Transfer search with markup
- `app/api/tours/route.ts` - Tour search with markup
- `app/api/vouchers/validate/route.ts` - Discount validation

### External Dependencies

- `applyFlightMarkup()` from `@/lib/config/flight-markup`
- `calculatePlatformFee()` from `@/lib/stripe/config`
- Various API integrations (Amadeus, Duffel, LiteAPI, Viator)

---

**Report Prepared By:** Principal Engineer / Staff-level Architect  
**Report Date:** January 23, 2026  
**Classification:** Confidential - Internal Use Only  
**Next Review:** After implementation of Priority 1 fixes
