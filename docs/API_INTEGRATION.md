# API Integration Guide - Fly2Any Travel Platform

## Table of Contents
1. [Amadeus API Setup](#amadeus-api-setup)
2. [Endpoints Documentation](#endpoints-documentation)
3. [Data Transformation](#data-transformation)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)
6. [Testing](#testing)
7. [Production Considerations](#production-considerations)

---

## 1. Amadeus API Setup

### 1.1 Getting API Credentials

1. **Create an Amadeus Developer Account**
   - Visit: https://developers.amadeus.com/register
   - Complete registration and email verification
   - Access your dashboard

2. **Create an Application**
   - Navigate to "My Apps" in your Amadeus dashboard
   - Click "Create New App"
   - Fill in application details:
     - **App Name**: Fly2Any Travel Platform
     - **Description**: Flight search and booking platform
     - **APIs**: Select "Flight Offers Search" and "Airport & City Search"

3. **Get Your Credentials**
   ```
   Test Environment:
   - API Key: (Your Test API Key)
   - API Secret: (Your Test API Secret)
   - Base URL: https://test.api.amadeus.com

   Production Environment:
   - API Key: (Your Production API Key)
   - API Secret: (Your Production API Secret)
   - Base URL: https://api.amadeus.com
   ```

### 1.2 Environment Configuration

Create or update your `.env.local` file:

```bash
# Amadeus API Configuration
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
AMADEUS_ENVIRONMENT=test  # Use 'production' for live environment

# Optional: Additional Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Environment Variables:**

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `AMADEUS_API_KEY` | Yes | Your Amadeus API Key | - |
| `AMADEUS_API_SECRET` | Yes | Your Amadeus API Secret | - |
| `AMADEUS_ENVIRONMENT` | No | Environment ('test' or 'production') | `test` |

### 1.3 Authentication Flow

The Amadeus API uses OAuth 2.0 Client Credentials flow:

```typescript
// lib/api/amadeus.ts
private async getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
    return this.accessToken;
  }

  try {
    const response = await axios.post(
      `${this.baseUrl}/v1/security/oauth2/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    this.accessToken = response.data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return this.accessToken;
  } catch (error) {
    throw new Error('Failed to authenticate with Amadeus API');
  }
}
```

**Authentication Response:**
```json
{
  "access_token": "AnExampleAccessToken123456789",
  "token_type": "Bearer",
  "expires_in": 1799
}
```

### 1.4 Token Caching

**Token Caching Strategy:**
- Tokens are cached in memory per API instance
- Token expiry is set 5 minutes before actual expiry (safety buffer)
- Automatic token refresh on expiration
- No manual token management required

**Benefits:**
- Reduces authentication requests (saves API calls)
- Improves response times
- Prevents rate limiting issues

---

## 2. Endpoints Documentation

### 2.1 Flight Search

**Endpoint:** `POST /api/flights/search`

**Description:** Search for flight offers with AI-powered scoring and persuasion badges.

#### Request Parameters

```typescript
{
  // Required Parameters
  origin: string;              // IATA airport code (e.g., "JFK")
  destination: string;         // IATA airport code (e.g., "LAX")
  departureDate: string;       // YYYY-MM-DD format
  adults: number;              // Number of adults (1-9)

  // Optional Parameters
  returnDate?: string;         // YYYY-MM-DD format (for round-trip)
  children?: number;           // Number of children (0-9)
  infants?: number;            // Number of infants (0-9)
  travelClass?: string;        // "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
  nonStop?: boolean;           // Direct flights only
  currencyCode?: string;       // ISO currency code (default: "USD")
  max?: number;                // Maximum results (default: 50, max: 250)
  sortBy?: string;             // "best" | "cheapest" | "fastest" | "overall"
}
```

#### Request Body Example

```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-12-15",
  "returnDate": "2025-12-20",
  "adults": 2,
  "children": 1,
  "travelClass": "ECONOMY",
  "nonStop": false,
  "currencyCode": "USD",
  "max": 50,
  "sortBy": "best"
}
```

#### cURL Example

```bash
curl -X POST https://www.fly2any.com/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-12-15",
    "returnDate": "2025-12-20",
    "adults": 2,
    "travelClass": "ECONOMY",
    "currencyCode": "USD"
  }'
```

#### Success Response (200 OK)

```json
{
  "flights": [
    {
      "id": "1",
      "price": {
        "total": 450.00,
        "currency": "USD"
      },
      "itineraries": [
        {
          "duration": "PT5H30M",
          "segments": [
            {
              "departure": {
                "iataCode": "JFK",
                "at": "2025-12-15T08:00:00"
              },
              "arrival": {
                "iataCode": "LAX",
                "at": "2025-12-15T11:30:00"
              },
              "carrierCode": "AA",
              "number": "123"
            }
          ]
        }
      ],
      "numberOfBookableSeats": 7,
      "validatingAirlineCodes": ["AA"],
      "score": {
        "best": 92,
        "cheapest": 88,
        "fastest": 95,
        "overall": 90
      },
      "badges": [
        "Best Value",
        "Fastest Flight",
        "Direct Flight",
        "Convenient Time",
        "Top Pick"
      ],
      "metadata": {
        "totalDuration": 330,
        "pricePerHour": 81.82,
        "stopCount": 0,
        "departureTimeScore": 95
      }
    }
  ],
  "metadata": {
    "total": 25,
    "searchParams": {
      "origin": "JFK",
      "destination": "LAX",
      "departureDate": "2025-12-15",
      "returnDate": "2025-12-20",
      "adults": 2
    },
    "sortedBy": "best",
    "dictionaries": {
      "carriers": {
        "AA": "American Airlines"
      }
    },
    "timestamp": "2025-10-03T12:00:00Z"
  }
}
```

#### Error Responses

**400 Bad Request - Missing Parameters**
```json
{
  "error": "Missing required parameters",
  "required": ["origin", "destination", "departureDate", "adults"],
  "received": {
    "origin": "JFK"
  }
}
```

**400 Bad Request - Invalid Date Format**
```json
{
  "error": "Invalid departureDate format. Expected YYYY-MM-DD"
}
```

**400 Bad Request - Invalid Adults Parameter**
```json
{
  "error": "Invalid adults parameter. Must be a number between 1 and 9"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to search flights",
  "details": "Error stack trace (development only)"
}
```

**503 Service Unavailable**
```json
{
  "error": "Authentication failed with flight search provider"
}
```

**504 Gateway Timeout**
```json
{
  "error": "Flight search request timed out. Please try again."
}
```

#### Rate Limiting

- **Test Environment:** 10 requests/second
- **Production Environment:** Varies by subscription tier
- Headers returned:
  - `X-RateLimit-Limit`: Maximum requests per period
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

#### Caching

Response includes cache headers:
```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```
- Cached for 5 minutes (300 seconds)
- Stale content served for up to 10 minutes while revalidating

---

### 2.2 Airport Search

**Endpoint:** `GET /api/flights/airports`

**Description:** Search for airports and cities by keyword.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | Yes | Search term (min 2 characters) |

#### Request Example

```bash
# Search for airports in New York
GET /api/flights/airports?keyword=new+york
```

#### cURL Example

```bash
curl -X GET "https://www.fly2any.com/api/flights/airports?keyword=new%20york" \
  -H "Accept: application/json"
```

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "type": "location",
      "subType": "AIRPORT",
      "name": "JOHN F KENNEDY INTL",
      "detailedName": "NEW YORK/NY/US:JOHN F KENNEDY INTL",
      "id": "CJFK",
      "self": {
        "href": "https://test.api.amadeus.com/v1/reference-data/locations/CJFK",
        "methods": ["GET"]
      },
      "timeZoneOffset": "-05:00",
      "iataCode": "JFK",
      "geoCode": {
        "latitude": 40.63975,
        "longitude": -73.77893
      },
      "address": {
        "cityName": "NEW YORK",
        "cityCode": "NYC",
        "countryName": "UNITED STATES OF AMERICA",
        "countryCode": "US",
        "stateCode": "NY",
        "regionCode": "NAMER"
      }
    },
    {
      "type": "location",
      "subType": "AIRPORT",
      "name": "LAGUARDIA",
      "detailedName": "NEW YORK/NY/US:LAGUARDIA",
      "iataCode": "LGA",
      "geoCode": {
        "latitude": 40.77724,
        "longitude": -73.87261
      }
    }
  ],
  "meta": {
    "count": 10,
    "links": {
      "self": "https://test.api.amadeus.com/v1/reference-data/locations?..."
    }
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Please provide at least 2 characters to search"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to search airports"
}
```

---

### 2.3 Flight Confirmation

**Endpoint:** `POST /api/flights/confirm`

**Description:** Verify flight pricing before booking (prices may change).

#### Request Body

```json
{
  "flightOffers": [
    {
      "id": "1",
      "price": {
        "total": "450.00",
        "currency": "USD"
      },
      "itineraries": [...],
      // ... complete flight offer object
    }
  ]
}
```

#### cURL Example

```bash
curl -X POST https://www.fly2any.com/api/flights/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "flightOffers": [{
      "id": "1",
      "price": {"total": "450.00", "currency": "USD"},
      "itineraries": [...]
    }]
  }'
```

#### Success Response (200 OK)

```json
{
  "data": {
    "type": "flight-offers-pricing",
    "flightOffers": [
      {
        "id": "1",
        "price": {
          "total": "450.00",
          "currency": "USD",
          "base": "380.00"
        },
        "priceChanged": false,
        "availabilityChanged": false
      }
    ]
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Missing or invalid flight offers"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to confirm flight price"
}
```

---

## 3. Data Transformation

### 3.1 Amadeus Format to App Format

The application transforms raw Amadeus API responses into enriched flight offers with AI scoring.

#### Amadeus Raw Response

```json
{
  "data": [
    {
      "id": "1",
      "price": {
        "total": "450.00",
        "currency": "USD"
      },
      "itineraries": [
        {
          "duration": "PT5H30M",
          "segments": [...]
        }
      ]
    }
  ]
}
```

#### Transformed App Response

```json
{
  "id": "1",
  "price": {
    "total": 450.00,
    "currency": "USD"
  },
  "score": {
    "best": 92,
    "cheapest": 88,
    "fastest": 95,
    "overall": 90
  },
  "badges": [
    "Best Value",
    "Fastest Flight",
    "Direct Flight"
  ],
  "metadata": {
    "totalDuration": 330,
    "pricePerHour": 81.82,
    "stopCount": 0,
    "departureTimeScore": 95
  }
}
```

### 3.2 Type Conversions

#### Duration Parsing

```typescript
// ISO 8601 Duration → Minutes
function parseDuration(duration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');

  return hours * 60 + minutes;
}

// Example:
parseDuration("PT5H30M") // Returns: 330 minutes
```

#### Price Conversion

```typescript
// String → Number
const priceTotal = parseFloat(flight.price.total);

// Number → Formatted String
const formattedPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(450.00); // Returns: "$450.00"
```

#### Date/Time Parsing

```typescript
// ISO 8601 → Date Object
const departureTime = new Date("2025-12-15T08:00:00");

// Extract Hour for Scoring
const hour = departureTime.getHours(); // Returns: 8

// Format for Display
const formatted = departureTime.toLocaleString('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}); // Returns: "Dec 15, 08:00 AM"
```

### 3.3 Data Enrichment

#### AI Scoring Algorithm

The scoring system evaluates flights on multiple dimensions:

**1. Price Score (0-100)**
```typescript
const priceScore = maxPrice === minPrice
  ? 100
  : ((maxPrice - flight.price.total) / (maxPrice - minPrice)) * 100;
```

**2. Duration Score (0-100)**
```typescript
const durationScore = maxDuration === minDuration
  ? 100
  : ((maxDuration - totalDuration) / (maxDuration - minDuration)) * 100;
```

**3. Stops Score (0-100)**
```typescript
const stopsScore = maxStops === minStops
  ? 100
  : ((maxStops - stopCount) / (maxStops - minStops)) * 100;
```

**4. Departure Time Score (0-100)**
```typescript
function calculateDepartureTimeScore(departureTime: string): number {
  const hour = new Date(departureTime).getHours();

  // Morning peak: 7-9am (90-100 score)
  if (hour >= 7 && hour < 9) return 90 + ((hour - 7) / 2) * 10;

  // Evening peak: 5-7pm (85-95 score)
  if (hour >= 17 && hour < 19) return 85 + ((hour - 17) / 2) * 10;

  // ... other time ranges

  return 50; // Default
}
```

**5. Composite Best Score**
```typescript
const bestScore = (
  priceScore * 0.35 +           // 35% price weight
  durationScore * 0.25 +        // 25% duration weight
  stopsScore * 0.20 +           // 20% stops weight
  departureTimeScore * 0.15 +   // 15% departure time weight
  seatsScore * 0.05             // 5% availability weight
);
```

#### Badge Generation

Badges are dynamically generated based on flight characteristics:

```typescript
const badges: string[] = [];

// Best Value Badge
if (flight.score.best === Math.max(...allFlights.map(f => f.score.best))) {
  badges.push('Best Value');
}

// Lowest Price Badge
if (flight.price.total === Math.min(...allFlights.map(f => f.price.total))) {
  badges.push('Lowest Price');
}

// Fastest Flight Badge
if (flight.metadata.totalDuration === Math.min(...allFlights.map(f => f.metadata.totalDuration))) {
  badges.push('Fastest Flight');
}

// Direct Flight Badge
if (flight.metadata.stopCount === 0) {
  badges.push('Direct Flight');
}

// Convenient Time Badge
if (flight.metadata.departureTimeScore >= 85) {
  badges.push('Convenient Time');
}

// Scarcity Badge
if (flight.numberOfBookableSeats <= 3) {
  badges.push(`Only ${flight.numberOfBookableSeats} Seats Left`);
}

// Premium Airline Badge
const premiumCarriers = ['DL', 'AA', 'UA', 'BA', 'LH', 'AF', 'EK', 'QR', 'SQ', 'NH'];
if (premiumCarriers.includes(flight.validatingAirlineCodes?.[0])) {
  badges.push('Premium Airline');
}
```

**Available Badges:**
- `Best Value` - Highest overall score
- `Lowest Price` - Cheapest option
- `Fastest Flight` - Shortest duration
- `Direct Flight` - No stops
- `Convenient Time` - Optimal departure time
- `High Availability` - 7+ seats available
- `Only X Seats Left` - Scarcity indicator (≤3 seats)
- `Top Pick` - Top 10% best value
- `Great Value/Hour` - Below average price per hour
- `Premium Airline` - Major carrier
- `Early Departure` - 6-9 AM departure
- `Red-Eye Flight` - Late night/early morning

---

## 4. Error Handling

### 4.1 Common Errors

#### Authentication Errors

**Error:** `Failed to authenticate with Amadeus API`

**Causes:**
- Invalid API credentials
- Expired credentials
- Network connectivity issues

**Solution:**
```typescript
// Verify credentials in .env.local
AMADEUS_API_KEY=your_valid_key
AMADEUS_API_SECRET=your_valid_secret

// Check API environment
AMADEUS_ENVIRONMENT=test  // or 'production'
```

#### Validation Errors

**Error:** `Missing required parameters`

**Causes:**
- Missing origin, destination, departureDate, or adults
- Invalid parameter types

**Solution:**
```typescript
// Ensure all required parameters are provided
const searchParams = {
  origin: "JFK",              // Required: 3-letter IATA code
  destination: "LAX",         // Required: 3-letter IATA code
  departureDate: "2025-12-15", // Required: YYYY-MM-DD format
  adults: 2                   // Required: 1-9
};
```

#### Rate Limiting Errors

**Error:** `429 Too Many Requests`

**Causes:**
- Exceeded API rate limits
- Too many concurrent requests

**Solution:**
```typescript
// Implement exponential backoff
async function searchWithRetry(params: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await amadeusAPI.searchFlights(params);
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

#### No Results Errors

**Error:** `No flights found for the given criteria`

**Causes:**
- Invalid route (no flights between airports)
- Date too far in future/past
- Too restrictive filters

**Solution:**
```typescript
// Return empty results with helpful message
if (!flights || flights.length === 0) {
  return {
    flights: [],
    metadata: {
      total: 0,
      message: 'No flights found. Try adjusting your search criteria.'
    }
  };
}
```

### 4.2 Retry Strategies

#### Exponential Backoff

```typescript
async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRetryable = error.response?.status >= 500 || error.response?.status === 429;

      if (isLastAttempt || !isRetryable) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

// Usage
const results = await exponentialBackoff(
  () => amadeusAPI.searchFlights(params),
  3,
  1000
);
```

#### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}

// Usage
const circuitBreaker = new CircuitBreaker();
const results = await circuitBreaker.execute(
  () => amadeusAPI.searchFlights(params)
);
```

### 4.3 Fallback Mechanisms

#### Graceful Degradation

```typescript
async function searchFlightsWithFallback(params: FlightSearchParams) {
  try {
    // Try primary API
    return await amadeusAPI.searchFlights(params);
  } catch (error) {
    console.error('Primary API failed:', error);

    // Try cached results
    const cached = await getCachedResults(params);
    if (cached) {
      return {
        ...cached,
        metadata: { ...cached.metadata, cached: true }
      };
    }

    // Return empty results with error message
    return {
      flights: [],
      metadata: {
        total: 0,
        error: 'Unable to fetch flights. Please try again later.',
        timestamp: new Date().toISOString()
      }
    };
  }
}
```

### 4.4 User-Friendly Error Messages

```typescript
function getUserFriendlyError(error: any): string {
  // Authentication errors
  if (error.message?.includes('authenticate')) {
    return 'We\'re experiencing technical difficulties. Please try again later.';
  }

  // Timeout errors
  if (error.message?.includes('timeout')) {
    return 'The search is taking longer than expected. Please try again.';
  }

  // Validation errors
  if (error.response?.status === 400) {
    return 'Please check your search details and try again.';
  }

  // Rate limiting
  if (error.response?.status === 429) {
    return 'Too many searches. Please wait a moment and try again.';
  }

  // No results
  if (error.message?.includes('No flights found')) {
    return 'No flights found for your search. Try different dates or airports.';
  }

  // Generic error
  return 'Something went wrong. Please try again later.';
}
```

---

## 5. Performance Optimization

### 5.1 Caching Strategies

#### Response Caching

```typescript
// Next.js Edge Runtime with Cache Headers
export async function POST(request: NextRequest) {
  const results = await amadeusAPI.searchFlights(params);

  return NextResponse.json(results, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'Content-Type': 'application/json'
    }
  });
}
```

**Cache Configuration:**
- `public`: Response can be cached by any cache
- `s-maxage=300`: Cache for 5 minutes on CDN/edge
- `stale-while-revalidate=600`: Serve stale content for 10 minutes while revalidating

#### In-Memory Caching

```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,              // Maximum 500 items
  ttl: 1000 * 60 * 5,   // 5 minutes TTL
  updateAgeOnGet: true   // Reset TTL on access
});

