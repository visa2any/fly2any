# Deal Score Algorithm - Integration Guide

## Overview

The Deal Score Algorithm rates flights from 0-100 based on multiple factors, helping users quickly identify the best deals. This guide covers implementation, usage, and best practices.

## Quick Start

### Basic Usage

```typescript
import { calculateDealScore } from '@/lib/flights/dealScore';
import { DealScoreBadge } from '@/components/flights/DealScoreBadge';

// Calculate score for a single flight
const score = calculateDealScore({
  priceVsMarket: -15,           // 15% below market average
  duration: 480,                 // 8 hours
  stops: 1,
  departureTime: '2025-06-15T09:00:00Z',
  arrivalTime: '2025-06-15T17:00:00Z',
  onTimePerformance: 85,
  aircraftAge: 7,
  seatAvailability: 12,
  airlineRating: 4.2,
  layoverQuality: 3.5
}, 420); // 420 = shortest duration for this route

// Display the badge
<DealScoreBadge score={score} />
```

### Batch Processing (Recommended)

For flight search results, use batch processing to automatically calculate market context:

```typescript
import { batchCalculateDealScores } from '@/lib/flights/dealScore';

const flights = [
  {
    price: 450,
    factors: {
      duration: 420,
      stops: 0,
      departureTime: '2025-06-15T09:00:00Z',
      arrivalTime: '2025-06-15T16:00:00Z',
      seatAvailability: 15,
    }
  },
  {
    price: 350,
    factors: {
      duration: 480,
      stops: 1,
      departureTime: '2025-06-15T14:00:00Z',
      arrivalTime: '2025-06-15T22:00:00Z',
      seatAvailability: 8,
    }
  },
  // ... more flights
];

// Automatically calculates market average and shortest duration
const scores = batchCalculateDealScores(flights);

// Use scores with flights
flights.forEach((flight, i) => {
  flight.dealScore = scores[i];
});
```

## Scoring Breakdown

### Price Component (40 points)

**Most important factor** - rewards flights below market average.

```typescript
// Price vs Market calculation
const marketAverage = calculateMarketAverage(allPrices);
const priceVsMarket = ((price - marketAverage) / marketAverage) * 100;

// Scoring:
// -20% or more = 40 points (maximum)
//   0%         = 20 points (at market)
// +20% or more = 0 points (minimum)
```

**Example:**
- Market average: $500
- Your flight: $425 (15% below)
- Price score: ~35/40 points

### Duration Component (15 points)

Faster flights score higher, relative to the shortest option.

```typescript
// Find shortest duration
const shortestDuration = findShortestDuration(allDurations);

// Scoring:
// Shortest option     = 15 points
// 1.5x shortest       = ~9 points
// 2x shortest or more = 3 points
```

**Example:**
- Shortest flight: 7 hours
- Your flight: 8 hours (1.14x)
- Duration score: ~13/15 points

### Stops Component (15 points)

Direct flights are highly valued.

```typescript
// Scoring:
0 stops  = 15 points  // Non-stop
1 stop   = 8 points   // One connection
2 stops  = 3 points   // Two connections
3+ stops = 1 point    // Multiple connections
```

### Time of Day Component (10 points)

Considers departure and arrival convenience.

**Departure Scoring (6 points max):**
- 6am-9am: 6 points (early morning)
- 9am-12pm: 6 points (late morning)
- 12pm-5pm: 5 points (afternoon)
- 5pm-9pm: 4 points (evening)
- 9pm-1am: 2 points (red-eye)
- 1am-6am: 1 point (very early)

**Arrival Scoring (4 points max):**
- 8am-10pm: 4 points (reasonable hours)
- 6am-8am: 3 points (early morning)
- 10pm-2am: 2 points (late night)
- 2am-6am: 1 point (very late)

### Reliability Component (10 points)

Based on historical on-time performance.

```typescript
// Scoring:
90%+ on-time = 10 points
75% on-time  = 6-7 points
50% on-time  = 0 points
No data      = 5 points (average)
```

