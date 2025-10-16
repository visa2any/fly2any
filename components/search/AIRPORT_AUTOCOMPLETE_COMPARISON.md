# Airport Autocomplete Component Comparison

## Component Variants

This directory contains two airport autocomplete components optimized for different use cases:

### 1. AirportAutocomplete (Standard)
**File**: `AirportAutocomplete.tsx`

**Best For**:
- Full-featured forms
- Standalone search sections
- Pages with ample space
- When labels are needed

**Key Features**:
- Includes label above input
- Larger padding and spacing
- Optional "Explore Anywhere" feature
- API integration with fallback
- Height: ~56px+
- Icons: Medium size (20px)

**Props**:
```typescript
{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, airport?: Airport) => void;
  icon?: React.ReactNode;
  showExplore?: boolean;
}
```

---

### 2. AirportAutocompleteCompact (Compact)
**File**: `AirportAutocompleteCompact.tsx`

**Best For**:
- Search bars
- Navigation components
- Compact layouts
- Mobile-optimized interfaces

**Key Features**:
- No label (inline-friendly)
- Compact padding
- Fixed 42px height
- Auto width
- Lucide React icons
- Simplified design
- Z-index optimized (z-[70])

**Props**:
```typescript
{
  placeholder: string;
  value: string;
  onChange: (code: string, airport?: Airport) => void;
  className?: string;
}
```

---

## Visual Comparison

### Standard Component Layout
```
┌─────────────────────────────┐
│ From                        │ ← Label
│ ┌─────────────────────────┐ │
│ │ 🛫  New York, NY       │ │ ← 56px+ height
│ └─────────────────────────┘ │
│ ┌──────────────────────────┐ ← Dropdown (z-50)
│ │ 🌍 Explore Anywhere      │
│ │ 🗽 JFK - New York       │
│ │ 🌴 LAX - Los Angeles    │
│ └──────────────────────────┘
└─────────────────────────────┘
```

### Compact Component Layout
```
┌──────────────────────┐
│ ✈️  New York, NY    │ ← 42px height, no label
└──────────────────────┘
┌──────────────────────┐ ← Dropdown (z-[70])
│ 🗽 JFK - New York   📍│
│ 🌴 LAX - Los Angeles 📍│
└──────────────────────┘
```

---

## Feature Comparison Matrix

| Feature                  | Standard          | Compact           |
|--------------------------|-------------------|-------------------|
| **Height**               | 56px+             | 42px              |
| **Width**                | w-full            | auto              |
| **Label**                | ✅ Required       | ❌ None           |
| **Icon Size**            | 20px              | 16px              |
| **Padding**              | Large (py-4)      | Compact (py-2)    |
| **Border**               | 2px               | 1px               |
| **Dropdown Z-Index**     | z-50              | z-[70]            |
| **Explore Option**       | ✅ Optional       | ❌ No             |
| **API Integration**      | ✅ Yes            | ❌ Static only    |
| **Loading States**       | ✅ Yes            | ❌ No             |
| **Animation**            | Scale + Fade      | Fade + Slide      |
| **Border Radius**        | xl (12px)         | lg (8px)          |
| **Dropdown Radius**      | 2xl (16px)        | xl (12px)         |
| **Focus Ring**           | primary-500       | primary-100       |
| **Emoji Icon**           | 24px (text-2xl)   | 18px (text-lg)    |
| **Location Pin Icon**    | ❌ No             | ✅ Yes (Lucide)   |

---

## Use Case Scenarios

### Use Standard When:
1. Building a dedicated search page
2. Need the "Explore Anywhere" feature
3. Form requires labels for accessibility
4. Want API-powered real-time search
5. Have vertical space available
6. Need loading indicators

### Use Compact When:
1. Building a navigation search bar
2. Creating a compact filter panel
3. Mobile-first responsive design
4. Limited vertical space
5. Want faster, lighter component
6. Static airport list is sufficient

---

## Import Examples

### Standard Component
```tsx
import { AirportAutocomplete } from '@/components/search/AirportAutocomplete';
import { Plane } from 'lucide-react';

<AirportAutocomplete
  label="From"
  placeholder="Departure city"
  value={from}
  onChange={setFrom}
  icon={<Plane className="w-5 h-5" />}
  showExplore={true}
/>
```

### Compact Component
```tsx
import { AirportAutocompleteCompact } from '@/components/search/AirportAutocompleteCompact';

<AirportAutocompleteCompact
  placeholder="Departure city"
  value={from}
  onChange={setFrom}
  className="w-64"
/>
```

---

## Performance Notes

### Standard Component
- **Bundle Size**: ~13KB
- **API Calls**: Yes (debounced)
- **Cache**: In-memory (5 min)
- **Render**: Heavier (more features)

### Compact Component
- **Bundle Size**: ~7KB
- **API Calls**: No
- **Cache**: Not needed
- **Render**: Lighter (minimal features)

---

## Shared Features

Both components share:
- Same Airport data structure
- Same keyboard navigation (↑↓ arrows, Enter, Escape)
- Click-outside-to-close behavior
- Real-time filtering
- Truncated text handling
- Same popular airports list
- Same onChange callback signature

---

## Migration Guide

### From Standard to Compact

```tsx
// Before (Standard)
<AirportAutocomplete
  label="From"
  placeholder="Select airport"
  value={airport}
  onChange={setAirport}
  icon={<Plane />}
/>

// After (Compact)
<div>
  <label className="text-xs mb-1">From</label>
  <AirportAutocompleteCompact
    placeholder="Select airport"
    value={airport}
    onChange={setAirport}
  />
</div>
```

### From Compact to Standard

```tsx
// Before (Compact)
<AirportAutocompleteCompact
  placeholder="Select airport"
  value={airport}
  onChange={setAirport}
/>

// After (Standard)
<AirportAutocomplete
  label="Airport"
  placeholder="Select airport"
  value={airport}
  onChange={setAirport}
  icon={<Plane />}
/>
```

---

## Files Structure

```
components/search/
├── AirportAutocomplete.tsx                    # Standard component
├── AirportAutocompleteCompact.tsx             # Compact variant
├── AirportAutocompleteCompact.example.tsx     # Usage examples
├── AirportAutocompleteCompact.README.md       # Compact documentation
└── AIRPORT_AUTOCOMPLETE_COMPARISON.md         # This file
```

---

## Recommendations

1. **Search Bars**: Use Compact
2. **Booking Forms**: Use Standard
3. **Mobile Apps**: Use Compact
4. **Desktop Forms**: Use Standard
5. **Quick Filters**: Use Compact
6. **Main Search**: Use Standard (with API)

Choose the variant that best fits your layout constraints and feature requirements.
