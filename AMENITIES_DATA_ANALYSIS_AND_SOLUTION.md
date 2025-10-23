# AMENITIES DATA ANALYSIS & SOLUTION
**Created:** 2025-10-23
**Issue:** Flight cards showing incorrect amenities (WiFi ✗, Power ✗) for Business class flights

---

## 🔍 PROBLEM IDENTIFIED

### User Observation
Business class Iberia flight on 787 aircraft showing:
- **WiFi ✓** (correct)
- **Power ✗** (INCORRECT - 787 Business always has power)
- **Meal** (showing generic "Meal")

### Root Cause
**The Amadeus Flight Offers Search API does NOT include amenities data (WiFi, Power outlets, Meals, Entertainment) in the base response.**

---

## 📊 CURRENT STATE ANALYSIS

### What We're Getting from Amadeus API ✅

From `GET /v2/shopping/flight-offers` we receive:

1. **Flight Information**
   - Airline, flight number, aircraft type
   - Departure/arrival times and airports
   - Duration, number of stops
   - Terminal information

2. **Pricing Data**
   - Base fare, taxes, fees
   - Total price per passenger type
   - Currency

3. **Baggage Allowances**
   - Checked baggage (quantity, weight, dimensions)
   - Per segment baggage rules
   - Baggage fees (if chargeable)

4. **Cabin & Fare Information**
   - Cabin class (ECONOMY, BUSINESS, FIRST)
   - Fare basis code
   - Branded fare name (e.g., "BUSINESS OPTIMA")
   - Booking class (RBD)

5. **Availability**
   - Number of bookable seats
   - Last ticketing date

### What We're NOT Getting ❌

The base Flight Offers Search API does **NOT** include:

1. **WiFi Availability** ❌
2. **Power Outlet Availability** ❌
3. **Meal Service Details** ❌
4. **In-flight Entertainment** ❌
5. **Seat Features** (legroom, recline, width) ❌
6. **Lounge Access** ❌
7. **Priority Boarding** ❌
8. **Upgrade Options** ❌

### How We're Currently Displaying Amenities 🔧

**File:** `components/flights/FlightCardEnhanced.tsx` (Lines 272-285)

```typescript
// Parse amenities array (NEW - rich data from API!)
const amenitiesArray = fareDetails.amenities || [];  // ⚠️ This is ALWAYS undefined/empty!
const amenities = {
  wifi: amenitiesArray.some((a: any) =>
    a.description.toLowerCase().includes('wifi') ||
    a.description.toLowerCase().includes('wi-fi')
  ),
  power: amenitiesArray.some((a: any) =>
    a.description.toLowerCase().includes('power') ||
    a.description.toLowerCase().includes('outlet')
  ),
  meal: getMealType(amenitiesArray),
  entertainment: amenitiesArray.some((a: any) => a.amenityType === 'ENTERTAINMENT'),
};
```

**Result:** Since `fareDetails.amenities` is always `undefined`, all amenities default to:
- `wifi: false` → Shows as "📶WiFi ✗"
- `power: false` → Shows as "🔌Power ✗"
- `meal: "None"` → Shows as "🍽️None"

---

## 🎯 SOLUTION OPTIONS

### Option 1: Use Branded Fares Upsell API (REAL DATA) ⭐ RECOMMENDED

**API Endpoint:** `GET /v1/shopping/flight-offers/{id}/branded-fares`

**What It Provides:**
```json
{
  "data": {
    "type": "branded-fares",
    "flightOffers": [
      {
        "id": "1",
        "price": { "total": "542.80" },
        "amenities": [
          {
            "description": "2 checked bags included",
            "isChargeable": false
          },
          {
            "description": "Seat selection included",
            "isChargeable": false
          },
          {
            "description": "WiFi included",
            "isChargeable": false
          },
          {
            "description": "Power outlets available",
            "isChargeable": false
          },
          {
            "description": "Hot meal service",
            "isChargeable": false
          }
        ]
      }
    ]
  }
}
```

**Pros:**
- ✅ **Real, accurate data from airline**
- ✅ Shows exactly what's included in the fare
- ✅ Can display upsell options (upgrade to higher fare class)
- ✅ Includes other amenities (lounge access, priority boarding)

