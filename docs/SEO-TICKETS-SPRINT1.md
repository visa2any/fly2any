# SEO SPRINT 1 - TICKETS
## Jira/ClickUp Style Task Definitions

---

## TICKET: SEO-001
### Implement Soft 404 Prevention on Flight Route Pages

**Type:** Bug Fix
**Priority:** P0 - Critical
**Sprint:** 1
**Story Points:** 5
**Assignee:** Frontend Engineering

#### Description
Flight route pages (`/flights/[route]`) currently display placeholder pricing data ($350, 5h 30m) regardless of whether real data exists. This creates a soft 404 pattern that Google may penalize.

#### Current Behavior
- Page always returns HTTP 200
- Displays hardcoded placeholder prices
- Schema.org Offer shows fake pricing
- No differentiation between valid/invalid routes with data

#### Expected Behavior
1. Valid route WITH data → Show real prices, full schema
2. Valid route WITHOUT data → Show "Check prices" CTA, NO Offer schema
3. Invalid route → Return 404 via notFound()

#### Acceptance Criteria
- [ ] Route pages check for cached pricing data
- [ ] Placeholder prices removed from production
- [ ] Schema.org Offer only rendered when real price exists
- [ ] "No flights available" state shows alternative routes
- [ ] Google Search Console soft 404s reduced by 90%

#### Technical Notes
- File: `app/flights/[route]/page.tsx`
- Use route pricing cache or API check
- Conditionally render schema components

#### Test Cases
1. Visit `/flights/jfk-to-lax` → Should show real or "check prices"
2. Visit `/flights/xyz-to-abc` → Should return 404
3. Validate schema.org output for both states

---

## TICKET: SEO-002
### Add Route Pricing Cache Integration

**Type:** Enhancement
**Priority:** P1 - High
**Sprint:** 1
**Story Points:** 8
**Assignee:** Backend Engineering

#### Description
Implement a pricing cache layer for programmatic route pages to provide real pricing data and eliminate soft 404 patterns.

#### Requirements
- Cache popular route prices (top 1000 routes)
- TTL: 6 hours (matches ISR revalidation)
- Fallback: API call with 3s timeout
- Store: Redis or KV store

#### Acceptance Criteria
- [ ] Cache warming job runs daily
- [ ] Top 1000 routes have cached prices
- [ ] Cache miss triggers async API call
- [ ] Pricing displayed within 100ms

#### Data Structure
```typescript
interface RoutePriceCache {
  route: string;         // "jfk-to-lax"
  minPrice: number;      // 189
  avgPrice: number;      // 285
  currency: string;      // "USD"
  airlines: string[];    // ["AA", "UA", "DL"]
  lastUpdated: Date;
  hasInventory: boolean;
}
```

---

## TICKET: SEO-003
### Create NoFlightsAvailable Component

**Type:** New Feature
**Priority:** P1 - High
**Sprint:** 1
**Story Points:** 3
**Assignee:** Frontend Engineering

#### Description
Create a reusable component for route pages when no flight inventory exists. Must maintain SEO value while not triggering soft 404.

#### Requirements
- Display friendly "No direct flights" message
- Show alternative routes (nearby airports)
- Include internal links to related destinations
- Do NOT include Offer schema
- Keep BreadcrumbList and FAQPage schema

#### Acceptance Criteria
- [ ] Component renders without Offer schema
- [ ] Shows 3-5 alternative routes
- [ ] Includes search widget for manual dates
- [ ] Mobile responsive
- [ ] Accessible (WCAG 2.1 AA)

#### Design
```
┌─────────────────────────────────────┐
│  No Direct Flights Available        │
│  JFK → XYZ                          │
│                                     │
│  Try these alternatives:            │
│  • JFK → ABC (nearby)               │
│  • JFK → DEF (similar)              │
│  • EWR → XYZ (alternate airport)    │
│                                     │
│  [Search Different Dates]           │
└─────────────────────────────────────┘
```

---

## TICKET: SEO-004
### Conditional Schema.org Rendering

**Type:** Enhancement
**Priority:** P1 - High
**Sprint:** 1
**Story Points:** 3
**Assignee:** Frontend Engineering

#### Description
Modify schema.org rendering to conditionally include/exclude Offer markup based on data availability.

#### Current State
```typescript
// Always renders all schemas
<StructuredData schema={[flightSchema, breadcrumbSchema, faqSchema]} />
```

#### Target State
```typescript
const schemas = [breadcrumbSchema, faqSchema];
if (hasRealPricing) {
  schemas.push(offerSchema);
}
<StructuredData schema={schemas} />
```

#### Acceptance Criteria
- [ ] Offer schema only appears when price > 0
- [ ] BreadcrumbList always renders
- [ ] FAQPage always renders
- [ ] Schema validates at schema.org/validator
- [ ] No console errors

---

## TICKET: SEO-005
### TripMatch Canonical Tag Refactor

**Type:** Technical Debt
**Priority:** P2 - Medium
**Sprint:** 2
**Story Points:** 5
**Assignee:** Frontend Engineering

#### Description
TripMatch pages use 'use client' layouts which prevent metadata exports. Refactor to enable proper canonical tags.

#### Options
1. Route group with server layout for metadata only
2. Convert landing page to server component
3. Use template.tsx for metadata

#### Acceptance Criteria
- [ ] `/tripmatch` has canonical tag
- [ ] `/tripmatch/browse` has canonical tag
- [ ] No breaking changes to TripMatch functionality
- [ ] All pages validate in Google Search Console

---

## TICKET: SEO-006
### Sitemap URL Validation Script

**Type:** DevOps
**Priority:** P2 - Medium
**Sprint:** 2
**Story Points:** 2
**Assignee:** DevOps Engineering

#### Description
Create automated script to validate sitemap URLs match actual page responses.

#### Requirements
- Fetch all URLs from sitemap-index.xml
- Check HTTP status code for each
- Report 404s, 5xx errors
- Run weekly via GitHub Actions

#### Acceptance Criteria
- [ ] Script checks all sitemap URLs
- [ ] Report generated as GitHub artifact
- [ ] Slack notification on errors
- [ ] Runs in < 10 minutes

---

## SPRINT 1 SUMMARY

| Ticket | Priority | Points | Status |
|--------|----------|--------|--------|
| SEO-001 | P0 | 5 | Ready |
| SEO-002 | P1 | 8 | Ready |
| SEO-003 | P1 | 3 | Ready |
| SEO-004 | P1 | 3 | Ready |
| SEO-005 | P2 | 5 | Backlog |
| SEO-006 | P2 | 2 | Backlog |

**Total Points:** 26
**Sprint Capacity:** 21 (P0 + P1 only)
