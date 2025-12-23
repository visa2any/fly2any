# Fly2Any Entity Graph & Structured Data Architecture

## Entity Relationship Diagram

```
                          ┌─────────────────────────────────────────────────────────────┐
                          │                    FLY2ANY ENTITY GRAPH                     │
                          │            Production Schema.org Implementation             │
                          └─────────────────────────────────────────────────────────────┘

                                          ┌─────────────────────┐
                                          │    Organization     │
                                          │   @id: /#org        │
                                          │   Fly2Any           │
                                          └──────────┬──────────┘
                                                     │
                                    ┌────────────────┼────────────────┐
                                    │                │                │
                                    ▼                ▼                ▼
                          ┌─────────────────┐ ┌─────────────┐ ┌──────────────┐
                          │    WebSite      │ │  SoftwareApp│ │ TravelAgency │
                          │ @id: /#website  │ │(Ref to org) │ │ (Ref to org) │
                          └────────┬────────┘ └─────────────┘ └──────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌─────────────┐ ┌──────────────┐ ┌────────────┐
            │ SearchAction│ │   Article    │ │  FAQPage   │
            │@id:/#search │ │ @id: /blog/* │ │ (per page) │
            └─────────────┘ └──────────────┘ └────────────┘


                            ─────────── ROUTE ENTITY GRAPH ───────────

                                    ┌────────────────────┐
                                    │      Flight        │
                                    │  @id: /flights/*   │
                                    │   (Route Entity)   │
                                    └─────────┬──────────┘
                                              │
                   ┌──────────────────────────┼──────────────────────────┐
                   │                          │                          │
                   ▼                          ▼                          ▼
           ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
           │  Airport        │       │  AggregateOffer │       │  Airport        │
           │(Departure)      │       │ (CONDITIONAL)   │       │ (Arrival)       │
           │ @id: /airports/*│       │ Only if         │       │ @id: /airports/*│
           └────────┬────────┘       │ hasInventory    │       └────────┬────────┘
                    │                └─────────────────┘                │
                    ▼                                                   ▼
            ┌─────────────────┐                                ┌─────────────────┐
            │     City        │                                │     City        │
            │  @id: /dest/*   │                                │  @id: /dest/*   │
            └─────────────────┘                                └─────────────────┘


                            ─────────── CITY/DESTINATION GRAPH ───────────

                                    ┌────────────────────┐
                                    │       City         │
                                    │  @id: /dest/*      │
                                    │ containedInPlace   │
                                    └─────────┬──────────┘
                                              │
                   ┌──────────────────────────┼──────────────────────────┐
                   │                          │                          │
                   ▼                          ▼                          ▼
           ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
           │    Country      │       │  Airport (1..n) │       │ GeoCoordinates  │
           │ (Parent Place)  │       │ @id: /airports/*│       │   (Optional)    │
           └─────────────────┘       └─────────────────┘       └─────────────────┘
```

## Entity ID Patterns (Canonical @id References)

All entities use consistent @id patterns for cross-reference integrity:

| Entity Type   | @id Pattern                                      | Example                                       |
|---------------|--------------------------------------------------|-----------------------------------------------|
| Organization  | `{SITE_URL}/#organization`                       | `https://www.fly2any.com/#organization`       |
| WebSite       | `{SITE_URL}/#website`                            | `https://www.fly2any.com/#website`            |
| SearchAction  | `{SITE_URL}/#searchaction`                       | `https://www.fly2any.com/#searchaction`       |
| Airline       | `{SITE_URL}/airlines/{code}#airline`             | `https://www.fly2any.com/airlines/aa#airline` |
| Airport       | `{SITE_URL}/airports/{code}#airport`             | `https://www.fly2any.com/airports/jfk#airport`|
| City          | `{SITE_URL}/destinations/{slug}#city`            | `https://www.fly2any.com/destinations/miami#city` |
| Route         | `{SITE_URL}/flights/{origin}-to-{dest}#route`    | `https://www.fly2any.com/flights/jfk-to-lax#route`|
| Article       | `{SITE_URL}/blog/{slug}#article`                 | `https://www.fly2any.com/blog/travel-tips#article`|

