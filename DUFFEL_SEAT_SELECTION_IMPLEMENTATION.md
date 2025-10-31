# Duffel Seat Selection Implementation - Complete

## Overview
Successfully implemented complete Duffel seat selection capability for the Fly2Any platform with dual-source support (Amadeus + Duffel), unified data format, and seamless UI integration.

## Implementation Summary

### 1. Duffel API Integration (lib/api/duffel.ts)

**Added Methods:**
- `getSeatMaps(offerId: string)` - Fetches seat maps from Duffel API
- `convertDuffelSeatMap(duffelSeatMap)` - Converts Duffel format to Amadeus-compatible format
- `extractDuffelSeatCharacteristics(element)` - Maps Duffel seat features to standard codes
- `calculateSeatLayout(seatRows)` - Determines cabin layout (e.g., "3-3", "2-4-2")

**Key Features:**
- Automatic format conversion from Duffel to Amadeus-compatible structure
- Seat characteristics mapping (window, aisle, legroom, power outlets)
- Pricing extraction per seat from available_services
- Error handling with graceful degradation
- Returns standardized format compatible with existing UI

**Location:** `C:\Users\Power\fly2any-fresh\lib\api\duffel.ts`

---

### 2. Duffel Seat Map API Route

**New File:** `app/api/flights/seat-map/duffel/route.ts`

**Endpoints:**
- `POST /api/flights/seat-map/duffel` - Fetch Duffel seat maps
- `GET /api/flights/seat-map/duffel?offerId=xxx` - Test endpoint

**Features:**
- Validates Duffel API availability
- Returns standardized seat map format
- Graceful error handling (returns 200 with error flag for frontend fallback)
- Comprehensive logging for debugging

**Request Format:**
```json
{
  "offerId": "off_123456789"
}
```

**Response Format:**
```json
{
  "success": true,
  "seatMap": {
    "data": [...],
    "meta": {
      "hasRealData": true,
      "source": "Duffel",
      "count": 1
    }
  }
}
```

**Location:** `C:\Users\Power\fly2any-fresh\app\api\flights\seat-map\duffel\route.ts`

---

### 3. Enhanced Ancillary Service (lib/services/ancillary-service.ts)

**New Methods:**
- `fetchDuffelSeatMaps()` - Fetches and integrates Duffel seat maps
- `convertDuffelSeatMapToUnified()` - Converts to unified SeatMap format
- `convertDuffelSeats()` - Transforms individual seat data

**Integration Points:**
- Automatically called when fetching Duffel ancillaries
- Extracts individual seat pricing into ancillary services
- Populates response.seatMaps[] with unified format
- Updates availability status for seat category

**Enhanced Features:**
- Unified SeatMap interface supports both Amadeus and Duffel
- Individual seat services extracted with pricing
- Extra legroom seats categorized separately
- Source tracking (amadeus/duffel) for each seat map

**Location:** `C:\Users\Power\fly2any-fresh\lib\services\ancillary-service.ts`

---

### 4. Universal Seat Map Route (app/api/flights/seat-map/route.ts)

**Enhanced with Source Detection:**
- Automatically detects flight source (Amadeus or Duffel)
- Routes to appropriate API based on `flightOffer.source`
- Intelligent fallback: Duffel → Amadeus if unavailable
- Returns unified format regardless of source

**Flow:**
```
Flight Offer (with source)
  → Detect source
  → Route to Duffel or Amadeus API
  → Convert to unified format
  → Return to frontend
```

**Response includes:**
- Standardized seat map data
- Source indicator (Amadeus/Duffel)
- Success/error flags
- Metadata for debugging

**Location:** `C:\Users\Power\fly2any-fresh\app\api\flights\seat-map\route.ts`

---

### 5. UI Components - Dual Source Support

#### SeatMapModal.tsx
**Enhanced:**
- Added visual source indicator badge (Amadeus/Duffel)
- No structural changes needed (unified format works seamlessly)
- Displays API source in seat map header

**Location:** `C:\Users\Power\fly2any-fresh\components\flights\SeatMapModal.tsx`

#### seat-map-parser.ts
**Enhanced:**
- Added `source?: 'amadeus' | 'duffel'` to ParsedSeatMap interface
- Preserves source information through parsing pipeline
- Works with both Amadeus and Duffel formats (unified conversion)

**Location:** `C:\Users\Power\fly2any-fresh\lib\flights\seat-map-parser.ts`

---

### 6. Booking Flow Integration

**Already Integrated:**
The booking flow at `app/flights/booking-optimized/page.tsx` already supports seat selection:

- Step 1: Add-ons section includes seat selection
- `handleViewSeatMap()` calls `/api/flights/seat-map` (now dual-source)
- `handleSelectSeat()` stores selected seat with metadata
- Seat selection passed to booking API with ancillary data

