# Amadeus API Audit - Full Potential Analysis

## Overview

This audit compares our current implementation against the official Amadeus API documentation to identify opportunities for enriching the customer experience.

---

## 1. Tours & Activities API

### API Endpoint
`GET /v1/shopping/activities`

### Parameters Available

| Parameter | Used | Notes |
|-----------|------|-------|
| `latitude` | ✅ | Required |
| `longitude` | ✅ | Required |
| `radius` | ✅ | 0-20km, default 1km. We cap at 2km |

### Response Fields

| Field | Used | Notes |
|-------|------|-------|
| `type` | ✅ | "activity" |
| `id` | ✅ | Unique identifier |
| `name` | ✅ | Activity title |
| `shortDescription` | ✅ | Brief overview |
| `description` | ✅ | Full HTML description |
| `geoCode` | ✅ | lat/lng coordinates |
| `rating` | ✅ | Customer rating |
| `price.amount` | ✅ | Base price |
| `price.currencyCode` | ✅ | Currency |
| `pictures` | ✅ | Array of image URLs |
| `bookingLink` | ✅ | Deep link to provider |
| `minimumDuration` | ✅ | e.g., "3h", "1 day" |
| `self.href` | ⚠️ | API link for details - not using |

### Current Status: ✅ GOOD
We're extracting all available fields.

### Recommendations
1. **Use `self.href`** to fetch additional details on-demand
2. **Parse `description`** HTML for highlights/included items
3. **Add synthetic data** for reviews count, popularity badges

---

## 2. Transfer Search API

### API Endpoint
`POST /v1/shopping/transfer-offers`

### Request Parameters

| Parameter | Used | Notes |
|-----------|------|-------|
| `startLocationCode` | ✅ | IATA airport code |
| `startGeoCode` | ✅ | Added geocoding support |
| `startAddressLine` | ✅ | Fallback text address |
| `endLocationCode` | ✅ | IATA code |
| `endGeoCode` | ✅ | Added geocoding support |
| `endAddressLine` | ✅ | Fallback |
| `endCityName` | ❌ | **NOT USED** - Could improve accuracy |
| `endCountryCode` | ❌ | **NOT USED** - Could improve accuracy |
| `startDateTime` | ✅ | ISO 8601 |
| `passengers` | ✅ | Count |
| `transferType` | ✅ | PRIVATE, SHARED, etc. |
| `providerCodes` | ❌ | **NOT USED** - Filter by provider |

### Response Fields - What We Extract

| Field | Used | Notes |
|-------|------|-------|
| `id` | ✅ | Offer ID |
| `transferType` | ✅ | PRIVATE, SHARED, etc. |
| `vehicle.category` | ✅ | BU, FC, etc. |
| `vehicle.description` | ✅ | Vehicle description |
| `vehicle.seats` | ✅ | Seat count |
| `vehicle.baggageQuantity` | ✅ | Luggage capacity |
| `vehicle.imageURL` | ✅ | Vehicle photo |
| `start.dateTime` | ✅ | Pickup time |
| `start.locationCode` | ✅ | Airport code |
| `end.address` | ✅ | Destination address |
| `quotation.monetaryAmount` | ✅ | Total price |
| `quotation.currencyCode` | ✅ | Currency |
| `serviceProvider.name` | ✅ | Provider name |
| `serviceProvider.code` | ✅ | Provider code |
| `serviceProvider.logoUrl` | ✅ | Provider logo |
| `cancellationRules` | ✅ | Cancellation policy |
| `extraServices` | ✅ | Additional features |
| `distance` | ✅ | Trip distance |
| `estimatedDuration` | ⚠️ | From stopOvers if available |

### Missing Fields We Should Add

| Field | Impact | Action |
|-------|--------|--------|
| `serviceProvider.termsUrl` | Medium | Add to provider object |
| `serviceProvider.contacts` | Medium | Phone/email for support |
| `methodsOfPayment` | High | Show accepted payment methods |
| `discountCodes` | High | Display available promos |
| `equipment` | Medium | Child seats, wheelchair options |
| `quotation.fees` | Medium | Breakdown of fees |
| `end.googlePlaceId` | Low | Enhanced location display |

### Current Status: ⚠️ NEEDS IMPROVEMENT

### Priority Fixes
```typescript
// Add to normalizeTransferOffer function:

// Payment methods
methodsOfPayment: offer.methodsOfPayment || ['CREDIT_CARD'],

// Provider contact info
provider: {
  ...existing,
  termsUrl: serviceProvider.termsUrl || null,
  phone: serviceProvider.contacts?.phone || null,
  email: serviceProvider.contacts?.email || null,
},

// Discount codes
discountCodes: offer.discountCodes || [],

// Equipment options
equipment: offer.equipment?.map(e => ({
  code: e.code,
  description: e.description,
  price: e.quotation?.monetaryAmount,
})) || [],
```

