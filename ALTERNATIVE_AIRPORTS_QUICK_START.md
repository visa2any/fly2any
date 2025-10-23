# Alternative Airports Widget - Quick Start Guide

## 🚀 Quick Implementation (5 minutes)

### Step 1: Import the Component

```tsx
import AlternativeAirports from '@/components/flights/AlternativeAirports';
```

### Step 2: Add to Your Flight Results Page

```tsx
function FlightResultsPage() {
  const [origin, setOrigin] = useState('JFK');
  const [destination, setDestination] = useState('LAX');
  const cheapestPrice = 450; // Your cheapest flight price

  return (
    <div>
      <AlternativeAirports
        originAirport={origin}
        destinationAirport={destination}
        currentPrice={cheapestPrice}
        onAirportSelect={(newOrigin, newDest) => {
          setOrigin(newOrigin);
          setDestination(newDest);
          searchFlights(newOrigin, newDest); // Your search function
        }}
        lang="en"
      />

      {/* Your existing flight results */}
    </div>
  );
}
```

### Step 3: Done! 🎉

The widget will:
- Automatically detect nearby airports
- Calculate savings (only shows if >15%)
- Include transport costs
- Show total journey cost
- Allow one-click airport switch

---

## 📋 Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `originAirport` | `string` | ✅ Yes | - | Origin airport IATA code (e.g., "JFK") |
| `destinationAirport` | `string` | ✅ Yes | - | Destination airport IATA code (e.g., "LAX") |
| `currentPrice` | `number` | ✅ Yes | - | Current cheapest flight price |
| `onAirportSelect` | `function` | ✅ Yes | - | Callback when user selects alternative airport |
| `currency` | `string` | ❌ No | `"USD"` | Currency code |
| `lang` | `'en' \| 'pt' \| 'es'` | ❌ No | `"en"` | Language |

---

## 🌍 Supported Airports

### Major Cities with Alternatives

- **New York**: JFK, LGA, EWR
- **Los Angeles**: LAX, BUR, SNA, ONT
- **San Francisco**: SFO, OAK, SJC
- **Chicago**: ORD, MDW
- **Washington DC**: IAD, DCA, BWI
- **Miami**: MIA, FLL, PBI
- **Boston**: BOS, MHT, PVD
- **Houston**: IAH, HOU
- **Dallas**: DFW, DAL

[See full list in README](./components/flights/ALTERNATIVE_AIRPORTS_README.md)

---

## 🎨 Visual Examples

### Collapsed State (Default)
```
┌─────────────────────────────────────────────────┐
│ 💡 Save More with Nearby Airports              │
│ Consider these alternative airports...          │
│                                    [View more ▼]│
│                                                 │
│ ┌─ BEST DEAL ─────────────────────────────────┐│
│ │ EWR - Newark Liberty International Airport  ││
│ │ 28 miles away • 35 min transport            ││
│ │                                             ││
│ │ 💰 Save $124                                ││
│ │                                             ││
│ │ Flight: $326 | Transport: $36 | Total: $362││
│ │                          [Switch Airport] ──┤│
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### Expanded State
Shows up to 3 alternative airports with detailed transport options, cost breakdowns, and savings comparisons.

---

## 🔧 Common Customizations

### Change Savings Threshold

Edit `AlternativeAirports.tsx`:

```typescript
const SAVINGS_THRESHOLD = 0.10; // Change from 0.15 (15%) to 0.10 (10%)
```

### Add New Airports

Edit `lib/airports/alternatives.ts`:

```typescript
export const AIRPORT_ALTERNATIVES: Record<string, AirportGroup> = {
  // ... existing airports ...

  'ATL': {
    main: {
      code: 'ATL',
      name: 'Hartsfield-Jackson Atlanta International Airport',
      city: 'Atlanta',
      country: 'USA'
    },
    alternatives: [
      // Add nearby airports with transport data
    ]
  }
};
```

### Customize Colors

The widget uses these main colors (change in component):
- Best deal badge: `bg-green-600`
- Savings highlight: `text-green-600`
- Background gradient: `from-green-50 to-emerald-50`

---

## 📱 Mobile Optimization

### Option 1: Responsive (Default)
Widget automatically adapts to mobile screens.

### Option 2: Full-Screen Modal (Recommended for Mobile)

```tsx
const [showModal, setShowModal] = useState(false);

// Mobile: Show modal trigger
<button
  className="md:hidden fixed bottom-0 w-full bg-green-600 p-4"
  onClick={() => setShowModal(true)}
>
  💡 Save up to $150 with nearby airports
</button>

// Desktop: Inline widget
<div className="hidden md:block">
  <AlternativeAirports {...props} />
</div>

// Mobile modal
{showModal && (
  <div className="md:hidden fixed inset-0 bg-white z-50">
    <AlternativeAirports {...props} />
  </div>
)}
```

---

## 📊 Analytics Tracking

Track user interactions:

```tsx
const handleAirportSelect = (origin: string, destination: string) => {
  // Track analytics
  analytics.track('alternative_airport_selected', {
    original_route: `${currentOrigin}-${currentDestination}`,
    new_route: `${origin}-${destination}`,
    estimated_savings: calculateSavings(),
    transport_type: selectedTransport
  });

  // Update search
  searchFlights(origin, destination);
};
```

---

## 🧪 Testing

### Test the Demo Page

```bash
npm run dev
# Visit: http://localhost:3000/demo/alternative-airports
```

### Run Unit Tests

```bash
npm test -- alternatives.test.ts
```

---

## ⚡ Performance Tips

1. **Lazy Load**: Only render when user scrolls to results section
2. **Debounce**: Debounce price calculations if fetching from API
3. **Memoization**: Already implemented with `useMemo`
4. **Limit Results**: Shows max 3 alternatives to avoid overwhelming users

---

## 🐛 Troubleshooting

### Widget doesn't appear?
- Check if airports are in supported list
- Verify current price is > 0
- Ensure savings exceed 15% threshold
- Check browser console for errors

### Wrong transport costs?
- Transport costs are estimates based on typical prices
- Update costs in `lib/airports/alternatives.ts`

### Styles look wrong?
- Ensure Tailwind CSS is configured
- Check dark mode is working
- Verify lucide-react icons are installed

---

## 📚 Full Documentation

For complete documentation, see:
- [Full README](./components/flights/ALTERNATIVE_AIRPORTS_README.md)
- [Integration Examples](./components/flights/AlternativeAirportsExample.tsx)
- [Demo Component](./components/flights/AlternativeAirportsDemo.tsx)

---

## 💡 Pro Tips

1. **Show Early**: Display widget above the fold for maximum visibility
2. **Highlight Savings**: The green "Best Deal" badge increases conversions
3. **Mobile First**: Consider full-screen modal on mobile for better UX
4. **A/B Test**: Test different placements and thresholds
5. **Real Prices**: Fetch actual flight prices instead of estimates for accuracy
6. **Track Success**: Monitor how many users switch airports

---

## 🚀 Next Steps

1. ✅ Implement basic widget
2. 📊 Add analytics tracking
3. 💰 Integrate with real flight pricing API
4. 📱 Optimize for mobile
5. 🌍 Add more airports
6. 🧪 A/B test placement and messaging

---

## 🤝 Support

Questions? Issues? Check the main documentation or review the example implementations.

**Version**: 1.0.0
**Last Updated**: 2025-10-14
