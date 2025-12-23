# Fly2Any Search Governance

## Purpose
Non-negotiable rules for search visibility, indexing, and content governance.
This document is the single source of truth for all SEO decisions.

---

## 1. INDEXING RULES

### MUST INDEX (Protected Pages)
| Page Type | Pattern | Reason |
|-----------|---------|--------|
| Route pages (with inventory) | `/flights/[origin]-to-[dest]` | Core traffic drivers |
| Destination hubs | `/destinations/[city]` | Topical authority |
| Airline pages | `/airlines/[code]` | Entity coverage |
| Blog articles | `/blog/[slug]` | Content authority |
| World Cup 2026 | `/world-cup-2026/*` | Seasonal event (until 2026-08) |
| Homepage | `/` | Brand anchor |
| Core landing | `/flights`, `/hotels`, `/cars` | Category entry |

### MUST NOINDEX (Protected from Index)
| Page Type | Pattern | Reason |
|-----------|---------|--------|
| Search results | `/flights/results*` | Dynamic, duplicate-prone |
| Booking flow | `/booking/*`, `/checkout/*` | Transactional, private |
| Auth pages | `/auth/*`, `/login`, `/signup` | No SEO value |
| Admin | `/admin/*` | Internal only |
| Account | `/account/*` | User-private |
| API routes | `/api/*` | Non-HTML |
| Previews | `?preview=*` | Draft content |

### CONDITIONAL INDEXING
| Condition | Action | Implementation |
|-----------|--------|----------------|
| Route has no inventory > 90 days | Consider noindex | `content-governance.ts` |
| Price data stale > 180 days | Noindex | Automated |
| Seasonal content expired | Archive or redirect | `seasonal-config` |
| Page views < 10 + bounce > 95% | Review for noindex | Monthly audit |

---

## 2. CANONICALIZATION RULES

### Self-Referencing Canonicals
Every indexable page MUST have an absolute self-referencing canonical:
```typescript
// REQUIRED pattern
alternates: {
  canonical: `https://www.fly2any.com/path/to/page`
}
```

### Canonical Decision Tree
```
Is this a duplicate? → Point to original
Is this paginated? → Point to page 1 (or use rel=prev/next)
Is this a variant (params)? → Point to clean URL
Is this unique? → Self-reference
```

### Forbidden Patterns
- ❌ Relative canonicals
- ❌ Missing canonicals on indexable pages
- ❌ Canonical pointing to noindex page
- ❌ Canonical chains (A→B→C)

---

## 3. PROGRAMMATIC PAGE RULES

### Creation Criteria
A programmatic page may only be created if:
1. Valid entity exists (airport code, city, airline)
2. At least one airline serves the route (or served in past 6 months)
3. Content can be populated without placeholders
4. Page passes quality validation (`validateContentQuality`)

### Forbidden Actions
- ❌ Creating pages for non-existent routes
- ❌ Using placeholder prices ("from $XX")
- ❌ Generating thin content (< 300 chars body)
- ❌ Duplicating existing pages

### Quality Gates
```typescript
// lib/seo/content-governance.ts
if (!isValidRoute(origin, destination)) return notFound();
if (isRouteBlocked(origin, destination)) return notFound();
if (!inventory.hasInventory) return <NoFlightsAvailable />;
```

---

## 4. SCHEMA.ORG ELIGIBILITY

### Schema Requirements
| Schema Type | Condition | Implementation |
|-------------|-----------|----------------|
| AggregateOffer | Real inventory + price > 0 | `hasInventory && pricing.minPrice > 0` |
| FAQPage | ≥ 2 real Q&A pairs | Always on route pages |
| BreadcrumbList | All indexable pages | Always |
| Organization | Homepage only | Root layout |
| Flight | Route pages with data | Entity schema |

### Forbidden Schema Patterns
- ❌ Offer schema without real pricing
- ❌ Review schema without verified reviews
- ❌ Event schema for non-events
- ❌ Product schema for services

---

## 5. CONTENT FRESHNESS

### Update Cadence
| Content Type | Max Age | Action |
|--------------|---------|--------|
| Route prices | 24 hours | Auto-refresh via ISR |
| Destination info | 30 days | Manual review |
| Blog articles | 90 days | Check for accuracy |
| FAQ answers | 60 days | Validate facts |
| World Cup 2026 | Event-driven | Update with schedule |

### Staleness Response
```
Price > 24h old → Show "Live" badge as false
Price > 7 days → Hide price, show "Check prices"
Price > 90 days → Remove Offer schema
Price > 180 days → Consider deindex
```

---

## 6. DE-INDEXING CRITERIA (KILL SWITCH)

### Automatic De-index Triggers
1. Route deprecated by all airlines
2. Legal/compliance flag raised
3. DMCA takedown received
4. Manual action from Google
5. Page generating spam reports

### Emergency Kill Switch
```typescript
// Add to page metadata
export const metadata = {
  robots: { index: false, follow: false }
};
```

### Recovery Process
1. Fix underlying issue
2. Remove noindex
3. Submit to Google Search Console
4. Monitor for 30 days

---

## 7. ENFORCEMENT

### Pre-Commit Checks
- [ ] Canonical tag present
- [ ] Schema validates (schema.org/validator)
- [ ] No placeholder content
- [ ] Robots directive correct

### Weekly Audits
- [ ] Index coverage in GSC
- [ ] Soft 404 report
- [ ] Schema errors
- [ ] Core Web Vitals

### Monthly Reviews
- [ ] Traffic by page type
- [ ] Conversion by intent
- [ ] AI citation tracking
- [ ] Competitor monitoring

---

## 8. CHANGE MANAGEMENT

### Before Changing URL Structure
1. Document current URLs
2. Create redirect map
3. Update sitemaps
4. Notify stakeholders
5. Monitor post-change

### Before Adding Page Type
1. Define canonical pattern
2. Define indexing rule
3. Define schema eligibility
4. Create content template
5. Add to governance docs

---

## VERSION
- Created: 2025-12-23
- Owner: SEO Platform Engineering
- Review: Quarterly
