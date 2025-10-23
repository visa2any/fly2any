# AMADEUS API VISUAL GUIDE

**Visual diagrams and comparison tables for understanding Amadeus Flight Offers Search API**

---

## FARE TERMINOLOGY COMPARISON

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AIRCRAFT                                     │
│                                                                      │
│  ┌────────────────────────┐  ┌──────────────────────────────────┐  │
│  │   FIRST CLASS          │  │   BUSINESS CLASS                 │  │
│  │   (Cabin)              │  │   (Cabin)                        │  │
│  │                        │  │                                  │  │
│  │  Fare Families:        │  │  Fare Families:                  │  │
│  │  • First Saver         │  │  • Business Saver                │  │
│  │  • First Flex          │  │  • Business Flex                 │  │
│  │                        │  │                                  │  │
│  │  RBDs: F, P, A         │  │  RBDs: J, C, D, I, Z             │  │
│  └────────────────────────┘  └──────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ PREMIUM ECONOMY        │  │   ECONOMY CLASS                  │  │
│  │   (Cabin)              │  │   (Cabin)                        │  │
│  │                        │  │                                  │  │
│  │  Fare Families:        │  │  Fare Families:                  │  │
│  │  • Premium Saver       │  │  • Basic Economy ────────────┐   │  │
│  │  • Premium Flex        │  │  • Main Cabin        ◄───┐   │   │  │
│  │                        │  │  • Comfort+              │   │   │  │
│  │  RBDs: W, P, A         │  │  • First/Business Upgrade│   │   │  │
│  └────────────────────────┘  │                          │   │   │  │
│                               │  RBDs:                   │   │   │  │
│                               │  • Y, B, M, H (Full)     │   │   │  │
│                               │  • K, L, U, T (Discount) │   │   │  │
│                               │  • G (Basic Economy) ────┘   │   │  │
│                               │                              │   │  │
│                               │  ┌───────────────────────────┘   │  │
│                               │  │ MOST COMMON SEARCH RESULTS    │  │
│                               │  └───────────────────────────────┘  │
│                               └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## TERMINOLOGY MATRIX

| **Concept** | **API Field** | **Example Value** | **User Sees** | **Notes** |
|-------------|---------------|-------------------|---------------|-----------|
| **Cabin Class** | `fareDetailsBySegment[].cabin` | `"ECONOMY"` | "Economy Class" | Physical compartment |
| **Fare Family** | `fareDetailsBySegment[].brandedFare` | `"BASIC"` | "Basic Economy" | Marketing bundle |
| **Booking Class (RBD)** | `fareDetailsBySegment[].class` | `"K"` | Hidden (backend only) | Single letter code |
| **Fare Basis** | `fareDetailsBySegment[].fareBasis` | `"KL0ASAVER"` | Hidden or "Saver Fare" | Detailed fare code |
| **Fare Option** | `travelerPricing.fareOption` | `"STANDARD"` | "Standard Fare" | Fare tier |
| **Traveler Type** | `travelerPricing.travelerType` | `"ADULT"` | "Adult" | Passenger category |
| **Baggage Quantity** | `fareDetailsBySegment[].includedCheckedBags.quantity` | `2` | "2 checked bags" | Number of bags |
| **Baggage Weight** | `fareDetailsBySegment[].includedCheckedBags.weight` | `23` | "1 bag (23 kg)" | Weight allowance |

---

## DATA FLOW DIAGRAM

### From API Response to UI Display

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AMADEUS API RESPONSE                             │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   FlightOffer Object          │
         │   • id                        │
         │   • price                     │
         │   • itineraries[]  ◄──────────┼─── Outbound/Return
         │   • travelerPricings[]        │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
         ▼                                ▼
