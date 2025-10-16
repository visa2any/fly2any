# AirportAutocompleteCompact

A compact, inline-friendly airport autocomplete component designed specifically for search bars and compact layouts.

## Features

- **Compact Design**: 42px height, no label, optimized for inline use
- **Smart Search**: Real-time filtering across airport codes, cities, names, and countries
- **Proper Z-Index**: Dropdown appears at z-[70] to avoid conflicts
- **Smooth Animations**: Fade-in and slide-in effects
- **Click Outside to Close**: Automatic closing when clicking outside the component
- **Keyboard Navigation**: Arrow keys, Enter, and Escape support
- **Responsive**: Auto width that fits within parent containers
- **Lucide Icons**: Clean, modern icons for visual enhancement

## Design Specifications

### Input Field
- Background: `bg-gray-50`
- Border: `border-gray-200`
- Rounded: `rounded-lg`
- Height: `42px`
- Focus State: `border-primary-500`, `ring-2 ring-primary-100`

### Dropdown
- Background: `white`
- Shadow: `shadow-xl`
- Rounded: `rounded-xl`
- Max Height: `320px` (80 units)
- Z-Index: `z-[70]`

### Airport Items
- Default: White background
- Hover: `bg-gray-50`
- Selected/Highlighted: `bg-primary-50 text-primary-700`

## Props

```typescript
interface Props {
  placeholder: string;        // Placeholder text for the input
  value: string;             // Current value
  onChange: (code: string, airport?: Airport) => void;  // Callback when value changes
  className?: string;        // Additional CSS classes (optional)
}

interface Airport {
  code: string;      // IATA code (e.g., "JFK")
  name: string;      // Full airport name
  city: string;      // City name
  country: string;   // Country name
  emoji: string;     // Visual emoji identifier
}
```

## Usage Example

```tsx
import { useState } from 'react';
import { AirportAutocompleteCompact } from '@/components/search/AirportAutocompleteCompact';

function MySearchBar() {
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');

  return (
    <div className="flex gap-4">
      <AirportAutocompleteCompact
        placeholder="From"
        value={fromAirport}
        onChange={(value, airport) => {
          setFromAirport(value);
          if (airport) {
            console.log('Departure:', airport.code, airport.city);
          }
        }}
        className="w-64"
      />

      <AirportAutocompleteCompact
        placeholder="To"
        value={toAirport}
        onChange={(value, airport) => {
          setToAirport(value);
          if (airport) {
            console.log('Arrival:', airport.code, airport.city);
          }
        }}
        className="w-64"
      />
    </div>
  );
}
```

## In a Search Bar Layout

```tsx
<div className="bg-white rounded-xl shadow-lg p-4">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <AirportAutocompleteCompact
      placeholder="Departure city"
      value={from}
      onChange={setFrom}
    />

    <AirportAutocompleteCompact
      placeholder="Arrival city"
      value={to}
      onChange={setTo}
    />

    <button className="h-[42px] bg-primary-600 text-white rounded-lg">
      Search Flights
    </button>
  </div>
</div>
```

## Keyboard Shortcuts

- `↓` Arrow Down: Navigate to next suggestion
- `↑` Arrow Up: Navigate to previous suggestion
- `Enter`: Select highlighted suggestion
- `Escape`: Close dropdown

## Airport Data

The component includes 15 popular international airports:
- JFK (New York)
- LAX (Los Angeles)
- LHR (London Heathrow)
- CDG (Paris Charles de Gaulle)
- DXB (Dubai)
- NRT (Tokyo Narita)
- SIN (Singapore Changi)
- MIA (Miami)
- SFO (San Francisco)
- ORD (Chicago O'Hare)
- BCN (Barcelona)
- FCO (Rome Fiumicino)
- SYD (Sydney)
- YYZ (Toronto)
- FRA (Frankfurt)

## Differences from Standard AirportAutocomplete

| Feature | Standard | Compact |
|---------|----------|---------|
| Label | Yes | No |
| Height | 56px+ | 42px |
| Padding | Large | Compact |
| Icon Size | 20px | 16px |
| Explore Option | Optional | No |
| Use Case | Forms | Search bars |

## File Location

- Component: `components/search/AirportAutocompleteCompact.tsx`
- Example: `components/search/AirportAutocompleteCompact.example.tsx`
- Documentation: `components/search/AirportAutocompleteCompact.README.md`

## Dependencies

- React (hooks: useState, useEffect, useRef)
- Lucide React (Plane, MapPin icons)
- Tailwind CSS (styling)

## Notes

- The component automatically shows the top 6 popular airports when empty
- Search filters across code, city, name, and country fields
- The dropdown appears below the input with proper spacing (mt-1)
- Click outside detection automatically closes the dropdown
- Value format: `CODE - City` (e.g., "JFK - New York")
