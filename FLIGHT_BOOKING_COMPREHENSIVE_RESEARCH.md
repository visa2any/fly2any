# Flight Booking Experience Redesign - Comprehensive Research Report

**Date:** October 19, 2025
**Purpose:** Research ONLY - No code modifications
**Focus:** Inline expansion, per-segment baggage clarity, fare type transparency, complete booking flow

---

## PART 1: CURRENT STATE ANALYSIS

### 1.1 Current Booking Flow Mapping

Based on code analysis of the application:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CURRENT USER JOURNEY                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Search Form (/)                                                      │
│     ↓                                                                    │
│  2. Results Page (/flights/results)                                      │
│     - FlightCardEnhanced (compact state)                                 │
│     - Click "Details" → Inline expansion                                 │
│     - Click "Select →" button                                            │
│     ↓                                                                    │
│  3. Booking Page (/flights/booking)                                      │
│     Step 1: Passenger Details (passengers)                               │
│     Step 2: Seat Selection (seats)                                       │
│     Step 3: Payment (payment)                                            │
│     Step 4: Review & Confirm (review)                                    │
│     ↓                                                                    │
│  4. Confirmation Page (/flights/booking/confirmation)                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**What Happens After "Select" Click:**

Location: `C:\Users\Power\fly2any-fresh\app\flights\results\page.tsx` (Line 674-736)

```typescript
const handleSelectFlight = async (id: string) => {
  // 1. Save flight data to sessionStorage
  sessionStorage.setItem(`flight_${id}`, JSON.stringify(selectedFlight));

  // 2. Save search context
  sessionStorage.setItem(`flight_search_${id}`, JSON.stringify({...}));

  // 3. Navigate to booking page with parameters
  router.push(`/flights/booking?${params.toString()}`);
}
```

**Files Involved:**
- Results page: `C:\Users\Power\fly2any-fresh\app\flights\results\page.tsx`
- Booking page: `C:\Users\Power\fly2any-fresh\app\flights\booking\page.tsx`
- Confirmation: `C:\Users\Power\fly2any-fresh\app\flights\booking\confirmation\page.tsx`

### 1.2 Current Baggage Display Analysis

**Location:** `C:\Users\Power\fly2any-fresh\components\flights\FlightCardEnhanced.tsx` (Lines 205-246)

**Current Implementation:**

```typescript
const getBaggageInfo = () => {
  const fareDetails = travelerPricings[0]?.fareDetailsBySegment?.[0];
  const checkedBags = fareDetails.includedCheckedBags?.quantity || 0;
  const cabin = fareDetails.cabin || 'ECONOMY';
  const fareType = fareDetails.brandedFare || fareDetails.fareBasis || 'STANDARD';

  return {
    carryOn: !isBasicEconomy,
    carryOnWeight: isPremium ? '18kg' : '10kg',
    checked: checkedBags,
    checkedWeight: isPremium ? '32kg' : '23kg',
    fareType: fareType
  };
}
```

**CRITICAL ISSUE IDENTIFIED:**

The current implementation only reads baggage from the **FIRST segment** (`fareDetailsBySegment[0]`), which means:

❌ **Problem:** Round-trip flights where outbound and return have different baggage allowances show ONLY the outbound baggage policy.

**Example Scenario (not handled correctly):**
```
Round-trip: JFK → MIA → JFK
Outbound (Segment 0): Standard Economy → 1 checked bag
Return (Segment 1): Basic Economy → 0 checked bags

CURRENT DISPLAY: Shows "1 checked bag" for entire trip
CORRECT DISPLAY: Should show per-segment breakdown
```

### 1.3 Current Fare Type Display

**Location:** `C:\Users\Power\fly2any-fresh\components\flights\FlightCardEnhanced.tsx` (Lines 820-861)

**Current State:**
- Shows single fare type from `fareDetailsBySegment[0].brandedFare`
- Displays in "Fare Summary" section (Line 820-861)
- Shows check/cross icons for included services
- NO comparison view for different economy tiers

**Fare Type Detection Logic:**
```typescript
const fareType = fareDetails.brandedFare || fareDetails.fareBasis || 'STANDARD';
const isBasicEconomy = fareType.includes('BASIC') ||
                       fareType.includes('LIGHT') ||
                       fareType.includes('SAVER');
```

### 1.4 Fare Comparison Flow (Current)

**Component:** `C:\Users\Power\fly2any-fresh\components\flights\BrandedFares.tsx`

**Current Approach:**
1. Accordion-style expansion (lines 104-172)
2. Loads fare options via API call to `/api/branded-fares`
3. Shows 3-column grid comparison (Basic, Standard, Flex)
4. Each column shows:
   - Price
   - Amenities with check/cross icons
   - "Select" button

**ISSUE:** This is shown WITHIN the expanded card, not as an inline flow. User must:
1. Expand flight card
2. Scroll to "Upgrade Your Fare" section
3. Click to expand fare comparison
4. Select a fare

### 1.5 Current Inline Expansion