┌────────────────────┐          ┌─────────────────────────┐
│  itineraries[0]    │          │  travelerPricings[0]    │
│  (Outbound)        │          │  (Adult Passenger)      │
│                    │          │                         │
│  • segments[]      │          │  • fareOption           │
│    ├─ segment[0]   │          │  • fareDetailsBySegment │
│    │   id: "1"  ◄──┼──────────┼──┐                      │
│    │   JFK→LHR     │          │  │                      │
│    │               │          │  │                      │
│    └─ segment[1]   │          │  │                      │
│        id: "2"  ◄──┼──────────┼──┼──┐                   │
│        LHR→CDG     │          │  │  │                   │
└────────────────────┘          │  │  │                   │
                                │  │  │                   │
                                │  ▼  ▼                   │
                                │ ┌──────────────────┐    │
                                │ │ fareDetails[0]   │    │
                                │ │ segmentId: "1"   │    │
                                │ │ cabin: ECONOMY   │    │
                                │ │ bags: {qty: 2}   │    │
                                │ └──────────────────┘    │
                                │                         │
                                │ ┌──────────────────┐    │
                                │ │ fareDetails[1]   │    │
                                │ │ segmentId: "2"   │    │
                                │ │ cabin: ECONOMY   │    │
                                │ │ bags: {qty: 1}   │    │
                                │ └──────────────────┘    │
                                └─────────────────────────┘
                                           │
                                           ▼
                         ┌─────────────────────────────┐
                         │   EXTRACT & TRANSFORM       │
                         │                             │
                         │   Map segmentId to segment  │
                         │   Extract baggage per leg   │
                         │   Identify fare level       │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │       UI DISPLAY             │
                         │                              │
                         │  Route: JFK → LHR → CDG      │
                         │  Cabin: Economy              │
                         │  Fare: Standard Economy      │
                         │  Baggage:                    │
                         │    • JFK → LHR: 2 bags       │
                         │    • LHR → CDG: 1 bag        │
                         │  Price: $542.80              │
                         └──────────────────────────────┘
```

---

## BAGGAGE STRUCTURE EXAMPLES

### Example 1: Quantity-Based (US Carriers)

```
API Response:
{
  "includedCheckedBags": {
    "quantity": 2
  }
}

UI Display:
┌─────────────────────────┐
│  ✓ 2 checked bags       │
│    (up to 50 lbs each)  │
└─────────────────────────┘
```

### Example 2: Weight-Based (International Carriers)

```
API Response:
{
  "includedCheckedBags": {
    "weight": 23,
    "weightUnit": "KG"
  }
}

UI Display:
┌──────────────────────────┐
│  ✓ 1 checked bag         │
│    (up to 23 kg)         │
└──────────────────────────┘
```

### Example 3: No Bags (Basic Economy)

```
API Response:
{
  "fareOption": "BASIC",
  "includedCheckedBags": {
    "quantity": 0
  },
  "additionalServices": {
    "chargeableCheckedBags": {
      "quantity": 1
    }
  }
}

UI Display:
┌────────────────────────────────┐
│  ✗ No checked bags included    │
│  💰 Add bags from $30          │
│                                │
│  [Add Baggage] button          │
└────────────────────────────────┘
```

### Example 4: Per-Segment Differences

```
API Response:
{
  "fareDetailsBySegment": [
    {
      "segmentId": "1",
      "includedCheckedBags": { "quantity": 2 }
    },
    {
      "segmentId": "2",
      "includedCheckedBags": { "weight": 23, "weightUnit": "KG" }
    }
  ]
}

