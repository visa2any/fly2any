# Fly2Any SEO/AEO/GEO/LLMCO Sprint Checklist

**Based on:** Holistic E2E Audit 2025
**Health Score:** 78/100 → Target: 92/100

---

## Sprint 0: Stabilization & Risk Removal
**Goal:** Eliminate P0 critical risks that could trigger penalties

### Checklist
- [x] Remove hreflang alternates pointing to non-existent /pt, /es routes (`app/layout.tsx`)
- [x] Remove fake aggregateRating (4.8/1250) from TravelAgency schema (`lib/seo/schema-generators.ts`)
- [x] Remove GDS provider references from llms.txt (Amadeus, Duffel)
- [x] Add `force-dynamic` to all API routes using `auth()`

### Acceptance Criteria
- No hreflang errors in Google Search Console
- Schema validation passes without warnings
- llms.txt contains no internal tech details

### Risks if Skipped
- Index confusion: Google may serve wrong language
- Schema spam penalty from Google
- Competitive intelligence leakage

### Validation
```bash
# Check layout.tsx has no invalid hreflang
grep -n "alternates" app/layout.tsx

# Validate schema
curl https://validator.schema.org/...

# Verify llms.txt
curl https://www.fly2any.com/llms.txt | grep -i "amadeus"
```

**Status:** COMPLETE

---

## Sprint 1: Foundation & Indexing
**Goal:** Ensure all pages are crawlable, indexable, and properly linked

### Checklist
- [ ] Add Review schema to `/reviews` page
- [ ] Add contextual internal links from product pages to orphan pages
- [ ] Verify sitemap includes all programmatic routes
- [ ] Add canonical tags to any missing pages
- [ ] Ensure all flight route pages return 200 (not soft 404s)

### Acceptance Criteria
- All pages indexed in GSC within 7 days
- No orphan pages (every page has ≥3 inbound links)
- sitemap.xml includes 50K+ flight routes

### Risks if Skipped
- Orphan pages never get crawled
- Lost ranking potential for /reviews, /travel-guide
- Crawl budget wasted on duplicates

### Validation
```bash
# Check GSC Coverage Report
# Run Screaming Frog crawl
# Verify internal link count per page
```

---

## Sprint 2: Structured Data & Entity Graph
**Goal:** Maximize rich snippet and carousel eligibility

### Checklist
- [x] Add ItemList schema to flight search results (`FlightResultsSEO.tsx`)
- [x] Add SpeakableSpecification to FAQ pages (`app/faq/layout.tsx`)
- [x] Add Breadcrumbs component to key templates (exists, verify usage)
- [ ] Add DefinedTerm schema to travel glossary (if exists)
- [ ] Add LodgingBusiness schema to hotel detail pages
- [ ] Ensure AggregateOffer schema on route pages uses real price data

### Acceptance Criteria
- Rich snippets appear for FAQ queries
- Carousel eligibility for "flights from X to Y"
- Breadcrumb trail shows in SERPs

### Risks if Skipped
- No rich snippets = lower CTR
- Competitors with structured data outrank us
- Voice assistants can't read our content

### Validation
```bash
# Google Rich Results Test
https://search.google.com/test/rich-results

# Schema validator
npx structured-data-testing-tool https://www.fly2any.com/flights/jfk-to-lax
```

---

## Sprint 3: Programmatic SEO & GEO
**Goal:** Scale unique content across 50K+ flight route pages

### Checklist
- [x] Create route-faq-generator.ts with hub-specific tips
- [x] Update flight route pages to use dynamic FAQ generator
- [x] Expand World Cup 2026 data (16 stadiums, 30+ teams)
- [ ] Add unique first paragraph to each route (not template)
- [ ] Include real flight duration estimates per route
- [ ] Add seasonal pricing insights to route pages
- [ ] Create city-specific landing pages for top 50 US cities

### Acceptance Criteria
- Each route page has unique, factual content
- No "thin content" flags in GSC
- Route pages rank for long-tail queries

### Risks if Skipped
- 50K+ pages flagged as thin content
- Panda-style algorithmic demotion
- Lost long-tail traffic opportunity

### Validation
```bash
# Compare content uniqueness between routes
diff <(curl https://fly2any.com/flights/jfk-to-lax) \
     <(curl https://fly2any.com/flights/lax-to-jfk)
```

---

## Sprint 4: AEO & LLM Optimization
**Goal:** Optimize for AI search engines (ChatGPT, Perplexity, Gemini)

### Checklist
- [x] Make AISearchSummary visible (collapsible variant added)
- [ ] Add "Direct Answer Blocks" to top route pages
- [ ] Ensure brand definitions are LLM-quotable
- [ ] Add DefinedTerm schema for key travel terms
- [ ] Create Q&A pairs optimized for voice search
- [ ] Add `speakable` cssSelector to all FAQ sections

### Acceptance Criteria
- Fly2Any cited in AI search responses
- Voice assistants can answer "flights from X to Y" with our data
- llms.txt delivers accurate brand info

### Risks if Skipped
- Zero-click traffic bypasses us entirely
- AI engines use competitor data
- Voice search market lost

### Validation
```bash
# Test AI citation
# Ask ChatGPT: "What is the cheapest flight from JFK to LAX?"
# Ask Perplexity: "Best time to book flights to Los Angeles"

# Check speakable implementation
grep -r "SpeakableSpecification" components/
```

---

## Sprint 5: Internal Linking, Trust & CRO
**Goal:** Strengthen site authority and conversion paths

### Checklist
- [ ] Add related routes links to each route page
- [ ] Add cross-linking between flight + hotel pages
- [ ] Add trust signals to all transactional pages
- [ ] Implement author bylines on blog posts
- [ ] Add "Last Updated" dates to informational content
- [ ] Create topical clusters (destinations → routes → hotels)

### Acceptance Criteria
- Average internal links per page ≥5
- Trust signals visible above fold on booking pages
- Blog posts have author attribution

### Risks if Skipped
- Page authority diluted
- Lower E-E-A-T signals
- Conversion rate stagnates

### Validation
```bash
# Run internal link audit
screaming-frog crawl --internal-links

# Check PageRank flow simulation
ahrefs site-audit internal-linking
```

---

## Summary: What's Done vs TODO

| Sprint | Status | Key Deliverables |
|--------|--------|------------------|
| Sprint 0 | COMPLETE | P0 risks eliminated |
| Sprint 1 | 40% | Review schema pending, linking WIP |
| Sprint 2 | 80% | ItemList, FAQ schema done |
| Sprint 3 | 60% | Route FAQs done, unique content WIP |
| Sprint 4 | 30% | AISearchSummary done, voice search WIP |
| Sprint 5 | 10% | Linking strategy defined, not implemented |

---

## Next Actions (Priority Order)

1. **Add Review schema to /reviews** (Sprint 1)
2. **Generate unique first paragraph per route** (Sprint 3)
3. **Add Direct Answer Blocks** (Sprint 4)
4. **Implement cross-linking strategy** (Sprint 5)
5. **Add author bylines to blog** (Sprint 5)

---

*Document synced with HOLISTIC-SEO-AUDIT-2025.md*
