# Fly2Any Internal Linking Strategy

## Audit Summary

| Metric | Count |
|--------|-------|
| Total Pages | 189 |
| Header Links | 15 |
| Footer Links | 28 |
| Popular Routes | 6 |

---

## 1. ORPHAN PAGES IDENTIFIED

### Critical Orphans (No inbound links from nav)

| Page | Status | Priority |
|------|--------|----------|
| `/solo-travel` | ORPHAN | HIGH |
| `/travel-planning` | ORPHAN | HIGH |
| `/baggage-fees` | ORPHAN | MEDIUM |
| `/travel-guide` | Weak (1 link) | HIGH |
| `/explore` | Weak (1 link) | MEDIUM |
| `/reviews` | ORPHAN | HIGH |
| `/tripmatch/*` | ORPHAN | LOW |
| `/world-cup-2026/*` | Event pages | MEDIUM |

### Admin/Account (Expected - No public links)
- `/admin/*` - Internal only
- `/agent/*` - B2B portal
- `/account/*` - Logged-in users

---

## 2. ANCHOR TEXT DISTRIBUTION

### Current Issues
| Problem | Example |
|---------|---------|
| Generic anchors | "Click here", "Learn more" |
| Over-optimized | Exact match keywords only |
| Missing context | Links without descriptive text |

### Target Distribution
```
40% - Branded: "Fly2Any flights", "Fly2Any hotels"
30% - Descriptive: "cheap flights to Miami", "hotel deals in Paris"
20% - Natural: "find your flight", "compare prices"
10% - Naked URLs/CTAs: "Search now", URL only
```

---

## 3. SEMANTIC LINKING STRATEGY

### By Intent (User Journey)

```
AWARENESS → CONSIDERATION → DECISION → RETENTION

/blog → /destinations → /flights/results → /account/bookings
/travel-guide → /deals → /checkout → /account/trips
/faq → /airlines → /booking → /reviews
```

### By Geography (Hub & Spoke)

```
HUB: /destinations
  └── /destinations/new-york
  └── /destinations/miami
  └── /destinations/london
      └── /flights/new-york-to-london
      └── /hotels?city=london
      └── /tours?city=london
```

### By Product Category

```
FLIGHTS HUB: /flights
  ├── /airlines/united
  ├── /flights/results
  ├── /deals/cheap-flights-*
  └── /baggage-fees

HOTELS HUB: /hotels
  ├── /hotels/[id]
  └── /destinations/[city]

ACTIVITIES HUB: /tours + /activities
  ├── /tours/results
  └── /activities/[id]
```

---

## 4. LINKING RULES

### DO (Priority Links)

```tsx
// Rule 1: Cross-link related services
<Link href="/hotels?city=miami">Hotels in Miami</Link>  // From flight results
<Link href="/transfers?to=MIA">Airport transfers</Link> // From booking confirm

// Rule 2: Link to hub pages from deep pages
<Link href="/destinations">Browse all destinations</Link> // From any city page

// Rule 3: Use descriptive anchor text
<Link href="/flights/nyc-to-lax">Flights from NYC to LA</Link> // Good
<Link href="/flights/nyc-to-lax">Click here</Link>             // Bad

// Rule 4: Contextual footer links
<Link href="/baggage-fees">Airline baggage policies</Link>     // From booking
<Link href="/travel-insurance">Protect your trip</Link>        // From checkout
```

### DON'T (No-Go Zones)

```tsx
// Rule 1: Never link to admin/internal pages publicly
<Link href="/admin/dashboard">Admin</Link>  // NEVER

// Rule 2: No orphan creating patterns
// - Don't create pages without adding navigation links

// Rule 3: Avoid redirect chains
<Link href="/old-page">...</Link>  // If redirects, update source

// Rule 4: No excessive linking (max 3-5 internal links per section)

// Rule 5: Don't link checkout/payment pages (nofollow if needed)
<Link href="/checkout">...</Link>  // Minimize crawl budget waste
```

---

## 5. PRIORITY IMPLEMENTATION

### Phase 1: Fix Orphans (Week 1)

```tsx
// Add to Footer.tsx - "Resources" section
<Link href="/travel-guide">Travel Guide</Link>
<Link href="/baggage-fees">Baggage Calculator</Link>
<Link href="/reviews">Customer Reviews</Link>
<Link href="/solo-travel">Solo Travel Tips</Link>
```

### Phase 2: Cross-Linking (Week 2)

```tsx
// Flight results → Related services
"Flying to {city}? Check out hotels and tours."
<Link href={`/hotels?city=${city}`}>Hotels</Link>
<Link href={`/tours?city=${city}`}>Tours</Link>

// Hotel page → Related content
<Link href={`/destinations/${city}`}>Things to do in {city}</Link>
```

### Phase 3: Content Silos (Week 3)

```
Create topic clusters:
├── /cheap-flights (pillar)
│   ├── /deals/cheap-flights-nyc-lax
│   ├── /blog/how-to-find-cheap-flights
│   └── /faq#cheap-flights
│
├── /destinations (pillar)
│   ├── /destinations/[city]
│   └── /blog/best-destinations-2025
```

---

## 6. TECHNICAL IMPLEMENTATION

### Add Breadcrumbs Component

```tsx
// components/seo/Breadcrumbs.tsx
const breadcrumbSchema = {
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "/" },
    { "@type": "ListItem", "position": 2, "name": "Flights", "item": "/flights" },
  ]
};
```

### Related Links Component

```tsx
// components/seo/RelatedLinks.tsx
export function RelatedLinks({ currentPage, city }) {
  return (
    <nav aria-label="Related pages">
      <Link href={`/hotels?city=${city}`}>Hotels in {city}</Link>
      <Link href={`/tours?city=${city}`}>Tours in {city}</Link>
    </nav>
  );
}
```

---

## 7. MONITORING

### Track These Metrics
- Pages with < 3 internal links (orphans)
- Pages with > 100 outbound links (dilution)
- Average internal links per page (target: 5-15)
- Click depth from homepage (target: max 3 clicks)

### Tools
- Screaming Frog (crawl simulation)
- Google Search Console (internal links report)
- Vercel Analytics (navigation flows)
