# Fly2Any Content Activation Scope

## Purpose
Define EXACTLY which content types may be activated for international locales.
Protect US authority by limiting initial scope.

---

## ALLOWED FOR FIRST ACTIVATION

### 1. Route Pages (`/[locale]/flights/[route]`)

**Why Allowed:**
- Core business value
- Structured, templated content
- Easy to translate accurately
- Clear entity relationships
- High conversion intent
- Minimal editorial risk

**Activation Rules:**
- Only routes with US origin OR destination
- Must have inventory data
- Template-based translation only
- No editorial additions

**Example:**
```
/pt-br/flights/gru-to-mia ✅
/pt-br/flights/gru-to-lax ✅
/pt-br/flights/gru-to-lis ❌ (no US connection)
```

---

### 2. City/Destination Pages (`/[locale]/destinations/[city]`)

**Why Allowed:**
- US destination focus
- Structured data
- Supports route pages
- Entity relationship value

**Activation Rules:**
- Only US cities initially
- Template-based content
- Localized city names where appropriate
- No travel guide content

**Example:**
```
/pt-br/destinations/miami ✅
/pt-br/destinations/new-york ✅
/pt-br/destinations/paris ❌ (not US)
```

---

### 3. Airline Pages (`/[locale]/airlines/[code]`)

**Why Allowed:**
- Global entities
- Factual content
- Schema consistency
- Supports routes

**Activation Rules:**
- Only airlines serving US routes
- Factual information only
- No reviews or opinions
- Standard template

**Example:**
```
/pt-br/airlines/aa ✅ (American)
/pt-br/airlines/la ✅ (LATAM)
/pt-br/airlines/g3 ✅ (GOL)
```

---

### 4. Core Landing Pages

**Why Allowed:**
- Essential navigation
- Minimal translation
- High-intent pages

**Allowed Pages:**
```
/[locale]/flights ✅
/[locale]/hotels ✅
/[locale]/ (homepage) ✅
```

---

## NOT ALLOWED FOR FIRST ACTIVATION

### 1. Blog Posts (`/[locale]/blog/*`)

**Why NOT Allowed:**
- Editorial content requires human quality
- SEO value unclear in new markets
- High translation cost
- Opinion/voice consistency risk
- AI hallucination risk if translated poorly

**Future Condition:**
- Activate only after 6 months of route success
- Require human review for each post
- Start with evergreen content only

---

### 2. Travel Guides (`/[locale]/travel-guide/*`)

**Why NOT Allowed:**
- Long-form editorial
- Cultural nuance required
- Local expertise needed
- High maintenance burden
- Duplicate content risk

**Future Condition:**
- Require local market expertise
- Partner with local writers
- Never machine-translate

---

### 3. Deals/Promotions (`/[locale]/deals/*`)

**Why NOT Allowed:**
- Time-sensitive content
- Pricing accuracy critical
- Legal compliance varies
- Misleading conversion risk

**Future Condition:**
- Only after currency system proven
- Clear expiration handling
- Locale-specific legal review

---

### 4. World Cup 2026 Content

**Why NOT Allowed Initially:**
- Event-driven, time-limited
- High competition
- Requires local angle
- US version sufficient

**Future Condition:**
- Activate 6 months before event
- Only for pt-br, es-mx (host adjacent)

---

### 5. User-Generated Content

**Why NOT Allowed:**
- Moderation complexity
- Legal liability
- Quality control
- Not applicable yet

---

## CONTENT ACTIVATION MATRIX

| Content Type | First Wave | Second Wave | Third Wave |
|--------------|------------|-------------|------------|
| Route pages (US routes) | ✅ | - | - |
| US Destination pages | ✅ | - | - |
| Airline pages | ✅ | - | - |
| Core landing pages | ✅ | - | - |
| Non-US routes | ❌ | ✅ | - |
| Non-US destinations | ❌ | ✅ | - |
| Deals pages | ❌ | ✅ | - |
| Blog (evergreen) | ❌ | ❌ | ✅ |
| Travel guides | ❌ | ❌ | ✅ |
| Event content | ❌ | ❌ | ✅ |

---

## TRANSLATION QUALITY GATES

### Route Pages
- Machine translation: ALLOWED (with review)
- Template variables: DO NOT TRANSLATE
- Numbers: PRESERVE EXACTLY
- Airport codes: DO NOT TRANSLATE
- Airline codes: DO NOT TRANSLATE

### Destination Pages
- City names: LOCALIZE if common (New York → Nova York)
- Descriptions: Human review required
- Facts: Source verification required

### UI Strings
- Machine translation: ALLOWED
- Human review: REQUIRED before launch
- A/B testing: RECOMMENDED

---

## ACTIVATION GATE CRITERIA

Before ANY content type activates:

1. **Quality Check**
   - [ ] Translation reviewed by native speaker
   - [ ] Numbers match English version
   - [ ] Entity codes preserved
   - [ ] Schema validates

2. **SEO Check**
   - [ ] Canonical correct
   - [ ] Hreflang complete
   - [ ] No duplicate content
   - [ ] Robots directive correct

3. **Legal Check**
   - [ ] Price disclaimers present
   - [ ] Terms link correct locale
   - [ ] Privacy policy linked

4. **Technical Check**
   - [ ] Page loads < 3s
   - [ ] No console errors
   - [ ] Mobile responsive
   - [ ] Currency displays correctly

---

## Version
- Created: 2025-12-23
- Status: RULES LOCKED
- Owner: SEO Platform Engineering
- Approval: Required for any exception
