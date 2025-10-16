# Alternative Airports Widget

A comprehensive React component that helps users discover nearby airports with better flight prices, including ground transportation costs and time estimates.

## Features

### Core Functionality
- ✅ Auto-detects nearby airports within 50-mile radius
- ✅ Calculates savings vs main airport (>15% threshold)
- ✅ Shows distance from main airport
- ✅ Includes ground transportation time/cost estimates
- ✅ Displays total journey cost (flight + transport)
- ✅ One-click switch to alternative airport
- ✅ Smart recommendations based on total cost
- ✅ Trilingual support (EN/PT/ES)

### Visual Design
- Compact collapsible card layout
- Green "Best Deal" badge for top savings
- Distance and transport icons
- Price comparison with visual progress bars
- Separate cards for cheapest vs fastest transport
- Responsive design for mobile/desktop

## Installation

The widget consists of two files:

1. **Component**: `components/flights/AlternativeAirports.tsx`
2. **Data Utility**: `lib/airports/alternatives.ts`

Both files are included in this implementation.

## Usage

### Basic Usage

```tsx
import AlternativeAirports from '@/components/flights/AlternativeAirports';

function FlightResultsPage() {
  const handleAirportSelect = (origin: string, destination: string) => {
    // Update search with new airports
    searchFlights(origin, destination);
  };

  return (
    <div>
      <AlternativeAirports
        originAirport="JFK"
        destinationAirport="LAX"
        currentPrice={450}
        onAirportSelect={handleAirportSelect}
        currency="USD"
        lang="en"
      />
      {/* Your flight results */}
    </div>
  );
}
```

### Props Interface

```typescript
interface AlternativeAirportsProps {
  originAirport: string;        // IATA code (e.g., "JFK")
  destinationAirport: string;   // IATA code (e.g., "LAX")
  currentPrice: number;          // Current flight price in selected currency
  onAirportSelect: (origin: string, destination: string) => void;
  currency?: string;             // Default: "USD"
  lang?: 'en' | 'pt' | 'es';    // Default: "en"
}
```

## Airport Coverage

The widget currently supports alternative airports for these cities:

### United States

#### New York Area
- **JFK** (John F. Kennedy International)
- **LGA** (LaGuardia)
- **EWR** (Newark Liberty International)

#### Los Angeles Area
- **LAX** (Los Angeles International)
- **BUR** (Hollywood Burbank)
- **SNA** (John Wayne - Orange County)
- **ONT** (Ontario International)

#### San Francisco Area
- **SFO** (San Francisco International)
- **OAK** (Oakland International)
- **SJC** (San Jose International)