### Comfort Component (5 points)

Combines aircraft age, airline rating, and layover quality.

**Aircraft Age (2 points max):**
- 0-5 years: 2 points (new)
- 6-10 years: 1.5 points (modern)
- 11-15 years: 1 point (average)
- 16+ years: 0.5 points (older)

**Airline Rating (2 points max):**
- Based on 1-5 scale
- 5-star airline: 2 points
- 3-star airline: 1 point
- 1-star airline: 0 points

**Layover Quality (1 point max):**
- Based on 1-5 scale for layover airports
- Premium hub: 1 point
- Average airport: 0.5 points

### Availability Component (5 points)

More seats = higher confidence.

```typescript
// Scoring:
20+ seats    = 5 points  // Plenty available
10-19 seats  = 4 points  // Good availability
5-9 seats    = 3 points  // Limited
2-4 seats    = 2 points  // Very few
1 seat       = 1 point   // Last seat
0 seats      = 0 points  // Sold out
```

## Score Tiers

| Score Range | Tier | Label | Badge Color | Usage |
|-------------|------|-------|-------------|-------|
| 90-100 | Excellent | "Excellent Deal" | Gold/Amber | Top 10% of flights, highlight prominently |
| 75-89 | Great | "Great Deal" | Green | Strong recommendations |
| 60-74 | Good | "Good Deal" | Blue | Solid options |
| 0-59 | Fair | "Fair Deal" | Gray | Standard flights |

## UI Components

### Badge Variants

```typescript
import {
  DealScoreBadge,        // Full circular progress with label
  DealScoreBadgeCompact, // Inline badge for flight cards
  DealScoreBadgeMinimal, // Just the number
  DealScoreBadgePromo    // Large promotional style
} from '@/components/flights/DealScoreBadge';

// Standard badge
<DealScoreBadge
  score={score}
  size="md"
  showLabel={true}
  animate={true}
/>

// Compact for flight cards
<DealScoreBadgeCompact score={score} />

// Minimal in tables
<DealScoreBadgeMinimal score={score} />

// Promotional for featured deals
<DealScoreBadgePromo score={score} />
```

### Size Variants

- `sm`: 64x64px - For compact displays
- `md`: 80x80px - Standard (default)
- `lg`: 112x112px - Featured displays

## Integration Examples

### Flight Card Integration

```typescript
'use client';

import { useState } from 'react';
import { DealScoreBadgeCompact } from '@/components/flights/DealScoreBadge';
import { calculateDealScore } from '@/lib/flights/dealScore';

export function FlightCard({ flight, marketContext }) {
  const score = calculateDealScore({
    priceVsMarket: ((flight.price - marketContext.averagePrice) / marketContext.averagePrice) * 100,
    duration: flight.duration,
    stops: flight.stops,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    onTimePerformance: flight.onTimePerformance,
    aircraftAge: flight.aircraftAge,
    seatAvailability: flight.seatsRemaining,
    airlineRating: flight.airlineRating,
    layoverQuality: flight.layoverQuality,
  }, marketContext.shortestDuration);

  return (
    <div className="flight-card">
      {/* Flight info */}
      <div className="flex justify-between items-start">
        <div>
          {/* Airline, times, etc */}
        </div>

        {/* Deal Score Badge */}
        <DealScoreBadgeCompact score={score} />
      </div>

      {/* Rest of card */}
    </div>
  );
}
```

### Search Results Integration

