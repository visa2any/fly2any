# Fly2Any Organic Performance Monitoring System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING DASHBOARD                          │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│     SEO     │     AEO     │     GEO     │     LLM     │ ALERTS  │
│  Rankings   │  Snippets   │  AI Search  │  Citations  │         │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
```

---

## 1. SEO METRICS

### Core Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Organic Traffic | +10% MoM | -15% WoW |
| Avg Position | <10 | >20 drop |
| CTR | >3% | <1.5% |
| Indexed Pages | 189 | -10% |
| Core Web Vitals | All Green | Any Red |

### Tracking Points

```typescript
// lib/monitoring/seo-metrics.ts
export const SEO_METRICS = {
  // Google Search Console
  impressions: 'gsc:impressions',
  clicks: 'gsc:clicks',
  avgPosition: 'gsc:position',
  ctr: 'gsc:ctr',

  // Technical
  indexedPages: 'sitemap:count',
  crawlErrors: 'gsc:errors',
  mobileUsability: 'gsc:mobile',

  // Core Web Vitals
  lcp: 'cwv:lcp',  // <2.5s
  fid: 'cwv:fid',  // <100ms
  cls: 'cwv:cls',  // <0.1
  inp: 'cwv:inp',  // <200ms
};
```

### Alert Triggers

```yaml
seo_alerts:
  - name: "Traffic Drop"
    condition: organic_traffic < 7d_avg * 0.85
    severity: HIGH
    action: "Review GSC, check algorithm updates"

  - name: "Position Loss"
    condition: avg_position > prev_week + 5
    severity: MEDIUM
    action: "Audit affected pages, check competitors"

  - name: "Index Drop"
    condition: indexed_pages < prev_month * 0.9
    severity: CRITICAL
    action: "Check robots.txt, sitemap, manual actions"

  - name: "CWV Degradation"
    condition: lcp > 4s OR cls > 0.25
    severity: HIGH
    action: "Performance audit, check deployments"
```

---

## 2. AEO METRICS (Answer Engine Optimization)

### Core Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Featured Snippets | 20+ | -5 in week |
| PAA Presence | 50+ queries | -20% |
| Rich Results | 100+ | -15% |
| Voice Search Rank | Top 3 | Out of top 5 |

### Tracking Points

```typescript
// lib/monitoring/aeo-metrics.ts
export const AEO_METRICS = {
  // Featured Snippets
  snippetCount: 'serp:featured_count',
  snippetQueries: 'serp:featured_queries',

  // People Also Ask
  paaPresence: 'serp:paa_count',
  paaPosition: 'serp:paa_position',

  // Rich Results
  faqRichResults: 'gsc:faq_impressions',
  howToResults: 'gsc:howto_impressions',
  breadcrumbResults: 'gsc:breadcrumb_impressions',

  // Voice Search
  voiceQueries: 'voice:query_matches',
  directAnswers: 'serp:direct_answer',
};
```

### Key Queries to Monitor

```typescript
export const AEO_TARGET_QUERIES = [
  // Informational (Featured Snippet targets)
  "what is fly2any",
  "how to find cheap flights",
  "best time to book flights",
  "cheapest day to fly",

  // PAA targets
  "is fly2any legit",
  "how does fly2any work",
  "fly2any vs kayak",
  "fly2any vs google flights",

  // Voice Search
  "find cheap flights to miami",
  "book flight to new york",
  "flight prices to london",
];
```

### Alert Triggers

```yaml
aeo_alerts:
  - name: "Snippet Lost"
    condition: featured_snippet_lost = true
    severity: HIGH
    action: "Re-optimize content, check competitor snippet"

  - name: "PAA Drop"
    condition: paa_presence < prev_week * 0.8
    severity: MEDIUM
    action: "Update FAQ schema, add question variations"

  - name: "Rich Result Error"
    condition: gsc_rich_result_errors > 0
    severity: HIGH
    action: "Fix structured data validation errors"
