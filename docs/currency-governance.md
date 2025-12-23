# Fly2Any Currency Governance

## Purpose
Ensure consistent, accurate, and trustworthy currency display across all locales
while maintaining schema compliance and preventing misleading conversions.

---

## 1. CURRENT IMPLEMENTATION STATUS

### Implemented
- 35+ currencies supported
- Geo-detection via Vercel Edge
- Cookie-based preference storage
- Exchange rate API (1hr cache)
- Currency conversion service
- User currency selector

### Currency Service Location
- `lib/services/currency.ts` - Core conversion
- `lib/hooks/useCurrency.ts` - Client hook
- `middleware.ts` - Geo-detection

---

## 2. CURRENCY DISPLAY RULES

### Rule 1: UI Must Match Schema
```typescript
// CORRECT: Schema and UI show same currency
// UI: R$ 950
// Schema: { "priceCurrency": "BRL", "lowPrice": 950 }

// INCORRECT: Mismatch
// UI: R$ 950
// Schema: { "priceCurrency": "USD", "lowPrice": 189 }
```

### Rule 2: Source Currency Transparency
```typescript
// Always store original API currency
interface PriceData {
  amount: number;           // Displayed price (converted)
  currency: string;         // Display currency
  originalAmount: number;   // Original API price
  originalCurrency: string; // Original API currency (usually USD)
  exchangeRate: number;     // Rate used for conversion
  rateTimestamp: string;    // When rate was fetched
}
```

### Rule 3: Conversion Disclaimers
```typescript
// When showing converted prices
function getPriceDisclaimer(isConverted: boolean, rateAge: number): string {
  if (!isConverted) return '';
  if (rateAge > 3600000) { // > 1 hour
    return 'Price converted from USD. Exchange rate may have changed.';
  }
  return 'Price converted from USD using current exchange rate.';
}
```

---

## 3. CURRENCY BY LOCALE

### Default Currency Mapping
| Locale | Default Currency | Fallback |
|--------|------------------|----------|
| en-us | USD | USD |
| pt-br | BRL | USD |
| es-mx | MXN | USD |
| es-es | EUR | USD |
| en-gb | GBP | USD |

### User Override
Users can always change currency regardless of locale:
```typescript
// Currency selection is independent of locale
// Brazilian user can view prices in USD
// US user can view prices in EUR
```

---

## 4. PRICE CONFIDENCE SIGNALS

### Confidence Levels
```typescript
type PriceConfidence = 'high' | 'medium' | 'low';

function getPriceConfidence(priceData: PriceData): PriceConfidence {
  const rateAge = Date.now() - new Date(priceData.rateTimestamp).getTime();

  // Same currency - no conversion needed
  if (priceData.currency === priceData.originalCurrency) {
    return 'high';
  }

  // Fresh rate (< 1 hour)
  if (rateAge < 3600000) {
    return 'high';
  }

  // Stale rate (1-24 hours)
  if (rateAge < 86400000) {
    return 'medium';
  }

  // Very stale (> 24 hours)
  return 'low';
}
```

### Display by Confidence
| Confidence | Display | Badge |
|------------|---------|-------|
| High | Normal price | None |
| Medium | Price + "~" prefix | "Estimated" |
| Low | "Check current price" | "Rate may vary" |

---

## 5. SCHEMA CURRENCY RULES

### AggregateOffer Requirements
```json
{
  "@type": "AggregateOffer",
  "priceCurrency": "BRL",      // MUST match displayed currency
  "lowPrice": 950,             // MUST be in priceCurrency
  "highPrice": 1800,           // MUST be in priceCurrency
  "availability": "https://schema.org/InStock"
}
```

### Forbidden Patterns
- Schema in USD while UI shows BRL
- Price without currency code
- Mixing currencies in price range
- Stale prices in schema (> 24h without inventory check)

---

## 6. EXCHANGE RATE GOVERNANCE

### Rate Source
- Primary: ExchangeRate-API
- Fallback: Cached rates (up to 24h)
- Emergency: Fixed rates (notify team)

### Cache Strategy
```typescript
const RATE_CACHE = {
  duration: 3600000,      // 1 hour
  staleLimit: 86400000,   // 24 hours (usable but flagged)
  expiredLimit: 604800000 // 7 days (unusable, show USD)
};
```

### Rate Monitoring
| Metric | Threshold | Alert |
|--------|-----------|-------|
| API failure | > 3 consecutive | Slack alert |
| Rate age | > 4 hours | Log warning |
| Rate change | > 5% in 1 hour | Review alert |

---

## 7. ROUNDING RULES

### By Currency Type
```typescript
function roundPrice(amount: number, currency: string): number {
  // Zero decimal currencies
  const zeroDecimal = ['JPY', 'KRW', 'VND', 'IDR', 'CLP'];
  if (zeroDecimal.includes(currency)) {
    return Math.round(amount);
  }

  // Standard currencies - round to 2 decimals
  return Math.round(amount * 100) / 100;
}
```

### Psychological Pricing
```typescript
// For display (not schema)
function friendlyRound(amount: number, currency: string): number {
  // Large amounts: round to nearest 10/100
  if (amount >= 1000) return Math.round(amount / 10) * 10;
  if (amount >= 100) return Math.round(amount);

  // Small amounts: .99 pricing
  return Math.floor(amount) + 0.99;
}
```

---

## 8. MULTI-CURRENCY SEARCH

### Search Flow
```
1. User searches (currency from cookie)
2. API returns prices in USD (source)
3. Convert to user's currency
4. Display with conversion metadata
5. Booking redirects to provider (their currency)
```

### Provider Currency Handling
```typescript
// At booking redirect
function getBookingUrl(offer: Offer, userCurrency: string): string {
  // Note: Final price at provider may differ
  // We show estimates, provider shows actual
  return `${offer.deepLink}&displayCurrency=${userCurrency}`;
}
```

---

## 9. TESTING REQUIREMENTS

### Currency Tests
- [ ] All 35+ currencies display correctly
- [ ] Symbols positioned correctly (before/after)
- [ ] Decimal separators correct per locale
- [ ] Thousand separators correct per locale
- [ ] Schema currency matches UI
- [ ] Conversion accuracy (< 0.1% drift)
- [ ] Fallback to USD works

### Edge Cases
- [ ] Currency not in supported list → USD
- [ ] Rate API down → Cached rate
- [ ] Very large amounts (millions)
- [ ] Very small amounts (< $1)
- [ ] Zero prices handled

---

## 10. FORBIDDEN PRACTICES

| Practice | Risk |
|----------|------|
| Hiding conversion markup | Consumer protection violation |
| Showing outdated rates as current | Misleading pricing |
| Different price in schema vs UI | Schema spam |
| Fake currency savings | Deceptive marketing |
| Forced currency by region | User choice violation |

---

## Version
- Created: 2025-12-23
- Owner: SEO Platform Engineering
- Review: Quarterly
