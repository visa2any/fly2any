# Price Calendar Matrix Component

## Overview

The `PriceCalendarMatrix` component is a comprehensive, production-ready flight price calendar that displays prices across multiple months with visual heatmap indicators, deal badges, and interactive date selection.

## Features

### Core Functionality
- **3-Month Scrollable Calendar**: View prices for the next 90 days
- **Color-Coded Heatmap**: Visual price indicators (green = cheap, yellow = medium, red = expensive)
- **Interactive Date Selection**: Click any date to update search
- **Price Comparison**: Shows +/- percentage compared to currently selected date
- **Deal Detection**: Special badges for best prices and deal days
- **Responsive Design**: Optimized for mobile and desktop
- **Multi-Language Support**: English, Portuguese, and Spanish translations
- **Loading States**: Smooth skeleton loading animation

### Visual Design
- Glass-morphism styling with backdrop blur
- Smooth hover animations and tooltips
- Price percentile-based color coding
- Best price badges with pulse animations
- Deal day indicators
- Month navigation with arrow buttons
- Responsive grid layout

### Technical Features
- TypeScript with full type safety
- Memoized calculations for performance
- Proper accessibility attributes
- Error handling
- Mock data generation (ready for API integration)

## Installation

The component is located at:
```
components/flights/PriceCalendarMatrix.tsx
```

## Usage

### Basic Example

```tsx
import PriceCalendarMatrix from '@/components/flights/PriceCalendarMatrix';

function FlightSearchResults() {
  const [selectedDate, setSelectedDate] = useState('2025-11-15');

  return (
    <PriceCalendarMatrix
      origin="LAX"
      destination="JFK"
      currentDate={selectedDate}
      onDateSelect={(date) => {
        setSelectedDate(date);
        // Trigger search with new date
      }}
      currency="USD"
      lang="en"
    />
  );
}
```

### With Multi-Language Support

```tsx
// English
<PriceCalendarMatrix
  origin="LAX"
  destination="JFK"
  currentDate="2025-11-15"
  onDateSelect={handleDateChange}
  lang="en"
  currency="USD"
/>

// Portuguese
<PriceCalendarMatrix
  origin="GRU"
  destination="LIS"
  currentDate="2025-11-15"
  onDateSelect={handleDateChange}
  lang="pt"
  currency="BRL"
/>

// Spanish
<PriceCalendarMatrix
  origin="MAD"
  destination="BCN"
  currentDate="2025-11-15"
  onDateSelect={handleDateChange}
  lang="es"
  currency="EUR"
/>
```

## Props API

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `origin` | `string` | Yes | - | IATA code for origin airport (e.g., "LAX") |
| `destination` | `string` | Yes | - | IATA code for destination airport (e.g., "JFK") |
| `currentDate` | `string` | Yes | - | Currently selected date in YYYY-MM-DD format |
| `onDateSelect` | `(date: string) => void` | Yes | - | Callback function when a date is selected |
| `currency` | `string` | No | "USD" | Currency code (ISO 4217) |
| `lang` | `'en' \| 'pt' \| 'es'` | No | "en" | Language for translations |

## Features in Detail

### 1. Color-Coded Heatmap

The component uses a percentile-based color system:
- **Green (0-25th percentile)**: Cheapest prices
- **Yellow (25-75th percentile)**: Medium prices
- **Red (75-100th percentile)**: Most expensive prices

```typescript
const getPriceColor = (percentile: number): string => {
  if (percentile <= 0.25) return 'from-emerald-500/20 to-emerald-600/30';
  if (percentile <= 0.5) return 'from-green-500/20 to-green-600/30';
  if (percentile <= 0.75) return 'from-yellow-500/20 to-yellow-600/30';
  return 'from-red-500/20 to-red-600/30';
};
```

### 2. Price Comparison Indicators

Each date shows a percentage difference compared to the currently selected date:
- Negative percentages (green): Cheaper than current selection
- Positive percentages (red): More expensive than current selection

### 3. Deal Detection

The component identifies "deal days" with:
- Pulsing green badge indicator
- Special "BEST" label for absolute cheapest day
- Highlighted in tooltip on hover

### 4. Responsive Design

**Desktop (≥768px)**:
- Shows up to 3 months in grid layout
- All months visible simultaneously
- Hover tooltips with detailed price info

**Mobile (<768px)**:
- Horizontal scroll through months
- Touch-friendly date selection
- Scroll indicators for navigation

### 5. Loading States

Beautiful loading skeleton with:
- Spinner animation
- Glass-morphism background
- Localized loading text

## Mock Data Generation

Currently uses realistic mock data with:
- Base price variation: ±20%
- Weekend premium: 10-15% higher
- Random deal days: 10% probability with 30-40% discount
- 90 days of pricing data

### Mock Data Algorithm

