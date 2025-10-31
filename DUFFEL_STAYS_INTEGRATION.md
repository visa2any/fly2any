# Duffel Stays API Integration - Complete Guide

Complete integration of Duffel Stays API for hotel bookings in Fly2Any.

## Overview

**Duffel Stays API** provides access to 1.5M+ hotels worldwide with commission-based pricing.

### Key Benefits

- **1.5M+ Properties**: Global hotel inventory
- **Commission-Based**: Earn on every booking (no upfront costs)
- **Average Revenue**: ~$150 per hotel booking
- **No Search Costs**: First 1500 searches per booking are free
- **Complete API**: Search, quote, book, cancel in one platform

### Pricing Model

- **Commission**: Earn percentage on each booking
- **No Monthly Fees**: Pay only when you earn
- **Search-to-Book Ratio**: 1500:1 free, then $0.005/search
- **Booking Fees**: None (commission-based only)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  (Next.js Pages - To Be Implemented)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ API Calls
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      API Routes                             │
│  /api/hotels/search          - Search hotels                │
│  /api/hotels/[id]            - Hotel details                │
│  /api/hotels/quote           - Create quote                 │
│  /api/hotels/booking/create  - Create booking               │
│  /api/hotels/booking/[id]    - Get booking                  │
│  /api/hotels/booking/[id]/cancel - Cancel booking           │
│  /api/hotels/suggestions     - Location autocomplete        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Function Calls
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  API Client Layer                           │
│  lib/api/duffel-stays.ts                                    │
│  - DuffelStaysAPI class                                     │
│  - All API methods                                          │
│  - Error handling                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP Requests
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  Duffel Stays API                           │
│  https://api.duffel.com/stays/                              │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
fly2any-fresh/
├── lib/
│   ├── api/
│   │   └── duffel-stays.ts          # API client
│   └── hotels/
│       └── types.ts                 # TypeScript types
│
├── app/
│   └── api/
│       └── hotels/
│           ├── search/
│           │   └── route.ts         # POST /api/hotels/search
│           ├── [id]/
│           │   └── route.ts         # GET /api/hotels/[id]
│           ├── quote/
│           │   └── route.ts         # POST /api/hotels/quote
│           ├── suggestions/
│           │   └── route.ts         # GET /api/hotels/suggestions
│           └── booking/
│               ├── create/
│               │   └── route.ts     # POST /api/hotels/booking/create
│               └── [id]/
│                   ├── route.ts     # GET /api/hotels/booking/[id]
│                   └── cancel/
│                       └── route.ts # POST /api/hotels/booking/[id]/cancel
│
└── docs/
    ├── HOTEL_DATABASE_SCHEMA.md     # Database schema
    └── DUFFEL_STAYS_INTEGRATION.md  # This file
```

## API Endpoints

### 1. Search Hotels

**Endpoint**: `POST /api/hotels/search`

**Description**: Search for hotels by location, dates, and filters.

**Request Body**:
```json
{
  "location": {
    "query": "Paris, France"
    // OR
    "lat": 48.8566,
    "lng": 2.3522
  },
  "checkIn": "2024-12-20",
  "checkOut": "2024-12-25",
  "guests": {
    "adults": 2,
    "children": [8, 12]
  },
  "radius": 5,
  "limit": 20,
  "currency": "USD",
  // Optional filters
  "minRating": 4,
  "maxRating": 5,
  "minPrice": 100,
  "maxPrice": 500,
  "amenities": ["wifi", "pool", "parking"],
  "propertyTypes": ["hotel", "resort"]
}
```

**Response**:
```json
{
  "data": [
    {
      "id": "acc_123",
      "name": "Grand Hotel Paris",
      "star_rating": 5,
      "location": {
        "latitude": 48.8566,
        "longitude": 2.3522
      },
      "address": {...},
      "images": [...],
      "amenities": [...],
      "rates": [
        {
          "id": "rate_456",
          "room_type": "Deluxe Room",
          "total_amount": "450.00",
          "total_currency": "USD",
          "cancellation_policy": {...}
        }
      ]
    }
  ],
  "meta": {
    "count": 15,
    "source": "Duffel Stays"
  }
}
```

**Example Usage**:
```typescript
const response = await fetch('/api/hotels/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: { query: 'Paris' },
    checkIn: '2024-12-20',
    checkOut: '2024-12-25',
    guests: { adults: 2, children: [] },
    minRating: 4,
  }),
});

