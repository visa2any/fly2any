# SEO Sprint 3: Programmatic Content & Internal Linking System

## Overview

This document defines the scalable content generation and internal linking architecture for Fly2Any's 10,000+ programmatic SEO pages.

---

## A. QUERY UNIVERSE & CLUSTER MAP

### Query Taxonomy

```
QUERY UNIVERSE
├── ROUTES (A → B) ─────────────────────── ~8,500 pages
│   ├── [origin]-to-[destination]
│   ├── flights-from-[origin]
│   └── flights-to-[destination]
│
├── ROUTES + INTENT ────────────────────── ~25,000 queries
│   ├── cheap flights [origin] to [dest]
│   ├── best time to fly [origin] to [dest]
│   ├── nonstop flights [origin] to [dest]
│   ├── [origin] to [dest] flight deals
│   └── last minute flights [origin] [dest]
│
├── CITIES / DESTINATIONS ──────────────── ~150 pages
│   ├── flights to [city]
│   ├── [city] travel guide
│   └── airports in [city]
│
├── AIRLINES ───────────────────────────── ~50 pages
│   ├── [airline] flights
│   ├── [airline] baggage policy
│   └── [airline] reviews
│
├── SEASONAL / EVENT ───────────────────── ~30 pages
│   ├── World Cup 2026 flights
│   ├── Christmas flights
│   └── Spring break travel
│
└── INFORMATIONAL ──────────────────────── ~20 pages
    ├── best time to book flights
    ├── baggage fees by airline
    └── flight cancellation policies
```

### Query Classification Matrix

| Query Pattern | Intent | Page Type | Priority |
|---------------|--------|-----------|----------|
| `[origin] to [destination] flights` | Transactional | Route | P0 |
| `cheap flights from [origin]` | Transactional | Origin Hub | P0 |
| `flights to [city]` | Transactional | Destination | P0 |
| `best time to fly [origin] to [dest]` | Informational | Route + FAQ | P1 |
| `[airline] baggage fees` | Informational | Airline | P1 |
| `World Cup 2026 flights` | Transactional | Event | P1 |
| `how to find cheap flights` | Informational | Guide | P2 |
| `[airline] customer service` | Navigational | Airline | P3 |

### AI-Answerable Query Map

Queries optimized for SGE/AI Overviews:

```typescript
const AI_ANSWERABLE_QUERIES = {
  // Direct factual answers (AEO priority)
  factual: [
    'What is the cheapest day to fly from [origin] to [dest]?',
    'How long is the flight from [origin] to [dest]?',
    'What airlines fly from [origin] to [dest]?',
    'What is the average flight price from [origin] to [dest]?',
    'Are there direct flights from [origin] to [dest]?',
  ],

  // Comparison answers
  comparative: [
    'Which airline is cheapest for [origin] to [dest]?',
    'Is it cheaper to fly on weekdays or weekends?',
    'What is the best time to book [origin] to [dest] flights?',
  ],

  // How-to answers
  procedural: [
    'How to find cheap flights from [origin] to [dest]',
    'How to track flight prices',
    'How to use price alerts',
  ],
};
```

---

## B. CONTENT TEMPLATES BY PAGE TYPE

### 1. Route Page Template (`/flights/[origin]-to-[destination]`)

```
┌─────────────────────────────────────────────────────────────────┐
│ ROUTE PAGE: JFK → LAX                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [HERO SECTION]                                                  │
│ H1: Flights from New York (JFK) to Los Angeles (LAX)            │
│ Breadcrumb: Home > Flights > JFK to LAX                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [AI SUMMARY BLOCK] - data-aeo="route-summary"                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ "Flights from New York JFK to Los Angeles LAX typically     │ │
│ │ cost $189-$350 round-trip. Flight time: 5h 30m. Airlines:   │ │
│ │ American, Delta, United, JetBlue. Best booking time:        │ │
│ │ 6-8 weeks before departure. Cheapest days: Tue/Wed."        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [SEARCH CTA] - Booking widget                                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [PRICE GRID] (only if hasInventory)                             │
│ ┌───────────┬───────────┬───────────┐                          │
│ │ From $189 │ Avg $285  │ 5h 30m    │                          │
│ │ Lowest    │ Average   │ Duration  │                          │
│ └───────────┴───────────┴───────────┘                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [COLLAPSIBLE FAQ] - Schema.org FAQPage                          │
│ ├─ What is the cheapest day to fly JFK to LAX?                  │
│ ├─ How long is the flight from JFK to LAX?                      │
│ ├─ What airlines fly from JFK to LAX?                           │
│ ├─ How far in advance should I book JFK to LAX?                 │
│ └─ Are there direct flights from JFK to LAX?                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [INTERNAL LINKS - Contextual]                                   │
│ ├─ Alternative Routes: LGA→LAX, EWR→LAX, JFK→SFO                │
│ ├─ Related Cities: Los Angeles Travel Guide                    │
│ ├─ Return Flight: LAX to JFK                                    │
│ └─ Popular Routes: NYC to Miami, NYC to Chicago                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [FOOTER LINKS] - Helpful Resources                              │
│ Baggage Fees | Travel Tips | Reviews | FAQ                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Content Block Variables

```typescript
interface RouteContentVariables {
  // Core route info
  origin: string;           // "JFK"
  originName: string;       // "New York, NY"
  destination: string;      // "LAX"
  destinationName: string;  // "Los Angeles, CA"

