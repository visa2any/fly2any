# Real-Time Baggage Pricing Implementation

## Overview

Successfully implemented real-time baggage pricing from Duffel API for the Fly2Any platform. The system now fetches live baggage options with actual airline pricing, weight limits, and quantity selectors.

## Implementation Summary

### 1. Duffel API Integration (lib/api/duffel.ts)

**Added Methods:**

- `getBaggageOptions(offerId: string)` - Fetches baggage services from Duffel API
  - Extracts baggage from offer.available_services
  - Parses pricing per segment and per passenger
  - Returns standardized format with weight limits and quantity controls

- `getOffer(offerId: string)` - Retrieves complete offer details
  - Fetches up-to-date offer information including available services
  - Used by getBaggageOptions to get current baggage data

**Features:**
- Automatic parsing of baggage metadata (weight, dimensions, quantity limits)
- Support for both checked and carry-on baggage
- Per-segment and per-passenger pricing
- Graceful error handling with fallback to mock data

### 2. Baggage API Route (app/api/flights/ancillaries/baggage/route.ts)

**New Endpoint:** `GET /api/flights/ancillaries/baggage`

**Query Parameters:**
- `offerId` - The Duffel offer ID (required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "srv_00009hj8USM7Ncg31cB123",
      "type": "checked",
      "name": "Checked Bag (23kg)",
      "description": "Standard checked baggage up to 23kg",
      "weight": {
        "value": 23,
        "unit": "kg"
      },
      "price": {
        "amount": "35.00",
        "currency": "USD"
      },
      "quantity": {
        "min": 0,
        "max": 3
      },
      "segmentIds": ["seg_123"],
      "passengerIds": ["pas_456"]
    }
  ],
  "meta": {
    "source": "duffel",
    "offerId": "off_00009hj8USM7Ncg31cBCPN",
    "totalOptions": 3,
    "currency": "USD"
  }
}
```

**Features:**
- Real-time pricing from Duffel API
- Automatic fallback to mock data if API unavailable
- Caching for 5 minutes
- Comprehensive error handling

### 3. Enhanced Ancillary Service (lib/services/ancillary-service.ts)

**Enhanced Methods:**

- `fetchDuffelAncillaries()` - Now calls `fetchDuffelBaggageFromAPI()` when no services in offer
- `fetchDuffelBaggageFromAPI()` - New method that fetches real baggage from Duffel API
  - Transforms Duffel baggage to AncillaryServiceItem format
  - Updates availability tracking
  - Includes weight, quantity, and dimension metadata

**Updated Types:**
- Added `baggage` field to `AncillaryResponse.availability`
- Enhanced `AncillaryServiceItem` with segment and passenger ID tracking

**Features:**
- Real-time baggage fetching for Duffel flights
- Fallback to offer services if direct API fetch fails
- Comprehensive error tracking in response.metadata.errors
- Support for per-segment and per-passenger pricing

### 4. Updated UI Component (components/booking/AddOnsTabs.tsx)

**Enhanced Features:**

**New Props:**
- `weight?: { value: number; unit: string }` - Display weight limits
- `quantity?: { min: number; max: number; selected?: number }` - Quantity controls
- `metadata?.isReal` - Indicates live pricing vs mock data
- `metadata?.perPassenger` - Shows per-passenger pricing info
- `metadata?.perSegment` - Shows per-segment pricing info

**UI Enhancements:**
1. **Quantity Selectors** - For baggage items only
   - Plus/minus buttons to adjust quantity
   - Min/max validation
   - Current quantity display
   - Disabled states when limits reached

2. **Live Price Badge** - Green badge showing "LIVE PRICE" for real data

3. **Weight Display** - Shows weight limits (e.g., "23kg", "32kg")

4. **Pricing Context** - Displays "Per passenger" and "Per segment" information

5. **Enhanced Layout** - Separate rendering logic for baggage vs other add-ons

**Example Baggage Item:**
```tsx
<div className="flex-1 min-w-0">
  <div className="flex items-start justify-between gap-2 mb-2">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span>Checked Bag (23kg)</span>
        <span className="bg-green-100 text-green-700">Live Price</span>
      </div>
      <p>Standard checked baggage up to 23kg - 23kg</p>
      <p>Per passenger</p>
    </div>
    <span>USD 35.00</span>
  </div>

  {/* Quantity Selector */}
  <div className="flex items-center gap-2">
    <button>-</button>
    <span>1</span>
    <button>+</button>
    <span>Max: 3</span>
  </div>
</div>
```

### 5. Main Ancillaries Route Integration (app/api/flights/ancillaries/route.ts)

**Updated:**
- Imported `duffelAPI` for direct baggage fetching
- Added `fetchBaggageOptions()` function that:
  - Checks if flight is from Duffel
  - Fetches real baggage options via Duffel API
  - Falls back to extracted fare details or mock data
  - Returns properly formatted options with metadata

**Metadata Enhancements:**
- `hasRealBaggage` - Indicates if real data was fetched
- Updated `meta.availability.baggage` to show 'real' or 'mock'
- Dynamic note indicating data source

## Integration Flow

```
User Views Booking Page
    ↓
Component calls /api/flights/ancillaries (POST)
    ↓