UI Display:
┌──────────────────────────────────────┐
│  Baggage Allowance (varies):         │
│                                      │
│  JFK → LHR                           │
│  ✓ 2 checked bags                    │
│                                      │
│  LHR → CDG                           │
│  ✓ 1 bag (up to 23 kg)               │
│                                      │
│  ⚠️ Most restrictive rule may apply  │
└──────────────────────────────────────┘
```

---

## FARE LEVEL IDENTIFICATION FLOWCHART

```
                      START
                        │
                        ▼
          ┌─────────────────────────────┐
          │  Check fareOption field     │
          └─────────────┬───────────────┘
                        │
              ┌─────────┼─────────┐
              │                   │
              ▼                   ▼
        ════════════         "STANDARD"
        "BASIC"              "FLEX"
        ════════════         "PLUS"
              │                   │
              │                   ▼
              │            STANDARD/PREMIUM
              │                ECONOMY
              │                   │
              ▼                   │
      ┌──────────────┐            │
      │ Basic Economy│            │
      └──────────────┘            │
              │                   │
              └─────────┬─────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │  Check brandedFare field    │
          └─────────────┬───────────────┘
                        │
              ┌─────────┼────────┐
              │                  │
              ▼                  ▼
       "GOLIGHT"           "STANDARD"
       "LIGHT"             "CLASSIC"
       "BASIC"             "MAIN"
              │                  │
              ▼                  ▼
      ┌──────────────┐   ┌──────────────┐
      │ Basic Economy│   │   Standard   │
      └──────────────┘   │   Economy    │
              │          └──────────────┘
              │                  │
              └─────────┬────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │ Check includedCheckedBags   │
          └─────────────┬───────────────┘
                        │
              ┌─────────┼─────────┐
              │                   │
              ▼                   ▼
       quantity === 0      quantity >= 1
              │                   │
              ▼                   ▼
      ┌──────────────┐   ┌──────────────┐
      │ Basic Economy│   │   Standard   │
      │  (likely)    │   │   Economy    │
      └──────────────┘   │   (likely)   │
                         └──────────────┘