const { data, meta } = await response.json();
console.log(`Found ${meta.count} hotels`);
```

---

### 2. Get Hotel Details

**Endpoint**: `GET /api/hotels/[id]`

**Description**: Fetch detailed information about a specific hotel.

**Response**:
```json
{
  "data": {
    "id": "acc_123",
    "name": "Grand Hotel Paris",
    "description": "Luxury hotel in the heart of Paris...",
    "star_rating": 5,
    "images": [
      {
        "url": "https://...",
        "caption": "Exterior view"
      }
    ],
    "amenities": ["wifi", "pool", "spa", "restaurant"],
    "rates": [...]
  },
  "meta": {
    "lastUpdated": "2024-01-15T10:30:00Z",
    "source": "Duffel Stays"
  }
}
```

**Example Usage**:
```typescript
const response = await fetch('/api/hotels/acc_123');
const { data } = await response.json();
console.log(data.name); // "Grand Hotel Paris"
```

---

### 3. Create Quote

**Endpoint**: `POST /api/hotels/quote`

**Description**: Create a quote to lock in pricing before booking.

**Request Body**:
```json
{
  "rateId": "rate_456",
  "guests": [
    {
      "title": "mr",
      "givenName": "John",
      "familyName": "Smith",
      "type": "adult"
    },
    {
      "title": "ms",
      "givenName": "Jane",
      "familyName": "Smith",
      "type": "adult"
    }
  ]
}
```

**Response**:
```json
{
  "data": {
    "id": "quo_789",
    "total_amount": "450.00",
    "total_currency": "USD",
    "expires_at": "2024-01-15T11:00:00Z",
    "cancellation_policy": {...}
  },
  "meta": {
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Example Usage**:
```typescript
const response = await fetch('/api/hotels/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rateId: 'rate_456',
    guests: [
      {
        title: 'mr',
        givenName: 'John',
        familyName: 'Smith',
        type: 'adult',
      },
    ],
  }),
});

const { data } = await response.json();
console.log(`Quote expires at ${data.expires_at}`);
```

---

### 4. Create Booking

**Endpoint**: `POST /api/hotels/booking/create`

**Description**: Complete a hotel booking (REVENUE-GENERATING).

**Request Body**:
```json
{
  "quoteId": "quo_789",
  "payment": {
    "type": "card",
    "amount": "450.00",
    "currency": "USD",
    "card": {
      "number": "4242424242424242",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "cvc": "123",
      "holderName": "John Smith"
    }
  },
  "guests": [
    {
      "title": "mr",
      "givenName": "John",
      "familyName": "Smith",
      "type": "adult"
    }
  ],
  "email": "john@example.com",
  "phoneNumber": "+12125551234"
}
```

**Response**:
```json
{
  "data": {
    "id": "bok_abc",
    "reference": "ABC123", // Confirmation number
    "status": "confirmed",
    "hotel": {...},
    "guests": [...],
    "total_amount": "450.00"
  },
  "meta": {
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

**Example Usage**:
```typescript
const response = await fetch('/api/hotels/booking/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quoteId: 'quo_789',
    payment: {
      type: 'balance', // Or 'card'
      amount: '450.00',
      currency: 'USD',
    },
    guests: [...],
    email: 'john@example.com',
    phoneNumber: '+12125551234',
  }),
});