API checks if Duffel flight
    ↓
    YES → fetchBaggageOptions()
        ↓
        duffelAPI.getBaggageOptions(offerId)
            ↓
            Duffel API: offers.get(offerId)
            ↓
            Extract available_services (type: 'baggage')
            ↓
            Transform to standardized format
            ↓
            Return real pricing with metadata
    ↓
    NO → Extract from fare details or use mock data
    ↓
Response sent to UI with baggage options
    ↓
AddOnsTabs component renders:
    - Quantity selectors
    - Live price badges
    - Weight limits
    - Per-passenger/segment info
```

## Data Flow Example

### Duffel API Response:
```javascript
{
  available_services: [
    {
      id: "srv_00009hj8USM7Ncg31cB123",
      type: "baggage",
      total_amount: "35.00",
      total_currency: "USD",
      metadata: {
        type: "checked",
        maximum_weight_kg: 23,
        minimum_quantity: 0,
        maximum_quantity: 3,
        title: "Checked Bag",
        description: "Standard checked baggage"
      },
      segment_ids: ["seg_123"],
      passenger_ids: ["pas_456"]
    }
  ]
}
```

### Transformed to UI Format:
```javascript
{
  id: "srv_00009hj8USM7Ncg31cB123",
  name: "Checked Bag (23kg)",
  description: "Standard checked baggage",
  price: 35.00,
  currency: "USD",
  weight: { value: 23, unit: "kg" },
  quantity: { min: 0, max: 3, selected: 0 },
  metadata: {
    type: "checked",
    isReal: true,
    perPassenger: true,
    perSegment: true
  }
}
```

## Testing

### Test with Duffel Flight:
1. Search for flights (ensure Duffel API is enabled)
2. Select a Duffel flight
3. Navigate to booking page
4. Check baggage tab in Add-Ons section
5. Verify:
   - "Live Price" badge appears
   - Real pricing displayed
   - Weight limits shown (e.g., 23kg, 32kg)
   - Quantity selectors work (min/max validation)
   - Per-passenger/segment info displayed

### Test Fallback (Mock Data):
1. Disable Duffel API or use Amadeus flight
2. Navigate to booking page
3. Check baggage tab
4. Verify:
   - Mock baggage options displayed
   - No "Live Price" badge
   - Standard mock pricing (USD 35, 55, etc.)
   - Quantity selectors still work

### API Testing:

**Direct Baggage Route:**
```bash
curl "http://localhost:3000/api/flights/ancillaries/baggage?offerId=off_00009hj8USM7Ncg31cBCPN"
```

**Main Ancillaries Route:**
```bash
curl -X POST "http://localhost:3000/api/flights/ancillaries" \
  -H "Content-Type: application/json" \
  -d '{"flightOffer": {"id": "off_123", "source": "Duffel", ...}}'
```

## Error Handling

### Duffel API Unavailable:
- Logs warning to console
- Returns fallback mock data
- Updates metadata to indicate mock source

### Invalid Offer ID:
- Returns 400 error with clear message
- Suggests checking offer ID format

### Network Errors:
- Catches and logs error
- Returns 500 with error details (in development)
- Gracefully falls back to mock data

## Performance Considerations

1. **Caching:** API responses cached for 5 minutes
2. **Parallel Fetching:** Ancillary service uses Promise.allSettled for parallel API calls
3. **Lazy Loading:** Baggage data fetched only when needed
4. **Minimal Re-renders:** Quantity state managed locally in component

## Future Enhancements

1. **Segment-Specific Pricing:** Show different prices per flight segment
2. **Passenger-Specific Pricing:** Show different prices per passenger type (adult, child, infant)
3. **Bundle Discounts:** Integrate with smart bundles for baggage discounts
4. **Seat + Baggage Combo:** Allow selecting seat and baggage together
5. **Baggage Dimensions:** Display allowed dimensions (length x width x height)
6. **Real-Time Availability:** Show remaining baggage slots per flight
7. **Pre-Selected Baggage:** Auto-select based on user profile or previous bookings

## Files Modified

1. ✅ **lib/api/duffel.ts** - Added getBaggageOptions() and getOffer()
2. ✅ **app/api/flights/ancillaries/baggage/route.ts** - New baggage API route
3. ✅ **lib/services/ancillary-service.ts** - Enhanced with real Duffel baggage fetching
4. ✅ **components/booking/AddOnsTabs.tsx** - Updated UI with quantity selectors and live pricing
5. ✅ **app/api/flights/ancillaries/route.ts** - Integrated with Duffel baggage API

## Dependencies

- `@duffel/api` - Duffel SDK for API integration
- `lucide-react` - Icons (Plus, Minus for quantity selectors)
- TypeScript - Type safety for all components

## Environment Variables

```bash
DUFFEL_ACCESS_TOKEN=your_duffel_api_token_here
```

## Success Metrics

- ✅ Real-time baggage pricing from Duffel API
- ✅ Quantity selectors with min/max validation
- ✅ Weight limits displayed (23kg, 32kg, etc.)
- ✅ Per-segment and per-passenger pricing
- ✅ Live price badge for real data
- ✅ Graceful fallback to mock data
- ✅ Type-safe implementation throughout
- ✅ Comprehensive error handling
- ✅ API response caching
- ✅ Loading states for better UX

## Conclusion

The real-time baggage pricing feature is now fully implemented and integrated with the Fly2Any platform. Users can see live airline pricing, select baggage quantities, and view weight limits - all with a smooth, intuitive UI.