```

---

## 3. GEO METRICS (Generative Engine Optimization)

### Core Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| AI Overview Mentions | 10+ | -50% |
| SGE Citations | 5+ weekly | 0 for 2 weeks |
| Perplexity Refs | Present | Absent 1 week |
| Bing Chat Citations | Present | Absent 1 week |

### Tracking Points

```typescript
// lib/monitoring/geo-metrics.ts
export const GEO_METRICS = {
  // Google AI Overview (SGE)
  sgeAppearances: 'sge:appearances',
  sgeCitations: 'sge:citations',
  sgePosition: 'sge:position',

  // Perplexity
  perplexityMentions: 'perplexity:mentions',
  perplexitySources: 'perplexity:source_links',

  // Bing Copilot
  bingCopilotCitations: 'bing:copilot_citations',

  // You.com
  youComPresence: 'you:presence',
};
```

### Test Queries (Weekly Check)

```typescript
export const GEO_TEST_QUERIES = [
  // Brand queries
  "fly2any reviews",
  "is fly2any safe",
  "fly2any customer service",

  // Category queries
  "best flight search engines 2025",
  "cheap flight booking sites",
  "compare flight prices online",

  // Intent queries
  "how to find cheapest flights",
  "when to book flights for best price",
];
```

### Alert Triggers

```yaml
geo_alerts:
  - name: "SGE Visibility Lost"
    condition: sge_citations = 0 for 7 days
    severity: CRITICAL
    action: "Review content E-E-A-T signals, add citations"

  - name: "AI Overview Competitor Gain"
    condition: competitor_in_sge AND fly2any_absent
    severity: HIGH
    action: "Analyze competitor content, update our pages"

  - name: "Perplexity Deindexed"
    condition: perplexity_mentions = 0 for 14 days
    severity: MEDIUM
    action: "Submit to Perplexity, check robots.txt"
```

---

## 4. LLM VISIBILITY METRICS

### Core Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| ChatGPT Mentions | Accurate | Wrong info |
| Claude Mentions | Accurate | Wrong info |
| Brand Sentiment | Positive | Negative |
| Factual Accuracy | 100% | <90% |

### Tracking Points

```typescript
// lib/monitoring/llm-metrics.ts
export const LLM_METRICS = {
  // Citation tracking
  chatgptMentions: 'llm:chatgpt_mentions',
  claudeMentions: 'llm:claude_mentions',
  geminiMentions: 'llm:gemini_mentions',

  // Accuracy
  factualAccuracy: 'llm:accuracy_score',
  brandSentiment: 'llm:sentiment',

  // Hallucination detection
  incorrectFacts: 'llm:hallucinations',
  outdatedInfo: 'llm:outdated_refs',
};
```

### Weekly LLM Audit Prompts

```typescript
export const LLM_AUDIT_PROMPTS = [
  // Identity queries
  "What is Fly2Any?",
  "Who owns Fly2Any?",
  "Where is Fly2Any based?",

  // Trust queries
  "Is Fly2Any a legitimate travel site?",
  "Is Fly2Any safe to book flights?",
  "Fly2Any reviews and reputation",

  // Comparison queries
  "Fly2Any vs Kayak which is better",
  "Fly2Any vs Google Flights comparison",
  "Best flight search engines",

  // Feature queries
  "Does Fly2Any have price alerts?",
  "Can I book hotels on Fly2Any?",
  "Fly2Any multi-city search",
];
```

### Alert Triggers

```yaml
llm_alerts:
  - name: "Incorrect Brand Info"
    condition: llm_response != brand_facts
    severity: CRITICAL
    action: "Update brand-definitions.ts, resubmit to AI crawlers"

  - name: "Negative Sentiment"
    condition: llm_sentiment = negative
    severity: HIGH
    action: "Address concerns, update trust signals"

  - name: "Missing from LLM Response"
    condition: fly2any_absent in category_query
    severity: MEDIUM
    action: "Improve LLMO content, add entity markup"

  - name: "Competitor Recommended Over Us"
    condition: competitor_rank > fly2any_rank
    severity: MEDIUM
    action: "Analyze competitor positioning, update differentiators"
```

---

## 5. UNIFIED DASHBOARD

### KPI Summary View

```
┌────────────────────────────────────────────────────────────┐
│  FLY2ANY ORGANIC PERFORMANCE - December 2025               │
├──────────────┬──────────────┬──────────────┬──────────────┤
│  SEO SCORE   │  AEO SCORE   │  GEO SCORE   │  LLM SCORE   │
│     85/100   │     72/100   │     68/100   │     90/100   │
│   ▲ +5 pts   │   ▼ -3 pts   │   ▲ +12 pts  │   ● stable   │
└──────────────┴──────────────┴──────────────┴──────────────┘

