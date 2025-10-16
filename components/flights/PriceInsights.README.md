# PriceInsights Component

A sophisticated AI-powered price insights component for flight search results that provides intelligent booking recommendations based on price trends and historical data.

## 📍 File Location

**Main Component:** `C:\Users\Power\fly2any-fresh\components\flights\PriceInsights.tsx`

**Example Usage:** `C:\Users\Power\fly2any-fresh\components\flights\PriceInsights.example.tsx`

## ✨ Features

### Core Features
- ✅ **Price Trend Indicator** - Visual indicators with colored arrows (Rising/Stable/Falling)
- ✅ **AI Price Predictions** - Smart predictions like "Prices likely to RISE 18% in next 48h"
- ✅ **Booking Recommendations** - Intelligent suggestions (Book Now/Wait/Monitor)
- ✅ **Average Price Comparison** - Shows current price vs route average
- ✅ **Best Time to Book Tips** - Contextual advice based on trends
- ✅ **Price History Chart** - Interactive mini-chart with 30-day price visualization
- ✅ **Urgency Messaging** - Dynamic alerts when prices are rising rapidly

### Design Features
- 🎨 **Glass-morphism Design** - Modern backdrop-blur card styling
- 🎨 **Color-coded Indicators** - Green (good deals), Red (urgent), Yellow (wait)
- 🎨 **Gradient Backgrounds** - Beautiful Tailwind CSS gradients
- 📱 **Mobile Responsive** - Fully optimized for all screen sizes
- ⚡ **Animation Effects** - Smooth transitions and urgency animations

### Internationalization
- 🌍 **Trilingual Support** - English, Portuguese, Spanish
- 🌍 **Complete Translations** - All UI text fully translated

## 🚀 Usage

### Basic Example

```tsx
import { PriceInsights } from '@/components/flights/PriceInsights';

const route = {
  from: 'JFK',
  to: 'LAX',
  departureDate: '2025-11-15',
};

const statistics = {
  currentPrice: 512,
  averagePrice: 580,
  lowestPrice: 489,
  highestPrice: 720,
  trendPercentage: 18,
  trend: 'rising',
  priceHistory: [
    { date: '2025-09-03', price: 489 },
    { date: '2025-09-08', price: 495 },
    { date: '2025-09-13', price: 510 },
    { date: '2025-09-18', price: 525 },
    { date: '2025-09-23', price: 548 },
    { date: '2025-09-28', price: 512 },
    { date: '2025-10-03', price: 512 },
  ],
};

function FlightResults() {
  return (
    <PriceInsights
      route={route}
      statistics={statistics}
      currency="USD"
      lang="en"
    />
  );
}
```

## 📋 Props

### PriceInsightsProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `route` | `FlightRoute` | ✅ | - | Flight route information (from, to, departureDate) |
| `statistics` | `PriceStatistics` | ✅ | - | Price data and trend information |
| `currency` | `string` | ❌ | `'USD'` | Currency code for price display |
| `lang` | `'en' \| 'pt' \| 'es'` | ❌ | `'en'` | Display language |
| `className` | `string` | ❌ | `''` | Additional CSS classes |

### FlightRoute Interface

```typescript
interface FlightRoute {
  from: string;        // Departure airport code (e.g., 'JFK')
  to: string;          // Arrival airport code (e.g., 'LAX')
  departureDate: string; // Departure date (e.g., '2025-11-15')
}
```

### PriceStatistics Interface

```typescript
interface PriceStatistics {
  currentPrice: number;      // Current flight price
  averagePrice: number;      // Average price for this route
  lowestPrice: number;       // Lowest recorded price
  highestPrice: number;      // Highest recorded price
  priceHistory: PriceHistoryPoint[]; // Array of historical prices
  trendPercentage: number;   // Trend change percentage
  trend: PriceTrend;         // 'rising' | 'stable' | 'falling'
}

interface PriceHistoryPoint {
  date: string;   // ISO date string
  price: number;  // Price on that date
}

type PriceTrend = 'rising' | 'stable' | 'falling';
```