**Location:** `C:\Users\Power\fly2any-fresh\components\flights\FlightCardEnhanced.tsx` (Lines 748-1119)

**Current Expanded View Sections:**

1. **Segment Details** (Lines 476-514 for outbound, 564-602 for return)
   - Airline logo + flight number
   - Aircraft type
   - Terminal information
   - Amenities (WiFi, Power, Meals)
   - Layover information

2. **Key Insights** (Lines 751-863)
   - Deal Score Breakdown (3 columns)
   - Flight Quality Stats
   - Fare Summary

3. **What's Included** (Lines 883-933)
   - Carry-on status
   - Checked bags
   - Seat selection
   - Changes allowed

4. **TruePrice Breakdown** (Lines 936-969)
   - Base fare
   - Taxes & fees
   - Estimated baggage fees
   - Estimated seat fees

5. **Interactive Tools** (Accordion sections, Lines 973-1093)
   - Baggage Fee Calculator
   - Upgrade to Premium Fares (BrandedFares component)
   - Seat Map Preview
   - Fare Rules & Policies

**✅ GOOD:** Already using inline expansion (no modals)
**❌ ISSUE:** Baggage info is aggregated, not per-segment

---

## PART 2: AMADEUS API INSIGHTS

### 2.1 Baggage Data Structure

Based on analysis of `C:\Users\Power\fly2any-fresh\lib\api\amadeus.ts` and web research:

**Amadeus Response Structure:**

