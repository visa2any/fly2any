# Flight Search Components - Usage Guide

> Comprehensive documentation for Fly2Any flight search components, utilities, and types

## Table of Contents

1. [Components](#components)
   - [FlightCard](#flightcard)
   - [FlightFilters](#flightfilters)
   - [SortBar](#sortbar)
   - [SearchSummaryBar](#searchsummarybar)
   - [PriceInsights](#priceinsights)
   - [FlightCardSkeleton](#flightcardskeleton)
2. [Utility Functions](#utility-functions)
3. [Type Definitions](#type-definitions)
4. [Constants](#constants)
5. [Best Practices](#best-practices)

---

## Components

### FlightCard

**Purpose**: Display comprehensive flight offer information with interactive UI, badges, pricing, and expandable details.

#### Props Interface

```typescript
interface FlightCardProps {
  // Required
  id: string;                           // Unique flight offer ID
  price: FlightPrice;                   // Pricing information
  outbound: FlightItinerary;            // Outbound flight details
  validatingAirline: ValidatingAirline; // Primary airline info

  // Optional
  inbound?: FlightItinerary;            // Return flight (for round-trips)
  numberOfBookableSeats?: number;       // Available seats (default: 9)
  badges?: BadgeType[];                 // Display badges
  cabin?: string;                       // Cabin class (default: 'ECONOMY')
  fareClass?: string;                   // Fare class code
  onSelectFlight?: (id: string) => void; // Flight selection handler
  onViewDetails?: (id: string) => void;  // Details view handler
  lang?: 'en' | 'pt' | 'es';            // Language (default: 'en')
  className?: string;                   // Additional CSS classes
}

// Supporting types
type BadgeType = 'BEST_VALUE' | 'CHEAPEST' | 'FASTEST' | 'LIMITED_SEATS' | 'DIRECT';

interface FlightPrice {
  total: string;          // Total price
  currency: string;       // Currency code
  base?: string;          // Base fare
  fees?: string;          // Additional fees
  originalPrice?: string; // For showing savings
}

interface FlightItinerary {
  duration: string;           // ISO 8601 duration (e.g., 'PT8H30M')
  segments: FlightSegment[];  // Array of flight segments
  stops?: number;             // Number of stops
}

interface ValidatingAirline {
  name: string;  // Airline name
  code: string;  // IATA code
  logo?: string; // Logo URL
}
```

#### Usage Example

```tsx
import { FlightCard } from '@/components/flights/FlightCard';

function FlightResults() {
  const handleSelectFlight = (id: string) => {
    console.log('Selected flight:', id);
    // Navigate to booking or add to cart
  };

  const handleViewDetails = (id: string) => {
    console.log('Viewing details for:', id);
    // Show detailed flight information modal
  };

  return (
    <FlightCard
      id="flight-123"
      price={{
        total: "599.99",
        currency: "USD",
        base: "499.99",
        fees: "100.00",
        originalPrice: "699.99" // Shows savings
      }}
      outbound={{
        duration: "PT8H30M",
        segments: [{
          departure: {
            iataCode: "JFK",
            at: "2024-03-15T14:30:00",
            terminal: "4"
          },
          arrival: {
            iataCode: "LAX",
            at: "2024-03-15T17:45:00",
            terminal: "5"
          },
          carrierCode: "AA",
          number: "123",
          duration: "PT5H15M"
        }]
      }}
      validatingAirline={{
        name: "American Airlines",
        code: "AA",
        logo: "/airlines/aa-logo.png"
      }}
      numberOfBookableSeats={3}
      badges={['BEST_VALUE', 'DIRECT']}
      cabin="ECONOMY"
      fareClass="Y"
      onSelectFlight={handleSelectFlight}
      onViewDetails={handleViewDetails}
      lang="en"
    />
  );
}
```

#### Styling

**Tailwind Classes Used**:
- Container: `bg-white/90 backdrop-blur-md rounded-2xl border-2 shadow-lg`
- Hover effects: `hover:shadow-2xl hover:border-primary-400 hover:scale-[1.02]`
- Glass morphism: `bg-gradient-to-br from-white/80 via-transparent to-primary-50/20`
- Responsive: `flex-col lg:flex-row`, `text-center lg:text-left`

**Customization Options**:
```tsx
// Custom styling
<FlightCard
  className="my-custom-class max-w-4xl mx-auto"
  {...props}
/>

// Override colors via Tailwind config
// Update primary colors in tailwind.config.ts
```

#### State Management

**Internal State**:
- `isHovered`: Boolean for hover effects
- `showDetails`: Boolean for expandable segment details

**State Flow**:
1. User hovers card → `setIsHovered(true)` → Border glow appears
2. User clicks "View Details" → `setShowDetails(!showDetails)` → Segments expand
3. User clicks "Select Flight" → `onSelectFlight(id)` called → Parent handles navigation

#### Mobile Behavior

**Responsive Breakpoints**:
- Mobile (<1024px): Vertical stacking, centered text, full-width buttons
- Desktop (>=1024px): Horizontal layout, side-by-side info, inline buttons

**Touch Optimizations**:
- Larger tap targets (min 44px height)
- Swipeable details section
- Bottom sheet-style expansion on mobile

#### Accessibility

**ARIA Labels**:
```tsx
// Implicit labels via semantic HTML
<button aria-label="Select American Airlines flight AA123">
  Select Flight
</button>

// Screen reader announcements
<div role="region" aria-label="Flight details">
  {/* Flight information */}
</div>
```

**Keyboard Navigation**:
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close details view

#### Performance

**Optimization Techniques**:
1. **Memoization**: Component uses React.FC with no unnecessary re-renders
2. **Conditional Rendering**: Details only rendered when `showDetails` is true
3. **CSS Transitions**: Hardware-accelerated transforms
4. **Image Optimization**: Logo images should use Next.js `Image` component

```tsx
// Performance best practice
import Image from 'next/image';

{validatingAirline.logo && (
  <Image
    src={validatingAirline.logo}
    alt={validatingAirline.name}
    width={32}
    height={32}
    className="object-contain"
  />
)}
```

#### Common Issues

**Issue**: Badges not displaying
- **Solution**: Ensure `badges` prop is an array of valid `BadgeType` values

**Issue**: Time formatting shows "Invalid Date"
- **Solution**: Verify ISO 8601 format for all `at` timestamps

**Issue**: Card doesn't expand on click
- **Solution**: Ensure `onViewDetails` prop is provided or remove the button

---

### FlightFilters

**Purpose**: Advanced filtering sidebar with price range, stops, airlines, departure time, and duration controls.

#### Props Interface

```typescript
interface FlightFiltersProps {
  // Required
  filters: FlightFilters;                 // Current filter state
  onFiltersChange: (filters: FlightFilters) => void; // Update handler
  flightData: FlightOffer[];              // Flight data for calculations

  // Optional
  resultCounts?: {                        // Result counts per filter
    stops: {
      direct: number;
      '1-stop': number;
      '2+-stops': number
    };
    airlines: Record<string, number>;
    departureTime: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number
    };
  };
  lang?: 'en' | 'pt' | 'es';             // Language (default: 'en')
}

interface FlightFilters {
  priceRange: [number, number];                        // Min/max price
  stops: ('direct' | '1-stop' | '2+-stops')[];         // Selected stop options
  airlines: string[];                                  // Selected airline codes
  departureTime: ('morning' | 'afternoon' | 'evening' | 'night')[]; // Time slots
  maxDuration: number;                                 // Max flight duration (hours)
}
```

#### Usage Example

```tsx
import FlightFilters from '@/components/flights/FlightFilters';
import { useState } from 'react';

function FlightSearchPage() {
  const [filters, setFilters] = useState<FlightFilters>({
    priceRange: [0, 2000],
    stops: [],
    airlines: [],
    departureTime: [],
    maxDuration: 24
  });

  const [flights, setFlights] = useState<FlightOffer[]>([/* flight data */]);

  const handleFiltersChange = (newFilters: FlightFilters) => {
    setFilters(newFilters);
    // Apply filters to flight data
    const filtered = applyFilters(flights, newFilters);
    setFilteredFlights(filtered);
  };

  // Optional: Calculate result counts dynamically
  const resultCounts = {
    stops: {
      direct: flights.filter(f => getStopCount(f) === 0).length,
      '1-stop': flights.filter(f => getStopCount(f) === 1).length,
      '2+-stops': flights.filter(f => getStopCount(f) >= 2).length,
    },
    airlines: getAirlineCounts(flights),
    departureTime: getDepartureTimeCounts(flights),
  };

  return (
    <div className="flex gap-6">
      <FlightFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        flightData={flights}
        resultCounts={resultCounts}
        lang="en"
      />

      <div className="flex-1">
        {/* Flight results */}
      </div>
    </div>
  );
}
```

#### Styling

**Desktop Layout**:
```tsx
// Sticky sidebar with glass morphism
className="sticky top-24 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 max-h-[calc(100vh-7rem)] overflow-y-auto"
```

**Mobile Layout**:
- Floating button (bottom-right): Fixed position with pulse animation for active filters
- Bottom sheet: Slides up from bottom with backdrop blur
- Smooth animations: `animate-slideUp`, `animate-fadeIn`

#### State Management

**Local State**:
- `localFilters`: Temporary filter state (synced with props)
- `isMobileOpen`: Mobile bottom sheet visibility

**State Synchronization**:
```tsx
useEffect(() => {
  setLocalFilters(filters); // Sync with parent on prop change
}, [filters]);
```

**Immediate vs Deferred Updates**:
- Price/Duration sliders: Update immediately on change
- Checkboxes: Update immediately on toggle
- Mobile: Apply on "Apply Filters" button click

#### Mobile Behavior

**Floating Action Button**:
- Shows active filter indicator badge
- Pulse animation when filters active
- Fixed position: `fixed bottom-20 right-4 z-40`

**Bottom Sheet**:
- Max height: 85vh
- Scrollable content area
- Sticky "Apply Filters" button at bottom
- Backdrop dismissal on click

#### Accessibility

**Form Controls**:
```tsx
// Checkboxes with labels
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    checked={filters.stops.includes('direct')}
    onChange={() => handleStopsToggle('direct')}
    className="w-5 h-5 text-primary-600 rounded"
    aria-label="Filter for direct flights only"
  />
  <span>Direct</span>
</label>

// Range sliders with values
<input
  type="range"
  min={minPrice}
  max={maxPrice}
  value={filters.priceRange[0]}
  aria-label="Minimum price filter"
  aria-valuemin={minPrice}
  aria-valuemax={maxPrice}
  aria-valuenow={filters.priceRange[0]}
/>
```

#### Performance

**Optimization Techniques**:
1. **Debouncing**: Price slider updates debounced to avoid excessive re-renders
2. **Memoization**: Airline list and price calculations memoized
3. **Virtual Scrolling**: For large airline lists (if needed)

```tsx
// Debounced price update example
import { useDebouncedCallback } from 'use-debounce';

const debouncedPriceChange = useDebouncedCallback(
  (newRange: [number, number]) => {
    onFiltersChange({ ...filters, priceRange: newRange });
  },
  300 // 300ms delay
);
```

#### Common Issues

**Issue**: Filters not resetting
- **Solution**: Implement `handleResetAll` function that resets to initial state

**Issue**: Mobile bottom sheet not dismissing
- **Solution**: Add backdrop click handler with `setIsMobileOpen(false)`

**Issue**: Airline list not scrolling
- **Solution**: Add `overflow-y-auto` and `max-h-48` classes

---

### SortBar

**Purpose**: Horizontal sort option selector with visual indicators and tooltips.

#### Props Interface

```typescript
interface SortBarProps {
  currentSort: SortOption;               // Active sort option
  onChange: (sort: SortOption) => void;  // Sort change handler
  resultCount?: number;                  // Number of results to display
  lang?: 'en' | 'pt' | 'es';            // Language (default: 'en')
}

type SortOption = 'best' | 'cheapest' | 'fastest' | 'earliest';
```

#### Usage Example

```tsx
import SortBar from '@/components/flights/SortBar';
import { useState } from 'react';

function FlightResults() {
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [flights, setFlights] = useState<Flight[]>([/* ... */]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);

    // Sort flights based on criteria
    const sorted = [...flights].sort((a, b) => {
      switch (newSort) {
        case 'best':
          return b.score.best - a.score.best;
        case 'cheapest':
          return a.price.total - b.price.total;
        case 'fastest':
          return a.metadata.totalDuration - b.metadata.totalDuration;
        case 'earliest':
          return new Date(a.departure).getTime() - new Date(b.departure).getTime();
        default:
          return 0;
      }
    });

    setFlights(sorted);
  };

  return (
    <div>
      <SortBar
        currentSort={sortBy}
        onChange={handleSortChange}
        resultCount={flights.length}
        lang="en"
      />

      {/* Flight cards */}
      {flights.map(flight => <FlightCard key={flight.id} {...flight} />)}
    </div>
  );
}
```

#### Styling

**Container**:
- Glass morphism background with gradient
- Scrollable horizontal layout (mobile)
- Gradient fade on right edge (mobile scroll hint)

**Button States**:
```tsx
// Active
className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105"

// Inactive (hover)
className="bg-white/50 text-gray-700 hover:bg-white hover:shadow-md hover:scale-102"
```

#### State Management

**No Internal State**: Fully controlled component
- Parent manages `currentSort` state
- Updates via `onChange` callback

#### Mobile Behavior

**Horizontal Scroll**:
```css
.scroll-smooth {
  scroll-behavior: smooth;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

**Scroll Indicator**:
- Gradient fade on right edge when scrollable
- Hidden on desktop (all options visible)

#### Accessibility

**ARIA Attributes**:
```tsx
<button
  aria-label="Best - AI Score"
  aria-pressed={currentSort === 'best'}
  role="button"
>
  <Sparkles className="w-5 h-5" />
  <span>Best</span>
</button>
```

**Keyboard Navigation**:
- Arrow keys to navigate between options
- Enter/Space to select
- Focus indicators visible

#### Performance

**Icon Optimization**:
- Uses `lucide-react` for tree-shakeable icons
- Icons animated on hover with CSS transforms

```tsx
import { Sparkles, DollarSign, Zap, Clock } from 'lucide-react';

<Sparkles
  className="w-5 h-5 transition-transform group-hover:rotate-12"
  strokeWidth={2.5}
/>
```

#### Common Issues

**Issue**: Sort not updating flights
- **Solution**: Ensure parent component re-sorts data when `onChange` fires

**Issue**: Icons not animating
- **Solution**: Add `group` class to button and `group-hover:` prefix to icon

---

### SearchSummaryBar

**Purpose**: Sticky header showing search parameters with modify option.

#### Props Interface

```typescript
interface SearchSummaryBarProps {
  // Route
  origin: string;                    // Origin airport code
  destination: string;               // Destination airport code

  // Dates
  departureDate: string;             // ISO date string
  returnDate?: string;               // ISO date string (optional)

  // Passengers
  passengers: PassengerCounts;

  // Cabin
  cabinClass: 'economy' | 'premium' | 'business' | 'first';

  // Actions
  onModifySearch: () => void;        // Modify search handler

  // Optional
  lang?: 'en' | 'pt' | 'es';        // Language (default: 'en')
  sticky?: boolean;                  // Enable sticky behavior (default: true)
}

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}
```

#### Usage Example

```tsx
import SearchSummaryBar from '@/components/flights/SearchSummaryBar';
import { useRouter } from 'next/navigation';

function FlightResultsPage() {
  const router = useRouter();
  const searchParams = {
    origin: 'JFK',
    destination: 'LAX',
    departureDate: '2024-03-15',
    returnDate: '2024-03-22',
    passengers: {
      adults: 2,
      children: 1,
      infants: 0
    },
    cabinClass: 'economy' as const
  };

  const handleModifySearch = () => {
    // Navigate back to search form with pre-filled data
    router.push('/search?prefill=true');
    // Or open modal with search form
  };

  return (
    <div>
      <SearchSummaryBar
        {...searchParams}
        onModifySearch={handleModifySearch}
        lang="en"
        sticky={true}
      />

      {/* Flight results */}
    </div>
  );
}
```

#### Styling

**Sticky Behavior**:
```tsx
className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b shadow-sm"
```

**Desktop Layout** (>=1024px):
- Single horizontal line
- All info visible side-by-side
- Dividers between sections

**Mobile Layout** (<1024px):
- Vertical stacking
- Route on first row with modify button
- Grid layout for details (2-3 columns)

#### State Management

**No Internal State**: Stateless presentation component
- All data from props
- Action delegated to parent via `onModifySearch`

#### Mobile Behavior

**Responsive Grid**:
```tsx
className="grid grid-cols-2 sm:grid-cols-3 gap-2"
```

**Truncation**:
- Text truncated with ellipsis on small screens
- Icons always visible (flex-shrink-0)

#### Accessibility

**Semantic HTML**:
```tsx
<div role="region" aria-label="Search summary">
  <div className="flex items-center gap-2">
    <Plane aria-hidden="true" />
    <span>{origin} → {destination}</span>
  </div>
</div>
```

#### Performance

**Date Formatting**:
```tsx
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
```

#### Common Issues

**Issue**: Dates showing incorrect timezone
- **Solution**: Use UTC dates or ensure consistent timezone handling

**Issue**: Passenger text not pluralizing correctly
- **Solution**: Check `getPassengerText()` function logic for singular/plural

---

### PriceInsights

**Purpose**: AI-powered price trend analysis with predictions and recommendations.

#### Props Interface

```typescript
interface PriceInsightsProps {
  route: FlightRoute;              // Route information
  statistics: PriceStatistics;     // Price data and trends
  currency?: string;               // Currency code (default: 'USD')
  lang?: 'en' | 'pt' | 'es';      // Language (default: 'en')
  className?: string;              // Additional CSS classes
}

interface FlightRoute {
  from: string;        // Origin airport code
  to: string;          // Destination airport code
  departureDate: string; // ISO date
}

interface PriceStatistics {
  currentPrice: number;             // Current price
  averagePrice: number;             // Average price
  lowestPrice: number;              // Lowest price in history
  highestPrice: number;             // Highest price in history
  priceHistory: PriceHistoryPoint[]; // Historical data
  trendPercentage: number;          // Trend percentage (+/-)
  trend: PriceTrend;                // 'rising' | 'stable' | 'falling'
}

interface PriceHistoryPoint {
  date: string;  // ISO date
  price: number; // Price on that date
}

type PriceTrend = 'rising' | 'stable' | 'falling';
type BookingRecommendation = 'book_now' | 'wait' | 'monitor';
```

#### Usage Example

```tsx
import PriceInsights from '@/components/flights/PriceInsights';

function FlightDetailsPage() {
  const route = {
    from: 'JFK',
    to: 'LAX',
    departureDate: '2024-03-15'
  };

  const statistics = {
    currentPrice: 450,
    averagePrice: 520,
    lowestPrice: 380,
    highestPrice: 720,
    priceHistory: [
      { date: '2024-02-15', price: 520 },
      { date: '2024-02-20', price: 490 },
      { date: '2024-02-25', price: 510 },
      { date: '2024-03-01', price: 475 },
      { date: '2024-03-05', price: 450 },
    ],
    trendPercentage: 15,
    trend: 'rising' as const
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PriceInsights
        route={route}
        statistics={statistics}
        currency="USD"
        lang="en"
      />
    </div>
  );
}
```

#### Styling

**Color Schemes by Trend**:
```tsx
// Rising (red/error)
bg-gradient-to-r from-error via-error/90 to-error

// Stable (yellow/warning)
bg-gradient-to-r from-warning via-warning/90 to-warning

// Falling (green/success)
bg-gradient-to-r from-success via-success/90 to-success
```

**Animations**:
- `animate-pulse`: High urgency predictions
- `animate-shimmer`: Background shimmer effect
- `animate-fadeIn`: Component entrance

#### State Management

**Internal State**:
- `isVisible`: Controls fade-in animation
- `isPulsing`: High urgency pulse animation

**Calculations**:
```tsx
const priceComparison = calculatePriceComparison(currentPrice, averagePrice);
const recommendation = getRecommendation(trend, priceComparison);
const urgencyLevel = getUrgencyLevel(trend, trendPercentage);
```

#### Mobile Behavior

**Responsive Grid**:
- Desktop: 2-column layout for trend/recommendation
- Mobile: Single column stack

**Chart Scaling**:
- SVG viewBox for responsive scaling
- Maintains aspect ratio on all devices

#### Accessibility

**Color Contrast**:
- All text meets WCAA AA standards
- Icons supplement color-coded information

**Screen Reader Text**:
```tsx
<div role="status" aria-live="polite">
  Prices likely to rise 15% in next 48 hours. Book now recommended.
</div>
```

#### Performance

**Chart Optimization**:
```tsx
// Use SVG for vector graphics (scalable)
<svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
  {/* Path calculations done once, not on every render */}
</svg>
```

**Conditional Rendering**:
```tsx
{statistics.priceHistory.length > 0 && (
  <PriceHistoryChart history={statistics.priceHistory} />
)}
```

#### Common Issues

**Issue**: Chart not displaying
- **Solution**: Ensure `priceHistory` has at least 2 data points

**Issue**: Wrong currency symbol
- **Solution**: Pass correct `currency` prop ('USD', 'EUR', etc.)

**Issue**: Recommendations not updating
- **Solution**: Recalculate when `statistics` prop changes

---

### FlightCardSkeleton

**Purpose**: Loading placeholder for FlightCard with shimmer animation.

#### Props Interface

```typescript
// No props - standalone component
export default function FlightCardSkeleton(): JSX.Element;

// Multi-skeleton wrapper
export function MultipleFlightCardSkeletons({
  count?: number // Number of skeletons (default: 6)
}): JSX.Element;
```

#### Usage Example

```tsx
import FlightCardSkeleton, { MultipleFlightCardSkeletons } from '@/components/flights/FlightCardSkeleton';

function FlightResults() {
  const { data: flights, isLoading } = useFlights();

  if (isLoading) {
    return <MultipleFlightCardSkeletons count={6} />;
  }

  return (
    <div className="space-y-4">
      {flights.map(flight => (
        <FlightCard key={flight.id} {...flight} />
      ))}
    </div>
  );
}
```

#### Styling

**Shimmer Animation**:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

#### Performance

**Best Practices**:
1. Use during initial load only
2. Transition smoothly to actual content
3. Match skeleton height to expected content height

```tsx
// Smooth transition
<div className={isLoading ? 'opacity-100' : 'opacity-0 transition-opacity'}>
  {isLoading && <FlightCardSkeleton />}
</div>
<div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}>
  {!isLoading && <FlightCard {...data} />}
</div>
```

---

## Utility Functions

### Duration Formatting

#### `formatDuration(duration: string): string`

**Purpose**: Convert ISO 8601 duration to human-readable format.

```typescript
// lib/flights/utils.ts
import { formatDuration } from '@/lib/flights/utils';

formatDuration('PT8H30M');  // Returns '8h 30m'
formatDuration('PT2H');      // Returns '2h'
formatDuration('PT45M');     // Returns '45m'
```

#### `parseDurationToMinutes(duration: string): number`

**Purpose**: Convert ISO 8601 duration to total minutes.

```typescript
parseDurationToMinutes('PT8H30M');  // Returns 510
parseDurationToMinutes('PT2H');      // Returns 120
```

### Time Formatting

#### `formatTime(isoDate: string): string`

**Purpose**: Extract time from ISO datetime in 24-hour format.

```typescript
formatTime('2024-03-15T14:30:00');  // Returns '14:30'
```

#### `formatTime12Hour(isoDate: string): string`

**Purpose**: Format time in 12-hour format with AM/PM.

```typescript
formatTime12Hour('2024-03-15T14:30:00');  // Returns '2:30 PM'
```

### Date Formatting

#### `formatDate(isoDate: string, format?: 'short' | 'medium' | 'long'): string`

**Purpose**: Format date in various styles.

```typescript
formatDate('2024-03-15T14:30:00');           // Returns 'Mar 15, 2024'
formatDate('2024-03-15T14:30:00', 'short');  // Returns '3/15/24'
formatDate('2024-03-15T14:30:00', 'long');   // Returns 'March 15, 2024'
```

### Layover Calculations

#### `calculateLayoverTime(segment1: FlightSegment, segment2: FlightSegment): number`

**Purpose**: Calculate layover duration between segments in minutes.

```typescript
const layoverMinutes = calculateLayoverTime(segment1, segment2);
// Returns 90 for 1.5 hour layover
```

#### `getLayoverInfo(segment1: FlightSegment, segment2: FlightSegment): LayoverInfo | null`

**Purpose**: Get detailed layover information.

```typescript
const layover = getLayoverInfo(segment1, segment2);
// Returns:
// {
//   airport: 'ORD',
//   duration: 90,
//   durationFormatted: '1h 30m',
//   isLong: false,
//   isOvernight: false
// }
```

### Airport/Airline Lookups

#### `getAirportName(code: string): string`

**Purpose**: Get full airport name from IATA code.

```typescript
getAirportName('JFK');  // Returns 'John F. Kennedy International Airport'
getAirportName('LAX');  // Returns 'Los Angeles International Airport'
```

#### `getAirlineName(code: string): string`

**Purpose**: Get full airline name from IATA code.

```typescript
getAirlineName('AA');  // Returns 'American Airlines'
getAirlineName('DL');  // Returns 'Delta Air Lines'
```

### Price Calculations

#### `calculateSavings(originalPrice: number, currentPrice: number)`

**Purpose**: Calculate savings amount and percentage.

```typescript
const savings = calculateSavings(500, 350);
// Returns: { amount: 150, percentage: 30 }
```

#### `formatPrice(amount: number, currency?: string): string`

**Purpose**: Format price with currency symbol and thousands separators.

```typescript
formatPrice(1234.56, 'USD');  // Returns '$1,234.56'
formatPrice(1234.56, 'EUR');  // Returns '€1,234.56'
```

### Time Analysis

#### `getTimeOfDay(isoDate: string): 'morning' | 'afternoon' | 'evening' | 'night' | 'red-eye'`

**Purpose**: Categorize flight time.

```typescript
getTimeOfDay('2024-03-15T07:30:00');  // Returns 'morning'
getTimeOfDay('2024-03-15T23:00:00');  // Returns 'red-eye'
```

#### `isOvernightFlight(departureTime: string, arrivalTime: string): boolean`

**Purpose**: Check if flight crosses midnight.

```typescript
isOvernightFlight(
  '2024-03-15T23:00:00',
  '2024-03-16T05:00:00'
);  // Returns true
```

---

## Type Definitions

### Core Types

Full type definitions are available in `lib/flights/types.ts`.

**Key Types**:

```typescript
// Flight Segment
interface FlightSegment {
  departure: AirportLocation;
  arrival: AirportLocation;
  carrierCode: string;
  number: string;
  aircraft?: { code: string };
  duration?: string;
}

// Flight Offer (Amadeus API response)
interface FlightOffer {
  id: string;
  itineraries: FlightItinerary[];
  price: FlightPrice;
  numberOfBookableSeats?: number;
  validatingAirlineCodes?: string[];
  travelerPricings?: TravelerPricing[];
}

// Scored Flight (with AI analysis)
interface ScoredFlight extends FlightOffer {
  score: {
    best: number;      // 0-100
    cheapest: number;  // 0-100
    fastest: number;   // 0-100
    overall: number;   // 0-100
  };
  badges: string[];
  metadata: {
    totalDuration: number;
    pricePerHour: number;
    stopCount: number;
    departureTimeScore: number;
  };
}

// Search Parameters
interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  currencyCode?: string;
  maxResults?: number;
  nonStop?: boolean;
}
```

---

## Constants

### Badge Configuration

```typescript
// lib/flights/constants.ts
export const BADGE_CONFIG = {
  'Best Value': {
    color: 'bg-green-100 text-green-700',
    icon: '⭐',
    priority: 1,
  },
  'Lowest Price': {
    color: 'bg-blue-100 text-blue-700',
    icon: '💰',
    priority: 2,
  },
  // ... more badges
} as const;
```

### Time Ranges

```typescript
export const TIME_OF_DAY_RANGES = {
  morning: { start: 5, end: 12, label: 'Morning (5am-12pm)' },
  afternoon: { start: 12, end: 17, label: 'Afternoon (12pm-5pm)' },
  evening: { start: 17, end: 22, label: 'Evening (5pm-10pm)' },
  night: { start: 22, end: 5, label: 'Night (10pm-5am)' },
} as const;
```

### Airline Data

```typescript
export const AIRLINE_DATA = {
  'AA': { name: 'American Airlines', alliance: 'Oneworld', country: 'USA' },
  'DL': { name: 'Delta Air Lines', alliance: 'SkyTeam', country: 'USA' },
  'UA': { name: 'United Airlines', alliance: 'Star Alliance', country: 'USA' },
  // ... 50+ airlines
} as const;
```

### Airport Data

```typescript
export const AIRPORT_DATA = {
  'JFK': {
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'USA',
    region: 'North America'
  },
  // ... 60+ major airports
} as const;
```

---

## Best Practices

### Component Integration

**1. Data Flow**
```tsx
// ✅ Good: Unidirectional data flow
function FlightSearchPage() {
  const [filters, setFilters] = useState<FlightFilters>(initialFilters);
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [flights, setFlights] = useState<Flight[]>([]);

  // Fetch flights based on filters
  useEffect(() => {
    fetchFlights(filters).then(setFlights);
  }, [filters]);

  // Sort flights when sort option changes
  const sortedFlights = useMemo(() => {
    return sortFlights(flights, sortBy);
  }, [flights, sortBy]);

  return (
    <>
      <FlightFilters filters={filters} onFiltersChange={setFilters} />
      <SortBar currentSort={sortBy} onChange={setSortBy} />
      {sortedFlights.map(flight => <FlightCard {...flight} />)}
    </>
  );
}
```

**2. Error Handling**
```tsx
// ✅ Good: Graceful error handling
function FlightCard({ price, ...props }: FlightCardProps) {
  try {
    const formattedPrice = formatPrice(parseFloat(price.total), price.currency);
    return <div>{formattedPrice}</div>;
  } catch (error) {
    console.error('Price formatting error:', error);
    return <div>Price unavailable</div>;
  }
}
```

**3. Performance**
```tsx
// ✅ Good: Memoize expensive calculations
const scoredFlights = useMemo(() => {
  return flights.map(flight => calculateFlightScore(flight, flights));
}, [flights]);

// ✅ Good: Debounce filter updates
const debouncedFilterChange = useDebouncedCallback(
  (newFilters) => onFiltersChange(newFilters),
  300
);
```

**4. Accessibility**
```tsx
// ✅ Good: Semantic HTML + ARIA
<button
  onClick={handleSelect}
  aria-label={`Select ${airline} flight ${flightNumber} for ${price}`}
  aria-pressed={isSelected}
>
  Select Flight
</button>

// ✅ Good: Keyboard navigation
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSelect();
    }
  }}
>
  {/* ... */}
</div>
```

**5. Mobile Optimization**
```tsx
// ✅ Good: Mobile-first responsive design
<div className="
  flex flex-col gap-4           /* Mobile: vertical stack */
  lg:flex-row lg:items-center   /* Desktop: horizontal */
">
  {/* ... */}
</div>

// ✅ Good: Touch-friendly targets
<button className="
  min-h-[44px] min-w-[44px]    /* WCAG minimum touch target */
  px-6 py-4                     /* Comfortable padding */
">
  Select
</button>
```

**6. Loading States**
```tsx
// ✅ Good: Progressive loading with skeletons
function FlightResults() {
  const { data, isLoading, error } = useFlights();

  if (error) return <ErrorMessage error={error} />;

  if (isLoading) return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <MultipleFlightCardSkeletons count={6} />
    </div>
  );

  if (!data?.length) return <EmptyState />;

  return data.map(flight => <FlightCard key={flight.id} {...flight} />);
}
```

### Testing Recommendations

**Unit Tests**
```typescript
// Test utility functions
describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration('PT8H30M')).toBe('8h 30m');
  });

  it('handles hours only', () => {
    expect(formatDuration('PT2H')).toBe('2h');
  });
});