#### Chicago Area
- **ORD** (O'Hare International)
- **MDW** (Midway International)

#### Washington DC Area
- **IAD** (Dulles International)
- **DCA** (Reagan National)
- **BWI** (Baltimore/Washington International)

#### Miami Area
- **MIA** (Miami International)
- **FLL** (Fort Lauderdale-Hollywood)
- **PBI** (Palm Beach International)

#### Other Cities
- **BOS** (Boston Logan) + MHT, PVD
- **IAH** (Houston Bush) + HOU
- **DFW** (Dallas/Fort Worth) + DAL

## Data Structure

### Airport Alternative Data

Each airport group contains:

```typescript
interface AirportGroup {
  main: Airport;
  alternatives: AlternativeAirport[];
}

interface AlternativeAirport {
  code: string;                    // IATA code
  name: string;                    // Full airport name
  city: string;                    // City name
  country: string;                 // Country
  distanceFromMain: number;        // Miles from main airport
  typicalPriceDifference: number;  // Percentage (-12 = 12% cheaper)
  transportOptions: TransportOption[];
}

interface TransportOption {
  type: 'train' | 'bus' | 'uber' | 'taxi' | 'shuttle';
  duration: number;                // Minutes
  cost: number;                    // USD
  provider?: string;               // e.g., "BART", "Uber"
  availability: 'always' | 'limited' | 'peak_only';
}
```

## Utility Functions

The `lib/airports/alternatives.ts` file provides several helper functions:

```typescript
// Get alternative airports for a given airport code
const alternatives = getAlternativeAirports('JFK');

// Check if an airport has alternatives
const hasAlts = hasAlternatives('LAX'); // boolean

// Get all airports in a group
const airportGroup = getAirportGroup('SFO'); // ['SFO', 'OAK', 'SJC']

// Get cheapest transport option
const cheapest = getCheapestTransport(alternativeAirport);

// Get fastest transport option
const fastest = getFastestTransport(alternativeAirport);

// Calculate total cost including transport
const totalCost = calculateTotalCost(flightPrice, transportCost, true);
```

## Customization

### Adding New Airports

To add new airports, edit `lib/airports/alternatives.ts`:

```typescript
export const AIRPORT_ALTERNATIVES: Record<string, AirportGroup> = {
  // ... existing airports ...

  'YYZ': { // Toronto Pearson
    main: {
      code: 'YYZ',
      name: 'Toronto Pearson International Airport',
      city: 'Toronto',
      country: 'Canada'
    },
    alternatives: [
      {
        code: 'YTZ',
        name: 'Billy Bishop Toronto City Airport',
        city: 'Toronto',
        country: 'Canada',
        distanceFromMain: 15,
        typicalPriceDifference: -10,
        transportOptions: [
          {
            type: 'uber',
            duration: 20,
            cost: 35,
            availability: 'always'
          }
        ]
      }
    ]
  }
};
```

### Styling

The component uses Tailwind CSS classes and supports dark mode. Key classes:

- Main container: `bg-gradient-to-br from-green-50 to-emerald-50`
- Best deal badge: `bg-green-600 text-white`
- Airport cards: `bg-white dark:bg-gray-800`

### Translations

To add a new language, add a new key to the `translations` object in `AlternativeAirports.tsx`:

```typescript
const translations = {
  en: { /* ... */ },
  pt: { /* ... */ },
  es: { /* ... */ },
  fr: { // New French translation
    title: 'Économisez avec les aéroports à proximité',
    // ... more translations
  }
};
```

## Advanced Integration

### Real-Time Price Fetching

Instead of using estimated prices, fetch real prices from your API:

```typescript
const [alternativePrices, setAlternativePrices] = useState<Record<string, number>>({});

useEffect(() => {
  async function fetchPrices() {
    const alternatives = getAlternativeAirports(originAirport);
    if (!alternatives) return;

    for (const alt of alternatives.alternatives) {
      const price = await fetchFlightPrice(alt.code, destinationAirport);
      setAlternativePrices(prev => ({ ...prev, [alt.code]: price }));
    }
  }

  fetchPrices();
}, [originAirport, destinationAirport]);

// Then pass real prices to the component
```

### Analytics Tracking

Track when users interact with the widget:

```typescript
const handleAirportSelect = (origin: string, destination: string) => {
  // Track analytics
  trackEvent('alternative_airport_selected', {
    from: `${originAirport}-${destinationAirport}`,
    to: `${origin}-${destination}`,
    estimatedSavings: calculateSavings(origin, destination)
  });

  // Update search
  searchFlights(origin, destination);
};
```

### A/B Testing

Test different placements and thresholds:

```typescript
// Test savings threshold
const SAVINGS_THRESHOLD = isTestGroupA ? 0.15 : 0.10;

// Test placement
const placement = isTestGroupA ? 'above-results' : 'below-results';
```

## Mobile Optimization

The component is responsive by default, but you can enhance mobile experience:

```tsx
// Show as full-screen modal on mobile
const [showModal, setShowModal] = useState(false);

return (
  <>
    {/* Mobile: Sticky CTA */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-green-600 p-4">
      <button onClick={() => setShowModal(true)}>
        💡 Save with nearby airports
      </button>
    </div>

    {/* Desktop: Inline widget */}
    <div className="hidden md:block">
      <AlternativeAirports {...props} />
    </div>

    {/* Mobile: Full-screen modal */}
    {showModal && (
      <div className="md:hidden fixed inset-0 bg-white z-50">
        <AlternativeAirports {...props} />
      </div>
    )}
  </>
);
```

## Performance Considerations

1. **Lazy Loading**: Only load when user scrolls to results
2. **Memoization**: Alternative calculations are memoized with `useMemo`
3. **Threshold**: 15% savings minimum reduces noise
4. **Limit**: Shows max 3 alternatives to avoid overwhelming users

## Browser Support

- Modern browsers with ES6+ support
- React 18+
- Tailwind CSS 3+
- TypeScript 4.5+

## Demo

A demo component is included at `components/flights/AlternativeAirportsDemo.tsx`:

```bash
# Add to your routes
app/demo/alternative-airports/page.tsx
```

```tsx
import AlternativeAirportsDemo from '@/components/flights/AlternativeAirportsDemo';

export default function DemoPage() {
  return <AlternativeAirportsDemo />;
}
```

## Examples

See `components/flights/AlternativeAirportsExample.tsx` for integration examples:

1. Flight search results page integration
2. Booking flow integration
3. Mobile-optimized integration
4. API integration examples

## Contributing

To add more airports:

1. Research nearby airports (within 50 miles)
2. Gather transport data (train, bus, Uber estimates)
3. Calculate typical price differences
4. Add to `AIRPORT_ALTERNATIVES` in `lib/airports/alternatives.ts`
5. Test with demo component

## License

Part of the Fly2Any project.

## Support

For issues or questions, please refer to the main project documentation.

---

**Last Updated**: 2025-10-14
**Version**: 1.0.0