```json
{
  "data": [
    {
      "id": "1",
      "travelerPricings": [
        {
          "travelerId": "1",
          "fareOption": "STANDARD",
          "travelerType": "ADULT",
          "fareDetailsBySegment": [
            {
              "segmentId": "1",
              "cabin": "ECONOMY",
              "fareBasis": "K0ASAVER",
              "brandedFare": "ECONOMY_STANDARD",
              "class": "K",
              "includedCheckedBags": {
                "quantity": 1,
                "weight": 23,
                "weightUnit": "KG"
              }
            },
            {
              "segmentId": "2",
              "cabin": "ECONOMY",
              "fareBasis": "K0BSAVER",
              "brandedFare": "ECONOMY_BASIC",
              "class": "K",
              "includedCheckedBags": {
                "quantity": 0
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**KEY FINDING:**
✅ Amadeus DOES provide per-segment baggage data in `fareDetailsBySegment[]` array
✅ Each segment can have different `includedCheckedBags` values
✅ Structure includes both `quantity` and `weight` properties

**Baggage Data Points Available:**
- `includedCheckedBags.quantity` - Number of bags (0, 1, 2, etc.)
- `includedCheckedBags.weight` - Weight limit per bag
- `includedCheckedBags.weightUnit` - Usually "KG"
- Cabin class per segment (`cabin`)
- Branded fare type per segment (`brandedFare`)
- Fare basis code (`fareBasis`)

### 2.2 Fare Family/Type Structure

**Research Finding (from web search + code):**

Amadeus supports ATPCO Branded Fares with common naming:

**Common Fare Family Names:**
1. **LIGHT** / **BASIC** / **SAVER**
   - Lowest price
   - Minimal inclusions
   - Usually no checked bags
   - No changes/refunds

2. **CLASSIC** / **STANDARD** / **ECONOMY**
   - Mid-tier
   - 1 checked bag typically
   - Changes allowed with fee
   - Standard seat selection

3. **FLEX** / **PREMIUM** / **PLUS**
   - Highest price
   - 2+ checked bags
   - Free changes
   - Priority boarding
   - Enhanced amenities

**API Fields:**
- `brandedFare` - Display name (e.g., "ECONOMY_FLEX")
- `fareBasis` - Airline-specific code (e.g., "K0ASAVER")
- `fareOption` - Amadeus classification (e.g., "STANDARD")

### 2.3 Branded Fares API

**Endpoint:** `GET /v1/shopping/flight-offers/{offerId}/branded-fares`

**Mock Implementation Found:**
Location: `C:\Users\Power\fly2any-fresh\app\api\branded-fares\route.ts`

```typescript
// Returns array of fare options for same flight
[
  {
    brandedFare: 'BASIC',
    price: { total: currentPrice, ... },
    amenities: [
      { description: 'Carry-on bag (max 10kg)', isChargeable: false },
      { description: 'Checked bag', isChargeable: true },
      { description: 'Seat selection', isChargeable: true }
    ]
  },
  {
    brandedFare: 'STANDARD',
    price: { total: currentPrice + 80, ... },
    amenities: [
      { description: '1 checked bag (23kg)', isChargeable: false },
      { description: 'Standard seat selection', isChargeable: false }
    ]
  },
  // ... more fare options
]
```

**Usage Pattern:**
1. Flight Offers Search returns flights with their current fare
2. Branded Fares API returns ALTERNATIVE fare options for same flight
3. User can upgrade/downgrade within same cabin class

### 2.4 Fare Rules Data Structure

**Endpoint:** `POST /v1/shopping/flight-offers/pricing?include=detailed-fare-rules`

**Location:** `C:\Users\Power\fly2any-fresh\lib\api\amadeus.ts` (Lines 365-458)

**Response Structure:**
```json
{
  "data": {
    "fareRules": {
      "rules": [
        {
          "category": "REFUNDS",
          "maxPenaltyAmount": "0.00",
          "rules": [{
            "notApplicable": false,
            "descriptions": {
              "text": "NON-REFUNDABLE TICKET..."
            }
          }]
        },
        {
          "category": "EXCHANGE",
          "rules": [{
            "notApplicable": true,
            "descriptions": {
              "text": "CHANGES NOT PERMITTED..."
            }
          }]
        }
      ]
    }
  }
}
```

**Categories Available:**
- REFUNDS - Cancellation policy
- EXCHANGE - Change policy
- REVALIDATION - Rebooking rules

**Current Implementation:**
- Fetched on-demand when user clicks "Refund & Change Policies"
- Parsed and displayed in `FareRulesAccordion` component

---

## PART 3: COMPETITOR BEST PRACTICES

### 3.1 Google Flights Analysis

**Research Findings (from web search, 2025 data):**

**Baggage Display:**
✅ Shows baggage allowance in initial search results (added late 2024)
✅ "Details" link shows full baggage policy per segment
✅ Baggage filter to show only flights with included bags
✅ Clear indication: "Personal item only" vs "Carry-on included" vs "Checked bag included"

**Expansion Pattern:**
- **Inline expansion** when clicking flight row
- Expands BELOW the compact card
- Shows:
  - Detailed route with layover times
  - Aircraft types
  - Carbon emissions
  - Baggage policy
  - Fare class restrictions

**Fare Type Display:**
- Separate rows for different fare types when available
- Example: "Basic Economy $299" vs "Main Economy $349"
- Clear comparison of what's included
- NO inline upgrade flow - shows as separate flight options

**Best Practices to Adopt:**
✅ Baggage visibility in compact card
✅ Per-segment baggage breakdown in expansion
✅ Clear visual hierarchy
✅ No modals - everything inline

**What to Avoid:**
❌ Don't show fare types as separate flights (confusing)
❌ Don't hide baggage until expansion

### 3.2 Kayak Analysis

**Research Findings:**

**Baggage Fee Assistant:**
✅ Toolbar at top of results showing total price WITH baggage fees
✅ User selects number of bags → prices update dynamically
✅ Shows calculated fees during search phase, not at checkout

**Implementation:**
- Input: Number of carry-on + checked bags
- Output: Adjusted fare including bag fees
- Updates ALL results simultaneously

**Fare Comparison:**
- Shows different fare classes as tabs or expandable sections
- Side-by-side comparison of Basic vs Standard vs Flex
- Clear pricing deltas

**Expansion Style:**
- **Inline expansion** below card
- Shows:
  - Flight path visualization
  - Layover details
  - Amenities
  - Baggage policy

**Best Practices to Adopt:**
✅ Proactive baggage fee calculation
✅ Dynamic price updates based on baggage needs
✅ Clear fare class comparison

**What to Avoid:**
❌ Kayak doesn't show elite status benefits (limitation)

### 3.3 Skyscanner Analysis

**General Research Findings:**

**Expansion:**
- Inline expansion
- Focus on price comparison across booking sites
- Less emphasis on per-segment details

**Baggage:**
- Basic baggage info shown
- Links to airline policy pages

**Not a strong model for our use case** - focuses more on metasearch aggregation than detailed flight info.

---

## PART 4: REDESIGN PROPOSAL

### 4.1 New Inline Expansion Structure

**GOAL:** Per-segment clarity + Fare transparency + Inline booking flow

```
┌────────────────────────────────────────────────────────────────────────┐
│ COMPACT CARD (collapsed state)                                         │
├────────────────────────────────────────────────────────────────────────┤
│ ✈️ American Airlines AA123  ⭐ 4.2  🏷️ ECONOMY STANDARD               │
│                                                                         │
│ 08:30 JFK  ────✈️──── 6h 15m ──────  14:45 MIA                        │
│              Direct                                                     │
│                                                                         │
│ 💼 1 checked bag included · 🎒 Carry-on included                       │
│                                                                         │
│ $450  [Details ▼]  [Select →]                                          │
└────────────────────────────────────────────────────────────────────────┘

    ⬇️ CLICK "Details" ⬇️