**No Changes Required** - The existing flow works seamlessly with both Amadeus and Duffel seat maps due to unified format.

**Location:** `C:\Users\Power\fly2any-fresh\app\flights\booking-optimized\page.tsx`

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Booking Flow                    │
│                  (booking-optimized/page.tsx)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Universal Seat Map API Route                    │
│              /api/flights/seat-map/route.ts                  │
│                                                              │
│  1. Detect source (Amadeus/Duffel)                          │
│  2. Route to appropriate API                                 │
│  3. Fallback logic if unavailable                           │
└──────────────┬───────────────────────┬──────────────────────┘
               │                       │
      source === 'Duffel'    source === 'Amadeus'
               │                       │
               ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   duffelAPI.getSeatMaps  │  │  amadeusAPI.getSeatMap   │
│   (lib/api/duffel.ts)    │  │  (lib/api/amadeus.ts)    │
│                          │  │                          │
│  - Fetch from Duffel API │  │  - Fetch from Amadeus   │
│  - Convert to unified    │  │  - Already unified      │
│    format                │  │    format               │
└──────────────┬───────────┘  └──────────┬───────────────┘
               │                          │
               └──────────┬───────────────┘
                          ▼
               ┌─────────────────────────┐
               │   Unified Seat Map      │
               │   Format (Amadeus-like) │
               └──────────┬──────────────┘
                          ▼
               ┌─────────────────────────┐
               │  parseSeatMap()         │
               │  (seat-map-parser.ts)   │
               │                         │
               │  - Parse decks/rows     │
               │  - Calculate pricing    │
               │  - Find best seats      │
               │  - Preserve source      │
               └──────────┬──────────────┘
                          ▼
               ┌─────────────────────────┐
               │   ParsedSeatMap         │
               │   (with source badge)   │
               └──────────┬──────────────┘
                          ▼
               ┌─────────────────────────┐
               │   SeatMapModal.tsx      │
               │   - Display seat map    │
               │   - Show source badge   │
               │   - Handle selection    │
               └─────────────────────────┘
```

---

## TypeScript Interfaces

### Unified SeatMap Format
```typescript
interface SeatMap {
  segmentId: string;
  aircraftCode?: string;
  cabins: Array<{
    cabin: string;
    rows: Array<{
      rowNumber: number;
      seats: SeatInfo[];
    }>;
  }>;
  source: 'amadeus' | 'duffel';
}

interface SeatInfo {
  id: string;
  number: string;
  characteristics: string[];
  available: boolean;
  price?: {
    amount: string;
    currency: string;
    formattedAmount: string;
    perPassenger: boolean;
    perSegment: boolean;
  };
  deck?: string;
  row: number;
  column: string;
}
```

### ParsedSeatMap (UI Ready)
```typescript
interface ParsedSeatMap {
  decks: SeatMapDeck[];
  hasRealData: boolean;
  averagePrice: number | null;
  cheapestSeat: Seat | null;
  priceRange: { min: number; max: number; } | null;
  aircraftCode: string;
  cabinClass: string;
  totalSeats: number;
  availableSeats: number;
  recommendedSeat: Seat | null;
  source?: 'amadeus' | 'duffel';
}
```

---

## Testing Guide

### 1. Test Duffel Seat Map API

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/flights/seat-map/duffel \
  -H "Content-Type: application/json" \
  -d '{"offerId": "off_YOUR_DUFFEL_OFFER_ID"}'
```

**Expected Response:**
```json
{
  "success": true,
  "seatMap": {
    "data": [{
      "segmentId": "seg_123",
      "decks": [...]
    }],
    "meta": {
      "hasRealData": true,
      "source": "Duffel"
    }
  }
}
```

### 2. Test Universal Seat Map Route

**For Duffel Flight:**
```bash
curl -X POST http://localhost:3000/api/flights/seat-map \
  -H "Content-Type: application/json" \
  -d '{
    "flightOffer": {
      "id": "off_YOUR_DUFFEL_OFFER_ID",
      "source": "Duffel"
    }
  }'
```

**For Amadeus Flight:**
```bash
curl -X POST http://localhost:3000/api/flights/seat-map \
  -H "Content-Type: application/json" \
  -d '{
    "flightOffer": {
      "id": "YOUR_AMADEUS_OFFER_ID",
      "source": "Amadeus"
    }
  }'
```

### 3. Test Ancillary Service Integration

**In Browser Console:**
```javascript
// Fetch ancillaries for a Duffel flight (includes seats)
fetch('/api/flights/ancillaries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    flightOffer: {
      id: 'off_YOUR_DUFFEL_OFFER_ID',
      source: 'Duffel',
      available_services: [...]
    },
    passengerCount: 1
  })
})
.then(r => r.json())
.then(data => {
  console.log('Ancillaries:', data);
  console.log('Seat Maps:', data.data.seatMaps);
  console.log('Seat Services:', data.data.services.filter(s => s.source === 'duffel'));
});
```