```typescript
'use client';

import { useMemo } from 'react';
import { batchCalculateDealScores } from '@/lib/flights/dealScore';

export function FlightResults({ flights }) {
  // Calculate scores for all flights
  const flightsWithScores = useMemo(() => {
    const scores = batchCalculateDealScores(
      flights.map(f => ({
        price: f.price,
        factors: {
          duration: f.duration,
          stops: f.stops,
          departureTime: f.departureTime,
          arrivalTime: f.arrivalTime,
          onTimePerformance: f.onTimePerformance,
          aircraftAge: f.aircraftAge,
          seatAvailability: f.seatsRemaining,
          airlineRating: f.airlineRating,
          layoverQuality: f.layoverQuality,
        }
      }))
    );

    return flights.map((flight, i) => ({
      ...flight,
      dealScore: scores[i]
    }));
  }, [flights]);

  // Sort by deal score
  const sortedFlights = [...flightsWithScores].sort(
    (a, b) => b.dealScore.total - a.dealScore.total
  );

  return (
    <div>
      {sortedFlights.map(flight => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
```

### Sort Options Integration

```typescript
const sortOptions = [
  { value: 'deal_score', label: 'Best Deal', sort: (a, b) => b.dealScore.total - a.dealScore.total },
  { value: 'price_asc', label: 'Price: Low to High', sort: (a, b) => a.price - b.price },
  { value: 'duration', label: 'Shortest Duration', sort: (a, b) => a.duration - b.duration },
  { value: 'departure', label: 'Departure Time', sort: (a, b) => new Date(a.departureTime) - new Date(b.departureTime) },
];
```

### Filter Options Integration

```typescript
// Filter by score tier
const filterByTier = (flights, tier) => {
  return flights.filter(f => f.dealScore.tier === tier);
};

// Example: Show only excellent and great deals
const topDeals = flights.filter(f =>
  f.dealScore.tier === 'excellent' || f.dealScore.tier === 'great'
);
```

## Data Requirements

### Minimum Required Data

```typescript
interface MinimumFlightData {
  price: number;
  duration: number;
  stops: number;
  departureTime: string; // ISO 8601
  arrivalTime: string;   // ISO 8601
  seatAvailability: number;
}
```

### Optional Enhanced Data

```typescript
interface EnhancedFlightData extends MinimumFlightData {
  onTimePerformance?: number;  // From airline APIs or historical data
  aircraftAge?: number;         // From fleet databases
  airlineRating?: number;       // From user reviews or rating services
  layoverQuality?: number;      // Airport amenities rating
}
```

### Data Sources

1. **On-Time Performance**:
   - FlightStats API
   - FAA statistics
   - Historical tracking

2. **Aircraft Age**:
   - FlightAware
   - Planespotters.net
   - Airline fleet data

3. **Airline Ratings**:
   - Skytrax
   - AirlineRatings.com
   - User reviews

4. **Layover Quality**:
   - Airport amenities databases
   - Skytrax airport ratings
   - Custom scoring system

## Performance Optimization

### Caching Scores

```typescript
// Cache market context
const marketContextCache = new Map();

function getMarketContext(route) {
  const key = `${route.origin}-${route.destination}`;

  if (!marketContextCache.has(key)) {
    const context = calculateMarketContext(route);
    marketContextCache.set(key, context);
  }

  return marketContextCache.get(key);
}

// Cache calculated scores
const scoreCache = new Map();

function getCachedScore(flightId, factors) {
  const key = `${flightId}-${JSON.stringify(factors)}`;

  if (!scoreCache.has(key)) {
    const score = calculateDealScore(factors);
    scoreCache.set(key, score);
  }

  return scoreCache.get(key);
}
```

### Server-Side Calculation

```typescript
// Calculate scores on the server
export async function getFlightsWithScores(searchParams) {
  const flights = await searchFlights(searchParams);

  const scores = batchCalculateDealScores(
    flights.map(f => ({ price: f.price, factors: { ... } }))
  );

  return flights.map((flight, i) => ({
    ...flight,
    dealScore: scores[i]
  }));
}
```

## Testing

### Unit Tests

```bash
# Run tests
npm test lib/flights/dealScore.test.ts

# Watch mode
npm test -- --watch lib/flights/dealScore.test.ts

# Coverage
npm test -- --coverage lib/flights/dealScore.test.ts
```

### Test Coverage Areas

- ✅ Individual component calculations
- ✅ Edge cases (extreme values, missing data)
- ✅ Batch processing
- ✅ Type validation
- ✅ Boundary conditions
- ✅ Integration scenarios