┌────────────────────────────────────────────────────────────────────────┐
│ EXPANDED INLINE VIEW (NO MODAL)                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ SECTION 1: PER-SEGMENT BREAKDOWN                                ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                         │
│ ┌──────────────────────────────────────────────────────────────┐      │
│ │ 🛫 OUTBOUND: JFK → MIA (Mar 15)                              │      │
│ │                                                               │      │
│ │ AA 123  |  Boeing 737-800  |  6h 15m  |  Direct               │      │
│ │                                                               │      │
│ │ FARE: Economy Standard                                        │      │
│ │ ✅ Carry-on included (10kg)                                   │      │
│ │ ✅ 1 checked bag (23kg)                                       │      │
│ │ ✅ Standard seat selection                                    │      │
│ │ ✅ Changes allowed ($75 fee)                                  │      │
│ │ ❌ Not refundable                                             │      │
│ └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│ ┌──────────────────────────────────────────────────────────────┐      │
│ │ 🛬 RETURN: MIA → JFK (Mar 22)                                │      │
│ │                                                               │      │
│ │ AA 456  |  Boeing 737-800  |  5h 45m  |  Direct               │      │
│ │                                                               │      │
│ │ FARE: Economy Basic  ⚠️ DIFFERENT FROM OUTBOUND               │      │
│ │ ✅ Personal item only (under seat)                            │      │
│ │ ❌ NO carry-on bag                                            │      │
│ │ ❌ NO checked bags (add for $35)                              │      │
│ │ ❌ NO seat selection (assigned at gate)                       │      │
│ │ ❌ NO changes allowed                                         │      │
│ └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ SECTION 2: FARE TYPE COMPARISON (INLINE)                        ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                         │
│ 💡 Upgrade your return flight to Standard Economy for better value    │
│                                                                         │
│ ┌────────────┬────────────────┬────────────────┬────────────────┐     │
│ │            │ BASIC (current)│ STANDARD       │ FLEX           │     │
│ ├────────────┼────────────────┼────────────────┼────────────────┤     │
│ │ OUTBOUND   │ ✓ Included     │ +$50           │ +$120          │     │
│ │ (already   │                │                │                │     │
│ │  Standard) │                │                │                │     │
│ ├────────────┼────────────────┼────────────────┼────────────────┤     │
│ │ RETURN     │ ✓ Current      │ ⭐ RECOMMENDED │ Upgrade        │     │
│ │            │ $450           │ $485 (+$35)    │ $570 (+$120)   │     │
│ │            │                │                │                │     │
│ │ Carry-on   │ ❌ No          │ ✅ Yes (10kg)  │ ✅ Yes (18kg)  │     │
│ │ Checked    │ ❌ No          │ ✅ 1 bag (23kg)│ ✅ 2 bags      │     │
│ │ Seat       │ ❌ At gate     │ ✅ Standard    │ ✅ Premium     │     │
│ │ Changes    │ ❌ Not allowed │ ✅ $75 fee     │ ✅ Free        │     │
│ │ Refund     │ ❌ No          │ ❌ No          │ ✅ Yes         │     │
│ │            │                │ [Upgrade →]    │ [Upgrade →]    │     │
│ └────────────┴────────────────┴────────────────┴────────────────┘     │
│                                                                         │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ SECTION 3: TRUE PRICE CALCULATOR                                ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                         │
│ Base fare (outbound + return)           $380                           │
│ Taxes & fees                             $70                           │
│ ─────────────────────────────────────────────                          │
│ Current selection                        $450                           │
│                                                                         │
│ If you add 1 checked bag (return):     +$35  ⚠️                        │
│ If you add seat selection (both):      +$30                            │
│ ─────────────────────────────────────────────                          │
│ Estimated total with extras:            $515                           │
│                                                                         │
│ 💡 TIP: Upgrading return to Standard ($485 total) saves you $30        │
│    compared to adding bags separately!                                 │
│                                                                         │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ SECTION 4: INTERACTIVE TOOLS (Accordions)                       ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                         │
│ [▼] Detailed Fare Rules & Restrictions                                 │
│ [▼] Seat Map Preview                                                   │
│ [▼] Baggage Fee Calculator (for extra bags)                            │
│                                                                         │
│ [← Collapse]                                     [Select This Flight →]│
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Per-Segment Baggage Display Design

**KEY PRINCIPLES:**

1. **Visual Differentiation**
   - Different background colors for outbound vs return
   - Border highlight if segments have different policies
   - Warning icon (⚠️) when policies differ significantly

2. **Information Hierarchy**
   ```
   HIGH PRIORITY (always visible):
   - Number of checked bags
   - Carry-on allowance

   MEDIUM PRIORITY (visible in expansion):
   - Weight limits
   - Size restrictions
   - Fare class name

   LOW PRIORITY (on-demand/tooltip):
   - Airline policy link
   - Exception rules
   ```

3. **Comparison Emphasis**
   ```
   IF outbound.bags ≠ return.bags THEN
     Show warning: "⚠️ Different baggage policies for outbound and return"
     Highlight differences in red
     Show side-by-side comparison
   ```

**HTML/Text Structure:**
```
┌─────────────────────────────────────────────────────┐
│ OUTBOUND (Segment 1): JFK → MIA                     │
│ Economy Standard                                     │
│ ✅ Carry-on (10kg) + ✅ 1 Checked bag (23kg)        │
├─────────────────────────────────────────────────────┤
│ RETURN (Segment 2): MIA → JFK                       │
│ Economy Basic ⚠️                                     │
│ ❌ Personal item only + ❌ No checked bags          │
│ (Add checked bag for $35)                            │
└─────────────────────────────────────────────────────┘
```