async function getCachedFlights(params: FlightSearchParams) {
  const cacheKey = JSON.stringify(params);

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  const results = await amadeusAPI.searchFlights(params);
  cache.set(cacheKey, results);

  return results;
}
```

#### Redis Caching

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function getCachedFlights(params: FlightSearchParams) {
  const cacheKey = `flights:${JSON.stringify(params)}`;

  // Try cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  // Fetch and cache
  const results = await amadeusAPI.searchFlights(params);
  await redis.setex(cacheKey, 300, JSON.stringify(results)); // 5 min TTL

  return results;
}
```

### 5.2 Response Compression

```typescript
// Enable gzip compression in Next.js
// next.config.js
module.exports = {
  compress: true,
  // ... other config
};
```

**Compression Benefits:**
- Reduces response size by 60-80%
- Faster data transfer
- Lower bandwidth costs
- Better user experience

### 5.3 Pagination

```typescript
async function searchFlightsWithPagination(
  params: FlightSearchParams,
  page: number = 1,
  pageSize: number = 20
) {
  // Fetch more results than needed
  const allResults = await amadeusAPI.searchFlights({
    ...params,
    max: 250 // Maximum allowed
  });

  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedFlights = allResults.flights.slice(startIndex, endIndex);

  return {
    flights: paginatedFlights,
    pagination: {
      page,
      pageSize,
      total: allResults.flights.length,
      totalPages: Math.ceil(allResults.flights.length / pageSize),
      hasNext: endIndex < allResults.flights.length,
      hasPrev: page > 1
    }
  };
}
```