## Best Practices

### 1. Always Use Batch Processing for Multiple Flights

```typescript
// ❌ Don't calculate individually
flights.forEach(flight => {
  flight.score = calculateDealScore({ ... });
});

// ✅ Use batch processing
const scores = batchCalculateDealScores(flights);
```

### 2. Provide Context When Available

```typescript
// ❌ Without context
const score = calculateDealScore(factors);

// ✅ With market context
const score = calculateDealScore(factors, shortestDuration);
```

### 3. Handle Missing Data Gracefully

```typescript
const factors = {
  // Required fields
  priceVsMarket: -10,
  duration: 480,
  stops: 1,
  departureTime: '2025-06-15T09:00:00Z',
  arrivalTime: '2025-06-15T17:00:00Z',
  seatAvailability: 12,

  // Optional fields - algorithm provides defaults
  onTimePerformance: flight.onTimePerformance ?? undefined,
  aircraftAge: flight.aircraftAge ?? undefined,
  airlineRating: flight.airlineRating ?? undefined,
  layoverQuality: flight.layoverQuality ?? undefined,
};
```

### 4. Display Score Breakdown on Demand

```typescript
// Show badge by default
<DealScoreBadge score={score} />

// Tooltip shows automatically on hover
// Score breakdown is always available via score.components
```

### 5. Use Appropriate Badge Variant

```typescript
// Flight cards - compact
<DealScoreBadgeCompact score={score} />

// Featured deals - promotional
<DealScoreBadgePromo score={score} />

// List view - minimal
<DealScoreBadgeMinimal score={score} />

// Detail view - full
<DealScoreBadge score={score} size="lg" />
```

## Customization

### Adjusting Weights

To adjust the importance of different factors, modify the max points in `dealScore.ts`:

```typescript
// Current distribution (total = 100)
const WEIGHTS = {
  PRICE: 40,      // Most important
  DURATION: 15,
  STOPS: 15,
  TIME_OF_DAY: 10,
  RELIABILITY: 10,
  COMFORT: 5,
  AVAILABILITY: 5,
};
```

### Custom Tier Thresholds

Modify tier boundaries in the `getScoreTier` function:

```typescript
function getScoreTier(score: number) {
  if (score >= 90) return { tier: 'excellent', ... };
  if (score >= 75) return { tier: 'great', ... };
  if (score >= 60) return { tier: 'good', ... };
  return { tier: 'fair', ... };
}
```

### Custom Badge Colors

Extend or modify `getTierColors` in `DealScoreBadge.tsx`:

```typescript
function getTierColors(tier) {
  switch (tier) {
    case 'excellent':
      return {
        bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
        // ... custom colors
      };
    // ...
  }
}
```

## Troubleshooting

### Issue: Scores seem too high/low

**Solution**: Check market context calculation. Ensure you're calculating market average across all flights in the result set.

### Issue: All flights have similar scores

**Solution**: Verify you have diverse flight data. If all flights are similar, scores will naturally cluster.

### Issue: Badge not displaying

**Solution**: Ensure you've imported Tailwind styles and the score object has all required properties.

### Issue: Performance problems with many flights

**Solution**: Use batch processing and consider server-side calculation:

```typescript
// ✅ Calculate on server
const flightsWithScores = await getFlightsWithScores(searchParams);

// ✅ Use React.memo for flight cards
const FlightCard = React.memo(({ flight }) => { ... });
```

## API Reference

See inline documentation in:
- `lib/flights/dealScore.ts` - Core algorithm
- `components/flights/DealScoreBadge.tsx` - UI components

## Changelog

### Version 1.0.0 (2025-06-15)
- Initial release
- Comprehensive scoring algorithm
- Multiple badge variants
- Full test coverage
- Complete documentation

## Support

For questions or issues:
1. Check this documentation
2. Review test cases in `dealScore.test.ts`
3. Check inline code documentation
4. Review example implementations above