### 4.3 Fare Type Comparison Interface

**DESIGN PATTERN: Inline Upgrade Table**

**Placement:** Immediately after per-segment breakdown

**Structure:**
- **Column-based** comparison (3-4 fare types)
- **Row-based** features (baggage, changes, refunds, etc.)
- **Per-segment upgrades** - allow upgrading individual segments

**Key Features:**

1. **Smart Recommendations**
   ```javascript
   // Detect if current selection has limitations
   const hasBasicEconomySegment = segments.some(s => s.fareType === 'BASIC');

   if (hasBasicEconomySegment) {
     showRecommendation: "Upgrade to Standard to add checked bags"
     calculateSavings: standardUpgradeCost < (basicCost + baggageFeeCost)
   }
   ```

2. **Clear Pricing Deltas**
   - Show "+$X" for each upgrade
   - Show total cost comparison
   - Highlight best value option

3. **Feature Matrix**
   - Green checkmarks for included
   - Red X for not included
   - Yellow "fee applies" for paid options

4. **Action Buttons**
   - "Upgrade →" button per column
   - Updates price dynamically
   - No page reload - instant update

### 4.4 Visual Hierarchy Principles

**1. COMPACT CARD (Collapsed)**
```
MOST IMPORTANT:
- Price (largest, bold)
- Route + time
- Airline + flight number

SECONDARY:
- Direct vs stops
- Duration
- Rating

TERTIARY (if space):
- Baggage summary icon
- Deal badge
```

**2. EXPANDED VIEW (Inline)**
```
SECTION ORDER (top to bottom):

1. Per-segment flight details
   - Route, time, aircraft
   - Airline info, amenities

2. Per-segment baggage + fare
   ⚠️ THIS IS THE CRITICAL SECTION
   - Clear visual separation
   - Highlight differences

3. Fare comparison table
   - Upgrade options
   - Side-by-side features

4. Price calculator
   - True cost estimation
   - Add-ons preview

5. Interactive tools (accordions)
   - Seat map
   - Detailed fare rules
   - Baggage calculator
```

**3. VISUAL CUES**
```css
/* Differentiation colors */
.outbound-segment { border-left: 4px solid blue; }
.return-segment { border-left: 4px solid purple; }

/* Warning for mismatched policies */
.different-policy {
  border: 2px solid orange;
  background: orange-50;
}

/* Fare comparison */
.recommended-fare {
  border: 2px solid green;
  box-shadow: 0 0 20px green-100;
}
```

---

## PART 5: COMPLETE USER JOURNEY (PROPOSED)

### 5.1 Updated End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: SEARCH                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ User enters: JFK → MIA, Mar 15-22, 1 adult, Economy                 │
│ Submits search                                                       │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: RESULTS (COMPACT VIEW)                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Shows 10-50 flight options                                           │
│ Each card shows:                                                     │
│  - Price (prominent)                                                 │
│  - Route summary                                                     │
│  - Baggage SUMMARY (icon + "1 bag" or "No bags")                    │
│  - [Details ▼] [Select →] buttons                                   │
└─────────────────────────────────────────────────────────────────────┘
         ↓ User clicks "Details" on a flight
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: INLINE EXPANSION (NEW)                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Card expands BELOW (no modal, no new page)                           │
│                                                                       │
│ Section A: Per-Segment Breakdown                                     │
│  ┌─────────────────────────────────────────┐                        │
│  │ Outbound: JFK → MIA                     │                        │
│  │ Economy Standard                         │                        │
│  │ ✅ 1 checked bag                         │                        │
│  └─────────────────────────────────────────┘                        │
│  ┌─────────────────────────────────────────┐                        │
│  │ Return: MIA → JFK                       │                        │
│  │ Economy Basic ⚠️                         │                        │
│  │ ❌ NO checked bags                       │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                       │
│ Section B: Fare Comparison (NEW)                                     │
│  User sees they can upgrade return to Standard for +$35              │
│  Table shows Basic vs Standard vs Flex                               │
│  [Upgrade Return to Standard +$35] button                            │
│                                                                       │
│ Section C: Price Calculator                                          │
│  Shows true cost with estimated add-ons                              │
│  Recommends upgrading if cheaper than buying bags separately         │
│                                                                       │
│ USER DECISION POINT:                                                 │
│  - Keep current fare → [Select This Flight →]                        │
│  - Upgrade fare → Click upgrade button → Price updates → [Select]    │
└─────────────────────────────────────────────────────────────────────┘
         ↓ User clicks "Select This Flight →"
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: BOOKING FLOW (EXISTING)                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Substep 4.1: Passenger Details                                       │
│  - Name, DOB, passport, contact info                                 │
│                                                                       │
│ Substep 4.2: Seat Selection (with per-segment awareness)             │
│  - Shows outbound seat map                                           │
│  - Shows return seat map                                             │
│  - Costs depend on fare type PER SEGMENT                             │
│                                                                       │
│ Substep 4.3: Add-ons & Extras                                        │
│  - CRITICAL: Show per-segment baggage options                        │
│  - "Outbound: 1 bag included, add 2nd bag for $35"                   │
│  - "Return: No bags included, add 1st bag for $35"                   │
│  - Insurance, lounge access, etc.                                    │
│                                                                       │
│ Substep 4.4: Payment                                                 │
│  - Credit card info                                                  │
│  - Billing address                                                   │
│                                                                       │
│ Substep 4.5: Review & Confirm                                        │
│  - Final price breakdown                                             │
│  - Per-segment summary                                               │
│  - Terms acceptance                                                  │
│  - [Confirm & Pay] button                                            │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: CONFIRMATION                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Booking confirmed                                                    │
│ Booking reference: ABC123                                            │
│ Email sent with:                                                     │
│  - E-tickets                                                         │
│  - Per-segment baggage allowance                                     │
│  - Fare rules                                                        │
│  - Check-in links                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Where Improvements Are Needed