ALERTS: 2 Critical | 5 High | 12 Medium

TOP ACTIONS:
1. [CRITICAL] SGE citation lost for "best flight sites"
2. [HIGH] Featured snippet lost for "cheap flights to miami"
3. [HIGH] ChatGPT showing outdated founding year
```

### Scoring Formula

```typescript
// lib/monitoring/organic-score.ts
export function calculateOrganicScore() {
  return {
    seo: (
      positionScore * 0.3 +
      trafficScore * 0.3 +
      cwvScore * 0.2 +
      indexScore * 0.2
    ),
    aeo: (
      snippetScore * 0.4 +
      paaScore * 0.3 +
      richResultScore * 0.3
    ),
    geo: (
      sgeScore * 0.5 +
      perplexityScore * 0.25 +
      bingCopilotScore * 0.25
    ),
    llm: (
      accuracyScore * 0.4 +
      sentimentScore * 0.3 +
      presenceScore * 0.3
    ),
  };
}
```

---

## 6. OPTIMIZATION FEEDBACK LOOPS

### Automated Actions

```yaml
feedback_loops:
  # SEO Loop
  - trigger: "position_drop > 10"
    action: "queue_content_refresh"
    target: "affected_pages"

  # AEO Loop
  - trigger: "snippet_lost"
    action: "regenerate_faq_schema"
    target: "page_with_lost_snippet"

  # GEO Loop
  - trigger: "sge_absent for 7 days"
    action: "add_citation_sources"
    target: "category_pages"

  # LLM Loop
  - trigger: "incorrect_brand_fact"
    action: "update_brand_definitions"
    target: "lib/content/brand-definitions.ts"
```

### Weekly Review Checklist

```markdown
## Monday: SEO Review
- [ ] Check GSC for position changes
- [ ] Review crawl errors
- [ ] Verify CWV scores
- [ ] Check new indexed pages

## Wednesday: AEO/GEO Review
- [ ] Test featured snippet queries
- [ ] Check SGE appearances
- [ ] Run Perplexity test queries
- [ ] Verify rich results in GSC

## Friday: LLM Review
- [ ] Test ChatGPT brand queries
- [ ] Test Claude brand queries
- [ ] Document any hallucinations
- [ ] Update brand content if needed
```

---

## 7. TOOLS & INTEGRATIONS

### Required Tools

| Tool | Purpose | Cost |
|------|---------|------|
| Google Search Console | SEO metrics | Free |
| Semrush/Ahrefs | Position tracking | $120/mo |
| Schema Validator | Rich results | Free |
| Screaming Frog | Technical SEO | $259/yr |

### Optional AI Tools

| Tool | Purpose |
|------|---------|
| Originality.ai | LLM detection |
| Brand24 | Mention tracking |
| Perplexity Pro | GEO testing |

### API Integrations

```typescript
// lib/monitoring/integrations.ts
export const MONITORING_INTEGRATIONS = {
  googleSearchConsole: {
    api: 'searchconsole.googleapis.com',
    metrics: ['impressions', 'clicks', 'position', 'ctr'],
  },
  vercelAnalytics: {
    api: 'vercel.com/api/analytics',
    metrics: ['pageviews', 'visitors', 'cwv'],
  },
  telegram: {
    api: 'api.telegram.org',
    use: 'Alert notifications',
  },
};
```

---

## 8. IMPLEMENTATION PRIORITY

```
Week 1: SEO Baseline
├── Connect GSC API
├── Set up position tracking
└── Configure CWV alerts

Week 2: AEO Setup
├── Identify snippet opportunities
├── Create FAQ schema tracker
└── Set up rich result monitoring

Week 3: GEO/LLM Setup
├── Create LLM test suite
├── Document baseline responses
└── Set up weekly audit schedule

Week 4: Dashboard & Alerts
├── Build unified dashboard
├── Configure Telegram alerts
└── Test feedback loops
```
