# AMADEUS FLIGHT OFFERS SEARCH API - COMPLETE ANALYSIS

**Comprehensive Research Report**
**Research Date:** 2025-10-19
**Focus Areas:** Fare Structures, Baggage Rules, Branded Fares, API Schema

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [API Structure Overview](#api-structure-overview)
3. [Field-by-Field Documentation](#field-by-field-documentation)
4. [Fare Type Taxonomy](#fare-type-taxonomy)
5. [Per-Segment Baggage Parsing](#per-segment-baggage-parsing)
6. [Branded Fares Deep Dive](#branded-fares-deep-dive)
7. [Edge Cases and Special Scenarios](#edge-cases-and-special-scenarios)
8. [Best Practices](#best-practices)
9. [TypeScript Interfaces](#typescript-interfaces)
10. [Limitations and Gaps](#limitations-and-gaps)
11. [Resources and References](#resources-and-references)

---

## EXECUTIVE SUMMARY

The Amadeus Flight Offers Search API is a comprehensive flight shopping API that searches over 500 airlines and returns detailed flight offers with pricing, fare details, baggage allowances, and optional branded fare information.

### Key Findings

✅ **Available in API:**
- Complete fare details per segment via `fareDetailsBySegment`
- Baggage allowances (quantity and/or weight) per segment
- Branded fare names and fare basis codes
- Cabin class, booking class (RBD), and fare family information
- Price breakdown per traveler type
- Multi-segment and round-trip itinerary support

⚠️ **Limited in API:**
- Cabin baggage information NOT returned by API
- Branded fare amenities require separate API call (Branded Fares Upsell API)
- Codeshare baggage rules may have limitations
- Fare restrictions require separate call with `include=detailed-fare-rules`

❌ **Not Available:**
- Cabin/carry-on baggage allowances (not returned in responses)
- Ability to add additional cabin bags to bookings
- Automatic differentiation of Basic Economy vs Standard Economy (requires fare basis interpretation)

---

## API STRUCTURE OVERVIEW

### Endpoint Information

**Base URLs:**
- Production: `https://api.amadeus.com`
- Test: `https://test.api.amadeus.com`

**Primary Endpoint:**
- GET `/v2/shopping/flight-offers` - Simple search with query parameters
- POST `/v2/shopping/flight-offers` - Advanced search with full functionality

**Related Endpoints:**
- POST `/v1/shopping/flight-offers/pricing` - Confirm pricing before booking
- POST `/v1/shopping/flight-offers/pricing?include=detailed-fare-rules` - Get fare restrictions
- POST `/v1/shopping/flight-offers/pricing?include=bags` - Get additional bag pricing
- GET `/v1/shopping/seatmaps` - Get seat maps
- POST `/v2/shopping/flight-offers/prediction` - ML-based flight ranking
- GET `/v1/shopping/flight-offers/{id}/branded-fares` - Get branded fare upsells

### Authentication

OAuth 2.0 client credentials flow:
```
POST /v1/security/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={API_KEY}
&client_secret={API_SECRET}
```

Token valid for ~30 minutes (expires_in field).

### Response Structure Diagram

```
FlightOffersResponse
│
├── meta
│   ├── count: number
│   └── links
│       └── self: string
│
├── data: FlightOffer[]
│   └── FlightOffer
│       ├── id: string
│       ├── type: "flight-offer"
│       ├── source: "GDS"
│       ├── instantTicketingRequired: boolean
│       ├── nonHomogeneous: boolean
│       ├── oneWay: boolean
│       ├── lastTicketingDate: string
│       ├── numberOfBookableSeats: number
│       │
│       ├── itineraries: Itinerary[]
│       │   └── Itinerary
│       │       ├── duration: string (ISO 8601)
│       │       └── segments: Segment[]
│       │           └── Segment
│       │               ├── departure: Location
│       │               ├── arrival: Location
│       │               ├── carrierCode: string
│       │               ├── number: string
│       │               ├── aircraft: { code: string }
│       │               ├── operating: { carrierCode: string }
│       │               ├── duration: string
│       │               ├── id: string
│       │               ├── numberOfStops: number
│       │               └── blacklistedInEU: boolean
│       │
│       ├── price: Price
│       │   ├── currency: string
│       │   ├── total: string
│       │   ├── base: string
│       │   ├── fees: Fee[]
│       │   └── grandTotal: string
│       │
│       ├── pricingOptions
│       │   ├── fareType: string[]
│       │   └── includedCheckedBagsOnly: boolean
│       │
│       ├── validatingAirlineCodes: string[]
│       │
│       └── travelerPricings: TravelerPricing[]
│           └── TravelerPricing
│               ├── travelerId: string
│               ├── fareOption: string
│               ├── travelerType: string
│               ├── price: Price
│               └── fareDetailsBySegment: FareDetailsBySegment[]
│                   └── FareDetailsBySegment
│                       ├── segmentId: string
│                       ├── cabin: string (ECONOMY|PREMIUM_ECONOMY|BUSINESS|FIRST)
│                       ├── fareBasis: string
│                       ├── brandedFare: string
│                       ├── class: string (RBD)
│                       ├── includedCheckedBags
│                       │   ├── quantity: number
│                       │   ├── weight: number
│                       │   └── weightUnit: string
│                       └── additionalServices
│                           └── chargeableCheckedBags
│                               ├── quantity: number
│                               └── weight: number
│
└── dictionaries
    ├── locations: { [code: string]: LocationInfo }
    ├── aircraft: { [code: string]: string }
    ├── carriers: { [code: string]: string }
    └── currencies: { [code: string]: string }
```

---

## FIELD-BY-FIELD DOCUMENTATION

### Top-Level FlightOffer Fields

| Field | Type | Description | Example | Required |
|-------|------|-------------|---------|----------|
| `id` | string | Unique identifier for this offer | `"1"` | Yes |
| `type` | string | Always "flight-offer" | `"flight-offer"` | Yes |
| `source` | string | Source of pricing data | `"GDS"` | Yes |
| `instantTicketingRequired` | boolean | Must be ticketed immediately upon booking | `false` | No |
| `nonHomogeneous` | boolean | Pricing is approximate/may change | `false` | No |
| `oneWay` | boolean | Can be combined with other one-way offers | `false` | No |
| `lastTicketingDate` | string | Last date to issue ticket (YYYY-MM-DD) | `"2025-10-25"` | No |
| `lastTicketingDateTime` | string | Last datetime to issue ticket (ISO 8601) | `"2025-10-25T23:59:00"` | No |
| `numberOfBookableSeats` | number | Available seats (max 9 shown) | `9` | No |

### Itinerary Structure

**Round-trip flights:**
- `itineraries[0]` = Outbound flight
- `itineraries[1]` = Return/inbound flight

**One-way flights:**
- `itineraries[0]` = Single bound

**Multi-city/Open-jaw:**
- Multiple itineraries, each representing an ODI (Origin-Destination Information)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `duration` | string | Total journey time (ISO 8601) | `"PT8H30M"` (8 hours 30 minutes) |
| `segments` | Segment[] | Individual flight legs | Array of segments |

### Segment Fields (Flight Leg)

| Field | Type | Description | Example | Notes |
|-------|------|-------------|---------|-------|
| `departure` | Location | Departure details | `{ iataCode: "JFK", at: "2025-10-20T14:30:00", terminal: "4" }` | Required |
| `arrival` | Location | Arrival details | `{ iataCode: "LHR", at: "2025-10-21T02:45:00", terminal: "5" }` | Required |
| `carrierCode` | string | Marketing carrier IATA code | `"AA"` (American Airlines) | Required |
| `number` | string | Flight number | `"100"` | Required |
| `aircraft` | object | Aircraft type | `{ code: "77W" }` (Boeing 777-300ER) | Optional |
| `operating` | object | Operating carrier if codeshare | `{ carrierCode: "BA" }` | Present if different from marketing |
| `duration` | string | Segment duration (ISO 8601) | `"PT7H15M"` | Optional |
| `id` | string | Segment identifier for pricing reference | `"1"`, `"2"` | Required |
| `numberOfStops` | number | Technical stops on this segment | `0` | Usually 0 |
| `blacklistedInEU` | boolean | EU banned airline | `false` | Optional |

**Important:** When `operating.carrierCode` differs from `carrierCode`, this is a **codeshare flight**. The marketing carrier sells the ticket, but the operating carrier flies the plane.

### Price Object

| Field | Type | Description | Example | Notes |
|-------|------|-------------|---------|-------|
| `currency` | string | ISO currency code | `"USD"` | Required |
| `total` | string | Total price including all fees and taxes | `"542.80"` | Required |
| `base` | string | Base fare before taxes | `"450.00"` | Required |
| `fees` | Fee[] | Breakdown of fees | `[{ amount: "0.00", type: "SUPPLIER" }]` | Optional |
| `grandTotal` | string | Final total (same as total) | `"542.80"` | Optional |

### TravelerPricing Object (CRITICAL FOR FARES)

This is where **per-traveler** and **per-segment** fare details live.

| Field | Type | Description | Example | Notes |
|-------|------|-------------|---------|-------|
| `travelerId` | string | Reference to traveler | `"1"` | Maps to passenger |
| `fareOption` | string | Fare type selected | `"STANDARD"`, `"BASIC"`, `"FLEX"` | Indicates fare family level |
| `travelerType` | enum | Type of passenger | `"ADULT"`, `"CHILD"`, `"HELD_INFANT"`, `"SEATED_INFANT"`, `"SENIOR"` | Required |
| `price` | Price | Price for this specific traveler | `{ total: "542.80", base: "450.00", currency: "USD" }` | Required |
| `fareDetailsBySegment` | FareDetailsBySegment[] | **Fare details for EACH segment** | Array with one entry per segment | **CRITICAL** |

### FareDetailsBySegment (MOST IMPORTANT FOR YOUR USE CASE)

This array contains **one object per flight segment**, allowing you to extract per-segment baggage, cabin, and fare information.

| Field | Type | Description | Example | Notes |
|-------|------|-------------|---------|-------|
| `segmentId` | string | References segment by id | `"1"`, `"2"` | Maps to `itineraries[].segments[].id` |
| `cabin` | enum | Physical cabin class | `"ECONOMY"`, `"PREMIUM_ECONOMY"`, `"BUSINESS"`, `"FIRST"` | **May differ from requested travelClass** |
| `fareBasis` | string | Fare basis code | `"KL0ASAVER"`, `"TNOBAGD"` | Detailed fare code with rules |
| `brandedFare` | string | Marketing fare family name | `"GOLIGHT"`, `"BASIC"`, `"STANDARD"`, `"PLUS"` | Airline-specific branding |
| `class` | string | Booking class / RBD (Reservation Booking Designator) | `"K"`, `"Y"`, `"J"`, `"C"` | Single letter booking code |
| `includedCheckedBags` | object | **Baggage allowance for this segment** | `{ quantity: 2 }` or `{ weight: 23, weightUnit: "KG" }` | **CRITICAL** |
| `additionalServices` | object | Chargeable services | `{ chargeableCheckedBags: { quantity: 1 } }` | Optional |

### IncludedCheckedBags Structure

**Important:** This can use EITHER quantity OR weight, depending on the airline's policy.

```json
// Quantity-based (most US carriers)
{
  "quantity": 2  // Number of bags included
}

// Weight-based (many international carriers)
{
  "weight": 23,
  "weightUnit": "KG"  // or "LB"
}

// No bags included (Basic Economy)
{
  "quantity": 0
}
```

**Cabin Baggage:** NOT returned by Amadeus API. Must use airline-specific rules or external data.

---

## FARE TYPE TAXONOMY

### Terminology Clarification

The airline industry uses confusing overlapping terminology. Here's the distinction:

| Term | Definition | Example | Where in API |
|------|------------|---------|--------------|
| **Cabin Class** | Physical compartment on aircraft | Economy, Business, First | `fareDetailsBySegment[].cabin` |
| **Fare Class** | Same as RBD (Reservation Booking Designator) | Y, K, B, M, J, C, F | `fareDetailsBySegment[].class` |
| **Fare Basis** | Detailed fare code with rules encoded | `KL0ASAVER`, `TNOBAGD`, `JABSOW` | `fareDetailsBySegment[].fareBasis` |
| **Fare Family** | Airline marketing name for fare bundle | Basic Economy, Main Cabin, Delta Comfort+ | `fareDetailsBySegment[].brandedFare` or `travelerPricing.fareOption` |
| **Branded Fare** | Same as Fare Family | Light, Standard, Flex, Plus | `fareDetailsBySegment[].brandedFare` |

### RBD (Reservation Booking Designator) Mapping

RBD is a **single letter** that determines the fare rules and maps to a cabin class.

**Common RBD Codes by Cabin:**

**Economy:**
- `Y` - Full-fare Economy (refundable, flexible)
- `B`, `M`, `H`, `Q`, `V`, `W` - Discounted Economy
- `K`, `L`, `U`, `T` - Deep discount Economy / Basic Economy
- `G` - Often Basic Economy (restricted)

**Premium Economy:**
- `W`, `P`, `A` - Premium Economy (varies by airline)

**Business:**
- `J` - Full-fare Business (refundable)
- `C`, `D`, `I`, `Z` - Discounted Business

**First:**
- `F`, `A` - First Class
- `P` - Discounted First

**IMPORTANT:** RBD mapping to cabin is **airline-specific** and stored in ATPCO A02 tables. The API returns the cabin in `fareDetailsBySegment[].cabin`, so you don't need to interpret RBD yourself.

### Fare Basis Code Anatomy

Example: `KL0ASAVER`

- `K` = Booking class (RBD)
- `L0A` = Fare type, seasonality, restrictions
- `SAVER` = Promotional indicator

Example: `TNOBAGD`

- `T` = Booking class
- `NOBAG` = No baggage included
- `D` = Discount fare

**7th Character = 'B' often indicates Basic Economy** (e.g., `YL07BAGN**B**`) for many carriers.

### Identifying Basic Economy vs Standard Economy

**Method 1: Fare Type Codes (FTC)**

Amadeus uses Fare Type Codes to identify unbundled fares:
- **EOU** = Economy One-way Unbundled (Basic Economy)
- **ERU** = Economy Return Unbundled (Basic Economy)

Airlines using FTC EOU/ERU: **AA, AF, AY, AZ, BA, DL, IB, UA**

**Method 2: Fare Basis 7th Character**

For most carriers, if **'B' is the 7th character** in fare basis, it's Basic Economy.

**Method 3: Branded Fare Name**

Check `fareDetailsBySegment[].brandedFare`:
- `"BASIC"`, `"LIGHT"`, `"GOLIGHT"`, `"ECONOMY BASIC"` = Basic Economy
- `"STANDARD"`, `"MAIN"`, `"CLASSIC"` = Standard Economy
- `"FLEX"`, `"PLUS"`, `"COMFORT"` = Enhanced Economy

**Method 4: Baggage Quantity**

```javascript
// Often (but not always):
includedCheckedBags.quantity === 0  → Basic Economy
includedCheckedBags.quantity >= 1  → Standard Economy
```

**Method 5: fareOption Field**

Check `travelerPricing.fareOption`:
- `"BASIC"` = Basic Economy
- `"STANDARD"` = Standard Economy
- `"FLEX"` = Flexible Economy

### Cabin Class vs Travel Class

**Important Distinction:**

- **Travel Class** = What the user REQUESTS in search params
- **Cabin Class** = What the API RETURNS in fare details

Example:
```
User requests: travelClass=ECONOMY
API returns: fareDetailsBySegment[0].cabin=BUSINESS
```

This happens when:
1. Economy is sold out but Business upgrade available
2. Mixed cabin itinerary (Economy outbound, Business return)
3. Airline automatically upgrades fare class

**Always use `fareDetailsBySegment[].cabin` for display, not the request parameter.**

---

## PER-SEGMENT BAGGAGE PARSING

### The Core Pattern

Baggage allowances are **per-segment, per-traveler** in Amadeus API.

```typescript
// Pseudo-code pattern
for each travelerPricing in travelerPricings:
  for each fareDetail in travelerPricing.fareDetailsBySegment:
    segmentId = fareDetail.segmentId
    bags = fareDetail.includedCheckedBags

    // Display baggage for this segment
    console.log(`Segment ${segmentId}: ${bags.quantity || bags.weight} bags`)
```

### Practical Examples

#### Example 1: Simple Round-Trip with Consistent Baggage

```json
{
  "itineraries": [
    {
      "segments": [
        { "id": "1", "departure": { "iataCode": "JFK" }, "arrival": { "iataCode": "LHR" } }
      ]
    },
    {
      "segments": [
        { "id": "2", "departure": { "iataCode": "LHR" }, "arrival": { "iataCode": "JFK" } }
      ]
    }
  ],
  "travelerPricings": [
    {
      "travelerId": "1",
      "travelerType": "ADULT",
      "fareDetailsBySegment": [
        {
          "segmentId": "1",
          "cabin": "ECONOMY",
          "fareBasis": "KL0ASAVER",
          "class": "K",
          "includedCheckedBags": { "quantity": 2 }
        },
        {
          "segmentId": "2",
          "cabin": "ECONOMY",
          "fareBasis": "KL0ASAVER",
          "class": "K",
          "includedCheckedBags": { "quantity": 2 }
        }
      ]
    }
  ]
}
```

**Interpretation:** Adult passenger gets 2 checked bags on BOTH outbound and return flights.

#### Example 2: Mixed Baggage Allowances (Common with Codeshares)

```json
{
  "itineraries": [
    {
      "segments": [
        { "id": "1", "carrierCode": "AA", "operating": { "carrierCode": "AA" } },
        { "id": "2", "carrierCode": "BA", "operating": { "carrierCode": "BA" } }
      ]
    }
  ],
  "travelerPricings": [
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
  ]
}
```

**Interpretation:**
- Segment 1 (AA): 2 bags allowed (quantity-based)
- Segment 2 (BA): 23kg allowance (weight-based)

**UI Display Strategy:**
```
JFK → LHR: 2 bags
LHR → CDG: 1 bag (up to 23 kg)
```

#### Example 3: Basic Economy with No Bags

```json
{
  "travelerPricings": [
    {
      "fareOption": "BASIC",
      "fareDetailsBySegment": [
        {
          "segmentId": "1",
          "cabin": "ECONOMY",
          "fareBasis": "TNOBAGD",
          "brandedFare": "GOLIGHT",
          "class": "T",
          "includedCheckedBags": { "quantity": 0 },
          "additionalServices": {
            "chargeableCheckedBags": { "quantity": 1 }
          }
        }
      ]
    }
  ]
}
```

**Interpretation:**
- No free checked bags (Basic Economy)
- Can purchase 1 additional bag (use Flight Offers Price API with `include=bags` to get price)

### TypeScript Implementation

```typescript
interface BaggageInfo {
  segmentId: string;
  type: 'quantity' | 'weight';
  value: number;
  unit?: 'KG' | 'LB';
  chargeable?: {
    quantity?: number;
    weight?: number;
    unit?: string;
  };
}

function extractBaggagePerSegment(
  travelerPricing: TravelerPricing
): BaggageInfo[] {
  return travelerPricing.fareDetailsBySegment.map(fareDetail => {
    const bags = fareDetail.includedCheckedBags || {};

    if (bags.quantity !== undefined) {
      return {
        segmentId: fareDetail.segmentId,
        type: 'quantity',
        value: bags.quantity,
        chargeable: fareDetail.additionalServices?.chargeableCheckedBags
      };
    } else if (bags.weight !== undefined) {
      return {
        segmentId: fareDetail.segmentId,
        type: 'weight',
        value: bags.weight,
        unit: bags.weightUnit as 'KG' | 'LB',
        chargeable: fareDetail.additionalServices?.chargeableCheckedBags
      };
    } else {
      // No baggage info provided - assume 0
      return {
        segmentId: fareDetail.segmentId,
        type: 'quantity',
        value: 0
      };
    }
  });
}
```

### Codeshare Baggage Rules

**Question:** On a codeshare flight (AA marketed, BA operated), whose baggage rules apply?

**Answer:** Generally, the **marketing carrier's** baggage policy applies, but there are exceptions:

1. **IATA Resolution 302:** For interline/codeshare itineraries, the **Most Significant Carrier (MSC)** rule applies:
   - MSC = Marketing carrier of the **first international segment** (trans-oceanic or trans-continental)
   - That carrier's baggage rules apply to the ENTIRE journey

2. **Amadeus API Behavior:**
   - The API returns `includedCheckedBags` based on the ticketing carrier's agreement with GDS
   - For codeshares, this SHOULD reflect the MSC rule, but verify during `Flight Offers Price` call

3. **Edge Case - No Agreement:**
   - If operating carrier has no Amadeus Ancillary Services agreement, baggage info may be incomplete
   - API may return error: `"An error was generated when the specified flight in the query is a codeshare, and no agreement exists with the operating carrier"`

**Best Practice:** Always call **Flight Offers Price API** before booking to confirm baggage rules.

---

## BRANDED FARES DEEP DIVE

### What Are Branded Fares?

Branded fares are **marketing bundles** that airlines create to differentiate products within the same cabin class.

Example (United Airlines):
- **Basic Economy:** Cheapest, no changes, no seat selection, board last
- **Economy:** Standard, free carry-on, seat selection at check-in
- **Economy Plus:** Extra legroom, free drinks
- **Premium Plus:** Lie-flat seat, premium meals

### API Workflow

**Step 1: Flight Offers Search**

Returns the **lowest available branded fare** in the requested cabin:

```json
{
  "data": [
    {
      "travelerPricings": [
        {
          "fareOption": "BASIC",
          "fareDetailsBySegment": [
            {
              "brandedFare": "BASIC ECONOMY",
              "fareBasis": "TNOBAGD",
              "includedCheckedBags": { "quantity": 0 }
            }
          ]
        }
      ]
    }
  ]
}
```

**Step 2: Branded Fares Upsell API**

To see higher fare families (Standard, Flex, etc.):

```
GET /v1/shopping/flight-offers/{flightOfferId}/branded-fares
```

Returns:
```json
{
  "data": [
    {
      "type": "flight-offer",
      "brandedFare": "STANDARD ECONOMY",
      "price": {
        "total": "542.80"
      },
      "amenities": [
        {
          "description": "1 checked bag included",
          "isChargeable": false
        },
        {
          "description": "Seat selection at booking",
          "isChargeable": false
        },
        {
          "description": "Changes allowed with fee",
          "isChargeable": true,
          "price": { "amount": "200.00" }
        }
      ]
    },
    {
      "type": "flight-offer",
      "brandedFare": "FLEX ECONOMY",
      "price": {
        "total": "742.80"
      },
      "amenities": [
        {
          "description": "2 checked bags included",
          "isChargeable": false
        },
        {
          "description": "Free seat selection",
          "isChargeable": false
        },
        {
          "description": "Changes allowed free",
          "isChargeable": false
        },
        {
          "description": "Refundable with fee",
          "isChargeable": true,
          "price": { "amount": "100.00" }
        }
      ]
    }
  ]
}
```

### Branded Fare Names by Airline

**Important:** Each airline uses different marketing names.

| Airline | Basic | Standard | Enhanced | Premium |
|---------|-------|----------|----------|---------|
| **United** | Basic Economy | Economy | Economy Plus | Premium Plus |
| **American** | Basic Economy | Main Cabin | Main Cabin Extra | Premium Economy |
| **Delta** | Basic Economy | Main Cabin | Comfort+ | Premium Select |
| **Lufthansa** | Light | Classic | Flex | - |
| **British Airways** | Basic | Standard | Plus | - |
| **Air France** | Light | Standard | Flex | - |
| **Emirates** | Special | Saver | Flex | Flex Plus |
| **Qatar** | Lite | Classic | Convenience | Comfort |

### Mapping Generic API Data to Airline-Specific Names

The API returns generic names like `"BASIC"`, `"STANDARD"`, `"FLEX"`. To display airline-specific branding:

```typescript
const FARE_FAMILY_MAP: Record<string, Record<string, string>> = {
  'UA': {
    'BASIC': 'Basic Economy',
    'STANDARD': 'Economy',
    'PLUS': 'Economy Plus',
    'PREMIUM': 'Premium Plus'
  },
  'AA': {
    'BASIC': 'Basic Economy',
    'STANDARD': 'Main Cabin',
    'PLUS': 'Main Cabin Extra',
    'PREMIUM': 'Premium Economy'
  },
  'LH': {
    'LIGHT': 'Economy Light',
    'CLASSIC': 'Economy Classic',
    'FLEX': 'Economy Flex'
  }
  // etc.
};

function getBrandedFareName(
  carrierCode: string,
  genericName: string
): string {
  return FARE_FAMILY_MAP[carrierCode]?.[genericName] || genericName;
}
```

### Branded Fare Amenities

The Branded Fares Upsell API returns `amenities` array showing what's included:

**Common Amenities:**
- Checked baggage (quantity)
- Carry-on baggage
- Seat selection (free vs paid)
- Changes allowed (free vs fee)
- Refundability
- Priority boarding
- Lounge access
- Meal service
- Extra legroom
- Mileage earning rate

**Important:** The base Flight Offers Search API does **NOT** return amenities. You must call Branded Fares Upsell API.

---

## EDGE CASES AND SPECIAL SCENARIOS

### 1. Multi-Segment Flights with Different Baggage Rules

**Scenario:** JFK → LHR (AA) → CDG (AF)

Segment 1: AA allows 2 bags
Segment 2: AF allows 23kg

**Display Strategy:**
```
Baggage Allowance (varies by segment):
• JFK → LHR: 2 checked bags
• LHR → CDG: 1 bag (up to 23 kg)

Note: Most restrictive rule may apply for entire journey
```

**Best Practice:** Show per-segment rules AND warn about MSC rule.

### 2. Mixed Cabin Itinerary

**Scenario:** Economy outbound, Business return

```json
{
  "itineraries": [
    {
      "segments": [
        { "id": "1" }
      ]
    },
    {
      "segments": [
        { "id": "2" }
      ]
    }
  ],
  "travelerPricings": [
    {
      "fareDetailsBySegment": [
        {
          "segmentId": "1",
          "cabin": "ECONOMY",
          "includedCheckedBags": { "quantity": 1 }
        },
        {
          "segmentId": "2",
          "cabin": "BUSINESS",
          "includedCheckedBags": { "quantity": 2 }
        }
      ]
    }
  ]
}
```

**Display:**
```
Outbound (Economy): 1 checked bag
Return (Business): 2 checked bags
```

### 3. Codeshare Flight

**Scenario:** AA flight number, BA operates

```json
{
  "segments": [
    {
      "id": "1",
      "carrierCode": "AA",
      "number": "6598",
      "operating": {
        "carrierCode": "BA"
      }
    }
  ]
}
```

**Display:**
```
AA 6598 (operated by British Airways)
```

**Baggage Rule:** Check `fareDetailsBySegment` - API should return correct allowance, but verify with Flight Offers Price API.

### 4. No Baggage Information Returned

**Scenario:** API returns `fareDetailsBySegment` without `includedCheckedBags` field.

**Possible Causes:**
- Low-cost carrier not in Amadeus Ancillary Services
- Codeshare with no agreement
- API limitation

**Handling:**
```typescript
const bags = fareDetail.includedCheckedBags;
if (!bags || (bags.quantity === undefined && bags.weight === undefined)) {
  // Show warning
  return {
    status: 'unknown',
    message: 'Baggage allowance not available. Check with airline.'
  };
}
```

### 5. Basic Economy vs Economy on Same Search

**Scenario:** API returns multiple offers, some Basic, some Standard.

**Differentiation:**

```typescript
function getFareLevel(fareDetail: FareDetailsBySegment): string {
  // Method 1: Check branded fare name
  if (fareDetail.brandedFare?.toLowerCase().includes('basic')) {
    return 'Basic Economy';
  }

  // Method 2: Check fare basis 7th character
  if (fareDetail.fareBasis?.[6] === 'B') {
    return 'Basic Economy';
  }

  // Method 3: Check baggage quantity
  if (fareDetail.includedCheckedBags?.quantity === 0) {
    return 'Basic Economy (likely)';
  }

  return 'Standard Economy';
}
```

### 6. Chargeable Baggage

**Scenario:** Basic Economy fare, but can purchase bags.

```json
{
  "fareDetailsBySegment": [
    {
      "includedCheckedBags": { "quantity": 0 },
      "additionalServices": {
        "chargeableCheckedBags": { "quantity": 1 }
      }
    }
  ]
}
```

**To Get Pricing:**

Call Flight Offers Price API with `include=bags`:

```
POST /v1/shopping/flight-offers/pricing?include=bags
```

Response includes:
```json
{
  "bags": {
    "1": {
      "quantity": 1,
      "name": "CHECKED_BAG",
      "price": {
        "amount": "30.00",
        "currencyCode": "USD"
      }
    }
  }
}
```

### 7. Round-Trip with Different Baggage Per Direction

**Scenario:** Outbound Basic (0 bags), Return Standard (1 bag)

**Handling:** Display separately per itinerary:

```
Outbound: No checked baggage included
Return: 1 checked bag included
```

---

## BEST PRACTICES

### 1. Always Confirm Pricing Before Booking

```typescript
// Step 1: Search
const searchResults = await amadeus.searchFlights(params);

// Step 2: User selects offer
const selectedOffer = searchResults.data[0];

// Step 3: Confirm price (mandatory)
const confirmedPrice = await amadeus.confirmFlightPrice([selectedOffer]);

// Step 4: Check for price changes
if (confirmedPrice.data.price.total !== selectedOffer.price.total) {
  // Warn user of price change
}

// Step 5: Book
await amadeus.createFlightOrder(confirmedPrice.data);
```

### 2. Display Per-Segment Baggage Rules

Don't just show "2 bags included" - show per segment:

```
Baggage Allowance:
✓ JFK → LHR: 2 checked bags (up to 50 lbs each)
✓ LHR → CDG: 1 checked bag (up to 23 kg)
```

### 3. Handle Missing Data Gracefully

```typescript
function getBaggageDisplay(fareDetail: FareDetailsBySegment): string {
  const bags = fareDetail.includedCheckedBags;

  if (!bags) {
    return 'Baggage info not available - contact airline';
  }

  if (bags.quantity !== undefined) {
    return bags.quantity === 0
      ? 'No checked bags included'
      : `${bags.quantity} checked bag${bags.quantity > 1 ? 's' : ''}`;
  }

  if (bags.weight !== undefined) {
    return `1 bag (up to ${bags.weight} ${bags.weightUnit})`;
  }

  return 'Baggage policy applies';
}
```

### 4. Use Detailed Fare Rules for Legal Compliance

For refundability, change fees, restrictions:

```typescript
const fareRules = await amadeus.getDetailedFareRules([flightOffer]);

// Display refund policy
const refundRule = fareRules.data.fareRules.rules.find(
  r => r.category === 'REFUNDS'
);

// Display change policy
const changeRule = fareRules.data.fareRules.rules.find(
  r => r.category === 'EXCHANGE'
);
```

### 5. Cache Dictionaries

The `dictionaries` object contains carrier names, aircraft types, etc. Cache this:

```typescript
const CARRIER_NAMES = {
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
  'UA': 'United Airlines',
  // ... etc
};

function getCarrierName(code: string, dictionaries?: any): string {
  return dictionaries?.carriers?.[code] || CARRIER_NAMES[code] || code;
}
```

### 6. Implement Retry Logic for Rate Limiting

Amadeus imposes rate limits (varies by plan). Implement exponential backoff:

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 7. Show Airline-Specific Branded Fare Names

Map generic names to airline branding:

```typescript
const brandedFare = fareDetail.brandedFare; // "BASIC"
const airline = segment.carrierCode; // "UA"
const displayName = getBrandedFareName(airline, brandedFare);
// "Basic Economy" (United-specific)
```

### 8. Validate Data Before Display

```typescript
function validateFlightOffer(offer: any): offer is FlightOffer {
  return (
    offer &&
    offer.id &&
    offer.itineraries &&
    Array.isArray(offer.itineraries) &&
    offer.price &&
    typeof offer.price.total !== 'undefined'
  );
}
```

---

## TYPESCRIPT INTERFACES

### Complete Type Definitions

```typescript
// ============================================
// AMADEUS FLIGHT OFFERS SEARCH API TYPES
// ============================================

/**
 * Main API Response
 */
export interface FlightOffersResponse {
  data: FlightOffer[];
  meta?: {
    count: number;
    links?: {
      self: string;
    };
  };
  dictionaries?: {
    locations?: Record<string, LocationInfo>;
    aircraft?: Record<string, string>;
    carriers?: Record<string, string>;
    currencies?: Record<string, string>;
  };
  warnings?: Warning[];
  errors?: ApiError[];
}

/**
 * Individual Flight Offer
 */
export interface FlightOffer {
  id: string;
  type: string; // "flight-offer"
  source: string; // "GDS"
  instantTicketingRequired?: boolean;
  nonHomogeneous?: boolean;
  oneWay?: boolean;
  lastTicketingDate?: string; // YYYY-MM-DD
  lastTicketingDateTime?: string; // ISO 8601
  numberOfBookableSeats?: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions?: PricingOptions;
  validatingAirlineCodes?: string[];
  travelerPricings?: TravelerPricing[];
}

/**
 * Itinerary (Outbound or Return)
 */
export interface Itinerary {
  duration: string; // ISO 8601 duration (PT8H30M)
  segments: Segment[];
}

/**
 * Flight Segment
 */
export interface Segment {
  departure: Location;
  arrival: Location;
  carrierCode: string; // IATA carrier code
  number: string; // Flight number
  aircraft?: {
    code: string; // Aircraft type code
  };
  operating?: {
    carrierCode: string; // Operating carrier if codeshare
  };
  duration?: string; // ISO 8601 duration
  id: string; // Segment identifier
  numberOfStops?: number;
  blacklistedInEU?: boolean;
}

/**
 * Location (Departure or Arrival)
 */
export interface Location {
  iataCode: string; // Airport code
  terminal?: string;
  at: string; // ISO 8601 datetime
}

/**
 * Price Information
 */
export interface Price {
  currency: string; // ISO currency code
  total: string; // Total price
  base: string; // Base fare
  fees?: Fee[];
  grandTotal?: string;
  taxes?: Tax[];
}

/**
 * Fee
 */
export interface Fee {
  amount: string;
  type: string; // "TICKETING", "SUPPLIER", etc.
}

/**
 * Tax
 */
export interface Tax {
  amount: string;
  code: string;
}

/**
 * Pricing Options
 */
export interface PricingOptions {
  fareType: string[]; // ["PUBLISHED"]
  includedCheckedBagsOnly?: boolean;
}

/**
 * Traveler Pricing (PER TRAVELER)
 */
export interface TravelerPricing {
  travelerId: string;
  fareOption: string; // "STANDARD", "BASIC", "FLEX"
  travelerType: TravelerType;
  price: Price;
  fareDetailsBySegment: FareDetailsBySegment[];
}

/**
 * Traveler Type
 */
export type TravelerType =
  | 'ADULT'
  | 'CHILD'
  | 'HELD_INFANT'
  | 'SEATED_INFANT'
  | 'SENIOR'
  | 'YOUNG'
  | 'STUDENT';

/**
 * Fare Details By Segment (CRITICAL)
 * One entry per flight segment
 */
export interface FareDetailsBySegment {
  segmentId: string; // References Segment.id
  cabin: CabinClass;
  fareBasis?: string; // Fare basis code
  brandedFare?: string; // Branded fare name
  class?: string; // RBD (booking class)
  includedCheckedBags?: BaggageAllowance;
  additionalServices?: AdditionalServices;
}

/**
 * Cabin Class
 */
export type CabinClass =
  | 'ECONOMY'
  | 'PREMIUM_ECONOMY'
  | 'BUSINESS'
  | 'FIRST';

/**
 * Baggage Allowance
 * Can be quantity-based OR weight-based
 */
export interface BaggageAllowance {
  quantity?: number; // Number of bags
  weight?: number; // Weight limit
  weightUnit?: 'KG' | 'LB';
}

/**
 * Additional Services
 */
export interface AdditionalServices {
  chargeableCheckedBags?: {
    quantity?: number;
    weight?: number;
    weightUnit?: 'KG' | 'LB';
  };
  chargeableSeatNumber?: string;
  otherServices?: string[];
}

/**
 * Location Info (from dictionaries)
 */
export interface LocationInfo {
  cityCode: string;
  countryCode: string;
}

/**
 * Warning
 */
export interface Warning {
  status: number;
  code: number;
  title: string;
  detail?: string;
}

/**
 * API Error
 */
export interface ApiError {
  status: number;
  code: number;
  title: string;
  detail?: string;
  source?: {
    parameter?: string;
    pointer?: string;
    example?: string;
  };
}

// ============================================
// BRANDED FARES UPSELL API TYPES
// ============================================

export interface BrandedFaresResponse {
  data: BrandedFareOffer[];
  dictionaries?: any;
}

export interface BrandedFareOffer extends FlightOffer {
  brandedFare: string; // Fare family name
  amenities?: Amenity[];
}

export interface Amenity {
  description: string;
  isChargeable: boolean;
  amenityType?: string;
  amenityProvider?: {
    name: string;
  };
  price?: {
    amount: string;
    currencyCode: string;
  };
}

// ============================================
// FLIGHT OFFERS PRICE API (with include params)
// ============================================

export interface FlightOffersPriceResponse {
  data: FlightOffer;
  included?: {
    bags?: Record<string, ChargeableBag>;
    'detailed-fare-rules'?: DetailedFareRules;
    'credit-card-fees'?: CreditCardFee[];
    'other-services'?: OtherService[];
  };
}

export interface ChargeableBag {
  quantity: number;
  name: string; // "CHECKED_BAG"
  price: {
    amount: string;
    currencyCode: string;
  };
  bookingCode?: string;
}

export interface DetailedFareRules {
  rules: FareRule[];
}

export interface FareRule {
  category: string; // "REFUNDS", "EXCHANGE", "REVALIDATION"
  maxPenaltyAmount?: string;
  rules: FareRuleDetail[];
}

export interface FareRuleDetail {
  notApplicable: boolean;
  maxPenaltyAmount?: string;
  descriptions?: {
    descriptionType: string;
    text: string;
  };
}

export interface CreditCardFee {
  brand: string;
  amount: string;
  currency: string;
  flightOfferId: string;
}

export interface OtherService {
  type: string;
  description: string;
  price: {
    amount: string;
    currencyCode: string;
  };
}

// ============================================
// SEARCH PARAMS
// ============================================

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: CabinClass;
  nonStop?: boolean;
  currencyCode?: string;
  maxPrice?: number;
  max?: number; // Max results (default 250)
  includedAirlineCodes?: string;
  excludedAirlineCodes?: string;
}
```

---

## LIMITATIONS AND GAPS

### What's NOT Available in API

1. **Cabin Baggage / Carry-On Information**
   - API does NOT return cabin baggage allowances
   - Must use external data source or airline rules

2. **Seat Selection Availability**
   - API doesn't show which seats are available without calling Seat Map API
   - No indication of free vs paid seat selection in base search

3. **Meal Service Information**
   - Not included in base response
   - May be in Branded Fares amenities

4. **Wi-Fi Availability**
   - Not included

5. **Lounge Access Details**
   - Not in base response
   - May be in Branded Fares amenities for premium cabins

6. **Exact Change/Cancel Fees**
   - Requires separate call with `include=detailed-fare-rules`
   - Not in base search response

7. **Real-Time Seat Availability**
   - `numberOfBookableSeats` is capped at 9
   - May not reflect true availability

8. **Codeshare Limitations**
   - Some operating carriers without Amadeus agreements return incomplete data
   - Error: "no agreement exists with the operating carrier"

9. **Automatic Basic vs Standard Differentiation**
   - No dedicated field like `isBasicEconomy: true`
   - Must infer from `brandedFare`, `fareOption`, `fareBasis`, or `includedCheckedBags`

10. **Branded Fare Amenities in Base Search**
    - Amenities only available via separate Branded Fares Upsell API call

### API Rate Limits

Amadeus imposes rate limits based on plan:

- **Free Tier:** 1 call/second, 2,000 calls/month
- **Self-Service Production:** Varies by contract
- **Enterprise:** Custom limits

Implement rate limiting and retry logic.

### Data Freshness

- Prices are **cached** for ~30 minutes
- Always call **Flight Offers Price API** before booking to confirm
- Seat availability can change between search and booking

### Currency Conversion

- API returns prices in requested `currencyCode`
- Conversion uses Amadeus internal rates
- May differ from actual card charge (bank rates apply)

---

## RESOURCES AND REFERENCES

### Official Documentation

| Resource | URL |
|----------|-----|
| **Flight Offers Search API Reference** | https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search/api-reference |
| **Flight Offers Price API** | https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-price |
| **Branded Fares Upsell API** | https://developers.amadeus.com/self-service/category/flights/api-doc/branded-fares-upsell |
| **Seat Map Display API** | https://developers.amadeus.com/self-service/category/flights/api-doc/seatmap-display |
| **Flight Choice Prediction API** | https://developers.amadeus.com/self-service/category/flights/api-doc/flight-choice-prediction |
| **Amadeus Developer Guides** | https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources/flights/ |

### OpenAPI Specification

| Resource | URL |
|----------|-----|
| **GitHub - OpenAPI Specs** | https://github.com/amadeus4dev/amadeus-open-api-specification |
| **Flight Offers Search v2 Schema** | https://github.com/amadeus4dev/amadeus-open-api-specification/blob/main/spec/json/FlightOffersSearch_v2_swagger_specification.json |

### Code Examples

| Resource | URL |
|----------|-----|
| **Amadeus Code Examples** | https://github.com/amadeus4dev/amadeus-code-examples |
| **Node.js SDK** | https://github.com/amadeus4dev/amadeus-node |
| **Python SDK** | https://github.com/amadeus4dev/amadeus-python |
| **TypeScript SDK (Community)** | https://github.com/darseen/amadeus-ts |

### Blog Posts & Tutorials

| Resource | URL |
|----------|-----|
| **How to Search and Book Branded Fares** | https://developers.amadeus.com/blog/search-book-branded-fares-amadeus-api |
| **Adding Baggage with Flight Booking APIs** | https://developers.amadeus.com/blog/add-baggage-amadeus-flight-booking-api |
| **How to Book a Flight in 5 Minutes** | https://blog.postman.com/how-to-book-flight-amadeus-apis-postman/ |

### Service Hub (Technical Docs)

| Resource | URL |
|----------|-----|
| **Fares and Pricing Essentials** | https://servicehub.amadeus.com/c/portal/view-solution/1014035744/fares-and-pricing-essentials-reference-guide |
| **Overview of Fare Types** | https://servicehub.amadeus.com/c/portal/view-solution/807641/overview-of-the-different-fare-types |
| **Fare Family Pricing** | https://servicehub.amadeus.com/c/portal/view-solution/879731/how-to-price-a-pnr-with-fare-family-option-cryptic- |

### Stack Overflow Resources

- [Make the difference between outbound and return flight](https://stackoverflow.com/questions/69829368)
- [How to create order with extra baggage/seat](https://stackoverflow.com/questions/63195597)
- [Can't use includedCheckedBags attribute](https://stackoverflow.com/questions/57073858)

---

## CONCLUSION

The Amadeus Flight Offers Search API provides comprehensive fare and baggage data via the `travelerPricings` and `fareDetailsBySegment` structures. By understanding the per-segment nature of baggage rules, the distinction between cabin class and fare family, and the proper workflow for branded fares, you can build a robust flight search and booking system.

### Key Takeaways

1. **Baggage is per-segment:** Always iterate through `fareDetailsBySegment` to extract baggage for each leg
2. **Cabin ≠ Fare Family:** Cabin is the physical compartment; fare family is the marketing bundle
3. **Branded Fares require separate API call:** Base search returns lowest fare; use Upsell API for alternatives
4. **Codeshare complexity:** Marketing carrier vs operating carrier affects baggage rules (MSC rule)
5. **Always confirm pricing:** Call Flight Offers Price API before booking
6. **Handle missing data:** Not all airlines provide complete baggage info via API

### Next Steps

1. Implement per-segment baggage extraction in your UI
2. Add Branded Fares Upsell integration for fare comparison
3. Integrate Flight Offers Price API with `include=bags,detailed-fare-rules`
4. Build airline-specific branded fare name mapping
5. Add fallback handling for missing baggage data
6. Implement rate limiting and retry logic

---

**Document Version:** 1.0
**Last Updated:** 2025-10-19
**Author:** Claude (Anthropic)
**Status:** Research Complete - Ready for Implementation