**CURRENT GAPS:**

1. **Results Page Compact View**
   - ❌ Baggage summary is hidden (only visible after expansion)
   - ✅ Fix: Add baggage icon + count to compact card

2. **Inline Expansion**
   - ❌ Baggage shown aggregated, not per-segment
   - ❌ Fare comparison requires extra click (accordion)
   - ✅ Fix: Prominent per-segment breakdown
   - ✅ Fix: Inline fare comparison table

3. **Booking Flow - Add-ons Step**
   - ❌ No explicit add-ons step (currently embedded in seat selection)
   - ❌ Baggage add-on doesn't show per-segment options
   - ✅ Fix: Add dedicated "Add-ons & Extras" step
   - ✅ Fix: Per-segment baggage selection

4. **Review & Confirm**
   - ❌ Doesn't show per-segment baggage breakdown
   - ✅ Fix: Show outbound vs return policies clearly

---

## PART 6: IMPLEMENTATION CHECKLIST

### 6.1 Data Parsing Requirements

**AMADEUS API CHANGES NEEDED:**

1. **Baggage Parsing**
   ```typescript
   // CURRENT (WRONG):
   const fareDetails = travelerPricings[0]?.fareDetailsBySegment?.[0];
   const checkedBags = fareDetails.includedCheckedBags?.quantity || 0;

   // NEW (CORRECT):
   const getBaggagePerSegment = () => {
     return travelerPricings[0]?.fareDetailsBySegment?.map(segment => ({
       segmentId: segment.segmentId,
       cabin: segment.cabin,
       fareType: segment.brandedFare || segment.fareBasis,
       checkedBags: segment.includedCheckedBags?.quantity || 0,
       checkedWeight: segment.includedCheckedBags?.weight || 0,
       weightUnit: segment.includedCheckedBags?.weightUnit || 'KG',
       // Infer carry-on based on fare type
       carryOn: !isBasicEconomy(segment.brandedFare)
     }));
   };
   ```

2. **Fare Type Detection Per Segment**
   ```typescript
   const isBasicEconomy = (fareType: string) => {
     const basicKeywords = ['BASIC', 'LIGHT', 'SAVER', 'RESTRICTED'];
     return basicKeywords.some(kw => fareType.toUpperCase().includes(kw));
   };
   ```

3. **Segment Matching**
   ```typescript
   // Map fareDetailsBySegment to itineraries.segments
   const matchSegmentToBaggage = (itinerary, baggageData) => {
     return itinerary.segments.map((segment, idx) => {
       const baggage = baggageData.find(b => b.segmentId === segment.id);
       return { ...segment, baggage };
     });
   };
   ```

### 6.2 Component Modifications

**FlightCardEnhanced.tsx** (Main changes)

Location: `C:\Users\Power\fly2any-fresh\components\flights\FlightCardEnhanced.tsx`

**Changes Required:**

1. **Add Per-Segment Baggage Section** (after line 863)
   ```typescript
   {/* NEW SECTION: Per-Segment Baggage Breakdown */}
   <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
     <h4 className="font-semibold text-xs text-gray-900 mb-2">
       Baggage Allowance by Flight
     </h4>

     {/* Outbound */}
     <div className="mb-2 p-2 bg-white rounded border-l-4 border-blue-500">
       <div className="font-semibold text-xs">Outbound: {outbound.segments[0].departure.iataCode} → {outbound.segments[outbound.segments.length-1].arrival.iataCode}</div>
       <BaggageDisplay segment={outboundBaggage} />
     </div>

     {/* Return (if exists) */}
     {inbound && (
       <div className="p-2 bg-white rounded border-l-4 border-purple-500">
         <div className="font-semibold text-xs">Return: {inbound.segments[0].departure.iataCode} → {inbound.segments[inbound.segments.length-1].arrival.iataCode}</div>
         <BaggageDisplay segment={inboundBaggage} />
       </div>
     )}

     {/* Warning if different */}
     {inbound && outboundBaggage.checkedBags !== inboundBaggage.checkedBags && (
       <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded flex items-start gap-2">
         <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
         <span className="text-xs text-orange-800">
           Different baggage policies for outbound and return flights
         </span>
       </div>
     )}
   </div>
   ```