### 5.4 Lazy Loading

#### Client-Side Implementation

```typescript
'use client';

import { useState, useEffect } from 'react';

export function FlightResults({ initialFlights }: { initialFlights: any[] }) {
  const [flights, setFlights] = useState(initialFlights.slice(0, 10));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);

    // Simulate loading more results
    await new Promise(resolve => setTimeout(resolve, 500));

    const nextBatch = initialFlights.slice(page * 10, (page + 1) * 10);
    setFlights([...flights, ...nextBatch]);
    setPage(page + 1);

    setLoading(false);
  };

  return (
    <div>
      {flights.map(flight => (
        <FlightCard key={flight.id} flight={flight} />
      ))}

      {page * 10 < initialFlights.length && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### 5.5 Request Deduplication

```typescript
const pendingRequests = new Map<string, Promise<any>>();

async function deduplicatedSearch(params: FlightSearchParams) {
  const key = JSON.stringify(params);

  // Return pending request if exists
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // Create new request
  const promise = amadeusAPI.searchFlights(params)
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
}
```

---

## 6. Testing

### 6.1 Mock Data Generation

#### Test Flight Offers

```typescript
// lib/test/mockFlights.ts
export const mockFlightOffer = {
  id: "1",
  price: {
    total: 450.00,
    currency: "USD"
  },
  itineraries: [
    {
      duration: "PT5H30M",
      segments: [
        {
          departure: {
            iataCode: "JFK",
            at: "2025-12-15T08:00:00"
          },
          arrival: {
            iataCode: "LAX",
            at: "2025-12-15T11:30:00"
          },
          carrierCode: "AA",
          number: "123"
        }
      ]
    }
  ],
  numberOfBookableSeats: 7,
  validatingAirlineCodes: ["AA"]
};

