# Fly2Any International SEO & AI Governance Charter

## Purpose
IMMUTABLE rules for international expansion.
These rules MUST be followed by all developers, AI agents, and stakeholders.
Violations require explicit executive approval.

---

## SECTION 1: CANONICAL RULES (LOCKED)

### Rule 1.1: Canonical URL Structure
```
Canonical URL = https://www.fly2any.com/[locale-prefix]/[path]
Default (en-us) = https://www.fly2any.com/[path] (no prefix)
```

### Rule 1.2: Self-Referencing Canonical
Every page MUST have a canonical pointing to itself.
```html
<!-- On /pt-br/flights/gru-to-mia -->
<link rel="canonical" href="https://www.fly2any.com/pt-br/flights/gru-to-mia" />
```

### Rule 1.3: Canonical Independence
Localized pages do NOT point canonical to English version.
Each locale has its own canonical authority.

### Rule 1.4: Query Parameter Handling
Canonicals NEVER include query parameters.
```
✅ /flights/jfk-to-lax
❌ /flights/jfk-to-lax?sort=price
```

---

## SECTION 2: HREFLANG RULES (LOCKED)

### Rule 2.1: Complete Clusters
Every localized page MUST link to ALL available versions.
```html
<link rel="alternate" hreflang="x-default" href="https://www.fly2any.com/flights/jfk-to-lax" />
<link rel="alternate" hreflang="en-us" href="https://www.fly2any.com/flights/jfk-to-lax" />
<link rel="alternate" hreflang="pt-br" href="https://www.fly2any.com/pt-br/flights/jfk-to-lax" />
<link rel="alternate" hreflang="es-mx" href="https://www.fly2any.com/es-mx/flights/jfk-to-lax" />
```

### Rule 2.2: x-default
x-default ALWAYS points to en-us version (no locale prefix).

### Rule 2.3: Bidirectional Links
If page A links to page B via hreflang, page B MUST link back to page A.

### Rule 2.4: No Hreflang to Noindex
NEVER create hreflang pointing to noindexed pages.

---

## SECTION 3: ENTITY @ID RULES (LOCKED)

### Rule 3.1: Locale-Agnostic @id
Entity @id NEVER includes locale prefix.
```json
// CORRECT (all locales use same @id)
"@id": "https://www.fly2any.com/flights/jfk-to-lax#flight"

// INCORRECT
"@id": "https://www.fly2any.com/pt-br/flights/jfk-to-lax#flight"
```

### Rule 3.2: @id Patterns
```
Route:    https://www.fly2any.com/flights/{origin}-to-{dest}#flight
Airport:  https://www.fly2any.com/airports/{code}#airport
Airline:  https://www.fly2any.com/airlines/{code}#airline
City:     https://www.fly2any.com/destinations/{slug}#place
Org:      https://www.fly2any.com/#organization
```

### Rule 3.3: @id Immutability
Once published, @id NEVER changes.
Redirects do NOT change @id.

---

## SECTION 4: CURRENCY RULES (LOCKED)

### Rule 4.1: Schema-UI Alignment
Schema `priceCurrency` MUST match displayed currency.
```json
// If UI shows "R$ 950"
{ "priceCurrency": "BRL", "lowPrice": 950 }
```

### Rule 4.2: Source Transparency
Always track original currency from API.
```typescript
{
  displayAmount: 950,
  displayCurrency: 'BRL',
  sourceAmount: 189,
  sourceCurrency: 'USD'
}
```

### Rule 4.3: No Hidden Conversions
User MUST be able to see prices in source currency if desired.

### Rule 4.4: Rate Freshness
Exchange rates older than 24h require disclaimer.

---

## SECTION 5: TRANSLATION RULES (LOCKED)

### Rule 5.1: DO NOT TRANSLATE
- Airport codes (JFK, GRU, LAX)
- Airline codes (AA, LA, G3)
- Flight numbers
- Entity @id URIs
- Price numbers
- Dates in ISO format
- Technical slugs

### Rule 5.2: LOCALIZE (Adapt)
- Date formats (MM/DD → DD/MM)
- Number formats (1,000.00 → 1.000,00)
- Currency symbols
- Phone formats
- Common city names (New York → Nova York)

### Rule 5.3: TRANSLATE (Human Quality)
- UI strings
- Legal text
- Error messages
- FAQ content
- Page descriptions

### Rule 5.4: Translation Quality Gate
No content publishes without native speaker review.

---

## SECTION 6: AI QUOTABILITY RULES (LOCKED)

### Rule 6.1: Preserve Factual Structure
Translations MUST preserve:
- Numerical values
- Price ranges
- Time durations
- Statistical claims

### Rule 6.2: data-aeo Attributes
All localized answer blocks MUST include:
```html
<p data-aeo-answer="true" data-confidence="high" data-locale="pt-br">
  Voos de JFK para LAX custam aproximadamente $189-$350 USD.
</p>
```

### Rule 6.3: Citation Consistency
Same facts, different language:
```
EN: "According to Fly2Any, flights cost $189-$350."
PT: "Segundo a Fly2Any, voos custam $189-$350."
ES: "Según Fly2Any, vuelos cuestan $189-$350."
```

### Rule 6.4: No Marketing in Translations
Forbidden in ANY language:
- "Best prices guaranteed"
- "Exclusive deals"
- "Limited time"
- "Book now"

---

## SECTION 7: INDEXING RULES (LOCKED)

### Rule 7.1: Default State
New locales launch as NOINDEX until approved.

### Rule 7.2: Activation Gate
Index only after:
- [ ] Content quality verified
- [ ] Hreflang validated
- [ ] Schema validated
- [ ] Currency correct
- [ ] Legal review complete

### Rule 7.3: Protected Pages
These pages ALWAYS remain indexable (once activated):
- Route pages with inventory
- Destination pages
- Airline pages
- Core landing pages

### Rule 7.4: Never Index
- Search results pages
- Booking flow pages
- Account pages
- Admin pages
- Preview pages

---

## SECTION 8: AUTHORITY PROTECTION (LOCKED)

### Rule 8.1: US Authority First
No international expansion may negatively impact US rankings.

### Rule 8.2: Cannibalization Prevention
For same-language locales (en-ca, en-gb):
- Evaluate currency-only approach first
- Require explicit approval for separate URLs
- Monitor for cannibalization weekly

### Rule 8.3: Rollback Trigger
If US organic traffic drops >10% after locale launch:
- Immediate noindex of new locale
- Investigation required
- Re-launch only after root cause fixed

---

## SECTION 9: ENFORCEMENT

### Violations
| Severity | Example | Response |
|----------|---------|----------|
| CRITICAL | @id with locale prefix | Immediate fix required |
| HIGH | Hreflang missing self-reference | Fix within 24h |
| MEDIUM | Translation without review | Block publish |
| LOW | Missing currency disclaimer | Log and fix |

### Approval Required
Changes to this charter require:
- Engineering lead approval
- SEO lead approval
- Product owner awareness

---

## VERSION CONTROL

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2025-12-23 | Initial charter |

---

## SIGNATURES

This charter is effective immediately.
All future development MUST comply.

```
Status: LOCKED
Effective: 2025-12-23
Owner: SEO Platform Engineering
Review: Quarterly
```