```typescript
const generateMockPrices = (basePrice: number, totalDays: number) => {
  // Weekend detection
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Base variation (±20%)
  let priceVariation = 1 + (Math.random() * 0.4 - 0.2);

  // Weekend premium
  if (isWeekend) {
    priceVariation *= 1 + (Math.random() * 0.05 + 0.1);
  }

  // Deal days (10% chance)
  const isDeal = Math.random() < 0.1;
  if (isDeal) {
    priceVariation *= 0.6 + Math.random() * 0.1; // 30-40% off
  }

  return Math.round(basePrice * priceVariation);
};
```

## API Integration (Future)

To connect real API data, replace the `generateMockPrices` function:

```typescript
// Example API integration
const fetchPrices = async (origin: string, destination: string) => {
  const response = await fetch(`/api/flights/calendar?origin=${origin}&destination=${destination}`);
  const data = await response.json();
  return data.prices;
};

// Use in component
useEffect(() => {
  setLoading(true);
  fetchPrices(origin, destination)
    .then(prices => {
      setPrices(prices);
      setLoading(false);
    })
    .catch(error => {
      console.error('Failed to fetch prices:', error);
      setLoading(false);
    });
}, [origin, destination]);
```

## Styling Customization

The component uses Tailwind CSS and can be customized through:

### Color Scheme
```tsx
// Modify the color classes in getPriceColor()
const getPriceColor = (percentile: number): string => {
  // Your custom colors here
};
```

### Glass-morphism Effect
```tsx
// Main container styling
className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20"
```

### Animations
```tsx
// Hover states
className="hover:scale-105 hover:shadow-lg transition-all duration-200"

// Deal badge pulse
className="animate-pulse"
```

## Accessibility

The component includes:
- Proper ARIA labels for navigation buttons
- Keyboard navigation support
- Disabled states for past dates
- Semantic HTML structure
- Color contrast compliant

## Performance Optimizations

1. **useMemo** for expensive calculations:
   - Price generation
   - Percentage calculations
   - Min/max price computation
   - Month grouping

2. **Conditional rendering**:
   - Only visible months rendered on mobile
   - Tooltips only on hover

3. **Debounced state updates**:
   - Smooth loading transitions
   - Optimized re-renders

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Dependencies

- React 18+
- Lucide React (icons)
- Tailwind CSS 3+
- TypeScript 5+

## File Structure

```
components/flights/
├── PriceCalendarMatrix.tsx          # Main component
└── README_PRICE_CALENDAR.md         # This documentation
```

## Examples

### Integration with Flight Search

```tsx
'use client';

import { useState } from 'react';
import PriceCalendarMatrix from '@/components/flights/PriceCalendarMatrix';

export default function FlightResultsPage() {
  const [searchParams, setSearchParams] = useState({
    origin: 'LAX',
    destination: 'JFK',
    date: '2025-11-15',
  });

  const handleDateChange = (newDate: string) => {
    setSearchParams(prev => ({
      ...prev,
      date: newDate,
    }));

    // Trigger new flight search
    searchFlights(searchParams.origin, searchParams.destination, newDate);
  };

  return (
    <div className="space-y-8">
      {/* Flight results */}
      <FlightResultsList results={results} />

      {/* Price Calendar */}
      <PriceCalendarMatrix
        origin={searchParams.origin}
        destination={searchParams.destination}
        currentDate={searchParams.date}
        onDateSelect={handleDateChange}
        currency="USD"
        lang="en"
      />
    </div>
  );
}
```

### With URL State Management

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import PriceCalendarMatrix from '@/components/flights/PriceCalendarMatrix';

export default function FlightSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDate = searchParams.get('date') || '2025-11-15';
  const origin = searchParams.get('origin') || 'LAX';
  const destination = searchParams.get('destination') || 'JFK';

  const handleDateChange = (newDate: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('date', newDate);
    router.push(`/flights/search?${params.toString()}`);
  };

  return (
    <PriceCalendarMatrix
      origin={origin}
      destination={destination}
      currentDate={currentDate}
      onDateSelect={handleDateChange}
    />
  );
}
```

## Troubleshooting

### Issue: Prices not updating
**Solution**: Ensure `origin` and `destination` props change triggers `useMemo` recalculation.

### Issue: Dates not clickable
**Solution**: Check that dates are not in the past (past dates are automatically disabled).

### Issue: Calendar not responsive on mobile
**Solution**: Ensure parent container doesn't have overflow constraints.

### Issue: Colors not showing correctly
**Solution**: Verify Tailwind CSS is properly configured with all color utilities.

## Future Enhancements

- [ ] Real-time API integration
- [ ] Price alerts and notifications
- [ ] Historical price trends
- [ ] Price prediction
- [ ] Flexible date search (±3 days)
- [ ] Multi-city support
- [ ] Round-trip price optimization
- [ ] Export calendar as PDF/image
- [ ] Price tracking history
- [ ] Social sharing of deals

## Contributing

To contribute improvements:
1. Follow the existing TypeScript patterns
2. Maintain accessibility standards
3. Add comprehensive comments
4. Update this documentation
5. Test on mobile and desktop

## License

Part of the Fly2Any project.

## Support

For issues or questions, please refer to the main project documentation.

---

**Last Updated**: 2025-10-14
**Version**: 1.0.0
**Author**: Fly2Any Development Team