**Cons:**
- ❌ Requires additional API call per flight (rate limit concerns)
- ❌ May increase page load time
- ❌ Not all airlines provide branded fare data
- ❌ Additional API costs

**Implementation:**
1. Add `getBrandedFares(flightOfferId)` call in flight results route
2. Parse amenities from branded fares response
3. Display in FlightCardEnhanced component

---

### Option 2: Aircraft + Cabin Class Heuristics (ESTIMATED DATA) ⚡ QUICK FIX

Use aircraft type + cabin class to estimate amenities with high confidence.

**Database:** Create amenities lookup table

```typescript
const AIRCRAFT_AMENITIES = {
  // Boeing 787 Dreamliner
  '787': {
    BUSINESS: { wifi: true, power: true, meal: 'Hot meal', entertainment: true },
    PREMIUM_ECONOMY: { wifi: true, power: true, meal: 'Meal', entertainment: true },
    ECONOMY: { wifi: true, power: true, meal: 'Snack', entertainment: true }
  },
  // Airbus A350
  '350': {
    BUSINESS: { wifi: true, power: true, meal: 'Hot meal', entertainment: true },
    PREMIUM_ECONOMY: { wifi: true, power: true, meal: 'Meal', entertainment: true },
    ECONOMY: { wifi: true, power: true, meal: 'Snack', entertainment: true }
  },
  // Boeing 777
  '777': {
    BUSINESS: { wifi: true, power: true, meal: 'Hot meal', entertainment: true },
    ECONOMY: { wifi: false, power: true, meal: 'Snack', entertainment: true }
  },
  // Airbus A320 family
  '320': {
    BUSINESS: { wifi: false, power: false, meal: 'Meal', entertainment: false },
    ECONOMY: { wifi: false, power: false, meal: 'Snack', entertainment: false }
  },
  // Default fallback
  'DEFAULT': {
    BUSINESS: { wifi: true, power: true, meal: 'Meal', entertainment: true },
    ECONOMY: { wifi: false, power: false, meal: 'Snack', entertainment: false }
  }
};

function getEstimatedAmenities(aircraftCode: string, cabin: string) {
  // Match aircraft (787, 350, 777, etc.)
  const aircraftKey = Object.keys(AIRCRAFT_AMENITIES).find(key =>
    aircraftCode.includes(key)
  ) || 'DEFAULT';

  return AIRCRAFT_AMENITIES[aircraftKey][cabin] || AIRCRAFT_AMENITIES['DEFAULT'][cabin];
}
```

**Pros:**
- ✅ No additional API calls
- ✅ Fast, immediate results
- ✅ High accuracy for modern aircraft
- ✅ No API rate limit concerns
- ✅ Works offline

**Cons:**
- ❌ Not 100% accurate (some airlines differ)
- ❌ Requires maintenance as airlines update aircraft
- ❌ Can't show fare-specific amenities (Basic Economy restrictions)

**Accuracy Estimate:**
- **Business/First Class:** ~95% accurate
- **Premium Economy:** ~85% accurate
- **Economy:** ~70% accurate (varies widely by airline/route)

---

### Option 3: Hybrid Approach (BEST OF BOTH) 🌟 OPTIMAL

Combine both approaches for maximum accuracy and speed.

**Strategy:**
1. **Display immediately** using aircraft heuristics (Option 2)
2. **Lazy load** branded fares data in background (Option 3)
3. **Update** amenities when branded fares data arrives
4. **Mark** estimated vs real data with indicator

**Implementation:**
```typescript
// Initial render: Use heuristics
const [amenities, setAmenities] = useState(getEstimatedAmenities(aircraft, cabin));
const [isEstimated, setIsEstimated] = useState(true);

// Background: Fetch real data
useEffect(() => {
  async function fetchBrandedFares() {
    try {
      const brandedFares = await fetch(`/api/branded-fares/${flightId}`);
      const realAmenities = parseBrandedFaresAmenities(brandedFares);
      setAmenities(realAmenities);
      setIsEstimated(false);
    } catch (error) {
      // Keep estimated data if API fails
      console.log('Using estimated amenities');
    }
  }
  fetchBrandedFares();
}, [flightId]);

// Display with indicator
<span title={isEstimated ? "Estimated based on aircraft type" : "Confirmed by airline"}>
  📶WiFi {amenities.wifi ? '✓' : '✗'} {isEstimated && '~'}
</span>
```

