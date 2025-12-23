# Fly2Any SEO & AI Monitoring Checklist

## Purpose
Lightweight monitoring framework to detect and respond to:
- Crawl anomalies
- Index coverage drops
- Schema breakage
- AI citation loss
- Search-driven conversion drops

---

## 1. DAILY MONITORING (Automated)

### Crawl Health
| Check | Tool | Threshold | Action |
|-------|------|-----------|--------|
| Googlebot crawl rate | Server logs | < 100/day | Investigate |
| 5xx errors | Vercel Analytics | > 0.1% | Fix immediately |
| Avg response time | Vercel | > 2s | Optimize |
| Sitemap accessibility | Uptime monitor | Any downtime | Alert |
| robots.txt accessibility | Uptime monitor | Any downtime | Alert |

### Schema Validation
```bash
# Automated daily check
curl -s "https://www.fly2any.com/flights/jfk-to-lax" | \
  grep -o '<script type="application/ld+json">.*</script>'
# Validate JSON structure
```

### Core Vitals Snapshot
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| LCP | < 2.5s | > 4s |
| FID | < 100ms | > 300ms |
| CLS | < 0.1 | > 0.25 |
| INP | < 200ms | > 500ms |

---

## 2. WEEKLY MONITORING (Manual + GSC)

### Google Search Console Review
| Report | Check For | Action |
|--------|-----------|--------|
| Coverage | New "Excluded" pages | Investigate |
| Soft 404s | Any new entries | Fix content |
| Crawl stats | Anomaly spikes/drops | Review logs |
| Enhancement | Schema errors | Fix immediately |
| Manual actions | Any flags | Priority fix |

### Index Coverage Tracking
```
Week of: ________
Total indexed pages: ________
Change from last week: ________ (+/-)
Pages discovered - not indexed: ________
Soft 404s: ________
Redirect errors: ________
```

### AI Citation Check
| Platform | Search Query | Citation Found? |
|----------|--------------|-----------------|
| ChatGPT | "cheap flights JFK to LAX" | Yes/No |
| Perplexity | "best time to fly to Los Angeles" | Yes/No |
| Google SGE | "JFK to LAX flight prices" | Yes/No |
| Bing Copilot | "flights from New York to LA" | Yes/No |

---

## 3. MONTHLY MONITORING (Deep Audit)

### Full Site Audit
| Area | Tool | Check |
|------|------|-------|
| Technical SEO | Screaming Frog | Crawl all pages |
| Schema | Schema Validator | All page types |
| Redirects | Screaming Frog | Chain detection |
| Internal links | Screaming Frog | Orphan pages |
| Canonicals | GSC + Crawl | Mismatches |

### Index Bloat Check
```typescript
// Expected vs Actual
const expected = {
  routes: 8500,
  destinations: 150,
  airlines: 50,
  blog: 50,
  static: 20
};
const total = Object.values(expected).reduce((a,b) => a+b, 0);
// Compare with GSC indexed count
```

### Content Freshness Audit
| Content Type | Last Updated | Max Age | Status |
|--------------|--------------|---------|--------|
| Route prices | __________ | 24h | OK/Stale |
| Destination info | __________ | 30d | OK/Stale |
| FAQ answers | __________ | 60d | OK/Stale |
| Blog posts | __________ | 90d | OK/Stale |
| World Cup 2026 | __________ | Event | OK/Stale |

### Conversion Tracking
| Metric | This Month | Last Month | Change |
|--------|------------|------------|--------|
| Organic sessions | | | |
| Search → Booking starts | | | |
| Search → Bookings | | | |
| Avg booking value (organic) | | | |
| Top converting routes | | | |

---

## 4. QUARTERLY MONITORING (Strategic)

### Competitive Analysis
| Competitor | Indexed Pages | Top Rankings | Schema Types |
|------------|---------------|--------------|--------------|
| Kayak | | | |
| Skyscanner | | | |
| Google Flights | | | |
| Expedia | | | |

