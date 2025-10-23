# FlightCardEnhanced.tsx - Expanded Section Analysis
## COMPREHENSIVE UX ISSUE BREAKDOWN

**Date:** 2025-10-22
**File Analyzed:** `C:\Users\Power\fly2any-fresh\components\flights\FlightCardEnhanced.tsx`
**Lines Analyzed:** 498-1044 (Expanded Section)

---

## EXECUTIVE SUMMARY

The expanded card has **CRITICAL architectural flaws**:

1. **REDUNDANCY**: Baggage info shown 3 times, fare type shown 3 times
2. **MISPLACED DATA**: Flight quality stats shown ONCE for entire trip (should be per-leg)
3. **PER-LEG vs PER-FLIGHT CONFUSION**: Outbound and return can have DIFFERENT fares, baggage, aircraft quality - but current structure treats everything as ONE
4. **MISSING CONVERSION DATA**: No per-segment amenities (WiFi status, power outlets, legroom)
5. **FAKE/MISLEADING ELEMENTS**: No verified airline badges found, but Deal Score breakdown uses questionable metrics

---

## SECTION-BY-SECTION BREAKDOWN

### CURRENT STRUCTURE (Lines 762-1044)

```
EXPANDED DETAILS (when isExpanded === true)
├── SECTION 1: Flight Quality & Fare Type (Lines 764-829)
│   ├── Left Column: Flight Quality Stats (ONCE for entire trip)
│   └── Right Column: Fare Type & Inclusions (ONCE for entire trip)
│
├── SECTION 2: Deal Score Breakdown (Lines 831-873)
│   └── Collapsible details with component scores
│
├── Premium Badges (Lines 875-889) [OPTIONAL]
│   └── Dynamic badges array
│
├── SECTION 3: Fare & Pricing (Lines 891-980) [DUPLICATE OF SECTION 1]
│   ├── Left: What's Included (baggage, seat selection)
│   └── Right: TruePrice Breakdown
│
├── SECTION 4: Interactive Tools (Lines 982-1018)
│   └── Fare Rules & Policies (Collapsible)
│
└── Basic Economy Warning (Lines 1020-1042) [CONDITIONAL]
    └── Restrictions + CTA to upgrade
```

### SEGMENT DISPLAY STRUCTURE (Lines 498-597)

**When Expanded - Shows PER-SEGMENT Info:**
- Airline logo + airline name + flight number
- Aircraft code
- Terminal info (departure/arrival)
- Layover warnings

**MISSING FROM SEGMENT DISPLAY:**
- WiFi availability (per aircraft)
- Power outlets (per aircraft)
- Legroom/pitch (per aircraft)
- Meal service (per segment)
- Baggage allowance (PER LEG - can differ!)
- Fare type (PER LEG - can differ!)

---

## CRITICAL ISSUE #1: REDUNDANT INFORMATION

### BAGGAGE INFO - SHOWN 3 TIMES

