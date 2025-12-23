# Fly2Any Locale Readiness Matrix

## Purpose
Track activation prerequisites for each target locale.
NO locale activates until ALL prerequisites are met.

---

## Readiness Status Legend

| Status | Meaning |
|--------|---------|
| READY | Fully implemented, tested |
| PARTIAL | In progress, not complete |
| PLANNED | Designed, not started |
| BLOCKED | Dependency or issue |

---

## TIER 1 LOCALES

### pt-br (Portuguese Brazil)

| Component | Status | Notes |
|-----------|--------|-------|
| **Technical** | | |
| URL routing (`/pt-br/*`) | PLANNED | Middleware ready |
| Hreflang generation | READY | `lib/seo/hreflang.ts` |
| Canonical system | READY | Locale-agnostic |
| Currency (BRL) | READY | Fully implemented |
| **Content** | | |
| Route pages | PLANNED | Template ready |
| UI strings | PLANNED | Need extraction |
| FAQ translations | PLANNED | Need translation |
| Answer blocks | PLANNED | Template ready |
| **Schema** | | |
| Entity @id consistency | READY | Governed |
| Localized names | PLANNED | Need mapping |
| Currency in schema | READY | Dynamic |
| **Operations** | | |
| Payment (PIX) | BLOCKED | Need provider |
| Support (Portuguese) | BLOCKED | Need staffing |
| Legal (terms) | PLANNED | Need translation |

**Overall Readiness**: 45%
**Activation Blocker**: Payment + Support

---

### es-mx (Spanish Mexico)

| Component | Status | Notes |
|-----------|--------|-------|
| **Technical** | | |
| URL routing (`/es-mx/*`) | PLANNED | Middleware ready |
| Hreflang generation | READY | `lib/seo/hreflang.ts` |
| Canonical system | READY | Locale-agnostic |
| Currency (MXN) | READY | Fully implemented |
| **Content** | | |
| Route pages | PLANNED | Template ready |
| UI strings | PLANNED | Need extraction |
| FAQ translations | PLANNED | Need translation |
| Answer blocks | PLANNED | Template ready |
| **Schema** | | |
| Entity @id consistency | READY | Governed |
| Localized names | PLANNED | Need mapping |
| Currency in schema | READY | Dynamic |
| **Operations** | | |
| Payment (OXXO) | BLOCKED | Need provider |
| Support (Spanish) | PARTIAL | Some coverage |
| Legal (terms) | PLANNED | Need translation |

**Overall Readiness**: 50%
**Activation Blocker**: Payment

---

### en-ca (English Canada)

| Component | Status | Notes |
|-----------|--------|-------|
| **Technical** | | |
| URL routing (`/en-ca/*`) | PLANNED | NOT RECOMMENDED |
| Hreflang generation | READY | Can implement |
| Canonical system | READY | Shared with en-us? |
| Currency (CAD) | READY | Fully implemented |
| **Content** | | |
| Route pages | N/A | Use en-us content |
| UI strings | READY | Same as en-us |
| FAQ translations | READY | Same as en-us |
| **Schema** | | |
| Currency in schema | READY | CAD supported |
| **Operations** | | |
| Payment | READY | Same providers |
| Support | READY | Same team |

**Overall Readiness**: 80%
**Activation Blocker**: Cannibalization risk
**Recommendation**: Currency-switch only, NO separate URLs

---

## TIER 2 LOCALES

| Locale | Tech Ready | Content Ready | Ops Ready | Overall | Blocker |
|--------|------------|---------------|-----------|---------|---------|
| en-gb | 70% | 0% | 60% | 40% | Content strategy |
| es-es | 60% | 0% | 40% | 30% | GDPR, content |
| es-co | 60% | 0% | 30% | 25% | Payment, support |
| de-de | 40% | 0% | 20% | 15% | Full translation |

---

## TIER 3 LOCALES (NOT STARTED)

| Locale | Status | Earliest Activation |
|--------|--------|---------------------|
| fr-fr | NOT STARTED | Q3 2026+ |
| ja-jp | NOT STARTED | Q4 2026+ |
| pt-pt | NOT STARTED | After pt-br |
| es-ar | NOT STARTED | After es-mx |

---

## Activation Prerequisites Checklist

### REQUIRED (Must have ALL)

- [ ] URL routing implemented and tested
- [ ] Hreflang tags validated (GSC)
- [ ] Currency conversion verified
- [ ] UI strings translated (100%)
- [ ] Legal pages translated
- [ ] Payment method available
- [ ] Support coverage defined
- [ ] Analytics tracking configured
- [ ] Schema validates per locale
- [ ] No 4xx errors in locale URLs

### RECOMMENDED (Should have)

- [ ] FAQ content translated
- [ ] Answer blocks localized
- [ ] Route descriptions translated
- [ ] Local payment preferences
- [ ] Locale-specific deals

### NICE TO HAVE

- [ ] Localized blog content
- [ ] Local partnerships
- [ ] Market-specific promotions

---

## Risk Assessment by Locale

| Locale | SEO Risk | AI Risk | Revenue Risk | Complexity |
|--------|----------|---------|--------------|------------|
| pt-br | LOW | LOW | MEDIUM | MEDIUM |
| es-mx | LOW | LOW | LOW | MEDIUM |
| en-ca | HIGH | MEDIUM | LOW | LOW |
| en-gb | HIGH | HIGH | LOW | LOW |
| de-de | LOW | LOW | MEDIUM | HIGH |

---

## Decision Matrix

| Locale | Activate? | Condition |
|--------|-----------|-----------|
| pt-br | WAIT | Payment + Support |
| es-mx | WAIT | Payment |
| en-ca | NO URL | Currency-only |
| en-gb | NO URL | Currency-only |
| Others | NOT YET | Full prerequisites |

---

## Version
- Created: 2025-12-23
- Status: ASSESSMENT ONLY
- Owner: SEO Platform Engineering
- Review: Before any activation