export const mockFlights = [
  mockFlightOffer,
  {
    ...mockFlightOffer,
    id: "2",
    price: { total: 550.00, currency: "USD" },
    itineraries: [{
      duration: "PT7H45M",
      segments: [
        // ... with 1 stop
      ]
    }]
  }
];
```

#### Mock API Responses

```typescript
// lib/test/mockApi.ts
export class MockAmadeusAPI {
  async searchFlights(params: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: mockFlights,
      dictionaries: {
        carriers: {
          "AA": "American Airlines"
        }
      }
    };
  }

  async searchAirports(keyword: string) {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      data: [
        {
          iataCode: "JFK",
          name: "JOHN F KENNEDY INTL",
          address: {
            cityName: "NEW YORK",
            countryCode: "US"
          }
        }
      ]
    };
  }
}
```

### 6.2 API Testing Tools

#### Postman Collection

Create a Postman collection for all endpoints:

```json
{
  "info": {
    "name": "Fly2Any API",
    "description": "Flight search and booking API endpoints"
  },
  "item": [
    {
      "name": "Flight Search",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"origin\": \"JFK\",\n  \"destination\": \"LAX\",\n  \"departureDate\": \"2025-12-15\",\n  \"adults\": 2\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/flights/search",
          "host": ["{{baseUrl}}"],
          "path": ["api", "flights", "search"]
        }
      }
    },
    {
      "name": "Airport Search",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/api/flights/airports?keyword=new york",
          "host": ["{{baseUrl}}"],
          "path": ["api", "flights", "airports"],
          "query": [
            {
              "key": "keyword",
              "value": "new york"
            }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    }
  ]
}
```

#### Jest Integration Tests

```typescript
// __tests__/api/flights/search.test.ts
import { POST } from '@/app/api/flights/search/route';
import { NextRequest } from 'next/server';

