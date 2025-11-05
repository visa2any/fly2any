# Hotel ID System Documentation

## Overview

The Fly2Any platform uses two types of hotel IDs to support both real API data and demo/fallback data for development and when APIs are unavailable.

## Hotel ID Types

### 1. Real Hotel IDs (Duffel API)

**Source**: Duffel Stays API
**Format**: Varies (determined by Duffel's system)
**Example**: `acc_0000AGXKiJdZqiOmLVrmTT` (actual Duffel accommodation ID)
**Usage**: Production data when Duffel API is configured and available

**Characteristics**:
- Unique identifiers from Duffel's database
- Can be used to fetch real-time pricing, availability, and booking
- Cached for 30 minutes to reduce API calls
- Requires valid Duffel API credentials

**API Endpoints**:
- Featured Hotels: `/api/hotels/featured-enhanced` (returns real IDs when available)
- Hotel Search: `/api/hotels/search` (returns real IDs)
- Hotel Details: `/api/hotels/[id]` (fetches from Duffel API)

---

### 2. Demo Hotel IDs

**Source**: Generated fallback data
**Format**: `demo-hotel-{city-slug}-{index}`
**Examples**:
- `demo-hotel-new-york-0`
- `demo-hotel-paris-2`
- `demo-hotel-tokyo-5`

**Generation Pattern**:
```typescript
const citySlug = city.toLowerCase().replace(/\s+/g, '-');
const demoId = `demo-hotel-${citySlug}-${index}`;
```

**When Generated**:
- Duffel API returns no results (empty response)
- Duffel API is not configured (missing credentials)
- API request fails or times out
- Development mode without live data

**Characteristics**:
- Deterministic (same city + index = same ID)
- Self-describing (contains city name in slug format)
- Easily identifiable (starts with `demo-hotel-`)
- Generated on-demand from ID alone

---

## Detection Methods

### In API Routes

```typescript
import { isDemoHotelId } from '@/lib/utils/demo-hotels';

if (isDemoHotelId(hotelId)) {
  // Handle as demo hotel
  const demoHotel = generateDemoHotelDetails(hotelId);
  return demoHotel;
} else {
  // Handle as real hotel
  const realHotel = await duffelStaysAPI.getAccommodation(hotelId);
  return realHotel;
}
```

### In React Components

```typescript
const isDemoHotel = hotelId.startsWith('demo-hotel-');

{isDemoHotel && (
  <div className="demo-banner">
    This is sample data for demonstration
  </div>
)}
```

---

## Data Generation

Demo hotels are generated with realistic data including:

### Core Information
- **Name**: `{Prefix} Hotel {City}` (e.g., "Grand Hotel New York")
- **Location**: City, Country, Continent mapping
- **Star Rating**: 3-5 stars based on index
- **Images**: City-appropriate Unsplash photos

### Pricing
- **Base Price**: $120-300 per night (varies by city/index)
- **Discounts**: 15-35% off for select hotels
- **Value Score**: 70-95 (calculated from pricing)

### Social Proof
- **Review Count**: 100-500 reviews
- **Review Rating**: 3.5-5.0 stars
- **Viewers**: 50-450 in last 24h
- **Bookings**: 5-35 in last 24h

### Amenities
- Base: WiFi, Parking, Restaurant
- 4-star: + Gym, Pool, Spa
- 5-star: + Butler, Limousine, Executive Lounge

### Marketing Signals
- Trending status (25% probability)
- Price drop recently (20% probability)
- Demand level (60-95%)
- Available rooms (3-30 rooms)

---

## API Response Structure

### Demo Hotel Response

```json
{
  "data": {
    "id": "demo-hotel-paris-2",
    "name": "Premier Hotel Paris",
    "city": "Paris",
    "country": "France",
    "pricePerNight": 180,
    "originalPrice": 210,
    "valueScore": 87,
    "starRating": 4,
    "reviewRating": 4.6,
    "reviewCount": 342,
    // ... full hotel details
    "_isDemoData": true
  },
  "meta": {
    "lastUpdated": "2025-11-04T16:00:00.000Z",
    "source": "Demo Data",
    "isDemoData": true,
    "message": "This is demo data. Configure real APIs for production use."
  }
}
```

### Real Hotel Response

```json
{
  "data": {
    "id": "acc_0000AGXKiJdZqiOmLVrmTT",
    "name": "Real Hotel Name",
    // ... real hotel data from Duffel
  },
  "meta": {
    "lastUpdated": "2025-11-04T16:00:00.000Z",
    "source": "Duffel Stays"
  }
}
```

---

## Files & Locations

### Utility Functions
**File**: `lib/utils/demo-hotels.ts`

**Key Functions**:
```typescript
// Check if ID is demo format
isDemoHotelId(id: string): boolean

// Parse demo ID to extract city and index
parseDemoHotelId(id: string): { city: string; index: number } | null

// Generate complete hotel details from demo ID
generateDemoHotelDetails(id: string): HotelEnhanced

// Get lightweight summary for listings
getDemoHotelSummary(id: string): Partial<HotelEnhanced>

// Validate demo ID format
validateDemoHotelId(id: string): { valid: boolean; error?: string }
```

### API Routes

**Hotel Details**: `app/api/hotels/[id]/route.ts`
- Line 39-66: Demo hotel handler
- Checks `isDemoHotelId()` before calling Duffel API
- Returns generated demo data with appropriate headers

**Featured Hotels**: `app/api/hotels/featured-enhanced/route.ts`
- Line 222-294: Demo hotel generation
- Generates demo hotels when Duffel returns empty
- Creates IDs in `demo-hotel-{city}-{index}` format

### Frontend Components

**Hotel Details Page**: `app/hotels/[id]/page.tsx`
- Line 16: `isDemoData` state tracking
- Line 40-42: Demo data detection from API response
- Line 149-166: Demo data banner UI

**Hotels Section**: `components/home/HotelsSectionEnhanced.tsx`
- Displays both real and demo hotels seamlessly
- No client-side differentiation needed

---

## Caching Strategy

### Demo Hotel Data
- **TTL**: 1 hour (3600 seconds)
- **Header**: `X-Data-Source: DEMO`
- **Cache-Control**: `public, max-age=3600`
- **Rationale**: Demo data doesn't change, safe to cache longer

### Real Hotel Data
- **TTL**: 30 minutes (1800 seconds)
- **Header**: `X-Cache-Status: HIT/MISS`
- **Cache-Control**: `public, max-age=1800`
- **Rationale**: Pricing and availability can change

---

## Error Handling

### Hotel Not Found (404)

**Real Hotel**:
```
Error: Hotel not found. Please try searching again.
```

**Demo Hotel** (Invalid ID Format):
```
Error: Invalid demo hotel ID format
```

### Server Error (500)

**Message**:
```
Server error. Our team has been notified. Please try again later.
```

**UI Features**:
- Retry button with loading state
- "Go Back" option
- Support contact information

---

## User Experience

### Demo Data Indicators

**Banner on Detail Page**:
```
🛈 Demo Data: This is sample hotel information for demonstration purposes.
Real hotel data will be available when you configure your API credentials.
```

**Browser DevTools**:
- Check `X-Data-Source` header
- Look for `_isDemoData: true` in response body
- Check console logs for `🏨 [DEMO]` prefix

**Console Logging**:
```
🏨 [DEMO] Generating demo hotel details for demo-hotel-paris-2
```

### Seamless Transition

When switching from demo to real data:
1. Configure Duffel API credentials in `.env.local`
2. Restart development server
3. Featured hotels API automatically uses real data
4. Demo IDs are no longer generated
5. All hotel details fetch from Duffel API

**No code changes required** - the system automatically detects and uses real data when available.

---

## Best Practices

### For Developers

1. **Never hardcode demo IDs** in components
2. **Use `isDemoHotelId()` check** in API routes before external calls
3. **Add `_isDemoData` flag** to all generated demo responses
4. **Log demo data generation** with clear prefixes (`[DEMO]`)
5. **Cache demo data longer** than real data (it doesn't change)

### For API Routes

```typescript
// ✅ Good: Check before calling external API
if (isDemoHotelId(hotelId)) {
  return generateDemoHotelDetails(hotelId);
}
return await duffelStaysAPI.getAccommodation(hotelId);

// ❌ Bad: Always call external API
return await duffelStaysAPI.getAccommodation(hotelId); // Fails for demo IDs!
```

### For Frontend

```typescript
// ✅ Good: Check meta flags from API
const isDemoData = response.meta?.isDemoData || response.meta?.source === 'Demo Data';

// ❌ Bad: Parse ID string in frontend
const isDemoData = hotelId.startsWith('demo-hotel-'); // Should be in API
```

---

## Troubleshooting

### Issue: 500 Error when clicking hotel card

**Symptoms**:
- Hotel card displays fine on homepage
- Clicking opens new tab with error
- Console shows "Failed to fetch accommodation"

**Cause**: API route doesn't handle demo IDs

**Solution**:
1. Check `app/api/hotels/[id]/route.ts` has demo handler (line 39-66)
2. Verify `lib/utils/demo-hotels.ts` exists and exports `isDemoHotelId`
3. Restart dev server to reload new code

---

### Issue: Hotel has ID but no details

**Symptoms**:
- Hotel ID exists in database
- API returns 404 "not found"
- ID doesn't match demo pattern

**Cause**: Orphaned ID (generated before but hotel removed from Duffel)

**Solution**:
1. Featured hotels API should refresh periodically
2. Add validation to check ID exists before returning in listings
3. Consider using mock library for consistent demo data

---

### Issue: Demo hotels showing in production

**Symptoms**:
- Production site shows "Demo Data" banner
- Real API configured but demo data appears

**Cause**: Duffel API returning empty results

**Solution**:
1. Check Duffel API credentials are valid in production
2. Verify production environment variables (`DUFFEL_API_KEY`)
3. Check Duffel API status and rate limits
4. Review API logs for actual errors from Duffel

---

## Migration Path

### From Mock Library to Demo System

**Old System** (mock-data/hotels.ts):
- IDs: `miami_hilton_downtown`, `nyc_times_square_marriott`
- Static data, manually maintained
- Separate mock API class

**New System** (demo-hotels.ts):
- IDs: `demo-hotel-miami-0`, `demo-hotel-new-york-1`
- Generated dynamically from ID
- Integrated into main API routes

**Benefits**:
- ✅ No need to maintain static mock data
- ✅ Unlimited hotels (any city supported)
- ✅ Consistent with featured hotels fallback
- ✅ Self-documenting IDs
- ✅ Easy to detect and handle

**Migration Steps**:
1. Keep mock library for search functionality
2. Use demo system for featured hotels
3. Gradually replace mock library with demo generation
4. Eventually remove mock library entirely

---

## Future Enhancements

### Potential Improvements

1. **City-to-MockHotel Mapping**
   - Map demo hotel IDs to rich mock library data where available
   - Fall back to generation for uncovered cities

2. **Demo Data Consistency**
   - Seed RNG with city name for consistent data across sessions
   - Same hotel always shows same price/ratings

3. **User Preferences**
   - Allow users to toggle "demo mode" explicitly
   - Show/hide demo hotels in search results

4. **Admin Dashboard**
   - Monitor demo vs real data usage
   - Track which cities need real API coverage
   - Alert when APIs are returning empty results

---

## Summary

The demo hotel ID system provides a robust fallback when real API data is unavailable, ensuring:

✅ **Zero Downtime**: App works without API credentials
✅ **Development Friendly**: Local dev without API setup
✅ **Production Safe**: Automatic switch to real data when available
✅ **User Transparent**: Clear indicators when viewing demo data
✅ **Maintainable**: Single source of truth for demo generation

**Key Takeaway**: The system seamlessly bridges the gap between demo and production data, providing a smooth experience for developers, users, and operations teams.