## Schema Types by Page

### Homepage (`/`)
```json
[
  { "@type": "Organization", "@id": "/#organization" },
  { "@type": "WebSite", "@id": "/#website", "potentialAction": SearchAction },
  { "@type": "SoftwareApplication" },
  { "@type": "TravelAgency" }
]
```

### Route Page (`/flights/[route]`)
```json
[
  { "@type": "Flight", "@id": "/flights/jfk-to-lax#route" },
  { "@type": "BreadcrumbList" },
  { "@type": "FAQPage" },
  // CONDITIONAL - only if hasInventory:
  { "@type": "AggregateOffer", "availability": "InStock" }
]
```

### Destination Page (`/destinations/[city]`)
```json
[
  { "@type": "City", "@id": "/destinations/miami#city" },
  { "@type": "BreadcrumbList" },
  // Related airports:
  { "@type": "Airport", "@id": "/airports/mia#airport" }
]
```

### Article Page (`/blog/[slug]`)
```json
[
  { "@type": "Article", "@id": "/blog/tips#article" },
  { "@type": "BreadcrumbList" },
  { "@type": "FAQPage" } // Optional
]
```

## Conditional Schema Rules

### Offer Schema - CRITICAL
```typescript
// ONLY include AggregateOffer when ALL conditions are met:
if (route.hasInventory && route.pricing && route.pricing.minPrice > 0) {
  // Include Offer schema
} else {
  // NEVER include Offer - prevents schema spam penalty
}
```

### Why This Matters
- **Google Spam Policy**: Fake pricing in structured data = manual action risk
- **SGE/AI Overviews**: Accurate pricing = citation eligibility
- **Rich Results**: Invalid Offer = entire schema ignored

## Implementation Files

| Purpose              | File Path                                |
|----------------------|------------------------------------------|
| Entity Schema Layer  | `lib/seo/entity-schema.ts`               |
| Route Page           | `app/flights/[route]/page.tsx`           |
| Metadata Helpers     | `lib/seo/metadata.ts`                    |
| No Inventory UI      | `components/seo/NoFlightsAvailable.tsx`  |
| StructuredData       | `components/seo/StructuredData.tsx`      |

## Usage Examples

### Generate Route Schema
```typescript
import { getRoutePageSchemaGraph, type RouteData } from '@/lib/seo/entity-schema';

const routeData: RouteData = {
  origin: 'JFK',
  originName: 'New York, NY',
  destination: 'LAX',
  destinationName: 'Los Angeles, CA',
  hasInventory: true,
  pricing: { minPrice: 189, avgPrice: 285, currency: 'USD' },
  airlines: ['AA', 'UA', 'DL'],
};

const schemas = getRoutePageSchemaGraph(routeData, breadcrumbs, faqs);
// Returns array with Flight, BreadcrumbList, FAQPage, and AggregateOffer
```

### Generate Schema WITHOUT Offer
```typescript
const routeData: RouteData = {
  origin: 'ABC',
  originName: 'Some City',
  destination: 'XYZ',
  destinationName: 'Other City',
  hasInventory: false, // No inventory
};

const schemas = getRoutePageSchemaGraph(routeData, breadcrumbs, faqs);
// Returns array with Flight, BreadcrumbList, FAQPage ONLY (no Offer)
```

## Validation Checklist

Before deploying schema changes:

- [ ] Validate at https://validator.schema.org/
- [ ] Test in Google Rich Results Test
- [ ] Verify @id references are consistent
- [ ] Confirm Offer only appears with real pricing
- [ ] Check BreadcrumbList position values start at 1
- [ ] Ensure FAQPage has at least 2 questions

## Version History

| Version | Date       | Changes                           |
|---------|------------|-----------------------------------|
| 2.0.0   | 2025-01    | Entity Graph layer introduced     |
| 1.0.0   | 2024-12    | Initial schema implementation     |