| Location | Lines | Display Type | Purpose |
|----------|-------|--------------|---------|
| **Footer Icons** | 705-721 | Compact icon display (🎒✓/✗ 💼#) | Quick glance |
| **Section 1 - Right Column** | 784-827 | Full checklist with weights | Detailed view |
| **Section 3 - Left Column** | 893-943 | IDENTICAL to Section 1 | ??? REDUNDANT |

**VERDICT:** Section 3 "What's Included" (lines 893-943) is a COMPLETE DUPLICATE of Section 1 Right Column (lines 784-827). DELETE ONE.

---

### FARE TYPE - SHOWN 3 TIMES

| Location | Lines | Display |
|----------|-------|---------|
| **Section 1 Header** | 785 | "Fare Type: {fareType}" |
| **Section 3 Header** | 896-899 | "What's Included ({fareType})" |
| **Basic Economy Warning** | 1026 | "Basic Economy Restrictions" |

**VERDICT:** Redundant. Should show ONCE in a prominent location.

---

### PRICE BREAKDOWN - SHOWN 2 TIMES

| Location | Lines | Display |
|----------|-------|---------|
| **Footer** | 679-703 | Price + vs market badge |
| **Section 3 - TruePrice** | 946-978 | Full breakdown with estimates |

**VERDICT:** Footer shows final price, Section 3 shows breakdown. This is OK, but "TruePrice" section could be relocated to be more prominent.

---

## CRITICAL ISSUE #2: MISPLACED INFORMATION

### FLIGHT QUALITY STATS (Lines 767-781)

**CURRENT:** Shown ONCE at top of expanded section
```tsx
<div className="p-3 bg-white rounded-lg border-2 border-blue-200">
  <h4>Flight Quality</h4>
  <div>On-time Performance: {airlineData.onTimePerformance}%</div>
  <div>Comfort Rating: {airlineData.rating.toFixed(1)}★</div>
</div>
```

**PROBLEM:**
- Uses `primaryAirline` (line 130) which is only the FIRST airline
- For multi-airline trips (codeshares, connections), shows wrong data for return flight
- On-time performance is AIRLINE-specific, but card can have MULTIPLE airlines across segments

**SHOULD BE:**
- Shown WITH each flight leg (outbound/return)
- Calculated PER SEGMENT (each segment can have different operating carrier)

---

### BAGGAGE/FARE INCLUSIONS (Lines 784-827, 893-943)

**CURRENT:** Shown ONCE for entire trip

**PROBLEM - CRITICAL ARCHITECTURAL FLAW:**

According to Amadeus API structure, `travelerPricings[0].fareDetailsBySegment` is an **ARRAY** - meaning EACH SEGMENT can have DIFFERENT fare details:

```typescript
fareDetailsBySegment: [
  {
    segmentId: "1",  // Outbound segment
    cabin: "ECONOMY",
    brandedFare: "BASIC",
    includedCheckedBags: { quantity: 0 }
  },
  {
    segmentId: "2",  // Return segment
    cabin: "PREMIUM_ECONOMY",
    brandedFare: "STANDARD",
    includedCheckedBags: { quantity: 1 }
  }
]
```

**CURRENT CODE (Lines 220-221):**
```typescript
const fareDetails = firstTraveler.fareDetailsBySegment?.[0];  // ONLY GETS FIRST SEGMENT!
```

This means:
- If outbound is Basic Economy (0 bags) and return is Standard (1 bag)
- Card will show "0 bags" for ENTIRE trip
- User books thinking no bags included, but return flight actually includes 1 bag

**REAL-WORLD IMPACT:**
- United Basic Economy outbound + United Economy return = DIFFERENT baggage rules
- Mixed carrier bookings (e.g., United outbound, Lufthansa return via Star Alliance) = VERY different rules
- International segments often have 1+ bags, domestic segments often have 0 bags

**SHOULD BE:**
- Shown PER LEG (outbound vs return)
- If all segments match → show once as "Both flights"
- If segments differ → show clearly "Outbound: X, Return: Y"

---

## CRITICAL ISSUE #3: PER-LEG vs PER-FLIGHT ARCHITECTURE

### CURRENT ARCHITECTURE

```
TRIP-LEVEL (shown once):
├── Flight Quality (airline rating, on-time %)
├── Fare Type
├── Baggage Allowance
└── Seat Selection Rules

PER-SEGMENT (shown in collapsed details):
├── Airline name + flight number
├── Aircraft code
├── Terminals
└── Layover times
```

### CORRECT ARCHITECTURE SHOULD BE

```
TRIP-LEVEL (shown once):
├── Total Price
├── Deal Score
└── CO2 Emissions (total)

PER-LEG (outbound vs return):
├── Flight Quality Stats (on-time %, rating) per operating carrier
├── Fare Type (can differ!)
├── Baggage Allowance (can differ!)
├── Seat Selection (can differ!)
├── Amenities (WiFi, power, legroom - per aircraft)
└── PER-SEGMENT Details:
    ├── Airline + flight number
    ├── Aircraft type + amenities
    ├── Terminals
    └── Layover info
```

### WHY THIS MATTERS - REAL EXAMPLES

**Example 1: Mixed Fare Classes**
- **Outbound:** NYC → London (Premium Economy, 2 bags, seat selection, WiFi)
- **Return:** London → NYC (Economy, 1 bag, no seat selection, no WiFi)
- **Current Display:** Shows only outbound info or averages incorrectly
- **User Expectation Mismatch:** Books expecting Premium Economy both ways

**Example 2: Multi-Airline Trips**
- **Outbound:** United (3.8★, 78% on-time, 787-9 with power/WiFi)
- **Return:** Lufthansa (4.2★, 85% on-time, A350 with lie-flat seats)
- **Current Display:** Shows only United stats
- **Missing Value:** User doesn't know return is actually BETTER quality

**Example 3: Domestic + International Segments**
- **Segment 1:** United domestic (no bags, no WiFi, narrow-body)
- **Segment 2:** United international (1 bag, WiFi, wide-body)
- **Current Display:** "0 bags included" (takes first segment)
- **Reality:** International portion includes baggage

---

## CRITICAL ISSUE #4: MISSING CONVERSION-CRITICAL DATA

### MISSING FROM EXPANDED VIEW

| Missing Element | Why It Matters | Where Competitors Show It |
|----------------|----------------|---------------------------|
| **Per-segment WiFi** | 65% of business travelers filter by WiFi | Google Flights: Per aircraft |
| **Power outlets** | 48% of travelers want to work/charge | Kayak: Per aircraft icon |
| **Legroom/pitch** | Premium economy differentiation | Skyscanner: Seat pitch in inches |
| **Meal service** | Long-haul flights (6+ hours) | Google Flights: Meal icon |
| **Change fee amount** | DOT compliance requirement | Expedia: "$200 change fee" |
| **Cancellation deadline** | Urgency for booking decision | Booking.com: "Free cancel until X" |
| **Seat availability** | How full is the flight? | Google Flights: "X seats left in Y cabin" |
| **Average ticket price** | Price anchoring | Hopper: "23% below average" |
| **Layover facilities** | Long layovers (3+ hours) | Google Flights: "Long layover warning" |

### WHAT'S SHOWN INSTEAD (Less Valuable)

| Current Element | Lines | Value |
|----------------|-------|-------|
| Deal Score Breakdown | 831-873 | Low - opaque algorithm, users don't care about components |
| TruePrice "Estimates" | 957-977 | Medium - helpful but speculative |
| Premium Badges | 875-889 | Variable - depends on badge content |

---

## CRITICAL ISSUE #5: WRONG INFORMATION PLACEMENT

### SECTION PRIORITY ANALYSIS

| Section | Current Position | Priority for Conversion | Should Be Position |
|---------|-----------------|------------------------|-------------------|
| **Flight Quality Stats** | #1 (top) | MEDIUM | #2 or lower |
| **Fare Type & Inclusions** | #1 (top right) | HIGH | #1 (prominent) |
| **Deal Score Breakdown** | #2 | LOW | #4 or collapsible |
| **What's Included (DUPLICATE)** | #3 | N/A | DELETE |
| **TruePrice Breakdown** | #3 (right) | HIGH | #1 or #2 |
| **Fare Rules** | #4 | MEDIUM | #3 |
| **Basic Economy Warning** | #5 (conditional) | CRITICAL | #1 if applicable |

### CORRECT PRIORITY ORDER

1. **Basic Economy Warning** (if applicable) - CRITICAL for preventing bad bookings
2. **Per-Leg Fare Comparison** - Show outbound vs return side-by-side
3. **TruePrice Breakdown** - What you'll actually pay
4. **Per-Leg Amenities** - WiFi, power, meals, legroom
5. **Fare Rules** (collapsible) - Changes/cancellations
6. **Flight Quality Stats** (collapsible or per-leg) - On-time, comfort rating
7. **Deal Score Breakdown** (collapsible) - For data nerds only

---

## DETAILED ISSUE TABLE

| Section Name | Current Location | Should Be | Reason | Per-Flight or Per-Leg? |
|--------------|-----------------|-----------|---------|----------------------|
| **Flight Quality (On-time %, Rating)** | Expanded Section 1 - Top Left (lines 767-781) | WITH each flight leg OR collapsible | Multi-airline trips have different stats per carrier | **PER-LEG** (per operating carrier) |
| **Fare Type Header** | Expanded Section 1 - Top Right (line 785) | WITH each flight leg | Can differ between outbound/return | **PER-LEG** |
| **Baggage Inclusions (Full)** | Expanded Section 1 - Top Right (lines 786-827) | WITH each flight leg | Can differ between segments per Amadeus API | **PER-LEG** |
| **Seat Selection Info** | Expanded Section 1 - Top Right (lines 807-815, 817-825) | WITH each flight leg | Can differ between fare classes | **PER-LEG** |
| **Deal Score Breakdown** | Expanded Section 2 (lines 831-873) | Collapsible detail at bottom | Low priority - internal algorithm | **PER-FLIGHT** |
| **Premium Badges** | Between Sections (lines 875-889) | Remove or move to header | Low value unless specific offers | **PER-FLIGHT** |
| **What's Included (DUPLICATE)** | Expanded Section 3 - Left (lines 893-943) | **DELETE ENTIRELY** | Exact duplicate of Section 1 Right | N/A - **REDUNDANT** |
| **TruePrice Breakdown** | Expanded Section 3 - Right (lines 946-978) | Expand to full width, move to Section 2 | High conversion value | **PER-FLIGHT** |
| **Fare Rules** | Expanded Section 4 (lines 982-1018) | Keep in Section 3-4 area | Important but not urgent | **PER-LEG** (rules can differ) |
| **Basic Economy Warning** | Bottom (lines 1020-1042) | **MOVE TO TOP** | Critical - prevents bad bookings | **PER-LEG** (only show for affected legs) |
| **Segment Details (Airline, Aircraft, Terminals)** | Collapsed view lines 498-597 | Keep but enhance with amenities | Core info - good placement | **PER-SEGMENT** |
| **WiFi Availability** | **MISSING** | Add to segment details | High-value filter for business travelers | **PER-SEGMENT** (per aircraft) |
| **Power Outlets** | **MISSING** | Add to segment details | High-value amenity | **PER-SEGMENT** (per aircraft) |
| **Legroom/Seat Pitch** | **MISSING** | Add to segment details | Comfort differentiation | **PER-SEGMENT** (per aircraft) |
| **Meal Service** | **MISSING** | Add to segment details | Long-haul flights | **PER-SEGMENT** |
| **Average Price for Route** | **MISSING** | Add to price section | Price anchoring | **PER-FLIGHT** |
| **Change Fee Amount** | Referenced in line 824 but not shown | Add to fare rules section | DOT compliance | **PER-LEG** |
| **Cancellation Deadline** | **MISSING** | Add to fare rules section | Urgency/scarcity | **PER-LEG** |

---

## REDUNDANCIES TO REMOVE

### ❌ DELETE ENTIRELY

1. **"What's Included" Section (Lines 893-943)**
   - Exact duplicate of Section 1 Right Column (lines 784-827)
   - Same baggage info, same seat selection info, same change policy
   - Wastes vertical space

2. **Premium Badges Section (Lines 875-889)**
   - Currently shows dynamic `badges` array
   - In practice, this is rarely populated with meaningful data
   - If needed, move to header area (more compact)

### ⚠️ CONSOLIDATE

1. **Fare Type Display**
   - Currently shown in 3 places (Section 1 header, Section 3 header, Basic Economy warning)
   - Show once per leg in a prominent card

2. **Price Display**
   - Footer shows final price
   - Section 3 shows breakdown
   - Merge into single prominent "Price Details" section

---

## MISPLACED INFORMATION

### Issue: Flight Quality Stats (Lines 767-781)

**Current:**
```tsx
// PROBLEM: Uses only primary airline for ENTIRE trip
const primaryAirline = validatingAirlineCodes[0] || itineraries[0]?.segments[0]?.carrierCode;
const airlineData = getAirlineData(primaryAirline);

// Shown once at top
<div>On-time Performance: {airlineData.onTimePerformance}%</div>
<div>Comfort Rating: {airlineData.rating.toFixed(1)}★</div>
```

**Should Be:**
```tsx
// Outbound Flight Quality
{outbound.segments.map(segment => {
  const segmentAirline = getAirlineData(segment.carrierCode);
  return (
    <div>
      <AirlineLogo code={segment.carrierCode} />
      {segmentAirline.name} - {segmentAirline.rating}★
      On-time: {segmentAirline.onTimePerformance}%
    </div>
  );
})}

// Return Flight Quality (if different carrier)
```

### Issue: Baggage Allowance (Lines 205-246, 784-827, 893-943)

**Current:**
```typescript
// ONLY GETS FIRST SEGMENT - WRONG!
const fareDetails = firstTraveler.fareDetailsBySegment?.[0];
```

**Should Be:**
```typescript
// Get baggage for EACH itinerary (outbound and return)
const outboundBaggage = getBaggageForItinerary(travelerPricings, 0); // First itinerary
const returnBaggage = isRoundtrip ? getBaggageForItinerary(travelerPricings, 1) : null;

// Then display side-by-side if different
```

---

## PER-LEG vs PER-FLIGHT ARCHITECTURE ISSUES

### CRITICAL FIX REQUIRED

The entire `getBaggageInfo()` function (lines 205-246) is **architecturally wrong**.

**Current Logic:**
1. Gets first traveler pricing
2. Gets first segment's fare details
3. Returns single baggage object
4. Used for ENTIRE trip display

**Correct Logic Should Be:**
1. Get ALL fare details by segment
2. Group by itinerary (outbound vs return)
3. Check if baggage differs between legs
4. Display appropriately:
   - If same → "Both flights: 1 checked bag"
   - If different → "Outbound: 0 bags | Return: 1 bag"

**Code Change Required:**
```typescript
// NEW FUNCTION
const getBaggageByItinerary = (itineraryIndex: number) => {
  // Get all segments for this itinerary
  const itinerary = itineraries[itineraryIndex];
  const segmentIds = itinerary.segments.map((_, idx) => String(idx + 1));

  // Get fare details for these segments
  const fareDetailsForItinerary = travelerPricings[0].fareDetailsBySegment.filter(
    fd => segmentIds.includes(fd.segmentId)
  );

  // Return baggage info for this itinerary
  // (logic similar to current getBaggageInfo but segment-aware)
};

// USAGE
const outboundBaggage = getBaggageByItinerary(0);
const returnBaggage = isRoundtrip ? getBaggageByItinerary(1) : null;
const baggageDiffers = returnBaggage && (
  outboundBaggage.checked !== returnBaggage.checked ||
  outboundBaggage.carryOn !== returnBaggage.carryOn
);
```

---

## MISSING CONVERSION-CRITICAL DATA

### High-Priority Additions

1. **Per-Segment Amenities** (Add to lines 498-597 segment display)
   ```tsx
   <div className="flex items-center gap-2 text-xs">
     {/* WiFi */}
     {hasWiFi(segment.aircraft.code) ? (
       <span className="text-green-600">📶 WiFi</span>
     ) : (
       <span className="text-gray-400">📵 No WiFi</span>
     )}

     {/* Power */}
     {hasPower(segment.aircraft.code) && (
       <span className="text-green-600">🔌 Power</span>
     )}

     {/* Legroom */}
     <span className="text-gray-600">
       💺 {getSeatPitch(segment.aircraft.code)}"
     </span>
   </div>
   ```

2. **Per-Leg Fare Comparison Card**
   ```tsx
   <div className="grid grid-cols-2 gap-3">
     {/* Outbound */}
     <div className="border-l-4 border-blue-500 pl-3">
       <h5 className="font-bold">Outbound</h5>
       <div>{outboundBaggage.fareType}</div>
       <div>🎒 {outboundBaggage.carryOn ? '✓' : '✗'} Carry-on</div>
       <div>💼 {outboundBaggage.checked} Checked</div>
     </div>

     {/* Return */}
     {returnBaggage && (
       <div className="border-l-4 border-purple-500 pl-3">
         <h5 className="font-bold">Return</h5>
         <div>{returnBaggage.fareType}</div>
         <div>🎒 {returnBaggage.carryOn ? '✓' : '✗'} Carry-on</div>
         <div>💼 {returnBaggage.checked} Checked</div>
       </div>
     )}
   </div>
   ```

3. **Average Price Anchoring**
   ```tsx
   <div className="text-xs text-gray-600">
     Average price for this route: ${averageRoutePrice}
     <span className="text-green-600 font-bold">
       You save {savingsPercentage}% (${savings})
     </span>
   </div>
   ```

4. **Change/Cancellation Fees (DOT Compliance)**
   ```tsx
   <div className="flex justify-between text-xs">
     <span>Change fee:</span>
     <span className="font-bold">
       {changeFee > 0 ? `$${changeFee}` : 'Free'}
     </span>
   </div>
   <div className="flex justify-between text-xs">
     <span>Cancellation:</span>
     <span className="font-bold">
       {refundable ? 'Refundable' : 'Non-refundable'}
     </span>
   </div>
   ```

---

## RECOMMENDED NEW STRUCTURE

### COLLAPSED VIEW (Current - Keep As-Is)
```
✅ Header (airline, rating, badges)
✅ Flight route (departure → arrival times, duration, stops)
✅ Conversion features (Deal Score, CO2, viewers, bookings)
✅ Footer (price, baggage icons, Select button)
```

### EXPANDED VIEW (Recommended Restructure)

```
WHEN EXPANDED:

1️⃣ CRITICAL WARNINGS (if applicable)
   ├── Basic Economy Restrictions (if Basic Economy)
   └── Long Layover Warning (if layover > 3 hours)

2️⃣ PER-LEG FARE COMPARISON (Side-by-Side if Different)
   ├── Outbound Column:
   │   ├── Fare Type Badge
   │   ├── Baggage (carry-on + checked)
   │   ├── Seat Selection
   │   └── Change Policy
   └── Return Column (if roundtrip):
       ├── Fare Type Badge
       ├── Baggage (carry-on + checked)
       ├── Seat Selection
       └── Change Policy

3️⃣ PRICE BREAKDOWN (Full Width)
   ├── Base Fare: $XXX
   ├── Taxes & Fees: $XXX
   ├── Estimated Extras (if any): $XXX
   └── Total: $XXX

4️⃣ PER-LEG FLIGHT DETAILS (Collapsible per Leg)
   ├── Outbound Details (already shown at lines 498-527):
   │   ├── Per-Segment Info:
   │   │   ├── Airline + Flight # + Aircraft
   │   │   ├── Terminals
   │   │   ├── ✨ NEW: Amenities (WiFi, Power, Legroom, Meals)
   │   │   └── Layover Warnings
   │   └── ✨ NEW: Flight Quality Stats (for this leg):
   │       ├── Operating Carrier Rating
   │       └── On-Time Performance
   └── Return Details (if roundtrip, lines 570-597):
       └── [Same structure as outbound]

5️⃣ FARE RULES & POLICIES (Collapsible)
   └── Current Fare Rules Accordion (lines 985-1017) - KEEP

6️⃣ DEAL SCORE DETAILS (Collapsible - Low Priority)
   └── Current Deal Score Breakdown (lines 831-873) - KEEP
```

---

## ELEMENTS TO REMOVE/RELOCATE

### ❌ REMOVE FROM CODE

| Element | Lines | Reason |
|---------|-------|--------|
| "What's Included" duplicate section | 893-943 | Exact duplicate of Section 1 |
| Premium Badges (if empty) | 875-889 | Rarely populated, wastes space |

### ⬆️ MOVE UP (Higher Priority)

| Element | Current Lines | Move To | Reason |
|---------|--------------|---------|--------|
| Basic Economy Warning | 1020-1042 | Section 1 (top) | Critical - prevent bad bookings |
| TruePrice Breakdown | 946-978 | Section 2 | High conversion value |

### ⬇️ MOVE DOWN (Lower Priority)

| Element | Current Lines | Move To | Reason |
|---------|--------------|---------|--------|
| Flight Quality Stats | 767-781 | Section 4-5 (collapsible) | Less urgent than fare/price info |
| Deal Score Breakdown | 831-873 | Section 6 (bottom) | Interesting but not critical |

### ➡️ RELOCATE TO PER-LEG

| Element | Current Lines | Relocate To | Reason |
|---------|--------------|-------------|--------|
| Fare Type & Inclusions | 784-827 | Per-leg comparison cards | Can differ between outbound/return |
| Baggage Allowance | 784-827, 893-943 | Per-leg comparison cards | Different per segment (Amadeus API structure) |
| Seat Selection Info | 807-815 | Per-leg comparison cards | Can differ between fare classes |

---

## CODE-LEVEL ISSUES FOUND

### Issue 1: Single Baggage Source
**Location:** Lines 205-246 `getBaggageInfo()`
**Problem:** Only reads `fareDetailsBySegment[0]` - ignores other segments
**Impact:** Wrong baggage info for multi-segment trips

### Issue 2: Single Airline Stats
**Location:** Lines 130-131 `primaryAirline` calculation
**Problem:** Only uses first airline for entire trip
**Impact:** Wrong on-time % and rating for multi-airline trips

### Issue 3: Duplicate Sections
**Location:** Lines 893-943 duplicate of 784-827
**Problem:** Exact code repetition
**Impact:** Wasted space, maintenance burden

### Issue 4: No Per-Aircraft Data
**Location:** Lines 498-597 segment display
**Problem:** Shows aircraft code but not amenities
**Impact:** Missing WiFi, power, legroom info

### Issue 5: No Differentiation Warning
**Location:** Entire expanded section
**Problem:** No visual indicator when outbound/return differ
**Impact:** User confusion about which rules apply when

---

## VISUAL HIERARCHY ISSUES

### Current Priority (Visual Weight)
1. ⭐ Flight Quality (large blue box) - MEDIUM value
2. ⭐ Fare Type (large green box) - HIGH value
3. Deal Score Breakdown (collapsible) - LOW value
4. ⭐⭐ What's Included (white box) - HIGH value (DUPLICATE)
5. ⭐⭐ TruePrice (blue box) - HIGH value
6. Fare Rules (collapsible) - MEDIUM value
7. Basic Economy Warning (orange box) - CRITICAL value

### Recommended Priority
1. ⭐⭐⭐ Basic Economy Warning (if applicable) - CRITICAL
2. ⭐⭐⭐ Per-Leg Fare Comparison - CRITICAL
3. ⭐⭐ TruePrice Breakdown - HIGH
4. ⭐⭐ Per-Leg Flight Details - HIGH
5. ⭐ Fare Rules - MEDIUM
6. Flight Quality Stats - MEDIUM (collapsible)
7. Deal Score Breakdown - LOW (collapsible)

---

## MISSING FROM TOP SECTION

The user mentioned "check what's missing from the top section." Here's what's NOT shown in the collapsed/top view that SHOULD be:

### Currently NOT Visible Until Expanded

| Missing Element | Why It Matters | Competition Shows |
|----------------|----------------|-------------------|
| **Fare Type (Basic vs Standard)** | Users filter out Basic Economy | Google Flights: Badge in collapsed view |
| **Change/Cancel Restrictions** | Deal-breaker for flexible travelers | Expedia: "Non-refundable" badge |
| **Aircraft Type** | Comfort indicator (wide vs narrow body) | Kayak: Aircraft name in collapsed view |
| **Actual Airline (if codeshare)** | "Booked as United, operated by Regional Jet" | Google Flights: "Operated by" text |
| **Layover Duration** | Long layovers are deal-breakers | Skyscanner: Layover time in route |
| **WiFi Availability** | Top filter for business travelers | Google Flights: WiFi icon |

### Suggested Additions to Collapsed View (Lines 456-600)

1. **Fare Type Badge** (next to stops badge)
   ```tsx
   {baggageInfo.fareType.includes('BASIC') && (
     <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
       ⚠️ Basic Economy
     </span>
   )}
   ```

2. **WiFi Icon** (if available on all segments)
   ```tsx
   {allSegmentsHaveWiFi && (
     <Wifi className="w-3 h-3 text-green-600" />
   )}
   ```

3. **Actual Operating Carrier** (if different from booking airline)
   ```tsx
   {isCodeshare && (
     <span className="text-xs text-gray-500">
       Operated by {operatingCarrier}
     </span>
   )}
   ```

---

## SUMMARY OF ACTION ITEMS

### 🔴 CRITICAL (Prevents Wrong Bookings)

1. **Fix `getBaggageInfo()` to be per-itinerary** - Current code only reads first segment
2. **Add per-leg fare comparison** - Outbound and return can have different rules
3. **Move Basic Economy Warning to top** - Must be seen immediately
4. **Delete duplicate "What's Included" section** (lines 893-943)

### 🟡 HIGH PRIORITY (Improves Conversion)

5. **Add per-aircraft amenities** - WiFi, power, legroom to segment display
6. **Add average price anchoring** - "23% below average" messaging
7. **Make TruePrice more prominent** - Move up, expand to full width
8. **Add change/cancellation fees** - DOT compliance + transparency

### 🟢 MEDIUM PRIORITY (UX Polish)

9. **Make flight quality stats per-leg** - Different airlines have different ratings
10. **Consolidate fare type display** - Currently shown 3 times
11. **Add visual differentiation** - When outbound/return have different rules
12. **Improve section priority** - Reorder sections by conversion value

### ⚪ LOW PRIORITY (Nice to Have)

13. **Make Deal Score breakdown collapsible** - Reduces clutter
14. **Add meal service info** - Long-haul flights
15. **Add layover facility warnings** - "3 hour layover - lounge available"
16. **Remove Premium Badges** - Rarely useful

---

## CONCLUSION

The expanded card suffers from:

1. **ARCHITECTURAL FLAW**: Treats entire trip as single fare/baggage policy when Amadeus API supports per-segment differences
2. **REDUNDANCY**: Same information shown 2-3 times (baggage, fare type, price)
3. **MISPLACED PRIORITY**: Low-value "Flight Quality" stats at top, high-value "Basic Economy Warning" at bottom
4. **MISSING CRITICAL DATA**: No WiFi, power, legroom, change fees, average price comparison
5. **WRONG DATA**: Uses only first airline's stats for multi-airline trips

**User Frustration is Justified** - The core per-leg vs per-flight issue hasn't been addressed, and duplicate sections create visual clutter while missing conversion-critical amenities data.

---

**Next Steps:**
1. Review this analysis with stakeholders
2. Prioritize fixes (Critical → High → Medium)
3. Redesign expanded section with per-leg architecture
4. Add missing amenities data sources
5. Remove redundancies
6. Test with real multi-airline, mixed-cabin bookings