describe('POST /api/flights/search', () => {
  it('should return flights for valid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/flights/search', {
      method: 'POST',
      body: JSON.stringify({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-15',
        adults: 2
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.flights).toBeDefined();
    expect(data.metadata).toBeDefined();
  });

  it('should return 400 for missing parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/flights/search', {
      method: 'POST',
      body: JSON.stringify({
        origin: 'JFK'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required parameters');
  });
});
```

### 6.3 Test Cases

#### Unit Tests

```typescript
// __tests__/lib/flights/scoring.test.ts
import { calculateFlightScore, getFlightBadges } from '@/lib/flights/scoring';
import { mockFlights } from '@/lib/test/mockFlights';

describe('Flight Scoring', () => {
  describe('calculateFlightScore', () => {
    it('should calculate correct scores', () => {
      const scored = calculateFlightScore(mockFlights[0], mockFlights);

      expect(scored.score.best).toBeGreaterThanOrEqual(0);
      expect(scored.score.best).toBeLessThanOrEqual(100);
      expect(scored.metadata.totalDuration).toBeGreaterThan(0);
    });
  });

  describe('getFlightBadges', () => {
    it('should assign Best Value badge to highest scorer', () => {
      const scoredFlights = mockFlights.map(f =>
        calculateFlightScore(f, mockFlights)
      );

      const badges = getFlightBadges(scoredFlights[0], scoredFlights);
      expect(badges).toContain('Best Value');
    });

    it('should assign Direct Flight badge for non-stop flights', () => {
      const directFlight = {
        ...mockFlights[0],
        itineraries: [{
          duration: "PT5H30M",
          segments: [mockFlights[0].itineraries[0].segments[0]]
        }]
      };

      const scored = calculateFlightScore(directFlight, [directFlight]);
      const badges = getFlightBadges(scored, [scored]);

      expect(badges).toContain('Direct Flight');
    });
  });
});
```

#### End-to-End Tests

```typescript
// e2e/flightSearch.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Flight Search', () => {
  test('should search for flights and display results', async ({ page }) => {
    await page.goto('/');

    // Fill search form
    await page.fill('[name="origin"]', 'JFK');
    await page.fill('[name="destination"]', 'LAX');
    await page.fill('[name="departureDate"]', '2025-12-15');
    await page.fill('[name="adults"]', '2');

    // Submit search
    await page.click('button[type="submit"]');

    // Wait for results
    await page.waitForSelector('[data-testid="flight-card"]');

    // Verify results
    const flightCards = await page.$$('[data-testid="flight-card"]');
    expect(flightCards.length).toBeGreaterThan(0);

    // Verify flight details
    const firstFlight = flightCards[0];
    await expect(firstFlight).toContainText('JFK');
    await expect(firstFlight).toContainText('LAX');
    await expect(firstFlight).toContainText('$');
  });
});
```

---

## 7. Production Considerations

### 7.1 Environment Switching

#### Test to Production Migration

**1. Update Environment Variables**

```bash
# Production .env.local
AMADEUS_API_KEY=your_production_api_key
AMADEUS_API_SECRET=your_production_api_secret
AMADEUS_ENVIRONMENT=production

# Verify URLs
NEXT_PUBLIC_APP_URL=https://www.fly2any.com
```

**2. Test Production API**

```typescript
// Test script for production verification
import { amadeusAPI } from '@/lib/api/amadeus';

async function testProductionAPI() {
  try {
    // Test authentication
    console.log('Testing production authentication...');
    const airports = await amadeusAPI.searchAirports('New York');
    console.log('✓ Authentication successful');

    // Test flight search
    console.log('Testing flight search...');
    const flights = await amadeusAPI.searchFlights({
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-12-15',
      adults: 1,
      max: 10
    });
    console.log(`✓ Found ${flights.data.length} flights`);

    console.log('All tests passed! Production API is ready.');
  } catch (error) {
    console.error('Production API test failed:', error);
  }
}

testProductionAPI();
```

**3. Gradual Rollout**

```typescript
// Feature flag for production rollout
const USE_PRODUCTION_API = process.env.AMADEUS_ENVIRONMENT === 'production';

async function searchFlights(params: any) {
  if (USE_PRODUCTION_API) {
    return await amadeusAPI.searchFlights(params);
  } else {
    // Use test API or mock data
    return await testAPI.searchFlights(params);
  }
}
```

### 7.2 Monitoring

#### Application Performance Monitoring (APM)

**Sentry Integration**

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Don't send authentication credentials
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
    }
    return event;
  }
});

// Track API performance
export async function monitoredAPICall<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    op: 'api.call',
    name: operation
  });

  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('error');
    Sentry.captureException(error, {
      tags: {
        operation,
        api: 'amadeus'
      }
    });
    throw error;
  } finally {
    transaction.finish();
  }
}
```

**Custom Metrics**

```typescript
// lib/monitoring/metrics.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function trackAPIMetrics(
  endpoint: string,
  duration: number,
  status: number
) {
  const key = `metrics:${endpoint}:${new Date().toISOString().split('T')[0]}`;

  await redis.hincrby(key, 'count', 1);
  await redis.hincrby(key, 'totalDuration', duration);

  if (status >= 400) {
    await redis.hincrby(key, 'errors', 1);
  }

  // Expire after 30 days
  await redis.expire(key, 30 * 24 * 60 * 60);
}

// Usage in API route
const startTime = Date.now();
try {
  const results = await amadeusAPI.searchFlights(params);
  await trackAPIMetrics('flight-search', Date.now() - startTime, 200);
  return results;
} catch (error) {
  await trackAPIMetrics('flight-search', Date.now() - startTime, 500);
  throw error;
}
```

#### Health Checks

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      amadeus: 'unknown',
      database: 'unknown',
      cache: 'unknown'
    }
  };

  try {
    // Test Amadeus API
    await amadeusAPI.searchAirports('NYC');
    checks.services.amadeus = 'healthy';
  } catch (error) {
    checks.services.amadeus = 'unhealthy';
    checks.status = 'degraded';
  }

  // ... test other services

  return NextResponse.json(checks);
}
```

### 7.3 Analytics Integration

#### Google Analytics 4

```typescript
// lib/analytics/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views
export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track flight search
export const trackFlightSearch = (params: any) => {
  event({
    action: 'search',
    category: 'flights',
    label: `${params.origin}-${params.destination}`,
    value: params.adults
  });
};