### 4. Test in Booking Flow

1. Search for flights (mix of Amadeus and Duffel)
2. Select a Duffel flight
3. Click "Book Now"
4. In Step 1, navigate to "SEATS" tab
5. Click "View Seat Map" button
6. Verify:
   - Seat map displays correctly
   - Source badge shows "Duffel"
   - Seat pricing is accurate
   - Selection works
   - Confirmation saves seat data

---

## Error Handling

### Graceful Degradation Flow

1. **Duffel API Unavailable**
   ```
   Duffel Request → API Down → Fallback to Amadeus → Success/Fail
   ```

2. **No Seat Map Available**
   ```
   API Request → Empty Response → Return hasRealData: false → UI shows "No seat map available"
   ```

3. **API Error**
   ```
   API Request → Error → Log error → Return 200 with error flag → UI handles gracefully
   ```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message here",
  "data": [],
  "meta": {
    "hasRealData": false,
    "source": "Duffel"
  }
}
```

---

## Key Features

### ✅ Dual API Support
- Seamlessly supports both Amadeus and Duffel
- Automatic source detection
- Intelligent fallback mechanism

### ✅ Unified Data Format
- Single ParsedSeatMap interface for all sources
- Consistent seat data structure
- Source tracking throughout pipeline

### ✅ Real-Time Pricing
- Extracts seat pricing from Duffel's available_services
- Per-seat, per-passenger, per-segment pricing
- Formatted display prices

### ✅ Enhanced UI
- Visual source indicator
- No changes to existing modal design
- Backward compatible with Amadeus

### ✅ Booking Integration
- Seats included in ancillary services
- Selected seats stored with booking
- Full metadata preserved

### ✅ Error Handling
- Graceful degradation
- Comprehensive logging
- User-friendly error messages

---

## Files Modified/Created

### Created Files:
1. `app/api/flights/seat-map/duffel/route.ts` - Duffel-specific seat map API
2. `DUFFEL_SEAT_SELECTION_IMPLEMENTATION.md` - This documentation

### Modified Files:
1. `lib/api/duffel.ts` - Added getSeatMaps() and conversion methods
2. `lib/services/ancillary-service.ts` - Added Duffel seat map fetching
3. `app/api/flights/seat-map/route.ts` - Added source detection and routing
4. `components/flights/SeatMapModal.tsx` - Added source badge display
5. `lib/flights/seat-map-parser.ts` - Added source field to ParsedSeatMap

---

## Performance Considerations

### Caching Strategy
- Duffel seat maps are fetched on-demand
- Results cached in ancillary service response
- No additional API calls for seat selection

### Load Time
- Parallel fetching of ancillaries and seat maps
- Async/await pattern for non-blocking operations
- Fallback prevents cascading delays

### API Rate Limits
- Duffel seat maps: Part of standard API quota
- Amadeus seat maps: Within existing limits
- Error handling prevents retry storms

---

## Future Enhancements

### Potential Improvements:
1. **Seat Map Caching** - Redis/memory cache for frequently accessed routes
2. **Real-Time Updates** - WebSocket for seat availability changes
3. **Advanced Filters** - Filter by price, legroom, window/aisle
4. **3D Seat Visualization** - Interactive 3D cabin view
5. **Seat Recommendations** - ML-based best seat suggestions
6. **Multi-Passenger Selection** - Select seats for multiple passengers at once

---

## Environment Variables

Required for Duffel seat map functionality:

```env
# Duffel API (already configured)
DUFFEL_ACCESS_TOKEN=duffel_test_your_token_here

# Amadeus API (existing)
AMADEUS_API_KEY=your_key_here
AMADEUS_API_SECRET=your_secret_here
```

---

## API Documentation References

### Duffel Seat Maps API
- Endpoint: `GET /seat_maps`
- Docs: https://duffel.com/docs/api/seat-maps
- Rate Limit: Part of standard API quota
- Response: Cabin layout with seat availability and pricing

### Amadeus Seat Maps API
- Endpoint: `POST /shopping/seatmaps`
- Docs: https://developers.amadeus.com/self-service/category/air/api-doc/seatmap-display
- Rate Limit: 10 calls/second
- Response: Detailed seat map with pricing

---

## Conclusion

The Duffel seat selection implementation is **complete and production-ready**. The system now supports:

- ✅ Duffel seat map fetching via API
- ✅ Unified data format across APIs
- ✅ Automatic source detection and routing
- ✅ Enhanced ancillary service with seat pricing
- ✅ UI components with source indicators
- ✅ Full booking flow integration
- ✅ Comprehensive error handling
- ✅ Backward compatibility with Amadeus

All components work seamlessly together, providing a unified seat selection experience regardless of the underlying API source.

---

**Implementation Date:** 2025-10-28
**Version:** 1.0.0
**Status:** Production Ready