2. **Move Fare Comparison Higher** (currently in accordion, move to main view)
   - Change from accordion to always-visible section
   - Place after per-segment baggage breakdown
   - Show as comparison table, not modal

3. **Update Compact Card** (line 326-746)
   - Add baggage icon to header
   - Show quick baggage summary

**NEW Component Required:**

`components/flights/BaggageDisplay.tsx`
```typescript
interface BaggageDisplayProps {
  segment: {
    fareType: string;
    checkedBags: number;
    checkedWeight: number;
    weightUnit: string;
    carryOn: boolean;
  };
}

export function BaggageDisplay({ segment }: BaggageDisplayProps) {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-1">
        {segment.carryOn ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <X className="w-3 h-3 text-red-600" />
        )}
        <span>Carry-on {segment.carryOn ? 'included' : 'not allowed'}</span>
      </div>
      <div className="flex items-center gap-1">
        {segment.checkedBags > 0 ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <X className="w-3 h-3 text-red-600" />
        )}
        <span>
          {segment.checkedBags} checked bag{segment.checkedBags !== 1 ? 's' : ''}
          {segment.checkedBags > 0 && ` (${segment.checkedWeight}${segment.weightUnit})`}
        </span>
      </div>
      <div className="text-gray-500 italic">Fare: {segment.fareType}</div>
    </div>
  );
}
```

**NEW Component Required:**

`components/flights/InlineFareComparison.tsx`
```typescript
interface FareOption {
  fareType: string;
  price: number;
  priceDelta: number; // difference from current
  features: {
    carryOn: boolean;
    checkedBags: number;
    seatSelection: 'none' | 'standard' | 'premium';
    changes: 'not-allowed' | 'fee' | 'free';
    refund: boolean;
  };
}

interface InlineFareComparisonProps {
  currentFare: FareOption;
  availableFares: FareOption[];
  onSelectFare: (fare: FareOption) => void;
}

export function InlineFareComparison({ currentFare, availableFares, onSelectFare }: InlineFareComparisonProps) {
  // Render side-by-side comparison table
  // Highlight recommended option
  // Show price deltas
  // Include "Upgrade" buttons
}
```

### 6.3 Booking Flow Updates

**FILE:** `C:\Users\Power\fly2any-fresh\app\flights\booking\page.tsx`

**CHANGES:**

1. **Add new step: "Add-ons"**
   ```typescript
   type BookingStep = 'passengers' | 'seats' | 'addons' | 'payment' | 'review';
   ```

2. **Add-ons Step Component**
   ```typescript
   function AddonsStep({ segments, onUpdate }) {
     return (
       <div>
         <h3>Enhance Your Trip</h3>

         {/* Per-segment baggage */}
         {segments.map((segment, idx) => (
           <div key={idx}>
             <h4>{segment.route}</h4>
             <BaggageAddonSelector
               currentAllowance={segment.baggage}
               onSelect={(bags) => onUpdate(idx, 'baggage', bags)}
             />
           </div>
         ))}

         {/* Other add-ons */}
         <InsuranceSelector />
         <LoungeAccessSelector />
       </div>
     );
   }
   ```

3. **Update Review Step**
   - Show per-segment baggage summary
   - Highlight any upgrades selected
   - Clear price breakdown

### 6.4 API Route Updates

**NEW API ROUTE NEEDED:**

`app/api/fare-upgrade/route.ts`
```typescript
// Endpoint to upgrade a specific segment's fare
export async function POST(request: Request) {
  const { flightId, segmentId, newFareType } = await request.json();

  // 1. Fetch current flight offer
  // 2. Update fareDetailsBySegment for specific segment
  // 3. Re-price with Amadeus API
  // 4. Return updated flight offer with new price

  return Response.json({
    updatedFlight: {...},
    priceChange: +35
  });
}
```

**EXISTING ROUTES TO MODIFY:**

`app/api/branded-fares/route.ts`
- Add per-segment fare options
- Return upgrades for individual segments, not just whole trip

---

## KEY FINDINGS SUMMARY

### CRITICAL DISCOVERIES

1. **Amadeus DOES provide per-segment baggage data**
   - Located in `travelerPricings[0].fareDetailsBySegment[]`
   - Each segment can have different `includedCheckedBags`
   - Current code only reads segment[0], missing return flight differences

2. **Current implementation has a major gap:**
   - Round-trip flights with different outbound/return fares show ONLY outbound baggage
   - Users booking Basic Economy return don't see that bags aren't included

3. **Inline expansion is already implemented**
   - No modals used ✅
   - Already expands below card ✅
   - Just needs per-segment sections added

4. **Fare comparison exists but is hidden**
   - BrandedFares component already built
   - Currently in accordion (requires extra click)
   - Should be prominent in main expansion view