### Governance Review
- [ ] search-governance.md current
- [ ] llm-governance.md current
- [ ] prompt-memory.md current
- [ ] defensive-indexing.md current
- [ ] All rules enforced

### Kill Switch Test
- [ ] Test page-level noindex
- [ ] Test section-level noindex
- [ ] Verify rollback works
- [ ] Document test results

---

## 5. ALERT THRESHOLDS

### Critical Alerts (Immediate Action)
| Trigger | Threshold | Response Time |
|---------|-----------|---------------|
| Site-wide 5xx | > 1% | Immediate |
| Index drop | > 20% in 24h | < 1 hour |
| Manual action | Any | Immediate |
| Schema spam warning | Any | < 4 hours |
| Traffic drop | > 50% week/week | < 4 hours |

### Warning Alerts (Same Day)
| Trigger | Threshold | Response Time |
|---------|-----------|---------------|
| Soft 404 spike | > 50 new | < 8 hours |
| Crawl errors | > 5% of crawls | < 8 hours |
| Schema errors | > 10 pages | < 8 hours |
| Core Vitals fail | Any metric | < 24 hours |

### Monitor Alerts (Weekly Review)
| Trigger | Threshold | Review |
|---------|-----------|--------|
| New excluded pages | > 100/week | Weekly |
| Redirect chain growth | Any | Weekly |
| Orphan page growth | > 20 | Weekly |

---

## 6. MONITORING TOOLS

### Required Tools
| Tool | Purpose | Access |
|------|---------|--------|
| Google Search Console | Index, crawl, coverage | Required |
| Vercel Analytics | Performance, errors | Required |
| Schema.org Validator | Schema testing | Free |
| PageSpeed Insights | Core Vitals | Free |

### Recommended Tools
| Tool | Purpose | Priority |
|------|---------|----------|
| Screaming Frog | Deep crawl audit | High |
| Ahrefs/Semrush | Ranking tracking | Medium |
| Uptime Robot | Availability | High |
| Sentry | Error tracking | High |

### AI Monitoring
| Method | Frequency |
|--------|-----------|
| Manual ChatGPT queries | Weekly |
| Perplexity brand search | Weekly |
| "site:fly2any.com" + AI | Monthly |

---

## 7. ESCALATION MATRIX

### Level 1: Auto-Response
- Cache clear
- CDN purge
- Sitemap regeneration

### Level 2: Developer Response
- Schema fixes
- Redirect fixes
- Content updates
- Soft 404 resolution

### Level 3: Team Escalation
- Index coverage crisis (> 20% drop)
- Manual action received
- Security incident
- Legal/compliance flag

### Level 4: Executive Alert
- Site-wide de-indexing
- Algorithmic penalty confirmed
- Revenue impact > $X

---

## 8. INCIDENT RESPONSE TEMPLATE

```markdown
## Incident Report: [DATE]

**Detected:** [Timestamp]
**Severity:** Critical / High / Medium / Low
**Category:** Crawl / Index / Schema / Traffic / Conversion

### Description
[What happened]

### Impact
- Pages affected:
- Traffic impact:
- Revenue impact:

### Root Cause
[Why it happened]

### Resolution
[What was done]

### Prevention
[How to prevent recurrence]

### Timeline
- Detected:
- Diagnosed:
- Fixed:
- Verified:
```

---

## 9. WEEKLY REPORT TEMPLATE

```markdown
## SEO Weekly Report: Week of [DATE]

### Index Health
- Total indexed: X (±Y from last week)
- New exclusions: X
- Soft 404s: X

### Crawl Health
- Crawl requests: X
- Errors: X (Y%)
- Avg response: Xs

### Performance
- Organic sessions: X (±Y%)
- Conversions: X (±Y%)
- Top routes: [list]

### Issues & Actions
1. [Issue] → [Action taken]
2. [Issue] → [Action taken]

### Next Week Focus
1. [Priority 1]
2. [Priority 2]
```

---

## VERSION
- Created: 2025-12-23
- Owner: SEO Platform Engineering
- Review: Monthly
