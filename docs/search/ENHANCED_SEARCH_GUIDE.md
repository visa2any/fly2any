# Enhanced Search & Filters - Complete Guide

**Team 1 Implementation**
**Version:** 1.0
**Last Updated:** 2025-11-10

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Features](#features)
5. [API Integration Guide](#api-integration-guide)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)
8. [Accessibility](#accessibility)
9. [Performance Optimization](#performance-optimization)
10. [Future Enhancements](#future-enhancements)

---

## Overview

The Enhanced Search & Filters system provides advanced flight search capabilities including multi-city trips, flexible dates, nearby airports, comprehensive filtering, flight comparison, and search history management.

### Key Features

- **Multi-City Search**: Plan complex itineraries with up to 5 flight segments
- **Flexible Dates**: View prices for ±3 days around selected dates
- **Nearby Airports**: Discover savings by searching airports within 100km
- **Advanced Filters**: 8+ filter categories with real-time application
- **Flight Comparison**: Compare up to 3 flights side-by-side
- **Search History**: Quick access to last 10 searches

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS
- **State Management**: React useState/useEffect
- **Storage**: localStorage for client-side persistence
- **Accessibility**: WCAG 2.1 AA compliant

---

## Architecture

### Directory Structure

```
fly2any-fresh/
├── app/
│   └── search/
│       └── multi-city/
│           └── page.tsx          # Multi-city search page
├── components/
│   └── search/
│       ├── FlexibleDatePicker.tsx
│       ├── NearbyAirportsToggle.tsx
│       ├── AdvancedFilters.tsx
│       ├── FlightComparison.tsx
│       └── SearchHistory.tsx
├── lib/
│   ├── types/
│   │   └── search.ts             # TypeScript type definitions
│   └── utils/
│       └── search-helpers.ts     # Helper functions
└── docs/
    └── search/
        └── ENHANCED_SEARCH_GUIDE.md
```

### Data Flow

```
User Input → Component State → Validation → API Call → Results → History
                ↓                                         ↓
            Local Filters                            localStorage
```

---

## Components

### 1. Multi-City Search Page

**File**: `app/search/multi-city/page.tsx`

**Purpose**: Full-page component for planning multi-city trips with multiple flight segments.

**Features**:
- Dynamic segment management (2-5 segments)
- Date sequence validation
- Real-time price calculation
- Form validation with error display
- Responsive grid layout

**Props**: None (page component)

**State Management**:
```typescript
const [segments, setSegments] = useState<FlightSegment[]>([]);
const [errors, setErrors] = useState<Record<string, string[]>>({});
const [searching, setSearching] = useState(false);
const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
```

**Key Functions**:
- `handleAddSegment()`: Adds new flight segment
- `handleRemoveSegment(id)`: Removes segment by ID
- `handleSegmentChange(id, field, value)`: Updates segment field
- `handleSearch()`: Validates and initiates search

**Validation Rules**:
1. Each segment must have from/to airports (3-letter codes)
2. From and to airports must be different
3. Date must be in the future
4. Each segment date must be after previous segment
5. Minimum 1 passenger per segment

**Usage**:
```tsx
// Navigate to multi-city search
router.push('/search/multi-city');
```

---

### 2. FlexibleDatePicker

**File**: `components/search/FlexibleDatePicker.tsx`

**Purpose**: Display prices for dates around a selected date with visual price comparison.

**Props**:
```typescript
interface FlexibleDatePickerProps {
  baseDate: Date;                    // Center date for comparison
  onDateSelect: (date: Date) => void; // Callback when date selected
  selectedDate?: Date;                // Currently selected date
  daysAround?: number;                // Days to show (default: 3)
  className?: string;
}
```

**Features**:
- Calendar grid showing 7 days (±3 from base date)
- Price display for each date
- Visual highlighting of cheapest date
- Quick select buttons (Cheapest, Weekend, Weekday)
- Availability indicators
- Percentage difference from cheapest

**State**:
```typescript
const [dates, setDates] = useState<DatePrice[]>([]);
const [loading, setLoading] = useState(true);
const [activeFilter, setActiveFilter] = useState<'all' | 'cheapest' | 'weekend' | 'weekday'>('all');
```

**Usage**:
```tsx
<FlexibleDatePicker
  baseDate={new Date('2025-06-15')}
  onDateSelect={(date) => setSelectedDate(date)}
  selectedDate={selectedDate}
  daysAround={3}
/>
```

**API Integration**:
```typescript
// TODO: Replace mock data with API call
const response = await fetch(
  `/api/flights/flexible-dates?date=${baseDate.toISOString()}&days=${daysAround}`
);
const data = await response.json();
// Expected response: DatePrice[]
```

---

### 3. NearbyAirportsToggle

**File**: `components/search/NearbyAirportsToggle.tsx`

**Purpose**: Show nearby airports within 100km with price comparison and savings calculation.

**Props**:
```typescript
interface NearbyAirportsToggleProps {
  airportCode: string;              // Primary airport code (e.g., 'LAX')
  currentPrice: number;              // Price from primary airport
  onAirportSelect?: (code: string) => void; // Callback when airport selected
  className?: string;
}
```

**Features**:
- Toggle to enable/disable nearby search
- List of nearby airports with distance
- Price comparison with primary airport
- Savings calculation and display
- Visual indicators for best deals
- Responsive card layout

**State**:
```typescript
const [enabled, setEnabled] = useState(false);
const [nearbyAirports, setNearbyAirports] = useState<NearbyAirport[]>([]);
const [loading, setLoading] = useState(false);
const [selectedAirport, setSelectedAirport] = useState<string>(airportCode);
```

**Usage**:
```tsx
<NearbyAirportsToggle
  airportCode="LAX"
  currentPrice={450}
  onAirportSelect={(code) => handleAirportChange(code)}
/>
```

**API Integration**:
```typescript
// TODO: Replace mock data with API call
const response = await fetch(
  `/api/airports/nearby?code=${airportCode}&radius=100`
);
const data = await response.json();
// Expected response: NearbyAirport[]
```

---

### 4. AdvancedFilters

**File**: `components/search/AdvancedFilters.tsx`

**Purpose**: Comprehensive filtering system with multiple categories and real-time application.

**Props**:
```typescript
interface AdvancedFiltersProps {
  filters: FlightFilters;            // Current filter state
  onChange: (filters: FlightFilters) => void; // Callback when filters change
  onClose?: () => void;              // Optional close callback
  className?: string;
}
```

**Filter Categories**:

1. **Airlines** (Multi-select)
   - American Airlines, Delta, United, British Airways, Lufthansa, Air France, Emirates, Qatar, Singapore, Cathay Pacific

2. **Number of Stops**
   - Nonstop
   - 1 Stop
   - 2+ Stops

3. **Flight Duration** (Slider)
   - Range: 1h - 24h
   - Step: 30 minutes

4. **Departure Time** (Multi-select)
   - Morning (6am-12pm)
   - Afternoon (12pm-6pm)
   - Evening (6pm-10pm)
   - Night (10pm-6am)

5. **Arrival Time** (Multi-select)
   - Same options as departure

6. **Aircraft Type** (Multi-select)
   - Boeing 737, 747, 777, 787
   - Airbus A320, A330, A350, A380

7. **Baggage**
   - Checked baggage included
   - No checked baggage
   - Any

8. **Price Range** (Slider)
   - Range: $0 - $10,000

**Features**:
- Collapsible sections for better UX
- Active filter count badges
- Clear all filters button
- Save filter preferences
- Real-time filter application

**State**:
```typescript
const [localFilters, setLocalFilters] = useState<FlightFilters>(filters);
const [expandedSections, setExpandedSections] = useState<Set<string>>(
  new Set(['airlines', 'stops'])
);
```

**Usage**:
```tsx
<AdvancedFilters
  filters={filters}
  onChange={(newFilters) => setFilters(newFilters)}
  onClose={() => setShowFilters(false)}
/>
```

**Filter Application**:
```typescript
import { applyFilters } from '@/lib/utils/search-helpers';

const filteredFlights = applyFilters(allFlights, filters);
```

---

### 5. FlightComparison

**File**: `components/search/FlightComparison.tsx`

**Purpose**: Side-by-side comparison of up to 3 flights with detailed attribute breakdown.

**Props**:
```typescript
interface FlightComparisonProps {
  flights: FlightForComparison[];    // Array of flights to compare (max 3)
  onRemove: (id: string) => void;    // Remove flight from comparison
  onBook: (id: string) => void;      // Book selected flight
  onClose?: () => void;              // Optional close callback
  className?: string;
}
```

**Comparison Attributes**:
- Price (highlighted cheapest)
- Departure airport & time
- Arrival airport & time
- Duration (highlighted fastest)
- Number of stops (highlighted fewest)
- Aircraft type
- Baggage allowance
- Amenities (WiFi, Entertainment, Power outlets)
- Fare class
- Quick book action

**Features**:
- Desktop: Table view with side-by-side columns
- Mobile: Card view with stacked comparison
- Visual highlighting of best values
- Green badges for best price, fastest, fewest stops
- Responsive layout with accessibility

**State**:
```typescript
const maxFlights = 3;
const bestPrice = Math.min(...flights.map(f => f.price));
const bestDuration = Math.min(...flights.map(f => f.duration));
const fewestStops = Math.min(...flights.map(f => f.stops));
```

**Usage**:
```tsx
const [compareFlights, setCompareFlights] = useState<FlightForComparison[]>([]);

<FlightComparison
  flights={compareFlights}
  onRemove={(id) => setCompareFlights(flights.filter(f => f.id !== id))}
  onBook={(id) => handleBookFlight(id)}
  onClose={() => setShowComparison(false)}
/>
```

---

### 6. SearchHistory

**File**: `components/search/SearchHistory.tsx`

**Purpose**: Display and manage recent searches with quick re-search functionality.

**Props**:
```typescript
interface SearchHistoryProps {
  onSearchSelect: (search: SearchHistoryItem) => void; // Callback when search selected
  className?: string;
}
```

**Features**:
- Display last 10 searches
- Search type icons (one-way, round-trip, multi-city)
- Search details (route, dates, passengers)
- Quick re-search button
- Individual item removal
- Clear all history with confirmation
- localStorage persistence
- Empty state handling

**State**:
```typescript
const [history, setHistory] = useState<SearchHistoryItem[]>([]);
const [showConfirm, setShowConfirm] = useState(false);
```

**Usage**:
```tsx
<SearchHistory
  onSearchSelect={(search) => {
    // Populate search form with historical data
    setFrom(search.from);
    setTo(search.to);
    setDate(search.date);
    // ... etc
  }}
/>
```

**Storage Functions**:
```typescript
import {
  getSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
  removeSearchFromHistory,
} from '@/lib/utils/search-helpers';

// Save search
saveSearchToHistory({
  id: Date.now().toString(),
  type: 'round-trip',
  from: 'LAX',
  to: 'JFK',
  date: new Date('2025-06-15'),
  returnDate: new Date('2025-06-22'),
  passengers: 2,
  class: 'economy',
  timestamp: new Date(),
});

// Get history
const history = getSearchHistory();

// Clear all
clearSearchHistory();

// Remove one
removeSearchFromHistory('123456789');
```

---

## Features

### Multi-City Search

**Description**: Plan trips with multiple destinations in sequence.

**Key Capabilities**:
- Add 2-5 flight segments dynamically
- Auto-populate next segment's departure from previous arrival
- Chronological date validation
- Independent passenger and class selection per segment
- Total price calculation across all segments
- Visual flow indicators between segments

**Technical Details**:

Segment Validation:
```typescript
// Each segment is validated independently
const validation = validateSegment(segment);
if (!validation.valid) {
  // Display errors: missing airports, invalid dates, etc.
}

// Then validate date sequence across all segments
const dateValidation = validateSegmentDates(segments);
if (!dateValidation.valid) {
  // Display error: dates not in sequence
}
```

Price Calculation:
```typescript
const totalPrice = calculateMultiCityPrice(segments);
// Formula: Base price × passengers × class multiplier × complexity factor
```

**User Flow**:
1. Navigate to `/search/multi-city`
2. Fill in first two segments (minimum required)
3. Optionally add more segments (up to 5 total)
4. Validate dates are in sequence
5. Click "Search Flights"
6. View estimated price and results

---

### Flexible Date Search

**Description**: Compare prices across multiple dates to find the best deal.

**Key Capabilities**:
- View prices for ±3 days around selected date
- Visual calendar grid with prices
- Automatic cheapest date highlighting
- Quick select filters (Cheapest, Weekend, Weekday)
- Percentage comparison from base price
- Availability indicators

**Technical Details**:

Date Generation:
```typescript
const dates = generateFlexibleDates(baseDate, daysAround);
// Returns DatePrice[] with price and availability for each date
```

Price Analysis:
```typescript
const cheapest = findCheapestDate(dates);
const weekendDates = filterByDayType(dates, 'weekend');
const cheapestWeekend = findCheapestDate(weekendDates);
```

**User Flow**:
1. Select base date in search form
2. Component loads prices for surrounding dates
3. Review calendar grid with price indicators
4. Use quick select or click date directly
5. Selected date updates search form

**Visual Indicators**:
- **Blue border**: Selected date
- **Green ring**: Cheapest date
- **Blue background**: Weekend dates
- **Percentage badge**: Price difference from cheapest
- **"N/A" text**: Unavailable dates

---

### Nearby Airports Search

**Description**: Find cheaper flights by considering airports within 100km.

**Key Capabilities**:
- Toggle to enable nearby airport search
- Display airports within 100km radius
- Show distance from primary airport
- Calculate savings compared to primary
- Visual savings indicators
- Best deal highlighting

**Technical Details**:

Airport Loading:
```typescript
const nearbyAirports = getNearbyAirports(airportCode);
// Returns NearbyAirport[] with code, name, distance, price
```

Savings Calculation:
```typescript
const { bestDeal, savings } = calculateNearbyAirportSavings(
  currentPrice,
  nearbyAirports
);
// Returns best alternative and amount saved
```

**User Flow**:
1. Toggle "Include Nearby Airports" switch
2. System loads nearby airports within 100km
3. Review list with distances and prices
4. Compare savings with primary airport
5. Select preferred airport
6. Search updates with selected airport

**Display Format**:
```
[Selected Badge] LAX - Los Angeles International
Price: $450
---
BUR - Hollywood Burbank Airport
45km from LAX | Price: $420 | Save $30 (7%)
---
LGB - Long Beach Airport
35km from LAX | Price: $430 | Save $20 (4%)
```

---

### Advanced Filters

**Description**: Comprehensive filtering system with 8+ categories.

**Key Capabilities**:
- Multiple filter categories
- Real-time filter application
- Filter count badges
- Collapsible sections for better UX
- Save/load filter preferences
- Clear all filters button

**Filter Logic**:

The `applyFilters` function chains multiple filter checks:

```typescript
function applyFilters(
  flights: FlightForComparison[],
  filters: FlightFilters
): FlightForComparison[] {
  return flights.filter((flight) => {
    // Airline check
    if (filters.airlines.length > 0) {
      if (!filters.airlines.includes(flight.airline)) return false;
    }

    // Stops check
    if (filters.stops.includes('nonstop') && flight.stops !== 0) return false;

    // Duration check
    if (flight.duration < filters.durationRange.min) return false;
    if (flight.duration > filters.durationRange.max) return false;

    // Time of day checks
    if (filters.departureTime.length > 0) {
      if (!isTimeInRanges(departureHour, filters.departureTime)) return false;
    }

    // ... additional checks for arrival time, aircraft, baggage, price

    return true; // Flight passes all filters
  });
}
```

**Filter Persistence**:

```typescript
// Save preferences
const preferences = {
  id: Date.now().toString(),
  name: 'Weekend Direct Flights',
  filters: currentFilters,
  createdAt: new Date(),
};
localStorage.setItem('filter_preferences', JSON.stringify([preferences]));

// Load preferences
const saved = JSON.parse(localStorage.getItem('filter_preferences') || '[]');
```

**User Flow**:
1. Open advanced filters panel
2. Select desired filter criteria
3. Filters apply in real-time to results
4. View active filter count in badge
5. Optionally save as preset
6. Clear all or remove individual filters

---

### Flight Comparison

**Description**: Compare up to 3 flights side-by-side with detailed breakdown.

**Key Capabilities**:
- Select up to 3 flights from results
- Side-by-side comparison table (desktop)
- Stacked card view (mobile)
- Highlight best values (price, duration, stops)
- Detailed attribute comparison
- Quick book from comparison

**Comparison Attributes**:

| Attribute | Description | Highlighted When |
|-----------|-------------|------------------|
| Price | Total fare | Lowest price |
| Departure | Airport, time, date | N/A |
| Arrival | Airport, time, date | N/A |
| Duration | Total flight time | Shortest duration |
| Stops | Number of connections | Fewest stops |
| Aircraft | Plane model | N/A |
| Baggage | Checked and cabin allowance | N/A |
| Amenities | WiFi, entertainment, etc. | N/A |
| Fare Class | Economy, business, etc. | N/A |

**Technical Implementation**:

```typescript
// Calculate best values for highlighting
const bestPrice = Math.min(...flights.map(f => f.price));
const bestDuration = Math.min(...flights.map(f => f.duration));
const fewestStops = Math.min(...flights.map(f => f.stops));

// Apply highlighting conditionally
className={flight.price === bestPrice ? 'bg-green-50' : ''}
```

**User Flow**:
1. From search results, select flights to compare
2. Comparison panel opens/updates
3. Review side-by-side attributes
4. Note highlighted best values
5. Click "Book Now" on preferred flight
6. Remove flights or close comparison

---

### Search History

**Description**: Track and quickly re-execute recent searches.

**Key Capabilities**:
- Store last 10 searches
- Display search type, route, dates, passengers
- Quick re-search functionality
- Individual item removal
- Clear all with confirmation
- localStorage persistence
- Search type icons

**Storage Schema**:

```typescript
interface SearchHistoryItem {
  id: string;              // Unique identifier
  type: 'one-way' | 'round-trip' | 'multi-city';
  from: string;            // Departure airport
  to: string;              // Arrival airport
  date: Date;              // Departure date
  returnDate?: Date;       // Return date (round-trip only)
  segments?: FlightSegment[]; // Segments (multi-city only)
  passengers: number;
  class: string;
  timestamp: Date;         // When search was performed
}
```

**Technical Details**:

Max Items Management:
```typescript
// Always keep only last 10 searches
history.unshift(newSearch);
const trimmed = history.slice(0, 10);
localStorage.setItem('flight_search_history', JSON.stringify(trimmed));
```

Date Parsing:
```typescript
// localStorage stores dates as strings, parse on retrieval
const history = JSON.parse(stored).map(item => ({
  ...item,
  date: new Date(item.date),
  returnDate: item.returnDate ? new Date(item.returnDate) : undefined,
  timestamp: new Date(item.timestamp),
}));
```

**User Flow**:
1. Perform any flight search
2. Search automatically saved to history
3. Access history component
4. Click on past search to re-populate form
5. Optionally remove individual items
6. Clear all history if needed

---

## API Integration Guide

All components currently use mock data for development. Follow these steps to integrate with real APIs.

### 1. Multi-City Search API

**Endpoint**: `POST /api/flights/multi-city`

**Request Body**:
```json
{
  "segments": [
    {
      "from": "LAX",
      "to": "JFK",
      "date": "2025-06-15",
      "passengers": 2,
      "class": "economy"
    },
    {
      "from": "JFK",
      "to": "LHR",
      "date": "2025-06-20",
      "passengers": 2,
      "class": "economy"
    }
  ]
}
```

**Response**:
```json
{
  "results": [
    {
      "id": "multi-123",
      "segments": [
        {
          "flight": { /* FlightForComparison */ },
          "price": 450
        },
        {
          "flight": { /* FlightForComparison */ },
          "price": 650
        }
      ],
      "totalPrice": 1100,
      "currency": "USD"
    }
  ]
}
```

**Integration Location**:
```typescript
// File: app/search/multi-city/page.tsx
// Line: ~145 (handleSearch function)

const response = await fetch('/api/flights/multi-city', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ segments }),
});
const data = await response.json();
```

---

### 2. Flexible Dates API

**Endpoint**: `GET /api/flights/flexible-dates`

**Query Parameters**:
- `date`: ISO string of base date
- `days`: Number of days around base (default: 3)
- `from`: Departure airport code
- `to`: Arrival airport code

**Example**:
```
GET /api/flights/flexible-dates?date=2025-06-15T00:00:00Z&days=3&from=LAX&to=JFK
```

**Response**:
```json
{
  "dates": [
    {
      "date": "2025-06-12T00:00:00Z",
      "price": 320,
      "available": true
    },
    {
      "date": "2025-06-13T00:00:00Z",
      "price": 298,
      "available": true
    },
    // ... more dates
  ]
}
```

**Integration Location**:
```typescript
// File: components/search/FlexibleDatePicker.tsx
// Line: ~35 (loadFlexibleDates function)

const response = await fetch(
  `/api/flights/flexible-dates?date=${baseDate.toISOString()}&days=${daysAround}&from=${from}&to=${to}`
);
const data = await response.json();
setDates(data.dates);
```

---

### 3. Nearby Airports API

**Endpoint**: `GET /api/airports/nearby`

**Query Parameters**:
- `code`: Primary airport code
- `radius`: Search radius in km (default: 100)

**Example**:
```
GET /api/airports/nearby?code=LAX&radius=100
```

**Response**:
```json
{
  "primaryAirport": "LAX",
  "nearbyAirports": [
    {
      "code": "BUR",
      "name": "Hollywood Burbank Airport",
      "city": "Burbank",
      "distanceKm": 45,
      "price": 420,
      "available": true
    },
    // ... more airports
  ]
}
```

**Integration Location**:
```typescript
// File: components/search/NearbyAirportsToggle.tsx
// Line: ~30 (loadNearbyAirports function)

const response = await fetch(
  `/api/airports/nearby?code=${airportCode}&radius=100`
);
const data = await response.json();
setNearbyAirports(data.nearbyAirports);
```

---

### 4. Flight Search with Filters API

**Endpoint**: `POST /api/flights/search`

**Request Body**:
```json
{
  "from": "LAX",
  "to": "JFK",
  "date": "2025-06-15",
  "passengers": 2,
  "class": "economy",
  "filters": {
    "airlines": ["AA", "DL"],
    "stops": ["nonstop"],
    "durationRange": { "min": 0, "max": 480 },
    "departureTime": ["morning", "afternoon"],
    "baggageIncluded": true
  }
}
```

**Response**:
```json
{
  "results": [
    {
      "id": "flight-123",
      "airline": "AA",
      "flightNumber": "AA100",
      "departure": {
        "airport": "LAX",
        "time": "2025-06-15T08:00:00Z"
      },
      "arrival": {
        "airport": "JFK",
        "time": "2025-06-15T16:30:00Z"
      },
      "duration": 330,
      "stops": 0,
      "price": 450,
      "baggage": { "checked": 1, "cabin": 1 },
      "amenities": ["WiFi", "Entertainment"],
      "aircraftType": "Boeing 737",
      "fareClass": "Economy"
    }
  ],
  "total": 15,
  "page": 1
}
```

**Integration Location**:
```typescript
// Apply filters client-side after fetching
import { applyFilters } from '@/lib/utils/search-helpers';

const response = await fetch('/api/flights/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(searchParams),
});
const data = await response.json();

// Apply additional client-side filters
const filtered = applyFilters(data.results, userFilters);
```

---

## Usage Examples

### Example 1: Basic Multi-City Search

```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const router = useRouter();

  const handleMultiCitySearch = () => {
    router.push('/search/multi-city');
  };

  return (
    <button onClick={handleMultiCitySearch}>
      Plan Multi-City Trip
    </button>
  );
}
```

---

### Example 2: Flexible Date Picker in Search Form

```tsx
'use client';

import { useState } from 'react';
import FlexibleDatePicker from '@/components/search/FlexibleDatePicker';

export default function SearchForm() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFlexible, setShowFlexible] = useState(false);

  return (
    <div>
      <input
        type="date"
        value={selectedDate.toISOString().split('T')[0]}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
      />

      <button onClick={() => setShowFlexible(!showFlexible)}>
        Show Flexible Dates
      </button>

      {showFlexible && (
        <FlexibleDatePicker
          baseDate={selectedDate}
          onDateSelect={(date) => {
            setSelectedDate(date);
            setShowFlexible(false);
          }}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
```

---

### Example 3: Complete Search with All Features

```tsx
'use client';

import { useState } from 'react';
import FlexibleDatePicker from '@/components/search/FlexibleDatePicker';
import NearbyAirportsToggle from '@/components/search/NearbyAirportsToggle';
import AdvancedFilters from '@/components/search/AdvancedFilters';
import FlightComparison from '@/components/search/FlightComparison';
import SearchHistory from '@/components/search/SearchHistory';
import { FlightFilters, DEFAULT_FILTERS, FlightForComparison } from '@/lib/types/search';

export default function FullSearchPage() {
  const [from, setFrom] = useState('LAX');
  const [to, setTo] = useState('JFK');
  const [date, setDate] = useState(new Date());
  const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);
  const [compareFlights, setCompareFlights] = useState<FlightForComparison[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="container mx-auto p-4">
      {/* Search History */}
      <SearchHistory
        onSearchSelect={(search) => {
          setFrom(search.from);
          setTo(search.to);
          setDate(search.date);
        }}
      />

      {/* Main Search Form */}
      <div className="mt-6 space-y-4">
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
        />
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
        />

        {/* Flexible Date Picker */}
        <FlexibleDatePicker
          baseDate={date}
          onDateSelect={setDate}
          selectedDate={date}
        />

        {/* Nearby Airports */}
        <NearbyAirportsToggle
          airportCode={from}
          currentPrice={450}
          onAirportSelect={(code) => setFrom(code)}
        />

        {/* Advanced Filters */}
        <button onClick={() => setShowFilters(!showFilters)}>
          Advanced Filters
        </button>
        {showFilters && (
          <AdvancedFilters
            filters={filters}
            onChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>

      {/* Flight Comparison */}
      {compareFlights.length > 0 && (
        <FlightComparison
          flights={compareFlights}
          onRemove={(id) =>
            setCompareFlights(compareFlights.filter((f) => f.id !== id))
          }
          onBook={(id) => console.log('Book flight:', id)}
        />
      )}
    </div>
  );
}
```

---

## Testing

### Unit Tests

Create tests for helper functions:

```typescript
// lib/utils/__tests__/search-helpers.test.ts

import {
  validateSegment,
  validateSegmentDates,
  calculateMultiCityPrice,
  findCheapestDate,
  applyFilters,
} from '../search-helpers';

describe('validateSegment', () => {
  it('should validate a correct segment', () => {
    const segment = {
      id: '1',
      from: 'LAX',
      to: 'JFK',
      date: new Date('2025-06-15'),
      passengers: 2,
      class: 'economy' as const,
    };

    const result = validateSegment(segment);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject same from/to airports', () => {
    const segment = {
      id: '1',
      from: 'LAX',
      to: 'LAX',
      date: new Date('2025-06-15'),
      passengers: 2,
      class: 'economy' as const,
    };

    const result = validateSegment(segment);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Departure and arrival airports must be different');
  });
});

describe('validateSegmentDates', () => {
  it('should validate chronological dates', () => {
    const segments = [
      {
        id: '1',
        from: 'LAX',
        to: 'JFK',
        date: new Date('2025-06-15'),
        passengers: 2,
        class: 'economy' as const,
      },
      {
        id: '2',
        from: 'JFK',
        to: 'LHR',
        date: new Date('2025-06-20'),
        passengers: 2,
        class: 'economy' as const,
      },
    ];

    const result = validateSegmentDates(segments);
    expect(result.valid).toBe(true);
  });

  it('should reject non-chronological dates', () => {
    const segments = [
      {
        id: '1',
        from: 'LAX',
        to: 'JFK',
        date: new Date('2025-06-20'),
        passengers: 2,
        class: 'economy' as const,
      },
      {
        id: '2',
        from: 'JFK',
        to: 'LHR',
        date: new Date('2025-06-15'),
        passengers: 2,
        class: 'economy' as const,
      },
    ];

    const result = validateSegmentDates(segments);
    expect(result.valid).toBe(false);
  });
});
```

### Component Tests

```typescript
// components/search/__tests__/FlexibleDatePicker.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import FlexibleDatePicker from '../FlexibleDatePicker';

describe('FlexibleDatePicker', () => {
  it('renders calendar grid', () => {
    render(
      <FlexibleDatePicker
        baseDate={new Date('2025-06-15')}
        onDateSelect={() => {}}
      />
    );

    expect(screen.getByText('Flexible Dates')).toBeInTheDocument();
    expect(screen.getByText('Cheapest')).toBeInTheDocument();
    expect(screen.getByText('Weekend')).toBeInTheDocument();
  });

  it('calls onDateSelect when date clicked', () => {
    const mockSelect = jest.fn();
    render(
      <FlexibleDatePicker
        baseDate={new Date('2025-06-15')}
        onDateSelect={mockSelect}
      />
    );

    const dateButtons = screen.getAllByRole('gridcell');
    fireEvent.click(dateButtons[0]);

    expect(mockSelect).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
// e2e/multi-city-search.test.ts

import { test, expect } from '@playwright/test';

test('multi-city search flow', async ({ page }) => {
  await page.goto('/search/multi-city');

  // Fill first segment
  await page.fill('input[placeholder="LAX"]', 'LAX');
  await page.fill('input[placeholder="JFK"]', 'JFK');

  // Add second segment
  await page.click('text=Add Another Flight');

  // Fill second segment
  const inputs = page.locator('input[placeholder="LAX"]');
  await inputs.nth(1).fill('JFK');

  // Submit search
  await page.click('text=Search Flights');

  // Verify navigation or results
  await expect(page).toHaveURL(/search\/results/);
});
```

---

## Accessibility

All components follow WCAG 2.1 AA standards.

### Keyboard Navigation

- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons and select options
- **Arrow keys**: Navigate within date pickers and option groups
- **Escape**: Close modals and overlays

### Screen Reader Support

```tsx
// Proper ARIA labels
<button
  onClick={handleSearch}
  aria-label="Search multi-city flights"
>
  Search
</button>

// ARIA roles
<div role="grid" aria-label="Flexible date calendar">
  {/* Date cells */}
</div>

// State indicators
<button
  role="switch"
  aria-checked={enabled}
  aria-label="Toggle nearby airports search"
>
  {/* Toggle switch */}
</button>
```

### Focus Management

```tsx
// Focus trap in modals
useEffect(() => {
  if (isOpen) {
    const firstFocusable = modalRef.current?.querySelector('button, input');
    (firstFocusable as HTMLElement)?.focus();
  }
}, [isOpen]);
```

### Color Contrast

All text meets minimum contrast ratios:
- Normal text: 4.5:1
- Large text: 3:1
- Interactive elements: Clear hover/focus states

---

## Performance Optimization

### Code Splitting

```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic';

const AdvancedFilters = dynamic(
  () => import('@/components/search/AdvancedFilters'),
  { loading: () => <div>Loading filters...</div> }
);
```

### Memoization

```tsx
import { useMemo } from 'react';

const filteredFlights = useMemo(
  () => applyFilters(flights, filters),
  [flights, filters]
);
```

### Debouncing

```tsx
import { useDebounce } from '@/hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  // API call with debounced value
  searchFlights(debouncedSearch);
}, [debouncedSearch]);
```

### Virtual Scrolling

For large result sets:

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={flights.length}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => (
    <FlightCard flight={flights[index]} style={style} />
  )}
</FixedSizeList>
```

---

## Future Enhancements

### Phase 2 Features

1. **Price Alerts**
   - Watch specific routes
   - Email notifications for price drops
   - Historical price tracking

2. **Smart Recommendations**
   - AI-powered suggestions
   - Best time to book
   - Alternative route recommendations

3. **Advanced Multi-City**
   - Open-jaw itineraries
   - Multiple passengers with different routes
   - Split ticketing optimization

4. **Filter Presets**
   - Save custom filter combinations
   - Quick apply saved presets
   - Share presets with other users

5. **Map View**
   - Interactive route map
   - Nearby airport visualization
   - Visual price comparison

6. **Calendar Heatmap**
   - Full month price view
   - Identify cheapest travel periods
   - Holiday pricing indicators

### Technical Debt

- Replace mock data with real API calls
- Add comprehensive error handling
- Implement retry logic for failed requests
- Add analytics tracking
- Performance monitoring
- A/B testing framework

---

## Support & Maintenance

### Common Issues

**Issue**: Dates not validating in multi-city search
**Solution**: Ensure dates are Date objects, not strings. Use `new Date()` constructor.

**Issue**: Filters not applying
**Solution**: Verify `applyFilters` is called with correct parameters. Check console for errors.

**Issue**: Search history not persisting
**Solution**: Check localStorage is enabled. Verify `saveSearchToHistory` is called after search.

### Debug Mode

Enable debug logging:

```typescript
// Add to .env.local
NEXT_PUBLIC_DEBUG_SEARCH=true

// In components
if (process.env.NEXT_PUBLIC_DEBUG_SEARCH) {
  console.log('Search params:', searchParams);
  console.log('Applied filters:', filters);
}
```

### Contact

For questions or issues with this implementation:
- Team: Team 1 - Enhanced Search & Filters
- Documentation: `/docs/search/ENHANCED_SEARCH_GUIDE.md`
- Code Location: See [Directory Structure](#directory-structure)

---

## Appendix

### Type Reference

Full type definitions in `lib/types/search.ts`:

- `FlightSegment`
- `FlightFilters`
- `FlightForComparison`
- `SearchHistoryItem`
- `DatePrice`
- `NearbyAirport`
- `TimeOfDay`
- `StopFilter`

### Helper Function Reference

Full implementations in `lib/utils/search-helpers.ts`:

- `validateSegment()`
- `validateSegmentDates()`
- `calculateMultiCityPrice()`
- `generateFlexibleDates()`
- `findCheapestDate()`
- `filterByDayType()`
- `getNearbyAirports()`
- `applyFilters()`
- `countActiveFilters()`
- `saveSearchToHistory()`
- `getSearchHistory()`
- `formatDuration()`
- `formatPrice()`
- `formatDate()`

---

**End of Enhanced Search & Filters Guide**
**Version 1.0 | Team 1 | 2025-11-10**