// Test scoring logic
describe('calculateFlightScore', () => {
  it('assigns highest score to best overall flight', () => {
    const flights = [cheapFlight, fastFlight, balancedFlight];
    const scored = flights.map(f => calculateFlightScore(f, flights));
    expect(scored[2].score.best).toBeGreaterThan(scored[0].score.best);
  });
});
```

**Component Tests**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import FlightCard from '@/components/flights/FlightCard';

describe('FlightCard', () => {
  it('calls onSelectFlight when button clicked', () => {
    const handleSelect = jest.fn();
    render(<FlightCard {...mockProps} onSelectFlight={handleSelect} />);

    fireEvent.click(screen.getByText('Select Flight'));
    expect(handleSelect).toHaveBeenCalledWith(mockProps.id);
  });

  it('expands details when View Details clicked', () => {
    render(<FlightCard {...mockProps} />);

    fireEvent.click(screen.getByText('View Details'));
    expect(screen.getByText(/Flight Details/i)).toBeInTheDocument();
  });
});
```

---

## File Locations

```
fly2any-fresh/
├── components/flights/
│   ├── FlightCard.tsx              # Main flight card component
│   ├── FlightCardSkeleton.tsx      # Loading skeleton
│   ├── FlightFilters.tsx           # Filter sidebar
│   ├── SortBar.tsx                 # Sort options bar
│   ├── SearchSummaryBar.tsx        # Search summary header
│   └── PriceInsights.tsx           # AI price analysis
│
├── lib/flights/
│   ├── types.ts                    # TypeScript interfaces
│   ├── utils.ts                    # Utility functions
│   ├── constants.ts                # Constants and configs
│   └── scoring.ts                  # AI scoring algorithms
│
└── docs/
    └── COMPONENT_GUIDE.md          # This file
```

---

## Additional Resources

- **Amadeus API Docs**: https://developers.amadeus.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/
- **Next.js**: https://nextjs.org/docs

---

**Last Updated**: 2024-03-15
**Version**: 1.0.0
**Maintainer**: Fly2Any Development Team