  // Pricing (only if hasInventory)
  lowestPrice?: number;
  avgPrice?: number;
  currency: string;

  // Route metadata
  flightDuration: string;
  airlines: string[];
  directFlights: boolean;

  // Computed
  bestBookingTime: string;
  cheapestDays: string[];

  // Internal linking
  alternativeRoutes: RouteLink[];
  relatedCities: CityLink[];
  returnRoute: RouteLink;
}
```

### 2. Destination Page Template (`/destinations/[city]`)

```
┌─────────────────────────────────────────────────────────────────┐
│ DESTINATION PAGE: Los Angeles                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [HERO]                                                          │
│ H1: Flights to Los Angeles - Compare Cheap Airfare              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [AI SUMMARY] - data-aeo="destination-summary"                   │
│ "Los Angeles is served by LAX, BUR, LGB, SNA, and ONT           │
│ airports. Over 500 daily flights from major US cities.          │
│ Average domestic flight: $189-$350."                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [AIRPORTS LIST] - Internal links                                │
│ ├─ LAX - Los Angeles International (primary)                   │
│ ├─ BUR - Hollywood Burbank                                      │
│ ├─ LGB - Long Beach                                             │
│ └─ SNA - John Wayne Orange County                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [POPULAR ROUTES TO LA] - Internal links                         │
│ ├─ New York to Los Angeles                                      │
│ ├─ Chicago to Los Angeles                                       │
│ ├─ Miami to Los Angeles                                         │
│ └─ Dallas to Los Angeles                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [FAQ SECTION]                                                   │
│ ├─ What is the cheapest month to fly to Los Angeles?            │
│ ├─ Which airport should I fly into for LA?                      │
│ └─ How far in advance should I book LA flights?                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Event Page Template (`/world-cup-2026`)

```
┌─────────────────────────────────────────────────────────────────┐
│ EVENT PAGE: World Cup 2026                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [AI SUMMARY] - data-aeo="event-summary"                         │
│ "The 2026 FIFA World Cup will be hosted by USA, Mexico, and     │
│ Canada from June 11 to July 19, 2026. 16 host cities include    │
│ New York/New Jersey, Los Angeles, Dallas, and Miami."           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [HOST CITIES] - Internal links to routes                        │
│ ├─ Flights to New York for World Cup                            │
│ ├─ Flights to Los Angeles for World Cup                         │
│ ├─ Flights to Dallas for World Cup                              │
│ └─ Flights to Miami for World Cup                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [KEY DATES] - Structured data                                   │
│ Opening Match: June 11, 2026                                    │
│ Final: July 19, 2026 at MetLife Stadium                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## C. INTERNAL LINKING RULESET

### Link Graph Architecture

```
                         HOMEPAGE
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    /flights            /destinations        /airlines
         │                   │                   │
    ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
    │         │         │         │         │         │
  Hub A    Hub B      City A   City B    Airline A  B
    │         │         │         │
    └────┬────┘         └────┬────┘
         │                   │
    /flights/[route]    (cross-link)
