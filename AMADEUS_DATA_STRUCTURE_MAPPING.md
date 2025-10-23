# Amadeus Flight Offers Search API - Data Structure Analysis

**Analysis Date:** 2025-10-22
**API Version:** Flight Offers Search v2
**Purpose:** Comprehensive mapping of data availability per-segment vs per-flight vs per-traveler

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Data Structure Hierarchy](#data-structure-hierarchy)
3. [Available Data Points](#available-data-points)
4. [Key Findings for UI Design](#key-findings-for-ui-design)
5. [Missing Data (Not in API)](#missing-data-not-in-api)
6. [Underutilized Data (In API but Not Shown)](#underutilized-data-in-api-but-not-shown)
7. [Critical Insights](#critical-insights)
8. [Implementation Recommendations](#implementation-recommendations)

---

## EXECUTIVE SUMMARY

### What This Analysis Covers

This document maps every data point in the Amadeus Flight Offers Search API v2 response to its exact location in the response hierarchy, specifically focusing on:

- **Baggage Allowances**: Per-segment, per-traveler granularity
- **Fare Information**: Cabin class, fare basis, branded fares per segment
- **Flight Quality Data**: What's available and what's not
- **Amenities**: Meal service, seat selection, etc.
- **Pricing**: Per-traveler vs per-offer pricing

### Critical Finding

**BAGGAGE IS PER-SEGMENT, PER-TRAVELER** - This is the most important architectural detail:

```
travelerPricings[0]
  └─ fareDetailsBySegment[0]  → Segment 1 baggage for Traveler 1
  └─ fareDetailsBySegment[1]  → Segment 2 baggage for Traveler 1
  └─ fareDetailsBySegment[2]  → Segment 3 baggage for Traveler 1
```

**This means:**
- Outbound and return flights can have DIFFERENT baggage allowances
- Each segment in a multi-stop journey can have DIFFERENT rules
- Different travelers can have DIFFERENT allowances on the SAME segment

---

## DATA STRUCTURE HIERARCHY

### Visual Representation

```
FlightOffer                                    ← PER-OFFER DATA
│
├─── id, source, numberOfBookableSeats         ← Flight-level metadata
├─── lastTicketingDate                         ← Booking deadline
│
├─── itineraries[]                             ← PER-ITINERARY DATA
│    │
│    ├─── [0] Outbound Itinerary
│    │    ├─── duration                        ← Total outbound time
│    │    └─── segments[]                      ← PER-SEGMENT DATA
│    │         │
│    │         ├─── [0] Segment 1 (e.g., JFK→ATL)
│    │         │    ├─── id: "1"
│    │         │    ├─── departure: { iataCode, at, terminal }
│    │         │    ├─── arrival: { iataCode, at, terminal }
│    │         │    ├─── carrierCode: "DL"
│    │         │    ├─── number: "1234"
│    │         │    ├─── aircraft: { code: "738" }
│    │         │    ├─── operating: { carrierCode }  ← Codeshare info
│    │         │    ├─── duration: "PT2H30M"
│    │         │    └─── numberOfStops: 0
│    │         │
│    │         └─── [1] Segment 2 (e.g., ATL→LAX)
│    │              └─── (same structure)
│    │
│    └─── [1] Return Itinerary (if round-trip)
│         └─── segments[]
│              └─── (same structure)
│
├─── price                                     ← TOTAL PRICE (all travelers)
│    ├─── currency: "USD"
│    ├─── total: "542.80"                     ← Grand total
│    ├─── base: "450.00"                      ← Base fare
│    ├─── fees: [...]                         ← Taxes/fees breakdown
│    └─── grandTotal: "542.80"
│
├─── pricingOptions
│    ├─── fareType: ["PUBLISHED"]
│    └─── includedCheckedBagsOnly: false
│
├─── validatingAirlineCodes: ["DL"]           ← Ticketing airline
│
└─── travelerPricings[]                       ← PER-TRAVELER DATA
     │
     ├─── [0] Adult Traveler 1
     │    ├─── travelerId: "1"
     │    ├─── fareOption: "STANDARD"         ← Fare family level
     │    ├─── travelerType: "ADULT"
     │    ├─── price: { total, base, currency } ← Price for THIS traveler
     │    │
     │    └─── fareDetailsBySegment[]         ← PER-SEGMENT FARE DETAILS
     │         │
     │         ├─── [0] Segment 1 fare details
     │         │    ├─── segmentId: "1"       ← Links to segments[0]
     │         │    ├─── cabin: "ECONOMY"     ← Physical cabin class
     │         │    ├─── fareBasis: "K0ASAVER"
     │         │    ├─── brandedFare: "BASIC" ← Marketing name
     │         │    ├─── class: "K"           ← Booking class (RBD)
     │         │    └─── includedCheckedBags  ← ⭐ BAGGAGE PER SEGMENT
     │         │         ├─── quantity: 0     ← OR
     │         │         ├─── weight: 23      ← Weight-based
     │         │         └─── weightUnit: "KG"
     │         │
     │         ├─── [1] Segment 2 fare details
     │         │    └─── (same structure - can be DIFFERENT)
     │         │
     │         └─── [2] Return segment fare details
     │              └─── (same structure - can be DIFFERENT)
     │
     └─── [1] Child Traveler 1
          └─── fareDetailsBySegment[]
               └─── (same structure - can have DIFFERENT baggage)
```

---

## AVAILABLE DATA POINTS

### Per-Flight (Entire Offer)

**Location:** Root of `FlightOffer` object

| Data Point | API Field | Example | Notes |
|------------|-----------|---------|-------|
| Offer ID | `id` | `"1"` | Unique identifier |
| Source | `source` | `"GDS"` | Always GDS for v2 |
| Instant ticketing required | `instantTicketingRequired` | `false` | Must book immediately? |
| Non-homogeneous | `nonHomogeneous` | `false` | Price is approximate |
| One-way combinable | `oneWay` | `false` | Can combine with other one-ways |
| Last ticketing date | `lastTicketingDate` | `"2025-11-20"` | Deadline to issue ticket |
| Last ticketing datetime | `lastTicketingDateTime` | `"2025-11-20T23:59:00"` | Precise deadline |
| Bookable seats | `numberOfBookableSeats` | `9` | Capped at 9, not actual inventory |
| **Total price** | `price.total` | `"542.80"` | **Per-offer, all travelers combined** |
| Base fare | `price.base` | `"450.00"` | Before taxes |
| Currency | `price.currency` | `"USD"` | ISO currency code |
| Fees breakdown | `price.fees[]` | `[{ amount: "92.80", type: "TICKETING" }]` | Taxes/fees |
| Validating airline | `validatingAirlineCodes[0]` | `"DL"` | Airline issuing ticket |
| Fare type | `pricingOptions.fareType[0]` | `"PUBLISHED"` | Published vs private fare |
| Bags only filter | `pricingOptions.includedCheckedBagsOnly` | `false` | Was filter applied? |

**Key Insight:** The root `price` is the **TOTAL for all travelers**. For per-traveler pricing, use `travelerPricings[].price`.

---

### Per-Itinerary (Outbound or Return)

**Location:** `itineraries[0]` (outbound) or `itineraries[1]` (return)

| Data Point | API Field | Example | Notes |
|------------|-----------|---------|-------|
| **Total journey duration** | `duration` | `"PT8H30M"` | ISO 8601 format (8h 30m) |
| Number of segments | `segments.length` | `2` | Direct = 1, 1 stop = 2, etc. |

**Key Insight:** `itineraries[0]` = outbound, `itineraries[1]` = return (if round-trip).

---

### Per-Segment (Individual Flight Leg)

**Location:** `itineraries[i].segments[j]`

| Data Point | API Field | Example | Notes |
|------------|-----------|---------|-------|
| **Segment ID** | `id` | `"1"` | Used to link fare details |
| Departure airport | `departure.iataCode` | `"JFK"` | IATA code |
| Departure time | `departure.at` | `"2025-11-15T08:00:00"` | ISO 8601 |
| Departure terminal | `departure.terminal` | `"4"` | Optional |
| Arrival airport | `arrival.iataCode` | `"LAX"` | IATA code |
| Arrival time | `arrival.at` | `"2025-11-15T11:22:00"` | ISO 8601 |
| Arrival terminal | `arrival.terminal` | `"5"` | Optional |
| **Marketing carrier** | `carrierCode` | `"AA"` | Airline selling ticket |
| Flight number | `number` | `"100"` | Flight number |
| **Operating carrier** | `operating.carrierCode` | `"BA"` | Who operates (if codeshare) |
| Aircraft type | `aircraft.code` | `"738"` | IATA aircraft code |
| Segment duration | `duration` | `"PT6H22M"` | Segment-specific duration |
| Number of stops | `numberOfStops` | `0` | Technical stops (rare) |
| Blacklisted in EU | `blacklistedInEU` | `false` | EU safety ban |

**Key Insights:**
- If `operating.carrierCode` ≠ `carrierCode`, it's a **codeshare flight**
- Segment duration is individual leg time, itinerary duration includes layovers
- Aircraft type maps to `dictionaries.aircraft["738"]` = "Boeing 737-800"

---

### Per-Traveler

**Location:** `travelerPricings[i]`

| Data Point | API Field | Example | Notes |
|------------|-----------|---------|-------|
| Traveler ID | `travelerId` | `"1"` | Reference ID |
| **Fare option** | `fareOption` | `"STANDARD"`, `"BASIC"`, `"FLEX"` | Fare family level |
| Traveler type | `travelerType` | `"ADULT"`, `"CHILD"`, `"INFANT"` | Age category |
| **Price for this traveler** | `price.total` | `"542.80"` | **Individual traveler price** |
| Base fare | `price.base` | `"450.00"` | Before taxes |
| Currency | `price.currency` | `"USD"` | Currency code |

**Key Insight:** `travelerPricings` array contains **one entry per traveler**. For 2 adults + 1 child, array length = 3.

---

### Per-Traveler-Per-Segment (MOST GRANULAR)

**Location:** `travelerPricings[i].fareDetailsBySegment[j]`

**This is the CRITICAL structure for baggage, cabin class, and fare details.**

| Data Point | API Field | Example | Notes |
|------------|-----------|---------|-------|
| **Segment reference** | `segmentId` | `"1"` | Links to `segments[].id` |
| **Cabin class** | `cabin` | `"ECONOMY"`, `"BUSINESS"`, `"FIRST"`, `"PREMIUM_ECONOMY"` | **Can differ per segment!** |
| Fare basis code | `fareBasis` | `"K0ASAVER"`, `"TNOBAGD"` | Detailed fare code |
| **Branded fare name** | `brandedFare` | `"BASIC"`, `"GOLIGHT"`, `"STANDARD"` | Marketing name |
| Branded fare label | `brandedFareLabel` | `"BLUE BASIC"` | Airline-specific branding |
| Booking class (RBD) | `class` | `"K"`, `"Y"`, `"J"` | Single-letter booking code |
| **Checked baggage** | `includedCheckedBags.quantity` | `0`, `1`, `2` | **Number of bags (OR weight-based)** |
| Checked baggage weight | `includedCheckedBags.weight` | `23` | Weight limit (if weight-based) |
| Baggage weight unit | `includedCheckedBags.weightUnit` | `"KG"`, `"LB"` | Unit |
| **Cabin baggage** | `includedCabinBags.quantity` | `1`, `2` | **Carry-on allowance** |
| **Amenities** | `amenities[]` | See below | **Per-segment amenities!** |
| Chargeable bags | `additionalServices.chargeableCheckedBags` | `{ quantity: 1 }` | Bags available for purchase |

**Key Insights:**

1. **BAGGAGE IS PER-SEGMENT**: Each segment can have different baggage allowances
2. **CABIN CAN DIFFER PER SEGMENT**: You can have Economy outbound, Business return
3. **BRANDED FARE PER SEGMENT**: Each leg can have different fare products
4. **AMENITIES ARE AVAILABLE**: Meals, seat selection, baggage, all per segment!

---

### Amenities (Per-Segment)

**Location:** `travelerPricings[i].fareDetailsBySegment[j].amenities[]`

**THIS IS HUGE - The API DOES provide amenity data!**

| Amenity Type | API Field | Example | Is Chargeable |
|--------------|-----------|---------|---------------|
| **Checked baggage** | `{ amenityType: "BAGGAGE", description: "CHECKED BAG FIRST" }` | First checked bag | `true` (if Basic Economy) |
| **Checked baggage (2nd)** | `{ amenityType: "BAGGAGE", description: "CHECKED BAG SECOND" }` | Second bag | `true` |
| **Seat selection** | `{ amenityType: "PRE_RESERVED_SEAT", description: "ADVANCE SEAT SELECTION" }` | Choose seat at booking | `true` (Basic) or `false` (Standard) |
| **Extra legroom** | `{ amenityType: "PRE_RESERVED_SEAT", description: "EXTRA LEGROOM" }` | Exit row, bulkhead | `true` |
| **Meals/Snacks** | `{ amenityType: "MEAL", description: "SNACK" }` | Complimentary snack | `false` |
| **Beverages** | `{ amenityType: "MEAL", description: "NON ALCOHOLIC DRINK" }` | Free drinks | `false` |
| **Alcohol** | `{ amenityType: "MEAL", description: "ALCOHOLIC DRINK" }` | Alcoholic beverages | `true` (usually) |
| **Wi-Fi** | `{ amenityType: "TRAVEL_SERVICES", description: "WIFI" }` | Onboard Wi-Fi | `true` or `false` |
| **Entertainment** | `{ amenityType: "ENTERTAINMENT", description: "LIVE TV" }` | In-flight entertainment | `false` |
| **Power outlets** | `{ amenityType: "BRANDED_FARES", description: "POWER" }` | Seat power | `false` |

**Example from actual API response:**

```json
{
  "segmentId": "14",
  "cabin": "ECONOMY",
  "brandedFare": "DN",
  "brandedFareLabel": "BLUE BASIC",
  "includedCheckedBags": { "quantity": 0 },
  "includedCabinBags": { "quantity": 2 },
  "amenities": [
    {
      "description": "CHECKED BAG FIRST",
      "isChargeable": true,
      "amenityType": "BAGGAGE",
      "amenityProvider": { "name": "BrandedFare" }
    },
    {
      "description": "SNACK",
      "isChargeable": false,
      "amenityType": "MEAL",
      "amenityProvider": { "name": "BrandedFare" }
    },
    {
      "description": "NON ALCOHOLIC DRINK",
      "isChargeable": false,
      "amenityType": "MEAL",
      "amenityProvider": { "name": "BrandedFare" }
    }
  ]
}
```

**Key Insight:** The `amenities` array is INCREDIBLY valuable but often ignored. It tells you:
- What's included vs chargeable
- Meal service availability
- Seat selection policies
- Baggage upgrade options

---

## KEY FINDINGS FOR UI DESIGN

### 1. Baggage Display

**API Provides:**
```typescript
travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags
```

**Structure:**
- **Per-segment, per-traveler**
- Can be quantity-based (`quantity: 2`) OR weight-based (`weight: 23, weightUnit: "KG"`)
- Return flight can have DIFFERENT allowance than outbound

**Current Implementation:**
```typescript
// WRONG - This assumes all segments have same baggage
const bags = travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags;
```

**Gap:**
We're showing a SINGLE baggage allowance, but API provides **per-segment** data.

**Example where this matters:**

```
JFK → LHR (AA): 2 bags included
LHR → CDG (AF): 23kg allowance (weight-based)
```

**Recommendation:**

```typescript
// Show per-segment baggage
{segments.map((segment, i) => {
  const fareDetail = travelerPricings[0].fareDetailsBySegment[i];
  const bags = fareDetail.includedCheckedBags;

  return (
    <div>
      {segment.departure.iataCode} → {segment.arrival.iataCode}:
      {bags.quantity !== undefined
        ? `${bags.quantity} bags`
        : `${bags.weight} ${bags.weightUnit}`
      }
    </div>
  );
})}
```

**Display Strategy:**

**Option 1: Show Most Restrictive (Skyscanner-style)**
```
Baggage: 0 bags (Basic Economy)
⚠️ Note: Return flight includes 1 bag
```

**Option 2: Show Per-Itinerary (Google Flights-style)**
```
Outbound: No checked bags
Return: 1 checked bag (up to 50 lbs)
```

**Option 3: Show Per-Segment (Our Recommendation)**
```
Baggage Allowance:
✓ JFK → LHR: 2 bags (up to 50 lbs each)
✗ LHR → CDG: No checked bags
```

---

### 2. Fare Class Display

**API Provides:**
```typescript
fareDetailsBySegment[i].cabin          // Physical cabin
fareDetailsBySegment[i].brandedFare    // Marketing name
fareDetailsBySegment[i].class          // Booking class (RBD)
fareDetailsBySegment[i].fareBasis      // Detailed code
```

**Can segments have different fare classes?**
**YES!** Example:

```json
{
  "fareDetailsBySegment": [
    { "segmentId": "1", "cabin": "ECONOMY", "brandedFare": "BASIC" },
    { "segmentId": "2", "cabin": "BUSINESS", "brandedFare": "STANDARD" }
  ]
}
```

**This happens when:**
- Mixed-cabin itinerary (Economy outbound, Business return)
- Airline offers automatic upgrade on one segment
- Codeshare flights with different fare products

**Current Implementation:**
We show the cabin class from the first segment, assuming all segments are the same.

**Recommendation:**

```typescript
// Check if all segments have same cabin
const cabins = fareDetailsBySegment.map(f => f.cabin);
const isUniform = cabins.every(c => c === cabins[0]);

if (isUniform) {
  return <Badge>{cabins[0]}</Badge>;
} else {
  return (
    <div>
      <Badge>Mixed Cabin</Badge>
      <Tooltip>
        Outbound: {cabins[0]}
        Return: {cabins[1]}
      </Tooltip>
    </div>
  );
}
```

---

### 3. Amenities Display

**API Provides:**
```typescript
fareDetailsBySegment[i].amenities[]
```

**Each amenity includes:**
- `description`: "CHECKED BAG FIRST", "WIFI", "SNACK"
- `isChargeable`: `true` or `false`
- `amenityType`: "BAGGAGE", "MEAL", "PRE_RESERVED_SEAT", "TRAVEL_SERVICES"
- `amenityProvider.name`: "BrandedFare"

**Current Implementation:**
We're NOT showing amenities at all!

**Gap:**
We're missing valuable data that could differentiate fare products.

**Recommendation:**

```typescript
// Group amenities by type
const freeAmenities = amenities.filter(a => !a.isChargeable);
const paidAmenities = amenities.filter(a => a.isChargeable);

return (
  <div>
    <h4>Included:</h4>
    {freeAmenities.map(a => (
      <div>✓ {a.description}</div>
    ))}

    <h4>Available for Purchase:</h4>
    {paidAmenities.map(a => (
      <div>💵 {a.description}</div>
    ))}
  </div>
);
```

**Example Display:**

```
✓ Personal item
✓ Snacks & non-alcoholic drinks
💵 1st checked bag ($35)
💵 Seat selection ($15-$45)
💵 Extra legroom ($59)
```

---

### 4. Cabin Baggage (Carry-On)

**API Provides:**
```typescript
fareDetailsBySegment[i].includedCabinBags.quantity
```

**Example:**
```json
{
  "includedCheckedBags": { "quantity": 0 },
  "includedCabinBags": { "quantity": 2 }
}
```

**Current Implementation:**
We're showing "Personal item only" as HARDCODED text!

**Gap:**
The API DOES provide cabin baggage info (at least for some airlines).

**Recommendation:**

```typescript
const cabinBags = fareDetail.includedCabinBags?.quantity;

if (cabinBags === undefined) {
  return "Check airline policy"; // Fallback
} else if (cabinBags === 0) {
  return "No cabin baggage";
} else if (cabinBags === 1) {
  return "1 personal item";
} else {
  return `1 carry-on + 1 personal item`;
}
```

---

### 5. Pricing Display

**API Provides:**

**Total Price (all travelers):**
```typescript
offer.price.total  // "542.80" for all travelers combined
```

**Per-Traveler Price:**
```typescript
travelerPricings[0].price.total  // "542.80" for adult
travelerPricings[1].price.total  // "400.00" for child
```

**Current Implementation:**
We're showing `price.total` divided by number of travelers.

**Gap:**
This doesn't account for child/infant discounts. The API provides EXACT per-traveler pricing.

**Recommendation:**

```typescript
// Show breakdown
const adultPrice = travelerPricings
  .filter(t => t.travelerType === 'ADULT')
  .reduce((sum, t) => sum + parseFloat(t.price.total), 0);

const childPrice = travelerPricings
  .filter(t => t.travelerType === 'CHILD')
  .reduce((sum, t) => sum + parseFloat(t.price.total), 0);

return (
  <div>
    <div>Total: ${offer.price.total}</div>
    <div className="text-sm text-gray-600">
      {adultCount} adult(s): ${adultPrice.toFixed(2)}
      {childCount > 0 && `, ${childCount} child(ren): ${childPrice.toFixed(2)}`}
    </div>
  </div>
);
```

---

## MISSING DATA (Not in API)

### 1. Flight Quality Metrics

**NOT Available in Flight Offers Search API v2:**

| Metric | Available? | Alternative API |
|--------|-----------|-----------------|
| On-time performance % | ❌ | ✅ Flight Delay Prediction API |
| Cancellation rate | ❌ | ✅ Flight Delay Prediction API |
| Delay probability | ❌ | ✅ Flight Delay Prediction API |
| Aircraft age | ❌ | External data source |
| Seat pitch/width | ❌ | ✅ Seat Map Display API (limited) |
| Legroom | ❌ | ✅ Seat Map Display API (limited) |
| Aircraft comfort rating | ❌ | External data source |

**Flight Delay Prediction API:**

```typescript
// Separate API call
const delayPrediction = await amadeus.predictFlightDelay({
  originLocationCode: 'JFK',
  destinationLocationCode: 'LAX',
  departureDate: '2025-11-15',
  departureTime: '08:00:00',
  arrivalDate: '2025-11-15',
  arrivalTime: '11:22:00',
  aircraftCode: '738',
  carrierCode: 'AA',
  flightNumber: '100',
  duration: 'PT6H22M'
});

// Returns:
{
  "data": [
    {
      "id": "AA100",
      "probability": "0.85",
      "result": "LESS_THAN_30_MINUTES",
      "subType": "on-time",
      "type": "prediction"
    }
  ]
}
```

**Recommendation:**
- Call Flight Delay Prediction API for each segment
- Cache results (expensive API calls)
- Display as "On-Time: 85% probability" badge

---

### 2. Aircraft-Specific Amenities

**NOT Available in base search response:**

| Amenity | Available? | Notes |
|---------|-----------|-------|
| Wi-Fi availability | ⚠️ Partial | In `amenities[]` if airline provides |
| Power outlets | ⚠️ Partial | In `amenities[]` if airline provides |
| In-flight entertainment | ⚠️ Partial | In `amenities[]` if airline provides |
| Seat type (recliner/lie-flat) | ❌ | External data needed |
| USB ports | ❌ | External data needed |

**Recommendation:**
- Use `amenities[]` array when available
- For missing data, maintain aircraft amenity database
- Source: SeatGuru, airlines' own data, crowd-sourced

**Example Fallback Database:**

```typescript
const AIRCRAFT_AMENITIES = {
  '738': { // Boeing 737-800
    wifi: true,
    power: 'Some seats',
    entertainment: 'Streaming to device',
    seatPitch: '31-32"'
  },
  '77W': { // Boeing 777-300ER
    wifi: true,
    power: 'All seats',
    entertainment: 'Seatback screens',
    seatPitch: '32-34"'
  }
};
```

---

### 3. Codeshare Complexity

**NOT Clearly Indicated:**

| Data Point | Available? | Notes |
|------------|-----------|-------|
| Is flight a codeshare? | ⚠️ Indirect | `operating.carrierCode` ≠ `carrierCode` |
| Which airline's rules apply? | ❌ | Must infer from validatingAirlineCodes |
| Baggage MSC rule | ❌ | Not explicitly stated |

**Recommendation:**

```typescript
function isCodeshare(segment: FlightSegment): boolean {
  return segment.operating?.carrierCode !== segment.carrierCode;
}

function getCodeshareDisplay(segment: FlightSegment): string {
  if (isCodeshare(segment)) {
    return `${segment.carrierCode} ${segment.number} (operated by ${segment.operating.carrierCode})`;
  }
  return `${segment.carrierCode} ${segment.number}`;
}
```

---

### 4. Real-Time Seat Availability

**NOT Available:**

| Metric | Available? | Notes |
|--------|-----------|-------|
| Exact seat count | ❌ | `numberOfBookableSeats` capped at 9 |
| Seat map | ❌ | Requires Seat Map Display API |
| Available seat classes | ❌ | Requires Seat Map Display API |

**numberOfBookableSeats Limitation:**

```typescript
// API returns
numberOfBookableSeats: 9

// This means "9 or more seats available"
// NOT "exactly 9 seats"
```

**Recommendation:**
- Show "9+ seats" or "Limited availability" for < 4
- For actual seat selection, call Seat Map API

---

## UNDERUTILIZED DATA (In API but Not Shown)

### 1. Amenities Array

**Location:** `fareDetailsBySegment[i].amenities[]`

**We're NOT using this!**

**What we're missing:**
- Meal service information
- Seat selection policies
- Baggage upgrade options
- Wi-Fi/power availability (when provided)

**Value:**
- Differentiate Basic vs Standard vs Flex fares
- Show "what you get" for each option
- Justify price differences

---

### 2. Branded Fare Labels

**Location:** `fareDetailsBySegment[i].brandedFareLabel`

**Example:**
```json
{
  "brandedFare": "DN",
  "brandedFareLabel": "BLUE BASIC"  // ← Airline's actual branding
}
```

**We're NOT showing this!**

**Current:** We show generic "Economy"
**Could show:** "Blue Basic" (JetBlue), "Basic Economy" (United), "Light" (Lufthansa)

**Recommendation:**

```typescript
const displayName = fareDetail.brandedFareLabel || fareDetail.brandedFare || fareDetail.cabin;
```

---

### 3. Fare Option (Fare Family Level)

**Location:** `travelerPricings[i].fareOption`

**Values:** `"STANDARD"`, `"BASIC"`, `"FLEX"`, `"INCLUSIVE_TOUR"`

**We're NOT using this to categorize fares!**

**Recommendation:**

```typescript
function getFareBadgeColor(fareOption: string): string {
  switch(fareOption) {
    case 'BASIC': return 'red';
    case 'STANDARD': return 'blue';
    case 'FLEX': return 'green';
    default: return 'gray';
  }
}
```

---

### 4. Instant Ticketing Requirement

**Location:** `instantTicketingRequired`

**If `true`:** Must issue ticket immediately upon booking (no hold period)

**We're NOT warning users about this!**

**Recommendation:**

```typescript
{instantTicketingRequired && (
  <Alert variant="warning">
    ⚠️ This fare requires immediate payment. Cannot be held.
  </Alert>
)}
```

---

### 5. Last Ticketing Date

**Location:** `lastTicketingDate` or `lastTicketingDateTime`

**We're showing this, but not prominently!**

**Recommendation:**

```typescript
// Calculate urgency
const daysUntilDeadline = differenceInDays(
  new Date(lastTicketingDate),
  new Date()
);

if (daysUntilDeadline <= 3) {
  return (
    <Badge variant="urgent">
      Book by {format(lastTicketingDate, 'MMM d')}
      ({daysUntilDeadline} days)
    </Badge>
  );
}
```

---

### 6. Fare Basis Code

**Location:** `fareDetailsBySegment[i].fareBasis`

**Example:** `"K0ASAVER"`, `"TNOBAGD"`

**We're NOT using this!**

**Value:**
- `fareBasis` often encodes restrictions
- 7th character = 'B' often indicates Basic Economy
- Can decode to understand flexibility

**Recommendation:**

```typescript
function isBasicEconomy(fareBasis: string): boolean {
  // Method 1: Check 7th character
  if (fareBasis?.[6] === 'B') return true;

  // Method 2: Check for "NOBAG" in fare basis
  if (fareBasis?.includes('NOBAG')) return true;

  // Method 3: Check quantity
  if (includedCheckedBags?.quantity === 0) return true;

  return false;
}
```

---

## CRITICAL INSIGHTS

### 1. Baggage Architecture

**The API is MORE granular than we're displaying:**

```
API Provides:       We Show:
Per-segment         Per-offer (single value)
Per-traveler        Same for all travelers
Quantity OR weight  Quantity only
```

**Impact:**
- Users may be surprised at airport when return flight has different allowance
- We're not showing weight-based allowances (common for international flights)
- Child/infant baggage may differ from adult

**Action Required:**
Redesign baggage display to show per-segment allowances.

---

### 2. Amenities Are Available

**We discovered the API DOES provide amenity data!**

**Location:** `fareDetailsBySegment[i].amenities[]`

**This is available in the SAMPLE response we examined:**

```json
{
  "amenities": [
    { "description": "SNACK", "isChargeable": false, "amenityType": "MEAL" },
    { "description": "WIFI", "isChargeable": true, "amenityType": "TRAVEL_SERVICES" }
  ]
}
```

**Action Required:**
- Parse and display amenities
- Group by free vs paid
- Use to differentiate fare products

---

### 3. Cabin Baggage IS Available

**We thought cabin baggage was NOT in API - but it is!**

**Location:** `fareDetailsBySegment[i].includedCabinBags.quantity`

**Example from actual response:**

```json
{
  "includedCheckedBags": { "quantity": 0 },
  "includedCabinBags": { "quantity": 2 }  // ← This exists!
}
```

**Action Required:**
Stop hardcoding "Personal item only" and use actual API data.

---

### 4. Pricing Is Per-Traveler

**We're dividing total price by passenger count, but API provides exact breakdown:**

```typescript
// What we do:
const pricePerPerson = parseFloat(price.total) / (adults + children);

// What we should do:
const adultPrice = travelerPricings
  .find(t => t.travelerType === 'ADULT')
  .price.total;
```

**Why this matters:**
- Children often have discounted fares
- Infants may be free or discounted
- Tax calculations differ per traveler type

**Action Required:**
Use `travelerPricings[].price.total` for accurate per-person pricing.

---

### 5. Cabin Class Can Differ Per Segment

**We assumed all segments have same cabin - NOT TRUE!**

**Possible scenarios:**
- Economy outbound, Business return
- Automatic upgrade on one segment
- Mixed-cabin connecting flights

**Example:**

```json
{
  "fareDetailsBySegment": [
    { "segmentId": "1", "cabin": "ECONOMY" },
    { "segmentId": "2", "cabin": "BUSINESS" }
  ]
}
```

**Action Required:**
Check for cabin consistency and display "Mixed Cabin" when applicable.

---

## IMPLEMENTATION RECOMMENDATIONS

### Phase 1: Fix Critical Gaps (High Priority)

1. **Per-Segment Baggage Display**
   - Show baggage allowance for outbound vs return separately
   - Handle quantity-based vs weight-based allowances
   - Display "varies by segment" warning when applicable

2. **Use Cabin Baggage Data**
   - Replace hardcoded "Personal item" with `includedCabinBags.quantity`
   - Show "1 carry-on + 1 personal item" when `quantity: 2`

3. **Per-Traveler Pricing**
   - Use `travelerPricings[].price.total` instead of dividing total
   - Show breakdown: "2 adults: $1,000, 1 child: $800"

4. **Amenities Display**
   - Parse and show `amenities[]` array
   - Differentiate free vs chargeable amenities
   - Group by type (baggage, meals, seat selection)

---

### Phase 2: Enhanced Features (Medium Priority)

5. **Branded Fare Labels**
   - Show `brandedFareLabel` instead of generic cabin class
   - Example: "Blue Basic" (JetBlue) instead of "Economy"

6. **Fare Family Badges**
   - Use `fareOption` to color-code fares
   - Basic = Red, Standard = Blue, Flex = Green

7. **Codeshare Detection**
   - Show "Operated by [carrier]" when `operating.carrierCode` differs
   - Warn about potential baggage rule complexity

8. **Urgency Indicators**
   - Highlight when `lastTicketingDate` is within 3 days
   - Show "Book soon" warnings

---

### Phase 3: Advanced Features (Low Priority)

9. **Flight Quality Data**
   - Integrate Flight Delay Prediction API
   - Show on-time performance badges

10. **Aircraft Amenities Database**
    - Maintain fallback database for Wi-Fi, power, entertainment
    - Use when `amenities[]` doesn't provide this data

11. **Seat Map Integration**
    - Call Seat Map Display API for seat selection
    - Show available vs occupied seats

12. **Fare Basis Decoding**
    - Use `fareBasis` to auto-detect Basic Economy
    - Extract restrictions from fare code

---

## CONCLUSION

### What We Learned

1. **Baggage is per-segment, per-traveler** - Our current single-value display is incorrect
2. **Amenities ARE in the API** - We're not using this valuable data
3. **Cabin baggage IS available** - Stop hardcoding assumptions
4. **Pricing is per-traveler** - Use exact API values, don't divide
5. **Cabin can differ per segment** - Check for mixed-cabin itineraries

### Immediate Actions

**MUST FIX:**
- [ ] Show per-segment baggage allowances
- [ ] Use `includedCabinBags` instead of hardcoded text
- [ ] Display amenities from API
- [ ] Use per-traveler pricing

**SHOULD ADD:**
- [ ] Branded fare labels
- [ ] Codeshare detection
- [ ] Urgency warnings
- [ ] Mixed-cabin handling

**NICE TO HAVE:**
- [ ] Flight delay prediction integration
- [ ] Aircraft amenities database
- [ ] Seat map integration

---

**Document Status:** Complete
**Next Steps:** Review with team, prioritize implementation
**Last Updated:** 2025-10-22
