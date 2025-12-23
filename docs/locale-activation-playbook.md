# Fly2Any Locale Activation Playbook

## Purpose
Step-by-step guide for safely activating a new locale.
This is DOCUMENTATION ONLY. Do NOT execute without approval.

---

## PHASE 0: PRE-ACTIVATION CHECKLIST

### Technical Prerequisites
- [ ] URL routing implemented for locale
- [ ] Hreflang generation tested
- [ ] Canonical system verified
- [ ] Currency conversion working
- [ ] Exchange rates updating
- [ ] Schema generation localized
- [ ] Analytics tracking configured
- [ ] Error monitoring active

### Content Prerequisites
- [ ] UI strings translated (100%)
- [ ] Route page templates ready
- [ ] FAQ content translated
- [ ] Legal pages translated
- [ ] Answer blocks localized
- [ ] Native speaker review complete

### Operational Prerequisites
- [ ] Payment methods available
- [ ] Support coverage defined
- [ ] Escalation path documented
- [ ] Rollback plan approved

### Approval
- [ ] Engineering lead sign-off
- [ ] SEO lead sign-off
- [ ] Product owner sign-off

---

## PHASE 1: SOFT LAUNCH (Week 1)

### Day 1: Deploy with Noindex

```typescript
// All locale pages start noindexed
export const metadata = {
  robots: { index: false, follow: true }
};
```

### Day 1-3: Internal Testing

1. **Functional Testing**
   - [ ] All routes render correctly
   - [ ] Currency displays correctly
   - [ ] Language switches work
   - [ ] Search functionality works
   - [ ] Booking flow completes

2. **SEO Testing**
   - [ ] Canonical tags correct
   - [ ] Hreflang tags complete
   - [ ] Schema validates
   - [ ] No 4xx errors
   - [ ] No redirect loops

3. **Content Testing**
   - [ ] Translations accurate
   - [ ] Numbers preserved
   - [ ] Airport codes intact
   - [ ] No placeholder text

### Day 4-7: Limited User Testing

- Share with 10-20 native speakers
- Collect feedback on:
  - Translation quality
  - Currency clarity
  - UX issues
  - Missing content

---

## PHASE 2: LIMITED INDEXING (Week 2)

### Day 8: Enable Indexing for Top Pages

```typescript
// Enable for top 50 routes only
const TOP_ROUTES = ['gru-to-mia', 'gru-to-jfk', ...];

export async function generateMetadata({ params }) {
  const isTopRoute = TOP_ROUTES.includes(params.route);
  return {
    robots: { index: isTopRoute, follow: true }
  };
}
```

### Day 8: Submit to Search Console

1. Add locale sitemap to GSC
2. Request indexing for homepage
3. Request indexing for top 10 routes

### Day 9-14: Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Index coverage | Growing | Decline |
| Crawl errors | 0 | Any |
| Hreflang errors | 0 | Any |
| US traffic | Stable | -5% |

---

## PHASE 3: FULL ACTIVATION (Week 3-4)

### Day 15: Enable All Route Pages

```typescript
// Remove noindex from all valid routes
export async function generateMetadata({ params }) {
  const hasInventory = await checkInventory(params.route);
  return {
    robots: { index: hasInventory, follow: true }
  };
}
```

### Day 15: Full Sitemap Submission

1. Submit complete locale sitemap
2. Verify hreflang in sitemap
3. Monitor crawl rate

### Day 16-28: Stabilization

- Daily monitoring of:
  - Index coverage
  - Ranking changes
  - Traffic by locale
  - Conversion rate
  - Error rate

---

## PHASE 4: POST-ACTIVATION (Week 5+)

### Weekly Reviews

| Check | Tool | Action |
|-------|------|--------|
| Index coverage | GSC | Monitor growth |
| Hreflang errors | GSC | Fix immediately |
| Traffic | Analytics | Compare to baseline |
| Conversions | Analytics | Track by locale |
| US impact | GSC | Alert if decline |

### Monthly Reviews

- Content freshness audit
- Translation quality spot-check
- Currency accuracy verification
- Competitive analysis

---

## ROLLBACK PROCEDURES

### Trigger Conditions

| Condition | Severity | Response |
|-----------|----------|----------|
| US traffic -10% | CRITICAL | Immediate rollback |
| Locale 5xx >1% | HIGH | Investigate + possible rollback |
| Manual action | CRITICAL | Immediate rollback |
| Hreflang spam warning | HIGH | Fix or rollback |
| Translation complaints | MEDIUM | Fix content |

### Rollback Steps

#### Level 1: Soft Rollback (Noindex)
```typescript
// Add noindex to all locale pages
export const metadata = {
  robots: { index: false, follow: true }
};
```

#### Level 2: Hard Rollback (Remove)
```typescript
// Return 404 for locale
if (locale !== 'en-us') {
  return notFound();
}
```

#### Level 3: Emergency (Redirect)
```typescript
// Redirect all locale to en-us
if (locale !== 'en-us') {
  redirect(`/flights/${params.route}`);
}
```

### Recovery After Rollback

1. Identify root cause
2. Fix underlying issue
3. Test thoroughly
4. Re-activate gradually
5. Monitor closely for 30 days

---

## MEASUREMENT FRAMEWORK

### Success Metrics (30 days post-activation)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Pages indexed | 80% of submitted | GSC |
| Organic traffic | > baseline | Analytics |
| Conversion rate | ≥ US rate | Analytics |
| Bounce rate | ≤ US +10% | Analytics |
| US traffic impact | No decline | GSC |

### Leading Indicators

- Crawl rate (should increase)
- Index coverage (should grow)
- Impressions (should appear)
- CTR (should stabilize)

### Lagging Indicators

- Revenue by locale
- Customer satisfaction
- Support ticket volume
- Return visitor rate

---

## COMMUNICATION PLAN

### Internal

| Milestone | Notify | Channel |
|-----------|--------|---------|
| Pre-activation | All teams | Email |
| Soft launch | Engineering | Slack |
| Full activation | All teams | Email |
| Issues | On-call | PagerDuty |
| Rollback | All teams | Email + Slack |

### External

- No announcement until 30 days stable
- Marketing coordinates launch comms
- Support trained before announcement

---

## APPENDIX: LOCALE-SPECIFIC NOTES

### pt-br Activation Notes
- PIX payment required before full launch
- Brazilian Portuguese (not European)
- BRL currency default
- Key routes: GRU-MIA, GIG-JFK, GRU-MCO

### es-mx Activation Notes
- OXXO payment recommended
- Mexican Spanish (not Castilian)
- MXN currency default
- Key routes: MEX-LAX, CUN-MIA, GDL-DFW

---

## VERSION

```
Status: DOCUMENTATION ONLY - DO NOT EXECUTE
Created: 2025-12-23
Owner: SEO Platform Engineering
Approval Required: Yes, before any activation
```