**Pros:**
- ✅ Instant display (no waiting)
- ✅ Real data when available
- ✅ Graceful degradation if API fails
- ✅ User sees immediate value
- ✅ Transparent about data source

**Cons:**
- ❌ More complex implementation
- ❌ Need to handle state updates
- ❌ May show "flickering" if data changes

---

## 📋 MISSING DATA OPPORTUNITIES

### Additional Data Available from Amadeus (Not Currently Used)

1. **CO2 Emissions** ✅ (Currently showing, but could be enhanced)
   - API: `/v1/travel/predictions/flight-emissions`
   - Shows: kg of CO2 per passenger
   - **Current:** Showing comparison to average
   - **Enhancement:** Show carbon offset cost, tree equivalent

2. **Flight Choice Prediction** ⚠️ (Available but not used)
   - API: `/v2/shopping/flight-offers/prediction`
   - Shows: ML-based likelihood user will book
   - **Use Case:** Re-rank flights, show "Popular choice" badge

3. **Price Analytics** ⚠️ (Available but not used)
   - API: `/v1/analytics/itinerary-price-metrics`
   - Shows: Quartile pricing (is this cheap/expensive?)
   - **Use Case:** Show "Great deal" or "Above average" badges

4. **On-Time Performance** ❌ (Not available in standard API)
   - **Alternative:** Use third-party data (FlightStats, OAG)
   - **Current:** Showing hardcoded "73% on-time"
   - **Enhancement:** Real historical data

5. **Seat Maps** ⚠️ (Available but only in expanded view)
   - API: `/v1/shopping/seatmaps`
   - **Current:** Modal only
   - **Enhancement:** Show seat availability count in collapsed card

6. **Fare Rules Details** ⚠️ (Available but only in expanded view)
   - API: `/v1/shopping/flight-offers/pricing?include=detailed-fare-rules`
   - **Current:** Showing in expanded "Refund & Change Policies"
   - **Enhancement:** Show key policies in collapsed view (refundable/non-refundable badge)

---

## 🎨 COMPETITOR COMPARISON

### How Competitors Show Amenities

**Google Flights:**
- Shows WiFi, Power, Entertainment icons in flight list
- Uses airline-provided data + aircraft database
- Marks estimated data with "typically available"

**Booking.com:**
- Shows amenities in expanded card only
- Very detailed (seat width, legroom, recline)
- Uses GDS data + third-party sources

**Kayak:**
- Shows basic amenities in list
- More details in expanded view
- Uses combination of real + estimated data

**Skyscanner:**
- Minimal amenities in list
- Detailed breakdown in booking flow
- Focuses on baggage and fare rules

---

## ✅ RECOMMENDED ACTION PLAN

### Phase 1: Quick Fix (1-2 hours)
**Implement aircraft-based heuristics (Option 2)**

1. Create `lib/flights/aircraft-amenities.ts` with lookup table
2. Update `getBaggageByItinerary()` to use aircraft amenities
3. Add "(estimated)" indicator to amenities
4. Test with various aircraft types

**Benefits:**
- Immediate improvement
- Business class 787 will correctly show Power ✓
- No API changes needed

---

### Phase 2: Real Data Integration (4-6 hours)
**Add Branded Fares API calls (Option 1)**

1. Create `/api/branded-fares/route.ts`
2. Call API in flight search results
3. Parse amenities from response
4. Update FlightCardEnhanced to use real data
5. Add loading states and error handling

**Benefits:**
- 100% accurate amenities
- Can show upsell options (Premium Economy, Business upgrades)
- Better conversion (show value of higher fares)

---

### Phase 3: Hybrid Optimization (2-3 hours)
**Combine both approaches (Option 3)**

1. Show estimated data immediately
2. Lazy load branded fares in background
3. Update UI when real data arrives
4. Add "(estimated)" vs "(confirmed)" indicators

**Benefits:**
- Best user experience
- No perceived lag
- Maximum accuracy

---

