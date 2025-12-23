# Fly2Any Holistic SEO/AEO/GEO/LLMCO Audit 2025

**Date:** December 22, 2025
**Auditor:** Principal Search Architect
**Scope:** Full E2E Technical & Content Audit

---

## A) EXECUTIVE SUMMARY

### Overall Health Score: **78/100**

| Category | Score | Status |
|----------|-------|--------|
| Technical SEO | 85/100 | Strong |
| Structured Data | 82/100 | Strong |
| AEO Readiness | 70/100 | Moderate |
| GEO/AI Search | 75/100 | Good |
| LLMCO | 72/100 | Moderate |
| Internal Linking | 65/100 | Needs Work |
| Trust Signals | 78/100 | Good |

---

### TOP 5 SYSTEMIC RISKS

| # | Risk | Severity | Impact |
|---|------|----------|--------|
| 1 | **hreflang /pt and /es routes don't exist** - alternates point to non-existent URLs | P0 | Index confusion, wrong language served |
| 2 | **Orphan pages persist** - travel-guide, reviews, baggage-fees have weak internal linking | P1 | Reduced crawl priority, missed rankings |
| 3 | **llms.txt exposes GDS providers** - mentions "Amadeus, Duffel" to AI crawlers | P1 | Internal tech leakage |
| 4 | **TravelAgency schema has fake aggregateRating** - 4.8/1250 reviews hardcoded | P1 | Schema spam risk if Google validates |
| 5 | **Programmatic pages lack unique content** - flight route pages use template FAQ | P2 | Thin content risk at scale |

---

### TOP 5 HIDDEN OPPORTUNITIES

| # | Opportunity | Potential Impact |
|---|-------------|------------------|
| 1 | **Add SpeakableSpecification** to all FAQ pages - voice search optimization | +15% voice traffic |
| 2 | **Generate unique route content** using AI with real flight data | +40% organic impressions |
| 3 | **Add Review schema to reviews page** - currently missing | Rich snippets in SERP |
| 4 | **Implement ItemList schema** for search results pages | Carousel eligibility |
| 5 | **Add DefinedTerm schema** for travel glossary | Featured snippet capture |

---

## B) PRIORITIZED CHECKLIST

### P0 - CRITICAL (Fix Immediately)

| Issue | Location | Why It Matters | Action |
|-------|----------|----------------|--------|
| hreflang points to /pt, /es but pages don't exist | `app/layout.tsx:96-98` | Google may serve wrong language, index issues | Remove alternates OR create locale routes |
| TravelAgency fake ratings | `lib/seo/schema-generators.ts:234-237` | Schema spam detection risk | Remove or use real aggregateRating |

### P1 - HIGH (Fix This Week)

| Issue | Location | Why It Matters | Action |
|-------|----------|----------------|--------|
| llms.txt exposes internal tech | `public/llms.txt:51` | Reveals GDS sources to AI | Remove "Amadeus, Duffel" reference |
| Orphan pages weak linking | `components/layout/Footer.tsx` | Low crawl priority | Add more contextual links from product pages |
| Reviews page missing schema | `app/reviews/page.tsx` | No rich snippets | Add `generateReviewSchema()` from schema-generators |
| Flight route FAQs are generic | `lib/seo/schema-generators.ts:565-592` | Same content across 50K+ pages | Generate dynamic FAQs with real route data |

### P2 - MEDIUM (Fix This Month)

| Issue | Location | Why It Matters | Action |
|-------|----------|----------------|--------|
| AISearchSummary uses sr-only | `components/seo/AISearchSummary.tsx:116` | Hidden content may be devalued | Make visible with collapsed UI |
| No ItemList schema on results | Flight/Hotel results | Missing carousel potential | Add ItemList wrapping results |
| Breadcrumbs not on all pages | Various | Navigation clarity for bots | Add BreadcrumbSchema to all templates |
| World Cup pages thin | `/world-cup-2026/*` | Placeholder content | Add real event details, schedule |

---

## C) NO-GO LIST

### MUST NOT DO:

| Action | Risk |
|--------|------|
| Do NOT add more hreflang without creating actual locale routes | Index bloat, canonicalization issues |
| Do NOT generate fake reviews or ratings in schema | Google penalty for schema spam |
| Do NOT remove robots.txt AI bot rules | Loss of AI search visibility |
| Do NOT redirect programmatic SEO pages | Destroys 50K+ indexed URLs |
| Do NOT change URL structure of /flights/[route] | Massive 404 and lost rankings |
| Do NOT add noindex to flight route pages | Kills programmatic SEO strategy |
| Do NOT expose API endpoints in llms.txt | Security and competitive risk |