const { data } = await response.json();
console.log(`Booking confirmed: ${data.reference}`);
```

---

### 5. Get Booking Details

**Endpoint**: `GET /api/hotels/booking/[id]`

**Description**: Retrieve booking information by ID.

**Response**:
```json
{
  "data": {
    "id": "bok_abc",
    "reference": "ABC123",
    "status": "confirmed",
    "hotel": {...},
    "check_in": "2024-12-20",
    "check_out": "2024-12-25",
    "guests": [...]
  },
  "meta": {
    "retrievedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### 6. Cancel Booking

**Endpoint**: `POST /api/hotels/booking/[id]/cancel`

**Description**: Request cancellation of a hotel booking.

**Request Body** (optional):
```json
{
  "reason": "Change of plans"
}
```

**Response**:
```json
{
  "data": {
    "id": "can_xyz",
    "refund_amount": "450.00",
    "refund_currency": "USD",
    "status": "confirmed"
  },
  "meta": {
    "cancelledAt": "2024-01-15T11:05:00Z",
    "reason": "Change of plans"
  }
}
```

---

### 7. Location Suggestions

**Endpoint**: `GET /api/hotels/suggestions?query=Paris`

**Description**: Autocomplete for hotel search locations.

**Response**:
```json
{
  "data": [
    {
      "id": "loc_123",
      "name": "Paris",
      "city": "Paris",
      "country": "France",
      "location": {
        "lat": 48.8566,
        "lng": 2.3522
      },
      "type": "city"
    }
  ],
  "meta": {
    "count": 1
  }
}
```

---

## Implementation Guide

### Step 1: Environment Setup

Add to `.env.local`:
```bash
# Duffel Stays API (same token as Duffel Flights)
DUFFEL_ACCESS_TOKEN=duffel_test_your_token_here
```

### Step 2: Test API Client

```typescript
import { duffelStaysAPI } from '@/lib/api/duffel-stays';

// Check if initialized
console.log(duffelStaysAPI.isAvailable()); // true/false

// Search hotels
const results = await duffelStaysAPI.searchAccommodations({
  location: { query: 'New York' },
  checkIn: '2024-12-20',
  checkOut: '2024-12-25',
  guests: { adults: 2, children: [] },
});

console.log(`Found ${results.meta.count} hotels`);
```

### Step 3: Database Setup

Run the SQL schema from `HOTEL_DATABASE_SCHEMA.md`:

```bash
# Connect to your database
psql -h your-db-host -U your-user -d your-database

# Run schema
\i HOTEL_DATABASE_SCHEMA.md
```

### Step 4: Implement Frontend (Next Steps)

Create hotel search and booking UI:

```typescript
// Example: app/hotels/search/page.tsx
'use client';

import { useState } from 'react';

export default function HotelSearchPage() {
  const [results, setResults] = useState([]);

  async function handleSearch(params) {
    const response = await fetch('/api/hotels/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    setResults(data.data);
  }

  return (
    <div>
      <HotelSearchForm onSearch={handleSearch} />
      <HotelResults results={results} />
    </div>
  );
}
```

---

## Error Handling

All API routes return standardized error responses:

```json
{
  "error": "Error message",
  "message": "User-friendly description",
  "code": "ERROR_CODE",
  "details": "Stack trace (dev only)"
}
```

### Common Error Codes

| Code | Description | HTTP Status | Solution |
|------|-------------|-------------|----------|
| `RATE_NOT_AVAILABLE` | Hotel rate no longer available | 409 | Search again |
| `PRICE_CHANGED` | Price changed since search | 409 | Review new price |
| `QUOTE_EXPIRED` | Quote expired (>15-30 min) | 409 | Create new quote |
| `PAYMENT_FAILED` | Payment declined | 402 | Check payment details |
| `NOT_AVAILABLE` | Room sold out | 409 | Choose different room |
| `NOT_CANCELLABLE` | Non-refundable booking | 409 | Contact support |
| `ALREADY_CANCELLED` | Already cancelled | 409 | No action needed |

---

## Caching Strategy

All endpoints implement intelligent caching:

| Endpoint | Cache TTL | Cache Type | Invalidation |
|----------|-----------|------------|--------------|
| `/api/hotels/search` | 15 minutes | Redis | Time-based |
| `/api/hotels/[id]` | 30 minutes | Redis | Time-based |
| `/api/hotels/suggestions` | 1 hour | Redis | Time-based |
| `/api/hotels/booking/[id]` | 5 minutes | Redis | On update/cancel |

---

## Revenue Tracking

Track commission revenue from hotel bookings:

```sql
-- Total commission this month
SELECT
  SUM(commission_amount) / 100.0 AS total_commission_usd,
  COUNT(*) AS bookings
FROM hotel_commission_records
WHERE status = 'paid'
  AND DATE_TRUNC('month', earned_at) = DATE_TRUNC('month', CURRENT_DATE);

-- Commission by destination
SELECT
  hotel_city,
  hotel_country,
  COUNT(*) AS bookings,
  SUM(commission_amount) / 100.0 AS commission
FROM hotel_commission_records
WHERE status = 'paid'
GROUP BY hotel_city, hotel_country
ORDER BY commission DESC;
```

---

## Testing

### Manual Testing

```bash
# Search hotels
curl -X POST http://localhost:3000/api/hotels/search \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"query": "Paris"},
    "checkIn": "2024-12-20",
    "checkOut": "2024-12-25",
    "guests": {"adults": 2, "children": []}
  }'

# Get hotel details
curl http://localhost:3000/api/hotels/acc_123

# Location suggestions
curl "http://localhost:3000/api/hotels/suggestions?query=Paris"
```

### Integration Tests

Create `tests/hotels.test.ts`:

```typescript
import { duffelStaysAPI } from '@/lib/api/duffel-stays';

describe('Duffel Stays API', () => {
  it('should search hotels', async () => {
    const results = await duffelStaysAPI.searchAccommodations({
      location: { query: 'New York' },
      checkIn: '2024-12-20',
      checkOut: '2024-12-25',
      guests: { adults: 2, children: [] },
    });

    expect(results.data.length).toBeGreaterThan(0);
  });
});
```

---

## Production Checklist

- [ ] Environment variables set (production Duffel token)
- [ ] Database schema deployed
- [ ] Payment processing integrated (Stripe)
- [ ] Email notifications configured
- [ ] Commission tracking active
- [ ] Error monitoring (Sentry/LogRocket)
- [ ] Analytics tracking (GA4)
- [ ] Rate limiting configured
- [ ] SSL/TLS enabled
- [ ] Webhook handlers for booking updates
- [ ] Customer support integration
- [ ] Legal: Terms of Service, Privacy Policy
- [ ] PCI compliance for card payments

---

## Support & Documentation

- **Duffel API Docs**: https://duffel.com/docs/api/stays
- **Dashboard**: https://app.duffel.com
- **Support**: support@duffel.com
- **Status Page**: https://status.duffel.com

---

## Next Steps

1. **Frontend Implementation**: Create hotel search and booking UI
2. **Payment Integration**: Connect Stripe for card processing
3. **Email Notifications**: Send booking confirmations
4. **Admin Dashboard**: Manage bookings and track revenue
5. **Flight+Hotel Bundles**: Implement package deals
6. **Mobile App**: Extend to mobile platforms
7. **Analytics**: Track conversion rates and optimize
8. **A/B Testing**: Optimize pricing and presentation

---

## Revenue Projections

Based on average commission of ~$150 per booking:

| Bookings/Month | Monthly Revenue | Annual Revenue |
|----------------|-----------------|----------------|
| 10 | $1,500 | $18,000 |
| 50 | $7,500 | $90,000 |
| 100 | $15,000 | $180,000 |
| 500 | $75,000 | $900,000 |
| 1,000 | $150,000 | $1,800,000 |

**Target**: Start with 10-50 bookings/month, scale to 500+ over 12 months.

---

## Questions?

Contact the development team or refer to:
- `lib/api/duffel-stays.ts` - API client implementation
- `lib/hotels/types.ts` - TypeScript type definitions
- `HOTEL_DATABASE_SCHEMA.md` - Database schema
