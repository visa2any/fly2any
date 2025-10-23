# Currency Service - Integration Examples

This document provides practical examples for integrating the currency service into your flight booking platform.

## Quick Start

### 1. Basic Price Display

Replace hardcoded currency symbols with proper formatting:

**Before:**
```tsx
<span>${price.total}</span>
```

**After:**
```tsx
import { formatPrice } from '@/lib/services/currency';

<span>{formatPrice(price.total, price.currency)}</span>
```

### 2. Flight Search Bar Integration

Add currency selector to your search bar:

```tsx
// components/search/FlightSearchForm.tsx
import { useState } from 'react';
import CurrencySelectorCompact from '@/components/common/CurrencySelectorCompact';
import { detectUserCurrency } from '@/lib/services/currency';

export function FlightSearchForm() {
  const [currency, setCurrency] = useState(detectUserCurrency());

  return (
    <div className="search-form">
      {/* Existing search fields */}
      <input type="text" placeholder="From" />
      <input type="text" placeholder="To" />
      <input type="date" />

      {/* Add currency selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Currency:</label>
        <CurrencySelectorCompact
          value={currency}
          onChange={setCurrency}
          variant="minimal"
        />
      </div>

      <button type="submit">Search Flights</button>
    </div>
  );
}
```

### 3. Flight Results Page

Update flight results to use currency service:

```tsx
// app/flights/results/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/services/currency';
import FlightCard from '@/components/flights/FlightCard';

export default function FlightResultsPage() {
  const [flights, setFlights] = useState([]);
  const [currency, setCurrency] = useState('USD');

  // Detect user currency on mount
  useEffect(() => {
    const { detectUserCurrency } = require('@/lib/services/currency');
    setCurrency(detectUserCurrency());
  }, []);

  return (
    <div className="results-page">
      <div className="results-header">
        <h1>Flight Results</h1>

        {/* Currency selector in header */}
        <CurrencySelectorCompact
          value={currency}
          onChange={setCurrency}
          variant="button"
        />
      </div>

      <div className="results-list">
        {flights.map(flight => (
          <FlightCard
            key={flight.id}
            flight={flight}
            displayCurrency={currency}
          />
        ))}
      </div>
    </div>
  );
}
```

## Advanced Integration

### 1. Real-Time Currency Conversion

Convert prices on the fly when user changes currency:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { convertCurrency, formatPrice } from '@/lib/services/currency';

