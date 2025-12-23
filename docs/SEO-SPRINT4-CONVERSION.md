# SEO Sprint 4: AI Citation & Conversion Architecture

## Overview
Convert search + AI visibility into qualified demand, AI citations, and higher conversion.

---

## A. DIRECT ANSWER BLOCK SPECIFICATION

### Requirements
| Attribute | Value |
|-----------|-------|
| Word count | 40-70 words |
| Tone | Declarative, factual |
| Marketing language | None |
| CTAs inside | None |
| Position | Above the fold |

### Component: `RouteAnswerBlock.tsx`
```tsx
<RouteAnswerBlock
  data={{
    origin: 'JFK',
    destination: 'LAX',
    originName: 'New York',
    destinationName: 'Los Angeles',
    avgPrice: 285,
    lowestPrice: 189,
    flightDuration: '5h 30m',
    airlines: ['American', 'Delta', 'United', 'JetBlue'],
    directFlights: true,
    cheapestDay: 'Tuesday',
    lastUpdated: new Date(),
    priceConfidence: 'high',
    dataPoints: 12500,
  }}
/>
```

### Example AI-Quotable Copy
```
"Round-trip flights from JFK to LAX typically cost $189-$285 USD.
Prices vary by season, demand, and how far in advance you book.
The lowest fares are usually found 6-8 weeks before departure
for domestic routes."
```

### When Block Appears
| Page Type | Show Block | Position |
|-----------|------------|----------|
| Route page with inventory | Yes | Hero section |
| Route page no inventory | No | - |
| Destination page | Yes | After hero |
| Airline page | Yes | After hero |
| Results page | No | - |

---

## B. INTENT SEGMENTATION MATRIX

### Intent → UX → CTA Matrix

| Intent | UX Priority | CTA Type | CTA Position | Offer Schema | FAQ Schema |
|--------|-------------|----------|--------------|--------------|------------|
| **Research** | Information, Education, Trust | Soft | Below fold | No | Yes |
| **Compare** | Comparison tools, Prices, Alternatives | Medium | Mid-page | Yes | Yes |
| **Ready-to-book** | Search widget, Pricing, Booking | Strong | Above fold | Yes | No |

### Page Type → Default Intent

| Page Type | Default Intent | Override Conditions |
|-----------|----------------|---------------------|
| `/flights/[route]` | Compare | Has dates → Ready-to-book |
| `/destinations/[city]` | Research | Returning user → Compare |
| `/airlines/[code]` | Research | - |
| `/blog/*` | Research | - |
| `/travel-guide` | Research | - |
| `/flights/results` | Ready-to-book | - |
| `/booking/*` | Ready-to-book | - |
| `/` (home) | Compare | First visit → Research |

### Intent Detection Logic
```typescript
function detectIntent(pageType, signals) {
  // Strong booking signals override
  if (signals.hasDateParams && signals.hasPassengerCount) {
    return 'ready-to-book';
  }

  // Returning users with engagement → compare
  if (signals.visitCount > 1 && signals.pagesViewed > 2) {
    return 'compare';
  }

  // Default to page type mapping
  return PAGE_INTENT_MAP[pageType];
}
```

---

## C. CONVERSION FLYWHEEL

### State Diagram
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONVERSION FLYWHEEL                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                           ┌─────────────────┐
                           │   FIRST VISIT   │
                           │    (Educate)    │
                           └────────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │  Trust Block │ │   FAQ View   │ │  Guide Read  │
           │   Shown      │ │              │ │              │
           └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                  │                │                │
                  └────────────────┼────────────────┘
                                   │
                                   ▼
                           ┌─────────────────┐
                           │   RETURNING     │
                           │   (Compare)     │
                           └────────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │   Search     │ │    Route     │ │    Price     │
           │  Performed   │ │   Compared   │ │    Alert     │
           └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                  │                │                │
                  └────────────────┼────────────────┘
                                   │
                                   ▼
                           ┌─────────────────┐
                           │  HIGH INTENT    │
                           │    (Book)       │
                           └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │   CONVERSION    │
                           │   (Booking)     │
                           └─────────────────┘
```

### State Transitions
| From | Trigger | To |
|------|---------|-----|
| First visit | Return within 7 days | Returning |
| First visit | 3+ page views | Returning |
| Returning | 2+ searches | High intent |
| Returning | Route compared | High intent |
| Returning | Price alert set | High intent |
| High intent | Search with dates | Ready to book |

### UX by State
| State | Primary UX | CTA | Trust Signal |
|-------|------------|-----|--------------|
| First visit | Educational content | "Compare Prices" | Full trust block |
| Returning | Price comparison | "Search from $X" | Data freshness |
| High intent | Booking flow | "Book Now" | Price confidence |

---

## D. COMPONENTS & HOOKS

### Files Created
| File | Purpose |
|------|---------|
| `lib/seo/intent-segmentation.ts` | Intent detection & config |
| `hooks/useUserIntent.ts` | Conversion flywheel state |
| `components/seo/TrustSignals.tsx` | E-E-A-T components |
| `components/seo/RouteAnswerBlock.tsx` | AEO answer blocks |

### Usage: Intent Segmentation
```typescript
import { getIntentConfig, PAGE_INTENT_MAP } from '@/lib/seo/intent-segmentation';

// Get config for a route page
const config = getIntentConfig('route');
// → { showOfferSchema: true, ctaType: 'medium', ... }
```

### Usage: Conversion Flywheel Hook
```typescript
import { useUserIntent } from '@/hooks/useUserIntent';

