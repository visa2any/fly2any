# AirportAutocomplete Usage Guide

## Quick Reference

### Import
```tsx
import { AirportAutocomplete } from '@/components/search/AirportAutocomplete';
```

### Basic Usage
```tsx
<AirportAutocomplete
  placeholder="JFK, LAX, CDG..."
  value={value}
  onChange={(val, airport) => {
    setValue(val);
    if (airport) console.log(airport.code);
  }}
/>
```

## Variants Comparison

### 1. Default Variant (Hero sections, main forms)
```tsx
<AirportAutocomplete
  label="From"
  placeholder="JFK, LAX, CDG..."
  value={from}
  onChange={setFrom}
  variant="default"  // or omit (default)
  size="large"
  icon={<Plane className="w-5 h-5" />}
  showExplore
/>
```
**Visual:**
- Bold label, large borders
- Prominent dropdown with explore option
- Best for: Primary search forms

### 2. Compact Variant (Inline forms, tight spaces)
```tsx
<AirportAutocomplete
  placeholder="Departure city"
  value={from}
  onChange={setFrom}
  variant="compact"
  size="small"
  icon={<Plane className="w-4 h-4" />}
/>
```
**Visual:**
- Minimal label, subtle borders
- Clean dropdown with MapPin icons
- Best for: Inline search bars, filters

### 3. Inline Variant (Modals, embedded forms)
```tsx
<AirportAutocomplete
  label="Airport"
  placeholder="JFK"
  value={airport}
  onChange={setAirport}
  variant="inline"
  size="medium"
/>
```
**Visual:**
- Subtle focus states
- Compact dropdown
- Best for: Modal dialogs, inline editing

## Size Comparison

### Small (Mobile, compact UIs)
```tsx
<AirportAutocomplete
  placeholder="Airport"
  value={value}
  onChange={setValue}
  size="small"
  variant="compact"
/>
```
- Input height: 36px
- Font size: sm
- Icon size: 3.5px

### Medium (Default, standard forms)
```tsx
<AirportAutocomplete
  placeholder="Airport"
  value={value}
  onChange={setValue}
  size="medium"  // default
/>
```
- Input height: 42px
- Font size: sm
- Icon size: 4px

### Large (Hero sections, CTAs)
```tsx
<AirportAutocomplete
  placeholder="Airport"
  value={value}
  onChange={setValue}
  size="large"
/>
```
- Input height: 56px
- Font size: lg
- Icon size: 5px

## Common Patterns

### Pattern 1: With Airport Code Extraction
```tsx
const [fromAirport, setFromAirport] = useState('');
const [fromCode, setFromCode] = useState('');

<AirportAutocomplete
  label="From"
  placeholder="Departure airport"
  value={fromAirport}
  onChange={(val, airport) => {
    setFromAirport(val);
    if (airport) {
      setFromCode(airport.code);
      console.log('Selected:', airport.code, airport.city);
    }
  }}
/>
```

### Pattern 2: Static Data Only (No API)
```tsx
<AirportAutocomplete
  placeholder="Select airport"
  value={value}
  onChange={setValue}
  useApi={false}
/>
```

### Pattern 3: With Explore Mode
```tsx
<AirportAutocomplete
  label="Destination"
  placeholder="Where to?"
  value={destination}
  onChange={setDestination}
  showExplore  // Adds "Explore Anywhere" option
/>
```

### Pattern 4: Minimal (No label, no icon)
```tsx
<AirportAutocomplete
  placeholder="JFK"
  value={value}
  onChange={setValue}
  variant="compact"
  size="small"
/>
```

## Replacing Old Components

### Before (AirportAutocompleteCompact)
```tsx
import { AirportAutocompleteCompact } from './AirportAutocompleteCompact';

<AirportAutocompleteCompact
  placeholder="Departure city"
  value={fromAirport}
  onChange={(value, airport) => {
    setFromAirport(value);
    if (airport) console.log(airport);
  }}
  className="w-64"
/>
```

### After (Unified Component)
```tsx
import { AirportAutocomplete } from './AirportAutocomplete';

<AirportAutocomplete
  placeholder="Departure city"
  value={fromAirport}
  onChange={(value, airport) => {
    setFromAirport(value);
    if (airport) console.log(airport);
  }}
  variant="compact"
  className="w-64"
/>
```

## Props Table

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Optional label text above input |
| `placeholder` | `string` | **required** | Input placeholder text |
| `value` | `string` | **required** | Current input value |
| `onChange` | `(val: string, airport?: Airport) => void` | **required** | Change handler |
| `icon` | `React.ReactNode` | `undefined` | Icon to display on left side |
| `showExplore` | `boolean` | `false` | Show "Explore Anywhere" option |
| `variant` | `'default' \| 'compact' \| 'inline'` | `'default'` | Visual variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size preset |
| `className` | `string` | `''` | Additional CSS classes |
| `useApi` | `boolean` | `true` | Enable Amadeus API integration |

## Airport Object Structure

When an airport is selected, the onChange callback receives:

```typescript
interface Airport {
  code: string;        // IATA code (e.g., "JFK")
  name: string;        // Full name (e.g., "John F. Kennedy Intl")
  city: string;        // City name (e.g., "New York")
  country: string;     // Country name (e.g., "USA")
  emoji: string;       // City emoji (e.g., "🗽")
}
```

## Features

### API Integration
- ✅ Amadeus API for real-time airport search
- ✅ In-memory caching (5-minute TTL)
- ✅ Request debouncing (300ms)
- ✅ Automatic fallback to static data
- ✅ Request cancellation on rapid typing

### User Experience
- ✅ Keyboard navigation (↑↓ arrows, Enter, Escape)
- ✅ Click outside to close
- ✅ Loading states
- ✅ Empty state messages
- ✅ Emoji indicators per city
- ✅ Highlighted selected item
- ✅ Responsive dropdown

### Accessibility
- ✅ ARIA labels (inherited from native input)
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader friendly

## Tips

1. **Performance:** Set `useApi={false}` for offline/demo environments
2. **Mobile:** Use `size="small"` and `variant="compact"` for mobile layouts
3. **Hero sections:** Use `size="large"` and `variant="default"`
4. **Inline editing:** Use `variant="inline"` for embedded forms
5. **Icon consistency:** Use Lucide React icons for visual harmony

## Troubleshooting

### Issue: Dropdown not showing
**Solution:** Ensure parent has no `overflow: hidden` that clips dropdown

### Issue: API not working
**Solution:** Component auto-falls back to static data. Check console for errors.

### Issue: Styling conflicts
**Solution:** Use `className` prop to override styles, or adjust `variant`

### Issue: Value not updating
**Solution:** Ensure `onChange` handler updates parent state correctly

## Examples in Codebase

See these files for real-world usage:
- `app/flights/page.tsx` - Large variant with explore mode
- `app/home-new/page.tsx` - Default variant in hero section
- `components/search/FlightSearchForm.tsx` - Standard form usage
- `components/flights/ModifySearchBar.tsx` - Compact variant inline

---

**Last Updated:** 2025-10-10