```

### Linking Rules by Page Type

#### Rule 1: Route ↔ Route (Alternatives)

```typescript
function getAlternativeRoutes(origin: string, destination: string): RouteLink[] {
  return [
    // Same destination, nearby origin airports
    getNearbyAirportRoutes(origin, destination),
    // Same origin, nearby destination airports
    getNearbyAirportRoutes(destination, origin),
    // Return route
    { origin: destination, destination: origin },
    // Popular variations
    getSimilarRoutes(origin, destination),
  ];
}
```

**Example for JFK→LAX:**
- LGA → LAX (nearby origin)
- EWR → LAX (nearby origin)
- JFK → SFO (nearby destination)
- JFK → ONT (nearby destination)
- LAX → JFK (return route)

#### Rule 2: Route ↔ City

```typescript
function getRouteCityLinks(origin: string, destination: string) {
  return {
    // Link to destination city page
    destinationCity: `/destinations/${getCitySlug(destination)}`,
    // Link from city to this route
    fromCityToRoute: true, // City pages link back
  };
}
```

#### Rule 3: City ↔ Destination Hub

```typescript
function getCityHubLinks(city: CityData) {
  return {
    // Top inbound routes (most searched)
    topRoutes: getTopRoutesToCity(city.airports, 10),
    // Related cities (same region/country)
    relatedCities: getRelatedCities(city),
    // Airport pages
    airports: city.airports.map(code => `/airports/${code.toLowerCase()}`),
  };
}
```

#### Rule 4: Blog ↔ Routes/Cities (Contextual)

```typescript
function getBlogContextualLinks(article: ArticleData): ContextualLink[] {
  // Extract mentioned cities/routes from article
  const mentions = extractTravelMentions(article.content);

  return mentions.map(mention => ({
    anchor: mention.text,
    href: mention.type === 'route'
      ? `/flights/${mention.origin}-to-${mention.destination}`
      : `/destinations/${mention.city}`,
    position: mention.position,
  }));
}
```

### Link Density Rules

| Page Type | Max Internal Links | Min Internal Links |
|-----------|-------------------|-------------------|
| Route | 15 | 5 |
| Destination | 20 | 8 |
| Airline | 10 | 4 |
| Blog | 8 | 3 |
| Homepage | 30 | 15 |

### Anchor Text Rules

```typescript
const ANCHOR_TEXT_RULES = {
  // Route links
  route: {
    patterns: [
      '{origin} to {destination} flights',
      'flights from {origin} to {destination}',
      'cheap {origin} to {destination} flights',
    ],
    avoid: ['click here', 'read more', 'learn more'],
  },

  // City links
  city: {
    patterns: [
      'flights to {city}',
      '{city} travel guide',
      '{city} flights',
    ],
  },

  // Natural variation required
  maxSameAnchor: 2, // Max times same anchor text per page
};
```

### Crawl Depth Optimization

```
Depth 0: Homepage
Depth 1: Hub Pages (/flights, /hotels, /destinations, /airlines)
Depth 2: Entity Pages (/flights/jfk-to-lax, /destinations/miami)
Depth 3: Long-tail Pages (/flights/jfk-to-lax?dates=flexible)

MAX ALLOWED DEPTH: 3 clicks from homepage
```

---

## D. AI/LLM OPTIMIZATION (AEO)

### Answer Block Template

```typescript
interface AnswerBlock {
  question: string;      // Clear, quotable question
  answer: string;        // 50-150 chars, factual
  source?: string;       // Attribution
  lastUpdated?: string;  // Freshness signal
  confidence: 'high' | 'medium';
}

// Route-specific answer blocks
const ROUTE_ANSWER_BLOCKS = {
  cheapestDay: (origin: string, dest: string, day: string) => ({
    question: `What is the cheapest day to fly from ${origin} to ${dest}?`,
    answer: `${day} is typically the cheapest day to fly from ${origin} to ${dest}, with prices 15-20% lower than weekends.`,
    confidence: 'high',
    lastUpdated: 'December 2025',
  }),

  flightDuration: (origin: string, dest: string, duration: string) => ({
    question: `How long is the flight from ${origin} to ${dest}?`,
    answer: `Direct flights from ${origin} to ${dest} take approximately ${duration}. Connecting flights may take 7-12 hours.`,
    confidence: 'high',
  }),

  airlines: (origin: string, dest: string, airlines: string[]) => ({
    question: `What airlines fly from ${origin} to ${dest}?`,
    answer: `Airlines flying from ${origin} to ${dest}: ${airlines.slice(0, 5).join(', ')}.`,
    confidence: 'high',
  }),

  avgPrice: (origin: string, dest: string, low: number, high: number) => ({
    question: `What is the average flight price from ${origin} to ${dest}?`,
    answer: `Flights from ${origin} to ${dest} typically cost $${low}-$${high} round-trip. Book 6-8 weeks in advance for best prices.`,
    confidence: 'high',
    lastUpdated: 'December 2025',
  }),
};
```

### AI Summary Component Integration

```typescript
// In route page
<AISearchSummary
  type="flight"
  flightData={{
    origin: route.origin,
    destination: route.destination,
    lowestPrice: pricing.minPrice,
    avgPrice: pricing.avgPrice,
    airlines: pricing.airlines,
    flightDuration: pricing.flightDuration,
    directFlights: pricing.hasDirectFlights,
  }}
  visible={false} // Hidden visually, visible to crawlers
/>

// Answer blocks for FAQ schema
<DirectAnswerBlock
  title="Quick Facts"
  answers={generateRouteAnswers(route)}
  variant="featured"