function RoutePage() {
  const {
    journeyState,  // 'first-visit' | 'returning' | 'high-intent'
    intent,        // 'research' | 'compare' | 'ready-to-book'
    config,        // Intent configuration
    isFirstVisit,
    trackSearch,
    trackRouteCompare,
  } = useUserIntent('route');

  return (
    <>
      {isFirstVisit && <TrustBlock variant="full" />}
      <SearchWidget onSearch={trackSearch} />
    </>
  );
}
```

### Usage: Trust Signals
```tsx
import { DataFreshness, PriceConfidence, TrustBlock, RouteIntelligence } from '@/components/seo/TrustSignals';

// Data freshness badge
<DataFreshness lastUpdated={new Date()} variant="badge" />

// Price confidence indicator
<PriceConfidence confidence="high" dataPoints={12500} />

// Trust block
<TrustBlock variant="compact" />

// Route intelligence (AI defensibility)
<RouteIntelligence
  origin="JFK"
  destination="LAX"
  avgPrice={285}
  priceChange={-5}
  bestDay="Tuesday"
  demandLevel="high"
  dataPoints={12500}
/>
```

---

## E. TRUST & E-E-A-T CHECKLIST

### Required Elements
| Signal | Component | Placement |
|--------|-----------|-----------|
| Data freshness | `<DataFreshness />` | Route answer blocks |
| Price confidence | `<PriceConfidence />` | Price displays |
| Source disclosure | `<DataSource />` | Footer / details |
| Trust statement | `<TrustBlock />` | First visit, footers |

### Copy Requirements
- ✅ "Prices from 500+ airlines"
- ✅ "Updated hourly"
- ✅ "Based on X price points"
- ✅ "No hidden fees"
- ❌ "Best prices guaranteed" (can't verify)
- ❌ "100% accurate" (never claim)

### Placement Rules
| User State | Trust Signal Level |
|------------|--------------------|
| First visit | Full trust block |
| Returning | Data freshness only |
| High intent | Price confidence only |

---

## F. AI DEFENSIBILITY FEATURES

### 1. Data Freshness Indicators
**Why it matters:** LLMs trust data with timestamps. "Updated hourly" signals reliability.
**Hard to copy:** Requires real-time infrastructure.
```tsx
<DataFreshness lastUpdated={new Date()} source="Amadeus GDS" />
```

### 2. Route Intelligence Summaries
**Why it matters:** Unique data synthesis creates citation-worthy content.
**Hard to copy:** Requires historical price data + analysis.
```tsx
<RouteIntelligence
  avgPrice={285}
  priceChange={-5}
  bestDay="Tuesday"
  dataPoints={12500}
/>
```

### 3. Price Confidence Signals
**Why it matters:** Shows data quality, not just data.
**Hard to copy:** Requires volume + consistency tracking.
```tsx
<PriceConfidence confidence="high" dataPoints={12500} />
```

### 4. Structured Answer Blocks
**Why it matters:** AI can extract and cite specific facts.
**Hard to copy:** Requires content strategy + implementation.
```html
<p data-aeo-answer="true">
  Round-trip flights from JFK to LAX typically cost $189-$285 USD.
</p>
```

---

## G. SPRINT 4 TICKETS

### TICKET: S4-001 — Integrate RouteAnswerBlock
**Priority:** P0
**Points:** 3
**Description:** Add RouteAnswerBlock to flight route pages
**Acceptance:**
- [ ] Block appears above fold on route pages with inventory
- [ ] Hidden on pages without inventory
- [ ] Data attributes present for AI extraction
- [ ] Mobile responsive

### TICKET: S4-002 — Implement useUserIntent Hook
**Priority:** P0
**Points:** 5
**Description:** Add conversion flywheel tracking to key pages
**Acceptance:**
- [ ] localStorage state persists across sessions
- [ ] Journey state transitions correctly
- [ ] trackSearch/trackRouteCompare work
- [ ] No performance impact (lazy load)

### TICKET: S4-003 — Add Trust Signals to Route Pages
**Priority:** P1
**Points:** 3
**Description:** Add DataFreshness and PriceConfidence to route pages
**Acceptance:**
- [ ] Freshness badge shows in route answer block
- [ ] Price confidence shows with prices
- [ ] Trust block shows for first-time visitors
- [ ] No visual clutter

### TICKET: S4-004 — Route Intelligence Component
**Priority:** P1
**Points:** 5
**Description:** Implement RouteIntelligence for AI defensibility
**Acceptance:**
- [ ] Shows price trend, best day, demand level
- [ ] Data attribution footer
- [ ] AEO data attributes
- [ ] Integrated with real pricing data

### TICKET: S4-005 — Intent-Based CTA System
**Priority:** P2
**Points:** 3
**Description:** Dynamic CTAs based on user intent
**Acceptance:**
- [ ] Research intent → "Compare Prices"
- [ ] Compare intent → "Search from $X"
- [ ] Ready-to-book → "Book Now"
- [ ] Smooth transitions

---

## H. IMPLEMENTATION CHECKLIST

- [x] Create `lib/seo/intent-segmentation.ts`
- [x] Create `hooks/useUserIntent.ts`
- [x] Create `components/seo/TrustSignals.tsx`
- [x] Create `components/seo/RouteAnswerBlock.tsx`
- [ ] Integrate RouteAnswerBlock into route pages
- [ ] Add useUserIntent to layout/pages
- [ ] Add trust signals to pricing displays
- [ ] Test AI extraction with data-aeo attributes
- [ ] Validate no CLS impact
- [ ] Update PROMPT-MEMORY-SEO.md

---

## VERSION
- Sprint: 4
- Created: 2025-12-23
- Status: Components Ready for Integration