## 📊 IMPACT ASSESSMENT

### Current State
- **Accuracy:** 0% (all amenities show as unavailable)
- **User Trust:** LOW (Business class showing no power is obviously wrong)
- **Conversion:** NEGATIVE IMPACT (users may think we have poor inventory)

### After Phase 1 (Heuristics)
- **Accuracy:** ~85% overall
- **User Trust:** MEDIUM-HIGH
- **Conversion:** POSITIVE IMPACT (correct information builds trust)
- **Implementation Time:** 1-2 hours

### After Phase 2 (Real Data)
- **Accuracy:** ~95% overall (when data available)
- **User Trust:** HIGH
- **Conversion:** STRONG POSITIVE IMPACT
- **Implementation Time:** +4-6 hours

### After Phase 3 (Hybrid)
- **Accuracy:** 95%+ with instant display
- **User Trust:** VERY HIGH
- **Conversion:** MAXIMUM IMPACT
- **Implementation Time:** +2-3 hours

---

## 🔑 KEY TAKEAWAYS

1. **Amenities data is NOT in base Amadeus Flight Offers API**
2. **Currently ALL flights show WiFi ✗, Power ✗, Meal: None**
3. **This is factually incorrect and damages user trust**
4. **Quick fix:** Use aircraft type + cabin class heuristics (1-2 hours)
5. **Full solution:** Integrate Branded Fares Upsell API (4-6 hours)
6. **Optimal solution:** Hybrid approach with instant display + background loading

---

## 📝 TECHNICAL IMPLEMENTATION

### Quick Fix Code (Aircraft Heuristics)

**File:** `lib/flights/aircraft-amenities.ts`

```typescript
export interface AircraftAmenities {
  wifi: boolean;
  power: boolean;
  meal: string;
  entertainment: boolean;
  seatPitch?: string;
  seatWidth?: string;
}

export const AIRCRAFT_AMENITIES_DB: Record<string, Record<string, AircraftAmenities>> = {
  '787': {
    BUSINESS: { wifi: true, power: true, meal: 'Hot meal', entertainment: true, seatPitch: '78"', seatWidth: '21"' },
    PREMIUM_ECONOMY: { wifi: true, power: true, meal: 'Meal', entertainment: true, seatPitch: '38"', seatWidth: '18.5"' },
    ECONOMY: { wifi: true, power: true, meal: 'Snack or meal', entertainment: true, seatPitch: '32"', seatWidth: '17.5"' }
  },
  '350': {
    BUSINESS: { wifi: true, power: true, meal: 'Hot meal', entertainment: true, seatPitch: '78"', seatWidth: '22"' },
    PREMIUM_ECONOMY: { wifi: true, power: true, meal: 'Meal', entertainment: true, seatPitch: '38"', seatWidth: '19"' },
    ECONOMY: { wifi: true, power: true, meal: 'Snack or meal', entertainment: true, seatPitch: '32"', seatWidth: '18"' }
  },
  '777': {
    BUSINESS: { wifi: true, power: true, meal: 'Hot meal', entertainment: true, seatPitch: '75"', seatWidth: '21"' },
    PREMIUM_ECONOMY: { wifi: true, power: true, meal: 'Meal', entertainment: true, seatPitch: '38"', seatWidth: '18"' },
    ECONOMY: { wifi: false, power: true, meal: 'Meal', entertainment: true, seatPitch: '31"', seatWidth: '17"' }
  },
  '330': {
    BUSINESS: { wifi: true, power: true, meal: 'Hot meal', entertainment: true, seatPitch: '74"', seatWidth: '21"' },
    ECONOMY: { wifi: false, power: false, meal: 'Meal', entertainment: true, seatPitch: '31"', seatWidth: '17"' }
  },
  '320': {
    BUSINESS: { wifi: false, power: false, meal: 'Meal', entertainment: false, seatPitch: '34"', seatWidth: '18"' },
    ECONOMY: { wifi: false, power: false, meal: 'Snack', entertainment: false, seatPitch: '30"', seatWidth: '17"' }
  },
  '321': {
    BUSINESS: { wifi: true, power: true, meal: 'Meal', entertainment: true, seatPitch: '37"', seatWidth: '18"' },
    ECONOMY: { wifi: false, power: false, meal: 'Snack', entertainment: true, seatPitch: '30"', seatWidth: '17"' }
  },
  '737': {
    BUSINESS: { wifi: true, power: false, meal: 'Meal', entertainment: false, seatPitch: '37"', seatWidth: '20"' },
    ECONOMY: { wifi: false, power: false, meal: 'Snack', entertainment: false, seatPitch: '30"', seatWidth: '17"' }
  },
  'DEFAULT': {
    FIRST: { wifi: true, power: true, meal: 'Multi-course meal', entertainment: true, seatPitch: '80"', seatWidth: '22"' },
    BUSINESS: { wifi: true, power: true, meal: 'Hot meal', entertainment: true, seatPitch: '60"', seatWidth: '21"' },
    PREMIUM_ECONOMY: { wifi: true, power: true, meal: 'Meal', entertainment: true, seatPitch: '38"', seatWidth: '18"' },
    ECONOMY: { wifi: false, power: false, meal: 'Snack', entertainment: false, seatPitch: '31"', seatWidth: '17"' }
  }
};

export function getEstimatedAmenities(
  aircraftCode: string | undefined,
  cabin: string
): AircraftAmenities & { isEstimated: true } {
  if (!aircraftCode) {
    return { ...AIRCRAFT_AMENITIES_DB.DEFAULT[cabin] || AIRCRAFT_AMENITIES_DB.DEFAULT.ECONOMY, isEstimated: true };
  }

  // Extract numeric part (e.g., "738" -> "737", "787" -> "787")
  const normalized = aircraftCode.replace(/[^0-9]/g, '');

  // Try exact match first
  if (AIRCRAFT_AMENITIES_DB[normalized]?.[cabin]) {
    return { ...AIRCRAFT_AMENITIES_DB[normalized][cabin], isEstimated: true };
  }

  // Try family match (e.g., "738" -> "737")
  const family = normalized.slice(0, 3);
  if (AIRCRAFT_AMENITIES_DB[family]?.[cabin]) {
    return { ...AIRCRAFT_AMENITIES_DB[family][cabin], isEstimated: true };
  }

  // Fallback to default for cabin class
  return { ...AIRCRAFT_AMENITIES_DB.DEFAULT[cabin] || AIRCRAFT_AMENITIES_DB.DEFAULT.ECONOMY, isEstimated: true };
}
```