// Track flight selection
export const trackFlightSelection = (flight: any) => {
  event({
    action: 'select_flight',
    category: 'flights',
    label: flight.validatingAirlineCodes?.[0],
    value: Math.round(flight.price.total)
  });
};
```

#### Custom Event Tracking

```typescript
// lib/analytics/events.ts
interface FlightSearchEvent {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  resultsCount: number;
  duration: number;
}

export async function logFlightSearch(event: FlightSearchEvent) {
  // Send to analytics service
  await fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'flight_search',
      timestamp: new Date().toISOString(),
      data: event
    })
  });
}

// Usage
const startTime = Date.now();
const results = await amadeusAPI.searchFlights(params);
const duration = Date.now() - startTime;

await logFlightSearch({
  origin: params.origin,
  destination: params.destination,
  departureDate: params.departureDate,
  returnDate: params.returnDate,
  adults: params.adults,
  resultsCount: results.data.length,
  duration
});
```

### 7.4 Cost Optimization

#### API Call Budgeting

```typescript
// lib/api/budgetControl.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const DAILY_LIMIT = 10000; // API calls per day
const HOURLY_LIMIT = 500;  // API calls per hour

export async function checkBudget(): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().toISOString().slice(0, 13);

  const dailyKey = `budget:daily:${today}`;
  const hourlyKey = `budget:hourly:${hour}`;

  const [dailyCount, hourlyCount] = await Promise.all([
    redis.get(dailyKey),
    redis.get(hourlyKey)
  ]);

  if ((dailyCount as number) >= DAILY_LIMIT) {
    console.warn('Daily API budget exceeded');
    return false;
  }

  if ((hourlyCount as number) >= HOURLY_LIMIT) {
    console.warn('Hourly API budget exceeded');
    return false;
  }

  return true;
}

