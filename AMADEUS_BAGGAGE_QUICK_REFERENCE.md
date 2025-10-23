# AMADEUS BAGGAGE PARSING - QUICK REFERENCE

**Quick implementation guide for extracting per-segment baggage from Amadeus API**

---

## THE 5-SECOND VERSION

```typescript
// Get baggage for a segment
const bags = travelerPricing.fareDetailsBySegment.find(
  f => f.segmentId === segment.id
)?.includedCheckedBags;

if (bags?.quantity !== undefined) {
  console.log(`${bags.quantity} bags`);
} else if (bags?.weight !== undefined) {
  console.log(`${bags.weight} ${bags.weightUnit}`);
} else {
  console.log('Baggage info not available');
}
```

---

## COMPLETE EXTRACTION PATTERN

### Step 1: Understand the Structure

```
FlightOffer
  └── travelerPricings[]           ← One per traveler type
       └── fareDetailsBySegment[]  ← One per flight segment
            ├── segmentId          ← Links to itineraries[].segments[].id
            └── includedCheckedBags
                 ├── quantity      ← Number of bags (e.g., 2)
                 OR
                 ├── weight        ← Weight allowance (e.g., 23)
                 └── weightUnit    ← "KG" or "LB"
```

### Step 2: TypeScript Implementation

```typescript
interface SegmentBaggage {
  segmentId: string;
  origin: string;
  destination: string;
  type: 'quantity' | 'weight' | 'none';
  value: number;
  unit?: 'KG' | 'LB';
  display: string;
}

function extractBaggageForAllSegments(
  flightOffer: FlightOffer
): SegmentBaggage[] {
  const result: SegmentBaggage[] = [];

  // For each traveler (usually just need first adult)
  const travelerPricing = flightOffer.travelerPricings?.[0];
  if (!travelerPricing) return result;

  // For each segment
  flightOffer.itineraries.forEach((itinerary, itinIndex) => {
    itinerary.segments.forEach((segment, segIndex) => {
      const fareDetail = travelerPricing.fareDetailsBySegment.find(
        f => f.segmentId === segment.id
      );

      const bags = fareDetail?.includedCheckedBags;

      let baggage: SegmentBaggage;

      if (!bags || (bags.quantity === undefined && bags.weight === undefined)) {
        // No baggage info
        baggage = {
          segmentId: segment.id,
          origin: segment.departure.iataCode,
          destination: segment.arrival.iataCode,
          type: 'none',
          value: 0,
          display: 'Baggage info not available'
        };
      } else if (bags.quantity !== undefined) {
        // Quantity-based
        baggage = {
          segmentId: segment.id,
          origin: segment.departure.iataCode,
          destination: segment.arrival.iataCode,
          type: 'quantity',
          value: bags.quantity,
          display: bags.quantity === 0
            ? 'No checked bags included'
            : `${bags.quantity} checked bag${bags.quantity > 1 ? 's' : ''}`
        };
      } else {
        // Weight-based
        baggage = {
          segmentId: segment.id,
          origin: segment.departure.iataCode,
          destination: segment.arrival.iataCode,
          type: 'weight',
          value: bags.weight!,
          unit: bags.weightUnit as 'KG' | 'LB',
          display: `1 bag (up to ${bags.weight} ${bags.weightUnit})`
        };
      }

      result.push(baggage);
    });
  });

  return result;
}
```

### Step 3: React Component Display

```tsx
function BaggageInfo({ flightOffer }: { flightOffer: FlightOffer }) {
  const baggageInfo = extractBaggageForAllSegments(flightOffer);

  // Check if all segments have same baggage
  const allSame = baggageInfo.every(
    b => b.display === baggageInfo[0].display
  );

  if (allSame) {
    // Simple display
    return (
      <div className="baggage-info">
        <LuggageIcon />
        <span>{baggageInfo[0].display}</span>
      </div>
    );
  }

  // Per-segment display
  return (
    <div className="baggage-info-detailed">
      <h4>Baggage Allowance (varies by segment)</h4>
      {baggageInfo.map(b => (
        <div key={b.segmentId} className="segment-baggage">
          <span className="route">{b.origin} → {b.destination}</span>
          <span className="allowance">{b.display}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## COMMON PATTERNS

### Pattern 1: Round-Trip with Same Baggage

```json
{
  "travelerPricings": [{
    "fareDetailsBySegment": [
      { "segmentId": "1", "includedCheckedBags": { "quantity": 2 } },
      { "segmentId": "2", "includedCheckedBags": { "quantity": 2 } }
    ]
  }]
}
```

**Display:** "2 checked bags"

### Pattern 2: No Bags (Basic Economy)

```json
{
  "travelerPricings": [{
    "fareOption": "BASIC",
    "fareDetailsBySegment": [
      { "segmentId": "1", "includedCheckedBags": { "quantity": 0 } }
    ]
  }]
}
```

**Display:** "No checked bags included" + badge "Basic Economy"

### Pattern 3: Mixed Quantity/Weight

```json
{
  "fareDetailsBySegment": [
    { "segmentId": "1", "includedCheckedBags": { "quantity": 2 } },
    { "segmentId": "2", "includedCheckedBags": { "weight": 23, "weightUnit": "KG" } }
  ]
}
```

**Display:**
```
JFK → LHR: 2 checked bags
LHR → CDG: 1 bag (up to 23 KG)
```

### Pattern 4: Chargeable Bags Available

```json
{
  "fareDetailsBySegment": [{
    "segmentId": "1",
    "includedCheckedBags": { "quantity": 0 },
    "additionalServices": {
      "chargeableCheckedBags": { "quantity": 1 }
    }
  }]
}
```

**Display:** "No bags included • Add bags from $30"
(Call Flight Offers Price API with `include=bags` to get price)

---

## EDGE CASES CHEAT SHEET

| Scenario | Detection | Handling |
|----------|-----------|----------|
| **No baggage info** | `includedCheckedBags` is undefined | Show "Contact airline for baggage policy" |
| **Codeshare flight** | `segment.operating.carrierCode !== segment.carrierCode` | Display "Operated by {airline}" |
| **Mixed cabins** | Different `cabin` values per segment | Show cabin class per segment |
| **Basic Economy** | `fareOption === "BASIC"` or `quantity === 0` | Add "Basic Economy" badge |
| **Different rules per segment** | Baggage values differ across `fareDetailsBySegment` | Show per-segment breakdown |

---

## API CALLS FOR ADDITIONAL INFO

### Get Baggage Prices

```typescript
// Call Flight Offers Price with include=bags
const pricingResult = await axios.post(
  `${baseUrl}/v1/shopping/flight-offers/pricing?include=bags`,
  { data: { type: 'flight-offers-pricing', flightOffers: [selectedOffer] } },
  { headers: { Authorization: `Bearer ${token}` } }
);

