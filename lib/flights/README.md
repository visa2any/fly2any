# Flight Search API with AI Scoring

This module provides an intelligent flight search API with AI-powered scoring and persuasion badges.

## API Endpoint

**POST** `/api/flights/search`

### Request Body

```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2025-11-15",
  "returnDate": "2025-11-22",
  "adults": 2,
  "children": 0,
  "travelClass": "ECONOMY",
  "sortBy": "best"
}
```

### Required Parameters

- `origin` (string): IATA airport code for departure
- `destination` (string): IATA airport code for arrival
- `departureDate` (string): Date in YYYY-MM-DD format
- `adults` (number): Number of adult passengers (1-9)

### Optional Parameters

- `returnDate` (string): Return date in YYYY-MM-DD format (for round trips)
- `children` (number): Number of children (0-9)
- `infants` (number): Number of infants (0-9)
- `travelClass` (string): `ECONOMY`, `PREMIUM_ECONOMY`, `BUSINESS`, or `FIRST`
- `nonStop` (boolean): Filter for direct flights only
- `currencyCode` (string): Currency code (default: `USD`)
- `max` (number): Maximum results to return (default: 50)
- `sortBy` (string): Sort order - `best`, `cheapest`, `fastest`, or `overall` (default: `best`)

### Response

```json
{
  "flights": [
    {
      "id": "flight-id",
      "price": {
        "total": 450.00,
        "currency": "USD"
      },
      "itineraries": [...],
      "score": {
        "best": 95,
        "cheapest": 88,
        "fastest": 92,
        "overall": 90
      },
      "badges": [
        "Best Value",
        "Direct Flight",
        "Convenient Time"
      ],
      "metadata": {
        "totalDuration": 360,
        "pricePerHour": 75.00,
        "stopCount": 0,
        "departureTimeScore": 95
      }
    }
  ],
  "metadata": {
    "total": 25,
    "searchParams": {...},
    "sortedBy": "best",
    "dictionaries": {...},
    "timestamp": "2025-10-03T12:00:00.000Z"
  }
}
```

## AI Scoring System

The scoring system evaluates flights based on multiple factors:

### Score Types

1. **Best Score** (0-100): Comprehensive score considering all factors
   - Price: 35% weight
   - Duration: 25% weight
   - Stops: 20% weight
   - Departure time: 15% weight
   - Seat availability: 5% weight

2. **Cheapest Score** (0-100): Pure price comparison
   - Based on total price relative to all results

3. **Fastest Score** (0-100): Speed-focused score
   - Duration: 70% weight
   - Stops: 30% weight

4. **Overall Score** (0-100): Balanced score
   - Price: 40% weight
   - Duration: 30% weight
   - Stops: 20% weight
   - Departure time: 10% weight

### Departure Time Scoring

- Morning peak (7-9am): 90-100 points
- Evening peak (5-7pm): 85-95 points
- Mid-morning (9am-12pm): 70-85 points
- Afternoon (12-5pm): 65-75 points
- Early morning (5-7am): 50-60 points
- Late evening (7-10pm): 40-55 points
- Night/very early (10pm-5am): 20-40 points

## Persuasion Badges

The system automatically generates persuasive badges to help users make decisions:

### Available Badges

- **Best Value**: Highest overall score in the results
- **Lowest Price**: Cheapest flight available
- **Fastest Flight**: Shortest total travel time
- **Direct Flight**: No stops (non-stop flight)
- **Convenient Time**: Departure time score ≥ 85
- **High Availability**: 7+ seats available
- **Only X Seats Left**: Low availability warning (≤3 seats)
- **Top Pick**: In top 10% of best value scores
- **Great Value/Hour**: Price per hour < 85% of average
- **Premium Airline**: Major carrier (DL, AA, UA, BA, LH, AF, EK, QR, SQ, NH)
- **Early Departure**: Morning flight (6-9am)
- **Red-Eye Flight**: Night/early morning flight (10pm-5am)

## Error Handling

### HTTP Status Codes

- `200`: Success
- `400`: Bad request (validation error)
- `500`: Internal server error
- `503`: Service unavailable (authentication failed)
- `504`: Gateway timeout (request timeout)

### Error Response Format

```json
{
  "error": "Error message",
  "required": ["field1", "field2"],
  "received": {...}
}
```

## Caching

The API implements HTTP caching headers for performance:

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

- Fresh for 5 minutes (300 seconds)
- Stale responses served for up to 10 minutes (600 seconds) while revalidating

## Legacy GET Support

The API also supports GET requests for backward compatibility:

**GET** `/api/flights/search?origin=JFK&destination=LAX&departureDate=2025-11-15&adults=2`

All parameters are passed as query strings and internally converted to POST format.

## Usage Example

```typescript
const searchFlights = async () => {
  const response = await fetch('/api/flights/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-11-15',
      returnDate: '2025-11-22',
      adults: 2,
      travelClass: 'ECONOMY',
      sortBy: 'best'
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Error:', data.error);
    return;
  }

  console.log(`Found ${data.metadata.total} flights`);
  data.flights.forEach(flight => {
    console.log(`Flight: $${flight.price.total}`);
    console.log(`Score: ${flight.score.best}/100`);
    console.log(`Badges: ${flight.badges.join(', ')}`);
  });
};
```

## TypeScript Types

All types are exported from `@/lib/flights/scoring`:

```typescript
import type { FlightOffer, ScoredFlight } from '@/lib/flights/scoring';
```

## Functions

### `calculateFlightScore(flight, allFlights)`

Calculates comprehensive scores for a flight based on all results.

### `getFlightBadges(flight, allFlights)`

Generates persuasive badges for a flight.

### `sortFlights(flights, sortBy)`

Sorts flights by the specified criteria.
