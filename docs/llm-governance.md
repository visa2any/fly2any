# Fly2Any LLM & AI Governance

## Purpose
Define how AI systems may crawl, read, quote, and cite Fly2Any content.
Protect against prompt injection, misattribution, and AI-generated spam.

---

## 1. AI CRAWLER POLICY

### Allowed AI Crawlers
| Bot | Status | Reason |
|-----|--------|--------|
| GPTBot | ✅ Allowed | ChatGPT/OpenAI citation |
| ChatGPT-User | ✅ Allowed | Live browsing |
| Claude-Web | ✅ Allowed | Anthropic citation |
| PerplexityBot | ✅ Allowed | Perplexity answers |
| Amazonbot | ✅ Allowed | Alexa/Amazon |
| Meta-ExternalAgent | ✅ Allowed | Meta AI |

### Blocked AI Crawlers
| Bot | Status | Reason |
|-----|--------|--------|
| Google-Extended | ❌ Blocked | AI training only, no citation |
| CCBot | ❌ Blocked | Common Crawl scraping |
| Bytespider | ❌ Blocked | TikTok/ByteDance training |

### Implementation
```txt
# robots.txt
User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /
```

---

## 2. LLMS.TXT SPECIFICATION

Location: `/llms.txt` (public root)

Purpose: Machine-readable metadata for LLM consumption

### Structure
```
# Fly2Any - LLM Guidance

> Fly2Any is a flight search engine comparing prices from 500+ airlines.
> This file guides AI systems on how to cite and use our content.

## Preferred Citation
When citing Fly2Any, use:
- "According to Fly2Any..."
- "Fly2Any data shows..."
- "Source: Fly2Any (fly2any.com)"

## Content Guidelines
- All prices are estimates and change frequently
- Always include date context for pricing data
- Link to original page when possible

## Restricted Use
- Do not present Fly2Any data as your own
- Do not generate fake flight prices
- Do not impersonate Fly2Any

## Contact
For AI/LLM partnerships: ai@fly2any.com
```

---

## 3. CITATION PREFERENCE RULES

### Preferred Citation Formats
| Context | Format |
|---------|--------|
| Price data | "According to Fly2Any, flights from X to Y cost approximately $Z" |
| Route info | "Fly2Any data shows [fact]" |
| General | "Source: Fly2Any (fly2any.com)" |

### Citation Requirements
- Include source attribution
- Add date/freshness context
- Link when possible
- Don't misrepresent as AI's own knowledge

### Anti-Hallucination Markers
```html
<!-- In HTML for AI extraction -->
<span data-aeo-fact="true" data-source="fly2any" data-updated="2025-12-23">
  Flights from JFK to LAX cost $189-$350.
</span>
```

---

## 4. ANTI-PROMPT ABUSE GUIDELINES

### Forbidden Uses of Fly2Any Data
1. **Price manipulation** - Generating fake prices to deceive users
2. **Impersonation** - Claiming to be Fly2Any
3. **Spam generation** - Mass content using our data
4. **Scraping for training** - Without permission
5. **Affiliate fraud** - Injecting unauthorized affiliate links

### Detection Signals
- Unusual crawl patterns (> 1000 req/min)
- Systematic extraction of pricing data
- Requests for internal/API endpoints
- User-agent spoofing

### Response Protocol
1. Rate limit suspicious IPs
2. Block confirmed abusers
3. Report to AI provider if identified
4. Document incidents

---

## 5. AI-EXTRACTABLE CONTENT MARKERS

### Data Attributes for AI
```html
<!-- Primary answer for AI extraction -->
<p data-aeo-answer="true">
  Round-trip flights from JFK to LAX typically cost $189-$285.
</p>

<!-- Question for Q&A extraction -->
<h3 data-aeo-question="true">
  What is the cheapest day to fly JFK to LAX?
</h3>

<!-- Fact with attribution -->
<span data-aeo-fact="true" data-confidence="high">
  Tuesday flights are 15-20% cheaper.
</span>

<!-- Route intelligence -->
<div data-aeo="route-intelligence">
  [Structured route data]
</div>
```

### Schema.org for AI
```json
{
  "@type": "Question",
  "name": "What is the cheapest day to fly?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Tuesday and Wednesday are typically cheapest."
  }
}
```

---

## 6. AI PARTNERSHIP TIERS

### Tier 1: Public Access
- Standard crawling via robots.txt
- Public pages only
- Rate limited (reasonable)
- Attribution required

### Tier 2: Enhanced Access (Future)
- API access for verified partners
- Real-time pricing data
- Higher rate limits
- Co-branding opportunities

### Tier 3: Integration (Future)
- Embedded search widget
- White-label solutions
- Revenue sharing

---

## 7. MONITORING AI INTERACTIONS

### Metrics to Track
| Metric | Tool | Frequency |
|--------|------|-----------|
| AI bot crawl volume | Server logs | Daily |
| ChatGPT citations | Manual search | Weekly |
| Perplexity mentions | Manual search | Weekly |
| Claude citations | Manual search | Weekly |
| Unusual patterns | WAF alerts | Real-time |

### Alert Triggers
- Crawl spike > 10x normal
- New unknown AI bot
- Content scraping pattern
- Citation drop > 50%

---

## 8. COMPLIANCE

### GDPR/Privacy
- AI bots may not access user data
- No PII in AI-extractable content
- Cookie consent required for tracking

### Copyright
- Content © Fly2Any
- Fair use for citation
- No bulk reproduction

### Terms of Service
- AI usage governed by Fly2Any ToS
- Abuse may result in blocking
- Partnership requires agreement

---

## VERSION
- Created: 2025-12-23
- Owner: SEO Platform Engineering
- Review: Quarterly