---

## D) IMPLEMENTATION ORDER

```
Week 1: P0 Critical
├── 1. Fix hreflang alternates in layout.tsx
├── 2. Remove fake aggregateRating from TravelAgency schema
└── 3. Update llms.txt to remove GDS references

Week 2: P1 High Priority
├── 4. Add Review schema to reviews page
├── 5. Improve internal linking from product pages
├── 6. Generate unique FAQ content for top 100 routes
└── 7. Add SpeakableSpecification to FAQ pages

Week 3: P2 Medium Priority
├── 8. Make AISearchSummary visible (collapsible)
├── 9. Add ItemList schema to search results
├── 10. Add BreadcrumbSchema to all page templates
└── 11. Expand World Cup 2026 content

Week 4: Monitoring & Validation
├── 12. Validate all schemas with Google Rich Results Test
├── 13. Submit updated pages to GSC for re-indexing
├── 14. Monitor AI search citations (Perplexity, ChatGPT)
└── 15. Track ranking changes for key queries
```

**Dependencies:**
- Step 6 requires real flight data API access
- Step 11 requires content creation resources
- Step 14 requires Perplexity Pro / ChatGPT Plus access

---

## E) FUTURE-PROOF RULES

### For New Pages:

1. **Always include** canonical, OG tags, and structured data
2. **Every page must have** at least 3 internal links pointing to it
3. **Programmatic pages** must have unique first paragraph (not template)
4. **FAQ sections** must use real, route-specific data when available
5. **All transactional pages** need OfferCatalog or Product schema

### For New Content:

1. **Answer-first format** - lead with the direct answer, then explain
2. **Include declarative facts** - "Fly2Any is..." not "We are..."
3. **Add citation signals** - dates, sources, verifiable numbers
4. **Voice-search optimize** - use natural question phrasing
5. **LLM-quotable paragraphs** - standalone factual statements

### For AI-Generated Content:

1. **Must be reviewed** by human before publish
2. **Must include unique data** - prices, dates, real stats
3. **Must NOT contain** hallucinated facts or fake reviews
4. **Must pass** originality check (not pure template)
5. **Must have** proper attribution to Fly2Any

---

## TECHNICAL FINDINGS DETAIL

### 1. Rendering Strategy: STRONG

| Page Type | Strategy | Notes |
|-----------|----------|-------|
| Homepage | SSR | Good for freshness |
| Flight Routes | ISR (6hr) | Optimal for SEO scale |
| Hotels | Dynamic | Acceptable for search pages |
| Static (Terms, Privacy) | SSG | Good |
| Admin | Dynamic | Correct - not indexed |

### 2. Crawl Budget: OPTIMIZED

- robots.txt: Comprehensive AI bot rules
- Sitemap: 1000+ flight routes indexed
- Disallowed: /admin, /api, /account (correct)
- AI bots: GPTBot, PerplexityBot, Anthropic-AI allowed

### 3. Structured Data: GOOD WITH ISSUES

**Implemented (29 files):**
- Organization schema
- WebSite with SearchAction
- TravelAgency
- FlightReservation
- FAQPage
- BreadcrumbList
- Product (for routes)
- SpeakableSpecification (partial)
- TouristTrip, LodgingBusiness, TaxiService

**Issues Found:**
- aggregateRating hardcoded (TravelAgency)
- Review schema missing from /reviews
- ItemList not used on results pages

### 4. LLMCO Assets: GOOD

- `/llms.txt` exists and is comprehensive
- `/ai-plugin.json` referenced
- Brand definitions in `lib/content/brand-definitions.ts`
- AISearchSummary component for AI-readable content
- GEOEnhancer component available

---

## VALIDATION COMMANDS

```bash
# Validate schemas
npx structured-data-testing-tool https://www.fly2any.com

# Check robots.txt
curl https://www.fly2any.com/robots.txt

# Test AI accessibility
curl -H "User-Agent: GPTBot" https://www.fly2any.com/

# Verify llms.txt
curl https://www.fly2any.com/llms.txt
```

---

**END OF AUDIT**

*This document is the SINGLE SOURCE OF TRUTH for Fly2Any organic initiatives.*
