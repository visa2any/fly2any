# Flight Deal Score System

A comprehensive scoring algorithm that rates flights from 0-100 to help users quickly identify the best deals.

## 📁 Files

### Core Algorithm
- **`dealScore.ts`** - Main scoring algorithm with full TypeScript types and documentation
- **`dealScore.test.ts`** - Comprehensive test suite with 100+ test cases
- **`dealScore.demo.ts`** - Interactive demo showing example calculations

### UI Components
- **`components/flights/DealScoreBadge.tsx`** - Visual badge components with multiple variants
- **`components/flights/FlightCardWithDealScore.tsx`** - Example flight card integration
- **`components/flights/FlightSearchResults.example.tsx`** - Complete search results page example

### Documentation
- **`DEAL_SCORE_GUIDE.md`** - Complete integration guide with examples and best practices

## 🚀 Quick Start

### 1. Calculate a Single Score

```typescript
import { calculateDealScore } from '@/lib/flights/dealScore';

const score = calculateDealScore({
  priceVsMarket: -15,  // 15% below market average
  duration: 480,        // 8 hours
  stops: 1,
  departureTime: '2025-06-15T09:00:00Z',
  arrivalTime: '2025-06-15T17:00:00Z',
  seatAvailability: 12,
  // Optional fields
  onTimePerformance: 85,
  aircraftAge: 7,
  airlineRating: 4.2,
  layoverQuality: 3.5,
}, 420); // shortest duration for context

console.log(score.total);      // 82
console.log(score.label);      // "Great Deal"
console.log(score.tier);       // "great"
```

### 2. Batch Process Multiple Flights (Recommended)

```typescript
import { batchCalculateDealScores } from '@/lib/flights/dealScore';

const flights = [
  { price: 450, factors: { duration: 420, stops: 0, ... } },
  { price: 350, factors: { duration: 480, stops: 1, ... } },
  // ... more flights
];

const scores = batchCalculateDealScores(flights);
// Automatically calculates market average and shortest duration
```

### 3. Display the Badge

```typescript
import { DealScoreBadge } from '@/components/flights/DealScoreBadge';

<DealScoreBadge score={score} size="md" />
```

## 📊 Scoring Formula (0-100 points)

| Component | Points | Description |
|-----------|--------|-------------|
| **Price** | 40 | Most important - rewards below market average |
| **Duration** | 15 | Faster flights score higher |
| **Stops** | 15 | Non-stop = 15, 1 stop = 8, 2+ stops = 3 |
| **Time of Day** | 10 | Convenient departure/arrival times |
| **Reliability** | 10 | Based on on-time performance |
| **Comfort** | 5 | Aircraft age, airline rating |
| **Availability** | 5 | More seats = higher confidence |

### Score Tiers

- **90-100**: 🏆 Excellent Deal (Gold badge)
- **75-89**: ✨ Great Deal (Green badge)
- **60-74**: 👍 Good Deal (Blue badge)
- **0-59**: 💼 Fair Deal (Gray badge)

## 🎨 Badge Variants

```typescript
// Standard circular badge with label
<DealScoreBadge score={score} size="lg" />

// Compact inline badge (for flight cards)
<DealScoreBadgeCompact score={score} />

// Minimal number only
<DealScoreBadgeMinimal score={score} />

// Large promotional style
<DealScoreBadgePromo score={score} />
```

## 🧪 Testing

```bash
# Run tests
npm test lib/flights/dealScore.test.ts

# Run demo
npx ts-node lib/flights/dealScore.demo.ts

# Watch mode
npm test -- --watch lib/flights/dealScore.test.ts
```

## 📖 Documentation

See **`DEAL_SCORE_GUIDE.md`** for:
- Detailed scoring breakdown
- Integration examples
- Data requirements
- Performance optimization
- Customization options
- Troubleshooting

## 🎯 Integration Checklist

- [ ] Import `calculateDealScore` or `batchCalculateDealScores`
- [ ] Calculate scores for your flights
- [ ] Import `DealScoreBadge` component
- [ ] Display badges on flight cards
- [ ] Add "Best Deal" sort option
- [ ] (Optional) Filter by score tier
- [ ] (Optional) Show score breakdown in details

## 💡 Key Features

- ✅ Comprehensive 7-factor scoring
- ✅ Batch processing with automatic market context
- ✅ Multiple badge variants
- ✅ Detailed score breakdowns
- ✅ Handles missing optional data
- ✅ Full TypeScript support
- ✅ Extensive test coverage
- ✅ Animated UI components
- ✅ Hover tooltips with explanations
- ✅ Mobile responsive

## 🔧 Requirements

### Minimum Required Data
```typescript
{
  priceVsMarket: number;      // Calculate from market average
  duration: number;            // In minutes
  stops: number;               // Number of stops
  departureTime: string;       // ISO 8601
  arrivalTime: string;         // ISO 8601
  seatAvailability: number;    // Seats remaining
}
```

### Optional Enhanced Data
```typescript
{
  onTimePerformance?: number;  // 0-100 percentage
  aircraftAge?: number;         // Years
  airlineRating?: number;       // 1-5 scale
  layoverQuality?: number;      // 1-5 scale
}
```

## 📊 Example Scores

| Flight Type | Price | Stops | Duration | Score | Tier |
|-------------|-------|-------|----------|-------|------|
| Direct Premium | -5% | 0 | 6h | 88 | Great |
| Budget One-Stop | -18% | 1 | 8h | 82 | Great |
| Early Bird | -10% | 0 | 6.5h | 85 | Great |
| Multi-Stop Economy | -25% | 2 | 11h | 71 | Good |
| Last Minute | +25% | 0 | 6.5h | 58 | Fair |
| Red-Eye | -12% | 0 | 7h | 76 | Great |

## 🎓 Best Practices

1. **Always use batch processing** for multiple flights
2. **Provide market context** when available
3. **Handle missing data gracefully** - algorithm provides defaults
4. **Display tooltips** for score explanations
5. **Sort by deal score** as default recommendation
6. **Highlight excellent deals** prominently
7. **Cache scores** when possible for performance

## 🤝 Contributing

To modify the scoring formula:

1. Adjust weights in `dealScore.ts`:
   ```typescript
   const WEIGHTS = {
     PRICE: 40,
     DURATION: 15,
     // ... etc
   };
   ```

2. Update tier thresholds in `getScoreTier()` function

3. Run tests to ensure nothing breaks:
   ```bash
   npm test lib/flights/dealScore.test.ts
   ```

## 📝 License

Part of the Fly2Any platform. See main project license.

## 🔗 Related Files

- Main implementation: `lib/flights/dealScore.ts`
- UI components: `components/flights/DealScoreBadge.tsx`
- Full guide: `lib/flights/DEAL_SCORE_GUIDE.md`
- Examples: `components/flights/FlightSearchResults.example.tsx`
- Tests: `lib/flights/dealScore.test.ts`
- Demo: `lib/flights/dealScore.demo.ts`

---

**Need help?** Check the [integration guide](./DEAL_SCORE_GUIDE.md) or review the [example implementations](../../components/flights/FlightSearchResults.example.tsx).