5. **Competitor best practices align with requirements:**
   - Google Flights: Shows baggage in initial results + detailed expansion
   - Kayak: Proactive baggage fee calculation
   - Both: Inline expansion, no modals

### RECOMMENDED APPROACH

**PHASE 1: Quick Wins (Highest Impact)**
1. Fix baggage parsing to read ALL segments (not just [0])
2. Add per-segment baggage display in expanded view
3. Move fare comparison from accordion to main view
4. Add baggage icon to compact card

**PHASE 2: Enhanced UX**
1. Build inline fare comparison table
2. Add smart recommendations (upgrade vs add bags separately)
3. Implement true price calculator with dynamic updates
4. Add per-segment baggage in booking flow

**PHASE 3: Complete Flow**
1. Add dedicated add-ons step in booking
2. Implement fare upgrade API endpoint
3. Add email templates with per-segment info
4. Build management dashboard for bookings

### TECHNICAL FEASIBILITY

**✅ EASY (can be done now):**
- Per-segment baggage parsing
- Visual redesign of expanded view
- Moving fare comparison to main view

**⚠️ MEDIUM (requires API work):**
- Fare upgrade endpoints
- Dynamic price recalculation
- Branded fares per segment

**❌ COMPLEX (needs deep integration):**
- Real-time seat map with per-segment pricing
- Amadeus booking creation with segment-specific fares
- Post-booking modifications

---

## APPENDIX: CODE REFERENCES

### Key Files Analyzed

1. **Flight Card Component**
   - Path: `C:\Users\Power\fly2any-fresh\components\flights\FlightCardEnhanced.tsx`
   - Lines: 1-1188 (complete component)
   - Current baggage parsing: Lines 205-246
   - Expansion view: Lines 748-1119

2. **Results Page**
   - Path: `C:\Users\Power\fly2any-fresh\app\flights\results\page.tsx`
   - Lines: 1-1275
   - Select handler: Lines 674-736
   - Filter/sort logic: Lines 132-354

3. **Booking Page**
   - Path: `C:\Users\Power\fly2any-fresh\app\flights\booking\page.tsx`
   - Lines: 1-1751
   - Step flow: Lines 25, 382-449
   - Passenger step: Lines 589-765
   - Seat step: Lines 771-943
   - Payment step: Lines 949-1130
   - Review step: Lines 1136-1272

4. **Amadeus API Integration**
   - Path: `C:\Users\Power\fly2any-fresh\lib\api\amadeus.ts`
   - Lines: 1-1122
   - Mock data structure: Lines 196-333
   - Branded fares: Lines 605-625
   - Fare rules: Lines 365-458

5. **Branded Fares Component**
   - Path: `C:\Users\Power\fly2any-fresh\components\flights\BrandedFares.tsx`
   - Lines: 1-176
   - Fare loading: Lines 37-73
   - Display: Lines 104-172

### Amadeus API Response Examples (from code)

**Flight Offer Structure:**
```json
{
  "id": "MOCK_1",
  "itineraries": [
    {
      "duration": "PT6H15M",
      "segments": [{
        "departure": { "iataCode": "JFK", "at": "2025-03-15T08:30:00" },
        "arrival": { "iataCode": "MIA", "at": "2025-03-15T14:45:00" },
        "carrierCode": "AA",
        "number": "123"
      }]
    },
    {
      "duration": "PT5H45M",
      "segments": [{
        "departure": { "iataCode": "MIA", "at": "2025-03-22T10:00:00" },
        "arrival": { "iataCode": "JFK", "at": "2025-03-22T15:45:00" },
        "carrierCode": "AA",
        "number": "456"
      }]
    }
  ],
  "travelerPricings": [{
    "fareDetailsBySegment": [
      {
        "segmentId": "1_1",
        "cabin": "ECONOMY",
        "fareBasis": "K0ASAVER",
        "brandedFare": "ECONOMY",
        "includedCheckedBags": { "quantity": 2 }
      }
    ]
  }]
}
```

---

## CONCLUSION

This research document provides a comprehensive foundation for redesigning the flight booking experience with:

1. ✅ **Clear understanding of current implementation** - Complete flow mapping with file locations
2. ✅ **Amadeus API structure documented** - Per-segment baggage data IS available, just not being used
3. ✅ **Competitor insights** - Google Flights and Kayak patterns analyzed
4. ✅ **Detailed redesign proposal** - Inline expansion structure with per-segment clarity
5. ✅ **Implementation roadmap** - Component changes, API requirements, and phased approach

**Next Steps (when ready to implement):**
1. Start with Phase 1: Fix baggage parsing and add per-segment display
2. Test with real Amadeus API responses to validate data structure
3. Build out inline fare comparison table
4. Add dedicated add-ons step to booking flow
5. Implement dynamic pricing updates

**NO CODE WAS MODIFIED** - This is research documentation only as requested.

---

*Research completed: October 19, 2025*
*Analyst: Claude (Sonnet 4.5)*
*Status: RESEARCH COMPLETE - Ready for design and implementation phase*