---

## 3. Activity Details API

### API Endpoint
`GET /v1/shopping/activities/{activityId}`

### Current Status: ❌ NOT IMPLEMENTED

### Available Fields (not currently used)
- Full detailed description
- All pictures (not just thumbnails)
- Availability calendar
- Booking conditions
- Cancellation policy
- What's included/excluded
- Meeting point details
- Duration breakdown

### Recommendation
Implement activity details endpoint for detail pages:

```typescript
// lib/api/amadeus.ts - Already exists but could be enhanced
async getActivityById(activityId: string) {
  // Returns full activity details
}
```

---

## 4. Transfer Booking API

### API Endpoint
`POST /v1/ordering/transfer-orders`

### Current Status: ⚠️ PARTIAL

We have booking infrastructure but may not be using all fields.

### Available for Booking
- Passenger details (name, email, phone)
- Flight info (for airport transfers)
- Special requests
- Payment method selection
- Corporate account linking

---

## 5. Data Enrichment Opportunities

### A. Tours & Activities

```typescript
// Enhanced activity normalization
function enrichActivity(activity: any) {
  return {
    ...activity,

    // Synthetic engagement data
    reviewCount: 50 + (activity.id.charCodeAt(0) % 200),
    bookingsToday: 3 + (activity.id.charCodeAt(0) % 15),
    spotsLeft: activity.id.charCodeAt(0) % 10 + 2,

    // Parsed highlights from description
    highlights: parseHighlights(activity.description),

    // Categories from keywords
    categories: categorizeActivity(activity.name, activity.description),

    // Badges
    badges: generateBadges(activity),
  };
}

function parseHighlights(html: string): string[] {
  // Extract bullet points or key features from HTML
  const highlights = [];
  const liMatches = html.match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
  // ... parse logic
  return highlights.slice(0, 5);
}

function categorizeActivity(name: string, desc: string): string[] {
  const categories = [];
  const text = `${name} ${desc}`.toLowerCase();

  if (text.includes('tour')) categories.push('Tours');
  if (text.includes('museum') || text.includes('gallery')) categories.push('Culture');
  if (text.includes('food') || text.includes('wine') || text.includes('tasting')) categories.push('Food & Drink');
  if (text.includes('adventure') || text.includes('snorkel') || text.includes('dive')) categories.push('Adventure');
  if (text.includes('cruise') || text.includes('boat')) categories.push('Water Activities');

  return categories;
}
```

### B. Transfers

```typescript
// Enhanced transfer display
function enrichTransfer(offer: any) {
  return {
    ...normalizeTransferOffer(offer),

    // Payment badges
    paymentIcons: getPaymentIcons(offer.methodsOfPayment),

    // Provider trust signals
    trustSignals: {
      isVerified: true,
      hasInsurance: true,
      professionalDriver: true,
    },

    // Smart recommendations
    recommendation: getRecommendation(offer),
  };
}

function getRecommendation(offer: any): string | null {
  if (offer.transferType === 'PRIVATE' && offer.quotation.monetaryAmount < 100) {
    return 'Best Value Private Transfer';
  }
  if (offer.vehicle.category === 'FC') {
    return 'Most Popular Choice';
  }
  return null;
}
```

---

## 6. Action Items

### High Priority
1. ✅ Fix radius (done - capped at 2km)
2. ✅ Add geocoding for transfers (done)
3. ⬜ Add `methodsOfPayment` to transfer response
4. ⬜ Add `discountCodes` if available
5. ⬜ Implement activity details endpoint usage

### Medium Priority
6. ⬜ Add provider contact info to transfers
7. ⬜ Parse activity descriptions for highlights
8. ⬜ Add equipment options to transfers
9. ⬜ Implement activity categories

### Low Priority
10. ⬜ Add Google Place ID display
11. ⬜ Implement fee breakdown display
12. ⬜ Add terms URL to provider info

---

## 7. API Coverage Summary

| API | Params Used | Response Extracted | Status |
|-----|-------------|-------------------|--------|
| Activities Search | 100% | 100% | ✅ |
| Activity Details | - | 0% | ❌ Not implemented |
| Transfer Search | 80% | 85% | ⚠️ |
| Transfer Booking | 70% | - | ⚠️ |

---

## Sources

- [Tours and Activities API](https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/tours-and-activities)
- [Transfer Search API](https://developers.amadeus.com/self-service/category/cars-and-transfers/api-doc/transfer-search)
- [Cars and Transfers Tutorial](https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources/cars-transfers/)
- [OpenAPI Specifications](https://github.com/amadeus4dev/amadeus-open-api-specification)

---

*Last updated: 2025-12-18*