// Extract bag prices
const bags = pricingResult.data.included?.bags;
// bags = { "1": { quantity: 1, name: "CHECKED_BAG", price: { amount: "30.00" } } }
```

### Get Fare Restrictions

```typescript
// Call with include=detailed-fare-rules
const fareRules = await axios.post(
  `${baseUrl}/v1/shopping/flight-offers/pricing?include=detailed-fare-rules`,
  { data: { type: 'flight-offers-pricing', flightOffers: [selectedOffer] } },
  { headers: { Authorization: `Bearer ${token}` } }
);

// Check refund policy
const refundRule = fareRules.data.fareRules?.rules.find(
  r => r.category === 'REFUNDS'
);
```

---

## VALIDATION CHECKLIST

Before displaying baggage info, validate:

```typescript
function validateBaggageData(fareDetail: FareDetailsBySegment): boolean {
  const bags = fareDetail.includedCheckedBags;

  // Check 1: Is baggage info present?
  if (!bags) {
    console.warn(`No baggage info for segment ${fareDetail.segmentId}`);
    return false;
  }

  // Check 2: Is it quantity OR weight (not both empty)?
  if (bags.quantity === undefined && bags.weight === undefined) {
    console.warn(`Invalid baggage format for segment ${fareDetail.segmentId}`);
    return false;
  }

  // Check 3: If weight-based, is unit provided?
  if (bags.weight !== undefined && !bags.weightUnit) {
    console.warn(`Missing weight unit for segment ${fareDetail.segmentId}`);
    return false;
  }

  return true;
}
```

---

## TESTING DATA

### Mock Response for Testing

```typescript
const mockFlightOffer: FlightOffer = {
  id: "1",
  itineraries: [
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
    }
  ],
  price: { currency: "USD", total: "542.80", base: "450.00" },
  travelerPricings: [
    {
      travelerId: "1",
      fareOption: "STANDARD",
      travelerType: "ADULT",
      price: { currency: "USD", total: "542.80", base: "450.00" },
      fareDetailsBySegment: [
        {
          segmentId: "1",
          cabin: "ECONOMY",
          fareBasis: "KL0ASAVER",
          class: "K",
          includedCheckedBags: { quantity: 2 }
        }
      ]
    }
  ]
};
```

---

## PERFORMANCE TIPS

1. **Cache baggage extraction:** Don't re-parse on every render
   ```typescript
   const baggageInfo = useMemo(
     () => extractBaggageForAllSegments(flightOffer),
     [flightOffer.id]
   );
   ```

2. **Pre-compute during API response transformation:**
   ```typescript
   function enrichFlightOffer(offer: FlightOffer): EnrichedFlightOffer {
     return {
       ...offer,
       baggageInfo: extractBaggageForAllSegments(offer),
       fareLevel: getFareLevel(offer)
     };
   }
   ```

3. **Index by segmentId for O(1) lookup:**
   ```typescript
   const baggageMap = new Map(
     baggageInfo.map(b => [b.segmentId, b])
   );
   ```

---

## SUMMARY

**3 Steps to Extract Baggage:**

1. Get `travelerPricings[0]` (first traveler)
2. Find matching `fareDetailsBySegment` entry by `segmentId`
3. Read `includedCheckedBags.quantity` OR `includedCheckedBags.weight`

**Golden Rule:** Always check for both quantity AND weight fields, as airlines use different systems.

**Pro Tip:** Call `Flight Offers Price API` before booking to confirm baggage rules haven't changed.

---

**Quick Reference Version:** 1.0
**Last Updated:** 2025-10-19