/>
```

### SpeakableSpecification for Voice

```typescript
const SPEAKABLE_SELECTORS = [
  '[data-aeo-question]',
  '[data-aeo-answer]',
  '.ai-summary',
  '.faq-question',
  '.faq-answer',
];
```

---

## E. CONTENT GOVERNANCE

### When NOT to Generate Content

```typescript
const CONTENT_EXCLUSION_RULES = {
  // No content for invalid routes
  invalidRoute: (origin: string, dest: string) => {
    return origin === dest || !isValidAirport(origin) || !isValidAirport(dest);
  },

  // No pricing content without inventory
  noPriceWithoutInventory: (hasInventory: boolean) => {
    return !hasInventory; // Show NoFlightsAvailable instead
  },

  // No content for deprecated routes
  deprecatedRoutes: [
    'xyz-to-abc', // Example
  ],

  // Seasonal routes: deactivate outside season
  seasonalRoutes: {
    'jfk-to-aspen': { activeMonths: [12, 1, 2, 3] },
    'jfk-to-martha-vineyard': { activeMonths: [6, 7, 8, 9] },
  },
};
```

### When to De-index

```typescript
const DEINDEX_RULES = {
  // Route no longer served by any airline
  noAirlineService: true,

  // Price data stale > 90 days
  stalePricing: 90, // days

  // Soft 404 pattern detected
  soft404Detected: true,

  // Manual flag from admin
  adminFlagged: true,
};
```

### Seasonal Content Handling

```typescript
const SEASONAL_CONTENT = {
  worldCup2026: {
    activeDates: { start: '2025-06-01', end: '2026-07-31' },
    pages: ['/world-cup-2026', '/world-cup-2026/*'],
    afterEvent: 'archive', // 'archive' | 'redirect' | 'delete'
  },

  christmasTravel: {
    activeDates: { start: '2025-10-01', end: '2026-01-15' },
    seasonal: true,
    recurring: true,
  },

  springBreak: {
    activeDates: { start: '2026-02-01', end: '2026-04-15' },
    seasonal: true,
    recurring: true,
  },
};
```

### Inventory-Aware Content Logic

```typescript
function getContentStrategy(route: RouteData): ContentStrategy {
  if (!route.hasInventory) {
    return {
      showPricing: false,
      showOfferSchema: false,
      showSearchWidget: true,
      component: 'NoFlightsAvailable',
      internalLinks: true, // Still valuable for crawl
      faqSchema: true, // Still valuable for SEO
    };
  }

  return {
    showPricing: true,
    showOfferSchema: true,
    showSearchWidget: true,
    component: 'FullRouteContent',
    internalLinks: true,
    faqSchema: true,
  };
}
```

---

## F. IMPLEMENTATION FILES

### New/Updated Files

| File | Purpose |
|------|---------|
| `lib/seo/internal-linking.ts` | Link generation engine |
| `lib/seo/content-templates.ts` | Content block templates |
| `lib/seo/answer-blocks.ts` | AEO answer generators |
| `lib/seo/content-governance.ts` | Exclusion & de-index rules |
| `components/seo/RouteContentBlock.tsx` | Route content template |
| `components/seo/DestinationHub.tsx` | Destination hub component |

### File: `lib/seo/internal-linking.ts`

```typescript
// Core internal linking engine
export function getRouteInternalLinks(
  origin: string,
  destination: string
): InternalLinks {
  return {
    alternativeRoutes: getAlternativeRoutes(origin, destination),
    relatedCities: getRelatedCities(destination),
    returnRoute: getReturnRoute(origin, destination),
    nearbyAirports: getNearbyAirportRoutes(origin, destination),
  };
}

export function getDestinationInternalLinks(city: CityData): InternalLinks {
  return {
    topRoutes: getTopRoutesToCity(city.airports),
    relatedCities: getSameRegionCities(city),
    airports: city.airports.map(getAirportLink),
  };
}
```

---

## G. SPRINT CHECKLIST

- [ ] Create `lib/seo/internal-linking.ts`
- [ ] Create `lib/seo/answer-blocks.ts`
- [ ] Create `lib/seo/content-governance.ts`
- [ ] Update route pages with internal linking
- [ ] Add AEO answer blocks to route pages
- [ ] Update RelatedLinks component with route links
- [ ] Implement destination hub pages
- [ ] Add seasonal content flags
- [ ] Test crawl depth < 3
- [ ] Validate schema with Rich Results Test
- [ ] Update PROMPT-MEMORY-SEO.md

---

## VERSION

- Sprint: 3
- Created: 2025-12-23
- Status: Implementation Ready