export async function incrementBudget() {
  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().toISOString().slice(0, 13);

  const dailyKey = `budget:daily:${today}`;
  const hourlyKey = `budget:hourly:${hour}`;

  await Promise.all([
    redis.incr(dailyKey),
    redis.incr(hourlyKey)
  ]);

  // Set expiry
  await redis.expire(dailyKey, 24 * 60 * 60); // 24 hours
  await redis.expire(hourlyKey, 60 * 60);      // 1 hour
}

// Usage in API route
export async function POST(request: NextRequest) {
  const canProceed = await checkBudget();

  if (!canProceed) {
    return NextResponse.json(
      { error: 'API rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  const results = await amadeusAPI.searchFlights(params);
  await incrementBudget();

  return NextResponse.json(results);
}
```

#### Smart Caching

```typescript
// Aggressive caching for popular routes
const POPULAR_ROUTES = [
  'JFK-LAX',
  'LHR-JFK',
  'CDG-JFK',
  // ... add more
];

async function smartCache(params: FlightSearchParams) {
  const route = `${params.origin}-${params.destination}`;
  const isPopular = POPULAR_ROUTES.includes(route);

  // Popular routes: cache for 10 minutes
  // Other routes: cache for 5 minutes
  const ttl = isPopular ? 600 : 300;

  const cacheKey = `flights:${JSON.stringify(params)}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached as string);
  }

  const results = await amadeusAPI.searchFlights(params);
  await redis.setex(cacheKey, ttl, JSON.stringify(results));

  return results;
}
```

#### Request Deduplication

```typescript
// Prevent duplicate searches within short time window
const recentSearches = new Map<string, { timestamp: number; results: any }>();

async function deduplicatedSearch(params: FlightSearchParams) {
  const key = JSON.stringify(params);
  const recent = recentSearches.get(key);

  // If searched within last 30 seconds, return cached results
  if (recent && Date.now() - recent.timestamp < 30000) {
    console.log('Returning deduplicated results');
    return recent.results;
  }

  const results = await amadeusAPI.searchFlights(params);

  recentSearches.set(key, {
    timestamp: Date.now(),
    results
  });

  // Clean up old entries
  for (const [k, v] of recentSearches.entries()) {
    if (Date.now() - v.timestamp > 60000) {
      recentSearches.delete(k);
    }
  }

  return results;
}
```

---

## Additional Resources

### Official Documentation
- **Amadeus for Developers**: https://developers.amadeus.com/
- **API Reference**: https://developers.amadeus.com/self-service/category/flights
- **Authentication Guide**: https://developers.amadeus.com/self-service/apis-docs/guides/authorization

### Community Resources
- **Amadeus Community Forum**: https://developers.amadeus.com/support
- **GitHub Examples**: https://github.com/amadeus4dev
- **Stack Overflow**: Tag `amadeus-api`

### Support
- **Technical Support**: https://developers.amadeus.com/support
- **Status Page**: https://status.amadeus.com/
- **Email Support**: developers@amadeus.com

---

## Postman Collection

Import this collection into Postman for quick testing:

**Collection URL**: Save the JSON from section 6.2 as `fly2any-api.postman_collection.json`

**Environment Variables**:
```json
{
  "baseUrl": "http://localhost:3000",
  "productionUrl": "https://www.fly2any.com"
}
```

---

## Quick Reference

### Common IATA Airport Codes
- **JFK** - John F. Kennedy International (New York)
- **LAX** - Los Angeles International
- **LHR** - London Heathrow
- **CDG** - Charles de Gaulle (Paris)
- **DXB** - Dubai International
- **NRT** - Narita International (Tokyo)
- **SIN** - Singapore Changi
- **FRA** - Frankfurt Airport

### Travel Class Codes
- `ECONOMY` - Standard economy class
- `PREMIUM_ECONOMY` - Premium economy
- `BUSINESS` - Business class
- `FIRST` - First class

### Major Airline Codes
- **AA** - American Airlines
- **DL** - Delta Air Lines
- **UA** - United Airlines
- **BA** - British Airways
- **LH** - Lufthansa
- **AF** - Air France
- **EK** - Emirates
- **QR** - Qatar Airways

---

**Document Version**: 1.0
**Last Updated**: 2025-10-03
**Maintained By**: Fly2Any Development Team