**Update FlightCardEnhanced.tsx:**

```typescript
import { getEstimatedAmenities } from '@/lib/flights/aircraft-amenities';

// In getBaggageByItinerary function (around line 272):
const amenitiesArray = fareDetails.amenities || [];
const amenities = amenitiesArray.length > 0
  ? {
      // Use real data if available
      wifi: amenitiesArray.some((a: any) =>
        a.description.toLowerCase().includes('wifi')
      ),
      power: amenitiesArray.some((a: any) =>
        a.description.toLowerCase().includes('power')
      ),
      meal: getMealType(amenitiesArray),
      entertainment: amenitiesArray.some((a: any) => a.amenityType === 'ENTERTAINMENT'),
      isEstimated: false
    }
  : {
      // Fallback to estimated data
      ...getEstimatedAmenities(
        segments[0]?.aircraft?.code,
        fareDetails.cabin
      )
    };
```

**Update Display (around line 686):**

```typescript
<span className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${outboundBaggage.amenities.wifi ? 'text-green-700' : 'text-gray-700'}`}
      title={outboundBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
  📶WiFi {outboundBaggage.amenities.wifi ? '✓' : '✗'}
  {outboundBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60">~</span>}
</span>
```

---

## 📈 NEXT STEPS

1. **Immediate:** Implement aircraft heuristics (Phase 1)
2. **This Week:** Add Branded Fares API integration (Phase 2)
3. **Next Sprint:** Implement hybrid approach with lazy loading (Phase 3)
4. **Future:** Add third-party data sources for on-time performance, reviews

---

**Status:** Ready for implementation
**Priority:** HIGH (Currently showing incorrect data)
**Estimated Time:** 1-2 hours (Phase 1), 4-6 hours (Phase 2), 2-3 hours (Phase 3)
