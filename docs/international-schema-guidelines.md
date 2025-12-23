# Fly2Any International Schema Guidelines

## Purpose
Ensure schema.org markup maintains entity consistency across locales
while properly representing locale-specific content.

---

## 1. ENTITY ID CONSISTENCY

### Rule: Same @id Across All Locales
```json
// EN-US: /flights/jfk-to-lax
{
  "@type": "Flight",
  "@id": "https://www.fly2any.com/flights/jfk-to-lax#flight"
}

// PT-BR: /pt-br/flights/jfk-to-lax
{
  "@type": "Flight",
  "@id": "https://www.fly2any.com/flights/jfk-to-lax#flight"
}

// ES-MX: /es-mx/flights/jfk-to-lax
{
  "@type": "Flight",
  "@id": "https://www.fly2any.com/flights/jfk-to-lax#flight"
}
```

### Entity ID Patterns (Locale-Agnostic)
```typescript
const ENTITY_ID_PATTERNS = {
  route: (origin: string, dest: string) =>
    `https://www.fly2any.com/flights/${origin}-to-${dest}#flight`,

  airport: (code: string) =>
    `https://www.fly2any.com/airports/${code}#airport`,

  airline: (code: string) =>
    `https://www.fly2any.com/airlines/${code}#airline`,

  city: (slug: string) =>
    `https://www.fly2any.com/destinations/${slug}#place`,

  organization: () =>
    'https://www.fly2any.com/#organization',
};
```

---

## 2. LOCALE-AWARE PROPERTIES

### Properties That VARY by Locale
| Property | Localize? | Example |
|----------|-----------|---------|
| `name` | YES | "Flights to Los Angeles" / "Voos para Los Angeles" |
| `description` | YES | Translated description |
| `inLanguage` | YES | "en-US" / "pt-BR" |
| `priceCurrency` | YES | Based on user preference |

### Properties That STAY GLOBAL
| Property | Localize? | Example |
|----------|-----------|---------|
| `@id` | NO | Always canonical URL |
| `iataCode` | NO | "JFK", "LAX" |
| `icaoCode` | NO | "KJFK", "KLAX" |
| `identifier` | NO | Flight numbers |
| `geo` | NO | Coordinates |

---

## 3. SCHEMA BY PAGE TYPE

### Route Page (Localized)
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Flight",
      "@id": "https://www.fly2any.com/flights/jfk-to-lax#flight",
      "name": "Voos de Nova York (JFK) para Los Angeles (LAX)",
      "description": "Compare voos de JFK para LAX...",
      "inLanguage": "pt-BR",
      "departureAirport": {
        "@id": "https://www.fly2any.com/airports/jfk#airport"
      },
      "arrivalAirport": {
        "@id": "https://www.fly2any.com/airports/lax#airport"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "BRL",
        "lowPrice": 950,
        "highPrice": 1800,
        "offerCount": 45
      }
    }
  ]
}
```

### Airport Entity (Global - Same Everywhere)
```json
{
  "@type": "Airport",
  "@id": "https://www.fly2any.com/airports/jfk#airport",
  "name": "John F. Kennedy International Airport",
  "iataCode": "JFK",
  "icaoCode": "KJFK",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 40.6413,
    "longitude": -73.7781
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  }
}
```

### FAQPage (Fully Localized)
```json
{
  "@type": "FAQPage",
  "@id": "https://www.fly2any.com/pt-br/flights/jfk-to-lax#faq",
  "inLanguage": "pt-BR",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Qual é o dia mais barato para voar de JFK para LAX?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Terças e quartas-feiras são tipicamente 15-20% mais baratos."
      }
    }
  ]
}
```

---

## 4. CURRENCY IN SCHEMA

### Rule: Match User's Selected Currency
```typescript
function getOfferSchema(
  route: RouteData,
  locale: LocaleCode,
  currency: CurrencyCode
): AggregateOffer | null {
  if (!route.hasInventory) return null;

  // Convert price to user's currency
  const convertedLow = convertCurrency(route.minPrice, 'USD', currency);
  const convertedHigh = convertCurrency(route.maxPrice, 'USD', currency);

  return {
    '@type': 'AggregateOffer',
    priceCurrency: currency, // User's currency
    lowPrice: convertedLow,
    highPrice: convertedHigh,
    offerCount: route.offerCount,
    availability: 'https://schema.org/InStock',
  };
}
```

### Currency Display Rules
| Locale | Default Currency | Schema Currency |
|--------|------------------|-----------------|
| en-us | USD | USD |
| pt-br | BRL | BRL |
| es-mx | MXN | MXN |

---

## 5. MULTILINGUAL FAQ SCHEMA

### FAQ Translation Structure
```typescript
const FAQ_TRANSLATIONS = {
  'cheapest-day': {
    'en-us': {
      question: 'What is the cheapest day to fly?',
      answer: 'Tuesdays and Wednesdays are typically 15-20% cheaper.',
    },
    'pt-br': {
      question: 'Qual é o dia mais barato para voar?',
      answer: 'Terças e quartas-feiras são tipicamente 15-20% mais baratos.',
    },
    'es-mx': {
      question: '¿Cuál es el día más barato para volar?',
      answer: 'Martes y miércoles son típicamente 15-20% más baratos.',
    },
  },
  // ... more FAQs
};
```

---

## 6. SPEAKABLE SCHEMA (LOCALIZED)

### Voice Search Optimization
```json
{
  "@type": "WebPage",
  "@id": "https://www.fly2any.com/pt-br/flights/jfk-to-lax#webpage",
  "inLanguage": "pt-BR",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      "[data-aeo-answer='true']",
      ".route-summary"
    ]
  }
}
```

---

## 7. IMPLEMENTATION

### Schema Generator with Locale
```typescript
// lib/seo/international-schema.ts
export function generateLocalizedSchema(
  type: 'route' | 'destination' | 'airline',
  data: EntityData,
  locale: LocaleCode,
  currency: CurrencyCode
): WithContext<Thing> {
  const baseSchema = generateBaseSchema(type, data);

  return {
    ...baseSchema,
    // Localized properties
    name: getLocalizedName(type, data, locale),
    description: getLocalizedDescription(type, data, locale),
    inLanguage: locale.replace('-', '_').toUpperCase(),
    // Currency-aware offers
    ...(data.hasInventory && {
      offers: getOfferSchema(data, locale, currency),
    }),
  };
}
```

---

## 8. VALIDATION CHECKLIST

### Before Publishing
- [ ] @id uses canonical (non-localized) URL
- [ ] inLanguage matches page locale
- [ ] priceCurrency matches displayed currency
- [ ] Localized name/description provided
- [ ] FAQs translated correctly
- [ ] Numbers unchanged in translation
- [ ] Airport codes preserved
- [ ] Schema validates at schema.org/validator

---

## Version
- Created: 2025-12-23
- Owner: SEO Platform Engineering
- Review: Quarterly