```

---

## ROUND-TRIP ITINERARY STRUCTURE

### How Outbound and Return are Represented

```
FlightOffer {
  itineraries: [

    // ═══════════════════════════════════════════════════
    // OUTBOUND ITINERARY (itineraries[0])
    // ═══════════════════════════════════════════════════
    {
      duration: "PT8H30M",
      segments: [
        {
          id: "1",
          departure: { iataCode: "JFK", at: "2025-10-20T14:30:00" },
          arrival: { iataCode: "LHR", at: "2025-10-21T02:45:00" },
          carrierCode: "AA",
          number: "100"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // RETURN ITINERARY (itineraries[1])
    // ═══════════════════════════════════════════════════
    {
      duration: "PT7H45M",
      segments: [
        {
          id: "2",
          departure: { iataCode: "LHR", at: "2025-10-27T10:15:00" },
          arrival: { iataCode: "JFK", at: "2025-10-27T13:00:00" },
          carrierCode: "AA",
          number: "101"
        }
      ]
    }

  ],

  travelerPricings: [
    {
      fareDetailsBySegment: [

        // Fare for segment "1" (outbound)
        {
          segmentId: "1",  ← Links to itineraries[0].segments[0]
          cabin: "ECONOMY",
          includedCheckedBags: { quantity: 2 }
        },

        // Fare for segment "2" (return)
        {
          segmentId: "2",  ← Links to itineraries[1].segments[0]
          cabin: "ECONOMY",
          includedCheckedBags: { quantity: 2 }
        }

      ]
    }
  ]
}
```

---

## CODESHARE FLIGHT VISUALIZATION

### Marketing Carrier vs Operating Carrier

```
TICKET SHOWS:          PLANE IS OPERATED BY:
American Airlines      British Airways
  AA 6598                BA 1234

┌─────────────────────────────────────────────────────────┐
│  API Response:                                          │
│  {                                                      │
│    "carrierCode": "AA",        ← Marketing carrier      │
│    "number": "6598",           ← AA flight number       │
│    "operating": {                                       │
│      "carrierCode": "BA"       ← Operating carrier      │
│    }                           ← BA flies the plane     │
│  }                                                      │
└─────────────────────────────────────────────────────────┘

UI DISPLAY:
┌─────────────────────────────────────────┐
│  AA 6598                                │
│  Operated by British Airways            │
│                                         │
│  Baggage: Per AA policy (Marketing)     │
└─────────────────────────────────────────┘
```

---

## BRANDED FARES COMPARISON TABLE

### Delta Airlines Example

| Feature | Basic Economy | Main Cabin | Comfort+ | Premium Select |
|---------|---------------|------------|----------|----------------|
| **API fareOption** | `"BASIC"` | `"STANDARD"` | `"PLUS"` | `"PREMIUM"` |
| **API brandedFare** | `"BASIC ECONOMY"` | `"MAIN CABIN"` | `"COMFORT+"` | `"PREMIUM SELECT"` |
| **Typical Price** | $300 | $400 | $550 | $800 |
| **Checked Bags** | 0 | 1 | 1 | 2 |
| **Carry-On** | ✗ (fee) | ✓ | ✓ | ✓ |
| **Seat Selection** | ✗ | At check-in | Free advance | Free advance |
| **Boarding** | Last group | Group 4 | Group 2 | Group 1 |
| **Changes** | ✗ | Fee applies | Fee applies | Free |
| **Refundable** | ✗ | ✗ | ✗ | Fee applies |
| **Mileage Accrual** | 50% | 100% | 100% | 125% |
| **Legroom** | Standard | Standard | +4 inches | +6 inches |
| **Dedicated Flight Attendant** | ✗ | ✗ | ✗ | ✓ |

### United Airlines Example

| Feature | Basic Economy | Economy | Economy Plus | Premium Plus |
|---------|---------------|---------|--------------|--------------|
| **API fareOption** | `"BASIC"` | `"STANDARD"` | `"PLUS"` | `"PREMIUM"` |
| **Typical Price** | $280 | $380 | $520 | $750 |
| **Checked Bags** | 0 | 1 | 1 | 2 |
| **Carry-On** | ✓ Personal item only | ✓ | ✓ | ✓ |
| **Seat Selection** | ✗ | ✓ | ✓ Free advance | ✓ Free advance |
| **Boarding** | Group 5 | Group 3 | Group 2 | Group 1 |
| **Changes** | ✗ | Fee applies | Fee applies | Free |
| **Legroom** | Standard | Standard | +5 inches | Lie-flat |

---

## API WORKFLOW VISUALIZATION

### Complete Booking Flow with Baggage

```
USER ACTION                    API CALL                     RESPONSE
────────────                   ────────                     ────────

┌──────────────┐
│ Search       │──────┐
│ Flights      │      │
└──────────────┘      ▼
                 ┌──────────────────────────────┐
                 │ GET/POST                      │
                 │ /v2/shopping/flight-offers    │
                 │                               │
                 │ params:                       │
                 │ • origin: JFK                 │
                 │ • destination: LHR            │
                 │ • date: 2025-10-20            │
                 │ • adults: 1                   │
                 └───────────────┬──────────────┘
                                 │
                                 ▼
                 ┌──────────────────────────────┐
                 │ Returns: FlightOffer[]        │
                 │                               │
                 │ Each offer includes:          │
                 │ • price                       │
                 │ • itineraries                 │
                 │ • travelerPricings            │
                 │   └─ fareDetailsBySegment     │
                 │      └─ includedCheckedBags   │
                 └───────────────┬──────────────┘
                                 │
┌──────────────┐                 │
│ User selects │◄────────────────┘
│ offer        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ View baggage │──────┐
│ options      │      │
└──────────────┘      ▼
                 ┌──────────────────────────────┐
                 │ POST                          │
                 │ /v1/shopping/flight-offers/   │
                 │ pricing?include=bags          │
                 │                               │
                 │ body: { flightOffers: [...] } │
                 └───────────────┬──────────────┘
                                 │
                                 ▼
                 ┌──────────────────────────────┐
                 │ Returns: Confirmed pricing    │
                 │                               │
                 │ included: {                   │
                 │   bags: {                     │
                 │     "1": {                    │
                 │       quantity: 1,            │
                 │       price: { amount: "30" } │
                 │     }                         │
                 │   }                           │
                 │ }                             │
                 └───────────────┬──────────────┘
                                 │
┌──────────────┐                 │
│ Add extra    │◄────────────────┘
│ bag for $30  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ View fare    │──────┐
│ rules        │      │
└──────────────┘      ▼
                 ┌──────────────────────────────┐
                 │ POST                          │
                 │ /v1/shopping/flight-offers/   │
                 │ pricing?include=              │
                 │   detailed-fare-rules         │
                 └───────────────┬──────────────┘
                                 │
                                 ▼
                 ┌──────────────────────────────┐
                 │ Returns: Fare rules           │
                 │                               │
                 │ fareRules: {                  │
                 │   rules: [                    │
                 │     { category: "REFUNDS" },  │
                 │     { category: "EXCHANGE" }  │
                 │   ]                           │
                 │ }                             │
                 └───────────────┬──────────────┘
                                 │
┌──────────────┐                 │
│ Confirm      │◄────────────────┘
│ booking      │
└──────────────┘
```

---

## COMPARISON: SEARCH PARAMS vs RESPONSE DATA

### What You Request vs What You Get

| Request Parameter | Response Field | Always Match? | Notes |
|-------------------|----------------|---------------|-------|
| `travelClass: "ECONOMY"` | `fareDetailsBySegment[].cabin` | ❌ No | API may return BUSINESS if Economy sold out |
| `adults: 2` | `travelerPricings.length` | ✓ Yes | One travelerPricing per adult/child |
| `currencyCode: "USD"` | `price.currency` | ✓ Yes | Currency matches request |
| `max: 50` | `meta.count` | ≤ | Returns up to max, may be fewer |
| `nonStop: true` | `itineraries[].segments.length` | ✓ Yes | Filters to 1 segment |
| `maxPrice: 500` | `price.total` | ≤ | All results under max price |

### Example Mismatch Scenario

```
REQUEST:
{
  "travelClass": "ECONOMY"
}

RESPONSE:
{
  "travelerPricings": [{
    "fareDetailsBySegment": [{
      "cabin": "BUSINESS"  ← Different from request!
    }]
  }]
}

WHY: Economy sold out, API offers Business class alternative
```

---

## MOBILE UI LAYOUT RECOMMENDATIONS

### Compact Baggage Display

```
┌─────────────────────────────────────────────┐
│  JFK → LHR                     $542         │
│  American Airlines • 8h 30m    Economy      │
│  ✓ 2 bags                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  JFK → LHR                     $342         │
│  Delta Air Lines • 9h 15m      Economy      │
│  ✗ No bags • BASIC ECONOMY                  │
│  💰 Add bags from $30                       │
└─────────────────────────────────────────────┘
```

### Expanded Baggage Details

```
┌─────────────────────────────────────────────┐
│  Baggage Allowance                          │
│                                             │
│  Outbound: JFK → LHR                        │
│  ✓ 2 checked bags (up to 50 lbs each)       │
│                                             │
│  Return: LHR → JFK                          │
│  ✓ 2 checked bags (up to 50 lbs each)       │
│                                             │
│  Carry-on: 1 personal item + 1 carry-on     │
│                                             │
│  ⓘ Baggage fees apply for additional bags   │
└─────────────────────────────────────────────┘
```

---

## COLOR CODING RECOMMENDATIONS

### Baggage Status Colors

```
✓ 2 bags included          [Green: #10B981]
✗ No bags                  [Red: #EF4444]
⚠️ Varies by segment        [Yellow: #F59E0B]
ⓘ Contact airline          [Gray: #6B7280]
💰 Add from $30            [Blue: #3B82F6]
```

### Fare Level Badges

```
┌──────────────┐
│ BASIC        │  [Red border, white bg]
└──────────────┘

┌──────────────┐
│ STANDARD     │  [Blue border, white bg]
└──────────────┘

┌──────────────┐
│ FLEX         │  [Green border, white bg]
└──────────────┘

┌──────────────┐
│ PREMIUM      │  [Purple border, white bg]
└──────────────┘
```

---

## SUMMARY CHECKLIST

### Before Displaying Baggage, Verify:

- [ ] `travelerPricings` array exists and has at least one entry
- [ ] `fareDetailsBySegment` array exists
- [ ] Each segment has a matching `fareDetailsBySegment` entry
- [ ] `includedCheckedBags` is defined (if not, show "Contact airline")
- [ ] Either `quantity` OR `weight` is present (not both undefined)
- [ ] If `weight` is used, `weightUnit` is also present
- [ ] `segmentId` links correctly to `itineraries[].segments[].id`

### For Best UX:

- [ ] Show per-segment baggage if rules differ
- [ ] Display "operated by" for codeshare flights
- [ ] Add badge for Basic Economy fares
- [ ] Show "Add bags from $X" for zero-bag fares
- [ ] Warn users when baggage info is unavailable
- [ ] Call Price API to confirm before booking

---

**Visual Guide Version:** 1.0
**Last Updated:** 2025-10-19
