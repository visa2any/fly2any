# Flight Skeleton Components Usage Guide

## Components Created

### 1. FlightCardSkeleton.tsx
Location: `C:\Users\Power\fly2any-fresh\components\flights\FlightCardSkeleton.tsx`

**Exports:**
- `FlightCardSkeleton` - Single skeleton card
- `MultipleFlightCardSkeletons` - Multiple skeleton cards (default: 6)

### 2. ResultsSkeleton.tsx
Location: `C:\Users\Power\fly2any-fresh\components\flights\ResultsSkeleton.tsx`

**Features:**
- Complete loading state for flight results page
- Includes filters sidebar, search summary, sort bar, and flight cards
- Glass-morphism design with backdrop blur
- Responsive layout

## Usage Examples

### Example 1: Using FlightCardSkeleton Individually

```tsx
import FlightCardSkeleton from '@/components/flights/FlightCardSkeleton';

export default function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div>
      {isLoading ? (
        <FlightCardSkeleton />
      ) : (
        <FlightCard data={flightData} />
      )}
    </div>
  );
}
```

### Example 2: Using Multiple Flight Card Skeletons

```tsx
import { MultipleFlightCardSkeletons } from '@/components/flights/FlightCardSkeleton';

export default function FlightList() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div>
      {isLoading ? (
        <MultipleFlightCardSkeletons count={8} />
      ) : (
        flights.map(flight => <FlightCard key={flight.id} data={flight} />)
      )}
    </div>
  );
}
```

### Example 3: Using ResultsSkeleton for Full Page Loading

```tsx
import ResultsSkeleton from '@/components/flights/ResultsSkeleton';

export default function FlightSearchPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState(null);

  if (isLoading) {
    return <ResultsSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Your actual results UI */}
    </div>
  );
}
```

### Example 4: Integration with FlightResults Component

```tsx
import FlightResults from '@/components/flights/FlightResults';
import ResultsSkeleton from '@/components/flights/ResultsSkeleton';

export default function SearchResultsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [flights, setFlights] = useState([]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFlights();
      setFlights(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <ResultsSkeleton />
      ) : (
        <FlightResults
          offers={flights}
          onSelectFlight={handleSelectFlight}
          isLoading={false}
          lang="en"
        />
      )}
    </div>
  );
}
```

## Features

### Glass-Morphism Design
- Semi-transparent white background (`bg-white/40`)
- Backdrop blur effect (`backdrop-blur-sm`)
- Subtle borders (`border-2 border-gray-100`)

### Shimmer Animation
- Gradient background that moves from left to right
- Configured in Tailwind config as `animate-shimmer`
- Creates a professional loading effect

### Responsive Layout
- Mobile-first design
- Adapts to different screen sizes
- Maintains FlightCard dimensions and proportions

### Customization
- Easily adjust the number of skeleton cards with the `count` prop
- Modify colors and styling via Tailwind classes
- Animation speed can be changed in `tailwind.config.ts`

## Tailwind Animation Configuration

The shimmer animation is already configured in `tailwind.config.ts`:

```typescript
animation: {
  'shimmer': 'shimmer 2s infinite',
},
keyframes: {
  shimmer: {
    '0%': { backgroundPosition: '-1000px 0' },
    '100%': { backgroundPosition: '1000px 0' },
  },
}
```

No additional configuration needed!