export function FlightCard({ flight, displayCurrency }) {
  const [convertedPrice, setConvertedPrice] = useState(flight.price.total);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    async function convert() {
      if (flight.price.currency === displayCurrency) {
        setConvertedPrice(flight.price.total);
        return;
      }

      setIsConverting(true);
      try {
        const converted = await convertCurrency(
          flight.price.total,
          flight.price.currency,
          displayCurrency
        );
        setConvertedPrice(converted);
      } catch (error) {
        console.error('Conversion failed:', error);
        setConvertedPrice(flight.price.total);
      } finally {
        setIsConverting(false);
      }
    }

    convert();
  }, [displayCurrency, flight.price.total, flight.price.currency]);

  return (
    <div className="flight-card">
      <div className="flight-info">
        {/* Flight details... */}
      </div>

      <div className="price-section">
        {isConverting ? (
          <div className="animate-pulse">Converting...</div>
        ) : (
          <>
            <div className="price-main">
              {formatPrice(convertedPrice, displayCurrency)}
            </div>
            {flight.price.currency !== displayCurrency && (
              <div className="price-original text-xs text-gray-500">
                Originally {formatPrice(flight.price.total, flight.price.currency)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

### 2. Price Comparison in Multiple Currencies

Show prices in multiple currencies for international users:

```tsx
import { formatPrice, getPopularCurrencies } from '@/lib/services/currency';

export function MultiCurrencyPriceDisplay({ amount, baseCurrency }) {
  const [rates, setRates] = useState({});
  const popularCurrencies = getPopularCurrencies().slice(0, 5); // Top 5

  useEffect(() => {
    async function fetchRates() {
      const response = await fetch(`/api/currency?base=${baseCurrency}`);
      const data = await response.json();
      setRates(data.rates);
    }
    fetchRates();
  }, [baseCurrency]);

  return (
    <div className="multi-currency-display">
      <div className="primary-price">
        {formatPrice(amount, baseCurrency)}
      </div>

      <details className="alternate-prices">
        <summary className="text-sm text-gray-600 cursor-pointer">
          View in other currencies
        </summary>
        <div className="mt-2 space-y-1">
          {popularCurrencies.map(curr => (
            <div key={curr.code} className="flex justify-between text-sm">
              <span>{curr.name}:</span>
              <span className="font-semibold">
                {formatPrice(amount * (rates[curr.code] || 1), curr.code)}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
```

### 3. Global Currency Context

Wrap your entire app for consistent currency state:

```tsx
// app/layout.tsx
import { CurrencyProvider } from '@/lib/context/CurrencyContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}

// Then use in any component:
// components/Header.tsx
import { useCurrency } from '@/lib/context/CurrencyContext';
import { CurrencySelector } from '@/lib/context/CurrencyContext';

export function Header() {
  const { currency } = useCurrency();

  return (
    <header>
      <Logo />
      <nav>
        <NavLinks />
      </nav>
      <div className="header-actions">
        <CurrencySelector />
        <UserMenu />
      </div>
    </header>
  );
}

// components/flights/FlightCard.tsx
import { useCurrency } from '@/lib/context/CurrencyContext';

export function FlightCard({ flight }) {
  const { format, currency, convert } = useCurrency();
  const [displayPrice, setDisplayPrice] = useState(flight.price.total);

  useEffect(() => {
    async function updatePrice() {
      const converted = await convert(flight.price.total, flight.price.currency);
      setDisplayPrice(converted);
    }
    updatePrice();
  }, [currency]);

  return (
    <div className="flight-card">
      <div className="price">
        {format(displayPrice)}
      </div>
    </div>
  );
}
```

## Header Integration

### Option 1: Minimal Header

```tsx
// components/Header.tsx
import CurrencySelectorCompact from '@/components/common/CurrencySelectorCompact';
import { useState } from 'react';
import { detectUserCurrency } from '@/lib/services/currency';

export function Header() {
  const [currency, setCurrency] = useState(detectUserCurrency());

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-8">
        <Logo />
        <nav className="flex gap-6">
          <a href="/flights">Flights</a>
          <a href="/hotels">Hotels</a>
          <a href="/cars">Cars</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Minimal currency selector */}
        <CurrencySelectorCompact
          value={currency}
          onChange={setCurrency}
          variant="minimal"
          className="text-gray-600"
        />

        <button className="btn-primary">Sign In</button>
      </div>
    </header>
  );
}
```

### Option 2: Full-Featured Header

```tsx
// components/Header.tsx
import { CurrencyProvider, CurrencySelector } from '@/lib/context/CurrencyContext';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex gap-6">
              <NavLink href="/flights">Flights</NavLink>
              <NavLink href="/hotels">Hotels</NavLink>
              <NavLink href="/cars">Cars</NavLink>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language selector */}
            <select className="text-sm border-0 bg-transparent">
              <option>English</option>
              <option>Español</option>
              <option>Português</option>
            </select>

            {/* Currency selector with full UI */}
            <CurrencySelector className="hidden sm:block" />

            {/* User menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
```

## Search Bar Integration

### Enhanced Search Form

```tsx
// components/search/EnhancedSearchBar.tsx
import { useState } from 'react';
import CurrencySelectorCompact from '@/components/common/CurrencySelectorCompact';

export function EnhancedSearchBar() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy',
    currency: 'USD',
  });

  return (
    <form className="search-bar">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Origin */}
        <input
          type="text"
          placeholder="From"
          value={formData.from}
          onChange={e => setFormData({ ...formData, from: e.target.value })}
        />

        {/* Destination */}
        <input
          type="text"
          placeholder="To"
          value={formData.to}
          onChange={e => setFormData({ ...formData, to: e.target.value })}
        />

        {/* Dates */}
        <input
          type="date"
          value={formData.departDate}
          onChange={e => setFormData({ ...formData, departDate: e.target.value })}
        />

        {/* Travelers + Currency */}
        <div className="flex gap-2">
          <select
            value={formData.passengers}
            onChange={e => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
            className="flex-1"
          >
            <option value={1}>1 Traveler</option>
            <option value={2}>2 Travelers</option>
            <option value={3}>3 Travelers</option>
          </select>

          <CurrencySelectorCompact
            value={formData.currency}
            onChange={currency => setFormData({ ...formData, currency })}
            variant="default"
          />
        </div>
      </div>

      <button type="submit" className="btn-primary mt-4 w-full">
        Search Flights
      </button>
    </form>
  );
}
```

## API Integration

### Server-Side Conversion

```typescript
// app/api/flights/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { convertCurrency } from '@/lib/services/currency';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { from, to, date, currency = 'USD' } = body;

  // Fetch flights from Amadeus (prices in EUR)
  const flights = await fetchFlights(from, to, date);

  // Convert prices to user's currency
  const convertedFlights = await Promise.all(
    flights.map(async (flight) => {
      const convertedPrice = await convertCurrency(
        flight.price.total,
        flight.price.currency,
        currency
      );

      return {
        ...flight,
        displayPrice: {
          amount: convertedPrice,
          currency,
          original: {
            amount: flight.price.total,
            currency: flight.price.currency,
          },
        },
      };
    })
  );

  return NextResponse.json({ flights: convertedFlights });
}
```

## Mobile Responsive

```tsx
// components/common/MobileCurrencySelector.tsx
import { useState } from 'react';
import { getPopularCurrencies } from '@/lib/services/currency';

export function MobileCurrencySelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const currencies = getPopularCurrencies();

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-600"
      >
        <span className="font-semibold">{value}</span>
      </button>

      {/* Mobile modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Select Currency</h3>
              <button onClick={() => setIsOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {currencies.map(curr => (
                <button
                  key={curr.code}
                  onClick={() => {
                    onChange(curr.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    value === curr.code
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{curr.symbol}</span>
                      <div>
                        <div className="font-semibold">{curr.code}</div>
                        <div className="text-sm text-gray-500">{curr.name}</div>
                      </div>
                    </div>
                    {value === curr.code && (
                      <Check className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## Testing Checklist

- [ ] Currency symbols display correctly (€, £, ¥, $, etc.)
- [ ] Prices format with proper decimal places (JPY has 0, USD has 2)
- [ ] Thousand separators appear correctly (1,234.56)
- [ ] Currency selector opens and closes smoothly
- [ ] Selected currency persists in localStorage
- [ ] Exchange rates cache for 1 hour
- [ ] Conversion API returns accurate results
- [ ] Fallback to original price on conversion error
- [ ] Auto-detection works for different locales
- [ ] Mobile selector displays correctly
- [ ] Compact notation works ($1.5K for $1,500)
- [ ] Price ranges format correctly

## Next Steps

1. **Wrap app in CurrencyProvider**
2. **Add CurrencySelector to header**
3. **Update FlightCard to use formatPrice()**
4. **Add currency parameter to search**
5. **Test with different currencies**
6. **Monitor API usage**

All components are ready to use. No additional setup required!
