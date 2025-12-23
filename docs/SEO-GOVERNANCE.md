# SEO & LLM GOVERNANCE DOCUMENT
## Fly2Any.com - Search & AI Optimization Standards

**Version:** 1.0.0
**Last Updated:** 2025-01-23
**Owner:** SEO Platform Engineering

---

## 1. INDEXATION RULES

### Indexable Pages (robots: index,follow)
| Page Type | Example | Canonical Rule |
|-----------|---------|----------------|
| Homepage | `/` | Self-referencing |
| Product pages | `/flights`, `/hotels` | Self-referencing |
| Route pages | `/flights/jfk-to-lax` | Self-referencing |
| City pages | `/usa/flights-from-new-york` | Self-referencing |
| Blog posts | `/blog/[slug]` | Self-referencing |
| Destination pages | `/destinations/[city]` | Self-referencing |

### Non-Indexable Pages (robots: noindex,follow)
| Page Type | Reason |
|-----------|--------|
| `/flights/results*` | Infinite URL variations |
| `/hotels/results*` | Infinite URL variations |
| `/auth/*` | User authentication |
| `/account/*` | Private user data |
| `/admin/*` | Admin panel |
| `/checkout/*` | Transaction flow |
| `/booking/*/confirmation` | Private booking data |

### Never Index (Disallow in robots.txt)
- `/api/*`
- `/_next/static/*`
- `/private/*`
- `/*.json$`

---

## 2. CANONICAL TAG STANDARDS

### Implementation Pattern
```typescript
// Static pages - via layout.tsx
export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/page-path`,
  },
};

// Dynamic pages - via generateMetadata
export async function generateMetadata({ params }) {
  return {
    alternates: {
      canonical: `${SITE_URL}/flights/${params.route}`,
    },
  };
}
```

### Rules
1. **Always absolute URLs** - `https://www.fly2any.com/...`
2. **Always self-referencing** - Canonical points to the same URL
3. **No query parameters** - Strip ?sort=, ?filter=, ?page=
4. **Lowercase paths** - Normalize to lowercase
5. **No trailing slashes** - `/flights` not `/flights/`

### Exceptions
- Pagination: Use `rel="prev"` and `rel="next"` instead
- Filtered views: Canonical to unfiltered parent

---

## 3. SOFT 404 HANDLING

### Definition
A page that returns HTTP 200 but displays:
- "No results found"
- Empty content
- Error-like messaging
- Placeholder data

### Detection Triggers
```
- averagePrice === placeholder (350)
- Content contains "No flights found"
- Schema.org Offer with price = 0
- Empty product listings
```

### Response Strategy

| Scenario | Action | HTTP | Schema |
|----------|--------|------|--------|
| Invalid route slug | `notFound()` | 404 | None |
| Route exists, no current inventory | Keep 200, show alternatives | 200 | Remove Offer |
| Route exists, has data | Normal render | 200 | Full schema |

### Implementation
```typescript
// In flight route page
if (!hasRealPricingData) {
  // Don't use notFound() - route is valid
  // Instead: render alternative content
  return <NoFlightsAvailable origin={origin} destination={destination} />;
}
```

---

## 4. AI/LLM CRAWL OPTIMIZATION (LLMCO)

### Allowed Bots
| Bot | Access | Crawl Delay |
|-----|--------|-------------|
| GPTBot | Full (except admin) | 2s |
| ChatGPT-User | Full (except admin) | 2s |
| Claude-Web | Full (except admin) | 2s |
| PerplexityBot | Full (except admin) | 3s |
| Google-Extended | Blocked | - |

### Content Optimization for LLMs
1. **Declarative statements** - "Fly2Any is a travel platform..."
2. **Factual data** - Avoid promotional superlatives
3. **Structured answers** - FAQ schema for direct answers
4. **Entity definitions** - Clear product/service descriptions

### robots.txt AI Section
```
User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Crawl-delay: 2

User-agent: ChatGPT-User
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Crawl-delay: 2
```

---

## 5. SCHEMA.ORG STANDARDS

### Required Schemas by Page Type

| Page | Schema Types |
|------|-------------|
| Homepage | Organization, WebSite, SearchAction |
| Flight route | FlightReservation, Offer, BreadcrumbList, FAQPage |
| Hotel | Hotel, Offer, BreadcrumbList |
| Blog | Article, BreadcrumbList |
| FAQ | FAQPage |

### Conditional Schema Rules
```typescript
// Only include Offer schema when real pricing exists
if (hasRealPricing && price > 0) {
  schema.push(offerSchema);
}

// Always include BreadcrumbList and FAQPage
schema.push(breadcrumbSchema, faqSchema);
```

---

## 6. CRAWL BUDGET OPTIMIZATION

### URL Parameter Handling
| Parameter | Action |
|-----------|--------|
| `?sort=` | Block in robots.txt |
| `?filter=` | Block in robots.txt |
| `?page=` | Block in robots.txt |
| `?currency=` | Ignore (canonical to USD) |
| `?lang=` | Future: hreflang |

### Priority Signals (via sitemap)
| Priority | Page Type |
|----------|-----------|
| 1.0 | Homepage |
| 0.95 | Main product pages |
| 0.9 | US domestic routes |
| 0.8 | US-International routes |
| 0.6 | International routes |
| 0.5 | Low-traffic routes |

---

## 7. REGRESSION PREVENTION

### Pre-Deploy Checklist
- [ ] All new pages have canonical tags
- [ ] Dynamic routes use generateMetadata
- [ ] No placeholder content in production
- [ ] Schema.org validates (schema.org/validator)
- [ ] robots.txt unchanged or reviewed
- [ ] Sitemap includes new URLs

### Monitoring
- Google Search Console: Coverage report
- Soft 404 alerts: Weekly review
- Crawl stats: Daily monitoring
- Schema errors: Real-time alerts

---

## 8. CHANGE LOG

| Date | Change | Author |
|------|--------|--------|
| 2025-01-23 | Initial governance document | SEO Platform Eng |
| 2025-01-23 | Added canonical fixes | SEO Platform Eng |
| 2025-01-23 | Soft 404 handling rules | SEO Platform Eng |