## 🎯 Use Cases

### 1. Rising Prices - Urgent Booking
When prices are trending upward rapidly, the component displays:
- Red/orange color scheme with pulse animation
- High urgency messaging
- "Book Now" recommendation
- Prediction of future price increase

### 2. Falling Prices - Wait Recommendation
When prices are dropping, the component shows:
- Green color scheme
- "Wait & Monitor" recommendation
- Prediction of upcoming price drop
- Suggestion to track prices

### 3. Stable Prices - Monitor
When prices are stable, the component displays:
- Yellow/gray color scheme
- "Monitor" recommendation
- Stable price messaging
- Advice to track for potential changes

### 4. Great Deal Alert
When current price is significantly below average:
- Green success indicators
- Strong "Book Now" recommendation
- Highlighted savings percentage
- Urgency to act before price rises

## 🎨 Color Coding

- 🟢 **Green** - Good deals, falling prices, book now opportunities
- 🔴 **Red** - Urgent, rising prices, act quickly
- 🟡 **Yellow** - Wait, monitor, stable prices
- 🔵 **Blue** - Information, neutral recommendations

## 📱 Responsive Design

The component is fully responsive with:
- Grid layouts that stack on mobile
- Touch-friendly interactive elements
- Optimized font sizes for all screens
- Proper spacing and padding for mobile

## 🌐 Language Support

### Supported Languages
- **English (en)** - Default
- **Portuguese (pt)** - Complete translations
- **Spanish (es)** - Complete translations

All text, including:
- UI labels
- AI predictions
- Recommendations
- Tips and messages

## 🎭 Animation Effects

- **Pulse Animation** - High urgency scenarios
- **Shimmer Effect** - Rising price alerts
- **Fade In** - Component mount transition
- **Smooth Transitions** - All state changes

## 💡 Best Practices

1. **Update Data Regularly** - Refresh price statistics frequently for accuracy
2. **Provide Complete History** - Include at least 7-14 days of price history for meaningful charts
3. **Match Currency** - Ensure currency prop matches the price data
4. **Language Consistency** - Use the same language throughout your app
5. **Mobile Testing** - Test on various screen sizes

## 🔧 Customization

### Custom Styling
```tsx
<PriceInsights
  route={route}
  statistics={statistics}
  className="my-custom-class shadow-2xl"
/>
```

### Custom Currency
```tsx
<PriceInsights
  route={route}
  statistics={statistics}
  currency="EUR"
/>
```

## 📊 Data Requirements

### Minimum Data
- At least 3 price history points for meaningful chart
- Valid current, average, lowest, and highest prices
- Trend percentage (can be 0 for stable)

### Recommended Data
- 7-30 days of price history
- Regular data points (e.g., every 3-5 days)
- Accurate trend calculations

## 🐛 Troubleshooting

### Chart Not Displaying
- Ensure `priceHistory` array has at least 2 points
- Verify all prices are valid numbers
- Check that dates are in correct format

### Colors Not Showing
- Verify Tailwind CSS is properly configured
- Check that custom colors are defined in tailwind.config.ts
- Ensure gradient backgrounds are enabled

### Translations Missing
- Verify `lang` prop is one of: 'en', 'pt', 'es'
- Check that all translation keys exist

## 📝 TypeScript Support

Fully typed with TypeScript for:
- All props and interfaces
- Internal state management
- Event handlers
- Sub-components

## 🔄 Updates & Maintenance

Component version: 1.0.0
Created: October 3, 2025
Last updated: October 3, 2025

## 📞 Support

For issues or questions about this component, refer to:
- Example file: `PriceInsights.example.tsx`
- Type definitions in main component file
- Project documentation

---

**Built with:** React 18, TypeScript, Tailwind CSS
**Design:** Glass-morphism, Modern UI/UX
**Compatible with:** Next.js 14+
